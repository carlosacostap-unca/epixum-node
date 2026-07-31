export const JAVASCRIPT_ASSESSMENT_VERSION = "js-foundations-v3";
export const JAVASCRIPT_ASSESSMENT_QUESTION_COUNT = 15;

export type AssessmentAttemptKind = "initial" | "practice";
export type AssessmentCategoryId = "fundamentals" | "functions" | "collections" | "browser" | "async";

export interface AssessmentOption {
  id: string;
  label: string;
  code?: boolean;
}

export interface AssessmentCategory {
  id: AssessmentCategoryId;
  label: string;
  description: string;
  recommendation: string;
}

export interface PublicAssessmentQuestion {
  id: string;
  categoryId: AssessmentCategoryId;
  prompt: string;
  code?: string;
  options: AssessmentOption[];
}

interface AssessmentQuestion extends PublicAssessmentQuestion {
  correctOptionId: string;
}

export interface AssessmentCategoryScore {
  id: AssessmentCategoryId;
  label: string;
  score: number;
  total: number;
  percentage: number;
}

export interface AssessmentCategoryFeedback extends AssessmentCategoryScore {
  level: "strength" | "developing" | "reinforce";
  title: string;
  message: string;
}

const CATEGORIES: AssessmentCategory[] = [
  { id: "fundamentals", label: "Fundamentos y control de flujo", description: "Valores, conversiones y ejecución paso a paso.", recommendation: "Repasá tipos de datos, conversiones y estructuras de control." },
  { id: "functions", label: "Funciones y alcance", description: "Parámetros, retornos, alcance y comportamiento de funciones.", recommendation: "Practicá parámetros, valores de retorno, funciones flecha y alcance de bloque." },
  { id: "collections", label: "Colecciones y transformaciones", description: "Arrays y operaciones para transformar datos.", recommendation: "Repasá spread y los métodos map, filter y reduce con ejemplos pequeños." },
  { id: "browser", label: "Navegador, DOM y eventos", description: "Selección de elementos e interacción con la interfaz.", recommendation: "Practicá querySelector, propagación de eventos y preventDefault." },
  { id: "async", label: "Asincronismo", description: "Promesas, async/await y manejo de errores asíncronos.", recommendation: "Repasá el orden de ejecución, el valor devuelto por async y el manejo de rechazos." },
];

const QUESTIONS: AssessmentQuestion[] = [
  { id: "q1", categoryId: "fundamentals", prompt: "Observá el siguiente código. ¿Qué valor se muestra en la consola?", code: "const usuario = { nombre: \"Ana\" };\nusuario.nombre = \"Luz\";\n\nconsole.log(usuario.nombre);", options: [{ id: "a", label: "Ana" }, { id: "b", label: "Luz" }, { id: "c", label: "undefined", code: true }, { id: "d", label: "Se produce un error porque usuario fue declarado con const" }], correctOptionId: "b" },
  { id: "q2", categoryId: "fundamentals", prompt: "¿Qué resultado devuelve la siguiente expresión?", code: "Number(\" 10 \".trim()) + 2", options: [{ id: "a", label: "\"102\"", code: true }, { id: "b", label: "12", code: true }, { id: "c", label: "NaN", code: true }, { id: "d", label: "undefined", code: true }], correctOptionId: "b" },
  { id: "q3", categoryId: "fundamentals", prompt: "Después de ejecutar este código, ¿qué valor contiene la variable total?", code: "let total = 0;\n\nfor (let i = 1; i <= 3; i++) {\n  total += i;\n}", options: [{ id: "a", label: "3", code: true }, { id: "b", label: "5", code: true }, { id: "c", label: "6", code: true }, { id: "d", label: "7", code: true }], correctOptionId: "c" },
  { id: "q4", categoryId: "functions", prompt: "¿Qué valor devuelve la llamada a la función?", code: "function saludar(nombre = \"persona\") {\n  return `Hola, ${nombre}`;\n}\n\nsaludar(\"Ada\");", options: [{ id: "a", label: "Hola, persona" }, { id: "b", label: "Hola, nombre" }, { id: "c", label: "Hola, Ada" }, { id: "d", label: "undefined", code: true }], correctOptionId: "c" },
  { id: "q5", categoryId: "functions", prompt: "Una variable se declara con let dentro del bloque de un if. ¿Dónde puede utilizarse esa variable?", options: [{ id: "a", label: "Únicamente dentro de ese bloque" }, { id: "b", label: "En cualquier parte del archivo" }, { id: "c", label: "Desde cualquier función" }, { id: "d", label: "No puede utilizarse dentro del bloque" }], correctOptionId: "a" },
  { id: "q6", categoryId: "functions", prompt: "¿Qué valor devuelve la llamada a la función flecha?", code: "const duplicar = numero => numero * 2;\n\nduplicar(4);", options: [{ id: "a", label: "2", code: true }, { id: "b", label: "4", code: true }, { id: "c", label: "8", code: true }, { id: "d", label: "undefined", code: true }], correctOptionId: "c" },
  { id: "q7", categoryId: "collections", prompt: "¿Qué nuevo array produce este código?", code: "[1, 2, 3, 4].filter(numero => numero % 2 === 0)", options: [{ id: "a", label: "[1, 3]", code: true }, { id: "b", label: "[2, 4]", code: true }, { id: "c", label: "[false, true, false, true]", code: true }, { id: "d", label: "4", code: true }], correctOptionId: "b" },
  { id: "q8", categoryId: "collections", prompt: "Después de ejecutar este código, ¿qué valores contienen base y copia?", code: "const base = [1, 2];\nconst copia = [...base, 3];", options: [{ id: "a", label: "base y copia contienen [1, 2, 3]" }, { id: "b", label: "base contiene [1, 2] y copia contiene [1, 2, 3]" }, { id: "c", label: "base contiene [3] y copia contiene [1, 2]" }, { id: "d", label: "La sintaxis produce un error" }], correctOptionId: "b" },
  { id: "q9", categoryId: "collections", prompt: "¿Qué valor devuelve la operación reduce?", code: "[1, 2, 3].reduce(\n  (suma, numero) => suma + numero,\n  0,\n)", options: [{ id: "a", label: "0", code: true }, { id: "b", label: "3", code: true }, { id: "c", label: "6", code: true }, { id: "d", label: "[1, 2, 3]", code: true }], correctOptionId: "c" },
  { id: "q10", categoryId: "browser", prompt: "¿Qué instrucción selecciona el primer elemento HTML que tiene la clase «tarjeta»?", options: [{ id: "a", label: "document.querySelector(\".tarjeta\")", code: true }, { id: "b", label: "document.querySelector(\"#tarjeta\")", code: true }, { id: "c", label: "document.createElement(\".tarjeta\")", code: true }, { id: "d", label: "window.getElement(\".tarjeta\")", code: true }], correctOptionId: "a" },
  { id: "q11", categoryId: "browser", prompt: "En este listener, ¿qué expresión permite identificar el botón hijo que originó el clic?", code: "lista.addEventListener(\"click\", event => {\n  // Identificar aquí el botón presionado.\n});", options: [{ id: "a", label: "event.target o event.target.closest(...)", code: true }, { id: "b", label: "Crear otro listener después de cada clic" }, { id: "c", label: "event.promise", code: true }, { id: "d", label: "Reemplazar el elemento padre" }], correctOptionId: "a" },
  { id: "q12", categoryId: "browser", prompt: "¿Qué efecto tiene la llamada de la segunda línea?", code: "formulario.addEventListener(\"submit\", event => {\n  event.preventDefault();\n});", options: [{ id: "a", label: "Elimina todos los campos" }, { id: "b", label: "Evita el comportamiento predeterminado del envío" }, { id: "c", label: "Detiene todo el código JavaScript" }, { id: "d", label: "Convierte el formulario en JSON" }], correctOptionId: "b" },
  { id: "q13", categoryId: "async", prompt: "¿En qué orden se muestran los mensajes en la consola?", code: "console.log(\"A\");\n\nPromise.resolve().then(() => console.log(\"B\"));\n\nconsole.log(\"C\");", options: [{ id: "a", label: "A, B, C", code: true }, { id: "b", label: "B, A, C", code: true }, { id: "c", label: "A, C, B", code: true }, { id: "d", label: "C, B, A", code: true }], correctOptionId: "c" },
  { id: "q14", categoryId: "async", prompt: "Al trabajar con await, ¿qué estructura se utiliza normalmente para manejar el rechazo de una promesa?", options: [{ id: "a", label: "Un bloque try/catch", code: true }, { id: "b", label: "Un bucle while", code: true }, { id: "c", label: "JSON.parse()", code: true }, { id: "d", label: "document.querySelector()", code: true }], correctOptionId: "a" },
  { id: "q15", categoryId: "async", prompt: "¿Qué tipo de valor devuelve la llamada a esta función?", code: "async function obtenerNumero() {\n  return 42;\n}\n\nobtenerNumero();", options: [{ id: "a", label: "Una promesa" }, { id: "b", label: "Un elemento HTML" }, { id: "c", label: "Una cadena de texto" }, { id: "d", label: "undefined", code: true }], correctOptionId: "a" },
];

if (QUESTIONS.length !== JAVASCRIPT_ASSESSMENT_QUESTION_COUNT) throw new Error("La cantidad de preguntas no coincide con la configuración del diagnóstico.");
for (const category of CATEGORIES) {
  if (QUESTIONS.filter((question) => question.categoryId === category.id).length !== 3) throw new Error(`La categoría ${category.id} debe contener exactamente tres preguntas.`);
}

export function getAssessmentCategories(): AssessmentCategory[] {
  return CATEGORIES.map((category) => ({ ...category }));
}

export function getPublicAssessmentQuestions(): PublicAssessmentQuestion[] {
  return QUESTIONS.map(({ id, categoryId, prompt, code, options }) => ({ id, categoryId, prompt, ...(code ? { code } : {}), options: options.map((option) => ({ ...option })) }));
}

export function getAssessmentQuestionDetails() {
  return QUESTIONS.map((question) => ({ ...question, options: question.options.map((option) => ({ ...option })) }));
}

export function calculateAssessmentCategoryScores(answers: Record<string, string>): AssessmentCategoryScore[] {
  return CATEGORIES.map((category) => {
    const questions = QUESTIONS.filter((question) => question.categoryId === category.id);
    const score = questions.filter((question) => answers[question.id] === question.correctOptionId).length;
    return { id: category.id, label: category.label, score, total: questions.length, percentage: Math.round((score / questions.length) * 100) };
  });
}

export function getAssessmentCategoryFeedback(scores: AssessmentCategoryScore[]): AssessmentCategoryFeedback[] {
  return scores.map((score) => {
    const category = CATEGORIES.find((item) => item.id === score.id)!;
    if (score.score === score.total) return { ...score, level: "strength", title: "Fortaleza", message: `Tenés una base sólida en ${category.label.toLocaleLowerCase("es")}.` };
    if (score.score / score.total <= 1 / 3) return { ...score, level: "reinforce", title: "Prioridad de repaso", message: category.recommendation };
    return { ...score, level: "developing", title: "En desarrollo", message: `Vas bien. ${category.recommendation}` };
  });
}

export function scoreAssessmentAnswers(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Las respuestas no tienen un formato válido.");
  const answers = input as Record<string, unknown>;
  const expectedIds = new Set(QUESTIONS.map((question) => question.id));
  if (Object.keys(answers).length !== QUESTIONS.length || Object.keys(answers).some((id) => !expectedIds.has(id))) throw new Error(`Debes responder exactamente las ${JAVASCRIPT_ASSESSMENT_QUESTION_COUNT} preguntas.`);
  const normalized: Record<string, string> = {};
  let score = 0;
  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (typeof answer !== "string" || !question.options.some((option) => option.id === answer)) throw new Error("Debes responder todas las preguntas con una opción válida.");
    normalized[question.id] = answer;
    if (answer === question.correctOptionId) score += 1;
  }
  const categoryScores = calculateAssessmentCategoryScores(normalized);
  return { answers: normalized, score, totalQuestions: QUESTIONS.length, categoryScores, feedback: getAssessmentCategoryFeedback(categoryScores) };
}

export function calculateAssessmentMetrics(activeEnrollments: number, results: Array<{ student?: string; score: number; totalQuestions: number }>) {
  const participants = new Set(results.map((result, index) => result.student || `anonymous-${index}`)).size;
  const averageScore = results.length === 0 ? 0 : results.reduce((sum, result) => sum + result.score, 0) / results.length;
  const averagePercentage = results.length === 0 ? 0 : results.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0) / results.length;
  return { activeEnrollments, completed: participants, pending: Math.max(0, activeEnrollments - participants), averageScore, averagePercentage };
}

export function summarizeAssessmentAttempts<T extends { id?: string; student: string; score: number; completedAt: string; attemptKind?: AssessmentAttemptKind }>(results: T[]) {
  const byStudent = new Map<string, T[]>();
  for (const result of results) byStudent.set(result.student, [...(byStudent.get(result.student) || []), result]);
  return [...byStudent.entries()].map(([student, attempts]) => {
    const chronological = [...attempts].sort((left, right) => left.completedAt.localeCompare(right.completedAt));
    const initial = chronological.find((attempt) => attempt.attemptKind === "initial") || chronological[0];
    const ordered = [...chronological].reverse();
    const latest = ordered[0];
    return {
      student,
      attemptCount: attempts.length,
      practiceCount: Math.max(0, attempts.length - 1),
      initial,
      latest,
      initialScore: initial.score,
      latestScore: latest.score,
      changeFromInitial: latest.score - initial.score,
      worstScore: Math.min(...attempts.map((attempt) => attempt.score)),
      bestScore: Math.max(...attempts.map((attempt) => attempt.score)),
      attempts: ordered,
    };
  });
}

export function assessmentAttemptKind<T extends { id?: string; completedAt: string; attemptKind?: AssessmentAttemptKind }>(attempt: T, attempts: T[]): AssessmentAttemptKind {
  if (attempt.attemptKind) return attempt.attemptKind;
  const earliest = [...attempts].sort((left, right) => left.completedAt.localeCompare(right.completedAt))[0];
  return earliest === attempt || (earliest.id && earliest.id === attempt.id) ? "initial" : "practice";
}

export function assertAssessmentEligibility(input: { role: string; cohortMode: string; activeEnrollment: boolean }) {
  if (input.role !== "estudiante") throw new Error("Sólo los estudiantes pueden completar el diagnóstico.");
  if (input.cohortMode !== "weekly") throw new Error("Este diagnóstico sólo está disponible en cohortes semanales.");
  if (!input.activeEnrollment) throw new Error("Necesitás una matrícula activa para completar el diagnóstico.");
}
