/* global RetroDB */

const CONSOLE_BY_EXT = {
  gb: "gb", gbc: "gb", gba: "gba",
  nes: "nes", sfc: "snes", smc: "snes",
  z64: "n64", v64: "n64", n64: "n64"
};

const drop = document.getElementById("drop");
const fileInput = document.getElementById("file");
const libraryEl = document.getElementById("library");

// Pedir almacenamiento persistente (importante en iPad).
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((granted) => {
    console.log("Almacenamiento persistente:", granted);
  });
}

// Service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(console.error);
}

function detectConsole(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  return CONSOLE_BY_EXT[ext] || null;
}

async function addFiles(files) {
  for (const file of files) {
    const consoleId = detectConsole(file.name);
    if (!consoleId) {
      alert(`Formato no soportado: ${file.name}\n(GB, GBC, GBA, NES, SNES, N64)`);
      continue;
    }
    await RetroDB.add({ name: file.name, console: consoleId, blob: file });
  }
  render();
}

async function render() {
  const roms = await RetroDB.all();
  if (!roms.length) {
    libraryEl.innerHTML = '<p class="empty">Biblioteca vacía. Añade tu primera ROM.</p>';
    return;
  }
  libraryEl.innerHTML = "";
  for (const rom of roms) {
    const card = document.createElement("div");
    card.className = "game";
    const title = rom.name.replace(/\.[^.]+$/, "").replace(/[\[\(][^\)\]]*[\)\]]/g, "").trim();
    card.innerHTML = `
      <span class="badge ${rom.console}">${rom.console}</span>
      <span class="title"></span>
      <button class="play">▶ Jugar</button>
      <button class="del">Eliminar</button>`;
    card.querySelector(".title").textContent = title;
    card.querySelector(".play").onclick = () => {
      location.href = `play.html?id=${rom.id}`;
    };
    card.querySelector(".del").onclick = async () => {
      if (confirm(`¿Eliminar «${title}»?`)) {
        await RetroDB.remove(rom.id);
        render();
      }
    };
    libraryEl.appendChild(card);
  }
}

drop.onclick = () => fileInput.click();
fileInput.onchange = () => addFiles(fileInput.files);

drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
drop.ondragleave = () => drop.classList.remove("over");
drop.ondrop = (e) => {
  e.preventDefault();
  drop.classList.remove("over");
  addFiles(e.dataTransfer.files);
};

render();
