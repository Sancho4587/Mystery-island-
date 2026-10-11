import { drawTree, drawRock, drawPlayer } from './town.js?v=20261010-forest';
import { forestObstacles, forestExitPosition } from './world-layout.js?v=20261010-forest';

export function drawForest(ctx, canvas, game) {
  const w = canvas.clientWidth, h = canvas.clientHeight, t = performance.now() / 1000;
  const ground = ctx.createLinearGradient(0, 0, 0, h);
  ground.addColorStop(0, '#183e35'); ground.addColorStop(.45, '#5e9054'); ground.addColorStop(1, '#91b776');
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = ground; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b0bf85'; ctx.beginPath(); ctx.ellipse(w * .5, h * .54, w * .24, h * .22, 0, 0, Math.PI * 2); ctx.fill();
  const exit = forestExitPosition(canvas);
  ctx.save(); ctx.strokeStyle = '#c7b58a'; ctx.lineWidth = 30; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(exit.x, h); ctx.lineTo(exit.x, h * .56); ctx.stroke(); ctx.restore();
  for (const obstacle of forestObstacles(canvas)) {
    if (obstacle.kind === 'tree') drawTree(ctx, obstacle.x, obstacle.y - 30, 1, t, '#467d48');
    else drawRock(ctx, obstacle.x, obstacle.y, .72);
  }
  ctx.save(); ctx.fillStyle = '#735436'; ctx.fillRect(exit.x + 38, exit.y - 20, 5, 38);
  ctx.fillStyle = '#f3e4ba'; ctx.fillRect(exit.x + 4, exit.y - 31, 76, 24);
  ctx.fillStyle = '#493722'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('↓ В город', exit.x + 42, exit.y - 15); ctx.restore();
  drawPlayer(ctx, game.player, t);
}
