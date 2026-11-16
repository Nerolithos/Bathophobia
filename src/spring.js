/* Designed two-pixel contours. One height field drives both the basin paint and feet collision. */
(function(root){'use strict';
const POOL={left:94,right:270,depth:54,waterline:6},RESERVED={left:18,right:286};
const bed=[[94,0],[98,7],[102,15],[108,24],[116,32],[128,39],[144,45],[162,49],[180,51],[198,52],[216,49],[232,44],[244,35],[254,23],[262,12],[270,0]];
function floor(x){if(x<=94||x>=270)return 0;for(let i=1;i<bed.length;i++)if(x<=bed[i][0]){let a=bed[i-1],b=bed[i];return Math.round((a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))/2)*2}return 0}
const stoneShapes=[['  xxxx  ',' xhhhxx ','xhhmmmxx','xmmmmddx',' xxdddxx','  xxxx  '],['   xxxx   ',' xxhhhxxx ','xhhhmmmmxx','xmmmmmmddx',' xxdddddxx','   xxxxx  '],['  xxx  ',' xhhxx ','xhhmmxx','xmmmddx',' xxddx ','  xxx  ']];
function tools(c,g){const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),g+Math.round(y),w,h)};return{r,stone(x,y,type=0,scale=2,moss=false){let rows=stoneShapes[type%3],pal={x:'#4d6258',h:'#a1aa8b',m:'#7e8f79',d:'#627560'};rows.forEach((row,j)=>[...row].forEach((p,i)=>{if(p!==' ')r(x+i*scale,y+j*scale,scale,scale,pal[p])}));if(moss){r(x+scale*2,y+scale,scale*3,scale,'#78905c');r(x+scale,y+scale*2,scale*2,scale,'#637b51')}}}}
function stage(home){return home.onsen?4:home.onsenStage||0}
// Independent scenic terrace. Background-only geometry never changes swimming or navigation.
const bambooStems=[{x:278,h:112,lean:-.08},{x:290,h:139,lean:.045},{x:433,h:130,lean:-.035},{x:448,h:151,lean:.09},{x:463,h:111,lean:-.07},{x:473,h:138,lean:.035}];
function bamboo(c,g,stems=bambooStems){const {r}=tools(c,g);for(let i=0;i<stems.length;i++){let {x,h,lean}=stems[i];for(let y=-h;y<-4;y+=4){const xx=x+(y+4)*lean;r(xx,y,3,4,i%2?'#527b59':'#668c54');r(xx+1,y,1,4,'#8ca563');if((y+h)%24===0)r(xx-1,y,5,2,'#9bab72')}
 for(let k=0;k<2;k++){const y=-h+25+k*39,xx=x+(y+4)*lean,side=i<2?-1:1;for(let j=0;j<4;j++){const bx=xx+side*(4+j*4),by=y+j*2;r(bx,by,5,1,'#496f4d');r(bx+side*2,by-3,2,6,'#6d955c');r(bx+side*4,by,2,5,'#86a769')}}}
}
function tree(c,x,h,g,season){const rect=(a,b,w,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(a),Math.round(b),w,hh)},poly=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(Math.round(a),Math.round(b)):c.moveTo(Math.round(a),Math.round(b)));c.closePath();c.fill()};rect(x,g-h,8,h,'#5c5140');rect(x-12,g-h+25,18,5,'#5c5140');if(season!==3){let colors=season===2?['#a97143','#c28a4e','#955a3f']:season===0?['#d794aa','#efb5c5','#f8d2db']:['#4c7954','#71935e','#406b4d'];for(let k=0;k<11;k++){let a=k*2.4,xx=x+Math.sin(a)*27,yy=g-h+Math.cos(a)*20;rect(xx-20,yy-15,35,27,colors[k%3])}}else{for(let [side,level,length] of [[-1,35,28],[1,47,32],[-1,70,22],[1,88,18]]){let y=g-h+level;poly([[x+4,y+8],[x+4+side*length,y-12],[x+4+side*(length+5),y-27],[x+4+side*(length+2),y-25],[x+4+side*(length-3),y-10],[x+4,y+2]],'#6f6d58');let bx=x+4+side*(length-8);rect(Math.min(bx,bx+side*12),y-10,12,2,'#c3d2c7')}poly([[x+3,g-h+27],[x-5,g-h+5],[x-4,g-h-10],[x-2,g-h-9],[x-2,g-h+4],[x+6,g-h+23]],'#6f6d58');rect(x,g-h,3,h,'#7b7760');rect(x-3,g-h+8,4,2,'#d1dccc')}}
function petals(c,s,g,camera=0){if(s.season!==0)return;const hash=(i,k)=>{let n=Math.imul(i+43,k+9277);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296},wrap=(v,n)=>(v%n+n)%n;for(let [base,hh]of [[28,122],[359,147],[771,133],[-879,156],[-97,163]])for(let i=0;i<24;i++){let seed=i+base*7,life=6+hash(seed,13)*4,age=wrap(s.time+hash(seed,17)*life,life),u=age/life,depth=.55+hash(seed,19)*.45,x=base+(hash(seed,23)-.5)*100+age*(5+hash(seed,29)*8)+Math.sin(age*1.5+seed)*10-camera,y=g-hh-20+u*(hh+29)+Math.sin(age*2+seed)*4;if(x< -8||x>968||y>g+5)continue;if(s.inside&&s.area!=='tea'&&x+camera>455&&x+camera<713&&y>g-190)continue;c.save();c.globalAlpha=Math.min(1,age*2,(life-age)*2)*(.55+depth*.4);c.fillStyle=i%3?'#f5c6d5':'#e49ab7';let w=Math.abs(Math.sin(age*3+seed))>.5?3:1;c.fillRect(Math.round(x),Math.round(y),w,2);if(w===3){c.fillStyle='#ffe0e7';c.fillRect(Math.round(x)+1,Math.round(y)-1,1,1)}c.restore()}}
function backdrop(c,g,t,home,season){if(stage(home)<3)return;const {r}=tools(c,g),winter=season===3;c.save();c.translate(-145,0);
// Six culms in two asymmetric groups, with only a few drooping sprays at selected nodes.
bamboo(c,g);
// A raised, grounded terrace: contact shadow, irregular masonry, wooden sill and connected steps.
r(295,-3,135,3,'#293f35');r(302,-19,120,16,'#646d60');for(let row=0;row<2;row++)for(let col=0;col<6;col++){const x=303+col*20+(row%2?3:0);r(x,-18+row*7,17,6,row%2?'#92938a':'#85897c');r(x+1,-18+row*7,14,1,'#afb09a')}
r(298,-25,128,6,'#514333');r(298,-25,128,2,'#ae8758');for(let x of[303,344,379,418]){r(x,-32,4,29,'#654a36');r(x+1,-31,1,27,'#9e7950')}
for(let [x,y,w]of [[350,-19,28],[347,-13,34],[344,-7,40]]){r(x,y,w,5,'#777d6e');r(x,y,w,1,'#b2ae92')}for(let i=0;i<4;i++)r(386+i*12,-3,9,2,i%2?'#8a917e':'#9da28b');
// Warm plaster framed with walnut timber; recessed shoji bays and central sliding entrance.
r(305,-95,114,68,'#bba889');r(307,-93,109,63,'#e5d6b8');r(309,-92,107,4,'#cfbd9a');r(305,-69,114,4,'#78543d');r(305,-34,114,4,'#78543d');
for(let x of[304,338,383,415]){r(x,-97,5,73,'#604633');r(x+1,-96,2,71,'#956d48')}
for(let [x,w] of [[312,23],[388,24]]){r(x-1,-64,w+2,29,'#624c37');r(x,-63,w,26,'#e5c789');r(x+2,-61,w-4,22,'#eddaa8');for(let j=5;j<w;j+=6)r(x+j,-63,1,26,'#9a8058');for(let y=-57;y<-37;y+=6)r(x,y,w,1,'#aa9165');r(x,-37,w,2,'#75543d')}
r(346,-65,33,37,'#3e4436');r(349,-62,27,33,'#bcac83');r(362,-62,2,33,'#796141');r(350,-61,11,30,'#d8cb9f');r(365,-61,10,30,'#c3bb96');r(355,-46,2,2,'#85694a');r(369,-46,2,2,'#85694a');
// Indigo noren hangs in separate panels; small warm sign above the entry.
r(345,-63,35,2,'#8a6744');for(let x of[347,358,369]){r(x,-61,9,11,'#476e6c');r(x+1,-60,1,9,'#74918a')}r(360,-57,4,3,'#c6c6a1');r(350,-83,25,9,'#78543d');r(353,-81,19,5,'#b8955f');r(357,-80,2,3,'#e3cf98');r(365,-80,3,3,'#e3cf98');
// Triangular gable with staggered timber courses and a substantial layered tiled roof.
for(let row=0;row<12;row++){const half=4+row*5;r(362-half,-130+row*3,half*2,4,'#78543d');if(row>0)r(365-half,-129+row*3,half*2-6,2,'#d5c29e')}
for(let side of[-1,1])for(let k=0;k<12;k++){r(361+side*k*5,-130+k*3,7,3,'#354d50');r(361+side*k*5,-130+k*3,6,1,'#6f8b86')}
for(let row=0;row<5;row++){let left=309-row*5,width=107+row*10;r(left,-108+row*3,width,4,'#425d61');for(let x=left+2;x<left+width-1;x+=8){r(x,-108+row*3,5,1,'#78928c');r(x+5,-107+row*3,2,2,'#2e484e')}}r(285,-94,155,4,'#3b4c48');r(287,-90,151,3,'#78543d');r(288,-90,148,1,'#b18a59');r(356,-132,13,3,'#405e61');r(357,-133,11,1,'#829a8f');
// Two sheltered lanterns. Discrete translucent pixel halos, not blurred gradients.
for(let x of[327,395]){r(x,-89,1,7,'#5f4b35');c.save();c.globalAlpha=.12;r(x-7,-82,17,19,'#f4c978');c.restore();r(x-3,-82,8,3,'#78543d');r(x-3,-79,8,9,'#d6a75e');r(x-2,-78,6,7,'#f4c978');r(x,-78,1,7,'#ffe3a0');r(x-2,-70,6,2,'#78543d')}
// Short fence at the side leaves the entrance and windows clear.
for(let x of[431,440,449])r(x,-19,2,16,'#7c8e5a');r(431,-15,20,2,'#9a9f69');r(431,-7,20,2,'#7d8b5b');
if(winter){r(317,-110,23,2,'#cbd4bf');r(389,-102,30,2,'#cbd4bf')}
c.restore()}
function draw(c,g,t,home,season){let {r,stone}=tools(c,g),p=stage(home),cold=season===2||season===3||home.night;
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
const api={tree,petals,bamboo,bambooStems,backdrop,POOL,RESERVED,bed,floor,draw,foreground,stage};if(typeof module!=='undefined')module.exports=api;root.CaveSpring=api;
})(globalThis);
