'use strict';
const assert=require('node:assert/strict'),E=require('./src/engine'),D=require('./src/threats');
const openWorld={solid(){return false},water(){return null},mushrooms(){return []}};
function player(x=300,y=150){return E.spawn(x,y)}
function shadow(x,y){return {x,y,homeY:y,w:18,h:34,phase:'idle',seen:false}}
let p=player(),e=shadow(100,150),hazards={shadows:[e],stones:[]};D.update(hazards,p,openWorld,0);assert.equal(e.phase,'idle');p.x=180;let x0=e.x;D.update(hazards,p,openWorld,0);assert.equal(e.phase,'chasing');assert(e.x>x0);assert(Math.abs(e.x-x0)<=135/60+.001);
let x1=e.x,y1=e.y;p.effectId=7;D.update(hazards,p,openWorld,0);assert(Math.abs(e.x-x1)<=168.75/60+.001);D.update(hazards,p,openWorld,700);assert.equal(e.phase,'gone');D.update(hazards,p,openWorld,0);assert.equal(e.phase,'gone');
p=player(100,150);e=shadow(100,150);hazards={shadows:[e],stones:[]};D.update(hazards,p,openWorld,0);assert.equal(p.hp,4);for(let i=0;i<40;i++)D.update(hazards,p,openWorld,0);assert.equal(p.hp,4,'contact cooldown');
const floorWorld={...openWorld,solid(x,y){return y>=10}};
function stone(){return {x:207,y:20,length:26,phase:'hanging',timer:0,vy:0}}
p=player(200,100);let s=stone();hazards={shadows:[],stones:[s]};D.update(hazards,p,floorWorld,0);assert.equal(s.phase,'warning');assert.equal(s.y,20);for(let i=0;i<100&&s.phase!=='gone';i++)D.update(hazards,p,floorWorld,0);assert.equal(p.hp,4);assert.equal(s.phase,'gone');
p=player(200,100);s=stone();hazards={shadows:[],stones:[s]};D.update(hazards,p,floorWorld,0);p.x=270;for(let i=0;i<100&&s.phase!=='gone';i++)D.update(hazards,p,floorWorld,0);assert.equal(p.hp,5,'dodging must not hurt');assert.equal(s.phase,'gone');
p=player(200,230);s=stone();hazards={shadows:[],stones:[s]};D.update(hazards,p,floorWorld,0);for(let i=0;i<100&&s.phase!=='gone';i++)D.update(hazards,p,floorWorld,0);assert.equal(p.hp,5,'rock shields player');
const stats=E.traits(E.spawn(0,0));let candidates={ores:[{spawnRoll:.5},{spawnRoll:.9},{spawnRoll:1.2}],threats:{shadows:[{roll:.9,phase:'idle'}]}};D.reveal(candidates,stats);assert.deepEqual(candidates.ores.map(o=>o.enabled),[true,true,false]);assert.equal(candidates.threats.shadows[0].phase,'gone');D.reveal(candidates,{oreRate:1.4,enemyRate:1.4});assert.equal(candidates.ores[2].enabled,false,'visible population stays fixed');
let totalShadows=0,totalStones=0;
for(let seed of [1,127301,999999]){let segments=[],previous=null,entry=null;for(let id=0;id<30;id++){let seg=E.makeSegment(seed,id,previous,entry,0,600);assert(seg);D.populate(seg,previous,seed);D.reveal(seg,E.traits(seg.entry));totalShadows+=seg.threats.shadows.length;totalStones+=seg.threats.stones.length;assert(seg.threats.shadows.length<=1);assert(seg.threats.stones.length<=4);for(let o of seg.threats.stones)assert(E.worldFor(seg,previous).solid(Math.floor(o.x/E.T),Math.floor(o.y/E.T)-1));segments.push(seg);previous=seg;entry=seg.proof.exit}
let world={solid(x,y){if(x<2||x>=E.W-2||y<0)return true;return !!segments[Math.floor(y/E.H)]?.tiles[y%E.H]?.[x]},water(x,y){return segments[Math.floor(y/E.H)]?.water[y%E.H]?.[x]||null},mushrooms(y){let id=Math.floor(y/E.T/E.H);return [id-1,id,id+1].flatMap(i=>segments[i]?.mushrooms||[])}};
let actor={...segments[0].entry},all={shadows:segments.flatMap(s=>s.threats.shadows),stones:segments.flatMap(s=>s.threats.stones)};for(let seg of segments)for(let [d,j,v]of seg.proof.commands){E.step(actor,d,!!j,world,v||0);let events=D.update(all,actor,world,Math.max(0,actor.y-240));assert(!events.some(e=>e.type==='hit'||e.type==='awaken'||e.type==='rattle'));assert(!actor.dead);assert.equal(actor.damage,0)}assert.equal(actor.hp,5);}
assert(totalShadows>0&&totalStones>0);console.log('PASS: 5-tile activation, grounded chase, offscreen permanent despawn, contact cooldown; stalactite warning / hit / dodge / rock shield; density modifiers and fixed revealed population; 90 segments with live hazards, 1080m safe replay per seed. Candidates:',totalShadows,'shadows,',totalStones,'stalactites.');

// Chase over a three-tile obstacle: movement must use a legal jump, never clip.
let obstacleWorld={...openWorld,solid(x,y){return x<2||x>=46||y>=10||(x===12&&y>=7)}};
p=player(280,172);e=shadow(195,166);hazards={shadows:[e],stones:[]};let highest=172;
for(let i=0;i<240;i++){D.update(hazards,p,obstacleWorld,0);highest=Math.min(highest,e.actor.y);assert(!E.collides(e.actor,e.actor.x,e.actor.y,obstacleWorld),'enemy clipped rock')}
assert(highest<130,'enemy must jump to clear the ledge');assert(e.actor.x>260,'enemy must cross obstacle using physics');assert(p.hp<5,'enemy should reach player');
let gravityEnemy=shadow(100,100),gravityPlayer=player(700,100);for(let i=0;i<10;i++)D.update({shadows:[gravityEnemy],stones:[]},gravityPlayer,openWorld,0);assert(gravityEnemy.y>100,'idle enemies obey gravity');
// Water is free directional movement with no jump, for both player and NPC.
const poolWorld={...openWorld,water(){return {pool:true,strength:1}}};let swimmer=player(200,200);
E.step(swimmer,0,true,poolWorld,0);assert.equal(swimmer.didJump,false);assert.equal(swimmer.jumps,0);assert.equal(swimmer.vy,0);assert.equal(swimmer.y,200);
E.step(swimmer,0,false,poolWorld,-1);assert(swimmer.y<200);let yBefore=swimmer.y;E.step(swimmer,0,false,poolWorld,1);assert(swimmer.y>yBefore);let xBefore=swimmer.x;E.step(swimmer,1,false,poolWorld,0);assert(swimmer.x>xBefore);let restY=swimmer.y;E.step(swimmer,0,false,poolWorld,0);assert.equal(swimmer.y,restY);
let blockedPool={...poolWorld,solid(x){return x>=11}};for(let i=0;i<30;i++)E.step(swimmer,1,true,blockedPool,-1);assert(swimmer.x+E.PW<=220);assert.equal(swimmer.didJump,false);
console.log('PASS: faster grounded enemy jumps across a 3-tile obstacle without clipping, obeys gravity, reaches player; WASD swimming, hover, wall collision and disabled water jump.');
