/* Adjacent surface region. Construction changes scenery, never the walkable foreground. */
(function(root){'use strict';
const Night=typeof module!=='undefined'?require('./night'):root.CaveNight;
const SCALE=.68,ANCHOR=40,toWorldX=x=>Math.round(ANCHOR+(x-ANCHOR)*SCALE);
const HOUSE={left:toWorldX(396),right:toWorldX(744),door:toWorldX(614),floor:-6};let clusterCanvas=null;
function enter(s,h){Object.assign(s,{area:'tea',x:932,y:0,vy:0,ground:true,wet:false,inside:false,teaInside:false,swimsuit:false,hero:null});h.teaVisited=true;s.homeChanged=true}
function interact(s,h){if(s.area!=='tea'||!s.ground||h.teaProgress<6||Math.abs(s.x-HOUSE.door)>30)return false;s.teaInside=!s.teaInside;s.y=s.teaInside?HOUSE.floor:0;s.vy=0;return true}
function update(s,dt,keys,h){s.time+=dt;let old=s.x,dir=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);s.x=Math.max(s.teaInside?HOUSE.left+10:0,Math.min(s.teaInside?HOUSE.right-10:960,s.x+dir*150*dt));if(dir)s.face=dir;s.didJump=false;let floor=s.teaInside?HOUSE.floor:0;if(!s.teaInside&&(keys.Space||keys.KeyW||keys.ArrowUp)&&!s.jump&&s.ground){s.vy=-290;s.ground=false;s.didJump=true}s.jump=!!(keys.Space||keys.KeyW||keys.ArrowUp);s.vy+=800*dt;s.y+=s.vy*dt;if(s.y>=floor){s.y=floor;s.vy=0;s.ground=true}s.wet=false;s.swimsuit=false;s.climbing=false;
if(!s.teaInside&&s.x>=959&&dir>0){Object.assign(s,{area:'home',x:22,y:0,vy:0,ground:true,hero:null});return false}
s.hero??={x:old,y:s.y,ground:s.ground};Object.assign(s.hero,{surface:true,x:s.x,y:s.y,vy:s.vy,ground:s.ground,face:s.face,didJump:s.didJump,time:s.time,wet:false,swimsuit:false,detailArt:s.detailArt!==false,climbing:false,tripAge:null});let animator=typeof module!=='undefined'?require('./player-animation'):root.CavePlayerAnimation;animator.update(s.hero,dt);return false}
function draw(c,s,height,h,hero){let g=Math.floor(height*.73/20)*20,t=s.time,winter=s.season===3,p=h.teaProgress||0;
const r=(x,y,w,hh,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(hh))},poly=(points,col)=>{c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill()},rnd=(i,k)=>{let n=Math.imul(i+73,k+9277);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296};
let sky=c.createLinearGradient(0,0,0,g);sky.addColorStop(0,s.night?'#172039':winter?'#4a6370':'#405f61');sky.addColorStop(1,s.night?'#344a58':winter?'#a0b7b5':'#a5baa0');c.fillStyle=sky;c.fillRect(0,0,960,height);
for(let layer=0;layer<3;layer++){let pts=[[0,g]];for(let x=0;x<=980;x+=8)pts.push([x,g*(.55+layer*.13)-Math.sin(x*.006+layer*2)*42-Math.sin(x*.013+layer)*17]);pts.push([960,g]);poly(pts,['#3e5d5c','#35584f','#2b4a3d'][layer])}
if(s.night){r(791,79,19,19,'#d6dfde');r(786,76,10,14,'#233448');for(let i=0;i<25;i++)r(rnd(i,2)*960,12+rnd(i,3)*g*.4,1,1,'#bacbcd')}else r(791,79,22,22,'#e4d4a0');
// Sparse bamboo grows beside the building, leaving the roofline open.
for(let i=0;i<7;i++){let x=i<3?37+i*22:778+(i-3)*30,hh=95+rnd(i,17)*80,lean=(rnd(i,23)-.5)*24;for(let y=0;y<hh;y+=4){let xx=x+lean*y/hh;r(xx,g-y-4,3,5,'#708a53');r(xx+1,g-y-4,1,4,'#a0ad6b');if(y%20===0){r(xx-1,g-y,5,2,'#a5b27b');for(let side of[-1,1]){let ey=g-y-7;poly([[xx,ey+4],[xx+side*19,ey-5],[xx+side*29,ey-4],[xx+side*14,ey+1]],'#5c7e4d')}}}}
// Seasonal blossom / maple tree anchors the left edge of the new garden.
for(let [x,hh,k]of [[81,156,0],[863,163,1]]){r(x,g-hh,7,hh,'#66533e');poly([[x+3,g-70],[x-27,g-112],[x-35,g-146],[x-31,g-145],[x-23,g-116],[x+7,g-79]],'#756147');poly([[x+2,g-96],[x+31,g-128],[x+39,g-157],[x+43,g-158],[x+36,g-123],[x+6,g-86]],'#756147');if(!winter)for(let i=0;i<52;i++){let xx=x+(rnd(i+k*100,31)-.5)*107,yy=g-hh+(rnd(i+k*100,37)-.5)*58,col=s.season===0?['#e5c8ba','#d5b8aa','#efe0c7']:s.season===2?['#b9824d','#ce9c58','#946342']:['#73905c','#8ea66b','#5e8054'];r(xx,yy,7+rnd(i,41)*8,4+rnd(i,43)*6,col[i%3])}else for(let i=0;i<10;i++)r(x-23+i*6,g-hh+15+i%3*9,7,2,'#c8d8d0')}
// Ground and an unobstructed foreground lane run continuously to the homestead.
r(0,g,960,height-g,'#30473a');r(0,g,960,6,winter?'#b7cbbf':'#71865a');for(let i=0;i<125;i++){let x=rnd(i,53)*960,y=g+6+rnd(i,59)*Math.max(12,height-g-20);r(x,y,4+rnd(i,61)*7,2,i%3?'#3a5140':'#53624a')}
for(let i=0;i<23;i++){let x=326+i*22;r(x,g-2,19,3,i%2?'#9a9c82':'#7f8976');r(x+3,g-1,11,1,'#c0b89a')}
// Render the complete construction group on a source pixel canvas, then scale once with nearest-neighbour filtering.
// Characters and the open foreground lane keep their original size and movement speed.
let screen=c,doc=screen.canvas?.ownerDocument||root.document,layer=null;
if(doc){clusterCanvas??=doc.createElement('canvas');if(clusterCanvas.width!==960||clusterCanvas.height!==height){clusterCanvas.width=960;clusterCanvas.height=height}layer=clusterCanvas;c=layer.getContext('2d');c.clearRect(0,0,960,height);c.imageSmoothingEnabled=false}else{c.save();c.translate(ANCHOR,g);c.scale(SCALE,SCALE);c.translate(-ANCHOR,-g)}
// Tea terraces are scenery behind the foreground lane: stone retaining walls, staggered hedges and a central stair.
if(h.teaField){for(let row=2;row>=0;row--){let yy=g-11-[0,35,66][row],left=105+row*26,right=367-row*6,plantHeight=[29,24,20][row];
// Offset irregular stones sit beneath a continuous hedge, with no per-plant boxes.
r(left,yy-8,right-left,17,'#354d3d');let xx=left;for(let k=0;xx<right;k++){let ww=12+Math.floor(rnd(k+row*40,61)*14),hh=8+Math.floor(rnd(k+row*40,63)*5);poly([[xx,yy-hh],[xx+ww-4,yy-hh-1],[xx+ww,yy-3],[xx+ww-2,yy+6],[xx+2,yy+5]],k%3?'#6c7661':'#7e826c');r(xx+2,yy-hh+1,ww-6,2,'#a0a38a');if(rnd(k+row*40,65)>.52){r(xx+4,yy+1,6,2,'#617c44');r(xx+8,yy-2,3,3,'#829150')}xx+=ww+1}
let top=[];for(let x=left-5;x<=right+4;x+=2){let edge=Math.min(1,(x-left+6)/13,(right+5-x)/13),wave=Math.sin((x-left)*.065+row)*2+Math.sin(x*.17+row)*1.5;top.push([x,yy-10-plantHeight*Math.max(0,edge)+wave])}poly([...top,[right+4,yy-7],[left-5,yy-7]],row===2?'#416940':'#3b663a');
// Leaf flecks follow the connected crown: sparse highlights above, deep shadow below.
for(let i=0;i<(right-left)*.64;i++){let x=left+rnd(i+row*200,71)*(right-left),edge=Math.min(1,(x-left+6)/13,(right+5-x)/13),crown=yy-10-plantHeight*edge+Math.sin((x-left)*.065+row)*2+Math.sin(x*.17+row)*1.5,y=crown+2+rnd(i+row*200,73)*(plantHeight-4),light=(y-crown)/plantHeight,col=light<.32?(winter?'#bdcdb1':rnd(i,79)>.45?'#9ab765':'#83a650'):light<.65?(rnd(i,83)>.5?'#668f46':'#739a50'):'#345d37';r(x,y,2+Math.floor(rnd(i,89)*3),1+Math.floor(rnd(i,97)*2),col)}r(left+8,yy-8,right-left-16,2,'#294d32');for(let i=0;i<5;i++){let x=left+rnd(i+row*17,101)*(right-left);r(x,yy+3,2,5,'#80975a');r(x+2,yy+1,1,6,'#a1ad70')}
}for(let i=0;i<7;i++){let x=336+i*4,y=g-3-i*11;r(x,y,33,8,'#78836d');r(x+1,y,31,2,'#b3b097');r(x+2,y+3,27,1,'#9c9f86')}
// Partial bamboo fence leaves the stair and the walking lane open.
for(let x of[106,145,184,269,308]){r(x,g-27,3,22,'#9b8553');r(x+1,g-27,1,19,'#c7af73')}r(103,g-19,85,3,'#b6a06b');r(267,g-19,46,3,'#b6a06b');
// A small stone lantern beside the stair, below the crop silhouettes.
r(377,g-9,17,5,'#8c957d');r(382,g-29,6,22,'#78846e');r(378,g-37,14,13,'#9ea48c');r(381,g-34,8,7,s.night?'#e3c181':'#b9bb97');poly([[374,g-38],[385,g-45],[397,g-38]],'#87927a');r(374,g-38,23,3,'#acaf98');
}else{c.save();c.setLineDash([4,5]);c.strokeStyle='#9ab18a88';c.strokeRect(104,g-91,270,82);c.restore();c.fillStyle='#b1c6a0';c.font='11px monospace';c.fillText('茶田',214,g-40)}
const left=396,right=744,roofTop=g-190;
if(p>=1){r(left-12,g-12,right-left+25,12,'#677466');for(let x=left-7;x<right+8;x+=22){r(x,g-10,20,7,'#989c86');r(x+1,g-10,17,2,'#babaa0')}for(let i=0;i<3;i++)r(583-i*6,g-5+i*2,64+i*12,3,'#9c9e86')}
if(p>=2){for(let x of[left,left+87,left+207,right-5]){r(x,g-138,6,126,'#6c5139');r(x+1,g-136,2,123,'#a68556')}r(left-3,g-139,right-left+7,8,'#896b48');r(left+3,g-28,right-left-8,5,'#8f7049')}
if(p>=3){
// Reduced solid wings frame a permanently recessed central bay, not a closable facade.
r(left+7,g-130,111,111,'#d0bea0');r(left+9,g-128,107,5,'#e0d0b0');r(right-56,g-130,39,111,'#c6b595');r(left+8,g-38,109,19,'#a08359');
r(left+119,g-129,169,109,'#8c7353');r(left+122,g-126,163,77,p>=4?(s.night?'#b69a6b':'#a18c69'):'#8a7b61');
for(let x of[left+4,left+114,left+287,right-10]){r(x,g-133,5,115,'#57432f');r(x+1,g-131,1,111,'#9b7950')}
r(left+7,g-124,right-left-21,9,'#51402d');r(left+9,g-124,right-left-25,2,'#987748');
}
if(p>=5){
// Low hipped roof, layered eaves and a restrained side canopy.
poly([[left-34,g-126],[left+119,roofTop],[left+180,roofTop+5],[right+39,g-126]],'#4d4335');poly([[left-25,g-132],[left+123,roofTop+6],[left+174,roofTop+11],[right+26,g-132]],p>=6?'#747b70':'#a28555');
for(let row=0;row<10;row++){let yy=roofTop+12+row*5,start=left+120-row*16,end=left+176+row*16;for(let x=start;x<end;x+=12){r(x,yy,11,5,p>=6?(rnd(x+row*41,151)>.7?'#8e9686':rnd(x+row*41,151)>.3?'#788676':'#657568'):((x+row)%3?'#b09565':'#95794e'));r(x+1,yy,9,1,p>=6?'#a5aa94':'#c7ab79');r(x+10,yy+1,1,4,p>=6?'#566254':'#715b3f')}}
r(left-42,g-128,right-left+92,7,'#3c3b2e');r(left-39,g-128,right-left+86,2,'#a5a48a');for(let tx=left-37;tx<right+45;tx+=9)r(tx,g-125,6,3,'#687565');r(left+6,g-121,right-left-17,9,'#4e433747');r(left-30,g-129,right-left+67,2,'#b19b71');r(left+117,roofTop+4,66,4,'#b5ac8d');r(left+123,roofTop,54,4,'#969b87');
poly([[right-20,g-115],[right+58,g-92],[right+63,g-87],[right-20,g-94]],p>=6?'#737c6e':'#a78a5b');for(let i=0;i<7;i++)r(right-16+i*11,g-110+i*3,11,2,p>=6?'#a1a68f':'#c1a273');r(right+50,g-88,5,76,'#7c603e');r(right+51,g-86,1,72,'#b29260');if(winter&&!s.teaInside){r(left-21,g-131,76,3,'#ccd9ca');r(right-58,g-131,77,3,'#ccd9ca')}}
if(p>=6){
const bayL=left+122,bayR=left+285;
// BACK: warm paper wall and a separate tokonoma alcove, visible from the garden at all times.
r(bayL,g-118,bayR-bayL,70,s.night?'#c4a77a':'#ad9b76');
for(let x=bayL+56;x<bayR;x+=27){r(x,g-116,25,65,s.night?'#e0c28b':'#c0b18b');for(let yy=g-104;yy<g-52;yy+=13)r(x,yy,25,1,'#a68b5b');r(x+11,g-115,1,63,'#a48b5c')}
r(bayL+3,g-116,48,66,'#67533e');r(bayL+6,g-113,42,60,s.night?'#927752':'#817154');r(bayL+5,g-54,45,4,'#b09565');
// Restrained hanging scroll and one ikebana branch in the tokonoma.
r(bayL+17,g-110,20,37,'#c4b28b');r(bayL+20,g-108,14,30,'#e0cfaa');r(bayL+16,g-111,22,2,'#534532');r(bayL+16,g-74,22,2,'#534532');r(bayL+26,g-101,1,18,'#6e7555');poly([[bayL+26,g-94],[bayL+22,g-99],[bayL+24,g-100],[bayL+28,g-94]],'#6e7555');r(bayL+26,g-86,5,2,'#7e805b');
poly([[bayL+13,g-57],[bayL+12,g-65],[bayL+22,g-65],[bayL+20,g-57]],'#716e4d');r(bayL+17,g-80,1,16,'#5c6847');poly([[bayL+17,g-72],[bayL+11,g-79],[bayL+8,g-79],[bayL+15,g-70]],'#65764a');r(bayL+7,g-82,4,3,'#d4bcaa');r(bayL+19,g-84,3,3,'#d9c9a3');
// MIDDLE: tatami extends back into the room; joints converge towards the rear wall.
poly([[bayL-2,g-48],[bayR+3,g-48],[bayR+13,g-20],[bayL-9,g-20]],'#c0ad7a');poly([[bayL+1,g-46],[bayR,g-46],[bayR+8,g-23],[bayL-5,g-23]],s.night?'#d6bd82':'#c8b887');
for(let yy=g-43;yy<g-23;yy+=3)r(bayL+1,yy,bayR-bayL,1,'#ab9e6d');poly([[bayL+56,g-47],[bayL+54,g-21],[bayL+56,g-21],[bayL+58,g-47]],'#777950');r(bayL-2,g-34,bayR-bayL+6,2,'#858454');
// Two floor cushions sit either side of a low tea table, behind the front posts.
for(let [xx,col,light]of [[bayL+13,'#7c7167','#ac9b85'],[bayL+132,'#6c795e','#9da883']]){poly([[xx,g-30],[xx+22,g-30],[xx+26,g-24],[xx+2,g-23]],'#4d513c');r(xx+2,g-30,20,5,col);r(xx+4,g-29,16,1,light);r(xx+7,g-26,11,1,light)}
const tx=bayL+54;r(tx+3,g-36,4,13,'#57402d');r(tx+55,g-36,4,13,'#57402d');r(tx,g-43,63,6,'#4d3727');r(tx+1,g-45,61,4,'#8b6840');r(tx+4,g-45,55,1,'#c19b60');r(tx+6,g-38,51,2,'#6b4b30');
// Black iron kettle: lid, spout and arched handle, plus exactly two small bowls.
let kx=tx+25;poly([[kx,g-47],[kx+1,g-54],[kx+5,g-58],[kx+13,g-58],[kx+17,g-53],[kx+17,g-47]],'#303833');r(kx+3,g-49,12,4,'#404940');r(kx+5,g-59,9,2,'#697166');r(kx+8,g-61,3,2,'#3d453b');poly([[kx+16,g-53],[kx+22,g-57],[kx+21,g-52],[kx+16,g-49]],'#3a4339');
for(let [xx,yy,ww,hh]of [[kx+2,g-66,2,12],[kx+4,g-68,11,2],[kx+14,g-66,2,11]])r(xx,yy,ww,hh,'#515a4d');r(kx+6,g-55,2,4,'#879080');
for(let xx of[tx+9,tx+50]){poly([[xx,g-48],[xx+8,g-48],[xx+6,g-44],[xx+2,g-44]],'#87917a');r(xx,g-49,8,2,'#c7c6a3');r(xx+2,g-49,4,1,'#6e7558')}
// Solid left wing retains a smaller circular window with a sparse lattice.
let cx=left+64,cy=g-83;for(let yy=-30;yy<=30;yy++){let ww=Math.floor(Math.sqrt(900-yy*yy));r(cx-ww,cy+yy,ww*2,1,'#594a35');if(Math.abs(yy)<27){let inner=Math.floor(Math.sqrt(729-yy*yy));r(cx-inner,cy+yy,inner*2,1,s.night?'#b6a072':'#8e9b80')}}for(let dx of[-13,13]){let hh=Math.floor(Math.sqrt(26*26-dx*dx));r(cx+dx,cy-hh,2,hh*2,'#83724e')}r(cx-26,cy+6,52,2,'#8b7851');
poly([[cx-3,cy+20],[cx-5,cy+11],[cx+5,cy+11],[cx+3,cy+20]],'#606a4d');r(cx,cy-8,1,19,'#5e6b4c');r(cx-3,cy-11,6,3,'#d0c09b');
// Right shoji panels stack against the wing; the entire central bay stays uncovered.
for(let i=0;i<3;i++){let xx=bayR+9+i*9;r(xx,g-115,11,91,'#6b5239');r(xx+2,g-112,7,85,s.night?'#d3b987':'#b7b090');for(let yy=g-100;yy<g-29;yy+=13)r(xx+2,yy,7,1,'#988057')}
// FOREGROUND: extended engawa, dark fascia and visible underside supports.
r(left-1,g-20,right-left+4,18,'#483b2c');for(let xx=left+2;xx<right;xx+=11){r(xx,g-20,10,11,'#9a784e');r(xx+1,g-20,8,2,'#c5a677');r(xx,g-11,10,2,'#735233')}r(left-2,g-9,right-left+7,4,'#4a3828');r(left-1,g-9,right-left+5,1,'#b28f5d');for(let xx of[left+12,bayL+4,bayR-5,right-20]){r(xx,g-5,5,5,'#5d4933');r(xx+1,g-5,1,4,'#9b8057')}
// The two front posts and lintel frame the tea seat, rather than a door aperture.
for(let xx of[bayL-10,bayR+1]){r(xx,g-122,7,114,'#4c3827');r(xx+1,g-120,2,109,'#9a7648');r(xx+6,g-119,1,108,'#302d23')}
r(left-2,g-122,right-left+4,9,'#493725');r(left+2,g-121,right-left-4,2,'#98774c');for(let xx=left+8;xx<right-8;xx+=27)r(xx,g-113,4,5,'#5b422c');r(bayL-3,g-113,bayR-bayL+5,5,'#47362244');
// Uneven stone steps meet the existing entrance interaction point.
poly([[582,g-5],[641,g-6],[647,g-1],[580,g]],'#7d8772');r(583,g-5,55,2,'#b7b69b');poly([[575,g+1],[650,g],[654,g+5],[573,g+5]],'#8c937b');r(577,g+1,69,1,'#c2bfa2');
// One small hanging sign and the original side lamp leave the open bay clear.
r(right-24,g-121,20,27,'#7d6970');r(right-22,g-99,16,1,'#b7a18d');c.font='12px serif';c.fillStyle='#e4d1aa';c.fillText('茶',right-21,g-105);
r(777,g-105,1,12,'#695238');r(772,g-94,11,17,'#a77f48');r(774,g-92,7,12,s.night?'#f4ce83':'#d7ba7c');r(777,g-90,1,8,'#ffe5a9');
}
if(p<6){c.save();c.strokeStyle='#bad0a37f';c.setLineDash([5,5]);c.strokeRect(left,g-138,right-left,126);c.restore();c.font='11px monospace';c.fillStyle='#bbccaa';c.fillText('山间茶屋 '+p+' / 6',520,g-154)}
if(p>=6){for(let i=0;i<10;i++){let xx=372+i*24,yy=g-3-Math.sin(i*.5)*2;poly([[xx,yy-2],[xx+14,yy-4],[xx+20,yy],[xx+16,yy+2],[xx+1,yy+2]],i%2?'#92957c':'#7d8974')}r(753,g-28,57,4,'#806543');for(let xx of[757,802]){r(xx,g-24,3,15,'#725c3c');r(xx,g-24,1,14,'#b59660')}for(let xx of[767,793]){poly([[xx-11,g-30],[xx-7,g-34],[xx+8,g-34],[xx+12,g-30],[xx+7,g-27],[xx-7,g-27]],'#c0a36d');r(xx-8,g-32,16,3,'#8b8253');for(let k=0;k<5;k++)r(xx-6+k*3,g-32,1,3,'#c3b17c')}for(let i=0;i<8;i++){let xx=403+rnd(i,173)*326;poly([[xx,g-8],[xx+4,g-12],[xx+11,g-10],[xx+13,g-4],[xx+3,g-3]],'#6e7b63');r(xx+2,g-10,5,2,'#87935f')}}
// Low planting and stepping stones soften the base; they never block the foreground lane.
for(let i=0;i<36;i++){let x=372+rnd(i,89)*440;if(x>575&&x<649)continue;let y=g-3;for(let k=0;k<3;k++)r(x+k*2,y-2-rnd(i+k,97)*7,2,6,winter?'#a9bea0':i%3?'#7b9251':'#a0ac6c')}
if(layer){c=screen;c.save();c.imageSmoothingEnabled=false;let sourceTop=Math.max(0,g-250),sourceHeight=Math.min(height-sourceTop,275);c.drawImage(layer,0,sourceTop,960,sourceHeight,toWorldX(0),Math.round(g+(sourceTop-g)*SCALE),Math.round(960*SCALE),Math.round(sourceHeight*SCALE));c.restore()}else c.restore();
if(s.night){r(0,0,960,height,s.season===3?'#18264d55':s.season===2?'#251f3d55':'#17294355');if(p>=6)for(let rawX of[461,610,777]){let x=toWorldX(rawX);for(let ring=4;ring>0;ring--){c.globalAlpha=.025;r(x-ring*10,g-86*SCALE-ring*6,ring*16,ring*12,'#ffd58b')}c.globalAlpha=1;r(x-1,g-89*SCALE,3,5,'#f5d491')}}
if(s.night&&p>=6){c.save();c.globalCompositeOperation='screen';c.globalAlpha=.15;r(toWorldX(left+125),g-112*SCALE,Math.round(160*SCALE),Math.round(96*SCALE),'#c99b55');c.restore()}
if(winter)Night.snow(c,{...s,inside:false,snowInterior:p>=5?{left:HOUSE.left,right:HOUSE.right,top:g-140*SCALE,bottom:g-12*SCALE}:null},g,height);if(s.night&&s.season===1)for(let i=0;i<110;i++){let x=((rnd(i,109)*1040-t*(110+rnd(i,113)*50))%1040+1040)%1040,y=(rnd(i,127)*height+t*(200+rnd(i,131)*80))%height;if(p>=5&&x>HOUSE.left&&x<HOUSE.right&&y>g-140&&y<g)continue;for(let k=0;k<3;k++)r(x-k*2,y+k*3,1,3,'#a3c1d455')}
c.save();c.translate(0,g-28);hero(c,s.hero||{x:s.x,y:s.y,face:s.face,ground:true,time:t},0,t,[],s.detailArt===false?48:64);c.restore();c.font='11px monospace';c.fillStyle='#c9d7bc';c.fillText('山居 →',879,g+22)
}
const api={SCALE,ANCHOR,HOUSE,enter,interact,update,draw};if(typeof module!=='undefined')module.exports=api;root.CaveTeaGarden=api;
})(globalThis);
