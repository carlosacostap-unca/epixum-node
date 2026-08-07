"use strict";

const storageKey = "nodera-terminal-checkpoint";
const checkboxes = [...document.querySelectorAll("[data-check]")];
const title = document.getElementById("checkpoint-title");
const progress = document.getElementById("checkpoint-progress");
const completion = document.getElementById("completion");

function loadChecks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    checkboxes.forEach((checkbox, index) => { checkbox.checked = Boolean(saved[index]); });
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function renderChecks() {
  const values = checkboxes.map((checkbox) => checkbox.checked);
  const completed = values.filter(Boolean).length;
  checkboxes.forEach((checkbox) => checkbox.closest("label").classList.toggle("checked", checkbox.checked));
  title.textContent = `${completed} de ${checkboxes.length} capacidades confirmadas`;
  progress.style.width = `${(completed / checkboxes.length) * 100}%`;
  completion.hidden = completed !== checkboxes.length;
  try {
    localStorage.setItem(storageKey, JSON.stringify(values));
  } catch {
    // El sitio también funciona cuando el navegador no permite almacenamiento en archivos locales.
  }
}

checkboxes.forEach((checkbox) => checkbox.addEventListener("change", renderChecks));

document.getElementById("reset-progress").addEventListener("click", () => {
  checkboxes.forEach((checkbox) => { checkbox.checked = false; });
  renderChecks();
});

document.getElementById("copy-commands").addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  const commands = document.getElementById("guided-code").textContent;
  try {
    await navigator.clipboard.writeText(commands);
    status.textContent = "Comandos copiados.";
  } catch {
    status.textContent = "Seleccioná el bloque para copiarlo manualmente.";
  }
  window.setTimeout(() => { status.textContent = ""; }, 3000);
});

loadChecks();
renderChecks();
