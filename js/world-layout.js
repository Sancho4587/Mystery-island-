export function forestGatePosition(canvas) {
  return { x: canvas.clientWidth - 26, y: Math.max(150, Math.min(canvas.clientHeight * .75, canvas.clientHeight - 155)) };
}
export function forestExitPosition(canvas) {
  return { x: canvas.clientWidth * 0.5, y: Math.max(130, canvas.clientHeight - 125) };
}
export function forestObstacles(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  return [
    [.14, .35, 'tree'], [.30, .48, 'tree'], [.73, .35, 'tree'],
    [.88, .52, 'tree'], [.16, .70, 'tree'], [.78, .72, 'tree'],
    [.35, .69, 'rock'], [.66, .55, 'rock']
  ].map(([x,y,kind], index) => ({ id: 'forest-' + index, kind, type: 'circle',
    x: w * x, y: Math.max(120, Math.min(h * y, h - 155)), radius: kind === 'tree' ? 15 : 19,
    label: kind === 'tree' ? 'Дерево' : 'Камень' }));
}

export function townWallObstacles(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const gate = forestGatePosition(canvas);
  return [
    { x: 8, y: 96, width: w - 16, height: 16 },
    { x: 8, y: h - 94, width: w - 16, height: 16 },
    { x: 8, y: 112, width: 16, height: Math.max(0, h - 206) },
    { x: w - 34, y: 112, width: 16, height: Math.max(0, gate.y - 42 - 112) },
    { x: w - 34, y: gate.y + 42, width: 16, height: Math.max(0, h - 94 - gate.y - 42) }
  ].map((wall, index) => ({ ...wall, id: 'town-wall-' + index, type: 'rectangle', label: 'Каменная ограда' }));
}
export function gatekeeperPosition(canvas) {
  const gate = forestGatePosition(canvas);
  return { x: gate.x - 72, y: gate.y + 24 };
}
