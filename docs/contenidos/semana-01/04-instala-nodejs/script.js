"use strict";

const storageKey = "nodera-nodejs-checkpoint";
const checkboxes = [...document.querySelectorAll("[data-check]")];

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    checkboxes.forEach((checkbox, index) => { checkbox.checked = Boolean(saved[index]); });
  } catch {
    try { localStorage.removeItem(storageKey); } catch { /* almacenamiento no disponible */ }
  }
}

function renderProgress() {
  const values = checkboxes.map((checkbox) => checkbox.checked);
  const count = values.filter(Boolean).length;
  checkboxes.forEach((checkbox) => checkbox.closest("label").classList.toggle("checked", checkbox.checked));
  document.getElementById("checkpoint-count").textContent = `${count} de ${checkboxes.length} pasos completados`;
  document.getElementById("checkpoint-progress").style.width = `${(count / checkboxes.length) * 100}%`;
  document.getElementById("completion").hidden = count !== checkboxes.length;
  try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch { /* el sitio sigue funcionando */ }
}

checkboxes.forEach((checkbox) => checkbox.addEventListener("change", renderProgress));
document.getElementById("reset-progress").addEventListener("click", () => {
  checkboxes.forEach((checkbox) => { checkbox.checked = false; });
  renderProgress();
});

document.getElementById("copy-commands").addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  const commands = document.getElementById("verification-code").textContent;
  try {
    await navigator.clipboard.writeText(commands);
    status.textContent = "Comandos copiados.";
  } catch {
    status.textContent = "Seleccioná el bloque para copiarlo manualmente.";
  }
  window.setTimeout(() => { status.textContent = ""; }, 3000);
});

const versionPattern = /^v?\d+\.\d+\.\d+(?:[-+][0-9a-z.-]+)?$/i;
const nodeInput = document.getElementById("node-version");
const npmInput = document.getElementById("npm-version");

function validateVersion(input, feedback, name) {
  const value = input.value.trim();
  feedback.className = "";
  if (!value) {
    feedback.textContent = "Esperando una versión.";
    return false;
  }
  if (versionPattern.test(value)) {
    feedback.textContent = `✓ ${name} respondió correctamente.`;
    feedback.className = "ok";
    return true;
  }
  feedback.textContent = "Revisá la respuesta: debería ser un número de versión.";
  feedback.className = "error";
  return false;
}

function validateBoth() {
  const nodeOk = validateVersion(nodeInput, document.getElementById("node-feedback"), "Node.js");
  const npmOk = validateVersion(npmInput, document.getElementById("npm-feedback"), "npm");
  document.getElementById("ready-message").hidden = !(nodeOk && npmOk);
}

nodeInput.addEventListener("input", validateBoth);
npmInput.addEventListener("input", validateBoth);

loadProgress();
renderProgress();
validateBoth();
