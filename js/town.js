const TAU = Math.PI * 2;

export function drawTown(context, canvas, game) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const time = performance.now() * 0.001;

  context.clearRect(0, 0, width, height);

  drawSky(context, width, height);
  drawMountains(context, width, height);
  drawGround(context, width, height);
  drawRoads(context, width, height);
  drawVillageSquare(context, width, height, time);

  drawHouse(context, width * 0.20, height * 0.34, 1.05, {
    roof: "#9d4d36",
    wall: "#f4ead7",
    timber: "#8a5b3e",
    smoke: true
  });

  drawHouse(context, width * 0.64, height * 0.28, 0.92, {
    roof: "#8f4a2b",
    wall: "#f5e6cf",
    timber: "#7a5139",
    smoke: true,
    sign: "ЛАВКА"
  });

  drawStable(context, width * 0.77, height * 0.56, 0.95, time);

  drawTree(context, width * 0.52, height * 0.45, 1.12, time, "#69b85e");
  drawTree(context, width * 0.83, height * 0.36, 0.82, time + 0.8, "#5baa55");
  drawTree(context, width * 0.10, height * 0.48, 0.78, time + 1.5, "#6fbe67");
  drawPine(context, width * 0.90, height * 0.48, 0.82, time);
  drawPine(context, width * 0.07, height * 0.62, 0.72, time + 1);

  drawFlowerBed(context, width * 0.16, height * 0.52, 0.9);
  drawFlowerBed(context, width * 0.61, height * 0.40, 0.8);
  drawFlowerBed(context, width * 0.76, height * 0.70, 1.0);

  drawLamp(context, width * 0.46, height * 0.54, time);
  drawLamp(context, width * 0.59, height * 0.61, time);

  drawRock(context, width * 0.19, height * 0.63, 0.88);
  drawRock(context, width * 0.71, height * 0.47, 0.55);

  drawFountain(context, width * 0.41, height * 0.75, 1.0, time);
  drawBench(context, width * 0.28, height * 0.77, 0.9);
  drawBench(context, width * 0.52, height * 0.79, 0.9);

  drawPlayer(context, game.player, time);
}

function drawSky(ctx, width, height) {
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.34);
  sky.addColorStop(0, "#0e4338");
  sky.addColorStop(0.45, "#3f8f6f");
  sky.addColorStop(1, "#a8d79b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * 0.42);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, height * 0.22, width, height * 0.04);
}

function drawMountains(ctx, width, height) {
  ctx.fillStyle = "#86a56d";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.42);
  ctx.bezierCurveTo(
    width * 0.16, height * 0.34,
    width * 0.30, height * 0.42,
    width * 0.45, height * 0.39
  );
  ctx.bezierCurveTo(
    width * 0.58, height * 0.36,
    width * 0.72, height * 0.43,
    width, height * 0.39
  );
  ctx.lineTo(width, height * 0.58);
  ctx.lineTo(0, height * 0.58);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#78955f";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.50);
  ctx.bezierCurveTo(
    width * 0.18, height * 0.45,
    width * 0.34, height * 0.55,
    width * 0.52, height * 0.49
  );
  ctx.bezierCurveTo(
    width * 0.71, height * 0.44,
    width * 0.85, height * 0.54,
    width, height * 0.50
  );
  ctx.lineTo(width, height * 0.65);
  ctx.lineTo(0, height * 0.65);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, width, height) {
  const ground = ctx.createLinearGradient(0, height * 0.42, 0, height);
  ground.addColorStop(0, "#97c97f");
  ground.addColorStop(1, "#84bc71");
  ctx.fillStyle = ground;
  ctx.fillRect(0, height * 0.42, width, height * 0.58);
}

function drawRoads(ctx, width, height) {
  drawRoad(ctx, [
    [width * 0.40, height * 0.98],
    [width * 0.40, height * 0.80],
    [width * 0.40, height * 0.60]
  ], 28);

  drawRoad(ctx, [
    [width * 0.40, height * 0.60],
    [width * 0.24, height * 0.55],
    [width * 0.16, height * 0.48]
  ], 24);

  drawRoad(ctx, [
    [width * 0.40, height * 0.60],
    [width * 0.55, height * 0.51],
    [width * 0.61, height * 0.43]
  ], 24);
}

function drawRoad(ctx, points, size) {
  ctx.save();

  ctx.strokeStyle = "rgba(112, 82, 54, 0.12)";
  ctx.lineWidth = size + 10;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();

  ctx.strokeStyle = "#d9c095";
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = Math.max(4, size * 0.16);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();

  ctx.restore();
}

function drawVillageSquare(ctx, width, height, time) {
  const x = width * 0.42;
  const y = height * 0.74;
  const rx = width * 0.18;
  const ry = height * 0.10;

  ctx.save();
  ctx.fillStyle = "#ccb18a";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.05, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  for (let row = -3; row <= 3; row++) {
    for (let col = -6; col <= 6; col++) {
      const px = x + col * 15 + (row % 2) * 7;
      const py = y + row * 11 + Math.sin(time + row + col) * 0.3;
      if (Math.pow((px - x) / rx, 2) + Math.pow((py - y) / ry, 2) <= 0.96) {
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, TAU);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawHouse(ctx, x, y, scale, options = {}) {
  const w = 84 * scale;
  const h = 58 * scale;
  const roofH = 28 * scale;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.75, w * 0.56, h * 0.18, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = options.wall || "#f4ead7";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  ctx.strokeStyle = "#b88f71";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);

  ctx.fillStyle = options.roof || "#9d4d36";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.58, y - h / 2 + 8 * scale);
  ctx.lineTo(x, y - h / 2 - roofH);
  ctx.lineTo(x + w * 0.58, y - h / 2 + 8 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#7c3f2d";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = options.timber || "#8a5b3e";
  const timber = [
    [x - w * 0.30, y - h / 2, w * 0.08, h],
    [x + w * 0.22, y - h / 2, w * 0.08, h],
    [x - w / 2, y - h * 0.10, w, h * 0.08],
    [x - w / 2, y + h * 0.26, w, h * 0.08]
  ];
  timber.forEach(([tx, ty, tw, th]) => ctx.fillRect(tx, ty, tw, th));

  drawWindow(ctx, x - w * 0.22, y - h * 0.08, 14 * scale, 18 * scale);
  drawWindow(ctx, x + w * 0.20, y - h * 0.08, 14 * scale, 18 * scale);

  drawFlowerBox(ctx, x - w * 0.22, y + h * 0.07, 18 * scale);
  drawFlowerBox(ctx, x + w * 0.20, y + h * 0.07, 18 * scale);

  ctx.fillStyle = "#774d2f";
  ctx.fillRect(x - 8 * scale, y + h * 0.05, 16 * scale, h * 0.45);

  if (options.sign) {
    ctx.fillStyle = "#e8d7ae";
    roundRect(ctx, x - 22 * scale, y + h * 0.35, 44 * scale, 14 * scale, 4 * scale);
    ctx.fill();
    ctx.fillStyle = "#6e4b2d";
    ctx.font = `${Math.round(8 * scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(options.sign, x, y + h * 0.45);
  }

  if (options.label) {
    drawTinyLabel(ctx, x, y - h * 0.9 - roofH * 0.3, options.label);
  }

  if (options.smoke) {
    drawSmoke(ctx, x + w * 0.25, y - h / 2 - roofH * 0.45, scale);
  }

  ctx.restore();
}

function drawStable(ctx, x, y, scale, time) {
  const w = 92 * scale;
  const h = 48 * scale;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.13)";
  ctx.beginPath();
  ctx.ellipse(x, y + h * 0.78, w * 0.60, h * 0.20, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#8c6849";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  ctx.fillStyle = "#734d33";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.55, y - h / 2 + 6);
  ctx.lineTo(x, y - h / 2 - 22 * scale);
  ctx.lineTo(x + w * 0.55, y - h / 2 + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#a87c57";
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i * 16 * scale - 2, y - h / 2, 4, h);
  }

  ctx.fillStyle = "#5e3c28";
  ctx.fillRect(x - 14 * scale, y - h * 0.04, 28 * scale, h * 0.54);

  ctx.fillStyle = "#e8d7ae";
  roundRect(ctx, x - 28 * scale, y - h * 0.68, 56 * scale, 16 * scale, 4);
  ctx.fill();

  ctx.fillStyle = "#5e4028";
  ctx.font = `${Math.round(9 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("КОНЮШНЯ", x, y - h * 0.48);

  const horseShift = Math.sin(time * 2.1) * 1.2;
  drawHorseSilhouette(ctx, x + 26 * scale, y + 6 * scale + horseShift, 0.32 * scale);

  ctx.restore();
}

function drawHorseSilhouette(ctx, x, y, scale) {
  ctx.save();
  ctx.fillStyle = "#4e3626";
  ctx.beginPath();
  ctx.ellipse(x, y, 18 * scale, 10 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillRect(x - 5 * scale, y - 14 * scale, 8 * scale, 12 * scale);
  ctx.beginPath();
  ctx.moveTo(x + 1 * scale, y - 14 * scale);
  ctx.lineTo(x + 12 * scale, y - 21 * scale);
  ctx.lineTo(x + 14 * scale, y - 12 * scale);
  ctx.closePath();
  ctx.fill();

  [-10, -3, 5, 12].forEach((dx) => {
    ctx.fillRect(x + dx * scale, y + 6 * scale, 2.6 * scale, 14 * scale);
  });
  ctx.restore();
}

function drawWindow(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#8fd2ff";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.strokeStyle = "#6d4b35";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x + w / 2, y);
  ctx.stroke();
  ctx.restore();
}

function drawFlowerBox(ctx, x, y, w) {
  ctx.save();
  ctx.fillStyle = "#8a5b3d";
  ctx.fillRect(x - w / 2, y, w, 6);
  const colors = ["#ff6b7a", "#fdd35d", "#ff8cc6"];
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - w / 3 + i * (w / 3), y, 3, 0, TAU);
    ctx.fill();
  });
  ctx.restore();
}

function drawSmoke(ctx, x, y, scale) {
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const px = x + Math.sin(performance.now() * 0.0015 + i) * 4 * scale + i * 2;
    const py = y - i * 10 * scale;
    ctx.fillStyle = `rgba(255,255,255,${0.20 - i * 0.03})`;
    ctx.beginPath();
    ctx.arc(px, py, (6 + i * 2) * scale, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawTree(ctx, x, y, scale, time, color) {
  const sway = Math.sin(time * 1.6 + x * 0.02) * 3 * scale;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + 36 * scale, 30 * scale, 10 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#7d5234";
  ctx.fillRect(x - 7 * scale, y + 8 * scale, 14 * scale, 42 * scale);

  ctx.translate(sway, 0);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 28 * scale, 0, TAU);
  ctx.arc(x - 20 * scale, y + 8 * scale, 18 * scale, 0, TAU);
  ctx.arc(x + 18 * scale, y + 7 * scale, 16 * scale, 0, TAU);
  ctx.arc(x, y - 17 * scale, 18 * scale, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(x - 10 * scale, y - 8 * scale, 10 * scale, 0, TAU);
  ctx.fill();

  ctx.restore();
}

function drawPine(ctx, x, y, scale, time) {
  const sway = Math.sin(time * 1.8 + x * 0.03) * 2 * scale;
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + 26 * scale, 22 * scale, 8 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#6a472f";
  ctx.fillRect(x - 5 * scale, y + 8 * scale, 10 * scale, 28 * scale);

  ctx.translate(sway, 0);
  ctx.fillStyle = "#4f8d49";

  [
    { oy: -20, w: 34, h: 30 },
    { oy: -2, w: 42, h: 32 },
    { oy: 18, w: 50, h: 36 }
  ].forEach((part) => {
    ctx.beginPath();
    ctx.moveTo(x, y + part.oy * scale);
    ctx.lineTo(x - (part.w / 2) * scale, y + (part.oy + part.h) * scale);
    ctx.lineTo(x + (part.w / 2) * scale, y + (part.oy + part.h) * scale);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
}

function drawFlowerBed(ctx, x, y, scale) {
  ctx.save();

  ctx.fillStyle = "#6aa85a";
  ctx.beginPath();
  ctx.ellipse(x, y, 26 * scale, 12 * scale, 0, 0, TAU);
  ctx.fill();

  const colors = ["#ff6a6a", "#ffd45f", "#ff94dc", "#7fd0ff"];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * TAU;
    const px = x + Math.cos(angle) * 18 * scale;
    const py = y + Math.sin(angle) * 7 * scale;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(px, py, 3 * scale, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawFence(ctx, x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = "#8a643f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const posts = 6;
  for (let i = 0; i <= posts; i++) {
    const t = i / posts;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    ctx.strokeStyle = "#7a5536";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLamp(ctx, x, y, time) {
  const glow = 0.75 + Math.sin(time * 3 + x * 0.01) * 0.08;

  ctx.save();
  ctx.strokeStyle = "#5d4937";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 26);
  ctx.stroke();

  ctx.strokeStyle = "#5d4937";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 26);
  ctx.quadraticCurveTo(x + 10, y - 32, x + 14, y - 20);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 223, 130, ${0.45 * glow})`;
  ctx.beginPath();
  ctx.arc(x + 14, y - 18, 12, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#ffd35b";
  ctx.beginPath();
  ctx.arc(x + 14, y - 18, 5, 0, TAU);
  ctx.fill();

  ctx.restore();
}

function drawRock(ctx, x, y, scale) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + 26 * scale, 22 * scale, 8 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#9b9ca8";
  ctx.beginPath();
  ctx.moveTo(x - 18 * scale, y + 10 * scale);
  ctx.lineTo(x - 24 * scale, y - 8 * scale);
  ctx.lineTo(x - 8 * scale, y - 24 * scale);
  ctx.lineTo(x + 16 * scale, y - 16 * scale);
  ctx.lineTo(x + 22 * scale, y + 4 * scale);
  ctx.lineTo(x + 9 * scale, y + 22 * scale);
  ctx.lineTo(x - 11 * scale, y + 21 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#7e808c";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawFountain(ctx, x, y, scale, time) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + 26 * scale, 28 * scale, 10 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#c9b295";
  ctx.beginPath();
  ctx.ellipse(x, y, 30 * scale, 16 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#8fd4ff";
  ctx.beginPath();
  ctx.ellipse(x, y, 22 * scale, 10 * scale, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#b79774";
  ctx.fillRect(x - 5 * scale, y - 24 * scale, 10 * scale, 18 * scale);
  ctx.beginPath();
  ctx.arc(x, y - 27 * scale, 10 * scale, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = `rgba(170, 235, 255, ${0.5 + Math.sin(time * 4) * 0.1})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 25 * scale);
  ctx.lineTo(x, y - 6 * scale);
  ctx.stroke();

  ctx.restore();
}

function drawBench(ctx, x, y, scale) {
  ctx.save();
  ctx.fillStyle = "#7a5536";
  ctx.fillRect(x - 18 * scale, y - 8 * scale, 36 * scale, 6 * scale);
  ctx.fillRect(x - 18 * scale, y, 36 * scale, 5 * scale);
  ctx.fillRect(x - 14 * scale, y - 10 * scale, 4 * scale, 20 * scale);
  ctx.fillRect(x + 10 * scale, y - 10 * scale, 4 * scale, 20 * scale);
  ctx.restore();
}

function drawPlayer(ctx, player, time) {
  const pulse = 1 + Math.sin(time * 4) * 0.08;

  ctx.save();

  ctx.fillStyle = "rgba(34, 126, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 20 * pulse, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(34, 126, 255, 0.10)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 28 * pulse, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#2c83ff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 11, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 11, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 4, 0, TAU);
  ctx.fill();

  ctx.restore();
}

function drawLocationBanner(ctx, width, height) {
  ctx.save();
  roundRect(ctx, 18, height * 0.47, 150, 40, 16);
  ctx.fillStyle = "rgba(38, 65, 44, 0.34)";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Родной город", 30, height * 0.47 + 25);

  ctx.restore();
}

function drawTinyLabel(ctx, x, y, text) {
  ctx.save();
  ctx.font = "bold 12px sans-serif";
  const width = ctx.measureText(text).width + 18;
  roundRect(ctx, x - width / 2, y - 10, width, 20, 10);
  ctx.fillStyle = "rgba(46, 59, 45, 0.45)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y + 4);
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
