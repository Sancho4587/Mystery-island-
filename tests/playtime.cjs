const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{webcrypto}=require('crypto');
class El {
 constructor(){this.children=[];this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};this.value='';}
 set className(v){this.classes=new Set(v.split(' '))} setAttribute(){} appendChild(e){this.children.push(e);return e} replaceChildren(){this.children=[]} focus(){} cloneNode(){return new El()}
 querySelector(s){if(s==='button')return this.children.find(x=>x.tag==='button');return (this.q??={})[s]??=new El()}
}
let now=new Date(2026,9,9,12).getTime(),interval,paused=false,saves=0,sleeps=0;const nodes={},storage={},events={};
class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const document={hidden:false,hasFocus:()=>true,getElementById:id=>nodes[id]??=new El(),createElement:tag=>Object.assign(new El(),{tag}),addEventListener:(n,f)=>events[n]=f};
const ctx={Date:Clock,document,window:{addEventListener:(n,f)=>events[n]=f},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},crypto:webcrypto,TextEncoder,setInterval:f=>interval=f,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/playtime.js','utf8').replaceAll('export ',''),ctx);const run=s=>vm.runInContext(s,ctx);
assert.equal(run('allowance({weekday:60,weekend:120},new Date(2026,9,9))'),3600);
assert.equal(run('allowance({weekday:60,weekend:120},new Date(2026,9,10))'),7200);
assert.equal(run('allowance({weekday:60,weekend:120},new Date(2026,9,11))'),7200);
run('const u={};charge(u,new Date(2026,9,9,23,59,30).getTime(),new Date(2026,9,10,0,0,30).getTime(),true)');assert.equal(run('u["2026-10-09"]'),30);assert.equal(run('u["2026-10-10"]'),30);
ctx.opts={save:()=>saves++,pause:()=>paused=true,resume:()=>paused=false,active:()=>!paused,goHome(){},canGoHome:()=>true,sleep:()=>sleeps++};
const api=run('createPlaytime(opts)');const overlay=nodes['game-app'].children[0],body=overlay.querySelector('#time-body');
const btn=label=>{const e=body.children.find(x=>x.textContent===label);assert.ok(e,label);return e};
now+=1000;interval();assert.equal(JSON.parse(storage['mystery-island-parent-v1']).usage['2026-10-09'],1);
document.hidden=true;events.visibilitychange();now+=60000;interval();assert.equal(JSON.parse(storage['mystery-island-parent-v1']).usage['2026-10-09'],1);document.hidden=false;events.visibilitychange();
now+=2999000;interval();assert.equal(overlay.querySelector('h2').textContent,'Пора подумать о ночлеге');btn('Продолжить').onclick();interval();now+=300000;interval();assert.ok(body.children.some(x=>x.textContent?.includes('5 мин.')));btn('Продолжить').onclick();interval();now+=300000;interval();assert.equal(api.blocked(),true);assert.ok(saves);
(async()=>{
api.openParents();let form=body.children.find(x=>x.tag==='form');form.children[0].value='1234';form.children[1].value='1234';await form.onsubmit({preventDefault(){}});assert.ok(JSON.parse(storage['mystery-island-parent-v1']).pin.digest);assert.ok(!storage['mystery-island-parent-v1'].includes('1234'));
btn('Продолжить с оставшимся временем').onclick();assert.equal(api.blocked(),true);btn('Добавить 15 минут и продолжить').onclick();assert.equal(api.blocked(),false);
api.openParents();form=body.children.find(x=>x.tag==='form');form.children[0].value='0000';await form.onsubmit({preventDefault(){}});assert.equal(form.children.at(-1).textContent,'Неверный PIN.');form.children[0].value='1234';await form.onsubmit({preventDefault(){}});btn('Готово').onclick();
api.finishDay();btn('Лечь спать').onclick();assert.equal(sleeps,1);assert.equal(api.blocked(),true);assert.equal(JSON.parse(storage['mystery-island-parent-v1']).rest['2026-10-09'],true);
// A parent can undo accidental bedtime without granting extra minutes.
api.openParents();form=body.children.find(x=>x.tag==='form');form.children[0].value='1234';await form.onsubmit({preventDefault(){}});
const beforeResume=JSON.parse(storage['mystery-island-parent-v1']);
btn('Продолжить с оставшимся временем').onclick();assert.equal(api.blocked(),false);
const afterResume=JSON.parse(storage['mystery-island-parent-v1']);
assert.equal(afterResume.rest['2026-10-09'],undefined);
assert.deepEqual(afterResume.usage,beforeResume.usage);assert.deepEqual(afterResume.extra,beforeResume.extra);
api.finishDay();btn('Лечь спать').onclick();
now=new Date(2026,9,10,10).getTime();interval();assert.equal(api.blocked(),false);assert.equal(nodes['playtime-status'].textContent,'Сегодня осталось: 120 мин.');
// Reload exhausted day remains locked, independent of adventure save.
let saved=JSON.parse(storage['mystery-island-parent-v1']);saved.usage['2026-10-10']=7200;storage['mystery-island-parent-v1']=JSON.stringify(saved);assert.equal(run('createPlaytime(opts)').blocked(),true);
console.log('PASS: weekday/weekend, midnight split, hidden pause, 10/5 minute warnings, expiry, reload, PIN setup/check/hash, extra time, bedtime and next day.');
})().catch(e=>{console.error(e);process.exitCode=1});
