"use strict";

const storageKey = "nodera-git-checkpoint";
const checkboxes = [...document.querySelectorAll("[data-check]")];

function safeText(value, fallback) {
  const clean = value.trim().replace(/[\r\n"]/g, " ").replace(/\s+/g, " ");
  return clean || fallback;
}

async function copyText(text, statusElement) {
  let copied = false;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      copied = true;
    } else {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      copied = document.execCommand("copy");
      helper.remove();
    }
  } catch {
    copied = false;
  }
  statusElement.textContent = copied ? "Copiado." : "Seleccioná el bloque para copiarlo manualmente.";
  window.setTimeout(() => { statusElement.textContent = ""; }, 3000);
}

function updateConfig() {
  const name = safeText(document.getElementById("student-name").value, "Tu Nombre");
  const email = safeText(document.getElementById("student-email").value, "tu-correo@ejemplo.com");
  document.getElementById("config-code").textContent = `git config --global user.name "${name}"\ngit config --global user.email "${email}"\ngit config --global init.defaultBranch main`;
}

document.getElementById("student-name").addEventListener("input", updateConfig);
document.getElementById("student-email").addEventListener("input", updateConfig);
document.getElementById("copy-config").addEventListener("click", () => copyText(document.getElementById("config-code").textContent, document.getElementById("config-status")));
document.getElementById("copy-query").addEventListener("click", () => copyText(document.getElementById("query-code").textContent, document.getElementById("query-status")));
document.querySelector("[data-copy]").addEventListener("click", (event) => {
  const temporary = document.createElement("span");
  temporary.className = "floating-status";
  event.currentTarget.parentElement.append(temporary);
  copyText(event.currentTarget.dataset.copy, temporary);
  window.setTimeout(() => temporary.remove(), 3200);
});

document.getElementById("git-version").addEventListener("input", (event) => {
  const value = event.target.value.trim();
  const feedback = document.getElementById("git-feedback");
  feedback.className = "";
  if (!value) { feedback.textContent = "Esperando una respuesta."; return; }
  if (/^git version \d+\.\d+\.\d+(?:\.windows\.\d+)?$/i.test(value)) {
    feedback.textContent = "✓ Git respondió correctamente.";
    feedback.className = "ok";
  } else {
    feedback.textContent = "La respuesta debería comenzar con “git version” y un número.";
    feedback.className = "error";
  }
});

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    checkboxes.forEach((checkbox, index) => { checkbox.checked = Boolean(saved[index]); });
  } catch { try { localStorage.removeItem(storageKey); } catch { /* almacenamiento no disponible */ } }
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

loadProgress();
renderProgress();
updateConfig();
