// Game balance values in kilograms, not real-world carrying recommendations.
export const CARRY_LIMIT_KG = 15;
const WEIGHTS = {
  water: 1, food: 0.35, map: 0.1, compass: 0.15,
  'old-note': 0.02, 'first-key': 0.08,
  'travel-shirt': 0.35, 'travel-trousers': 0.55,
  'travel-boots': 0.9, 'small-backpack': 0.8
};
export function itemWeight(item) {
  if (Object.hasOwn(WEIGHTS, item.id)) return WEIGHTS[item.id];
  return Number.isFinite(item.weightKg) && item.weightKg >= 0 ? item.weightKg : 0.1;
}
export function formatWeight(value) {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' кг';
}
export function getCarriedLoad(game) {
  const grams = value => Math.round(value * 1000);
  const contents = game.inventory.reduce((sum, item) =>
    sum + (item && Number.isFinite(item.quantity) && item.quantity > 0 ? grams(itemWeight(item) * item.quantity) : 0), 0);
  let pack = 0, worn = 0;
  for (const [slot, id] of Object.entries(game.equipment || {})) {
    if (!id) continue;
    if (slot === 'back') pack += grams(itemWeight({ id }));
    else worn += grams(itemWeight({ id }));
  }
  const total = (contents + pack + worn) / 1000;
  const limit = Number.isFinite(game.player.maxCarryWeight) && game.player.maxCarryWeight > 0
    ? game.player.maxCarryWeight : CARRY_LIMIT_KG;
  return { total, limit, contents: contents / 1000, pack: pack / 1000,
    backpack: (contents + pack) / 1000, worn: worn / 1000,
    excess: Math.max(0, Math.round((total - limit) * 1000) / 1000), ratio: total / limit };
}
export function movementLoad(game) {
  const load = getCarriedLoad(game);
  const overload = Math.max(0, load.ratio - 1);
  const fatigue = game.player.stamina < 20 ? 0.55 + 0.45 * Math.max(0, game.player.stamina) / 20 : 1;
  return { speedFactor: Math.max(0.45, 1 / (1 + overload)) * fatigue,
    drainPerSecond: 2 + Math.min(6, overload * 6) };
}
