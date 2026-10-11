// Every new location/sub-location exit must explicitly declare its direction.
export const LOCATION_TASKS = {
  town: [
    { id: 'town-note', label: 'Осмотреть сундук в семейном доме и найти записку', item: 'old-note', required: true },
    { id: 'town-key', label: 'Разгадать записку и найти первый ключ', item: 'first-key', required: true }
  ],
  homeInterior: [],
  forest: []
};
const ROUTES = {
  'town:homeInterior': 'explore', 'homeInterior:town': 'return',
  'town:forest': 'forward', 'forest:town': 'return'
};
export function taskComplete(game, task) {
  return game.progress.completed.includes(task.id) || game.inventory.some(item => item.id === task.item && item.quantity > 0);
}
export function locationTasks(game, location) {
  return (LOCATION_TASKS[location] || []).filter(task => task.required).map(task => ({ ...task, done: taskComplete(game, task) }));
}
export function transitionPermission(game, from, to) {
  const route = ROUTES[from + ':' + to];
  if (!route) return { allowed: false, pending: [], reason: 'unknown-route' };
  if (route !== 'forward' || game.progress.visited.includes(to)) return { allowed: true, pending: [] };
  const pending = locationTasks(game, from).filter(task => !task.done);
  return { allowed: pending.length === 0, pending };
}
export function completeTask(game, id) {
  if (!game.progress.completed.includes(id)) game.progress.completed.push(id);
}
export function restoreProgress(game, saved) {
  const taskIds = Object.values(LOCATION_TASKS).flat().map(task => task.id);
  game.progress = {
    completed: Array.isArray(saved?.completed) ? [...new Set(saved.completed.filter(id => taskIds.includes(id)))] : [],
    visited: Array.isArray(saved?.visited) ? [...new Set(saved.visited.filter(id => Object.hasOwn(LOCATION_TASKS, id)))] : ['town']
  };
  if (!game.progress.visited.includes('town')) game.progress.visited.push('town');
  for (const task of Object.values(LOCATION_TASKS).flat()) {
    if (taskComplete(game, task)) completeTask(game, task.id);
  }
  // Earlier versions unlocked this gate only after completing both city tasks.
  if (!saved && game.world.forestGateOpen) {
    completeTask(game, 'town-note'); completeTask(game, 'town-key');
  }
  if (game.world.forestVisited && !game.progress.visited.includes('forest')) game.progress.visited.push('forest');
}
