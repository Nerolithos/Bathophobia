/* Sparse, deterministic hazards. Their trigger zones preserve the witnessed
   descent route; there is no demo immunity or different player collision. */
(function(root){
'use strict';
const E=typeof module!=='undefined'?require('./engine.js'):root.CaveEngine,{T,H,PW,PH}=E;
const underStone=(p,s)=>Math.abs(p.x+PW/2-s.x)<18&&p.y>s.y+8&&p.y-s.y<240;
function clearBox(world,x,y,w,h){for(let yy=Math.floor(y/T);yy<=Math.floor((y+h-.01)/T);yy++)for(let xx=Math.floor(x/T);xx<=Math.floor((x+w-.01)/T);xx++)if(world.solid(xx,yy))return false;return true}
function difficulty(depth){return {enemyCap:depth<500?1:Math.min(4,2+Math.floor((depth-500)/350)),stoneCap:depth<500?Math.min(5,3+Math.floor(depth/200)):Math.min(10,7+Math.floor((depth-500)/300)),chance:depth<500?.85:.97}}
function updateJets(jets,p,dt,events){for(let jet of jets||[]){if(jet.phase==='gone')continue;if(jet.phase==='idle'){if(p.y>=jet.minY&&Math.abs(p.y+PH/2-jet.y)<170){jet.phase='warning';jet.timer=jet.delay;events.push({type:'jetWarning',x:jet.dir>0?45:915,y:jet.y})}continue}if(jet.phase==='warning'){jet.timer-=dt;if(jet.timer<=0){jet.phase='sweeping';jet.x=jet.dir>0?25:935}continue}if(jet.phase==='sweeping'){let old=jet.x;jet.x+=jet.dir*520*dt;if(!jet.hit&&Math.abs(p.y+PH/2-jet.y)<PH/2+8&&p.x+PW>Math.min(old,jet.x)-18&&p.x<Math.max(old,jet.x)+18){hurt(p,'岩浆喷流',events);jet.hit=true}if(jet.x>1000||jet.x< -40)jet.phase='gone'}}}
function populate(segment,previous,seed){const world=E.worldFor(segment,previous),trace=[],p={...segment.entry};trace.push({x:p.x,y:p.y});for(let [d,j,v]of segment.proof.commands){E.step(p,d,!!j,world,v||0);trace.push({x:p.x,y:p.y})}
let top=segment.id*H,origin=segment.originRow||0,level=difficulty(top-origin),shadows=[],stones=[],jets=[];
// Keep trigger regions away from both seams: later certificates may jump at
// most seven tiles back into the prior segment, so future routes cannot wake
// a hazard which the current certificate left dormant.
if(segment.id>=1){let candidates=(segment.moss||[]).filter(v=>v.ty-top>=8&&v.ty-top<=20&&!E.isLavaRow(v.ty,origin)).sort((a,b)=>E.hash(a.tx,a.ty,seed+183)-E.hash(b.tx,b.ty,seed+183));for(let v of candidates){if((segment.camps||[]).some(c=>v.x>c.x-160&&v.x<c.x+c.width+160&&Math.abs(v.y-c.y)<160))continue;let x=v.x-9,y=v.y-34;if(!clearBox(world,x,y,18,34))continue;if(trace.some(q=>Math.hypot(q.x+PW/2-(x+9),q.y+PH/2-(y+16))<=165))continue;if(shadows.some(e=>Math.hypot(e.x-x,e.y-y)<100))continue;shadows.push({chance:level.chance,id:'dark:'+segment.id+':'+shadows.length,x,y,homeY:y,roll:E.hash(segment.id,41,seed+781),phase:'idle',seen:false,w:18,h:34});if(shadows.length>=level.enemyCap)break}}
let ceilings=[];for(let y=3;y<=15;y++)for(let x=3;x<E.W-3;x++)if(!E.isLavaRow(top+y,origin)&&world.solid(x,top+y-1)&&!world.solid(x,top+y)&&!world.solid(x,top+y+1)&&!world.solid(x,top+y+2)&&E.hash(x,top+y,seed+621)<(top-origin>=500?.7:.45)){if((segment.camps||[]).some(c=>x*T>c.x-20&&x*T<c.x+c.width+20&&(top+y)*T<c.y&&c.y-(top+y)*T<300))continue;let stone={id:'stone:'+segment.id+':'+x+':'+y,x:x*T+10,y:(top+y)*T,length:23+Math.floor(E.hash(x,top+y,seed+624)*8),phase:'hanging',vy:0,timer:0};if(!trace.some(q=>underStone(q,stone)))ceilings.push(stone)}
ceilings.sort((a,b)=>E.hash(a.x,a.y,seed+626)-E.hash(b.x,b.y,seed+626));for(let s of ceilings){if(stones.some(v=>Math.abs(v.x-s.x)<(top-origin>=500?28:40)&&Math.abs(v.y-s.y)<70))continue;stones.push(s);if(stones.length>=level.stoneCap)break}
for(let cycle=Math.max(0,Math.floor((top-origin-250)/250));cycle<=Math.floor((top+H-origin-250)/250);cycle++){let start=origin+250+cycle*250;for(let offset of [15,40,65,90])if(Math.floor((start+offset)/H)===segment.id&&E.isLavaRow(top+Math.max(8,Math.min(20,start+offset-top)),origin)){
let chosen=null;for(let delay of [1.2,1.6,2]){let candidate={id:'jet:'+cycle+':'+offset,y:(top+Math.max(8,Math.min(20,start+offset-top)))*T,minY:top*T,dir:E.hash(cycle,offset,seed+637)<.5?1:-1,delay,phase:'idle',timer:0,x:0,hit:false},copy={...candidate},actor={...segment.entry},okay=true;for(let [d,j,v]of segment.proof.commands){E.step(actor,d,!!j,world,v||0);let events=[];updateJets([copy],actor,E.DT,events);if(events.some(e=>e.type==='hit')){okay=false;break}}if(okay){chosen=candidate;break}}if(chosen)jets.push(chosen)}}
segment.threats={shadows,stones,jets};return segment.threats;
}
function updateDizziness(p,ores,collected,dt=E.DT){let near=ores.some(o=>o.type===9&&o.enabled!==false&&!collected.has(o.id)&&Math.hypot(p.x+PW/2-o.x,p.y+PH/2-(o.y-12))<=7*T);p.dizzy=near?10:Math.max(0,(p.dizzy||0)-dt);p.radiationNear=near;return near}
function reveal(segment,stats){if(segment.populationActive)return;segment.populationActive=true;for(let ore of segment.ores||[])ore.enabled=(ore.spawnRoll??0)<(stats.oreRate??1);for(let shadow of segment.threats?.shadows||[])if(shadow.roll>=(shadow.chance??.85)*(stats.enemyRate??1))shadow.phase='gone';}
function hurt(p,kind,events){if((p.hazardCooldown||0)>0)return false;p.hp=Math.max(0,p.hp-1);p.hazardCooldown=1.1;p.lastHazard=kind;events.push({type:'hit',kind,x:p.x+PW/2,y:p.y+12});return true}
// Air-cell BFS supplies a local waypoint around solid ledges; it never moves
// the enemy. Each candidate control is then simulated with the player's exact
// gravity, water and collision integrator before a short input plan is chosen.
function waypoint(actor,target,world){
const sx=Math.floor((actor.x+PW/2)/T),sy=Math.floor(actor.y/T),tx=Math.floor((target.x+PW/2)/T),ty=Math.floor(target.y/T),lo=Math.max(0,Math.min(sy,ty)-6),hi=Math.max(sy,ty)+8;
const rows=Math.min(44,hi-lo+1),key=(x,y)=>(y-lo)*E.W+x,valid=(x,y)=>x>=2&&x<E.W-2&&y>=lo&&y<lo+rows&&!world.solid(x,y)&&!world.solid(x,y+1);
if(!valid(sx,sy))return {x:target.x,y:target.y};let start=key(sx,sy),parents=new Int32Array(rows*E.W).fill(-1),queue=[start],head=0,best=start,score=Infinity;parents[start]=start;
while(head<queue.length){let k=queue[head++],x=k%E.W,y=Math.floor(k/E.W)+lo,d=Math.abs(x-tx)+Math.abs(y-ty);if(d<score){score=d;best=k}if(d===0)break;for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=x+dx,ny=y+dy;if(!valid(nx,ny))continue;let n=key(nx,ny);if(parents[n]<0){parents[n]=k;queue.push(n)}}}
let path=[];for(let k=best;k!==start&&parents[k]>=0;k=parents[k])path.push(k);path.reverse();let k=path[Math.min(2,path.length-1)];if(k===undefined)return {x:target.x,y:target.y};return {x:(k%E.W)*T+3,y:(Math.floor(k/E.W)+lo)*T};
}
function planEnemy(actor,target,world){let goal=waypoint(actor,target,world),best=null,bestScore=Infinity,inPool=E.waterAt(actor,world).pool;
for(let dir of [-1,0,1])for(let option of (inPool?[-1,0,1]:[-1,0])){
if(inPool&&!dir&&!option)continue;let a={...actor},commands=[],closest=Infinity,nearTerm=Infinity;for(let i=0;i<42;i++){let jump=!inPool&&(i===option||(option===0&&i===18));let swim=inPool?option:0;E.step(a,dir,jump,world,swim);commands.push([dir,jump?1:0,swim]);let d=Math.abs(a.x-goal.x)+Math.abs(a.y-goal.y)*1.15;if(i>=5)closest=Math.min(closest,d);if(i===11)nearTerm=d;if(a.dead)break;}
let distance=Math.abs(a.x-goal.x)+Math.abs(a.y-goal.y)*1.15,progress=Math.hypot(a.x-actor.x,a.y-actor.y),cost=closest+nearTerm*.25+distance*.05+(a.dead?2000:0)+(a.hp<actor.hp?250:0)+(progress<1&&Math.hypot(goal.x-actor.x,goal.y-actor.y)>25?25:0)+(option>=0&&!inPool?2:0);
if(cost<bestScore){bestScore=cost;best=commands.slice(0,12)}}return best||[[0,0,0]];
}
function update(threats,p,world,cam,dt=E.DT,viewH=640){const events=[];p.hazardCooldown=Math.max(0,(p.hazardCooldown||0)-dt);const stats=E.traits(p);
for(let e of threats.shadows||[]){if(e.phase==='gone')continue;if(e.phase==='poisoned'){e.corpseVelocity=Math.min(400,(e.corpseVelocity||0)+900*dt);let ny=e.y+e.corpseVelocity*dt;if(world.solid(Math.floor((e.x+12)/T),Math.floor((ny+8)/T))){e.y=Math.floor((ny+8)/T)*T-8;e.corpseVelocity=0}else e.y=ny;continue}if(world.biome?.(Math.floor((p.y+PH)/T))==='lava'||world.biome?.(Math.floor((e.y+34)/T))==='lava'){e.phase='gone';continue}const visible=e.y+e.h>=cam&&e.y<=cam+viewH&&e.x+e.w>=0&&e.x<=E.W*T;if(visible)e.seen=true;else if(e.seen){e.phase='gone';events.push({type:'vanish',x:e.x+9,y:e.y+16});continue}else continue;
if(!e.actor){e.actor=E.spawn(e.x+2,e.y+6);e.actor.isEnemy=true;e.actor.moveSpeed=135;e.plan=[];}
let a=e.actor,dx=p.x+PW/2-(a.x+PW/2),dy=p.y+PH/2-(a.y+PH/2),distance=Math.hypot(dx,dy);a.moveSpeed=Math.min(195,135*(stats.enemySpeed??1));
if(e.phase==='idle'&&distance<=7*T){e.phase='chasing';events.push({type:'awaken',x:e.x+9,y:e.y+12})}
if(e.phase==='chasing'&&!e.plan.length)e.plan=planEnemy(a,p,world);let control=e.phase==='chasing'?e.plan.shift()||[0,0,0]:[0,0,0];E.step(a,control[0],!!control[1],world,control[2]);e.x=a.x-2;e.y=a.y-6;
if(a.dead){e.phase='gone';events.push({type:'vanish',x:e.x+9,y:e.y+16});continue}
if(e.phase==='chasing'&&p.x+PW>a.x&&p.x<a.x+PW&&p.y+PH>a.y&&p.y<a.y+PH)hurt(p,'黑暗',events);
}
for(let s of threats.stones||[]){if(s.phase==='gone')continue;if(s.phase==='hanging'){if(underStone(p,s)){s.phase='warning';s.timer=.32;events.push({type:'rattle',x:s.x,y:s.y+s.length})}continue}if(s.phase==='warning'){s.timer-=dt;if(s.timer<=0)s.phase='falling';continue}
if(s.phase==='falling'){s.vy=Math.min(650,s.vy+1100*dt);let dy=s.vy*dt,parts=Math.max(1,Math.ceil(dy/3));for(let i=0;i<parts;i++){s.y+=dy/parts;let tip=s.y+s.length;if(world.solid(Math.floor(s.x/T),Math.floor(tip/T))){s.phase='gone';events.push({type:'shatter',x:s.x,y:tip,drop:{id:s.id+':aragonite',x:s.x,y:Math.floor(tip/T)*T,type:8,spawnRoll:0,enabled:true}});break}if(p.x+PW>s.x-6&&p.x<s.x+6&&p.y+PH>s.y&&p.y<tip){if(!s.hit){hurt(p,'石钟乳',events);s.hit=true}}}}}
updateJets(threats.jets,p,dt,events);p.dead=p.hp<=0||p.y<p.ceiling+12;return events;
}
const api={updateDizziness,populate,reveal,update,difficulty,updateJets,underStone,clearBox,waypoint,planEnemy};if(typeof module!=='undefined')module.exports=api;root.CaveThreats=api;
})(typeof self!=='undefined'?self:globalThis);
