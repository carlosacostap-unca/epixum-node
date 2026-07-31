import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JavascriptAssessmentForm from "./JavascriptAssessmentForm";

const submit = vi.fn(async () => ({
  success: true as const,
  message: "Guardamos tu diagnóstico inicial correctamente.",
  score: 1,
  totalQuestions: 2,
  attemptKind: "initial" as const,
  duplicate: false,
  categoryScores: [{ id: "fundamentals" as const, label: "Fundamentos y control de flujo", score: 1, total: 2, percentage: 50 }],
  feedback: [{ id: "fundamentals" as const, label: "Fundamentos y control de flujo", score: 1, total: 2, percentage: 50, level: "developing" as const, title: "En desarrollo", message: "Vas bien. Seguí practicando." }],
}));

vi.mock("@/lib/cohorts/assessment-actions", () => ({ submitJavascriptAssessmentAction: (...args: unknown[]) => submit(...args) }));

const questions = [
  { id: "q1", categoryId: "fundamentals" as const, prompt: "Primera pregunta", code: "const total = 2;", options: [{ id: "a", label: "Respuesta A" }, { id: "b", label: "respuestaB()", code: true }] },
  { id: "q2", categoryId: "async" as const, prompt: "Segunda pregunta", options: [{ id: "a", label: "Respuesta C" }, { id: "b", label: "Respuesta D" }] },
];
const storageKey = "epixum:javascript-diagnostic:student-1:cohort-1:js-foundations-v3";

describe("JavascriptAssessmentForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    submit.mockClear();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal("scrollTo", vi.fn());
  });

  it("muestra una pregunta por vez, revisa y presenta retroalimentación", async () => {
    render(<JavascriptAssessmentForm cohortId="cohort-1" studentId="student-1" questions={questions} />);
    expect(await screen.findByRole("heading", { name: /1\. Primera pregunta/ })).toBeVisible();
    expect(screen.getByLabelText("Código de la pregunta 1")).toHaveTextContent("const total = 2;");
    expect(screen.getByText("const total = 2;", { selector: "code" })).toHaveClass("font-mono");
    expect(screen.getByText("respuestaB()", { selector: "code" })).toHaveClass("font-mono");
    expect(screen.getByRole("heading", { name: /1\. Primera pregunta/ })).toHaveClass("text-lg", "font-semibold");
    expect(screen.queryByText("Segunda pregunta")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Respuesta A" }));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("heading", { name: /2\. Segunda pregunta/ })).toBeVisible();
    expect(screen.getByText("1 respondidas")).toBeVisible();
    fireEvent.click(screen.getByRole("radio", { name: "Respuesta C" }));
    fireEvent.click(screen.getByRole("button", { name: "Revisar respuestas" }));
    expect(screen.getByRole("heading", { name: "Las 2 preguntas están respondidas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar y enviar diagnóstico" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "1 de 2" })).toBeVisible());
    expect(screen.getByText("Diagnóstico inicial completado")).toBeVisible();
    expect(screen.getByText("En desarrollo")).toBeVisible();
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("recupera respuestas y posición desde el borrador local", async () => {
    window.localStorage.setItem(storageKey, JSON.stringify({ answers: { q1: "b" }, currentIndex: 1, attemptKey: "abcdefghijklmnop" }));
    render(<JavascriptAssessmentForm cohortId="cohort-1" studentId="student-1" questions={questions} />);
    expect(await screen.findByRole("heading", { name: /2\. Segunda pregunta/ })).toBeVisible();
    expect(screen.getByText("Recuperamos las respuestas guardadas en este dispositivo.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByRole("radio", { name: "respuestaB()" })).toBeChecked();
  });
});
