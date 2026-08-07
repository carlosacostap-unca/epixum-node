import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { contentBlocksSchema } from "./domain.ts";

type ManifestBlock = {
  type: string;
  key: string;
  required?: boolean;
  content?: unknown;
  body?: unknown;
  caption?: string;
};

type ManifestSection = {
  sourceKey: string;
  sourceFolder: string;
  position: number;
  title: string;
  summary: string;
  blocks: ManifestBlock[];
};

const manifest = JSON.parse(readFileSync(path.resolve("content/week-01.manifest.json"), "utf8")) as {
  excludedFolders: string[];
  sections: ManifestSection[];
  assets: Array<{ key: string; sourcePath: string; alt: string }>;
};

const expectedOrder = [
  "01-resumen",
  "03-conoce-la-terminal",
  "04-instala-nodejs",
  "05-instala-git",
  "06-crea-cuenta-github",
  "08-que-hace-backend",
  "09-runtime-nodejs",
  "10-event-loop",
  "11-modulos",
  "12-programa-modular",
  "13-errores-frecuentes",
  "07-publica-primera-entrega",
  "15-evidencia-avance",
  "14-cierre-glosario",
];

function visit(value: unknown, callback: (value: unknown) => void) {
  callback(value);
  if (Array.isArray(value)) for (const item of value) visit(item, callback);
  else if (value && typeof value === "object") for (const item of Object.values(value)) visit(item, callback);
}

test("el manifiesto contiene catorce secciones en secuencia pedagógica y excluye el diagnóstico", () => {
  assert.equal(manifest.sections.length, 14);
  assert.deepEqual(manifest.sections.map((section) => section.position), Array.from({ length: 14 }, (_, index) => index + 1));
  assert.deepEqual(manifest.sections.map((section) => section.sourceFolder), expectedOrder);
  assert.deepEqual(manifest.excludedFolders, ["02-diagnostico-javascript"]);
  assert.equal(JSON.stringify(manifest.sections).toLocaleLowerCase("es").includes("diagnóstico de javascript"), false);
});

test("cada sección usa bloques nativos válidos, variados y con claves estables", () => {
  for (const section of manifest.sections) {
    assert.doesNotMatch(section.title, /^\d+(?:\.\d+)*\s/);
    assert.doesNotThrow(() => contentBlocksSchema.parse(section.blocks), section.sourceFolder);
  }
  assert.equal(new Set(manifest.sections.map((section) => section.sourceKey)).size, 14);
  const types = new Set(manifest.sections.flatMap((section) => section.blocks.map((block) => block.type)));
  for (const expected of ["rich_text", "cards", "steps", "image", "code", "terminal", "command_reference", "callout", "checklist", "validator", "generator", "glossary", "question"])
    assert.equal(types.has(expected), true, `Falta el bloque ${expected}`);
});

test("la sección de terminal conserva su estructura técnica sin fragmentos sueltos", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "03-conoce-la-terminal");
  assert.ok(section);
  assert.equal(section.blocks.length, 10);
  assert.equal(section.blocks.some((block) => block.type === "checklist"), false);
  assert.equal(section.blocks.some((block) => block.type === "rich_text"), false);
  const terminal = section.blocks.find((block) => block.type === "terminal") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(terminal.rows.map((row) => row.label), ["Prompt", "Comando", "Respuesta", "Nuevo prompt"]);
  const reference = section.blocks.find((block) => block.type === "command_reference") as ManifestBlock & { items: Array<{ command: string; purpose: string; tryIt: string }> };
  assert.deepEqual(reference.items.map((item) => item.command), ["pwd", "ls", "cd nombre", "cd ..", "mkdir practica-terminal", "clear"]);
  assert.equal(reference.items.every((item) => item.purpose && item.tryIt), true);
  const serialized = JSON.stringify(section.blocks);
  assert.equal(serialized.includes("carpeta anterior"), false);
  assert.equal(serialized.includes("carpeta padre"), true);
  assert.equal(serialized.includes("node app.js"), false);
  assert.equal(serialized.includes("echo Hola"), true);
});

test("la instalación de Node.js conserva un recorrido verificable y seguro", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "04-instala-nodejs");
  assert.ok(section);
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "steps", "link", "image", "cards", "image", "steps", "code", "image", "cards", "validator", "validator"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 3);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text"), false);

  const journey = section.blocks.find((block) => block.key === "week01_instala_nodejs_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["Descargá la versión LTS", "Conservá la instalación predeterminada", "Reabrí Visual Studio Code", "Verificá los dos comandos"]);
  const link = section.blocks.find((block) => block.type === "link") as ManifestBlock & { url: string; newTab: boolean };
  assert.equal(link.url, "https://nodejs.org/en/download");
  assert.equal(link.newTab, true);

  const components = section.blocks.find((block) => block.key === "week01_instala_nodejs_components") as ManifestBlock & { columns: number; items: Array<{ title: string; body: string }> };
  assert.equal(components.columns, 2);
  assert.deepEqual(components.items.map((item) => item.title), ["Node.js runtime", "npm package manager", "Agregar al PATH", "Herramientas adicionales"]);
  const problems = section.blocks.find((block) => block.key === "week01_instala_nodejs_troubleshooting") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(problems.items.map((item) => item.title), ["node no se reconoce", "npm no se reconoce", "npm.ps1 no puede ejecutarse"]);
  assert.equal(problems.items.every((item) => item.body.includes("Primero:") || item.title.includes("npm.ps1")), true);

  const validators = section.blocks.filter((block) => block.type === "validator") as Array<ManifestBlock & { activityKey: string; required: boolean }>;
  assert.deepEqual(validators.map((item) => item.activityKey), ["week01_instala_nodejs_node_version", "week01_instala_nodejs_npm_version"]);
  assert.equal(validators.every((item) => item.required), true);
  const serialized = JSON.stringify(section);
  assert.equal(serialized.includes("Set-ExecutionPolicy"), false);
  assert.equal(serialized.includes("No cambies la seguridad del equipo por tu cuenta"), true);
});

test("la instalación de Git ordena verificación, privacidad y autoría", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "05-instala-git");
  assert.ok(section);
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "steps", "link", "image", "cards", "image", "code", "callout", "generator", "image", "code", "callout", "cards", "validator"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 3);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text"), false);

  const link = section.blocks.find((block) => block.type === "link") as ManifestBlock & { url: string };
  assert.equal(link.url, "https://git-scm.com/install/windows");
  const components = section.blocks.find((block) => block.key === "week01_instala_git_components") as ManifestBlock & { columns: number; items: Array<{ title: string }> };
  assert.equal(components.columns, 2);
  assert.deepEqual(components.items.map((item) => item.title), ["Git desde la terminal", "OpenSSH incluido", "Git Credential Manager", "No memorices cada pantalla"]);

  const privacyIndex = section.blocks.findIndex((block) => block.key === "week01_instala_git_privacy_decision");
  const generatorIndex = section.blocks.findIndex((block) => block.type === "generator");
  assert.ok(privacyIndex >= 0 && privacyIndex < generatorIndex);
  const generator = section.blocks[generatorIndex] as ManifestBlock & { description: string; variables: Array<{ placeholder?: string }> };
  assert.match(generator.description, /no se envían/i);
  assert.deepEqual(generator.variables.map((variable) => variable.placeholder), ["Ana Pérez", "ana@ejemplo.com"]);

  const problems = section.blocks.find((block) => block.key === "week01_instala_git_troubleshooting") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(problems.items.map((item) => item.title), ["git no se reconoce", "Access denied", "El nombre o correo es incorrecto"]);
  assert.equal(problems.items.every((item) => item.body.includes("Primero:") && item.body.includes("Después:")), true);
  const validator = section.blocks.at(-1) as ManifestBlock & { type: string; activityKey: string; required: boolean };
  assert.equal(validator.type, "validator");
  assert.equal(validator.activityKey, "week01_instala_git_git_version");
  assert.equal(validator.required, true);

  const serialized = JSON.stringify(section);
  assert.equal(serialized.includes("Esta configuración no publica tu correo"), false);
  assert.equal(serialized.includes("ese correo puede ser visible"), true);
  assert.equal(serialized.includes("init.defaultBranch main"), true);
});

test("la cuenta de GitHub ordena registro, seguridad y comprobación del perfil", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "06-crea-cuenta-github");
  assert.ok(section);
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "steps", "link", "cards", "image", "steps", "image", "callout", "image", "cards", "callout", "cards", "code", "validator"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 3);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text"), false);

  const link = section.blocks.find((block) => block.type === "link") as ManifestBlock & { url: string; newTab: boolean };
  assert.equal(link.url, "https://github.com/signup");
  assert.equal(link.newTab, true);
  const journey = section.blocks.find((block) => block.key === "week01_crea_cuenta_github_journey") as ManifestBlock & { items: Array<{ title: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["Creá una cuenta personal", "Verificá el correo", "Comprobá el perfil público", "Protegé y prepará la recuperación", "Relacioná el correo con Git"]);

  const security = section.blocks.find((block) => block.key === "week01_crea_cuenta_github_security") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(security.items.map((item) => item.title), ["Agregá una segunda comprobación", "Guardá los códigos fuera del repositorio", "Contraseñas y códigos son secretos"]);
  assert.equal(security.items.every((item) => !item.body.includes("compart" ) || item.title === "Contraseñas y códigos son secretos"), true);
  const validator = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; helpText: string; presentation: string; rule: { kind: string } };
  assert.equal(validator.activityKey, "week01_crea_cuenta_github_github_username");
  assert.equal(validator.required, true);
  assert.equal(validator.rule.kind, "github_username");
  assert.equal(validator.presentation, "github_profile");
  assert.match(validator.helpText, /No ingreses el correo, la contraseña ni la URL completa/);

  const activities = section.blocks.filter((block) => ["question", "checklist", "validator"].includes(block.type));
  assert.deepEqual(activities.map((block) => block.type), ["validator"]);
  const serialized = JSON.stringify(section);
  for (const expected of ["Google o Apple", "24 horas", "Resend verification email", "noreply", "puede exigirla a quienes contribuyen código"])
    assert.equal(serialized.includes(expected), true, `Falta: ${expected}`);
  assert.equal(serialized.includes("Captura orientativa"), true);
});

test("el papel del back end distingue confianza, decisión y persistencia", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "08-que-hace-backend");
  assert.ok(section);
  assert.equal(section.title, "¿Qué hace el back end?");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "image", "cards", "callout", "image", "steps", "terminal", "cards", "image", "glossary", "question"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 3);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text" || block.type === "code"), false);

  const roles = section.blocks.find((block) => block.key === "week01_que_hace_backend_roles") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(roles.items.map((item) => item.title), ["Front end", "Back end", "Base de datos", "Servicios externos"]);
  assert.match(roles.items.find((item) => item.title === "Front end")?.body ?? "", /puede anticipar errores/);
  assert.match(roles.items.find((item) => item.title === "Base de datos")?.body ?? "", /consultas o comandos/);

  const journey = section.blocks.find((block) => block.key === "week01_que_hace_backend_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["La persona inicia la acción", "El front end envía la solicitud", "El back end valida", "Consulta el estado actual", "Aplica la regla y, si corresponde, registra", "Devuelve una respuesta"]);
  assert.equal(journey.items.some((item) => item.body.includes("no persiste")), true);

  const exchange = section.blocks.find((block) => block.type === "terminal") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(exchange.rows.map((row) => row.label), ["Método y ruta", "Cuerpo", "Decisión", "Estado", "Respuesta"]);
  assert.equal(exchange.rows[0].value, "POST /reservas");
  assert.equal(exchange.rows.some((row) => row.value === "201 Created"), true);
  const outcomes = section.blocks.find((block) => block.key === "week01_que_hace_backend_outcomes") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(outcomes.items.map((item) => item.title), ["Reserva creada", "Datos o permiso inválidos", "El libro ya no está disponible"]);
  assert.equal(outcomes.items.slice(1).every((item) => /no (?:registra|se persiste)/i.test(item.body)), true);

  const glossary = section.blocks.find((block) => block.type === "glossary") as ManifestBlock & { items: Array<{ term: string }> };
  assert.deepEqual(glossary.items.map((item) => item.term), ["Solicitud", "Respuesta", "Regla de negocio", "Persistencia"]);
  const question = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; prompt: string; options: Array<{ key: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_que_hace_backend_question");
  assert.equal(question.required, true);
  assert.equal(question.prompt, "¿Cuáles son responsabilidades propias del back end?");
  assert.deepEqual(question.options.map((option) => option.key), ["form", "validate", "save", "style"]);
  assert.deepEqual(question.correctOptionKeys, ["validate", "save"]);

  const serialized = JSON.stringify(section);
  for (const expected of ["entrada no confiable", "validación del lado servidor de OWASP", "409", "puede no necesitar todos estos componentes"])
    assert.equal(serialized.includes(expected), true, `Falta: ${expected}`);
});

test("el runtime distingue lenguaje, entorno, proceso y argumentos observables", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "09-runtime-nodejs");
  assert.ok(section);
  assert.equal(section.title, "JavaScript salió del navegador");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "code", "image", "cards", "image", "steps", "cards", "code", "code", "image", "cards", "terminal", "question"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 3);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text"), false);

  const environments = section.blocks.find((block) => block.key === "week01_runtime_nodejs_environments") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(environments.items.map((item) => item.title), ["El lenguaje", "La página y el DOM", "El proceso y el sistema"]);
  assert.match(environments.items.find((item) => item.title === "La página y el DOM")?.body ?? "", /window, document y el DOM/);
  assert.match(environments.items.find((item) => item.title === "El proceso y el sistema")?.body ?? "", /process.*archivos.*red/);

  const journey = section.blocks.find((block) => block.key === "week01_runtime_nodejs_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["La terminal recibe el comando", "Comienza un proceso", "Node.js carga el archivo", "V8 ejecuta JavaScript", "El proceso termina"]);
  const pieces = section.blocks.find((block) => block.key === "week01_runtime_nodejs_pieces") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(pieces.items.map((item) => item.title), ["V8", "API de Node.js", "libuv"]);
  assert.match(pieces.items.find((item) => item.title === "libuv")?.body ?? "", /parte de la entrada y salida asíncrona/);

  const processCards = section.blocks.find((block) => block.key === "week01_runtime_nodejs_process") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(processCards.items.map((item) => item.title), ["process.version", "process.cwd()", "process.argv"]);
  assert.match(processCards.items[1].body, /desde la que iniciaste el proceso.*No necesariamente/);
  assert.match(processCards.items[2].body, /posición 0.*posición 1.*posición 2/);

  const terminal = section.blocks.find((block) => block.type === "terminal") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(terminal.rows.map((row) => row.label), ["Comando", "Respuesta", "Qué significa", "Qué revisar"]);
  assert.equal(terminal.rows[1].value, "ReferenceError: document is not defined");
  assert.match(terminal.rows[2].value, /DOM.*navegador/);

  const question = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; options: Array<{ key: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_runtime_nodejs_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "boolean");
  assert.equal(question.prompt, "`document` está disponible de forma predeterminada al ejecutar un archivo con Node.js.");
  assert.deepEqual(question.options.map((option) => option.key), ["true", "false"]);
  assert.deepEqual(question.correctOptionKeys, ["false"]);

  const serialized = JSON.stringify(section);
  for (const expected of ["No es otro lenguaje, ni un framework, ni un servidor", "process.argv[2]", "todo código del navegador", "directorio de trabajo actual"])
    assert.equal(serialized.includes(expected), true, `Falta: ${expected}`);
});

test("el event loop distingue callbacks, operaciones concurrentes y bloqueo", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "10-event-loop");
  assert.ok(section);
  assert.equal(section.title, "Una fila, muchas tareas en movimiento");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "image", "cards", "image", "cards", "code", "steps", "image", "callout", "code", "terminal", "cards", "question"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 3);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text"), false);

  const analogy = section.blocks.find((block) => block.key === "week01_event_loop_analogy") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(analogy.items.map((item) => item.title), ["JavaScript atiende un turno", "Otro recurso realiza la espera", "La callback queda preparada", "El event loop no prepara pedidos"]);
  assert.match(analogy.items.at(-1)?.body ?? "", /Coordina oportunidades.*No realiza/);

  const model = section.blocks.find((block) => block.key === "week01_event_loop_model") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(model.items.map((item) => item.title), ["Pila de llamadas", "Recursos asíncronos", "Colas asociadas a fases", "Event loop"]);
  assert.match(model.items[1].body, /sistema operativo.*pool de trabajo/);
  assert.match(model.items[2].body, /única cola.*no describe toda/);
  assert.match(model.items[3].body, /callbacks listas de a una/);

  const trace = section.blocks.find((block) => block.key === "week01_event_loop_order_trace") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(trace.items.map((item) => item.title), ["A se imprime ahora", "El temporizador se registra", "C sigue en el mismo script", "B recibe un turno posterior"]);
  const timer = section.blocks.find((block) => block.key === "week01_event_loop_timer_rule") as ManifestBlock & { body: unknown };
  assert.match(JSON.stringify(timer.body), /No interrumpe.*umbral mínimo/);
  assert.match(JSON.stringify(timer.body), /instante real tampoco es exacto/);

  const fileCode = section.blocks.find((block) => block.key === "week01_event_loop_file_code") as ManifestBlock & { code: string };
  assert.match(fileCode.code, /readFile\(__filename, "utf8"/);
  assert.match(fileCode.code, /contenido\.length/);
  assert.equal(fileCode.code.includes("datos.txt"), false);
  const output = section.blocks.find((block) => block.key === "week01_event_loop_file_output") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(output.rows.slice(1, 4).map((row) => row.value), ["Inicio", "Fin", "Archivo listo: [cantidad] caracteres"]);

  const lessons = section.blocks.find((block) => block.key === "week01_event_loop_file_lessons") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(lessons.items.map((item) => item.title), ["readFile inicia y devuelve", "El resultado vuelve a JavaScript", "readFileSync espera", "require y __filename"]);
  assert.match(lessons.items[1].body, /no significa.*paralelo/);
  assert.match(lessons.items[2].body, /impide avanzar con más JavaScript/);

  const question = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; code: string; options: Array<{ key: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_event_loop_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "single");
  assert.equal(question.prompt, "¿En qué orden se imprimen los valores?");
  assert.equal(question.code, 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");');
  assert.deepEqual(question.options.map((option) => option.key), ["abc", "acb", "cab"]);
  assert.deepEqual(question.correctOptionKeys, ["acb"]);

  const serialized = JSON.stringify(section);
  for (const absent of ["Promesas antes que temporizadores", "datos.txt"]) assert.equal(serialized.includes(absent), false, `Sobra: ${absent}`);
});

test("los módulos presentan un contrato CommonJS coherente y ejecutable", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "11-modulos");
  assert.ok(section);
  assert.equal(section.title, "Un archivo, una responsabilidad clara");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "image", "cards", "code", "code", "image", "steps", "cards", "code", "terminal", "cards", "cards", "question"]);
  assert.equal(section.blocks.filter((block) => block.type === "image").length, 2);
  assert.equal(section.blocks.some((block) => block.type === "checklist" || block.type === "rich_text"), false);

  const principles = section.blocks.find((block) => block.key === "week01_modulos_principles") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(principles.items.map((item) => item.title), ["Código relacionado", "Privado de forma predeterminada", "Una interfaz pública", "Un archivo que coordina"]);
  assert.match(principles.items[2].body, /module\.exports.*require/);

  const operations = section.blocks.find((block) => block.key === "week01_modulos_operations_code") as ManifestBlock & { language: string; code: string };
  const app = section.blocks.find((block) => block.key === "week01_modulos_app_code") as ManifestBlock & { language: string; code: string };
  assert.equal(operations.language, "javascript");
  assert.equal(app.language, "javascript");
  assert.equal(operations.code, "function sumar(a, b) {\n  return a + b;\n}\n\nmodule.exports = { sumar };");
  assert.equal(app.code, 'const { sumar } = require("./operaciones");\n\nconsole.log(sumar(8, 4));');
  assert.equal(`${operations.code}${app.code}`.includes("duplicar"), false);

  const journey = section.blocks.find((block) => block.key === "week01_modulos_require_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["Node.js comienza por app.js", "require resuelve ./operaciones", "operaciones.js se carga", "module.exports vuelve a app.js", "app.js usa el contrato"]);
  assert.match(journey.items[1].body, /carpeta de app\.js.*No parte de process\.cwd/);
  assert.match(journey.items[3].body, /require devuelve el objeto \{ sumar \}/);

  const identifiers = section.blocks.find((block) => block.key === "week01_modulos_identifiers") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(identifiers.items.map((item) => item.eyebrow), ["./operaciones", "../utilidades", "node:fs", "express"]);
  assert.match(identifiers.items[0].body, /extensión \.js.*\.\/ sigue siendo necesario/);
  assert.match(identifiers.items[3].body, /node_modules/);

  const output = section.blocks.find((block) => block.key === "week01_modulos_output") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(output.rows.slice(0, 2).map((row) => row.value), ["node app.js", "12"]);
  const responsibilities = section.blocks.find((block) => block.key === "week01_modulos_responsibilities") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(responsibilities.items.map((item) => item.title), ["Sabe calcular", "Sabe coordinar", "El nombre explica el conjunto"]);
  assert.match(responsibilities.items[2].body, /No existe una regla de un archivo por función/);

  const diagnostics = section.blocks.find((block) => block.key === "week01_modulos_diagnostics") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(diagnostics.items.map((item) => item.eyebrow), ["MODULE_NOT_FOUND", "NO ES UNA FUNCIÓN", "require NO ESTÁ DEFINIDO", "COMANDO"]);
  assert.match(diagnostics.items[2].body, /CommonJS.*package\.json.*no mezcles require con import/);

  const question = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; options: Array<{ key: string; label: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_modulos_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "single");
  assert.equal(question.prompt, "Si `operaciones.js` está junto a `app.js`, ¿qué ruta lo importa correctamente?");
  assert.deepEqual(question.options.map((option) => option.key), ["relative", "package", "parent"]);
  assert.deepEqual(question.options.map((option) => option.label), ['require("./operaciones")', 'require("operaciones")', 'require("../operaciones")']);
  assert.deepEqual(question.correctOptionKeys, ["relative"]);

  const serialized = JSON.stringify(section);
  for (const expected of ["terminal muestra 12", "propio alcance", "module.exports", "MODULE_NOT_FOUND"]) assert.equal(serialized.includes(expected), true, `Falta: ${expected}`);
  assert.equal(serialized.includes("// 24"), false);
});

test("el programa modular integra entrada, módulos, archivo y evidencia comprobable", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "12-programa-modular");
  assert.ok(section);
  assert.equal(section.title, "Tu primer programa modular");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "code", "cards", "steps", "code", "code", "code", "code", "terminal", "terminal", "cards", "steps", "code", "cards", "question", "checklist"]);
  assert.equal(section.blocks.some((block) => block.type === "rich_text" || block.type === "image"), false);

  const tree = section.blocks.find((block) => block.key === "week01_programa_modular_tree") as ManifestBlock & { code: string };
  for (const file of ["app.js", "saludos.js", "historial.js", "README.md", "historial.txt"]) assert.match(tree.code, new RegExp(file.replace(".", "\\.")));
  assert.match(tree.code, /historial\.txt.*se crea al ejecutar/);

  const contract = section.blocks.find((block) => block.key === "week01_programa_modular_contract") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(contract.items.map((item) => item.eyebrow), ["ENTRADA", "SALIDA", "PERSISTENCIA", "ENTRADA INVÁLIDA"]);
  assert.match(contract.items[0].body, /una o más palabras/);
  assert.match(contract.items[2].body, /sin reemplazar/);
  assert.match(contract.items[3].body, /no escribe/);

  const greeting = section.blocks.find((block) => block.key === "week01_programa_modular_greeting_code") as ManifestBlock & { language: string; code: string };
  const history = section.blocks.find((block) => block.key === "week01_programa_modular_history_code") as ManifestBlock & { language: string; code: string };
  const app = section.blocks.find((block) => block.key === "week01_programa_modular_app_code") as ManifestBlock & { language: string; code: string };
  assert.equal(greeting.language, "javascript");
  assert.equal(history.language, "javascript");
  assert.equal(app.language, "javascript");
  assert.match(greeting.code, /module\.exports = \{ crearSaludo \}/);
  assert.match(history.code, /require\("node:fs"\)/);
  assert.match(history.code, /require\("node:path"\)/);
  assert.match(history.code, /path\.join\(__dirname, "historial\.txt"\)/);
  assert.match(history.code, /appendFile\(archivoHistorial, `\$\{texto\}\\n`/);
  assert.match(app.code, /process\.argv\.slice\(2\)\.join\(" "\)\.trim\(\)/);
  assert.match(app.code, /Uso: node app\.js.*Tu nombre/);
  assert.match(app.code, /process\.exitCode = 1/);
  assert.match(app.code, /guardarSaludo\(saludo, \(error\)/);
  assert.equal(app.code.includes('?? "estudiante"'), false);
  assert.equal(app.code.includes("process.exit(1)"), false);

  const success = section.blocks.find((block) => block.key === "week01_programa_modular_success") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(success.rows.map((row) => row.value), ['node app.js "Ana Pérez"', "Hola, Ana Pérez", "Historial actualizado", "historial.txt contiene una nueva línea: Hola, Ana Pérez"]);
  const missing = section.blocks.find((block) => block.key === "week01_programa_modular_missing_name") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(missing.rows.slice(0, 2).map((row) => row.value), ["node app.js", 'Uso: node app.js "Tu nombre"']);
  assert.match(missing.rows[2].value, /código 1.*no recibe una línea nueva/);

  const reading = section.blocks.find((block) => block.key === "week01_programa_modular_reading") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(reading.items.map((item) => item.eyebrow), ["process.argv", "__dirname + path.join", "appendFile", "process.exitCode"]);
  assert.match(reading.items[0].body, /primeras dos posiciones.*slice\(2\).*varias palabras/);
  assert.match(reading.items[1].body, /no depende de la carpeta actual/);
  assert.match(reading.items[2].body, /crea historial\.txt.*agrega el texto al final/);

  const userChecks = section.blocks.find((block) => block.key === "week01_programa_modular_user_checks") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.equal(userChecks.items.length, 5);
  assert.match(`${userChecks.items.at(-1)?.title} ${userChecks.items.at(-1)?.body}`, /carpeta superior.*dentro del proyecto/);
  const readme = section.blocks.find((block) => block.key === "week01_programa_modular_readme") as ManifestBlock & { language: string; code: string };
  assert.equal(readme.language, "markdown");
  assert.match(readme.code, /node app\.js.*Ana Pérez/);
  assert.match(readme.code, /historial\.txt/);

  const diagnostics = section.blocks.find((block) => block.key === "week01_programa_modular_diagnostics") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(diagnostics.items.map((item) => item.eyebrow), ["MODULE_NOT_FOUND", "SALUDO INCOMPLETO", "EACCES O EPERM", "HISTORIAL INESPERADO"]);
  assert.match(diagnostics.items[2].body, /no eleves privilegios ni desactives protecciones/);

  const question = section.blocks.at(-2) as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; options: Array<{ key: string; label: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_programa_modular_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "single");
  assert.match(question.prompt, /process\.argv\.slice\(2\)\.join/);
  assert.deepEqual(question.options.map((option) => option.key), ["name", "script", "command"]);
  assert.deepEqual(question.options.map((option) => option.label), ["Ana Pérez", "app.js", "node app.js"]);
  assert.deepEqual(question.correctOptionKeys, ["name"]);

  const checklist = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; items: Array<{ label: string }> };
  assert.equal(checklist.activityKey, "week01_programa_modular_checklist");
  assert.equal(checklist.required, true);
  assert.equal(checklist.items.length, 6);
  assert.equal(checklist.items.some((item) => /Git|GitHub|commit/i.test(item.label)), false);
  assert.equal(checklist.items.every((item) => /terminal|app\.js|historial\.txt|README\.md|saludos\.js|historial\.js/.test(item.label)), true);

  const serialized = JSON.stringify(section);
  for (const absent of ["Provocá un error controlado", "versión final está registrada en Git", '?? \\"estudiante\\"']) assert.equal(serialized.includes(absent), false, `Sobra: ${absent}`);
});

test("los errores frecuentes enseñan una investigación reproducible y contextualizada", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "13-errores-frecuentes");
  assert.ok(section);
  assert.equal(section.title, "Errores que probablemente vas a encontrar");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "steps", "cards", "code", "terminal", "code", "terminal", "cards", "code", "cards", "code", "code", "cards", "question"]);
  assert.equal(section.blocks.some((block) => block.type === "rich_text" || block.type === "checklist" || block.type === "image"), false);

  const routine = section.blocks.find((block) => block.key === "week01_errores_frecuentes_routine") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(routine.items.map((item) => item.title), ["Reproducí", "Conservá el mensaje completo", "Ubicá la primera referencia propia", "Escribí una hipótesis", "Cambiá una sola cosa", "Repetí y compará"]);
  assert.match(routine.items[2].body, /primer archivo de tu proyecto.*línea y columna/);
  assert.match(routine.items[4].body, /ajuste mínimo.*Guardá/);

  const anatomy = section.blocks.find((block) => block.key === "week01_errores_frecuentes_anatomy") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(anatomy.items.map((item) => item.eyebrow), ["CLASE + MENSAJE", "ARCHIVO:LÍNEA:COLUMNA", "error.code", "STACK, RUTA O REQUIRE STACK"]);
  assert.match(anatomy.items[2].body, /MODULE_NOT_FOUND.*ENOENT.*EPERM.*más estable/);
  assert.match(anatomy.items[3].body, /require stack.*error\.path/);

  const broken = section.blocks.find((block) => block.key === "week01_errores_frecuentes_broken_module") as ManifestBlock & { language: string; code: string };
  const fixed = section.blocks.find((block) => block.key === "week01_errores_frecuentes_fixed_module") as ManifestBlock & { language: string; code: string };
  assert.equal(broken.language, "javascript");
  assert.equal(fixed.language, "javascript");
  assert.match(broken.code, /require\("saludos"\)/);
  assert.equal(broken.code.replace('require("saludos")', 'require("./saludos")'), fixed.code);

  const failure = section.blocks.find((block) => block.key === "week01_errores_frecuentes_module_failure") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(failure.rows.map((row) => row.label), ["Comando", "Clase y mensaje", "Código", "Primera pista propia", "Hipótesis"]);
  assert.equal(failure.rows[1].value, "Error: Cannot find module 'saludos'");
  assert.equal(failure.rows[2].value, "MODULE_NOT_FOUND");
  assert.match(failure.rows[3].value, /Require stack.*app\.js/);
  assert.match(failure.rows[4].value, /vecino.*paquete/);

  const success = section.blocks.find((block) => block.key === "week01_errores_frecuentes_module_success") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(success.rows.slice(0, 2).map((row) => row.value), ["node app.js", "Hola, Ana"]);
  assert.match(success.rows[2].value, /confirma la hipótesis.*no fue necesario reinstalar/);

  const map = section.blocks.find((block) => block.key === "week01_errores_frecuentes_map") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(map.items.map((item) => item.eyebrow), ["SyntaxError", "ReferenceError", "TypeError", "MODULE_NOT_FOUND", "ENOENT", "EACCES / EPERM"]);
  assert.match(map.items[0].body, /línea anterior.*comilla, llave o paréntesis/);
  assert.match(map.items[2].body, /typeof.*exportado.*desestructurado/);
  assert.match(map.items[4].body, /error\.path.*appendFile.*carpeta padre/);
  assert.match(map.items[5].body, /No ejecutes como administrador ni desactives protecciones/);

  const callback = section.blocks.find((block) => block.key === "week01_errores_frecuentes_callback") as ManifestBlock & { code: string };
  assert.match(callback.code, /guardarSaludo\(saludo, \(error\)/);
  assert.match(callback.code, /error\.code/);
  assert.match(callback.code, /error\.path/);
  assert.match(callback.code, /process\.exitCode = 1/);
  const channels = section.blocks.find((block) => block.key === "week01_errores_frecuentes_channels") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(channels.items.map((item) => item.eyebrow), ["ANTES DE EJECUTAR", "DURANTE JAVASCRIPT", "AL COMPLETAR LA OPERACIÓN"]);
  assert.match(channels.items[2].body, /dentro de la callback.*try\/catch.*no captura/);

  const trace = section.blocks.find((block) => block.key === "week01_errores_frecuentes_trace") as ManifestBlock & { code: string };
  assert.match(trace.code, /\[1\] nombre recibido/);
  assert.match(trace.code, /\[2\] saludo creado/);
  assert.match(trace.code, /\[3\] callback/);
  const log = section.blocks.find((block) => block.key === "week01_errores_frecuentes_log") as ManifestBlock & { code: string };
  for (const field of ["Comando exacto", "Primer mensaje útil", "Código de error", "Primer archivo y línea", "Hipótesis concreta", "Único cambio realizado", "Resultado al repetir"]) assert.match(log.code, new RegExp(field));

  const help = section.blocks.find((block) => block.key === "week01_errores_frecuentes_help") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(help.items.map((item) => item.eyebrow), ["COMPARTÍ", "EVITÁ"]);
  assert.match(help.items[0].body, /node app\.js.*MODULE_NOT_FOUND.*agregar \.\//);
  assert.match(help.items[1].body, /No funciona.*no identifica comando/);

  const question = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; options: Array<{ key: string; label: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_errores_frecuentes_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "single");
  assert.equal(question.prompt, '`require("operaciones")` falla aunque `operaciones.js` está junto a `app.js`. ¿Qué revisarías primero?');
  assert.deepEqual(question.options.map((option) => option.key), ["dot", "reinstall", "rename"]);
  assert.deepEqual(question.options.map((option) => option.label), ["Agregar ./ a la ruta", "Reinstalar Node.js", "Cambiar el nombre de app.js"]);
  assert.deepEqual(question.correctOptionKeys, ["dot"]);

  const serialized = JSON.stringify(section);
  for (const absent of ["await inválido", "JSON.parse", "Puedo investigar sin adivinar"]) assert.equal(serialized.includes(absent), false, `Sobra: ${absent}`);
});

test("Git local prepara, inspecciona y verifica un commit sin anticipar el remoto", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "07-publica-primera-entrega");
  assert.ok(section);
  assert.equal(section.title, "Guardá una versión con Git");
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "cards", "steps", "code", "code", "code", "terminal", "code", "terminal", "cards", "code", "terminal", "cards", "question"]);
  assert.equal(section.blocks.some((block) => ["rich_text", "checklist", "image", "generator", "validator"].includes(block.type)), false);

  const model = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_model") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(model.items.map((item) => item.eyebrow), ["CARPETA DE TRABAJO", ".gitignore", "STAGING · INDEX", "COMMIT"]);
  assert.match(model.items[1].body, /historial\.txt.*\.env.*No borra/);
  assert.match(model.items[2].body, /git add.*contenido actual.*agregarlos otra vez/);
  assert.match(model.items[3].body, /exactamente lo preparado.*No incluye/);

  const journey = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["Probá el programa", "Definí qué ignorar", "Iniciá la rama main", "Prepará archivos explícitos", "Inspeccioná el staging", "Confirmá y verificá"]);
  assert.match(journey.items[3].body, /\.gitignore.*README\.md.*tres archivos JavaScript/);

  const gitignore = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_gitignore") as ManifestBlock & { language: string; code: string };
  assert.equal(gitignore.language, "text");
  assert.equal(gitignore.code, "node_modules/\n.env\n*.log\nhistorial.txt");
  const readme = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_readme") as ManifestBlock & { language: string; code: string };
  assert.equal(readme.language, "markdown");
  assert.match(readme.code, /Programa modular de saludos/);
  assert.match(readme.code, /node app\.js.*Ana Pérez/);
  assert.match(readme.code, /historial\.txt/);

  const preflight = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_preflight") as ManifestBlock & { code: string };
  assert.deepEqual(preflight.code.split("\n"), ["pwd", "ls", 'node app.js "Ana Pérez"', "git init -b main", "git status --short"]);
  assert.equal(preflight.code.includes("node app.js\ngit"), false);
  const untracked = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_untracked") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(untracked.rows.slice(1, 6).map((row) => row.value), ["?? .gitignore", "?? README.md", "?? app.js", "?? saludos.js", "?? historial.js"]);
  assert.match(untracked.rows.at(-1)?.value || "", /historial\.txt no aparece.*\.gitignore/);

  const stage = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_stage") as ManifestBlock & { code: string };
  assert.deepEqual(stage.code.split("\n"), ["git add .gitignore README.md app.js saludos.js historial.js", "git status --short", "git diff --cached --stat", "git diff --cached"]);
  assert.equal(stage.code.split("\n").includes("git add ."), false);
  const staged = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_staged") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(staged.rows.slice(1, 6).map((row) => row.value), ["A  .gitignore", "A  README.md", "A  app.js", "A  saludos.js", "A  historial.js"]);
  assert.match(staged.rows.at(-1)?.value || "", /Sólo estos cinco archivos.*historial\.txt.*\.env.*node_modules/);

  const stageMeaning = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_stage_meaning") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(stageMeaning.items.map((item) => item.eyebrow), ["git status --short", "git diff --cached --stat", "git diff --cached", "SI APARECE :"]);
  assert.match(stageMeaning.items[2].body, /instantánea que registrará el commit.*secretos.*datos personales/);
  assert.match(stageMeaning.items[3].body, /Presioná q.*no cancela ni modifica/);

  const commit = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_commit") as ManifestBlock & { code: string };
  assert.deepEqual(commit.code.split("\n"), ['git commit -m "Completa programa modular"', "git log -1 --oneline", "git status --short"]);
  const result = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_commit_result") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(result.rows.slice(0, 2).map((row) => row.value), ["[main <hash>] Completa programa modular", "<hash> Completa programa modular"]);
  assert.match(result.rows[2].value, /Sin salida.*último commit/);
  assert.match(result.rows[3].value, /sólo.*local.*no hay remoto/i);

  const troubleshooting = section.blocks.find((block) => block.key === "week01_publica_primera_entrega_troubleshooting") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(troubleshooting.items.map((item) => item.eyebrow), ["not a git repository", "unknown switch `b`", "Author identity unknown", "ARCHIVO SENSIBLE PREPARADO", "historial.txt APARECE", "nothing to commit"]);
  assert.match(troubleshooting.items[1].body, /git init.*git branch -M main/);
  assert.match(troubleshooting.items[2].body, /git config --get user\.name.*git config --get user\.email/);
  assert.match(troubleshooting.items[3].body, /git restore --staged \.env.*permanece/);
  assert.match(troubleshooting.items[4].body, /git restore --staged historial\.txt.*no necesitás borrar/);

  const question = section.blocks.at(-1) as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; options: Array<{ key: string; label: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_publica_primera_entrega_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "single");
  assert.equal(question.prompt, "¿Qué registra `git commit`?");
  assert.deepEqual(question.options.map((option) => option.key), ["snapshot", "upload", "install"]);
  assert.deepEqual(question.options.map((option) => option.label), ["Una versión identificable de los cambios preparados", "La publicación automática en GitHub", "La instalación de las dependencias del proyecto"]);
  assert.deepEqual(question.correctOptionKeys, ["snapshot"]);

  const serialized = JSON.stringify(section);
  for (const absent of ["git push", "git remote", "origin/main", "entrega-semana-1", "git add .\\n"]) assert.equal(serialized.includes(absent), false, `Sobra: ${absent}`);
});

test("GitHub publica el commit existente y produce una evidencia reproducible", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "15-evidencia-avance");
  assert.ok(section);
  assert.equal(section.position, 13);
  assert.equal(section.title, "Publicá y verificá tu entrega");
  assert.match(section.summary, /commit local.*programa-modular-node.*visitante/);
  assert.deepEqual(section.blocks.map((block) => block.type), [
    "callout", "steps", "code", "terminal", "cards", "callout", "generator", "terminal", "code", "cards",
    "terminal", "image", "code", "terminal", "cards", "code", "validator", "cards", "callout", "checklist",
  ]);
  assert.equal(section.blocks.some((block) => block.type === "rich_text" || block.type === "question"), false);

  const journey = section.blocks.find((block) => block.key === "week01_evidencia_avance_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), ["Creá un destino vacío", "Conectá origin", "Publicá main", "Miralo como visitante"]);
  const localCheck = section.blocks.find((block) => block.key === "week01_evidencia_avance_local_check") as ManifestBlock & { code: string };
  assert.deepEqual(localCheck.code.split("\n"), ["git status --short", "git log -1 --oneline"]);
  const localReady = section.blocks.find((block) => block.key === "week01_evidencia_avance_local_ready") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.match(localReady.rows[0].value, /Sin salida/);
  assert.equal(localReady.rows[1].value, "<hash> Completa programa modular");

  const settings = section.blocks.find((block) => block.key === "week01_evidencia_avance_repository_settings") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(settings.items.map((item) => item.eyebrow), ["NOMBRE", "VISIBILIDAD", "INICIALIZACIÓN", "PROPIETARIO"]);
  assert.equal(settings.items[0].title, "programa-modular-node");
  assert.match(settings.items[1].body, /sin tu sesión/);
  assert.match(settings.items[2].body, /No agregues README.*\.gitignore.*licencia.*rechazo/);

  const generator = section.blocks.find((block) => block.type === "generator") as ManifestBlock & { key: string; title: string; description: string; variables: Array<{ key: string; inputType: string; required: boolean }>; template: string };
  assert.equal(generator.key, "week01_publica_primera_entrega_generate_remote");
  assert.equal(generator.title, "3 · Generá la conexión HTTPS");
  assert.match(generator.description, /programa-modular-node\.git.*no publica nada/);
  assert.deepEqual(generator.variables, [{ key: "repository_url", label: "URL del repositorio", inputType: "url", required: true }]);
  assert.equal(generator.template, "git remote add origin {{repository_url}}\ngit remote -v");
  const remoteReady = section.blocks.find((block) => block.key === "week01_evidencia_avance_remote_ready") as ManifestBlock & { rows: Array<{ value: string }> };
  assert.match(remoteReady.rows[1].value, /programa-modular-node\.git \(fetch\)/);
  assert.match(remoteReady.rows[2].value, /programa-modular-node\.git \(push\)/);

  const push = section.blocks.find((block) => block.key === "week01_evidencia_avance_first_push") as ManifestBlock & { code: string };
  assert.equal(push.code, "git push -u origin main");
  const auth = section.blocks.find((block) => block.key === "week01_evidencia_avance_auth") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(auth.items.map((item) => item.eyebrow), ["NAVEGADOR", "TERMINAL"]);
  assert.match(auth.items[0].body, /Git Credential Manager.*github\.com/);
  assert.match(auth.items[1].body, /No pegues contraseñas, tokens ni códigos de recuperación/);
  const pushResult = section.blocks.find((block) => block.key === "week01_evidencia_avance_push_result") as ManifestBlock & { rows: Array<{ value: string }> };
  assert.deepEqual(pushResult.rows.slice(1, 3).map((row) => row.value), ["main -> main", "branch 'main' set up to track 'origin/main'."]);

  const images = section.blocks.filter((block) => block.type === "image") as Array<ManifestBlock & { source: { assetId: string }; alt: string; caption: string }>;
  assert.equal(images.length, 1);
  assert.equal(images[0].source.assetId, "week01_evidencia_avance_image_2");
  assert.match(images[0].alt, /Completa programa modular.*mismo identificador/);
  assert.match(images[0].caption, /mismo commit.*identificador exacto.*diferente/);

  const verify = section.blocks.find((block) => block.key === "week01_evidencia_avance_verify_commands") as ManifestBlock & { code: string };
  assert.deepEqual(verify.code.split("\n"), ["git status -sb", "git log -1 --oneline", "git remote get-url origin"]);
  const verified = section.blocks.find((block) => block.key === "week01_evidencia_avance_verified") as ManifestBlock & { rows: Array<{ label: string; value: string }> };
  assert.deepEqual(verified.rows.slice(0, 3).map((row) => row.value), ["## main...origin/main", "<hash> Completa programa modular", "https://github.com/TU-USUARIO/programa-modular-node.git"]);
  assert.match(`${verified.rows[3].label} ${verified.rows[3].value}`, /\[ahead 1\].*git push/);

  const visitor = section.blocks.find((block) => block.key === "week01_evidencia_avance_visitor") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(visitor.items.map((item) => item.eyebrow), ["ENLACE RAÍZ", "CINCO ARCHIVOS", "README", "ÚLTIMO COMMIT"]);
  assert.match(visitor.items[0].body, /sin \.git.*sin \/blob\/main.*ventana privada/);
  assert.match(visitor.items[1].body, /\.gitignore.*README\.md.*app\.js.*saludos\.js.*historial\.js.*historial\.txt/);
  assert.match(visitor.items[2].body, /node app\.js.*Ana Pérez/);
  assert.match(visitor.items[3].body, /Completa programa modular.*git log -1 --oneline/);

  const validator = section.blocks.find((block) => block.type === "validator") as ManifestBlock & { key: string; activityKey: string; required: boolean; label: string; placeholder: string; helpText: string; rule: { kind: string; repositoryName: string } };
  assert.equal(validator.key, "week01_publica_primera_entrega_validate_repository");
  assert.equal(validator.activityKey, "week01_publica_primera_entrega_repository_url");
  assert.equal(validator.required, true);
  assert.deepEqual(validator.rule, { kind: "github_repository_url", repositoryName: "programa-modular-node" });
  assert.match(validator.helpText, /página principal.*no la URL \.git.*ventana privada/);

  const troubleshooting = section.blocks.find((block) => block.key === "week01_evidencia_avance_troubleshooting") as ManifestBlock & { items: Array<{ eyebrow: string; body: string }> };
  assert.deepEqual(troubleshooting.items.map((item) => item.eyebrow), ["remote origin already exists", "repository not found", "src refspec main", "push rejected"]);
  assert.match(troubleshooting.items[0].body, /git remote -v.*git remote set-url origin URL/);
  assert.match(troubleshooting.items[2].body, /git branch --show-current.*git log -1 --oneline/);
  assert.match(troubleshooting.items[3].body, /repositorio remoto realmente vacío.*No uses --force/);
  const secret = section.blocks.find((block) => block.key === "week01_evidencia_avance_secret") as ManifestBlock & { tone: string; title: string };
  assert.equal(secret.tone, "danger");
  assert.equal(secret.title, "Revocalo o rotalo antes de limpiar");

  const checklist = section.blocks.at(-1) as ManifestBlock & { key: string; activityKey: string; required: boolean; items: Array<{ key: string; label: string }> };
  assert.equal(checklist.key, "week01_evidencia_avance_checklist");
  assert.equal(checklist.activityKey, "week01_evidencia_avance_checklist");
  assert.equal(checklist.required, true);
  assert.deepEqual(checklist.items.map((item) => item.key), Array.from({ length: 6 }, (_, index) => `week01_evidencia_avance_check_${index + 1}`));
  assert.match(checklist.items[1].label, /\.gitignore.*README\.md.*app\.js.*saludos\.js.*historial\.js.*no contiene historial\.txt/);
  assert.match(checklist.items[5].label, /contraseñas.*tokens.*\.env.*logs.*dependencias/);

  const executableCode = section.blocks.filter((block) => block.type === "code").map((block) => (block as ManifestBlock & { code: string }).code).join("\n");
  assert.doesNotMatch(executableCode, /(^|\n)git (init|add|commit)( |$)/);
  const serialized = JSON.stringify(section);
  for (const absent of ["entrega-semana-1", "operaciones.js", "saludos.txt", "week01_evidencia_avance_image_1", "week01_publica_primera_entrega_image_"]) assert.equal(serialized.includes(absent), false, `Sobra: ${absent}`);
});

test("el cierre reconstruye capacidades, orienta el repaso y comprueba antes de concluir", () => {
  const section = manifest.sections.find((item) => item.sourceFolder === "14-cierre-glosario");
  assert.ok(section);
  assert.equal(section.position, 14);
  assert.equal(section.title, "Lo esencial de esta semana");
  assert.match(section.summary, /terminal preparada.*programa modular publicado.*qué repasar/);
  assert.deepEqual(section.blocks.map((block) => block.type), ["callout", "rich_text", "steps", "code", "cards", "cards", "glossary", "cards", "question", "checklist", "callout"]);
  assert.equal(section.blocks.some((block) => block.type === "image"), false);

  const retrieval = section.blocks.find((block) => block.key === "week01_cierre_glosario_retrieval");
  assert.ok(retrieval);
  assert.match(JSON.stringify(retrieval), /cerrá.*apuntes.*comando de ejecución.*tres archivos JavaScript.*último commit.*URL/);
  assert.match(JSON.stringify(retrieval), /diferencia no es un fracaso.*qué conexión conviene recuperar/);

  const journey = section.blocks.find((block) => block.key === "week01_cierre_glosario_journey") as ManifestBlock & { items: Array<{ title: string; body: string }> };
  assert.deepEqual(journey.items.map((item) => item.title), [
    "Preparaste un entorno observable", "Ejecutaste JavaScript con Node.js", "Seguiste el orden de ejecución",
    "Separaste responsabilidades", "Investigaste con evidencia", "Guardaste y publicaste una versión",
  ]);
  assert.match(journey.items[3].body, /app\.js.*saludos\.js.*historial\.js.*CommonJS/);
  assert.match(journey.items[5].body, /cinco archivos.*commit.*GitHub/);

  const project = section.blocks.find((block) => block.key === "week01_cierre_glosario_project_map") as ManifestBlock & { language: string; code: string };
  assert.equal(project.language, "text");
  for (const file of [".gitignore", "README.md", "app.js", "saludos.js", "historial.js", "historial.txt"]) assert.match(project.code, new RegExp(file.replace(".", "\\.")));
  assert.match(project.code, /historial\.txt.*localmente.*ignora/);

  const reference = section.blocks.find((block) => block.key === "week01_cierre_glosario_reference") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(reference.items.map((item) => item.eyebrow), [
    'node app.js "Ana Pérez"', "process.argv.slice(2)", 'require("./saludos")', "module.exports",
    "git status -sb", "git log -1 --oneline", "git remote -v", "git push",
  ]);
  assert.match(reference.items[0].body, /proceso.*argumentos.*saludo.*historial/);
  assert.match(reference.items[7].body, /commits.*localmente.*no reemplaza.*commit/);

  const contrasts = section.blocks.find((block) => block.key === "week01_cierre_glosario_contrasts") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(contrasts.items.map((item) => item.eyebrow), ["JAVASCRIPT / NODE.JS", "CALL STACK / EVENT LOOP", "EXPORTAR / IMPORTAR", "GIT / GITHUB", "MENSAJE / CAUSA"]);
  assert.deepEqual(contrasts.items.map((item) => item.title), ["Lenguaje y runtime", "Ejecución y coordinación", "Ofrecer y consumir", "Historia local y alojamiento remoto", "Síntoma e hipótesis"]);
  assert.match(contrasts.items[1].body, /call stack.*event loop.*no ejecuta dos fragmentos/);
  assert.match(contrasts.items[4].body, /mensaje.*causa.*hipótesis.*prueba controlada/);

  const glossary = section.blocks.find((block) => block.key === "week01_cierre_glosario_glossary") as ManifestBlock & { items: Array<{ term: string; definition: string }> };
  assert.deepEqual(glossary.items.map((item) => item.term), ["Runtime", "Proceso", "Argumento", "Callback", "Event loop", "Módulo", "CommonJS", "Repositorio", "Staging", "Commit", "Remoto", "Push"]);
  assert.equal(glossary.items.length, 12);
  assert.match(glossary.items.find((item) => item.term === "Staging")?.definition || "", /contenido.*próximo commit/);
  assert.match(glossary.items.find((item) => item.term === "Remoto")?.definition || "", /origin.*semana/);

  const revisit = section.blocks.find((block) => block.key === "week01_cierre_glosario_revisit") as ManifestBlock & { items: Array<{ eyebrow: string; title: string; body: string }> };
  assert.deepEqual(revisit.items.map((item) => item.eyebrow), ["COMANDO NO RECONOCIDO", "ENTRADA O SALIDA INESPERADA", "ORDEN DIFÍCIL DE PREDECIR", "MODULE_NOT_FOUND O EXPORTACIÓN AUSENTE", "LOCAL Y GITHUB NO COINCIDEN"]);
  assert.match(revisit.items[0].body, /Conocé la terminal.*Instalá Node\.js.*Instalá Git.*versión/);
  assert.match(revisit.items[3].body, /\.\/.*module\.exports.*primer mensaje útil.*una sola causa/);
  assert.match(revisit.items[4].body, /git status -sb.*git log -1 --oneline.*git push/);

  const question = section.blocks.find((block) => block.key === "week01_cierre_glosario_question") as ManifestBlock & { activityKey: string; required: boolean; questionKind: string; prompt: string; options: Array<{ key: string; label: string }>; correctOptionKeys: string[] };
  assert.equal(question.activityKey, "week01_cierre_glosario_question");
  assert.equal(question.required, true);
  assert.equal(question.questionKind, "multiple");
  assert.equal(question.prompt, "Seleccioná las relaciones correctas.");
  assert.deepEqual(question.options.map((option) => option.key), ["runtime", "github", "commit", "module"]);
  assert.deepEqual(question.options.map((option) => option.label), ["Node.js es un runtime para JavaScript", "GitHub reemplaza a Git en la computadora", "Un commit registra una versión del proyecto", "Un módulo ayuda a separar responsabilidades"]);
  assert.deepEqual(question.correctOptionKeys, ["runtime", "commit", "module"]);

  const checklist = section.blocks.find((block) => block.key === "week01_cierre_glosario_checklist") as ManifestBlock & { activityKey: string; required: boolean; description: string; items: Array<{ key: string; label: string }> };
  assert.equal(checklist.activityKey, "week01_cierre_glosario_checklist");
  assert.equal(checklist.required, false);
  assert.match(checklist.description, /opcional.*decidir qué repasar.*evidencias/);
  assert.deepEqual(checklist.items.map((item) => item.key), Array.from({ length: 5 }, (_, index) => `week01_cierre_glosario_check_${index + 1}`));
  assert.match(checklist.items[0].label, /node app\.js.*Ana Pérez.*de dónde obtiene/);
  assert.match(checklist.items[4].label, /estado.*último commit.*misma versión local y remota/);

  const completion = section.blocks.at(-1) as ManifestBlock & { key: string; tone: string; title: string };
  assert.equal(completion.key, "week01_cierre_glosario_completion");
  assert.equal(completion.tone, "success");
  assert.match(completion.title, /punto de partida.*comprobar/);

  const serialized = JSON.stringify(section);
  for (const absent of ["Paso 1", "Paso 2", "Idea 1", "Idea 2", "SEMANA 1 COMPLETADA", "NPM", "package.json", "paquetes externos", "Puedo explicar", "Predigo un ejemplo"]) assert.equal(serialized.includes(absent), false, `Sobra: ${absent}`);
});

test("preserva enlaces oficiales, epígrafes legibles y evita párrafos duplicados", () => {
  const links = new Set<string>();
  visit(manifest.sections, (value) => {
    if (value && typeof value === "object" && "href" in value && typeof value.href === "string") links.add(value.href);
    if (value && typeof value === "object" && "url" in value && typeof value.url === "string") links.add(value.url);
  });
  assert.equal([...links].some((href) => href.startsWith("https://nodejs.org/")), true);
  assert.equal([...links].some((href) => href.startsWith("https://git-scm.com/")), true);
  assert.equal([...links].some((href) => href.startsWith("https://github.com/")), true);

  for (const section of manifest.sections) {
    const richTexts = section.blocks.filter((block) => block.type === "rich_text").map((block) => JSON.stringify(block.content));
    assert.equal(new Set(richTexts).size, richTexts.length, `Hay texto enriquecido duplicado en ${section.sourceFolder}`);
  }
  for (const caption of manifest.sections.flatMap((section) => section.blocks).map((block) => block.caption).filter(Boolean) as string[])
    assert.doesNotMatch(caption, /^\d{2}\p{L}/u);
});

test("todos los medios tienen texto alternativo y archivos existentes", () => {
  assert.equal(manifest.assets.length, 27);
  for (const asset of manifest.assets) {
    assert.ok(asset.alt);
    assert.equal(existsSync(path.resolve(asset.sourcePath)), true, asset.sourcePath);
  }
});

test("incluye comprobaciones conceptuales autocorregibles en los puntos clave", () => {
  const questionFolders = manifest.sections.filter((section) => section.blocks.some((block) => block.type === "question")).map((section) => section.sourceFolder);
  assert.deepEqual(questionFolders, [
    "03-conoce-la-terminal",
    "08-que-hace-backend",
    "09-runtime-nodejs",
    "10-event-loop",
    "11-modulos",
    "12-programa-modular",
    "13-errores-frecuentes",
    "07-publica-primera-entrega",
    "14-cierre-glosario",
  ]);
  const questions = manifest.sections.flatMap((section) => section.blocks).filter((block) => block.type === "question");
  assert.equal(questions.length, 9);
  assert.equal(questions.every((block) => block.required), true);
  const kinds = new Set(questions.map((question) => (question as ManifestBlock & { questionKind: string }).questionKind));
  assert.deepEqual([...kinds].sort(), ["boolean", "multiple", "single"]);
});

test("las listas subjetivas son opcionales y las evidencias finales siguen siendo obligatorias", () => {
  for (const section of manifest.sections) {
    const checklists = section.blocks.filter((block) => block.type === "checklist");
    const shouldBeRequired = ["12-programa-modular", "15-evidencia-avance"].includes(section.sourceFolder);
    for (const checklist of checklists) assert.equal(checklist.required, shouldBeRequired, `${section.sourceFolder}: requisito inesperado`);
  }
});

test("unifica el proyecto como programa-modular-node y publica sólo después del commit local", () => {
  const publish = manifest.sections.find((section) => section.sourceFolder === "07-publica-primera-entrega");
  const evidence = manifest.sections.find((section) => section.sourceFolder === "15-evidencia-avance");
  assert.equal(publish?.title, "Guardá una versión con Git");
  assert.equal(evidence?.title, "Publicá y verificá tu entrega");
  assert.equal(JSON.stringify(manifest).includes("entrega-semana-1"), false);
  assert.equal(JSON.stringify(manifest).includes("programa-modular-node"), true);
  assert.equal(publish?.position, 12);
  assert.equal(evidence?.position, 13);
});

test("recrea validadores y generadores especiales de Node.js, Git y GitHub", () => {
  const byFolder = new Map(manifest.sections.map((section) => [section.sourceFolder, section.blocks]));
  assert.equal(byFolder.get("04-instala-nodejs")?.filter((block) => block.type === "validator").length, 2);
  assert.equal(byFolder.get("05-instala-git")?.some((block) => block.type === "generator"), true);
  assert.equal(byFolder.get("06-crea-cuenta-github")?.some((block) => block.type === "validator"), true);
  assert.equal(byFolder.get("15-evidencia-avance")?.some((block) => block.type === "generator"), true);
});
