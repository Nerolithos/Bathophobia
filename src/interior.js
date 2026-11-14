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
if(h.furniture?.cabinet){r(618,-59,34,48,'#544b36');r(621,-56,28,41,'#71968777');for(let y of[-57,-39,-19])r(619,y,32,3,'#b29462');r(634,-56,2,41,'#cab47c');r(623,-54,2,13,'#c6d7ba');r(639,-50,1,18,'#c6d7ba')}
// Side posts remain opaque, making the cutaway distinct from an empty missing house.
r(474,-149,5,145,'#514631');r(691,-149,5,145,'#514631');
}
const api={HOUSE,interact,update,draw,smoke};if(typeof module!=='undefined')module.exports=api;root.CaveInterior=api;
})(globalThis);
