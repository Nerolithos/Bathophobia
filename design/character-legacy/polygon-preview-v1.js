/* Isolated art review: no game.js, localStorage or physics mutation. */
(function(){'use strict';const E=CaveEngine,A=CaveArt,C=CavePlayerConcept,T=E.T;
for(let canvas of document.querySelectorAll('[data-pose]'))C.draw(canvas.getContext('2d'),canvas.dataset.pose,canvas.width/2,C.BASELINE*Number(canvas.dataset.scale),Number(canvas.dataset.scale));
const segment=E.makeSegment(11,0,null,null,0,200);if(!segment)throw Error('Cannot create review cave');const world=E.worldFor(segment,null),candidates=[];
for(let y=7;y<23;y++)for(let x=3;x<E.W-3;x++)if(world.solid(x,y)&&[1,2,3].every(d=>!world.solid(x,y-d)&&!world.water(x,y-d)))candidates.push({tx:x,ty:y,x:x*T+10,y:y*T});
let used=[];const stands=[12,24,36].map(target=>{let options=candidates.filter(p=>used.every(q=>Math.abs(q.tx-p.tx)>5));options.sort((a,b)=>Math.abs(a.tx-target)+Math.abs(a.ty-15)*.45-Math.abs(b.tx-target)-Math.abs(b.ty-15)*.45);let p=options[0];if(!p)throw Error('Not enough natural platforms for review');used.push(p);return p});
function bounds(c,x,y){if(!document.querySelector('#bounds').checked)return;c.strokeStyle='#c6d89b';c.lineWidth=1;c.setLineDash([2,2]);c.strokeRect(Math.round(x-7)+.5,Math.round(y-28)+.5,14,28);c.setLineDash([])}
function label(c,text,x,y){c.fillStyle='#dce8cf';c.font='10px monospace';c.textAlign='center';c.fillText(text,x,y)}
function render(){let canvas=document.querySelector('#surfacePreview'),c=canvas.getContext('2d'),s=CaveSurface.create(2),home={progress:0,station:{furnaceTier:1}};s.time=2;CaveSurface.draw(c,s,canvas.height,home,()=>{});let floor=Math.floor(canvas.height*.73/T)*T;
A.hero(c,{x:227,y:floor-28,vx:0,face:1,ground:true,time:0},0,0,[]);bounds(c,234,floor);label(c,'ORIGINAL',234,floor-54);C.poses.forEach((pose,i)=>{let x=390+i*150;C.draw(c,pose,x,floor);bounds(c,x,floor);label(c,['IDLE 3/4','SIDE RIGHT','SIDE LEFT'][i],x,floor-54)});
canvas=document.querySelector('#cavePreview');c=canvas.getContext('2d');let cam=80;c.fillStyle='#0b1919';c.fillRect(0,0,960,420);A.parallax(c,cam,420,11,0);
for(let y=4;y<26;y++)for(let x=0;x<E.W;x++){let px=x*T,py=y*T-cam;if(world.solid(x,y)){let h=E.hash(x,y,11);c.fillStyle=h<.35?'#243a33':h<.7?'#2b4238':'#30473b';c.fillRect(px,py,T,T);c.fillStyle='#152b27';c.fillRect(px,py+18,20,2);c.fillRect(px+18,py,2,20);if(!world.solid(x,y-1)){c.fillStyle='#48644a';c.fillRect(px,py,20,3)}let mat=segment.materials?.[y]?.[x];if(mat)A.stoneMaterial(c,px,py,mat,h,segment.veinAngle?.[y]?.[x]||0,segment.veinOffset?.[y]?.[x]||0)}c.save();c.translate(0,-cam);A.water(c,x,y,world,0);c.restore()}
for(let o of segment.ores||[])if(!o.mineOnly&&o.y-cam>0&&o.y-cam<420){c.save();c.translate(0,-cam);if(o.presentation)A.attachedCrystal(c,o);else c.drawImage(A.mineralSprite(o.type,0),o.x-16,o.y-27,32,28);c.restore()}
C.poses.forEach((pose,i)=>{let p=stands[i];C.draw(c,pose,p.x,p.y-cam);bounds(c,p.x,p.y-cam);label(c,['IDLE 3/4','SIDE RIGHT','SIDE LEFT'][i],p.x,p.y-cam-54)});
document.querySelector('#sceneStatus').textContent='SEED 11 · '+stands.map(p=>'('+p.tx+','+p.ty+')').join(' / ')+' · 原生 1× 渲染，地形未修改';}
document.querySelector('#bounds').onchange=render;render();
})();
