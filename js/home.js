
/*
 * MYSTERY ISLAND: THE LOST KEYS
 * Family Home Interior
 * Version 0.7
 *
 * Independent visual location.
 * Movement and interactions are connected separately.
 */

export function drawHome(ctx, canvas, game) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  if (w <= 0 || h <= 0) return;

  const time = performance.now() / 1000;

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // Warm interior walls
  const wall = ctx.createLinearGradient(0, 0, 0, h * 0.40);
  wall.addColorStop(0, "#cda77b");
  wall.addColorStop(1, "#ead5ae");

  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);

  // Wooden floor
  const floorTop = h * 0.38;

  ctx.fillStyle = "#a9784c";
  ctx.fillRect(0, floorTop, w, h - floorTop);

  for (let y = floorTop; y < h; y += 22) {
    ctx.strokeStyle = "rgba(83,45,21,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  for (let x = 0; x < w; x += 65) {
    ctx.strokeStyle = "rgba(255,227,173,0.14)";
    ctx.beginPath();
    ctx.moveTo(x, floorTop);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Exposed wooden beams
  ctx.fillStyle = "#70452e";
  ctx.fillRect(0, h * 0.18, w, 13);
  ctx.fillRect(w * 0.08, 0, 13, floorTop);
  ctx.fillRect(w * 0.90, 0, 13, floorTop);

  // Windows
  drawWindow(ctx, w * 0.25, h * 0.24, w * 0.18, h * 0.15);
  drawWindow(ctx, w * 0.76, h * 0.24, w * 0.18, h * 0.15);

  // Fireplace with animated flames
  drawFireplace(ctx, w * 0.51, h * 0.29, Math.min(w * 0.18, 100), time);

  // Furniture in the room
  drawBed(ctx, w * 0.16, h * 0.55, w * 0.23, h * 0.14);
  drawBookshelf(ctx, w * 0.83, h * 0.49, w * 0.16, h * 0.16);
  drawTable(ctx, w * 0.49, h * 0.65, w * 0.24, h * 0.10);
  drawChest(ctx, w * 0.76, h * 0.75, w * 0.15, h * 0.08);

  // Rug
  ctx.fillStyle = "#ae5e52";
  ctx.beginPath();
  ctx.ellipse(w * 0.44, h * 0.83, w * 0.20, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#e7c18b";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Exit door at bottom
  drawExit(ctx, w * 0.49, h * 0.94);

  // Player
  drawHomePlayer(ctx, game.player.x, game.player.y);

  ctx.restore();
}

function drawWindow(ctx, x, y, w, h) {
  ctx.save();

  ctx.fillStyle = "#754a31";
  ctx.fillRect(x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10);

  ctx.fillStyle = "#a5dcf3";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  ctx.fillStyle = "#b9d3a0";
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + h * 0.18);
  ctx.lineTo(x, y - h * 0.03);
  ctx.lineTo(x + w / 2, y + h * 0.19);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#70452e";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.stroke();

  // Curtains
  ctx.fillStyle = "#eac7a8";
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h / 2);
  ctx.lineTo(x - w / 2 + w * 0.23, y - h / 2);
  ctx.lineTo(x - w / 2 + w * 0.12, y + h / 2);
  ctx.lineTo(x - w / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h / 2);
  ctx.lineTo(x + w / 2 - w * 0.23, y - h / 2);
  ctx.lineTo(x + w / 2 - w * 0.12, y + h / 2);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawFireplace(ctx, x, y, w, time) {
  const h = w * 0.88;

  ctx.save();

  ctx.fillStyle = "#9b7154";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  ctx.fillStyle = "#46352b";
  ctx.fillRect(x - w * 0.35, y - h * 0.23, w * 0.70, h * 0.65);

  ctx.fillStyle = "#67412a";
  ctx.fillRect(x - w * 0.65, y - h * 0.54, w * 1.30, h * 0.15);

  ctx.strokeStyle = "#805737";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.23, y + h * 0.34);
  ctx.lineTo(x + w * 0.23, y + h * 0.34);
  ctx.stroke();

  // Flickering fire
  const flicker = Math.sin(time * 9) * 5;

  ctx.fillStyle = "#ef7430";
  ctx.beginPath();
  ctx.moveTo(x - 16, y + h * 0.34);
  ctx.quadraticCurveTo(x - 20, y - 9 - flicker, x, y - 21);
  ctx.quadraticCurveTo(x + 17, y - 6 + flicker, x + 15, y + h * 0.34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd15c";
  ctx.beginPath();
  ctx.moveTo(x - 7, y + h * 0.34);
  ctx.quadraticCurveTo(x - 7, y + 1, x, y - 9 + flicker * 0.4);
  ctx.quadraticCurveTo(x + 8, y + 3, x + 7, y + h * 0.34);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBed(ctx, x, y, w, h) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.13)";
  ctx.fillRect(x + 5, y + 7, w, h);

  ctx.fillStyle = "#704a32";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#f2dbc0";
  ctx.fillRect(x + 5, y + 5, w - 10, h - 10);

  ctx.fillStyle = "#a95c65";
  ctx.fillRect(x + 5, y + h * 0.43, w - 10, h * 0.43);

  ctx.fillStyle = "#fff2db";
  ctx.fillRect(x + 9, y + 8, w * 0.28, h * 0.25);

  ctx.restore();
}

function drawBookshelf(ctx, x, y, w, h) {
  ctx.save();

  ctx.fillStyle = "#68432c";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  for (let row = 0; row < 3; row++) {
    const shelfY = y - h / 2 + (row + 1) * h / 3;

    for (let i = 0; i < 6; i++) {
      const colors = ["#a75245", "#62826b", "#d1a15b", "#7188a7"];
      ctx.fillStyle = colors[(i + row) % colors.length];
      ctx.fillRect(
        x - w / 2 + 6 + i * (w - 12) / 6,
        shelfY - h / 3 + 7,
        Math.max(3, (w - 20) / 9),
        h / 3 - 9
      );
    }

    ctx.fillStyle = "#b68956";
    ctx.fillRect(x - w / 2, shelfY - 4, w, 6);
  }

  ctx.restore();
}

function drawTable(ctx, x, y, w, h) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(x + 5, y + h, w * 0.52, h * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#805133";
  ctx.fillRect(x - w * 0.30, y + h * 0.18, 10, h);
  ctx.fillRect(x + w * 0.23, y + h * 0.18, 10, h);

  ctx.fillStyle = "#ba8755";
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#70442d";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Bread on the family table
  ctx.fillStyle = "#d99e4e";
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawChest(ctx, x, y, w, h) {
  ctx.save();

  ctx.fillStyle = "#67432e";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  ctx.fillStyle = "#9c683f";
  ctx.fillRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8);

  ctx.strokeStyle = "#d4ae69";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, h - 8);

  ctx.fillStyle = "#e8c66c";
  ctx.fillRect(x - 4, y - 4, 8, 8);

  ctx.restore();
}

function drawExit(ctx, x, y) {
  const w = 72;
  const h = 39;

  ctx.save();

  ctx.fillStyle = "#65442f";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  ctx.strokeStyle = "#e5bf82";
  ctx.lineWidth = 3;
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);

  ctx.fillStyle = "#f6e6ca";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Выход", x, y + 5);

  ctx.restore();
}

function drawHomePlayer(ctx, x, y) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c83ff";
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

