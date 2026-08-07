"use strict";

async function copyText(text, status) {
  let copied = false;
  try {
    if (navigator.clipboard) { await navigator.clipboard.writeText(text); copied = true; }
    else {
      const helper = document.createElement("textarea"); helper.value = text; helper.style.position = "fixed"; helper.style.opacity = "0";
      document.body.append(helper); helper.select(); copied = document.execCommand("copy"); helper.remove();
    }
  } catch { copied = false; }
  status.textContent = copied ? "Copiado." : "Seleccioná el bloque para copiarlo manualmente.";
  window.setTimeout(() => { status.textContent = ""; }, 3000);
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const text = document.getElementById(button.dataset.copyTarget).textContent;
    copyText(text, button.closest(".code-window").querySelector(".copy-status"));
  });
});

const remoteInput = document.getElementById("remote-url");
const remoteCode = document.getElementById("remote-code");
const remoteFeedback = document.getElementById("remote-feedback");
const copyRemote = document.getElementById("copy-remote");

function updateRemote() {
  const value = remoteInput.value.trim();
  const valid = /^https:\/\/github\.com\/[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/entrega-semana-1\.git$/i.test(value) && !value.includes("--");
  remoteFeedback.className = `remote-feedback${valid ? " ok" : value ? " error" : ""}`;
  remoteFeedback.textContent = valid ? "✓ La URL HTTPS tiene el formato esperado." : value ? "Revisá que sea HTTPS, pertenezca a GitHub y termine en /entrega-semana-1.git" : "Esperando una URL de GitHub.";
  remoteCode.textContent = `git remote add origin ${valid ? value : "https://github.com/TU-USUARIO/entrega-semana-1.git"}\ngit remote -v`;
  copyRemote.disabled = !valid;
}
remoteInput.addEventListener("input", updateRemote);
copyRemote.addEventListener("click", () => copyText(remoteCode.textContent, copyRemote.closest(".code-window").querySelector(".copy-status")));

const storageKey = "nodera-delivery-checkpoint";
const checkboxes = [...document.querySelectorAll("[data-check]")];
function loadProgress() { try { const saved = JSON.parse(localStorage.getItem(storageKey) || "[]"); checkboxes.forEach((box,index) => { box.checked = Boolean(saved[index]); }); } catch { /* sin almacenamiento */ } }
function renderProgress() {
  const values = checkboxes.map((box) => box.checked); const count = values.filter(Boolean).length;
  checkboxes.forEach((box) => box.closest("label").classList.toggle("checked", box.checked));
  document.getElementById("checkpoint-count").textContent = `${count} de ${checkboxes.length} puntos comprobados`;
  document.getElementById("checkpoint-progress").style.width = `${count / checkboxes.length * 100}%`;
  document.getElementById("completion").hidden = count !== checkboxes.length;
  try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch { /* el sitio sigue funcionando */ }
}
checkboxes.forEach((box) => box.addEventListener("change", renderProgress));
document.getElementById("reset-progress").addEventListener("click", () => { checkboxes.forEach((box) => { box.checked = false; }); renderProgress(); });
loadProgress(); renderProgress(); updateRemote();
