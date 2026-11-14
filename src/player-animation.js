(function(root){'use strict';const art=typeof module!=='undefined'?require('./player-art'):root.CavePlayerArt,actors=new WeakMap(),cache=new Map();
const times={idle:[500,160,400,300],walk:[110,90,110,110,90,110],run:[70,90,50,70,80,90],jump:[55,50,130,90,160],land:[80,40,60],swim:[140,160,140,160,140,160],mine:[80,100,40,60,55,120],hurt:[100,120],death:[130,150,600],fly:[300],turn:[100,100,30]};
function update(p,dt=1/60){let m=actors.get(p);if(!m){m={x:p.x,ground:p.ground,hp:p.hp,time:0,age:0,state:'idle',lock:0,blink:3.7,ghosts:[]};actors.set(p,m)}m.time+=dt;let speed=Math.abs(p.x-m.x)/dt,state;const jump=p.didJump||p.didBounce,land=!m.ground&&p.ground&&m.vy>90;if(p.dead)state='death';else if(p.hp<m.hp){state='hurt';m.lock=m.time+.22}else if(m.state==='hurt'&&m.time<m.lock)state='hurt';else if(p.wet&&!p.inLava)state=speed<8&&Math.abs(p.vy||0)<8?'tread':'swim';else if(p.flying)state='fly';else if(p.miningUntil>p.time)state='mine';else if(jump){state='jump';m.lock=m.time+.105}else if(land){state='land';m.lock=m.time+.18}else if(m.time<m.lock)state=m.state;else if(!p.ground)state='jump';else if(speed>8)state=speed>=160?'run':'walk';else if(['walk','run'].includes(m.state)){state='turn';m.lock=m.time+.2}else state='idle';if(state!==m.state){m.state=state;m.age=0}else m.age+=dt*1000;m.x=p.x;m.vy=p.vy||0;m.ground=p.ground;m.hp=p.hp;m.frame=frameId(m,p);m.ghosts=m.ghosts.filter(g=>(g.life-=dt)>0);if((jump||state==='hurt'||state==='jump'&&p.vy>480)&&m.time-(m.lastGhost||0)>.05){m.ghosts.push({x:p.x,y:p.y,face:p.face,id:m.frame,life:.12});m.ghosts=m.ghosts.slice(-3);m.lastGhost=m.time}return m}
function frameId(m,p){if(m.state==='tread'||m.state==='swim'&&p.swimsuit)return (p.swimsuit?'bath-':'tread-')+Math.floor(m.age/(m.state==='swim'?140:240))%4;if(m.state==='jump'){if(m.time<m.lock)return m.age<55?'jump-0':'jump-1';return p.vy< -65?'jump-2':p.vy>65?'jump-4':'jump-3'}if(m.state==='idle'&&m.time>m.blink){if(m.time<m.blink+.12)return 'blink-0';m.blink=m.time+3+(Math.sin(m.time*19)+1)*1.5}let seq=art.clips[m.state],d=times[m.state],sum=d.reduce((a,b)=>a+b,0),t=['death','land','turn','hurt'].includes(m.state)?Math.min(m.age,sum-1):m.age%sum;let i=0;while(i<d.length-1&&t>=d[i])t-=d[i++];return seq[i]}
// Water poses reuse the approved head, palette and scale. Only torso/limbs are authored anew.
function decode(data,id){let out=[];for(let i=0,r=data.frames[id];i<r.length;i+=2)for(let k=0;k<r[i];k++)out.push(r[i+1]);return out}
function waterPose(size,id){let d=art.sizes[size],pixels=decode(d,'idle-0'),base=art.sizes[48],phase=Number(id.at(-1)),bath=id.startsWith('bath'),sx=d.width/base.width,sy=d.height/base.height;
function box(x,y,w,h,color){for(let yy=Math.round(y*sy);yy<Math.round((y+h)*sy);yy++)for(let xx=Math.round(x*sx);xx<Math.round((x+w)*sx);xx++)if(xx>=0&&xx<d.width&&yy>=0&&yy<d.height)pixels[yy*d.width+xx]=color}
// Leave the original face, ears, bangs and chin untouched above the shoulders.
box(0,27,56,37,0);
const pattern=bath?[
'   oo   ',
'  oss o ',
' sGssGs ',
' sGssGs ',
'  GGGG  ',
'  GgGG  ',
'  GGgG  ',
'  GGGG  ',
'  GggG  ',
'  GGGG  ',
'  s  s  ',
'  s  s  ',
'  s  s  ']:[
'   oo   ',
'  GGGG  ',
' GGgGGG ',
' GGgGGG ',
'  GGGG  ',
'  GgGG  ',
'  GGGG  ',
'  GGGG  ',
' GGGgGG ',
' GGGgGG ',
' GGGGGG ',
'  s  s  ',
'  s  s  '];
const palette={o:9,s:8,G:bath?13:18,g:bath?12:17};pattern.forEach((row,y)=>[...row].forEach((p,x)=>{if(p!==' ')box(23+x,26+y,1,1,palette[p])}));
// Relaxed bent elbows sweep out/in; feet alternate softly beneath the surface.
let spread=[0,2,3,1][phase],lift=[0,1,0,-1][phase];box(22,29,2,5,bath?8:18);box(30,29,2,5,bath?8:18);box(20-spread,33+lift,4+spread,2,8);box(31,33-lift,4+spread,2,8);box(19-spread,32+lift,2,2,9);box(34+spread,32-lift,2,2,9);box(25,38,2,8+(phase%2),8);box(28,38,2,7+((phase+1)%2),8);box(24-(phase%2),45,3,2,bath?9:21);box(29,44,3,2,bath?9:21);
// Short, tapered tail trails behind the hip rather than becoming a rigid pipe.
box(21,34,2,4,4);box(18,37,4,2,4);box(17,36+phase%2,2,2,5);return pixels}
function sprite(c,id,size=40){let key=size+id;if(cache.has(key))return cache.get(key);let data=art.sizes[size],doc=c.canvas?.ownerDocument||root.document;if(!doc)return null;let s=doc.createElement('canvas');s.width=data.width;s.height=data.height;let q=s.getContext('2d'),im=q.createImageData(s.width,s.height),at=0;for(let index of /^(tread|bath)-/.test(id)?waterPose(size,id):decode(data,id)){let color=index?art.palette[index-1].slice(1).match(/../g).map(v=>parseInt(v,16)):null;if(color)im.data.set([...color,255],at*4);at++}q.putImageData(im,0,0);cache.set(key,s);return s}
function draw(c,p,cam=0,size=40){let m=actors.get(p)||update(p,1/60),data=art.sizes[size];function paint(id,x,y,face,alpha){let s=sprite(c,id,size);if(!s)return;c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.translate(Math.round(x+7),Math.round(y+28-cam));if(face<0)c.scale(-1,1);c.drawImage(s,-data.width/2,-data.baseline);c.restore()}for(let g of m.ghosts)paint(g.id,g.x,g.y,g.face,g.life*.9);paint(m.frame,p.x,p.y,p.face,!p.dead&&p.inv>0&&Math.floor(p.inv*14)%2===0?.45:1)}
const api={update,draw,times,waterPose,get:p=>actors.get(p)};if(typeof module!=='undefined')module.exports=api;root.CavePlayerAnimation=api;})(globalThis);
