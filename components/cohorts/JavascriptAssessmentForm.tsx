"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { PublicAssessmentQuestion } from "@/lib/cohorts/javascript-assessment";
import { JAVASCRIPT_ASSESSMENT_VERSION } from "@/lib/cohorts/javascript-assessment";
import { submitJavascriptAssessmentAction, type AssessmentActionResult } from "@/lib/cohorts/assessment-actions";

type Draft = { answers: Record<string, string>; currentIndex: number; attemptKey: string };

export default function JavascriptAssessmentForm({ cohortId, studentId, questions }: { cohortId: string; studentId: string; questions: PublicAssessmentQuestion[] }) {
  const action = submitJavascriptAssessmentAction.bind(null, cohortId);
  const [state, formAction, pending] = useActionState<AssessmentActionResult | undefined, FormData>(action, undefined);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptKey, setAttemptKey] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const storageKey = `epixum:javascript-diagnostic:${studentId}:${cohortId}:${JAVASCRIPT_ASSESSMENT_VERSION}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const draft = JSON.parse(stored) as Partial<Draft>;
        const validAnswers = Object.fromEntries(Object.entries(draft.answers || {}).filter(([questionId, optionId]) => questions.some((question) => question.id === questionId && question.options.some((option) => option.id === optionId))));
        const savedIndex = Number.isInteger(draft.currentIndex) ? Math.max(0, Math.min(Number(draft.currentIndex), questions.length - 1)) : 0;
        setAnswers(validAnswers);
        setCurrentIndex(savedIndex);
        setAttemptKey(validAttemptKey(draft.attemptKey) ? draft.attemptKey! : createAttemptKey());
        setRestored(Object.keys(validAnswers).length > 0);
      } else setAttemptKey(createAttemptKey());
    } catch {
      setAttemptKey(createAttemptKey());
    } finally {
      setHydrated(true);
    }
  }, [questions, storageKey]);

  useEffect(() => {
    if (!hydrated || !attemptKey || state?.success) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify({ answers, currentIndex, attemptKey } satisfies Draft)); } catch { /* El test sigue funcionando sin almacenamiento local. */ }
  }, [answers, attemptKey, currentIndex, hydrated, state, storageKey]);

  useEffect(() => {
    if (!state?.success) return;
    try { window.localStorage.removeItem(storageKey); } catch { /* La limpieza local no debe ocultar un resultado guardado. */ }
  }, [state, storageKey]);

  const answeredCount = Object.keys(answers).length;
  const missingQuestions = useMemo(() => questions.filter((question) => !answers[question.id]), [answers, questions]);
  const current = questions[currentIndex];

  if (state?.success) {
    return <section className="space-y-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100 sm:p-8" aria-live="polite">
      <div><p className="text-sm font-semibold uppercase tracking-wide">{state.attemptKind === "initial" ? "Diagnóstico inicial completado" : "Práctica completada"}</p><h2 className="mt-2 text-3xl font-bold">{state.score} de {state.totalQuestions}</h2><p className="mt-3">{state.message}</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{state.feedback.map((item) => <article key={item.id} className="rounded-xl border border-emerald-900/15 bg-white/70 p-4 text-zinc-950 dark:bg-zinc-950/30 dark:text-zinc-50"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{item.title}</p><h3 className="mt-1 font-bold">{item.label}</h3></div><strong className="tabular-nums">{item.score}/{item.total}</strong></div><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.message}</p></article>)}</div>
      <p className="text-sm leading-6">Este resultado describe tu punto de partida. No es una calificación de la cursada y nos ayuda a orientar mejor las clases.</p>
      <a href={`/cohorts/${cohortId}/assessment`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">Realizar un intento de práctica</a>
    </section>;
  }

  if (!hydrated || !attemptKey) return <div className="rounded-2xl border bg-surface p-6 text-sm text-muted" role="status">Preparando el diagnóstico…</div>;

  const selectAnswer = (questionId: string, optionId: string) => setAnswers((currentAnswers) => ({ ...currentAnswers, [questionId]: optionId }));
  const editQuestion = (index: number) => { setCurrentIndex(index); setReviewing(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goToReview = () => {
    if (missingQuestions.length > 0) { editQuestion(questions.findIndex((question) => question.id === missingQuestions[0].id)); return; }
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const confirmSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (missingQuestions.length > 0) {
      event.preventDefault();
      editQuestion(questions.findIndex((question) => question.id === missingQuestions[0].id));
      return;
    }
    if (!window.confirm("¿Confirmás el envío? El diagnóstico inicial quedará registrado como tu punto de partida.")) event.preventDefault();
  };

  return <form action={formAction} onSubmit={confirmSubmit} className="space-y-6">
    <input type="hidden" name="attemptKey" value={attemptKey} />
    {questions.map((question) => <input key={question.id} type="hidden" name={`answer_${question.id}`} value={answers[question.id] || ""} />)}
    {restored && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">Recuperamos las respuestas guardadas en este dispositivo.</div>}
    {!reviewing ? <>
      <section className="rounded-2xl border bg-surface p-5 sm:p-6" aria-label="Progreso del diagnóstico">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><strong>Pregunta {currentIndex + 1} de {questions.length}</strong><span className="text-muted">{answeredCount} respondidas</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
        <progress className="sr-only" max={questions.length} value={answeredCount}>{answeredCount} de {questions.length}</progress>
      </section>
      <fieldset className="rounded-2xl border bg-surface p-6 sm:p-8">
        <legend className="sr-only">Pregunta {currentIndex + 1}</legend>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{categoryLabel(current.categoryId)}</p>
        <h2 className="mt-3 text-lg font-semibold leading-7 sm:text-xl sm:leading-8">{currentIndex + 1}. {current.prompt}</h2>
        {current.code && <pre aria-label={`Código de la pregunta ${currentIndex + 1}`} className="mt-5 overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-100 shadow-inner sm:px-5 sm:py-4"><code className="font-mono">{current.code}</code></pre>}
        <div className="mt-6 grid gap-3">{current.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${answers[current.id] === option.id ? "border-primary bg-blue-50 ring-2 ring-primary/20 dark:bg-blue-950/30" : "hover:border-primary/60"}`}><input type="radio" name={`visible_${current.id}`} value={option.id} checked={answers[current.id] === option.id} onChange={() => selectAnswer(current.id, option.id)} className="mt-1" />{option.code ? <code className="min-w-0 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-6 text-primary">{option.label}</code> : <span>{option.label}</span>}</label>)}</div>
      </fieldset>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} className="min-h-12 rounded-xl border px-5 py-3 font-semibold disabled:opacity-40">Anterior</button>{currentIndex < questions.length - 1 ? <button type="button" disabled={!answers[current.id]} onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))} className="min-h-12 rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-40">Siguiente</button> : <button type="button" disabled={!answers[current.id]} onClick={goToReview} className="min-h-12 rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-40">Revisar respuestas</button>}</div>
      <p className="text-center text-xs text-muted">Tus respuestas se guardan automáticamente en este dispositivo.</p>
    </> : <section className="space-y-6 rounded-2xl border bg-surface p-6 sm:p-8">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-primary">Revisión final</p><h2 className="mt-2 text-2xl font-bold">Las {questions.length} preguntas están respondidas</h2><p className="mt-2 text-muted">Podés volver a cualquier pregunta antes de confirmar. Una vez enviado, este intento quedará guardado.</p></div>
      <ol className="grid gap-2 sm:grid-cols-3">{questions.map((question, index) => <li key={question.id}><button type="button" onClick={() => editQuestion(index)} className="flex min-h-11 w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:border-primary"><span>Pregunta {index + 1}</span><span className="font-semibold text-emerald-600">Respondida</span></button></li>)}</ol>
      {state && !state.success && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950/40 dark:text-red-200">{state.error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => setReviewing(false)} className="min-h-12 rounded-xl border px-5 py-3 font-semibold">Volver a revisar</button><button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Guardando respuestas…" : "Confirmar y enviar diagnóstico"}</button></div>
    </section>}
  </form>;
}

function categoryLabel(categoryId: PublicAssessmentQuestion["categoryId"]) {
  return ({ fundamentals: "Fundamentos y control de flujo", functions: "Funciones y alcance", collections: "Colecciones y transformaciones", browser: "Navegador, DOM y eventos", async: "Asincronismo" } as const)[categoryId];
}

function validAttemptKey(value: unknown): value is string { return typeof value === "string" && /^[a-zA-Z0-9_-]{16,100}$/.test(value); }
function createAttemptKey() { return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replaceAll("-", "") : `${Date.now()}_${Math.random().toString(36).slice(2, 18)}`; }
