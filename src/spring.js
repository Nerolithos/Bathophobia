/* Designed two-pixel contours. One height field drives both the basin paint and feet collision. */
(function(root){'use strict';
const POOL={left:94,right:270,depth:54,waterline:6},RESERVED={left:18,right:286};
const bed=[[94,0],[98,7],[102,15],[108,24],[116,32],[128,39],[144,45],[162,49],[180,51],[198,52],[216,49],[232,44],[244,35],[254,23],[262,12],[270,0]];
function floor(x){if(x<=94||x>=270)return 0;for(let i=1;i<bed.length;i++)if(x<=bed[i][0]){let a=bed[i-1],b=bed[i];return Math.round((a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))/2)*2}return 0}
const stoneShapes=[['  xxxx  ',' xhhhxx ','xhhmmmxx','xmmmmddx',' xxdddxx','  xxxx  '],['   xxxx   ',' xxhhhxxx ','xhhhmmmmxx','xmmmmmmddx',' xxdddddxx','   xxxxx  '],['  xxx  ',' xhhxx ','xhhmmxx','xmmmddx',' xxddx ','  xxx  ']];
function tools(c,g){const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),g+Math.round(y),w,h)};return{r,stone(x,y,type=0,scale=2,moss=false){let rows=stoneShapes[type%3],pal={x:'#4d6258',h:'#a1aa8b',m:'#7e8f79',d:'#627560'};rows.forEach((row,j)=>[...row].forEach((p,i)=>{if(p!==' ')r(x+i*scale,y+j*scale,scale,scale,pal[p])}));if(moss){r(x+scale*2,y+scale,scale*3,scale,'#78905c');r(x+scale,y+scale*2,scale*2,scale,'#637b51')}}}}
function stage(home){return home.onsen?4:home.onsenStage||0}
// Distant bathhouse and bamboo are painted before ground, spring rocks and actors.
// Reduced scale, desaturated colors and atmospheric opacity separate this layer.
function backdrop(c,g,t,home,season){if(stage(home)<3)return;const {r}=tools(c,g),winter=season===3;c.save();c.globalAlpha=.64;
// Two irregular groves: leaning stems, staggered heights, segmented joints and leaf fans.
for(let i=0;i<18;i++){const base=63+i*15+(i%3)*4,height=70+(i*29%65),lean=[-.22,.13,-.08,.26,-.17,.05][i%6],step=5,xAt=y=>base+(height+y)*lean+Math.sin(y*.045+i)*2;for(let y=-height;y<-24;y+=step){const x=xAt(y);r(x,y,3,step+1,i%3?'#497363':'#547f6b');r(x+1,y,1,step,'#6f9580');if((y+height)%20===0){r(x-1,y,5,2,'#90aa8b');for(let side of[-1,1]){for(let k=0;k<4;k++){const xx=x+side*(4+k*3),yy=y-3-k%2*3;r(xx,yy,5,2,'#567e68');r(xx+side*2,yy-2,3,2,'#6e9479')}}}}}
// Compact frontal Japanese bathhouse, intentionally well behind the pool bank.
r(153,-96,101,54,'#617367');r(156,-94,95,49,'#b4b49a');r(151,-47,105,4,'#6b7564');r(160,-43,88,3,'#82917a');
for(let x of[156,186,218,248])r(x,-96,3,50,'#6a705c');r(156,-75,95,3,'#747760');r(194,-75,23,29,'#4d6d62');r(197,-72,17,26,'#7e9c85');r(205,-72,2,26,'#596f5d');
for(let x of[162,224]){r(x,-71,20,21,'#77998a');for(let dx=3;dx<20;dx+=5)r(x+dx,-71,1,21,'#b0b59a');for(let y=-67;y<-50;y+=5)r(x,y,20,1,'#b0b59a')}
// Stepped gable and extended teal tiled eaves; no smooth vector outlines.
for(let row=0;row<12;row++){const half=5+row*5;r(204-half,-130+row*3,half*2,4,'#556e62');if(row<10)r(204-half+3,-128+row*3,half*2-6,2,'#b7b49a')}
for(let row=0;row<5;row++){const left=155-row*4,width=98+row*8;r(left,-108+row*3,width,4,'#416f65');for(let x=left+2;x<left+width-2;x+=8){r(x,-108+row*3,5,1,winter?'#afc0b0':'#739689');r(x+5,-107+row*3,1,2,'#365e58')}}r(138,-94,133,3,'#6b7d68');r(201,-131,7,2,'#819984');r(201,-120,5,15,'#777c65');r(196,-108,16,2,'#85866d');
if(winter){r(170,-116,27,2,'#b6c3b2');r(217,-110,28,2,'#b6c3b2')}
c.restore()}
function draw(c,g,t,home,season){let {r,stone}=tools(c,g),p=stage(home),cold=season===2||season===3;
// Interlocking outcrop silhouette: deliberately unequal ledges, deep clefts and leaning strata.
const ledges=[[-146,48,37],[-140,35,61],[-124,28,69],[-102,22,77],[-78,32,67],[-55,36,66],[-31,46,52],[-12,62,39]];
for(let [y,x,w]of ledges){r(x,y,w,26,'#455e53');r(x+4,y+2,w-10,3,'#8b9981');r(x+8,y+5,w-15,15,'#687e6c');r(x+w-10,y+6,8,19,'#354f47');r(x+7,y+22,w-19,3,'#293f38')}
for(let [x,y,type,size]of [[37,-146,0,3],[64,-139,2,3],[21,-115,1,3],[49,-107,2,3],[70,-87,0,3],[29,-70,2,3],[54,-55,1,3],[68,-25,0,3]])stone(x,y,type,size,true);
for(let [x,y,w]of [[35,-116,12],[66,-123,15],[28,-80,9],[61,-48,18],[78,-18,9]]){r(x,y,w,3,'#6c8758');r(x+2,y+3,3,7,'#59774f')}
// Spring mouth, then a connected cascade that is deflected by two rock shelves.
r(65,-134,14,7,'#1c3934');r(67,-133,9,3,'#adc3a7');
const falls=[{x:69,y:-130,end:-85,w:12,drift:4},{x:78,y:-85,end:-44,w:14,drift:6},{x:88,y:-44,end:8,w:16,drift:16}];
for(let f of falls){for(let yy=f.y;yy<f.end;yy+=2){let x=f.x+Math.round((yy-f.y)/(f.end-f.y)*f.drift/2)*2;r(x,yy,f.w,2,'#4e8e89');r(x+2,yy,f.w-6,2,'#81b9a7');if((Math.floor((yy+t*49)/8)%3)===0)r(x+3,yy,3,2,'#c0dbbf');r(x+f.w-2,yy,2,2,'#3a716f')}r(f.x+f.drift-3,f.end-2,f.w+6,3,'#bad2b6')}
for(let yy=-87;yy<-8;yy+=4){r(61+Math.round((yy+87)*.11),yy,3,3,'#6da49a');if((yy+Math.floor(t*32))%12<4)r(62+Math.round((yy+87)*.11),yy,1,2,'#b1cab4')}
// Per-column carving: asymmetric stair-stepped shallow bowl, never a polygonal funnel.
for(let x=94;x<270;x+=2){let d=floor(x+1);r(x,0,2,d+6,'#566950');r(x,0,2,d,'#294c40');if(d>6){for(let y=6;y<d;y+=2){let edge=Math.min(y-6,d-y),color=y<16?'#70aaa0':y<30?'#508d85':y<42?'#3e776f':'#35655c';if(edge<3)color=y<16?'#89b2a0':'#526f56';r(x,y,2,Math.min(2,d-y),color)}r(x,d,2,3,'#879277');r(x,d+3,2,2,'#435c46')}}
// Submerged sediment and pebbles follow the curved floor, not an artificial flat base.
for(let i=0;i<22;i++){let x=112+(i*37)%143,y=floor(x)-3;r(x,y,2+i%3,2,i%3?'#698b72':'#9ca988')}
for(let i=0;i<8;i++){let x=111+i*18+Math.sin(t*.7+i)*3;r(x,10+i%3*7,7+i%4,1,'#a5c8b26b');r(x+4,12+i%3*7,3,1,'#b3d1ba55')}
for(let x=102;x<264;x+=10)r(x,6,7,1,'#b2d4ba');
// Impact pool: little pixel droplets and expanding broken ripple arcs.
for(let i=0;i<7;i++){let a=(t*1.4+i/7)%1,x=109+(i%2?1:-1)*a*(10+i),y=6-Math.sin(a*Math.PI)*(5+i%3*3);c.save();c.globalAlpha=Math.sin(a*Math.PI)*.8;r(x,y,2,2,'#d0e3c5');c.restore()}
for(let i=0;i<3;i++){let a=(t*.65+i/3)%1;c.save();c.globalAlpha=(1-a)*.65;r(110-a*11,8+a*4,7+a*10,1,'#d0e3c5');r(119+a*5,7+a*3,4+a*7,1,'#d0e3c5');c.restore()}
stone(84,-7,2,2,true);stone(256,-8,1,2,true);stone(125,36,2,1);stone(222,39,0,1);
// Stage one gravel, stage two dry-bank edging and short timber landing. None bridges the pool.
if(p>=1){for(let i=0;i<17;i++){let x=i<8?71+i*3:266+(i-8)*3;r(x,(i*7)%6,2+i%2,2,i%2?'#9ca082':'#657a61')}stone(75,-10,0,2,true);stone(263,-11,2,2)}
if(p>=2){for(let [x,y,k]of [[104,0,2],[117,0,0],[241,0,2],[252,0,1]])stone(x,floor(x+6)-2,k,1,true);for(let i=0;i<4;i++){r(272+i*5,-3,4,7,'#92734e');r(272+i*5,-3,3,1,'#c1a16b');r(273+i*5,1,1,2,'#5f503b')}r(272,4,20,3,'#594f3b')}
if(p>=3){
// Low bamboo flume on the back bank, distinct nodes and open mouth.
r(139,-23,3,20,'#5c7350');r(118,-25,32,5,'#a0aa70');r(118,-25,32,1,'#c2c18b');for(let x of [123,135,146])r(x,-25,2,5,'#6c8054');r(116,-24,3,7,'#4e6949');r(116,-18,2,24,'#94bfb0');
// Oval-rimmed wooden bucket and a low stool, with grain and iron bands.
r(280,-20,14,17,'#95724b');r(278,-19,18,3,'#c2a573');r(282,-20,10,2,'#4a513b');r(280,-15,14,2,'#5a5d46');r(281,-7,13,2,'#5a5d46');for(let x of [283,287,291])r(x,-12,1,6,'#b28d59');r(283,-26,10,2,'#ba9c6b');r(281,-24,2,6,'#ba9c6b');r(293,-24,2,6,'#ba9c6b');r(298,-9,17,4,'#ad8c59');r(300,-5,3,6,'#715d40');r(310,-5,3,6,'#715d40');
// Stone lantern: cap, pierced chamber, pedestal, warm core.
r(245,-23,6,20,'#75836a');r(240,-8,16,4,'#9ca286');r(241,-34,14,12,'#88977b');r(244,-31,8,7,p===4&&cold?'#e8ba6b':'#394c3c');r(247,-32,2,10,'#687a60');r(238,-37,20,3,'#abb194');r(241,-40,14,3,'#8a987a');r(246,-43,5,3,'#bac0a1');
// Small masonry heater below the spring, with wood fuel and a visible hearth.
stone(30,-18,1,2);r(36,-24,20,24,'#67735b');r(39,-18,14,16,'#27392d');r(33,-26,26,4,'#9da487');r(50,-42,6,16,'#6f7c63');r(48,-44,10,3,'#a2aa8b');r(34,-2,24,3,'#56533c');r(57,-7,13,5,'#88633e');r(59,-11,12,4,'#a07b49');
if(p===4&&cold){let f=Math.floor(t*8)%4;r(41,-11,10,9,'#b65f36');r(43,-15-(f%2)*2,6,12,'#e6a34f');r(45,-17+(f%3)*2,2,11,'#f4d18b');c.save();c.globalAlpha=.12+Math.sin(t*5)*.015;r(24,-31,42,34,'#edb86c');r(235,-39,26,30,'#e7bd7566');c.restore()}
}
if(p===4){for(let i=0;i<(season===3?10:cold?7:4);i++){let a=(t*.115+i*.153)%1,alpha=Math.sin(a*Math.PI)*(season===3?.4:cold?.3:.16),x=123+i*19+Math.sin(a*4+i)*8,y=3-a*(season===3?68:52),spread=Math.floor(a*5)*2;c.save();c.globalAlpha=alpha;for(let [dx,dy,w,h]of [[-7,2,18,4],[-3,-2,16,4],[2,-5,8,3]])r(x+dx-spread/2,y+dy,w+spread,h,'#c7d5bf');c.restore()}}
}
function foreground(c,g,t,s){if(!s.wet)return;let {r}=tools(c,g),left=Math.max(POOL.left,Math.floor(s.x-11)),right=Math.min(POOL.right,Math.ceil(s.x+12));c.save();c.globalAlpha=.28;for(let x=left;x<right;x+=2){let bottom=Math.min(s.y,floor(x));if(bottom>6)r(x,6,2,bottom-6,'#649e92')}c.restore();r(s.x-10,7,7,1,'#c1d9bd');r(s.x+5,8,8,1,'#a2c4b0')}
const api={backdrop,POOL,RESERVED,bed,floor,draw,foreground,stage};if(typeof module!=='undefined')module.exports=api;root.CaveSpring=api;
})(globalThis);
