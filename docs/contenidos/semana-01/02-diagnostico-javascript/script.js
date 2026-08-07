"use strict";

const questions = [
  {
    topic: "Variables y tipos",
    prompt: "¿Cuál es la principal diferencia entre const y let?",
    options: ["const solo permite guardar números", "Una variable declarada con const no puede ser reasignada", "let solo funciona dentro de funciones", "No existe ninguna diferencia"],
    correct: 1,
    explanation: "const impide reasignar la variable. El contenido de un objeto o arreglo declarado con const sí puede modificarse."
  },
  {
    topic: "Variables y tipos",
    prompt: "¿Qué resultado produce esta comparación?",
    code: "5 === \"5\"",
    options: ["true", "false", "\"5\"", "undefined"],
    correct: 1,
    explanation: "La igualdad estricta compara valor y tipo. Un número y un string no son estrictamente iguales."
  },
  {
    topic: "Control de flujo",
    prompt: "¿Qué mensaje se muestra?",
    code: "const edad = 17;\nif (edad >= 18) {\n  console.log(\"Puede ingresar\");\n} else {\n  console.log(\"Debe esperar\");\n}",
    options: ["Puede ingresar", "Debe esperar", "17", "No se muestra nada"],
    correct: 1,
    explanation: "17 no es mayor o igual que 18, por lo que se ejecuta el bloque else."
  },
  {
    topic: "Control de flujo",
    prompt: "¿Cuántas veces se ejecuta console.log?",
    code: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}",
    options: ["2 veces", "3 veces", "4 veces", "Nunca termina"],
    correct: 1,
    explanation: "El bucle se ejecuta con i igual a 0, 1 y 2. Cuando llega a 3, la condición deja de cumplirse."
  },
  {
    topic: "Funciones",
    prompt: "¿Qué devuelve esta función cuando recibe 4 y 3?",
    code: "function calcular(a, b) {\n  return a * b;\n}\ncalcular(4, 3);",
    options: ["7", "12", "\"43\"", "undefined"],
    correct: 1,
    explanation: "Los argumentos 4 y 3 se asignan a los parámetros a y b. La función devuelve su multiplicación: 12."
  },
  {
    topic: "Funciones",
    prompt: "¿Cuál de estas opciones es una arrow function válida que duplica un número?",
    options: ["numero => numero * 2", "numero -> numero * 2", "function => numero * 2", "numero = numero * 2 =>"],
    correct: 0,
    explanation: "Una arrow function usa => entre sus parámetros y su cuerpo. Si solo retorna una expresión, puede omitir llaves y return."
  },
  {
    topic: "Arreglos y objetos",
    prompt: "¿Qué resultado produce map?",
    code: "const numeros = [1, 2, 3];\nconst dobles = numeros.map((numero) => numero * 2);",
    options: ["[1, 2, 3]", "[2, 4, 6]", "6", "[3, 4, 5]"],
    correct: 1,
    explanation: "map crea un nuevo arreglo aplicando la función a cada elemento. Cada número se multiplica por 2."
  },
  {
    topic: "Arreglos y objetos",
    prompt: "¿Cómo obtenemos el valor de nombre mediante desestructuración?",
    code: "const estudiante = { nombre: \"Ana\", curso: \"Node.js\" };",
    options: ["const [nombre] = estudiante", "const { nombre } = estudiante", "const nombre() = estudiante", "const nombre = { estudiante }"],
    correct: 1,
    explanation: "Los objetos se desestructuran con llaves. La variable nombre recibe el valor de la propiedad con el mismo nombre."
  },
  {
    topic: "Asincronismo",
    prompt: "¿Qué representa una promesa en JavaScript?",
    options: ["Un bucle que nunca termina", "El posible resultado futuro de una operación", "Una variable que no puede cambiar", "Un archivo guardado en el navegador"],
    correct: 1,
    explanation: "Una Promise representa una operación que puede completarse más adelante con un valor o finalizar con un error."
  },
  {
    topic: "Asincronismo",
    prompt: "¿Para qué usamos await dentro de una función async?",
    options: ["Para repetir una función muchas veces", "Para pausar esa función hasta que una promesa se resuelva", "Para convertir un objeto en arreglo", "Para ocultar los errores del programa"],
    correct: 1,
    explanation: "await pausa la ejecución de la función async hasta conocer el resultado de la promesa, sin bloquear por ello todo el entorno."
  }
];

const topicNames = ["Variables y tipos", "Control de flujo", "Funciones", "Arreglos y objetos", "Asincronismo"];
let current = 0;
let answers = Array(questions.length).fill(null);

const byId = (id) => document.getElementById(id);
const quizView = byId("quiz-view");
const results = byId("results");
const form = byId("quiz-form");
const prompt = byId("question-prompt");
const codeBlock = byId("question-code");
const options = byId("options");

function renderQuestion() {
  const question = questions[current];
  const answered = answers.filter((answer) => answer !== null).length;

  byId("question-count").textContent = `PREGUNTA ${current + 1} DE ${questions.length}`;
  byId("question-topic").textContent = question.topic;
  byId("answered-count").textContent = `${answered} ${answered === 1 ? "respondida" : "respondidas"}`;
  byId("progress-bar").style.width = `${((current + 1) / questions.length) * 100}%`;
  prompt.textContent = question.prompt;

  if (question.code) {
    codeBlock.hidden = false;
    codeBlock.querySelector("code").textContent = question.code;
  } else {
    codeBlock.hidden = true;
    codeBlock.querySelector("code").textContent = "";
  }

  options.replaceChildren(...question.options.map((option, index) => {
    const label = document.createElement("label");
    label.className = `option${answers[current] === index ? " selected" : ""}`;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question-${current}`;
    input.value = String(index);
    input.checked = answers[current] === index;
    input.addEventListener("change", () => {
      answers[current] = index;
      renderQuestion();
    });

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.className = "option-text";
    text.textContent = option;

    label.append(input, letter, text);
    return label;
  }));

  byId("question-nav").replaceChildren(...questions.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.className = `${answers[index] !== null ? "answered " : ""}${index === current ? "current" : ""}`.trim();
    button.setAttribute("aria-label", `Ir a la pregunta ${index + 1}${answers[index] !== null ? ", respondida" : ""}`);
    button.setAttribute("aria-current", index === current ? "step" : "false");
    button.addEventListener("click", () => { current = index; renderQuestion(); });
    return button;
  }));

  byId("previous").disabled = current === 0;
  byId("next").hidden = current === questions.length - 1;
  byId("next").disabled = answers[current] === null;
  byId("finish").hidden = current !== questions.length - 1;
  byId("finish").disabled = answered !== questions.length;
  byId("warning").textContent = current === questions.length - 1 && answered !== questions.length
    ? `Respondé las ${questions.length - answered} preguntas pendientes para ver tu devolución.`
    : "";
}

function showResults() {
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0);
  const result = score >= 8
    ? { level: "Base sólida", copy: "Recordás con seguridad los fundamentos necesarios. Podés avanzar y usar las consultas para dudas puntuales.", className: "strong" }
    : score >= 5
      ? { level: "Base en desarrollo", copy: "Tenés una buena parte de la base, pero conviene reforzar los temas señalados antes de la práctica integradora.", className: "developing" }
      : { level: "Necesitás un repaso", copy: "No es un problema: esta información permite acompañar mejor tu aprendizaje. Priorizá la Consulta 1 y los ejercicios recomendados.", className: "review" };

  byId("score").textContent = String(score);
  byId("result-level").textContent = result.level;
  byId("result-copy").textContent = result.copy;
  byId("result-hero").className = `result-hero ${result.className}`;

  byId("topic-results").replaceChildren(...topicNames.map((topic) => {
    const indexes = questions.map((question, index) => question.topic === topic ? index : -1).filter((index) => index >= 0);
    const topicScore = indexes.filter((index) => answers[index] === questions[index].correct).length;
    const row = document.createElement("div");
    row.className = "topic-result";
    row.innerHTML = `<span>${topic}</span><div class="meter" aria-label="${topicScore} de ${indexes.length}"><i style="width:${(topicScore / indexes.length) * 100}%"></i></div><strong>${topicScore}/${indexes.length}</strong>`;
    return row;
  }));

  byId("recommendation-title").textContent = score >= 8
    ? "Comenzá la preparación del entorno"
    : score >= 5 ? "Repasá las respuestas incorrectas" : "Anotá tus dudas para la Consulta 1";
  byId("recommendation-copy").textContent = score >= 8
    ? "Tu base alcanza para continuar con Terminal, Node.js y Git."
    : "Debajo vas a encontrar una explicación para cada respuesta. Usala como guía de repaso, no como una calificación.";

  byId("answer-review").replaceChildren(...questions.map((question, index) => {
    const isCorrect = answers[index] === question.correct;
    const article = document.createElement("article");
    article.className = isCorrect ? "correct" : "incorrect";

    const heading = document.createElement("h3");
    const status = document.createElement("span");
    status.textContent = isCorrect ? "✓" : "×";
    const headingText = document.createElement("span");
    headingText.textContent = `${index + 1}. ${question.prompt}`;
    heading.append(status, headingText);

    const userAnswer = document.createElement("p");
    userAnswer.innerHTML = "<b>Tu respuesta:</b> ";
    userAnswer.append(document.createTextNode(question.options[answers[index]]));
    article.append(heading, userAnswer);

    if (!isCorrect) {
      const correctAnswer = document.createElement("p");
      correctAnswer.innerHTML = "<b>Respuesta correcta:</b> ";
      correctAnswer.append(document.createTextNode(question.options[question.correct]));
      article.append(correctAnswer);
    }

    const explanation = document.createElement("small");
    explanation.textContent = question.explanation;
    article.append(explanation);
    return article;
  }));

  quizView.hidden = true;
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

byId("previous").addEventListener("click", () => { if (current > 0) { current -= 1; renderQuestion(); } });
byId("next").addEventListener("click", () => { if (answers[current] !== null && current < questions.length - 1) { current += 1; renderQuestion(); } });
form.addEventListener("submit", (event) => { event.preventDefault(); if (answers.every((answer) => answer !== null)) showResults(); });
byId("restart").addEventListener("click", () => {
  answers = Array(questions.length).fill(null);
  current = 0;
  results.hidden = true;
  quizView.hidden = false;
  renderQuestion();
  quizView.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderQuestion();
