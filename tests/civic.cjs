const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/civic.js','utf8').replaceAll('export ',''),ctx);
const run=s=>vm.runInContext(s,ctx);run('const g={inventory:[]};');
const answers={library:[0,1,2,0],police:[0,0,1,2,1],fire:[0,0,1,1,0],hall:[0,1,0,0],school:[0,1,1,0]};
for(const [id,list] of Object.entries(answers)){for(const choice of list)assert.ok(run(`chooseCivic(g,'${id}',${choice})`));assert.equal(run(`questState(g,'${id}').done`),true,id);assert.equal(run(`chooseCivic(g,'${id}',0)`),null);}
assert.equal(run('civicRewards(g).xp'),125);assert.equal(run('civicRewards(g).charisma'),10);
run('const wrong={};chooseCivic(wrong,"police",2);chooseCivic(wrong,"police",2)');assert.equal(run('civicRewards(wrong).charisma'),-1);assert.equal(run('questState(wrong,"police").step'),0);
run('const resumed=JSON.parse(JSON.stringify(g));');assert.equal(run('civicRewards(resumed).xp'),125);
run('const exploring={player:{x:200,y:500}};const c={clientWidth:400,clientHeight:800};exploreCivic(c,exploring)');const fog=run('civicState(exploring).fog.length');assert.ok(fog>0&&fog<120);run('exploreCivic(c,exploring)');assert.equal(run('civicState(exploring).fog.length'),fog);
for(const [w,h] of [[390,844],[1180,820],[768,1024],[844,390]]){
 ctx.size={clientWidth:w,clientHeight:h};const buildings=run('civicBuildings(size)');
 const blocked=(x,y)=>x<13||x>w-13||y<95||y>h-100||buildings.some(b=>Math.hypot(x-Math.max(b.cx-b.width/2,Math.min(x,b.cx+b.width/2)),y-Math.max(b.cy-b.height/2,Math.min(y,b.cy+b.height/2)))<13);
 const queue=[[Math.round(w*.5/5)*5,Math.round((h-165)/5)*5]],seen=new Set();let n=0;
 while(n<queue.length){const [x,y]=queue[n++],k=x+','+y;if(seen.has(k)||blocked(x,y))continue;seen.add(k);for(const [dx,dy]of [[5,0],[-5,0],[0,5],[0,-5]])queue.push([x+dx,y+dy]);}
 for(const b of buildings)assert.ok([...seen].some(k=>{const [x,y]=k.split(',').map(Number);return Math.hypot(x-b.cx,y-(b.cy+b.height/2+25))<62;}),`${w}x${h}: ${b.id} unreachable`);
}
console.log('PASS: five quests, single rewards, save roundtrip, bounded social penalty, exploration, reachable entrances at four sizes.');
