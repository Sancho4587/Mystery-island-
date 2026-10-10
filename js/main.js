import { createMovement } from "./movement.js?v=20261009";
import { drawTown } from "./town.js?v=20261009";
import { drawHome } from "./home.js?v=20261009";
/*
 * MYSTERY ISLAND: THE LOST KEYS
 * Main application entry point
 * Version 0.2
 */

const GAME_VERSION = "0.2.0";

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

function renderInventory() {
  const container = document.getElementById("inventory-container");
  container.replaceChildren();

  game.inventory.forEach(item => {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";

    const icon = document.createElement("span");
    icon.className = "item-icon";
    icon.textContent = item.icon;

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;

    const amount = document.createElement("span");
    amount.textContent = `${item.quantity} ${item.unit}`;

    slot.append(icon, name, amount);
    container.appendChild(slot);
  });
}

function renderMap() {
  const container = document.getElementById("world-map-container");

  container.textContent =
    "🗺️ Родной город — первая доступная локация. " +
    "Остальные территории откроются по мере исследования.";
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

function gameLoop(timestamp) {
  if (game.location === "town") {
  homeButton.textContent = "🚪 Войти";
  homeButton.classList.toggle("hidden", !isNearHomeDoor());
} else {
  homeButton.textContent = "🚪 Выйти";
  homeButton.classList.toggle("hidden", true);
}
  movement.update(timestamp);

if (game.running) {
  drawTemporaryWorld();
  movement.draw(timestamp);
}

  requestAnimationFrame(gameLoop);
}

function saveGame() {
  try {
    localStorage.setItem(
      "mystery-island-save",
      JSON.stringify({
        schemaVersion: 1,
        version: game.version,
        location: game.location,
        returnPosition: game.returnPosition,
        player: game.player,
        inventory: game.inventory
      })
    );

    showMessage("Игра сохранена.");
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
    closePanels();
    game.running = false;
    showMessage("Прогресс сохранён. Можно закрыть игру.");
  }
);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
loadGame();
requestAnimationFrame(gameLoop);


