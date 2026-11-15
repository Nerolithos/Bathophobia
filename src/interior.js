/* House cutaway shares the surface coordinate system; no separate scene/save is required. */
(function(root){'use strict';
const HOUSE={left:476,right:694,door:580,lower:-10,upper:-84,ladder:674};
function interact(s,h){if(h.progress<6||!s.ground)return false;if(Math.abs(s.x-HOUSE.door)>30||Math.abs(s.y-(s.inside?HOUSE.lower:0))>15)return false;s.inside=!s.inside;s.x=HOUSE.door;s.y=s.inside?HOUSE.lower:0;s.vy=0;s.ground=true;s.climbing=false;if(s.inside)h.interiorUnlocked=true;return true}
function update(s,dt,keys,h){let dir=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),v=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);s.x=Math.max(HOUSE.left+8,Math.min(HOUSE.right-8,s.x+dir*125*dt));if(dir)s.face=dir;s.didJump=false;s.wet=false;s.swimsuit=false;
if(h.furniture?.ladder&&Math.abs(s.x-HOUSE.ladder)<15&&(v||s.climbing)){s.climbing=true;s.y=Math.max(HOUSE.upper,Math.min(HOUSE.lower,s.y+v*70*dt));s.vy=v*70;s.ground=s.y===HOUSE.lower||s.y===HOUSE.upper;if(s.ground&&!v)s.climbing=false}else{let floor=s.y<=HOUSE.upper+.01?HOUSE.upper:HOUSE.lower;s.climbing=false;s.vy+=800*dt;s.y=Math.min(floor,s.y+s.vy*dt);s.ground=s.y===floor;if(s.ground)s.vy=0}}
function smoke(c,x,y,t,winter=false){let count=winter?7:4;for(let i=0;i<count;i++){let a=(t*.11+i/count)%1,opacity=Math.sin(a*Math.PI)*(winter?.24:.13),spread=2+Math.floor(a*8);c.save();c.globalAlpha=opacity;c.fillStyle='#d0d1b8';c.fillRect(Math.round(x+Math.sin(a*5+i)*6-a*9-spread/2),Math.round(y-a*51),12+spread,5);c.fillRect(Math.round(x+3-a*9),Math.round(y-a*51-3),8+spread,4);c.restore()}}
function draw(c,g,s,h){if(!s.inside)return;let winter=s.season===3,autumn=s.season===2,t=s.time;const r=(x,y,w,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(g+y),w,hh)};
// Warm timber back wall and two real visual floors, left intentionally unfurnished.
r(476,-148,218,138,'#4d4536');for(let x=478;x<694;x+=13){r(x,-146,11,135,'#68543b');r(x+1,-145,1,130,'#84704b')}
// Tall lower-floor panorama: outdoor seasonal landscape remains visible through the glass.
c.save();c.beginPath();c.rect(514,g-77,137,65);c.clip();r(514,-77,137,65,winter?'#96b5bc':autumn?'#b6ba91':s.season===0?'#9bbba3':'#82b8ad');
for(let i=0;i<3;i++){c.fillStyle=['#688e84','#4c796d','#3f6b59'][i];c.beginPath();c.moveTo(514,g-12);for(let x=514;x<660;x+=3)c.lineTo(x,g-34-i*7-Math.sin(x*.03+i)*12);c.lineTo(660,g-12);c.fill()}
for(let i=0;i<6;i++){let x=523+i*25,y=-30+(i%2)*5;r(x,y-30,2,45,'#655d45');for(let k=0;k<4;k++){let width=4+k*3;r(x-width,y-35+k*9,width*2+2,6,winter?'#d3dfd3':autumn?(i%2?'#b9874d':'#a45f3e'):s.season===0?'#729463':'#4f7953');if(winter)r(x-width,y-35+k*9,width*2,2,'#e4e8d6')}}
if(winter)for(let i=0;i<15;i++)r(514+(i*29+t*6)%137,-77+(i*13+t*10)%65,1,1,'#f0f2df');if(autumn)for(let i=0;i<5;i++)r(514+(i*37+t*8)%137,-75+(i*19+t*12)%60,2,1,'#e0af6d');c.restore();
for(let x of[512,556,602,650])r(x,-79,4,70,'#4c3f30');r(512,-48,142,3,'#8d7651');r(511,-81,144,4,'#a18a5c');r(511,-13,144,4,'#a18a5c');
// Upper-storey back panels and small transom view, without prebuilt furniture.
r(532,-138,104,44,winter?'#8ba9ad':'#718e79');for(let x of[531,565,600,635])r(x,-140,3,48,'#4c3f30');r(531,-119,108,3,'#a08960');
for(let floor of[-10,-84]){r(474,floor,222,6,'#3d382b');for(let x=477;x<693;x+=14){r(x,floor,12,4,'#a18759');r(x+2,floor+1,7,1,'#c0a36e')}}
// Original masonry fireplace is present from the first entry, but no sofa/table/decor is prefilled.
r(482,-43,26,32,'#8c8870');r(480,-46,30,5,'#b0a589');r(488,-36,14,25,'#27342c');r(485,-70,7,24,'#827b62');r(485,-17,18,4,'#6f4f34');if(autumn||winter){let f=Math.floor(t*9)%4;r(490,-26,10,13,'#b86c3a');r(492,-32+(f%2)*2,6,17,'#e9ad59');r(494,-33+(f%3),2,16,'#f4d38a');c.save();c.globalAlpha=.12;r(480,-48,37,39,'#f2bb6a');c.restore()}
if(h.furniture?.ladder){for(let x of[666,681])r(x,-88,3,78,'#ab8856');for(let y=-80;y<-10;y+=10)r(666,y,18,3,'#d0b178')}
if(h.furniture?.table){r(541,-31,44,5,'#4a3b2e');r(539,-33,48,4,'#a2875c');r(542,-33,42,1,'#c2a575');for(let x of[545,578]){r(x,-27,4,17,'#70563b');r(x,-27,1,16,'#a18155')}r(542,-27,42,3,'#715639');for(let x of[550,566,581])r(x,-32,1,2,'#7f6646')}
if(h.furniture?.chair){
// Slight three-quarter timber chair: two back slats, a shaded seat and four separate legs.
for(let x of[518,532]){r(x,-44,3,31,'#43382e');r(x+1,-43,1,29,'#94704b')}r(517,-42,20,7,'#57402f');r(519,-41,16,4,'#bc9461');r(519,-40,13,1,'#dcba82');r(520,-37,14,1,'#87633e');
r(519,-32,16,4,'#9f784d');r(520,-32,13,1,'#c4a16c');
r(516,-24,24,4,'#4b392b');r(519,-27,17,3,'#b48b59');r(517,-24,24,2,'#ccaa76');r(519,-26,14,1,'#dab986');for(let x of[523,530])r(x,-26,1,3,'#8a613c');
for(let [x,y,hh] of [[518,-20,10],[531,-20,10],[522,-21,9],[537,-21,11]]){r(x,y,3,hh,'#4b382c');r(x+1,y,1,hh-1,'#ab8053')}}
if(h.furniture?.bed){r(499,-96,72,12,'#5e4833');r(496,-115,5,31,'#8e7049');r(569,-105,4,21,'#8e7049');r(498,-114,4,2,'#bd9e69');r(501,-101,68,8,'#d1c5a7');r(502,-105,17,7,'#e1d8c1');r(505,-105,11,1,'#f0e7d1');r(521,-105,47,13,'#527a69');r(523,-105,44,2,'#8eaa8d');r(525,-102,3,10,'#a7b89a');r(525,-93,43,1,'#385c4e');for(let x of[502,565])r(x,-88,4,4,'#6a4c34')}
if(h.furniture?.cabinet){
 // Front-facing two-door arched cabinet. Stepped arches, broad cornice and inset panes.
 r(610,-74,48,4,'#3c342d');r(607,-70,54,4,'#806246');r(610,-66,48,51,'#493b30');r(609,-16,50,4,'#896e48');for(let x of[612,652])r(x,-12,4,2,'#503d2c');
 for(let x of[611,634]){r(x,-65,22,48,'#806647');r(x+2,-63,18,44,'#362f29');r(x+4,-60,14,39,'#29473f');r(x+6,-62,10,2,'#29473f');r(x+4,-59,1,35,'#a98b5e');r(x+18,-59,1,35,'#a98b5e');r(x+5,-41,13,2,'#b09466');r(x+5,-22,13,2,'#a58a5b');}
 const art=root.CaveArt;for(let i=0;i<4;i++){let id=h.displayMinerals?.[i];if(id!==null&&id!==undefined&&art?.sprites[id]){c.imageSmoothingEnabled=false;c.drawImage(art.mineralSprite(id,t),i%2?637:614,g+(i<2?-58:-39),17,15)}}
 // Discrete glass reflections leave the four real specimens readable.
 for(let x of[615,638]){r(x,-57,1,8,'#9eb7a0');r(x+2,-55,1,5,'#668f7e');r(x+9,-34,1,8,'#779b89')}r(631,-45,2,3,'#d0ad68');r(635,-45,2,3,'#d0ad68');r(613,-68,42,1,'#b08b5a');
}
// Side posts remain opaque, making the cutaway distinct from an empty missing house.
r(474,-149,5,145,'#514631');r(691,-149,5,145,'#514631');
}
const api={HOUSE,interact,update,draw,smoke};if(typeof module!=='undefined')module.exports=api;root.CaveInterior=api;
})(globalThis);
