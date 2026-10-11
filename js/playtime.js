// Local calendar days; independent of adventure saves.
export function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function allowance(settings, date) {
  return ([0,6].includes(date.getDay()) ? settings.weekend : settings.weekday) * 60;
}
export function charge(usage, from, to, active) {
  if (!active || to <= from) return;
  let start = from;
  while (start < to) {
    const date = new Date(start);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1).getTime();
    const stop = Math.min(to, end);
    const key = dayKey(date);
    usage[key] = Math.max(0, Number(usage[key]) || 0) + (stop-start)/1000;
    start = stop;
  }
}

export function createPlaytime({save, pause, resume, active, goHome, canGoHome, sleep, continueGame = resume, atHome = () => false}) {
  const KEY = 'mystery-island-parent-v1';
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch {}
  data = data && typeof data === 'object' ? data : {};
  data.settings = data.settings || {weekday:60, weekend:120};
  data.usage = data.usage || {};
  data.extra = data.extra || {};
  data.rest = data.rest || {};
  let previous = Date.now(), wasActive = false, locked = false, parentOpen = false;
  let authorized = false, warning = '', failures = 0, retryAfter = 0;
  const overlay = document.createElement('div');
  overlay.className = 'time-overlay hidden';
  overlay.innerHTML = '<section class="time-card" role="dialog" aria-modal="true" aria-labelledby="time-title"><h2 id="time-title"></h2><div id="time-body"></div></section>';
  document.getElementById('game-app').appendChild(overlay);
  const title = overlay.querySelector('h2'), body = overlay.querySelector('#time-body');
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch { document.getElementById('game-message').textContent = 'Не удалось сохранить счётчик времени. Проверь свободное место браузера.'; }
  }
  function remaining() {
    const now = new Date(), key = dayKey(now);
    return Math.max(0, allowance(data.settings, now) + (data.extra[key] || 0)*60 - (data.usage[key] || 0));
  }
  function show(heading) {
    overlay.classList.remove('sleep-screen');
    pause(); for (const child of document.getElementById('game-app').children) if(child!==overlay) child.inert=true; overlay.classList.remove('hidden'); title.textContent = heading; body.replaceChildren();
  }
  function text(value) { const p=document.createElement('p'); p.textContent=value; body.appendChild(p); }
  function button(label, run) { const b=document.createElement('button'); b.className='game-button'; b.textContent=label; b.onclick=run; body.appendChild(b); if(body.querySelector('button')===b)b.focus(); return b; }
  function close() { parentOpen=false; authorized=false; overlay.classList.add('hidden'); for (const child of document.getElementById('game-app').children) if(child!==overlay) child.inert=false; resume(); }
  function stopScreen() {
    locked=true; parentOpen=false; authorized=false; save();
    const homeSleep = !!data.rest[dayKey(new Date())] && atHome();
    show(homeSleep ? 'Спокойной ночи' : 'На сегодня приключение завершено');
    if (homeSleep) {
      overlay.classList.add('sleep-screen');
      const scene = document.createElement('img');
      scene.className = 'sleep-illustration';
      scene.src = './assets/sleep-home.svg?v=20261011-night';
      scene.alt = 'Девочка спит под одеялом, рядом свернулся рыжий кот. За окном — луна и звёзды.';
      scene.width = 800; scene.height = 480;
      body.appendChild(scene);
      text('Приключение продолжится завтра. Твой прогресс сохранён.');
      button('Родительские настройки', openParents);
      return;
    }
    text(data.rest[dayKey(new Date())]
      ? 'Вы выбрали «Лечь спать», поэтому игра остановлена до завтра. Если это было случайно, родитель может разрешить продолжение через PIN.'
      : 'Дневной лимит закончился. Родитель может добавить время через PIN.');
    text('Прогресс сохранён. Можно закрыть вкладку. Крестик меню позади недоступен, пока игра остановлена.');
    button('Родительские настройки', openParents);
  }
  async function hash(pin, salt) {
    const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));
    return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
  }
  function openParents() {
    parentOpen=true; authorized=false; show(data.pin ? 'Вход для родителя' : 'Задайте родительский PIN');
    text('Лимит действует в этом браузере. В будни — 1 час, в выходные — 2 часа по умолчанию.');
    const form=document.createElement('form');
    const input=document.createElement('input'); input.type='password'; input.inputMode='numeric'; input.pattern='[0-9]{4,8}'; input.minLength=4; input.maxLength=8; input.required=true; input.autocomplete='off'; input.placeholder='PIN: 4–8 цифр'; input.setAttribute('aria-label','Родительский PIN'); form.appendChild(input);
    let confirm;
    if (!data.pin) { confirm=input.cloneNode(); confirm.placeholder='Повторите PIN'; confirm.setAttribute('aria-label','Повторите PIN'); form.appendChild(confirm); }
    const submit=document.createElement('button'); submit.className='game-button'; submit.textContent=data.pin?'Открыть настройки':'Сохранить PIN'; form.appendChild(submit);
    const error=document.createElement('p'); error.setAttribute('role','status'); form.appendChild(error); body.appendChild(form);
    form.onsubmit=async event=>{
      event.preventDefault();
      if(Date.now()<retryAfter) { error.textContent='Подождите минуту перед следующей попыткой.'; return; }
      if(!/^[0-9]{4,8}$/.test(input.value)) {error.textContent='Введите от 4 до 8 цифр.';return;}
      submit.disabled=true;
      try {
        if(!data.pin) {
          if(input.value!==confirm.value) {error.textContent='PIN не совпадает.';return;}
          const salt=Array.from(crypto.getRandomValues(new Uint8Array(16))).join('-');
          data.pin={salt, digest:await hash(input.value,salt)}; persist();
        } else if(await hash(input.value,data.pin.salt)!==data.pin.digest) {
          failures++; if(failures>=5) {retryAfter=Date.now()+60000;failures=0;}
          error.textContent='Неверный PIN.'; input.value=''; return;
        }
        failures=0; authorized=true; settings();
      } catch {error.textContent='Не удалось открыть настройки. Попробуйте снова.';}
      finally {submit.disabled=false;}
    };
    button('Назад',()=>locked?stopScreen():close()); input.focus();
  }
  function continueToday() {
    if (!authorized || remaining() <= 0) return;
    delete data.rest[dayKey(new Date())];
    locked=false; persist(); close(); continueGame();
  }
  function settings() {
    if(!authorized)return;
    show('Время приключений');
    text(`Сегодня осталось ${Math.ceil(remaining()/60)} мин.`);
    const fields={};
    for(const [key,label] of [['weekday','Будни, минут'],['weekend','Выходные, минут']]) {
      const l=document.createElement('label');l.textContent=label;
      const input=document.createElement('input'); input.type='number';input.min='1';input.max='240';input.value=data.settings[key];l.appendChild(input);body.appendChild(l);fields[key]=input;
    }
    const status=document.createElement('p');status.setAttribute('role','status');body.appendChild(status);
    button('Сохранить лимиты',()=>{
      if(Object.values(fields).some(i=>!/^\d+$/.test(i.value)||+i.value<1||+i.value>240)){status.textContent='Укажите от 1 до 240 минут.';return;}
      data.settings={weekday:+fields.weekday.value,weekend:+fields.weekend.value};persist();status.textContent='Лимиты сохранены.';
    });
    button('Продолжить с оставшимся временем',()=>{
      if (remaining() <= 0) { status.textContent='Время закончилось. Добавьте 15 минут или увеличьте лимит.'; return; }
      continueToday();
    });
    button('Добавить 15 минут и продолжить',()=>{const k=dayKey(new Date());data.extra[k]=(data.extra[k]||0)+15;continueToday();});
    button('Готово',()=>{locked=remaining()<=0||!!data.rest[dayKey(new Date())];locked?stopScreen():close();});
  }
  function finishDay() {
    show('Отдохнуть до завтра?');text('Героиня ляжет спать. Приключение продолжится завтра; родитель может добавить время через PIN.');
    button('Лечь спать',()=>{sleep();data.rest[dayKey(new Date())]=true;persist();stopScreen();});
    button('Ещё не сейчас',close);
  }
  function tick() {
    const now=Date.now();
    // Visibility/focus events settle the last interval before backgrounding.
    charge(data.usage,previous,now,wasActive); previous=now;
    const k=dayKey(new Date());
    const shouldLock=remaining()<=0||!!data.rest[k];
    if(shouldLock&&!locked) stopScreen();
    if(!shouldLock&&locked&&!parentOpen) {locked=false;close();}
    wasActive=!document.hidden&&document.hasFocus()&&!locked&&!parentOpen&&active()&&overlay.classList.contains('hidden');
    const minutes=Math.ceil(remaining()/60);
    const counter=document.getElementById('playtime-status');if(counter)counter.textContent=`Сегодня осталось: ${minutes} мин.`;
    const threshold=minutes<=5?5:minutes<=10?10:0;
    if(threshold&&!shouldLock&&!parentOpen&&warning!==`${k}:${threshold}`) {
      warning=`${k}:${threshold}`;
      show('Пора подумать о ночлеге');text(`Осталось ${minutes} мин. Можно вернуться домой и отдохнуть. Прогресс сохранится, даже если не успеешь.`);
      if(canGoHome())button('Вернуться домой',()=>{close();goHome();});
      button('Продолжить',close);
    }
    persist();
  }
  document.addEventListener('visibilitychange',tick);
  window.addEventListener('blur',()=>{tick();wasActive=false;save();});
  window.addEventListener('focus',tick);
  window.addEventListener('pagehide',()=>{tick();wasActive=false;save();});
  window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{data=JSON.parse(e.newValue);}catch{} previous=Date.now();wasActive=false;}});
  setInterval(tick,1000); tick();
  return {openParents,finishDay,blocked:()=>locked||!overlay.classList.contains('hidden')};
}
