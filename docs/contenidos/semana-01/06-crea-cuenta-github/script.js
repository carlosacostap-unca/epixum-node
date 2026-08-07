"use strict";

const storageKey = "nodera-github-checkpoint";
const checkboxes = [...document.querySelectorAll("[data-check]")];

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
  } catch { copied = false; }
  statusElement.textContent = copied ? "Copiado." : "Seleccioná el texto para copiarlo manualmente.";
  window.setTimeout(() => { statusElement.textContent = ""; }, 3000);
}

const userInput = document.getElementById("github-user");
const profileUrl = document.getElementById("profile-url");
const profileFeedback = document.getElementById("profile-feedback");
const copyProfile = document.getElementById("copy-profile");

function updateProfile() {
  const username = userInput.value.trim();
  const valid = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) && !username.includes("--");
  profileFeedback.className = `profile-feedback${username && !valid ? " error" : valid ? " ok" : ""}`;
  profileFeedback.textContent = valid
    ? "✓ El formato del enlace es válido. Confirmalo abriéndolo en GitHub."
    : username ? "Revisá el usuario: no puede tener espacios, guiones dobles ni guiones en los extremos." : "Usá solamente letras, números y guiones simples.";
  profileUrl.textContent = valid ? `https://github.com/${username}` : "https://github.com/TU-USUARIO";
  copyProfile.disabled = !valid;
}

userInput.addEventListener("input", updateProfile);
copyProfile.addEventListener("click", () => copyText(profileUrl.textContent, profileFeedback));
document.getElementById("copy-command").addEventListener("click", () => copyText(document.getElementById("email-command").textContent, document.getElementById("copy-status")));

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
updateProfile();
