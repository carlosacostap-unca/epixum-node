"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitStudentSurvey } from "./actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox, RadioGroup, Textarea } from "@/components/ui/FormField";

type Branch = "completed" | "incomplete_deliveries";
type Values = Record<string, string>;
interface Question { name: string; label: string; optional?: boolean }

const completeSections: Question[][] = [[
  { name: "feelings", label: "¿Cómo te sentiste con el cursado durante este sprint?" },
  { name: "feedback", label: "¿Qué te parecieron el contenido y los trabajos prácticos?" },
], [{ name: "suggestions", label: "¿Qué podríamos mejorar en los próximos sprints?", optional: true }]];
const incompleteSections: Question[][] = [[
  { name: "delayFactors", label: "¿Qué factores influyeron en las entregas pendientes?" },
  { name: "attitudeReflection", label: "¿Cómo evaluás tu compromiso y qué podrías mejorar?" },
], [
  { name: "learningExperience", label: "¿Qué aprendiste de esta situación?" },
  { name: "futureStrategies", label: "¿Qué estrategias vas a implementar en adelante?" },
], [
  { name: "actionPlan", label: "Describí tu plan de acción con metas y plazos concretos." },
  { name: "personalCommitment", label: "¿Qué compromiso personal asumís?" },
  { name: "additionalComments", label: "¿Querés agregar información para el equipo docente?", optional: true },
]];

export default function SurveyWizard({ sprintId, branch }: { sprintId: string; branch: Branch }) {
  const router = useRouter(); const sections = branch === "completed" ? completeSections : incompleteSections;
  const [step, setStep] = useState(0); const [values, setValues] = useState<Values>({}); const [errors, setErrors] = useState<Record<string, string>>({}); const [confirmed, setConfirmed] = useState(false); const [loading, setLoading] = useState(false); const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const reviewStep = sections.length; const totalSteps = sections.length + 1; const questions = useMemo(() => sections.flat(), [sections]);
  const update = (name: string, value: string) => { setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: "" })); };
  const validate = () => { const next: Record<string, string> = {}; if (branch === "incomplete_deliveries" && step === 0 && !values.futurePlan) next.futurePlan = "Seleccioná una opción para continuar."; for (const question of sections[step] || []) if (!question.optional && !values[question.name]?.trim()) next[question.name] = "Completá esta respuesta para continuar."; setErrors(next); return !Object.keys(next).length; };
  const next = () => { if (validate()) setStep((current) => Math.min(reviewStep, current + 1)); };
  const submit = async () => { if (!confirmed) return; setLoading(true); setResult(null); const data = new FormData(); data.set("sprint", sprintId); data.set("status", branch); Object.entries(values).forEach(([key, value]) => data.set(key, value)); const response = await submitStudentSurvey(data); setLoading(false); setResult(response); };
  if (result?.success) return <Alert variant="success" title="Encuesta enviada"><p>Registramos tus respuestas correctamente. Gracias por tomarte el tiempo.</p><Button className="mt-4" variant="secondary" onClick={() => router.push("/")}>Volver al inicio</Button></Alert>;
  return <div className="space-y-5">
    <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Paso {step + 1} de {totalSteps}</span><span className="text-muted">{Math.round(((step + 1) / totalSteps) * 100)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div></div>
    <Card><CardHeader><CardTitle>{step === reviewStep ? "Revisá antes de enviar" : branch === "completed" ? ["Tu experiencia", "Ideas para mejorar"][step] : ["Situación actual", "Aprendizajes", "Próximos pasos"][step]}</CardTitle></CardHeader><CardContent className="space-y-5">
      {step === 0 && branch === "incomplete_deliveries" && <RadioGroup label="¿Cómo querés continuar?" name="futurePlan" value={values.futurePlan || ""} onChange={(event) => update("futurePlan", event.target.value)} error={errors.futurePlan} required options={[{ value: "continue", label: "Solicitar más tiempo para completar las entregas" }, { value: "retake", label: "Recursar este módulo" }, { value: "contact_teacher", label: "Conversar con el equipo docente" }]} />}
      {step < reviewStep ? sections[step].map((question) => <Textarea key={question.name} label={question.label} value={values[question.name] || ""} onChange={(event) => update(question.name, event.target.value)} error={errors[question.name]} required={!question.optional} description={question.optional ? "Opcional" : undefined} />) : <div className="space-y-5">{branch === "incomplete_deliveries" && <Review label="Cómo querés continuar" value={{ continue: "Solicitar más tiempo", retake: "Recursar el módulo", contact_teacher: "Contactar al equipo docente" }[values.futurePlan] || "Sin respuesta"} />}{questions.map((question) => <Review key={question.name} label={question.label} value={values[question.name] || "Sin respuesta"} />)}<Checkbox label="Confirmo que revisé mis respuestas y quiero enviarlas definitivamente." checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />{result?.error && <Alert variant="danger">{result.error}</Alert>}</div>}
    </CardContent></Card>
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button variant="secondary" disabled={step === 0 || loading} onClick={() => setStep((current) => current - 1)}>Anterior</Button>{step < reviewStep ? <Button onClick={next}>Continuar</Button> : <Button loading={loading} disabled={!confirmed} onClick={submit}>Enviar encuesta</Button>}</div>
  </div>;
}

function Review({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-surface-muted p-4"><p className="text-sm font-semibold">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted">{value}</p></div>; }
