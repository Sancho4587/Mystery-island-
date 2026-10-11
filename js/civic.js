export const PLACES = [
 {id:'library',name:'Библиотека',icon:'📚',x:.5,y:.20,color:'#7d8960',title:'Между строк',about:'В библиотеке можно читать и брать книги на время. Библиотекарь помогает искать сведения. Книги возвращают вовремя, чтобы их могли прочитать другие люди.'},
 {id:'police',name:'Полиция',icon:'🚓',x:.25,y:.30,color:'#537a9c',title:'По следам тишины',about:'Полицейские помогают людям, когда нужна защита, ищут пропавших и разбираются в происшествиях. Они внимательно слушают свидетелей и проверяют факты.'},
 {id:'fire',name:'Пожарная часть',icon:'🚒',x:.75,y:.30,color:'#b56051',title:'Выше ветвей',about:'Пожарные тушат пожары и помогают при спасательных работах. В этой истории команда помогает котёнку спуститься с дерева. Машины, лестницы и защитная одежда нужны для работы подготовленных взрослых.'},
 {id:'hall',name:'Муниципалитет',icon:'🏛️',x:.25,y:.63,color:'#8b789b',title:'Общее дело',about:'Здесь решают городские вопросы: заботятся об улицах, парках и других общих местах. Жители могут сообщить о проблеме и предложить улучшение.'},
 {id:'school',name:'Школа',icon:'🏫',x:.75,y:.63,color:'#bd974e',title:'У каждого своё место',about:'В школе учатся читать, считать, задавать вопросы и работать вместе. Учителя помогают разобраться, а ошибку можно обсудить и исправить.'}
];
export function civicState(game) {
 const s=game.civic ||= {};
 s.seen ||= []; s.studied ||= []; s.fog ||= []; s.quests ||= {};
 return s;
}
export function questState(game,id) {const s=civicState(game);return s.quests[id] ||= {step:0,done:false,notes:[],rude:false};}
export function civicRewards(game) {
 const quests=Object.values(civicState(game).quests);
 return {xp:quests.reduce((n,q)=>n+(q.done?25:0),0),charisma:quests.reduce((n,q)=>n+(q.done?2:0)-(q.rude?1:0),0)};
}
export function civicBuildings(canvas) {
 const w=canvas.clientWidth,h=canvas.clientHeight;
 const bw=Math.min(118,w*.22),bh=Math.min(72,h*.105);
 return PLACES.map(p=>({...p,cx:w*p.x,cy:Math.max(166,h*p.y),width:bw,height:bh}));
}
export function civicObstacles(canvas) {return civicBuildings(canvas).map(p=>({id:p.id,type:'rectangle',x:p.cx-p.width/2,y:p.cy-p.height/2,width:p.width,height:p.height,label:p.name}));}
export function nearestPlace(canvas,game) {
 return civicBuildings(canvas).find(p=>Math.hypot(game.player.x-p.cx,game.player.y-(p.cy+p.height/2+25))<62);
}
export function exploreCivic(canvas,game) {
 const s=civicState(game);let changed=false;
 const nx=game.player.x/canvas.clientWidth,ny=game.player.y/canvas.clientHeight;
 for(let y=0;y<12;y++)for(let x=0;x<10;x++) {
  const id=y*10+x;
  if(Math.hypot((x+.5)/10-nx,((y+.5)/12-ny)*canvas.clientHeight/canvas.clientWidth)<.23&&!s.fog.includes(id)){s.fog.push(id);changed=true;}
 }
 const p=nearestPlace(canvas,game);if(p&&!s.seen.includes(p.id)){s.seen.push(p.id);changed=true;}
 return changed;
}
export function drawCivic(ctx,canvas,game,drawPlayer) {
 const w=canvas.clientWidth,h=canvas.clientHeight,s=civicState(game);
 ctx.fillStyle='#9ebb91';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#dec8a1';ctx.lineWidth=38;ctx.beginPath();ctx.moveTo(w*.5,120);ctx.lineTo(w*.5,h-105);
 for(const y of [.30,.63]){const py=Math.max(166,h*y)+Math.min(72,h*.105)/2+30;ctx.moveTo(w*.18,py);ctx.lineTo(w*.82,py);}ctx.stroke();
 for(const p of civicBuildings(canvas)){
  ctx.fillStyle=p.color;ctx.fillRect(p.cx-p.width/2,p.cy-p.height/2,p.width,p.height);
  ctx.fillStyle='#f3e3be';ctx.fillRect(p.cx-p.width/2-5,p.cy-p.height/2-12,p.width+10,12);
  ctx.fillStyle='#5c4d43';ctx.fillRect(p.cx-9,p.cy+5,18,p.height/2-5);
  ctx.fillStyle='#bde0d9';ctx.fillRect(p.cx-p.width*.36,p.cy-12,16,20);ctx.fillRect(p.cx+p.width*.22,p.cy-12,16,20);
  ctx.font='23px sans-serif';ctx.textAlign='center';ctx.fillText(p.icon,p.cx,p.cy-p.height/2-18);
  if(s.seen.includes(p.id)){ctx.font='bold 12px sans-serif';ctx.fillStyle='#233d34';ctx.fillText(p.name,p.cx,p.cy+p.height/2+19);}
 }
 ctx.fillStyle='#d9bd84';ctx.fillRect(w*.5-57,h-151,114,25);ctx.fillStyle='#304738';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('↓ На площадь',w*.5,h-134);
 for(let y=0;y<12;y++)for(let x=0;x<10;x++)if(!s.fog.includes(y*10+x)){ctx.fillStyle='rgba(22,39,42,.85)';ctx.fillRect(x*w/10,y*h/12,w/10+1,h/12+1);}
 drawPlayer(ctx,game.player,performance.now()/1000);
}
const EPISODES={
 library:[
  {text:'Библиотекарь показывает записку читателя: «Мне нужна книга о зверях нашего леса. Имя автора начинается на Л». Поможешь найти её?',image:'library-story',choices:[['Давайте проверим раздел и автора.',1,'Из записки известно: тема — лесные звери, первая буква фамилии автора — Л.'],['Возьму самую яркую книгу.',0,'Обложка не говорит, подходит ли книга читателю. Вернёмся к записке.']]},
  {text:'На полках три раздела: «Сказки», «Природа», «Транспорт». Где начнём поиск?',choices:[['Транспорт',0,'Там книги о машинах и дорогах. Нужны сведения о животных.'],['Природа',1,'Ты выбрала раздел «Природа».'],['Сказки',0,'Читатель просил сведения о настоящих лесных зверях.']]},
  {text:'В разделе стоят «Жители океана» Лисиной, «Звери нашего леса» Лебедевой и «Звери нашего леса» Орлова. Какая книга соответствует обеим подсказкам?',choices:[['«Жители океана» Лисиной',0,'Буква подходит, но тема другая.'],['«Звери нашего леса» Орлова',0,'Тема подходит, но проверь первую букву фамилии.'],['«Звери нашего леса» Лебедевой',1,'Тема и первая буква автора совпали. Библиотекарь помог передать книгу читателю.']]},
  {text:'Для поиска ты ещё взяла справочник с полки «Природа». Что сделаешь после работы?',choices:[['Верну справочник на его место и сообщу, что поиск завершён.',1,'Книга найдена, справочник на месте. Следующему читателю будет легко его найти.'],['Оставлю его в разделе «Транспорт».',0,'Там справочник будет трудно найти. Вспомни, откуда мы его взяли.']]}
 ],
 police:[
  {text:'Соседка Марта потеряла пса Бима. Полицейская Анна предлагает помочь с поиском. С чего начнём?',choices:[['Сначала узнаю приметы и где его видели.',1,'Марта: Бим — небольшой белый пёс с коричневым ухом и зелёным ошейником.'],['Поехали куда-нибудь, не будем спрашивать.',0,'Анна: сначала нужны приметы, иначе мы можем искать другого пса.'],['Не мешайте, я лучше вас знаю!',0,'Анна: давай разговаривать уважительно. Мы ищем вместе.',true]]},
  {text:'Марта: утром Бим побежал от кафе на восток. На площади фонтан; восточнее него парк, западнее — школа. Анна приглашает тебя в патрульную машину. Ты пристёгиваешься, и вы едете осматривать улицу.',image:'police-ride',choices:[['Посмотреть схему улицы',1,'Кафе → площадь с фонтаном → парк. На схеме север сверху, восток справа.']]},
  {text:'На схеме школа слева от фонтана, парк справа. Где стоит проверить свидетельство Марты?',choices:[['У школы',0,'Вспомни: Марта сказала «на восток». На нашей схеме это справа.'],['В парке',1,'Вы направились в парк, к востоку от фонтана.'],['Сразу за городом',0,'Пока нет свидетельств, что Бим ушёл за город.']]},
  {text:'В парке садовник видел двух собак: большую чёрную в зелёном ошейнике и маленькую белую с коричневым ухом, тоже в зелёном ошейнике. Кого попросим Анну проверить?',choices:[['Большую чёрную',0,'Одного совпадения цвета ошейника мало. Сравни все приметы.'],['Любую: ошейники одинаковые',0,'Нужно проверить размер и окрас вместе с ошейником.'],['Маленькую белую с коричневым ухом',1,'Анна проверила адресник и связалась с Мартой. Это Бим!']]},
  {text:'Бим найден. Как завершим дело?',choices:[['Сразу займёмся другим делом',0,'Марта ещё ждёт известий. Доведём помощь до конца.'],['Дождёмся Марты и передадим ей Бима вместе с Анной',1,'Бим снова с хозяйкой. Ты сопоставила направление и приметы и завершила поиск.']]}
 ],
 fire:[
  {text:'В пожарную часть позвонил смотритель парка: котёнок забрался на дерево и боится спуститься. Команда приглашает тебя понаблюдать за учебным выездом в нашей игровой истории.',choices:[['Как я могу помочь?',1,'Командир: слушай указания и помоги приготовить переноску. На дерево поднимаются спасатели.'],['Я сама полезу на дерево!',0,'Командир: подъём выполняет подготовленный взрослый. Ты можешь помочь с земли.']]},
  {text:'Ты пристегнулась в машине. Пожарные везут лестницу и переноску через город в парк.',image:'fire-ride',choices:[['Приехать в парк',1,'Котёнок на ветке. Команда готовит место для спасения.']]},
  {text:'Для ограждения нужно по 2 конуса с каждой из 3 сторон площадки. Сколько конусов подготовить?',choices:[['5 конусов',0,'Сложи 2 + 2 + 2. Можно пересчитать ещё раз.'],['6 конусов',1,'Подготовлено 6 конусов. Взрослые оградили рабочее место.'],['8 конусов',0,'Сторон три, по два конуса на каждой. Пересчитай.']]},
  {text:'Куда поставить приготовленную переноску?',choices:[['Под лестницу',0,'Там работают спасатели. Выберем указанное командиром место вне ограждения.'],['За ограждением, рядом с командиром',1,'Ты подготовила переноску и отошла к командиру.']]},
  {text:'Пожарный осторожно снял котёнка с ветки. Внизу его ждёт переноска, а хозяин уже подошёл к смотрителю.',image:'fire-rescue',choices:[['Помочь передать переноску хозяину и поблагодарить команду',1,'Котёнок вернулся домой. Ты помогла команде, посчитала оборудование и завершила дело.']]}
 ],
 hall:[
  {image:'hall-story',text:'Сотрудница муниципалитета готовит план небольшого двора. Жители просят скамейки, урны и свободную дорожку. Она приглашает помочь проверить план.',choices:[['Давайте сначала выслушаем жителей.',1,'Нужно сохранить проход и разместить вещи так, чтобы ими было удобно пользоваться.'],['Поставим всё как мне нравится.',0,'Двор общий. Узнаем, что нужно другим людям.']]},
  {text:'На плане 3 скамейки, у каждой нужна 1 урна. На складе 2 урны. Сколько ещё нужно заказать?',choices:[['3',0,'Три нужны всего, но две уже есть.'],['1',1,'Записано: заказать одну дополнительную урну.'],['2',0,'Сравни, сколько нужно всего и сколько уже есть.']]},
  {text:'Один вариант ставит скамейку поперёк единственного прохода. Другой — сбоку дорожки. Какой предложить?',choices:[['Сбоку дорожки, сохранив проход',1,'Проход остаётся свободным для пешеходов и колясок.'],['Поперёк: так её сразу заметят',0,'Заметность не должна мешать людям пройти.']]},
  {text:'План готов, но сотрудники ещё не знают о твоих расчётах.',choices:[['Передать план и объяснить расчёт',1,'Сотрудница приняла предложение. Ты учла потребности жителей и объяснила решение.'],['Оставить лист на случайной скамейке',0,'Передадим его тому, кто отвечает за работу.']]}
 ],
 school:[
  {image:'school-story',text:'Учительница готовит занятие для шести учеников. Нужно распределить книги и материалы. Она предлагает тебе помочь.',choices:[['Что потребуется каждому ученику?',1,'Каждому нужна одна книга и два карандаша.'],['Я сама угадаю.',0,'Уточнение поможет подготовить всё без лишних покупок.']]},
  {text:'На столе 4 книги, учеников 6. Сколько книг принести со стеллажа?',choices:[['6',0,'Четыре уже на столе. Найди, сколько не хватает.'],['2',1,'Теперь на столе шесть книг — по одной каждому.'],['4',0,'Сравни количество учеников и уже подготовленных книг.']]},
  {text:'Шести ученикам нужно по два карандаша. В коробке 12. Хватит ли всем?',choices:[['Нет, нужно ещё 6',0,'Посчитай шесть пар: 2 + 2 + 2 + 2 + 2 + 2.'],['Да, получится ровно по два',1,'Ты разложила двенадцать карандашей на шесть пар.']]},
  {text:'Одноклассник не понял, почему карандашей хватает. Что ответишь?',choices:[['Давай разложим их парами и посчитаем вместе.',1,'Вы вместе проверили пары. Учительница поблагодарила за подготовку и объяснение.'],['Как можно этого не понимать?',0,'Учительница: непонимание не повод обижать. Попробуй объяснить спокойно.',true]]}
 ]
};
export function chooseCivic(game,id,index) {
 const q=questState(game,id);if(q.done)return null;
 const step=EPISODES[id]?.[q.step],c=step?.choices[index];if(!c)return null;
 if(c[3]&&!q.rude)q.rude=true;
 if(c[1]){q.notes.push(c[2]);q.step++;if(q.step>=EPISODES[id].length)q.done=true;}
 return {text:c[2],done:q.done};
}
export function createCivicUI({game,save,pause,resume}) {
 const overlay=document.createElement('div');overlay.className='civic-overlay hidden';
 overlay.innerHTML='<section class="civic-card" role="dialog" aria-modal="true" aria-labelledby="civic-title"><h2 id="civic-title"></h2><div id="civic-body"></div></section>';
 document.getElementById('game-app').appendChild(overlay);
 const title=overlay.querySelector('h2'),body=overlay.querySelector('#civic-body');
 function setBackground(inert){for(const id of ['game-screen','menu-panel','backpack-panel','map-panel'])document.getElementById(id).inert=inert;}
 function close(){overlay.classList.add('hidden');setBackground(false);resume();}
 function show(t){pause();setBackground(true);overlay.classList.remove('hidden');title.textContent=t;body.replaceChildren();}
 function text(t){const p=document.createElement('p');p.textContent=t;body.appendChild(p);}
 function button(t,f){const b=document.createElement('button');b.type='button';b.className='game-button';b.textContent=t;b.onclick=f;body.appendChild(b);}
 function episode(id){
  const p=PLACES.find(p=>p.id===id),q=questState(game,id);show(p.title);
  if(q.done){text('Дело завершено. Получено: 25 опыта и 2 харизмы.');button('Выйти',close);return;}
  const step=EPISODES[id][q.step];
  if(step.image){const img=document.createElement('img');img.src='./assets/'+step.image+'.svg?v=civic1';img.alt=step.text;img.className='civic-scene';body.appendChild(img);}
  text(step.text);
  step.choices.forEach((c,index)=>button(c[0],()=>{const result=chooseCivic(game,id,index);save();show(p.title);text(result.text);if(c[3])text('Грубый ответ: харизма −1 за этот эпизод. Можно продолжить и исправить своё поведение.');if(result.done)text('Дело завершено! Опыт +25 · Харизма +2');button(result.done?'Выйти':'Продолжить',result.done?close:()=>episode(id));}));
  button('Продолжить позже',()=>{save();close();});
 }
 function study(id){const p=PLACES.find(p=>p.id===id),s=civicState(game);if(!s.studied.includes(id))s.studied.push(id);save();show(p.name);text(p.about);button('Понятно',close);}
 function journal(){show('Задания города');const stats=civicRewards(game);text(`Опыт за городские истории: ${stats.xp} · Изменение харизмы: ${stats.charisma>=0?'+':''}${stats.charisma}`);
 const main=['За знакомым порогом','К общему столу','Скрип у порога','Маленький порядок','Рыжий сосед','За одним столом','Шёпот воды','То, что берут с собой'];
 const extra=['Место у окна',...PLACES.map(p=>p.title),'Тихие шаги','За дверью конюшни'];
 for(const [kind,list] of [['Основное',main],['Дополнительное',extra]])for(const name of list){const p=PLACES.find(p=>p.title===name),q=p&&civicState(game).quests[p.id];const box=document.createElement('details');const heading=document.createElement('summary');const keyDone=name==='Шёпот воды'&&game.inventory.some(i=>i.id==='first-key');heading.textContent=name+' · '+(q?.done||keyDone?'Завершено':q?.notes?.length||q?'В процессе':'Не начато');box.appendChild(heading);const detail=document.createElement('p');detail.textContent=kind+' — '+(q?.notes?.length?q.notes.join(' '):q?'Поговори с сотрудником.':name==='Шёпот воды'&&game.inventory.some(i=>i.id==='old-note')?'Перечитай найденную записку.':'Пока ничего не известно');box.appendChild(detail);body.appendChild(box);}
 button('Закрыть',close);}
 return {study,episode,journal,isOpen:()=>!overlay.classList.contains('hidden'),close};
}
