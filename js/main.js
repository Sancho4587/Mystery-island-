import { createInventoryUI, DEFAULT_EQUIPMENT, normalizeEquipment } from "./inventory.js?v=20261010-rpg-bag";
import { createMovement } from "./movement.js?v=20261009";
import { drawTown } from "./town.js?v=20261009";
import { drawHome } from "./home.js?v=20261009";
/*
 * MYSTERY ISLAND: THE LOST KEYS
 * Main application entry point
 * Version 0.2
 */

const GAME_VERSION = "0.3.0";
const FIRST_CLUE = "Первый ключ спрятан там, где слышна вода.";

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

const panels = {
  backpack: document.getElementById("backpack-panel"),
  map: document.getElementById("map-panel"),
  menu: document.getElementById("menu-panel")
};

const messageBox = document.getElementById("game-message");

const game = {
  version: GAME_VERSION,
  running: true,
  location: "town",
  returnPosition: null,
  player: {
    x: 220,
    y: 180,
    stamina: 100,
    maxStamina: 100
  },

  equipment: { ...DEFAULT_EQUIPMENT },
  inventory: [
    { id: "water", name: "Вода", icon: "💧", quantity: 5, unit: "л" },
    { id: "food", name: "Еда", icon: "🥪", quantity: 8, unit: "порц." },
    { id: "map", name: "Карта", icon: "🗺️", quantity: 1, unit: "шт." },
    { id: "compass", name: "Компас", icon: "🧭", quantity: 1, unit: "шт." }
  ]
};

function resizeCanvas() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function showMessage(text) {
  messageBox.textContent = text;
}

function closePanels() {
  Object.values(panels).forEach(panel => {
    panel.classList.add("hidden");
  });

  game.running = true;
}

function openPanel(name) {
  closePanels();

  if (!panels[name]) return;

  panels[name].classList.remove("hidden");
  game.running = false;

  if (name === "backpack") {
    renderInventory();
  }

  if (name === "map") {
    renderMap();
  }
}

const inventoryUI = createInventoryUI({
  game,
  save: () => saveGame({ silent: true }),
  readNote: () => {
    closePanels();
    openStoryDialogue(FIRST_CLUE, { kind: "scroll", title: "Старая записка", returnPanel: "backpack" });
  },
  inspectKey: () => {
    closePanels();
    openStoryDialogue("Маленький ключ, найденный в углублении у фонтана благодаря старой записке.", {
      kind: "item", title: "Первый ключ", symbol: "🗝️", returnPanel: "backpack"
    });
  }
});

function renderInventory() {
  inventoryUI.render();
}

function getAdventureProgress() {
  const hasKey = game.inventory.some(item => item.id === "first-key");
  const hasNote = hasKey || game.inventory.some(item => item.id === "old-note");
  return {
    hasNote, hasKey,
    completed: hasKey ? 2 : hasNote ? 1 : 0,
    goal: hasKey ? "Первый ключ найден!" : hasNote ? "Разгадай записку" : "Осмотри семейный дом",
    detail: hasKey
      ? "Ты связала подсказку с шумом воды и нашла ключ у фонтана. Он сохранён в рюкзаке. Эта часть приключения завершена."
      : hasNote
        ? "Перечитай записку и найди в городе место, которое подходит под её описание."
        : "Начни с дома: подойди к сундуку и осмотри его.",
    steps: [
      { text: "Найти старую записку", done: hasNote },
      { text: hasKey ? "Найти первый ключ у фонтана" : "Разгадать записку", done: hasKey }
    ]
  };
}

function renderMap() {
  const container = document.getElementById("world-map-container");
  const progress = getAdventureProgress();
  container.replaceChildren();

  const location = document.createElement("p");
  location.className = "journal-location";
  location.textContent = "📍 " + (game.location === "homeInterior" ? "Семейный дом · Родной город" : "Родной город");

  const heading = document.createElement("h3");
  heading.textContent = "Первый ключ";
  const summary = document.createElement("p");
  summary.className = "journal-progress";
  summary.textContent = "Пройдено шагов: " + progress.completed + " из 2";

  const objective = document.createElement("section");
  objective.className = "journal-objective";
  const title = document.createElement("h4");
  title.textContent = progress.goal;
  const detail = document.createElement("p");
  detail.textContent = progress.detail;
  objective.append(title, detail);

  const steps = document.createElement("ol");
  steps.className = "journal-steps";
  progress.steps.forEach(step => {
    const row = document.createElement("li");
    row.className = step.done ? "complete" : "pending";
    row.textContent = (step.done ? "✓ " : "○ ") + step.text;
    steps.appendChild(row);
  });
  container.append(location, heading, summary, objective, steps);

  if (game.inventory.some(item => item.id === "old-note")) {
    const readNote = document.createElement("button");
    readNote.type = "button";
    readNote.className = "game-button journal-read";
    readNote.textContent = "📜 Перечитать записку";
    readNote.addEventListener("click", () => {
      closePanels();
      openStoryDialogue(FIRST_CLUE, { kind: "scroll", title: "Старая записка", returnPanel: "map" });
    });
    container.appendChild(readNote);
  }
}


function drawTemporaryWorld() {
  if (game.location === "homeInterior") {
    drawHome(context, canvas, game);
  } else {
    drawTown(context, canvas, game);
  }
}



function isNearHomeDoor() {
  if (game.location !== "town") {
    return false;
  }

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  const doorX = w * 0.20;
  const doorY = h * 0.34 + 48;

  const distance = Math.hypot(
    game.player.x - doorX,
    game.player.y - doorY
  );

  return distance <= 42;
}


const homeButton = document.createElement("button");
homeButton.type = "button";
homeButton.className = "game-button hidden";
homeButton.textContent = "🚪 Войти";

Object.assign(homeButton.style, {
  position: "absolute",
  left: "50%",
  bottom: "115px",
  transform: "translateX(-50%)",
  zIndex: "8",
  whiteSpace: "nowrap"
});

document.getElementById("game-screen").appendChild(homeButton);
homeButton.addEventListener("click", () => {
  if (game.location !== "town" || !isNearHomeDoor()) {
    return;
  }

  game.returnPosition = {
    x: game.player.x,
    y: game.player.y
  };

  movement.cancel();
  game.location = "homeInterior";
  game.player.x = canvas.clientWidth * 0.49;
  game.player.y = canvas.clientHeight * 0.82;

  homeButton.classList.add("hidden");
});

const transitionScreen = document.createElement("div");

transitionScreen.textContent = "⌛ Загрузка...";
Object.assign(transitionScreen.style, {
  position: "absolute",
  inset: "0",
  background: "rgba(8, 20, 17, 0.96)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  fontWeight: "bold",
  zIndex: "30",
  opacity: "0",
  visibility: "hidden",
  pointerEvents: "none",
  transition: "opacity 0.4s ease"
});

document.getElementById("game-screen")
  .appendChild(transitionScreen);

  

const movement = createMovement(canvas, context, game);

// Reusable in-game dialogue overlay. It pauses movement while the player reads.
const dialogueOverlay = document.createElement("div");
dialogueOverlay.className = "story-overlay hidden";
dialogueOverlay.setAttribute("role", "dialog");
dialogueOverlay.setAttribute("aria-modal", "true");
dialogueOverlay.setAttribute("aria-labelledby", "story-title");
dialogueOverlay.innerHTML = `
  <div class="story-card">
    <div class="story-content">
      <div class="story-symbol" aria-hidden="true">📜</div>
      <h2 id="story-title">Старая записка</h2>
      <p id="story-text"></p>
    </div>
    <div class="story-actions">
      <p class="story-status hidden"></p>
      <button class="game-button story-close" type="button">Понятно</button>
    </div>
  </div>`;
document.getElementById("game-screen").appendChild(dialogueOverlay);
const storyText = dialogueOverlay.querySelector("#story-text");
const storyClose = dialogueOverlay.querySelector(".story-close");
const storyStatus = dialogueOverlay.querySelector(".story-status");
const storyTitle = dialogueOverlay.querySelector("#story-title");
const storySymbol = dialogueOverlay.querySelector(".story-symbol");
let storyReturnPanel = null;
let storyPreviousFocus = null;
function closeStoryDialogue() {
  dialogueOverlay.classList.add("hidden");
  game.running = true;
  if (storyReturnPanel) {
    const panel = storyReturnPanel;
    storyReturnPanel = null;
    openPanel(panel);
    document.getElementById("close-" + panel).focus();
    return;
  }
  if (storyPreviousFocus && storyPreviousFocus.isConnected) storyPreviousFocus.focus();
}
storyClose.addEventListener("click", closeStoryDialogue);
function openStoryDialogue(text, { kind = "message", status = "", title = "Старая записка", symbol = "📜", returnPanel = null } = {}) {
  movement.cancel();
  storyPreviousFocus = document.activeElement;
  dialogueOverlay.dataset.location = game.location;
  dialogueOverlay.dataset.kind = kind;
  storyTitle.textContent = title;
  storySymbol.textContent = symbol;
  storyReturnPanel = returnPanel;
  storyStatus.textContent = status;
  storyStatus.classList.toggle("hidden", !status);
  storyText.textContent = text;
  showMessage("");
  game.running = false;
  dialogueOverlay.classList.remove("hidden");
  storyClose.focus();
}

// The first adventure clue: inspect the chest from nearby.
const chestButton = document.createElement("button");
chestButton.type = "button";
chestButton.className = "game-button hidden";
chestButton.textContent = "🔍 Осмотреть сундук";
Object.assign(chestButton.style, {
  position: "absolute",
  left: "50%",
  bottom: "115px",
  transform: "translateX(-50%)",
  zIndex: "8",
  whiteSpace: "nowrap"
});
document.getElementById("game-screen").appendChild(chestButton);

function isNearChest() {
  if (game.location !== "homeInterior") return false;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const chestX = w * 0.76;
  const chestY = h * 0.75;
  return Math.hypot(game.player.x - chestX, game.player.y - chestY) <= 85;
}

chestButton.addEventListener("click", () => {
  if (!game.running || !isNearChest()) return;
  movement.cancel();
  const hasClue = game.inventory.some(item => item.id === "old-note");
  if (!hasClue) {
    game.inventory.push({
      id: "old-note",
      name: "Старая записка",
      icon: "📜",
      quantity: 1,
      unit: "шт."
    });
    saveGame({ silent: true });
    openStoryDialogue(FIRST_CLUE, {
      kind: "scroll", status: "Записка добавлена в рюкзак!"
    });
  } else {
    openStoryDialogue(FIRST_CLUE, {
      kind: "scroll", status: "Записка уже лежит в рюкзаке."
    });
  }
});


// Follow the note to the fountain; quest progress is stored as inventory items.
const fountainButton = document.createElement("button");
fountainButton.type = "button";
fountainButton.className = "game-button hidden";
fountainButton.textContent = "🔍 Осмотреть фонтан";
fountainButton.style.cssText = chestButton.style.cssText;
document.getElementById("game-screen").appendChild(fountainButton);

function isNearFountain() {
  return game.location === "town" &&
    Math.hypot(game.player.x - canvas.clientWidth * 0.41,
      game.player.y - canvas.clientHeight * 0.75) <= 80;
}

fountainButton.addEventListener("click", () => {
  if (!game.running || !isNearFountain()) return;
  if (game.inventory.some(item => item.id === "first-key")) {
    openStoryDialogue("Ты уже нашла здесь первый ключ. Он лежит в рюкзаке.", {
      title: "Фонтан", symbol: "⛲"
    });
    return;
  }
  if (!game.inventory.some(item => item.id === "old-note")) {
    openStoryDialogue("Вода тихо журчит и переливается через каменный край фонтана.", {
      title: "Фонтан", symbol: "⛲"
    });
    return;
  }
  game.inventory.push({ id: "first-key", name: "Первый ключ", icon: "🗝️", quantity: 1, unit: "шт." });
  saveGame({ silent: true });
  openStoryDialogue("Записка привела тебя к шуму воды. Осмотрев каменный край фонтана, ты замечаешь в углублении маленький ключ.", {
    kind: "item", title: "Первый ключ найден!", symbol: "🗝️",
    status: "Ключ добавлен в рюкзак."
  });
});

// Automatic exit transition
  
let homeExitInProgress = false;

function exitFamilyHome() {
  if (homeExitInProgress || game.location !== "homeInterior") {
    return;
  }

  homeExitInProgress = true;
  chestButton.classList.add("hidden");
  movement.cancel();

  transitionScreen.style.visibility = "visible";
  transitionScreen.style.opacity = "1";

  setTimeout(() => {
    game.location = "town";

    const position = game.returnPosition;

    if (position) {
      game.player.x = position.x;
      game.player.y = position.y;
    }

    saveGame();

    transitionScreen.style.opacity = "0";

    setTimeout(() => {
      transitionScreen.style.visibility = "hidden";
      showMessage("Игра сохранена");

      setTimeout(() => {
        showMessage("");
      }, 2000);

      homeExitInProgress = false;
    }, 450);
  }, 450);
}
function isAtHomeExit() {
  if (game.location !== "homeInterior") {
    return false;
  }

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  return (
    Math.abs(game.player.x - w * 0.49) <= 34 &&
    game.player.y >= h * 0.90
  );
}

function gameLoop(timestamp) {
    movement.update(timestamp);
  chestButton.classList.toggle("hidden", !game.running || !isNearChest());
  fountainButton.classList.toggle("hidden", !game.running || !isNearFountain());
  if (game.location === "town") {
  homeButton.textContent = "🚪 Войти";
  homeButton.classList.toggle("hidden", !game.running || !isNearHomeDoor());
} else {
  homeButton.textContent = "🚪 Выйти";
  homeButton.classList.toggle("hidden", true);
}

if (
  game.running &&
  isAtHomeExit() &&
  !homeExitInProgress
) {
  exitFamilyHome();
}
if (game.running) {
  drawTemporaryWorld();
  movement.draw(timestamp);
}

  requestAnimationFrame(gameLoop);
}

function saveGame({ silent = false } = {}) {
  try {
    localStorage.setItem(
      "mystery-island-save",
      JSON.stringify({
        schemaVersion: 1,
        version: game.version,
        location: game.location,
        returnPosition: game.returnPosition,
        player: game.player,
        equipment: game.equipment,
        inventory: game.inventory
      })
    );

    if (!silent) showMessage("Игра сохранена.");
  } catch (error) {
    showMessage("Не удалось сохранить игру.");
    console.error(error);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem("mystery-island-save");
    if (!raw) return;

    const data = JSON.parse(raw);
    if (data.schemaVersion !== 1) return;

    if (
  data.location === "town" ||
  data.location === "homeInterior"
) {
  game.location = data.location;
}
if (
  data.returnPosition &&
  Number.isFinite(data.returnPosition.x) &&
  Number.isFinite(data.returnPosition.y)
) {
  game.returnPosition = {
    x: data.returnPosition.x,
    y: data.returnPosition.y
  };
}
    if (
      data.player &&
      Number.isFinite(data.player.x) &&
      Number.isFinite(data.player.y)
    ) {
      game.player = {
        ...game.player,
        ...data.player
      };
    }

    game.equipment = normalizeEquipment(data.equipment);

    if (Array.isArray(data.inventory)) {
      game.inventory = data.inventory;
    }
  } catch (error) {
    console.error("Save loading failed:", error);
  }
}

document.getElementById("btn-backpack").addEventListener(
  "click", () => openPanel("backpack")
);

document.getElementById("btn-map").addEventListener(
  "click", () => openPanel("map")
);

document.getElementById("btn-menu").addEventListener(
  "click", () => openPanel("menu")
);

document.getElementById("close-backpack").addEventListener(
  "click", closePanels
);

document.getElementById("close-map").addEventListener(
  "click", closePanels
);

document.getElementById("close-menu").addEventListener(
  "click", closePanels
);

document.getElementById("btn-save").addEventListener(
  "click", saveGame
);

document.getElementById("btn-save-exit").addEventListener(
  "click", () => {
    saveGame();
    movement.cancel();
    closePanels();
    game.running = false;
    showMessage("Прогресс сохранён. Можно закрыть игру.");
  }
);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
loadGame();
requestAnimationFrame(gameLoop);


