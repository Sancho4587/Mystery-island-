/*
 * MYSTERY ISLAND: THE LOST KEYS
 * Austrian storybook town map
 * Version 0.5
 */

export function drawTown(context, canvas, game) {
  const width = canvas.width;
  const height = canvas.height;

  const worldTop = 95;
  const worldBottom = height - 100;
  const worldHeight = worldBottom - worldTop;

  if (worldHeight <= 0) return;

  context.clearRect(0, 0, width, height);

  drawSky(context, width, worldTop);
  drawGround(context, width, worldTop, worldBottom);
  drawDistantHills(context, width, worldTop);
  drawPaths(context, worldTop, worldBottom);
  drawSquare(context, 235, worldTop + worldHeight * 0.54);
  drawFountain(context, 235, worldTop + worldHeight * 0.54);

  // Main cottage aligned with current collision rectangle:
  // x: 75, y: 110, width: 100, height: 85
  drawCottage(context, 75, 110, 100, 85, {
    roof: "#a4472c",
    wall: "#f1e4cf",
    wood: "#82552d",
    flowers: "#d94f8a"
  });

  // Decorative village shop
  drawCottage(context, width - 150, 120, 95, 78, {
    roof: "#9e5a30",
    wall: "#f4ead7",
    wood: "#7a4d28",
    flowers: "#e07b39"
  });
  drawSign(context, width - 102, 205, "Лавка");

  // Decorative stable
  drawStable(context, width - 170, worldBottom - 135, 125, 76);
  drawSign(context, width - 108, worldBottom - 50, "Конюшня");

  // Tree aligned with current collision circle:
  // x: 320, y: 210, radius: 28
  drawTree(context, 320, 210, 28);

  // Rock aligned with current collision circle:
  // x: 130, y: 340, radius: 24
  drawRock(context, 130, 340, 24);

  drawFlowerPatch(context, 208, worldTop + worldHeight * 0.36, 34, 20);
  drawFlowerPatch(context, 278, worldTop + worldHeight * 0.60, 36, 22);
  drawFlowerPatch(context, width - 95, worldBottom - 175, 30, 18);

  drawFence(context, 185, worldBottom - 90, 110);
  drawFence(context, width - 208, 215, 82);

  drawTownLabel(context, worldTop);
  drawPlayer(context, game.player.x, game.player.y);
}

function drawSky(context, width, worldTop) {
  const sky = context.createLinearGradient(0, 0, 0, worldTop + 30);
  sky.addColorStop(0, "#1f534f");
  sky.addColorStop(0.45, "#4f8f6b");
  sky.addColorStop(1, "#9ac68b");

  context.fillStyle = sky;
  context.fillRect(0, 0, width, worldTop + 30);
}

function drawGround(context, width, top, bottom) {
  const ground = context.createLinearGradient(0, top, 0, bottom);
  ground.addColorStop(0, "#8fbe7f");
  ground.addColorStop(0.55, "#8abc78");
  ground.addColorStop(1, "#78a966");

  context.fillStyle = ground;
  context.fillRect(0, top, width, bottom - top);
}

function drawDistantHills(context, width, worldTop) {
  context.save();

  context.beginPath();
  context.moveTo(0, worldTop + 28);
  context.quadraticCurveTo(width * 0.14, worldTop - 6, width * 0.28, worldTop + 22);
  context.quadraticCurveTo(width * 0.44, worldTop + 40, width * 0.56, worldTop + 10);
  context.quadraticCurveTo(width * 0.70, worldTop - 8, width * 0.83, worldTop + 18);
  context.quadraticCurveTo(width * 0.92, worldTop + 34, width, worldTop + 12);
  context.lineTo(width, worldTop + 72);
  context.lineTo(0, worldTop + 72);
  context.closePath();

  const hills = context.createLinearGradient(0, worldTop, 0, worldTop + 72);
  hills.addColorStop(0, "#648c61");
  hills.addColorStop(1, "#89af73");

  context.fillStyle = hills;
  context.fill();

  context.restore();
}

function drawPaths(context, top, bottom) {
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";

  context.strokeStyle = "#d9c39a";
  context.lineWidth = 26;
  context.beginPath();
  context.moveTo(130, bottom - 10);
  context.quadraticCurveTo(150, bottom - 70, 190, bottom - 105);
  context.quadraticCurveTo(215, bottom - 130, 235, bottom - 145);
  context.quadraticCurveTo(255, bottom - 160, 250, bottom - 205);
  context.quadraticCurveTo(245, bottom - 255, 222, top + 135);
  context.stroke();

  context.strokeStyle = "#c8b187";
  context.lineWidth = 12;
  context.beginPath();
  context.moveTo(130, bottom - 10);
  context.quadraticCurveTo(150, bottom - 70, 190, bottom - 105);
  context.quadraticCurveTo(215, bottom - 130, 235, bottom - 145);
  context.quadraticCurveTo(255, bottom - 160, 250, bottom - 205);
  context.quadraticCurveTo(245, bottom - 255, 222, top + 135);
  context.stroke();

  context.strokeStyle = "#d9c39a";
  context.lineWidth = 20;
  context.beginPath();
  context.moveTo(235, top + 205);
  context.quadraticCurveTo(282, top + 180, 330, top + 155);
  context.quadraticCurveTo(355, top + 138, 372, top + 118);
  context.stroke();

  context.strokeStyle = "#c8b187";
  context.lineWidth = 9;
  context.beginPath();
  context.moveTo(235, top + 205);
  context.quadraticCurveTo(282, top + 180, 330, top + 155);
  context.quadraticCurveTo(355, top + 138, 372, top + 118);
  context.stroke();

  context.strokeStyle = "#d9c39a";
  context.lineWidth = 19;
  context.beginPath();
  context.moveTo(222, top + 230);
  context.quadraticCurveTo(168, top + 218, 135, top + 188);
  context.quadraticCurveTo(120, top + 175, 114, top + 160);
  context.stroke();

  context.strokeStyle = "#c8b187";
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(222, top + 230);
  context.quadraticCurveTo(168, top + 218, 135, top + 188);
  context.quadraticCurveTo(120, top + 175, 114, top + 160);
  context.stroke();

  context.restore();
}

function drawSquare(context, x, y) {
  context.save();
  context.fillStyle = "rgba(205, 186, 150, 0.9)";
  context.beginPath();
  context.ellipse(x, y, 74, 50, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(150, 120, 90, 0.55)";
  context.lineWidth = 2;
  context.stroke();

  context.restore();
}

function drawFountain(context, x, y) {
  context.save();

  context.fillStyle = "#9f9384";
  context.beginPath();
  context.ellipse(x, y, 20, 13, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#76c6df";
  context.beginPath();
  context.ellipse(x, y, 14, 9, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#cfc7bd";
  context.fillRect(x - 3, y - 18, 6, 15);

  context.strokeStyle = "rgba(255,255,255,0.55)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x, y - 18);
  context.quadraticCurveTo(x + 3, y - 28, x, y - 34);
  context.stroke();

  context.restore();
}

function drawCottage(context, x, y, width, height, palette) {
  context.save();

  const roofHeight = height * 0.44;
  const wallHeight = height * 0.56;

  // shadow
  context.fillStyle = "rgba(0,0,0,0.12)";
  context.beginPath();
  context.ellipse(x + width * 0.55, y + height + 8, width * 0.55, 12, 0, 0, Math.PI * 2);
  context.fill();

  // roof
  context.beginPath();
  context.moveTo(x + 10, y + roofHeight);
  context.lineTo(x + width * 0.48, y);
  context.lineTo(x + width - 10, y + roofHeight);
  context.closePath();
  context.fillStyle = palette.roof;
  context.fill();

  context.strokeStyle = "#6f311d";
  context.lineWidth = 2;
  context.stroke();

  // walls
  context.fillStyle = palette.wall;
  context.fillRect(x + 10, y + roofHeight - 2, width - 20, wallHeight);

  context.strokeStyle = "#9d8765";
  context.strokeRect(x + 10, y + roofHeight - 2, width - 20, wallHeight);

  // timber strips
  context.strokeStyle = palette.wood;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x + 24, y + roofHeight - 2);
  context.lineTo(x + 24, y + roofHeight + wallHeight - 2);
  context.moveTo(x + width - 24, y + roofHeight - 2);
  context.lineTo(x + width - 24, y + roofHeight + wallHeight - 2);
  context.moveTo(x + 10, y + roofHeight + 20);
  context.lineTo(x + width - 10, y + roofHeight + 20);
  context.stroke();

  // door
  context.fillStyle = palette.wood;
  context.fillRect(x + width * 0.43, y + roofHeight + wallHeight - 28, 16, 28);

  // windows
  drawWindow(context, x + 24, y + roofHeight + 14, 16, 14);
  drawWindow(context, x + width - 40, y + roofHeight + 14, 16, 14);

  // flower boxes
  context.fillStyle = palette.flowers;
  context.fillRect(x + 22, y + roofHeight + 30, 20, 4);
  context.fillRect(x + width - 42, y + roofHeight + 30, 20, 4);

  context.restore();
}

function drawStable(context, x, y, width, height) {
  context.save();

  context.fillStyle = "rgba(0,0,0,0.12)";
  context.beginPath();
  context.ellipse(x + width * 0.55, y + height + 7, width * 0.55, 11, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.moveTo(x + 8, y + 26);
  context.lineTo(x + width * 0.5, y);
  context.lineTo(x + width - 8, y + 26);
  context.closePath();
  context.fillStyle = "#8e5a2f";
  context.fill();

  context.fillStyle = "#d7b98f";
  context.fillRect(x + 8, y + 24, width - 16, height - 24);

  context.strokeStyle = "#7b522e";
  context.lineWidth = 2;
  context.strokeRect(x + 8, y + 24, width - 16, height - 24);

  context.strokeStyle = "#7b522e";
  context.beginPath();
  context.moveTo(x + 26, y + 24);
  context.lineTo(x + 26, y + height);
  context.moveTo(x + width - 26, y + 24);
  context.lineTo(x + width - 26, y + height);
  context.stroke();

  context.fillStyle = "#6f4829";
  context.fillRect(x + width * 0.42, y + 45, 24, height - 45);

  context.restore();
}

function drawWindow(context, x, y, w, h) {
  context.save();
  context.fillStyle = "#8fd0f5";
  context.fillRect(x, y, w, h);
  context.strokeStyle = "#7a4f2b";
  context.lineWidth = 2;
  context.strokeRect(x, y, w, h);

  context.beginPath();
  context.moveTo(x + w / 2, y);
  context.lineTo(x + w / 2, y + h);
  context.moveTo(x, y + h / 2);
  context.lineTo(x + w, y + h / 2);
  context.stroke();

  context.restore();
}

function drawTree(context, x, y, radius) {
  context.save();

  context.fillStyle = "rgba(0,0,0,0.14)";
  context.beginPath();
  context.ellipse(x + 4, y + radius + 9, radius + 8, 11, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#7a5230";
  context.fillRect(x - 7, y + radius - 2, 14, 26);

  const crown = context.createRadialGradient(
    x - 8, y - 8, 6,
    x, y, radius + 15
  );
  crown.addColorStop(0, "#8dcb73");
  crown.addColorStop(0.6, "#5fa05b");
  crown.addColorStop(1, "#356b3e");

  context.fillStyle = crown;

  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.arc(x - 18, y + 6, radius * 0.72, 0, Math.PI * 2);
  context.arc(x + 18, y + 8, radius * 0.72, 0, Math.PI * 2);
  context.arc(x - 8, y - 16, radius * 0.62, 0, Math.PI * 2);
  context.arc(x + 11, y - 14, radius * 0.58, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

function drawRock(context, x, y, radius) {
  context.save();

  context.fillStyle = "rgba(0,0,0,0.12)";
  context.beginPath();
  context.ellipse(x + 3, y + radius + 5, radius + 6, 8, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#9c9ea2";
  context.beginPath();
  context.moveTo(x - radius, y + 4);
  context.quadraticCurveTo(x - radius + 6, y - radius + 2, x - 5, y - radius);
  context.quadraticCurveTo(x + radius - 4, y - radius + 4, x + radius, y + 2);
  context.quadraticCurveTo(x + radius - 1, y + radius - 2, x + 4, y + radius);
  context.quadraticCurveTo(x - radius + 4, y + radius - 2, x - radius, y + 4);
  context.fill();

  context.strokeStyle = "#787b80";
  context.lineWidth = 2;
  context.stroke();

  context.restore();
}

function drawFlowerPatch(context, x, y, width, height) {
  context.save();
  context.fillStyle = "rgba(81, 130, 70, 0.35)";
  context.beginPath();
  context.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  context.fill();

  const flowers = [
    { dx: -10, dy: -4, color: "#e8508f" },
    { dx: 0, dy: 2, color: "#ffd34e" },
    { dx: 12, dy: -3, color: "#7cd6ff" },
    { dx: -2, dy: -9, color: "#ff8a5c" },
    { dx: 8, dy: 9, color: "#f6f3ff" }
  ];

  for (const flower of flowers) {
    context.fillStyle = flower.color;
    context.beginPath();
    context.arc(x + flower.dx, y + flower.dy, 3, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawFence(context, x, y, width) {
  context.save();
  context.strokeStyle = "#8a6842";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + width, y);
  context.stroke();

  for (let i = 0; i <= width; i += 14) {
    context.beginPath();
    context.moveTo(x + i, y - 10);
    context.lineTo(x + i, y + 8);
    context.stroke();
  }

  context.restore();
}

function drawSign(context, x, y, text) {
  context.save();

  context.strokeStyle = "#73512d";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y + 20);
  context.stroke();

  context.fillStyle = "#e8d4a6";
  context.fillRect(x - 24, y - 16, 48, 18);
  context.strokeStyle = "#8a6a3b";
  context.strokeRect(x - 24, y - 16, 48, 18);

  context.fillStyle = "#5b4424";
  context.font = "11px sans-serif";
  context.textAlign = "center";
  context.fillText(text, x, y - 3);

  context.restore();
}

function drawTownLabel(context, worldTop) {
  context.save();

  context.fillStyle = "rgba(12, 52, 35, 0.36)";
  roundPanel(context, 14, worldTop + 10, 128, 32, 14);
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = "bold 18px sans-serif";
  context.fillText("Родной город", 24, worldTop + 31);

  context.restore();
}

function drawPlayer(context, x, y) {
  context.save();

  context.fillStyle = "rgba(0,0,0,0.18)";
  context.beginPath();
  context.ellipse(x, y + 12, 14, 6, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.arc(x, y, 13, 0, Math.PI * 2);
  context.fillStyle = "#167be0";
  context.fill();

  context.strokeStyle = "#ffffff";
  context.lineWidth = 3;
  context.stroke();

  context.beginPath();
  context.arc(x, y - 3, 3, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();

  context.restore();
}

function roundPanel(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
