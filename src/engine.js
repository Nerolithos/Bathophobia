/* Shared by the game, generation worker and executable certificate tests. */
(function(root){
'use strict';
const T=20,W=48,H=36,DT=1/60,SAFE=160,PW=14,PH=28;
function hash(x,y,seed){let n=Math.imul(x^seed,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296}
function isLavaRow(y,origin=0){let depth=y-origin;return depth>=250&&(depth-250)%250<100}
function terrain(seed,id,attempt,origin=0){const pad=6,rows=H+pad*2,salt=(seed^Math.imul(attempt+1,19349663)^Math.imul(id+1,83492791))>>>0;let a=Array.from({length:rows},(_,y)=>Uint8Array.from({length:W},(_,x)=>x<2||x>=W-2||(isLavaRow(y+id*H-pad,origin)?(.63*hash(Math.floor(x/3),Math.floor((y+id*H-pad+Math.floor(hash(Math.floor(x/3),0,salt+78)*15))/12),salt+913)+.37*hash(x,y+id*H-pad,salt)):hash(x,y+id*H-pad,salt))<.455?1:0));for(let pass=0;pass<5;pass++){let b=a.map(r=>r.slice());for(let y=1;y<rows-1;y++)for(let x=2;x<W-2;x++){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)n+=a[y+dy][x+dx];b[y][x]=isLavaRow(y+id*H-pad,origin)&&pass>=2?+(a[y-1][x]+a[y][x]+a[y+1][x]>=2):(a[y][x]?+(n>=4):+(n>=5))}a=b}return a.slice(pad,pad+H)}
function components(a){let seen=new Int16Array(W*H).fill(-1),groups=[];for(let y=0;y<H;y++)for(let x=2;x<W-2;x++){let k=y*W+x;if(a[y][x]||seen[k]>=0)continue;let q=[k],head=0,id=groups.length;seen[k]=id;while(head<q.length){let i=q[head++],cx=i%W,cy=Math.floor(i/W);for(let [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let xx=cx+dx,yy=cy+dy,kk=yy*W+xx;if(xx>=2&&xx<W-2&&yy>=0&&yy<H&&!a[yy][xx]&&seen[kk]<0){seen[kk]=id;q.push(kk)}}}groups.push(q)}return {seen,groups}}
function worldFor(segment,previous){let top=segment.id*H,bottom=top+H,fungi=[...(previous?.mushrooms||[]),...(segment.mushrooms||[])];return {top,bottom,biome(y){return isLavaRow(y,segment.originRow||0)?'lava':'cave'},solid(x,y){if(x<2||x>=W-2)return true;if(y<0)return true;if(y>=top&&y<bottom)return !!segment.tiles[y-top][x];if(previous&&y>=top-H&&y<top)return !!previous.tiles[y-(top-H)][x];return y<top},water(x,y){if(y>=top&&y<bottom)return segment.water?.[y-top]?.[x]||null;if(previous&&y>=top-H&&y<top)return previous.water?.[y-(top-H)]?.[x]||null;return null},mushrooms(){return fungi},maxJumps:Math.max(1,...fungi.map(m=>EFFECTS[m.effect].jumps))}}
function collides(s,x,y,world){for(let yy=Math.floor(y/T);yy<=Math.floor((y+PH-.001)/T);yy++)for(let xx=Math.floor(x/T);xx<=Math.floor((x+PW-.001)/T);xx++)if(world.solid(xx,yy))return true;return false}
function waterAt(s,world){let pool=false,flow=0,lava=false;for(let yy=Math.floor((s.y+PH*.35)/T);yy<=Math.floor((s.y+PH-2)/T);yy++)for(let xx=Math.floor(s.x/T);xx<=Math.floor((s.x+PW-.01)/T);xx++){let w=world.water(xx,yy);if(w?.lava&&w.strength>0)lava=true;if(w?.pool)pool=true;if(w&&!w.pool)flow=Math.max(flow,w.strength)}return {pool,flow,lava}}
const EFFECTS=[
{name:'正常',label:'标准二连跳',speed:1,jumps:2,safe:1,tone:'neutral'},
{name:'轻风孢子',label:'速度 +10%',speed:1.1,jumps:2,safe:1,tone:'positive'},
{name:'飞羽孢子',label:'三段跳',speed:1,jumps:3,safe:1,tone:'positive'},
{name:'沉重孢子',label:'仅一次跳跃',speed:1,jumps:1,safe:1,tone:'negative'},
{name:'软着陆',label:'免伤高度 +10%',speed:1,jumps:2,safe:1.1,tone:'positive'},
{name:'迟缓孢子',label:'速度 −10%',speed:.9,jumps:2,safe:1,tone:'negative'}];
for(let [name,label,key,value,tone] of [['静夜孢子','敌人速度 −25%','enemySpeed',.75,'positive'],['躁动孢子','敌人速度 +25%','enemySpeed',1.25,'negative'],['隐匿孢子','敌人刷新 −40%','enemyRate',.6,'positive'],['引暗孢子','敌人刷新 +40%','enemyRate',1.4,'negative'],['寻矿孢子','矿物刷新 +40%','oreRate',1.4,'positive'],['贫矿孢子','矿物刷新 −40%','oreRate',.6,'negative']])EFFECTS.push({name,label,speed:1,jumps:2,safe:1,tone,[key]:value});
for(let e of EFFECTS){e.enemySpeed??=1;e.enemyRate??=1;e.oreRate??=1}
const traits=s=>EFFECTS[s.effectId||0]||EFFECTS[0];
function collectMushrooms(s,world){if(s.isEnemy)return;for(let item of world.mushrooms?.(s.y)||[]){if((s.eatenMushrooms||[]).includes(item.id))continue;if(s.x+PW>item.x-8&&s.x<item.x+8&&s.y+PH>item.y-14&&s.y<item.y){s.effectId=item.effect;s.eatenMushrooms=[...(s.eatenMushrooms||[]),item.id].slice(-8);s.jumps=Math.min(s.jumps,traits(s).jumps);s.effectPickup=item.id;}}}
function spawn(x,y){return {x,y,vx:0,vy:0,apex:y,jumps:0,ground:true,hp:5,time:0,ceiling:-450,wet:false,damage:0,dead:false,effectId:0,eatenMushrooms:[]}}
function step(s,dir,jump,world,swim=0){s.damage=0;s.damageKind=null;s.didJump=false;s.effectPickup=null;collectMushrooms(s,world);let stats=traits(s),w=waterAt(s,world),speed=(s.moveSpeed??170)*stats.speed;
if(w.pool){let scale=dir&&swim?Math.SQRT1_2:1;s.vx=dir*speed*(140/170)*scale;s.vy=swim*speed*(140/170)*scale;s.jumps=0;s.apex=s.y;}else{if(jump&&s.jumps<stats.jumps){s.vy=-340;s.jumps++;s.didJump=true;s.ground=false;s.apex=s.y}s.vx=dir*speed;s.vy=Math.min(w.flow>.1?170:610,s.vy+900*DT);if(w.flow>.1)s.apex=Math.max(s.apex,s.y-60);if(s.vy<0)s.apex=s.y;}
// Each fixed-timestep displacement is smaller than a tile: checking the
// destination and snapping to the crossed grid face is a swept tile collision.
let dx=s.vx*DT,nx=s.x+dx;if(!collides(s,nx,s.y,world))s.x=nx;else if(dx>0)s.x=Math.floor((nx+PW)/T)*T-PW;else if(dx<0)s.x=(Math.floor(nx/T)+1)*T;
s.ground=false;let dy=s.vy*DT,ny=s.y+dy,impact=s.vy;
if(!collides(s,s.x,ny,world))s.y=ny;else{if(dy>0){s.y=Math.floor((ny+PH)/T)*T-PH;w=waterAt(s,world);let fall=s.y-s.apex;if(!w.pool&&fall>SAFE*stats.safe+.01&&impact>350){s.damage=Math.min(5,Math.ceil((fall-SAFE*stats.safe)/80));s.hp-=s.damage;s.damageKind='fall'}s.ground=true;s.jumps=0;s.apex=s.y}else if(dy<0)s.y=(Math.floor(ny/T)+1)*T;s.vy=0;}

w=waterAt(s,world);s.inLava=w.lava;s.lavaExposure=w.lava?(s.lavaExposure||0)+DT:0;if(s.lavaExposure>=1-1e-9){s.lavaExposure-=1;s.hp--;s.damage++;s.damageKind='lava'}if(w.pool&&!w.lava&&!s.wet)s.hp=Math.min(5,s.hp+1);s.wet=w.pool;s.flow=w.flow;s.time+=DT;if(!s.isEnemy&&s.time>12){s.ceiling+=DT*(31+Math.min(25,s.time/25));s.ceiling=Math.max(s.ceiling,s.y-1000)}collectMushrooms(s,world);s.dead=s.hp<=0||(!s.isEnemy&&s.y<s.ceiling+12);return s}
// Reservoir scanline: gravity first; supported water spreads sideways. Closed
// basins fill up to the spring head; open lips spill. No rock is ever changed.
function waterField(segment,previous,seed,customSources){let water=Array.from({length:H},()=>Array(W).fill(null)),sources=[],inflow=[];segment.water=water;let world=worldFor(segment,previous),top=segment.id*H,bottom=top+H;
let hotSprings=[];for(let y=3;y<H-4;y++)for(let x=3;x<W-3;x++){if(!segment.tiles[y][x]&&segment.tiles[y+1][x]&&!segment.tiles[y-1][x]){let spring={x,y:y+top,head:y+top};if(isLavaRow(y+top,segment.originRow||0))hotSprings.push(spring);else if(hash(x,y+top,seed+719)<.025)sources.push(spring)}}if(hotSprings.length){hotSprings.sort((a,b)=>hash(a.x,a.y,seed+719)-hash(b.x,b.y,seed+719));sources.push(hotSprings[0]);}

if(customSources)sources=customSources;
if(previous)for(let x=2;x<W-2;x++){let w=previous.water[H-1][x];if(w&&!w.pool&&w.run<12)inflow.push({x,y:top,head:top,run:w.run+1})}
let queue=[...sources,...inflow],seen=new Set(),iterations=0,queueHead=0;function set(x,y,value){if(y<top||y>=bottom||world.solid(x,y))return;let old=water[y-top][x];if(!old||value.pool||(!old.pool&&value.strength>old.strength))water[y-top][x]=value}function support(x,y){return world.solid(x,y)||!!water[y-top]?.[x]?.pool}
while(queueHead<queue.length&&iterations++<12000){let {x,y,head,run=0}=queue[queueHead++];if(x<2||x>=W-2||y<top||y>=bottom||world.solid(x,y))continue;let tag=x+','+y+','+head+','+run;if(seen.has(tag))continue;seen.add(tag);
while(y<bottom&&!world.solid(x,y)&&!support(x,y+1)){let strength=run<=8?1:Math.max(0,(12-run)/4);set(x,y,{pool:false,run,strength});if(run>=12){y=bottom;break}y++;run++}if(y>=bottom||world.solid(x,y))continue;
if(isLavaRow(y,segment.originRow||0))head=Math.max(head,y-1);let fillY=y;while(fillY>=head&&fillY>=top){let left=x,right=x,wallL=false,wallR=false;while(left>2){if(world.solid(left-1,fillY)){wallL=true;break}left--;if(!support(left,fillY+1))break}while(right<W-3){if(world.solid(right+1,fillY)){wallR=true;break}right++;if(!support(right,fillY+1))break}
let bounded=wallL&&wallR;for(let xx=left;xx<=right;xx++)set(xx,fillY,{pool:bounded,run:0,strength:1});if(bounded){fillY--;continue}if(!wallL)queue.push({x:left,y:fillY,head:fillY,run:0});if(!wallR)queue.push({x:right,y:fillY,head:fillY,run:0});break}}
for(let y=0;y<H;y++)for(let x=2;x<W-2;x++)if(water[y][x]&&isLavaRow(top+y,segment.originRow||0))water[y][x].lava=true;segment.sources=sources;return water}
class Heap{constructor(){this.a=[]}push(v){let a=this.a,i=a.length;a.push(v);while(i){let j=(i-1)>>1;if(a[j].priority<=v.priority)break;a[i]=a[j];i=j}a[i]=v}pop(){let a=this.a,r=a[0],v=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].priority<a[j].priority)j++;if(a[j].priority>=v.priority)break;a[i]=a[j];i=j}a[i]=v}return r}get length(){return this.a.length}}
const ACTIONS=[];for(let dir of [-1,0,1]){if(dir)ACTIONS.push({dir,walk:true});ACTIONS.push({dir,jump:false,second:-1});ACTIONS.push({dir,jump:true,second:-1});for(let second of [18,30,42])ACTIONS.push({dir,jump:true,second})}
for(let dir of [-1,0,1])for(let timing of [[18,36],[24,48],[30,60]])ACTIONS.push({dir,jump:true,second:timing[0],third:timing[1]});
for(let dir of [-1,0,1])for(let swim of [-1,0,1])if(dir||swim)ACTIONS.push({dir,swim,swimAction:true,jump:false,second:-1});
function nodeKey(s){return Math.round(s.x/10)+','+Math.round(s.y/10)+','+(s.ground?1:0)+','+(s.effectId||0)+','+(s.eatenMushrooms||[]).join('.')}
function transition(state,action,world){let s={...state},air=!s.ground,frames=0;let limit=action.walk||action.swimAction?6:160;const jumpAt=i=>(action.jump&&i===0)||i===action.second||i===action.third;const finish=exit=>({s,commands:Array.from({length:frames},(_,i)=>[action.dir,jumpAt(i)?1:0,action.swim||0]),exit});for(let i=0;i<limit;i++){frames++;step(s,action.dir,jumpAt(i),world,action.swim||0);if(s.dead||s.damage>0||s.inLava)return null;if(s.y+PH>=world.bottom*T){if(s.jumps>=traits(s).jumps&&s.y-s.apex>100&&!(s.flow>.1)&&!s.wet)return null;return finish(true)}if(s.y<world.top*T-140)return null;if(!s.ground)air=true;if(air&&s.ground)return finish(false);}if(action.swimAction&&Math.hypot(s.x-state.x,s.y-state.y)>3)return finish(false);if(action.walk&&s.ground&&Math.abs(s.x-state.x)>5)return finish(false);return null}
// A* on physical landing states, with an admissible depth / max-speed bound. Every edge retains its exact input replay.
// No damage edge is allowed, and collapse deadlines are checked at every tick.
function solve(segment,previous,entry,maxNodes=1300){let world=worldFor(segment,previous);if(collides(entry,entry.x,entry.y,world))return null;let heap=new Heap(),dist=new Map(),start={s:{...entry},cost:0,priority:Math.max(0,world.bottom*T-entry.y-PH)/610,parent:null,commands:[]};heap.push(start);dist.set(nodeKey(entry),0);let expanded=0;while(heap.length&&expanded++<maxNodes){let n=heap.pop();if(n.exit){let chain=[],points=[];for(let v=n;v?.parent;v=v.parent){chain.push(v.commands);points.push({x:v.s.x+PW/2,y:v.s.y+PH,ground:v.s.ground})}return {commands:chain.reverse().flat(),points:points.reverse(),exit:n.s,seconds:n.cost,nodes:expanded}}let key=nodeKey(n.s);if(n.cost>dist.get(key)+1e-6)continue;let inPool=waterAt(n.s,world).pool;for(let a of ACTIONS){if(!!a.swimAction!==inPool)continue;let maxJumps=Math.max(traits(n.s).jumps,world.maxJumps);if(a.third!==undefined&&maxJumps<3)continue;if(a.second>=0&&maxJumps<2)continue;if(a.walk&&!n.s.ground)continue;if(n.s.ground&&!a.dir&&!a.jump&&!a.walk&&!a.swimAction)continue;let tr=transition(n.s,a,world);if(!tr)continue;let cost=n.cost+tr.commands.length*DT,next={s:tr.s,cost,priority:cost+Math.max(0,world.bottom*T-tr.s.y-PH)/610,parent:n,commands:tr.commands,exit:tr.exit};if(tr.exit){heap.push(next);continue}let k=nodeKey(tr.s);if(cost<(dist.get(k)??Infinity)-1e-6){dist.set(k,cost);heap.push(next)}}}return null}
function findStarts(segment,labels){let c=labels||components(segment.tiles),world=worldFor(segment,null),list=[];for(let y=3;y<12;y++)for(let x=4;x<W-4;x++){let s=spawn(x*T+3,y*T-PH);if(segment.tiles[y][x]&&!collides(s,s.x,s.y,world)&&c.groups[c.seen[(y-1)*W+x]]?.length>120)list.push(s)}return list.sort((a,b)=>Math.abs(a.x-W*T/2)-Math.abs(b.x-W*T/2))}
function populate(segment,previous,seed){
let world=worldFor(segment,previous),surfaces=[],moss=[];const top=segment.id*H;
for(let y=3;y<H-2;y++)for(let x=3;x<W-3;x++){
let gy=top+y,state=spawn(x*T+3,gy*T-PH);
if(!segment.tiles[y][x]||collides(state,state.x,state.y,world)||world.water(x,gy-1)||world.water(x-1,gy-1)||world.water(x+1,gy-1))continue;
let surface={tx:x,ty:gy,x:x*T+10,y:gy*T,lava:isLavaRow(gy,segment.originRow||0)};surfaces.push(surface);
if(hash(Math.floor(x/3),Math.floor(gy/2),seed+319)<.52&&hash(x,gy,seed+69)<.72)moss.push(surface);
}
segment.moss=moss;segment.mushrooms=[];let last=previous?.lastMushroomY??0;
let eligible=moss.filter(v=>v.ty-last>=50&&v.ty-last<=70);
if(eligible.length){eligible.sort((a,b)=>hash(a.tx,a.ty,seed+901)-hash(b.tx,b.ty,seed+901));let v=eligible[0];segment.mushrooms=[{...v,id:segment.id,effect:1+Math.floor(hash(v.tx,v.ty,seed+912)*(EFFECTS.length-1))}];last=v.ty;}
if(top+H-1>last+70)return false;
segment.lastMushroomY=last;
let mushrooms=new Set(segment.mushrooms.map(v=>v.tx+','+v.ty));
segment.ores=surfaces.filter(v=>!mushrooms.has(v.tx+','+v.ty)&&hash(v.tx,v.ty,seed+477)<.224).sort((a,b)=>hash(a.tx,a.ty,seed+478)-hash(b.tx,b.ty,seed+478)).slice(0,10).map((v,i)=>({...v,spawnRoll:hash(v.tx,v.ty,seed+477)/.16,id:segment.id+':'+i,type:(v.lava?3:0)+Math.floor(hash(v.tx,v.ty,seed+511)*3)}));
return true;}
function makeSegment(seed,id,previous,entry,startAttempt=0,attemptCount=80){for(let attempt=startAttempt;attempt<startAttempt+attemptCount;attempt++){let origin=previous?.originRow||0,seg={id,attempt,originRow:origin,tiles:terrain(seed,id,attempt,origin)};let bfs=components(seg.tiles);if(!bfs.groups.some(g=>g.some(k=>k<W)&&g.some(k=>k>=W*(H-1))))continue;waterField(seg,previous,seed);if(!populate(seg,previous,seed))continue;let starts=entry?[entry]:findStarts(seg,bfs).slice(0,4);for(let s of starts){let proof=solve(seg,previous,s);if(proof){if(id===0){seg.lastMushroomY=Math.round((s.y+PH)/T);seg.originRow=seg.lastMushroomY;}seg.entry={...s};seg.proof=proof;seg.bfsComponents=bfs.groups.length;return seg}}}return null}
const api={T,W,H,DT,SAFE,PW,PH,EFFECTS,isLavaRow,traits,collectMushrooms,populate,hash,terrain,components,worldFor,collides,waterAt,waterField,spawn,step,transition,solve,makeSegment,ACTIONS};if(typeof module!=='undefined')module.exports=api;root.CaveEngine=api;
})(typeof self!=='undefined'?self:globalThis);
