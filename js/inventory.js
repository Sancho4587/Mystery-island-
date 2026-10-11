import { getCarriedLoad, itemWeight, formatWeight } from "./weight.js?v=20261010-weight";
export const GEAR = {
  'travel-shirt': { id: 'travel-shirt', name: 'Походная рубашка', icon: '👕', slot: 'body' },
  'travel-trousers': { id: 'travel-trousers', name: 'Походные брюки', icon: '👖', slot: 'legs' },
  'travel-boots': { id: 'travel-boots', name: 'Походные ботинки', icon: '🥾', slot: 'feet' },
  'small-backpack': { id: 'small-backpack', name: 'Походный рюкзак', icon: '🎒', slot: 'back', capacity: 12 }
};
export const DEFAULT_EQUIPMENT = {
  head: null, body: 'travel-shirt', hands: null,
  legs: 'travel-trousers', feet: 'travel-boots', back: 'small-backpack'
};
const SLOTS = [
  ['head', 'Голова', '◯'], ['body', 'Одежда', '👕'], ['hands', 'Руки', '✋'],
  ['legs', 'Ноги', '👖'], ['feet', 'Обувь', '🥾'], ['back', 'Рюкзак', '🎒']
];

export function normalizeEquipment(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { ...DEFAULT_EQUIPMENT };
  const result = {};
  for (const [slot] of SLOTS) {
    const id = saved[slot];
    result[slot] = id === null ? null : GEAR[id]?.slot === slot ? id : DEFAULT_EQUIPMENT[slot];
  }
  result.back = 'small-backpack';
  return result;
}

export function getBackpackState(game) {
  const items = game.inventory.filter(item => item && item.quantity > 0);
  const capacity = GEAR[game.equipment.back]?.capacity || 12;
  const used = items.length;
  return { items, used, capacity, free: Math.max(0, capacity - used), overflow: Math.max(0, used - capacity) };
}

export function changeEquipment(game, id, remove = false) {
  const gear = GEAR[id];
  if (!gear || gear.slot === 'back') return false;
  const state = getBackpackState(game);
  if (remove) {
    if (game.equipment[gear.slot] !== id) return false;
    const stack = game.inventory.find(item => item.id === id && item.quantity > 0);
    if (!stack && state.used >= state.capacity) return false;
    if (stack) stack.quantity += 1;
    else game.inventory.push({ ...gear, quantity: 1, unit: 'шт.' });
    game.equipment[gear.slot] = null;
  } else {
    const index = game.inventory.findIndex(item => item.id === id && item.quantity > 0);
    if (index < 0 || game.equipment[gear.slot]) return false;
    game.inventory[index].quantity -= 1;
    if (game.inventory[index].quantity === 0) game.inventory.splice(index, 1);
    game.equipment[gear.slot] = id;
  }
  return true;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createInventoryUI({ game, save, readNote, inspectKey }) {
  let selected = null;

  function renderDetails() {
    const area = document.getElementById('inventory-details');
    area.replaceChildren();
    if (!selected) {
      area.appendChild(element('p', 'inventory-hint', 'Нажми на предмет или экипировку, чтобы осмотреть.'));
      return;
    }
    const item = selected.equipped ? GEAR[selected.id] : game.inventory.find(entry => entry.id === selected.id && entry.quantity > 0);
    if (!item) { selected = null; renderDetails(); return; }
    area.appendChild(element('h3', '', item.icon + ' ' + item.name));
    const descriptions = {
      water: 'Запас питьевой воды для путешествия.', food: 'Запас еды для путешествия.',
      map: 'Карта для исследования острова.', compass: 'Компас для определения сторон света.'
    };
    const gear = GEAR[item.id];
    const description = gear?.slot === 'back' ? 'Вмещает 12 ячеек. Одинаковые предметы хранятся вместе. Собственный вес рюкзака входит в нагрузку.'
      : gear ? (selected.equipped ? 'Надето на персонаже. Место в рюкзаке не занимает.' : 'Лежит в рюкзаке. Можно надеть на персонажа.')
      : descriptions[item.id] || 'Предмет из рюкзака.';
    area.appendChild(element('p', '', description));
    const quantity = selected.equipped ? 1 : item.quantity;
    const weightText = item.id === 'water' ? formatWeight(itemWeight(item)) + ' / л'
      : item.id === 'food' ? formatWeight(itemWeight(item)) + ' / порцию'
      : formatWeight(itemWeight(item)) + ' / шт.';
    area.appendChild(element('p', 'item-weight', 'Вес: ' + weightText + (quantity > 1 ? ' · Всего: ' + formatWeight(itemWeight(item) * quantity) : '')));
    if (!gear || gear.slot === 'back') return;
    const state = getBackpackState(game);
    const hasStack = game.inventory.some(entry => entry.id === item.id && entry.quantity > 0);
    const blocked = selected.equipped ? !hasStack && state.used >= state.capacity : !!game.equipment[gear.slot];
    const action = element('button', 'game-button equipment-action', selected.equipped ? 'Снять в рюкзак' : 'Надеть');
    action.type = 'button';
    action.disabled = blocked;
    if (blocked) area.appendChild(element('p', 'capacity-warning', selected.equipped ? 'Нет свободной ячейки для снятого предмета.' : 'Сначала сними предмет из этого слота.'));
    action.addEventListener('click', () => {
      const wasEquipped = selected.equipped;
      if (!changeEquipment(game, item.id, wasEquipped)) return;
      selected = { id: item.id, equipped: !wasEquipped };
      save();
      render();
      document.querySelector('#inventory-details .equipment-action')?.focus();
    });
    area.appendChild(action);
  }

  function render() {
    const state = getBackpackState(game);
    const load = getCarriedLoad(game);
    const weight = document.getElementById('carried-weight');
    weight.dataset.state = load.excess > 0 ? 'over' : load.ratio >= 0.9 ? 'near' : 'available';
    document.getElementById('weight-total').textContent = 'Вес: ' + formatWeight(load.total) + ' / ' + formatWeight(load.limit);
    document.getElementById('weight-breakdown').textContent = 'Рюкзак с вещами: ' + formatWeight(load.backpack) + ' · Надето: ' + formatWeight(load.worn);
    document.getElementById('weight-status').textContent = load.excess > 0
      ? 'Перегруз +' + formatWeight(load.excess) + ': движение медленнее, усталость быстрее.'
      : load.ratio >= 0.9 ? 'Близко к пределу нагрузки' : 'Нагрузка в пределах нормы';
    const weightMeter = document.getElementById('weight-meter');
    weightMeter.max = load.limit;
    weightMeter.value = Math.min(load.total, load.limit);
    const capacity = document.getElementById('backpack-capacity');
    capacity.dataset.state = state.overflow ? 'over' : state.free === 0 ? 'full' : 'available';
    document.getElementById('capacity-count').textContent = state.used + ' / ' + state.capacity + ' ячеек';
    document.getElementById('capacity-status').textContent = state.overflow ? 'Перегруз: лишних ячеек — ' + state.overflow
      : state.free === 0 ? 'Рюкзак заполнен' : 'Свободно ячеек: ' + state.free;
    const meter = document.getElementById('capacity-meter');
    meter.max = state.capacity;
    meter.value = Math.min(state.used, state.capacity);
    const container = document.getElementById('inventory-container');
    container.replaceChildren();
    state.items.forEach(item => {
      const slot = element('button', 'inventory-slot');
      slot.type = 'button';
      slot.setAttribute('aria-label', item.name + ', ' + item.quantity + ' ' + item.unit);
      slot.append(element('span', 'item-icon', item.icon), element('span', 'item-name', item.name), element('span', 'item-quantity', item.quantity + ' ' + item.unit));
      slot.addEventListener('click', () => {
        if (item.id === 'old-note') return readNote();
        if (item.id === 'first-key') return inspectKey();
        selected = { id: item.id, equipped: false };
        renderDetails();
      });
      container.appendChild(slot);
    });
    for (let i = state.used; i < state.capacity; i++) {
      const empty = element('div', 'inventory-slot empty-slot');
      empty.setAttribute('aria-hidden', 'true');
      container.appendChild(empty);
    }
    const equipment = document.getElementById('equipment-slots');
    equipment.replaceChildren();
    for (const [slot, label, emptyIcon] of SLOTS) {
      const id = game.equipment[slot];
      const gear = GEAR[id];
      const cell = element(gear ? 'button' : 'div', 'equipment-slot equipment-' + slot + (gear ? ' occupied' : ''));
      cell.append(element('span', 'equipment-label', label), element('span', 'equipment-icon', gear?.icon || emptyIcon), element('span', 'equipment-name', gear?.name || 'Пусто'));
      if (gear) {
        cell.type = 'button';
        cell.setAttribute('aria-label', label + ': ' + gear.name + '. Осмотреть');
        cell.addEventListener('click', () => { selected = { id, equipped: true }; renderDetails(); });
      }
      equipment.appendChild(cell);
    }
    for (const slot of ['body', 'legs', 'feet']) {
      document.getElementById('avatar-' + slot).style.display = game.equipment[slot] ? '' : 'none';
    }
    document.getElementById('equipment-summary').textContent = 'Надето: ' + SLOTS.filter(([slot]) => game.equipment[slot]).length + ' из ' + SLOTS.length;
    renderDetails();
  }
  return { render };
}
