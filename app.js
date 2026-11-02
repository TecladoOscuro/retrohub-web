/* global RetroDB */

const CONSOLE_BY_EXT = {
  gb: "gb", gbc: "gb", gba: "gba",
  nes: "nes", sfc: "snes", smc: "snes",
  z64: "n64", v64: "n64", n64: "n64",
  nds: "nds"
};

// Repos de carátulas libretro-thumbnails por consola (nombradas como la ROM No-Intro)
const THUMB_REPO = {
  gb: "Nintendo_-_Game_Boy",
  gbc: "Nintendo_-_Game_Boy_Color",
  gba: "Nintendo_-_Game_Boy_Advance",
  nds: "Nintendo_-_Nintendo_DS",
  nes: "Nintendo_-_Nintendo_Entertainment_System",
  snes: "Nintendo_-_Super_Nintendo_Entertainment_System",
  n64: "Nintendo_-_Nintendo_64"
};

function coverUrl(rom) {
  const repo = THUMB_REPO[rom.console];
  if (!repo) return null;
  const name = rom.name.replace(/\.[^.]+$/, "");
  return `https://raw.githubusercontent.com/libretro-thumbnails/${repo}/master/Named_Boxarts/${encodeURIComponent(name)}.png`;
}

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
      alert(`Formato no soportado: ${file.name}\n(GB, GBC, GBA, NES, SNES, N64, NDS)`);
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
      <img class="cover" alt="" loading="lazy">
      <span class="badge ${rom.console}">${rom.console}</span>
      <span class="title"></span>
      <button class="play">▶ Jugar</button>
      <button class="del">Eliminar</button>`;
    const img = card.querySelector(".cover");
    const url = coverUrl(rom);
    if (url) {
      img.src = url;
      img.onerror = () => img.remove();
    } else {
      img.remove();
    }
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
