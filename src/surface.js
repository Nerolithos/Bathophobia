/* Shared seasonal animal motion; all scenery uses the game's canvas pixel palette. */
(function(root){'use strict';
const Night=typeof module!=='undefined'?require('./night'):root.CaveNight;
const Tea=typeof module!=='undefined'?require('./tea-garden'):root.CaveTeaGarden;
const Animals=typeof module!=='undefined'?require('./animals'):root.CaveAnimals;
const Interior=typeof module!=='undefined'?require('./interior'):root.CaveInterior;
const Spring=typeof module!=='undefined'?require('./spring'):root.CaveSpring;
const {POOL,RESERVED}=Spring,poolFloor=Spring.floor;
const species=[['rabbit','swallow'],['frog','frog'],['squirrel','squirrel'],['sheep','penguin']];
// A shallow walkable engawa, independent of the spring basin and house interior floors.
const PORCH={left:704,right:762,top:-6};
function porchFloor(x,home={}){if((home.progress||0)<3||x<PORCH.left-6||x>PORCH.right+8)return 0;if(x<PORCH.left)return -3;if(x>PORCH.right)return -3;return PORCH.top}
function create(season=2,night=false){return {season,night,area:'home',time:0,x:310,y:0,vy:0,face:1,ground:true,jump:false,animals:Array.from({length:5},(_,i)=>({id:i,variant:Math.floor(i/2)%3,kind:species[season][i%2],x:310+i*110,homeX:310+i*110,y:0,dir:i%2?1:-1,phase:i*1.7}))}}
function update(s,dt,keys,height,home={}){if(s.area==='tea')return Tea.update(s,dt,keys,home);let oldX=s.x,wasWet=!!s.wet;s.didJump=false;s.time+=dt;if(Night.advance(s,home,dt))s.nightChanged=true;let tripping=!!s.tripStart&&s.time-s.tripStart<2.05;let dir=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),vertical=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0),wet=s.x>POOL.left&&s.x<POOL.right&&s.y>POOL.waterline;
if(tripping){const age=s.time-s.tripStart,slide=Math.max(0,1-age/.45)*(s.tripFace||s.face||1)*95*dt,next=s.x+slide;if(!s.inside&&!s.wet&&next>290&&next<800&&Math.abs(poolFloor(next-6)-poolFloor(next+6))<3)s.x=next;dir=0;vertical=0;keys={};}if(s.inside){Interior.update(s,dt,keys,home)}else{s.x=Math.max(0,Math.min(930,s.x+dir*(wet?105:150)*dt));if(dir)s.face=dir;let floor=Math.min(poolFloor(s.x-6),poolFloor(s.x+6),porchFloor(s.x,home)<0?porchFloor(s.x,home):Infinity);if(wet){s.vy=vertical*95;if(!vertical)s.vy=Math.max(-28,Math.min(28,(POOL.waterline+30-s.y)*4));s.y+=s.vy*dt;s.y=Math.min(floor,Math.max(-8,s.y));s.ground=false}else{if((keys.Space||keys.KeyW||keys.ArrowUp)&&!s.jump&&s.ground){s.vy=-290;s.ground=false;s.didJump=true}s.vy+=800*dt;s.y+=s.vy*dt;if(s.y>=floor){s.y=floor;s.vy=0;s.ground=true}else s.ground=false}s.jump=!!(keys.Space||keys.KeyW||keys.ArrowUp);s.wet=s.x>POOL.left&&s.x<POOL.right&&s.y>POOL.waterline;
}
s.splashes=(s.splashes||[]).filter(q=>(q.life-=dt)>0);for(let q of s.splashes){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=170*dt}if(s.wet&&!wasWet&&s.time-(s.lastSplash||-1)>.45){s.lastSplash=s.time;for(let i=0;i<12;i++)s.splashes.push({x:s.x+(i%3-1)*3,y:POOL.waterline,vx:(i-5.5)*10,vy:-35-(i*17%55),life:.45+(i%3)*.08})}
for(let a of s.animals){a.shorn=a.kind==='sheep'&&home.shearedWinter===(home.descents||0)&&(home.shearedSheep||[]).includes(a.id);a.sleeping=!!s.night;if(a.sleeping){a.y=0;a.vy=0;a.action="sleep"}else Animals.update(a,dt,s.time);if(a.kind!=='swallow'&&a.x<RESERVED.right+20){a.x=RESERVED.right+20;a.dir=1;a.homeX=Math.max(a.homeX||0,RESERVED.right+60)}}// Only sustained dry outdoor walking can trip: one low-probability check per second,
// after three seconds, with a long cooldown. Never near the pool, door or mine.
const safeWalk=!s.inside&&s.season<2&&!s.wet&&s.ground&&Math.abs(s.x-oldX)>0.1&&s.x>290&&s.x<800&&!tripping;
s.walkTime=safeWalk?(s.walkTime||0)+dt:0;
const check=Math.floor(s.walkTime||0);if(check>=3&&check!==s.lastTripCheck){s.lastTripCheck=check;if(s.time>(s.tripCooldown||0)&&tripRoll(s,check)<.055){s.tripStart=s.time;s.tripFace=s.face;s.tripCooldown=s.time+40;s.walkTime=0;tripping=true}}
if(!safeWalk)s.lastTripCheck=0;
s.hero??={x:oldX,y:s.y,ground:true};Object.assign(s.hero,{surface:true,climbing:s.climbing,tripAge:tripping?s.time-s.tripStart:null,x:s.x,y:s.y,ground:s.ground,vy:s.vy,face:s.face,didJump:s.didJump,time:s.time,wet:s.wet,swimsuit:!!(home.onsen&&s.wet),detailArt:s.detailArt!==false});let animator=typeof module!=='undefined'?require('./player-animation'):root.CavePlayerAnimation;animator.update(s.hero,dt);if(s.mineEntryBlocked&&s.x<840)s.mineEntryBlocked=false;if(!s.inside&&s.x<=1&&dir<0){Tea.enter(s,home);s.x=959;s.hero=null;return false}return !s.mineEntryBlocked&&s.x>866&&s.ground}

function tripRoll(s,tick){let x=(Math.imul((s.motionSeed??(s.season+1)*0x45d9f3b)^Math.floor(s.time),0x27d4eb2d)^tick)>>>0;x^=x>>>15;return (Math.imul(x,0x85ebca6b)>>>0)/4294967296}
function nearestSheep(s){if(s.inside||s.season!==3||!s.ground)return null;return s.animals.filter(a=>a.kind==='sheep'&&Math.abs(a.x-s.x)<44).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x))[0]||null}
function draw(c,s,height,home,hero,options={}){if(s.area==='tea'){Tea.draw(c,s,height,home,hero);return}let g=Math.floor(height*.73/20)*20,t=s.time,season=s.season,autumn=season===2,winter=season===3;
const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)},poly=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
if(!options.sharedBackground){let sky=c.createLinearGradient(0,0,0,g);sky.addColorStop(0,s.night?['#111b36','#101a30','#20182f','#121d39'][season]:winter?'#354d5c':autumn?'#36575d':'#244e4c');sky.addColorStop(1,s.night?['#374d63','#294556','#494359','#425b75'][season]:winter?'#a2b9b6':autumn?'#9ea890':'#7eaa8e');c.fillStyle=sky;c.fillRect(0,0,960,height);if(s.night){rect(730,g*.18,22,22,'#ccd9e6');rect(727,g*.18-2,8,8,sky);rect(741,g*.18+7,4,3,'#a2b5d1');for(let i=0;i<27;i++)rect(i*127%960,18+i*29%Math.max(20,g*.4),1,1,'#b9c6df')}else rect(730,g*.18,24,24,'#e7d8a5');for(let i=0;i<4;i++){let xx=(i*287+t*1.5)%1100-90,yy=g*.23+(i%2)*27;rect(xx,yy,78,3,'#b8c4ad33');rect(xx+21,yy-3,39,3,'#c4ccb633')}
for(let layer=0;layer<3;layer++){let base=g*(.5+layer*.13);let pts=[[0,g]];for(let x=0;x<=980;x+=20)pts.push([x,base-Math.sin(x*.007+layer*3)*45-Math.sin(x*.019+layer)*15]);pts.push([960,g]);poly(pts,['#405e5b','#36584f','#2d4e40'][layer])}
}
if(!options.sharedBackground)Spring.backdrop(c,g,t,home,season);
// Trees have one trunk / canopy algorithm, season-specific colors.
for(let [x,h] of [[28,122],[359,147],[771,133]])Spring.tree(c,x,h,g,season);
rect(0,g,960,height-g,winter?'#879e91':'#526748');rect(0,g+6,960,height-g,'#334a39');for(let x=0;x<960;x+=8){let v=Math.sin(x*12.7);rect(x,g-3+(v>0?0:2),7,4,winter?'#d5dfd1':autumn?'#9b8952':'#83a66b');if(autumn)rect(x+2,g+8+(x*17%29),4,2,['#b67d40','#925b38','#b59d5b'][Math.floor(x/8)%3]);if(season===0&&x%24===0){rect(x,g-8,2,5,'#a3b177');rect(x-1,g-9,4,2,'#ddc4ae')}}
for(let i=0;i<55;i++){let xx=(i*137)%960,yy=g+40+(i*31)%Math.max(35,height-g-80);rect(xx,yy,9,2,winter?'#6e8b7d':'#2b4235');if(i%3===0)rect(xx+4,yy+2,4,3,winter?'#738e80':'#3c5340')}for(let xx of [186,338,737,806]){for(let k=0;k<5;k++)rect(xx+k*3,g-2-k%3*3,2,5,winter?'#c2d0bb':autumn?'#8b8955':'#8caa72')}
Spring.draw(c,g,t,home,season);
// Reinforced mine entrance: individual stones, timber lintel, bracing and threshold.
for(let i=0;i<9;i++){let a=i/8*Math.PI,xx=882+Math.cos(a)*48,yy=g-9-Math.sin(a)*65;poly([[xx-12,yy-9],[xx+5,yy-13],[xx+14,yy-3],[xx+10,yy+12],[xx-10,yy+11]],i%2?'#738176':'#596b61');rect(xx-7,yy-7,12,2,'#98a18b')}
poly([[850,g],[850,g-43],[862,g-59],[899,g-59],[913,g-41],[913,g]],'#0a1c1b');rect(847,g-54,8,54,'#795c3f');rect(907,g-54,8,54,'#795c3f');rect(846,g-61,70,9,'#a28559');poly([[855,g-50],[869,g-50],[855,g-35]],'#a28559');poly([[907,g-50],[893,g-50],[907,g-35]],'#a28559');rect(850,g-2,63,3,'#9a9478');
for(let i=0;i<5;i++){rect(275+i%3*9,g-8-Math.floor(i/3)*7,17,7,'#806446');rect(275+i%3*9,g-8-Math.floor(i/3)*7,3,7,'#b39869')}
// Stone furnace, iron door and stepped chimney.
for(let row=0;row<3;row++)for(let col=0;col<3;col++)rect(402+col*11+(row%2),g-32+row*10,10,9,row%2?'#6a7869':'#7c8672');rect(408,g-22,23,22,'#263b31');rect(414,g-17,11,15,'#a46d3f');rect(417,g-12,5,10,'#e4ae57');if(home.station.furnaceTier===2){rect(419,g-59,13,28,'#6d786b');rect(416,g-62,19,4,'#9b9e83');for(let i=0;i<3;i++)rect(409+i*7,g-24,3,22,'#142820')}
// Slightly larger cottage: door clearance now exceeds the 64px surface heroine.
c.save();c.translate(582,g);c.scale(1.18,1.18);c.translate(-582,-g);
let x=480,y=g-116,w=204,p=home.progress;
if(p>=1){rect(x-9,g-10,w+18,10,'#7f8a78');for(let xx=x-5;xx<x+w;xx+=23)rect(xx,g-8,21,6,'#a5ab93')}
if(p>=2){for(let xx of [x+3,x+w/2,x+w-7]){rect(xx,y,5,106,'#8d9b91');rect(xx+1,y,1,106,'#bec5b3')}rect(x+3,y,w-7,5,'#a8b3a1')}
c.save();if(s.inside)c.globalAlpha=.06;
if(p>=3){
// Cream upper plaster and warm timber lower walls, with masonry restricted to the plinth.
rect(x+7,y+5,w-14,101,'#dbc8a5');rect(x+8,y+8,w-16,4,'#c6ad86');rect(x+8,y+60,w-16,28,'#a38054');for(let yy=y+62;yy<g-26;yy+=6){rect(x+9,yy,w-19,1,'#765b40');rect(x+10,yy+1,w-22,1,'#b79665')}
for(let yy=g-26;yy<g-10;yy+=8)for(let xx=x+8+(Math.floor(yy/8)%2)*9;xx<x+w-9;xx+=20){rect(xx,yy,18,7,'#858b78');rect(xx+1,yy,15,1,'#a4a68b')}
for(let xx of[x+9,x+78,x+w-17]){rect(xx,y+6,5,99,'#694e36');rect(xx+1,y+8,1,95,'#a38355')}rect(x+10,y+51,w-23,5,'#7c5d3e');rect(x+11,y+52,w-25,1,'#b09565');
// Familiar entry stays at the exact previous door position and clearance.
poly([[x+83,g],[x+83,g-50],[x+88,g-59],[x+106,g-61],[x+117,g-52],[x+117,g]],'#4e4438');poly([[x+86,g],[x+86,g-50],[x+92,g-57],[x+105,g-57],[x+113,g-50],[x+113,g]],'#876647');for(let xx=x+89;xx<x+113;xx+=6)rect(xx,g-48,1,46,'#a18356');rect(x+106,g-29,3,3,'#d8bc76')}

c.restore();
// Stage four is interior wallboard: deliberately no exterior overlay.
if(p>=5){
// Off-centre ridge, longer right slope and broad, thick timber eaves.
poly([[x-28,y+10],[x+86,y-46],[x+w+33,y+10]],'#553d33');poly([[x-22,y+5],[x+86,y-41],[x+w+27,y+5]],'#885340');
for(let row=0;row<6;row++){let yy=y-38+row*8,left=x+86-(row+1)*18,right=x+86+(row+1)*25;for(let xx=left;xx<right;xx+=13){rect(xx,yy,12,6,(row+Math.floor(xx/13))%2?'#a16b4e':'#8b533f');rect(xx+1,yy,10,1,'#be8a63');rect(xx+10,yy+1,2,5,'#6d4738')}}
rect(x-27,y+8,w+61,6,'#5f4834');rect(x-26,y+8,w+58,2,'#b08c5d');rect(x-22,y+14,w+51,2,'#8b6c46');
rect(x+34,y-39,17,34,'#6e7568');rect(x+31,y-43,23,5,'#989c82');rect(x+36,y-35,2,26,'#a0a18b');if(winter&&!s.inside){rect(x-17,y+4,55,3,'#d7e0d3');rect(x+141,y+4,72,3,'#d7e0d3')}}
if(p>=6&&!s.inside){
// Ground-floor sliding windows share their top and 32px height; left glazing is exactly twice as wide.
// Glass stays distinct from the ryokan's paper shoji, with warm interior notes behind fine lattice.
for(let [xx,ww,yy,hh]of [[x+22,48,y+55,32],[x+145,24,y+55,32]]){
rect(xx-3,yy-3,ww+6,hh+6,'#523f30');rect(xx-2,yy-2,ww+4,hh+4,'#78543d');rect(xx,yy,ww,hh,'#aebbae');rect(xx+1,yy+1,ww-2,hh-2,'#bdc5b2');rect(xx+1,yy+1,ww-2,4,'#d8d5ba');rect(xx+2,yy+hh-8,ww-4,6,'#cbbc91');
let mid=Math.floor(ww/2);for(let panel=0;panel<2;panel++){let left=xx+panel*mid;rect(left+2,yy+2,Math.max(3,mid-5),1,'#e0dbc1');rect(left+3,yy+hh-7,Math.max(3,mid-7),4,'#d5bf8b');for(let dx=6;dx<mid-1;dx+=6)rect(left+dx,yy+1,1,hh-2,'#8c7450');for(let dy=7;dy<hh-2;dy+=7)rect(left+1,yy+dy,mid-1,1,'#9b835b')}
rect(xx+mid-1,yy,2,hh,'#654a35');rect(xx+mid,yy+1,1,hh-2,'#a3865c');rect(xx-2,yy-2,ww+4,1,'#b3976b');rect(xx-2,yy+hh+1,ww+4,2,'#654b33');rect(xx-4,yy+hh+3,ww+8,3,'#ad8b5b');rect(xx-3,yy+hh+3,ww+6,1,'#cfb486');rect(xx+mid-3,yy+hh/2,1,3,'#5c4934')}
rect(x+24,y+94,39,5,'#79573b');for(let i=0;i<3;i++){rect(x+27+i*12,y+90,7,5,'#a17450');rect(x+28+i*12,y+87,5,4,autumn?'#b68b51':'#7d9e66')}}

if(p<6){c.save();c.strokeStyle='#c6d8b18c';c.lineWidth=1;c.setLineDash([5,5]);c.strokeRect(x,y,w,116);c.beginPath();c.moveTo(x-18,y);c.lineTo(x+86,y-46);c.lineTo(x+w+33,y+10);c.stroke();c.restore()}
c.restore();
if(p>=6&&(autumn||winter||s.night))Interior.smoke(c,512,g-184,t,winter);Interior.draw(c,g,s,home);
// Side veranda is rendered in world coordinates so its deck matches porchFloor exactly.
if(p>=3){rect(701,g-3,65,3,'#283c2d');rect(702,g-6,62,4,'#7c5b3c');rect(702,g-2,62,2,'#60462f');rect(703,g-2,60,1,'#a27a4d');for(let xx=704;xx<762;xx+=6){rect(xx,g-6,5,3,'#bb9663');rect(xx,g-6,4,1,'#dbc08a')}for(let xx of[706,735,759])rect(xx,g-2,3,3,'#6d553a');rect(696,g-3,8,3,'#a78c60');rect(764,g-3,6,3,'#a78c60')}
if(p>=5){poly([[699,g-94],[749,g-84],[769,g-72],[701,g-75]],'#5b4033');for(let row=0;row<3;row++)for(let col=0;col<8;col++){rect(702+col*8+row*2,g-88+row*5+Math.floor(col*.7),7,4,row%2?'#956046':'#aa7853');rect(702+col*8+row*2,g-88+row*5+Math.floor(col*.7),6,1,'#c2946b')}rect(701,g-75,68,4,'#775738');rect(758,g-72,4,66,'#795838');rect(759,g-71,1,64,'#b18b59')}
if(p>=6){
// Existing tea tray and lamp, plus one small woven cushion on the unchanged deck.
rect(716,g-9,9,3,'#4f685a');rect(717,g-10,7,3,'#8fa28a');rect(718,g-10,5,1,'#b9bea0');rect(717,g-8,7,1,'#677d68');
rect(745,g-72,1,8,'#66513a');rect(742,g-64,7,2,'#80603e');rect(742,g-62,7,9,autumn||winter?'#e6b764':'#c9b37e');rect(744,g-61,2,7,autumn||winter?'#f9d68e':'#e3cf9e');rect(727,g-13,15,3,'#674c34');rect(729,g-10,2,4,'#8c6a43');rect(738,g-10,2,4,'#8c6a43');rect(731,g-16,4,3,'#9aa594');rect(737,g-16,3,2,'#c9c5a0');rect(708,g-14,9,8,'#a17c51');rect(710,g-19,5,6,winter?'#a5bda0':autumn?'#b48a4e':'#7f9e63');rect(706,g-18,5,3,winter?'#b7c8ab':'#8aab6c')}
if(p>=6&&home.exterior?.windchime){
// Wind is cosmetic only: integer pixel offsets preserve the crisp bell and paper strip.
const sway=Math.round(Math.sin(t*1.7)*2+Math.sin(t*.63)),cx=716+sway,by=g-69;rect(716,g-75,1,6,'#70583c');rect(cx-4,by+3,9,7,'#b47b4d');rect(cx-3,by+1,7,3,'#c8955c');rect(cx-2,by+3,2,5,'#ebbc7c');rect(cx-5,by+10,11,2,'#785638');rect(cx,by+12,1,5,'#927443');rect(cx+Math.round(sway*.5)-2,by+17,5,9,'#d8bf80');rect(cx+Math.round(sway*.5)-1,by+18,1,6,'#f0d79a')}
for(let a of s.animals)if(!s.inside||a.x<470||a.x>700)Animals.draw(c,a,g+(a.kind==='swallow'?0:porchFloor(a.x,home)),t);
if(autumn)for(let i=0;i<16;i++)rect((i*73+t*(9+i%3))%960,g-180+(i*19+t*13)%170,3,2,i%2?'#bd8952':'#a3633d');if(winter&&!s.night)Night.snow(c,s,g,height);
s.hero??={x:s.x,y:s.y,ground:s.ground,face:s.face,time:t};c.save();c.translate(0,g-28);if(!s.sleeping)hero(c,s.hero,0,t,[],s.detailArt===false?48:64);c.restore();Interior.drawSleep(c,g,s);Spring.foreground(c,g,t,s);for(let q of s.splashes||[]){c.globalAlpha=Math.min(1,q.life*3);rect(q.x,g+q.y,2,2,'#cee3d0')}c.globalAlpha=1;
c.font='12px monospace';c.fillStyle='#dce3c8';c.fillText('矿洞 ↓',858,g+24);Night.paint(c,s,g,height,home);
}
function cameraTarget(s){return Math.max(-960,Math.min(0,(s.area==='tea'?-960:0)+s.x-310))}
function updateCamera(s,dt){s.cameraX??=s.area==='tea'?-960:0;s.cameraX+=(cameraTarget(s)-s.cameraX)*(1-Math.exp(-dt*4));if(Math.abs(s.cameraX-cameraTarget(s))<.05)s.cameraX=cameraTarget(s);return s.cameraX}
function backdrop(c,s,height,camera){let g=Math.floor(height*.73/20)*20,sky=c.createLinearGradient(0,0,0,g);sky.addColorStop(0,s.night?'#18233c':s.season===3?'#4a6370':'#405f61');sky.addColorStop(1,s.night?'#344a58':s.season===3?'#a0b7b5':'#a5baa0');c.fillStyle=sky;c.fillRect(0,0,960,height);c.fillStyle=s.night?'#d6dfde':'#e4d4a0';c.fillRect(Math.round(730-camera*.04),80,22,22);for(let layer=0;layer<3;layer++){let factor=[.15,.28,.4][layer];c.fillStyle=['#3e5d5c','#35584f','#2b4a3d'][layer];c.beginPath();c.moveTo(0,g);for(let x=0;x<=980;x+=8){let wx=x+camera*factor;c.lineTo(x,Math.round(g*(.5+layer*.13)-Math.sin(wx*.006+layer*2)*42-Math.sin(wx*.013+layer)*17))}c.lineTo(960,g);c.closePath();c.fill()}}
function drawPanorama(c,s,height,home,hero){let camera=Math.round(s.cameraX??(s.area==='tea'?-960:0)),g=Math.floor(height*.73/20)*20;backdrop(c,s,height,camera);
// The onsen inn and bamboo belong to an independent middle-distance layer.
c.save();c.translate(Math.round(-camera*.82),0);Spring.backdrop(c,g,s.time,home,s.season);c.restore();
for(let area of ['tea','home']){let origin=area==='tea'?-960:0,offset=origin-camera;if(offset>=960||offset+960<=0)continue;c.save();c.beginPath();c.rect(Math.max(0,offset),0,Math.min(960,offset+960)-Math.max(0,offset),height);c.clip();c.translate(offset,0);let active=s.area===area,other={...s,area,inside:false,teaInside:false,teaSeated:false,sleeping:false,hero:null,splashes:[]};if(area==='tea')Tea.draw(c,active?s:other,height,home,()=>{},{sharedBackground:true,hidePlayer:true});else draw(c,active?s:other,height,home,()=>{},{sharedBackground:true});c.restore()}
// Draw the actor once, after both region clips are restored. Ears/tail can cross the seam.
c.save();c.translate((s.area==='tea'?-960:0)-camera,0);if(s.teaSeated)root.CavePlayerTea?.draw(c,s.x,g-23*Tea.SCALE,s.teaSip,s.time);else if(!s.sleeping){c.save();c.translate(0,g-28);hero(c,s.hero||{x:s.x,y:s.y,face:s.face,ground:s.ground,time:s.time},0,s.time,[],s.detailArt===false?48:64);c.restore();if(s.area!=='tea')Spring.foreground(c,g,s.time,s)}c.restore();Spring.petals(c,s,g,camera)}
const api={cameraTarget,updateCamera,drawPanorama,Tea,Night,interactBed:Interior.toggleSleep,PORCH,porchFloor,nearestSheep,tripRoll,interactHouse:Interior.interact,POOL,RESERVED,poolFloor,species,create,update,draw};if(typeof module!=='undefined')module.exports=api;root.CaveSurface=api;
})(globalThis);
