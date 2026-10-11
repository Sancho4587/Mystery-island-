export function forestGatePosition(canvas) {
  return { x: canvas.clientWidth * 0.87, y: Math.max(130, canvas.clientHeight - 150) };
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
