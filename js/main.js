import { createPlaytime } from "./playtime.js?v=20261011-time";
let playtime = null;
import { createCollision } from "./collision.js?v=20261010-keeper";
import { locationTasks, transitionPermission, completeTask, restoreProgress } from "./progression.js?v=20261010-keeper";
import { drawForest } from "./forest.js?v=20261010-keeper";
import { forestGatePosition, forestExitPosition } from "./world-layout.js?v=20261010-keeper";
import { getCarriedLoad, CARRY_LIMIT_KG, itemWeight, formatWeight } from "./weight.js?v=20261010-weight";
import { createInventoryUI, DEFAULT_EQUIPMENT, normalizeEquipment } from "./inventory.js?v=20261010-weight";
import { createMovement } from "./movement.js?v=20261010-keeper";
import { drawTown } from "./town.js?v=20261010-keeper";
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
  world: { forestGateOpen: false, forestVisited: false },
  progress: { completed: [], visited: ["town"] },
  player: {
    x: 220,
    y: 180,
    stamina: 100,
    maxStamina: 100,
    maxCarryWeight: CARRY_LIMIT_KG
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
  if (playtime?.blocked()) return;
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
    openStoryDialogue(FIRST_CLUE, { kind: "scroll", title: "Старая записка", status: "Вес: " + formatWeight(itemWeight({ id: "old-note" })), returnPanel: "backpack" });
  },
  inspectKey: () => {
    closePanels();
    openStoryDialogue("Маленький ключ, найденный у фонтана. На его головке выгравирован знак ели.", {
      kind: "item", title: "Первый ключ", symbol: "🗝️", status: "Вес: " + formatWeight(itemWeight({ id: "first-key" })), returnPanel: "backpack"
    });
  }
});

function renderInventory() {
  inventoryUI.render();
}

function getAdventureProgress() {
  const opened = game.world.forestGateOpen;
  const visited = game.world.forestVisited;
  const tasks = locationTasks(game, "town");
  const hasKey = tasks.find(task => task.id === "town-key").done;
  const hasNote = tasks.find(task => task.id === "town-note").done;
  return {
    hasNote, hasKey,
    completed: visited ? 4 : opened ? 3 : hasKey ? 2 : hasNote ? 1 : 0,
    goal: visited ? "Лесная поляна открыта" : opened ? "Войди в лес" : hasKey ? "Поговори с хранителем ворот" : hasNote ? "Разгадай записку" : "Осмотри семейный дом",
    detail: visited ? "Ты завершила основные дела города и добралась до поляны. Этот этап завершён. Дорожка с указателем ведёт обратно в город."
      : opened ? "Ворота открыты. Поговори с хранителем, чтобы отправиться в лес."
      : hasKey ? "Ты нашла ключ. Хранитель у ворот на правой стороне города поможет подготовиться к следующему этапу."
      : hasNote ? "Перечитай записку и найди в городе место, которое подходит под её описание."
      : "Начни с дома: подойди к сундуку и осмотри его.",
    steps: [
      { text: "Найти старую записку", done: hasNote },
      { text: hasKey ? "Найти первый ключ у фонтана" : "Разгадать записку", done: hasKey },
      { text: hasKey ? "Завершить дела города и открыть ворота" : "Найти применение ключу", done: opened },
      { text: opened ? "Добраться до лесной поляны" : "Открыть новую локацию", done: visited }
    ]
  };
}

function locationName() {
  return game.location === "forest" ? "Лесная поляна" : game.location === "homeInterior" ? "Семейный дом" : "Родной город";
}

function renderMap() {
  const container = document.getElementById("world-map-container");
  const progress = getAdventureProgress();
  container.replaceChildren();

  const location = document.createElement("p");
  location.className = "journal-location";
  location.textContent = "📍 " + locationName();

  const heading = document.createElement("h3");
  heading.textContent = "Первый ключ";
  const summary = document.createElement("p");
  summary.className = "journal-progress";
  summary.textContent = "Пройдено шагов: " + progress.completed + " из 4";

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
  } else if (game.location === "forest") {
    drawForest(context, canvas, game);
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

  if (!transitionPermission(game, "town", "homeInterior").allowed) return;

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
      <button class="game-button story-action hidden" type="button"></button>
      <button class="game-button story-close" type="button">Понятно</button>
    </div>
  </div>`;
document.getElementById("game-screen").appendChild(dialogueOverlay);
const storyText = dialogueOverlay.querySelector("#story-text");
const storyClose = dialogueOverlay.querySelector(".story-close");
const storyAction = dialogueOverlay.querySelector(".story-action");
let storyActionHandler = null;
const storyStatus = dialogueOverlay.querySelector(".story-status");
const storyTitle = dialogueOverlay.querySelector("#story-title");
const storySymbol = dialogueOverlay.querySelector(".story-symbol");
let storyReturnPanel = null;
let storyPreviousFocus = null;
function closeStoryDialogue() {
  dialogueOverlay.classList.add("hidden");
  storyActionHandler = null;
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
storyAction.addEventListener("click", () => {
  const action = storyActionHandler;
  closeStoryDialogue();
  if (action) action();
});
function openStoryDialogue(text, { kind = "message", status = "", title = "Старая записка", symbol = "📜", returnPanel = null, action = null, closeLabel = "Понятно" } = {}) {
  movement.cancel();
  storyPreviousFocus = document.activeElement;
  dialogueOverlay.dataset.location = game.location;
  dialogueOverlay.dataset.kind = kind;
  storyTitle.textContent = title;
  storySymbol.textContent = symbol;
  storyReturnPanel = returnPanel;
  storyClose.textContent = closeLabel;
  storyActionHandler = action?.run || null;
  storyAction.textContent = action?.label || "";
  storyAction.classList.toggle("hidden", !action);
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
    completeTask(game, "town-note");
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
  completeTask(game, "town-key");
  game.inventory.push({ id: "first-key", name: "Первый ключ", icon: "🗝️", quantity: 1, unit: "шт." });
  saveGame({ silent: true });
  openStoryDialogue("Записка привела тебя к шуму воды. Осмотрев каменный край фонтана, ты замечаешь в углублении маленький ключ со знаком ели.", {
    kind: "item", title: "Первый ключ найден!", symbol: "🗝️",
    status: "Ключ добавлен в рюкзак."
  });
});

// The first key opens a persistent route out of town.
const forestButton = document.createElement("button");
forestButton.type = "button";
forestButton.className = "game-button hidden";
forestButton.style.cssText = chestButton.style.cssText;
document.getElementById("game-screen").appendChild(forestButton);

function isNearForestPassage() {
  if (game.location !== "town" && game.location !== "forest") return false;
  const point = game.location === "town" ? forestGatePosition(canvas) : forestExitPosition(canvas);
  return Math.hypot(game.player.x - point.x, game.player.y - point.y) <= 65;
}

function enterForest() {
  if (game.location !== "town" || !isNearForestPassage()) return;
  if (!transitionPermission(game, "town", "forest").allowed) { speakToGatekeeper(); return; }
  movement.cancel();
  game.world.forestGateOpen = true;
  game.world.forestVisited = true;
  if (!game.progress.visited.includes("forest")) game.progress.visited.push("forest");
  game.location = "forest";
  const exit = forestExitPosition(canvas);
  game.player.x = exit.x;
  game.player.y = exit.y;
  saveGame({ silent: true });
}

function speakToGatekeeper() {
  const permission = transitionPermission(game, "town", "forest");
  if (!permission.allowed) {
    const pending = permission.pending.map(task => task.label.toLowerCase()).join("; ");
    const tasks = locationTasks(game, "town");
    openStoryDialogue("За воротами начинается лес. Давай сначала завершим важные дела в городе. Тебе осталось: " + pending + ". Я подожду тебя здесь!", {
      title: "Хранитель ворот", symbol: "🧙", kind: "keeper", closeLabel: "Я вернусь",
      status: "Основные дела города: " + tasks.filter(task => task.done).length + " из " + tasks.length,
      action: { label: "Посмотреть задания", run: () => openPanel("map") }
    });
    return;
  }
  if (!game.world.forestGateOpen) {
    openStoryDialogue("Ты завершила все важные дела в городе! Знак ели на твоём ключе подходит к замку. Теперь ты готова к следующему этапу путешествия.", {
      title: "Хранитель ворот", symbol: "🧙", kind: "keeper", closeLabel: "Останусь в городе",
      action: { label: "Открыть ворота", run: () => {
        if (game.location !== "town" || !isNearForestPassage()) return;
        if (!transitionPermission(game, "town", "forest").allowed) { speakToGatekeeper(); return; }
        game.world.forestGateOpen = true;
        saveGame({ silent: true });
        openStoryDialogue("Ворота открыты. В лесу тебя ждёт новая глава. Ты всегда можешь вернуться в город.", {
          title: "Хранитель ворот", symbol: "🧙", kind: "keeper", closeLabel: "Останусь в городе",
          action: { label: "Войти в лес", run: enterForest }
        });
      } }
    });
    return;
  }
  openStoryDialogue("Рад видеть тебя снова, путешественница! Путь в лес открыт. Возвращайся в город, когда захочешь.", {
    title: "Хранитель ворот", symbol: "🧙", kind: "keeper", closeLabel: "Останусь в городе",
    action: { label: "Войти в лес", run: enterForest }
  });
}

forestButton.addEventListener("click", () => {
  if (!game.running || !isNearForestPassage()) return;
  movement.cancel();
  if (game.location === "forest") {
    if (!transitionPermission(game, "forest", "town").allowed) return;
    game.location = "town";
    const gate = forestGatePosition(canvas);
    game.player.x = gate.x - 50;
    game.player.y = gate.y;
    saveGame({ silent: true });
    return;
  }
  speakToGatekeeper();
});

// Automatic exit transition
  
let homeExitInProgress = false;

function exitFamilyHome() {
  if (homeExitInProgress || game.location !== "homeInterior") {
    return;
  }

  if (!transitionPermission(game, "homeInterior", "town").allowed) return;

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

function updatePlayerStatus() {
  const load = getCarriedLoad(game);
  const label = document.getElementById("stamina-label");
  const stamina = Math.round(game.player.stamina);
  const text = "Выносливость: " + stamina + "%";
  if (label.textContent !== text) label.textContent = text;
  document.getElementById("stamina-meter").value = game.player.stamina;
  const status = document.getElementById("load-warning");
  const warning = load.excess > 0 ? "Перегруз +" + load.excess.toLocaleString("ru-RU", {maximumFractionDigits: 2}) + " кг"
    : game.player.stamina < 20 ? "Устала — остановись, чтобы отдохнуть" : "";
  if (status.textContent !== warning) status.textContent = warning;
}

function gameLoop(timestamp) {
  if (playtime?.blocked()) game.running = false;
    movement.update(timestamp);
  updatePlayerStatus();
  const locationLabel = document.getElementById("location-name");
  if (locationLabel.textContent !== locationName()) locationLabel.textContent = locationName();
  forestButton.textContent = game.location === "forest" ? "↩ В город" : "🧙 Поговорить с хранителем";
  forestButton.classList.toggle("hidden", !game.running || !isNearForestPassage());
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
        world: game.world,
        progress: game.progress,
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
  data.location === "homeInterior" ||
  data.location === "forest"
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

    game.world = {
      forestGateOpen: data.world?.forestGateOpen === true,
      forestVisited: data.world?.forestVisited === true && data.world?.forestGateOpen === true
    };
    if (game.location === "forest" && !game.world.forestGateOpen) {
      game.location = "town";
      const gate = forestGatePosition(canvas);
      game.player.x = gate.x - 50;
      game.player.y = gate.y;
    }
    game.player.maxStamina = 100;
    game.player.stamina = Number.isFinite(game.player.stamina) ? Math.max(0, Math.min(100, game.player.stamina)) : 100;
    game.player.maxCarryWeight = Number.isFinite(game.player.maxCarryWeight) && game.player.maxCarryWeight > 0
      ? game.player.maxCarryWeight : CARRY_LIMIT_KG;
    game.equipment = normalizeEquipment(data.equipment);

    if (Array.isArray(data.inventory)) {
      game.inventory = data.inventory;
    }
    restoreProgress(game, data.progress);
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

function restoreSafeTownPosition() {
  if (game.location !== "town") return;
  const collision = createCollision(canvas, game);
  if (!collision.isBlocked(game.player.x, game.player.y)) return;
  let nearest = null;
  let distance = Infinity;
  for (let y = 130; y <= canvas.clientHeight - 110; y += 16) {
    for (let x = 38; x <= canvas.clientWidth - 48; x += 16) {
      if (collision.isBlocked(x, y)) continue;
      const gap = Math.hypot(x - game.player.x, y - game.player.y);
      if (gap < distance) { nearest = { x, y }; distance = gap; }
    }
  }
  if (nearest) Object.assign(game.player, nearest);
}

resizeCanvas();
loadGame();
restoreSafeTownPosition();
playtime = createPlaytime({
  save: () => saveGame({ silent: true }),
  pause: () => { movement.cancel(); game.running = false; },
  resume: () => { game.running = Object.values(panels).every(p => p.classList.contains("hidden")) && dialogueOverlay.classList.contains("hidden"); },
  active: () => panels.menu.classList.contains("hidden") && (game.running || !panels.backpack.classList.contains("hidden") || !panels.map.classList.contains("hidden") || !dialogueOverlay.classList.contains("hidden")),
  canGoHome: () => ["town", "homeInterior"].includes(game.location),
  goHome: returnHome,
  sleep: () => { game.player.stamina = game.player.maxStamina; saveGame({ silent: true }); }
});
function returnHome() {
  if (!dialogueOverlay.classList.contains("hidden")) closeStoryDialogue();
  closePanels();
  if (!["town", "homeInterior"].includes(game.location)) return;
  movement.cancel();
  game.returnPosition = { x: 220, y: 180 };
  game.location = "homeInterior";
  game.player.x = canvas.clientWidth * 0.49;
  game.player.y = canvas.clientHeight * 0.82;
  drawTemporaryWorld();
  saveGame({ silent: true });
  showMessage("Ты дома. В меню можно выбрать «Отдохнуть до завтра».");
}
document.getElementById("btn-parents").onclick = () => playtime.openParents();
document.getElementById("btn-return-home").onclick = () => {
  if (!["town", "homeInterior"].includes(game.location)) { showMessage("Быстрое возвращение домой доступно в городе. Сначала вернись в город."); return; }
  closePanels();
  openStoryDialogue("Вернуться домой отдохнуть?", {title:"Дорога домой",symbol:"🏠",action:{label:"Вернуться домой",run:returnHome},closeLabel:"Остаться"});
};
document.getElementById("btn-rest").onclick = () => {
  if (game.location !== "homeInterior") { showMessage("Чтобы лечь спать, сначала вернись домой."); return; }
  playtime.finishDay();
};
requestAnimationFrame(gameLoop);
