/* Original white-haired heroine: pixel-authored layers baked into cached sprite sheets.
   Visual state is kept outside physics objects. No animation moves the collision box. */
(function(root){'use strict';
const WIDTH=40,HEIGHT=40,BASELINE=36;
const clips={idle:{frames:4,fps:4},walk:{frames:6,fps:8},run:{frames:6,fps:12},jump_start:{frames:2,fps:10},jump_rise:{frames:1,fps:1},jump_apex:{frames:1,fps:1},fall:{frames:2,fps:6},land:{frames:3,fps:12},swim:{frames:6,fps:6},mine:{frames:4,fps:10},hurt:{frames:3,fps:12},death:{frames:4,fps:8},fly:{frames:4,fps:6}};
const palette={hair:'#edefe3',shine:'#fffdf0',hairShade:'#ceddd2',hairMid:'#a8c5ba',hairDeep:'#789f94',skin:'#efd3bf',skinShade:'#c7ad9e',blush:'#d6afa8',mouth:'#b28e83',eye:'#3e8b65',eyeDark:'#41685c',dress:'#5a957c',dressShade:'#3b705f',dressLight:'#9ac7a0',hem:'#c0d9ad',boot:'#536960',bootLight:'#8b9c83',wood:'#a38157',iron:'#b5c2b9',ironLight:'#e0dfcb'};
const rgba=Object.fromEntries(Object.entries(palette).map(([k,c])=>[k,[...c.slice(1).match(/../g).map(v=>parseInt(v,16)),255]]));
const rasters=new Map(),sheets=new Map(),actors=new WeakMap();
function frame(state,index=0,{blink=false,tool=false,brake=false}={}){let clip=clips[state];if(!clip)throw Error('Unknown heroine clip '+state);index=((index%clip.frames)+clip.frames)%clip.frames;let key=[state,index,+blink,+tool,+brake].join(':'),cached=rasters.get(key);if(cached)return cached;let pixels=new Uint8ClampedArray(WIDTH*HEIGHT*4);
const rect=(x,y,w,h,color)=>{for(let yy=Math.max(0,Math.round(y));yy<Math.min(HEIGHT,Math.round(y+h));yy++)for(let xx=Math.max(0,Math.round(x));xx<Math.min(WIDTH,Math.round(x+w));xx++)pixels.set(rgba[color],(yy*WIDTH+xx)*4)};
const line=(x,y,xx,yy,color,thickness=1)=>{let n=Math.max(Math.abs(xx-x),Math.abs(yy-y));for(let i=0;i<=n;i++)rect(Math.round(x+(xx-x)*i/(n||1)),Math.round(y+(yy-y)*i/(n||1)),thickness,thickness,color)};
const poly=(points,color)=>{let ys=points.map(p=>p[1]);for(let y=Math.max(0,Math.min(...ys));y<=Math.min(HEIGHT-1,Math.max(...ys));y++)for(let x=0;x<WIDTH;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){let a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside}if(inside)rect(x,y,1,1,color)}};
let moving=state==='walk'||state==='run',running=state==='run',stride=moving?[[-4,4],[-3,2],[0,-1],[4,-4],[2,-3],[-1,0]][index]:[0,0],squash=state==='land'?[3,2,0][index]:state==='jump_start'?1-index:state==='hurt'?[1,0,0][index]:0,bob=moving&&[1,4].includes(index)?1:state==='idle'&&index===2?1:0,bodyY=squash+bob;
// Three staggered back locks. White masses are separated by directional shading
// and negative space at their tips, rather than one filled triangular cape.
const lockShapes=[[[12,12],[15,13],[13,21],[10,26],[7,28],[9,23],[10,17]],[[15,11],[19,12],[18,22],[17,28],[13,33],[11,34],[13,29],[14,21]],[[18,12],[21,15],[20,22],[20,26],[18,29],[16,29],[18,24]]];
function lockPoint(x,y,i){let d=Math.max(0,(y-12)/22),dx=0,dy=0;
 if(state==='idle'){dx=[0,0,-1,1][index]*d*(i===1?1:.5);dy=[0,1,0,-1][index]*d*(i===0?1:.5)}
 if(state==='walk'){dx=(-1+[0,-1,0,1,0,-1][index])*d*d;dy=[0,1,0,-1,0,1][index]*d*(i+1)/2}
 if(state==='run'){dx=([-5,-6,-7,-5,-4,-6][index]-(i===0?1:0))*d*d;dy=-(i===1?5:3)*d+[0,1,0,-1,0,1][index]*d}
 if(state==='jump_start'||state==='jump_rise'){dx=(i===0?-1:1)*d;dy=(i===1?0:3)*d}
 if(state==='jump_apex'){dx=(i===0?-3:i===1?-1:1)*d;dy=-3*d}
 if(state==='fall'){dx=-(i===2?2:4)*d;dy=-(i===1?14:10)*d+(index===1&&i===0?-1:0)}
 if(state==='land'){dx=[3,2,0][index]*d;dy=[1,0,0][index]*d}
 if(state==='swim'){dx=[-5,-4,-2,-3,-4,-5][index]*d*d;dy=(-5+Math.sin((index+i)*Math.PI/3)*2)*d}
 if(state==='mine'){dx=[0,-1,-3,1][index]*d*d;dy=[0,-1,0,1][index]*d}
 if(state==='hurt'){dx=[-4,2,0][index]*d*d;dy=-d}
 if(state==='fly'){dx=[-4,-3,-2,-3][index]*d*d;dy=(-6+(i+index)%3)*d}
 if(state==='death'){dx=index*d*(i===0?-2:i===1?0:2);dy=Math.min(35,y+index*3)-y}
 if(brake&&state!=='death')dx+=2*d;
 return [Math.round(x+dx),Math.round(y+dy)]}
for(let [i,points] of lockShapes.entries()){let P=(x,y)=>lockPoint(x,y,i),L=(x,y,xx,yy,color)=>line(...P(x,y),...P(xx,yy),color),R=(x,y,w,h,color)=>{let [xx,yy]=P(x,y);rect(xx,yy,w,h,color)};poly(points.map(([x,y])=>P(x,y)),'hair');if(i===0){L(12,16,10,23,'hairShade');L(9,24,8,26,'hairMid')}if(i===1){L(17,16,16,25,'hairShade');L(16,26,13,31,'hairMid');R(13,32,1,1,'hairDeep')}if(i===2){L(20,17,19,24,'hairMid');R(18,26,1,2,'hairShade')}}
// Far arm and far leg are painted before torso / skirt.
let feet=moving?(running?[[27,13],[25,16],[21,20],[13,27],[16,25],[20,21]]:[[25,15],[24,17],[21,20],[15,25],[17,24],[20,21]])[index]:[23,17],farX=feet[1],nearX=feet[0],legTop=29+Math.min(2,squash),rise=['jump_start','jump_rise'].includes(state),swim=state==='swim',air=rise||state==='jump_apex'||state==='fly';
if(state==='death'){poly([[15,29],[19,27],[29,29],[33,32],[32,35],[14,35]],'dressShade');rect(27,32,8,3,'boot');}
else if(swim){line(17,28,13+(index%3),32,'skinShade',2);line(23,28,27-(index%3),33,'skin',2);rect(11+index%3,32,5,2,'boot');rect(25-index%3,33,5,2,'bootLight');}
else if(state==='jump_apex'){line(18,29,17,33,'skinShade',2);rect(16,33,5,2,'boot');line(23,29,25,33,'skin',2);rect(24,33,5,2,'bootLight');}
else if(air){line(18,28,15,31,'skinShade',2);line(15,31,18,33,'skinShade',2);rect(17,32,5,2,'boot');line(23,29,26,31,'skin',2);rect(24,31,5,2,'bootLight');}
else{line(18,legTop,farX,34,'skinShade',2);rect(farX-1,34,5,2,'boot');line(23,legTop,nearX,34,'skin',2);rect(nearX-1,34,5,2,'bootLight');}
let armSwing=moving?stride[1]:0;line(18,21+bodyY,16+armSwing,27+bodyY,'skinShade',2);
// Dress: three values and a lighter hem, all axis-aligned pixel silhouettes.
let dead=state==='death',headDrop=dead?Math.min(index*3,8):0,torsoY=19+bodyY+(dead?headDrop:0);
rect(18,torsoY,8,7-Math.min(squash,2),'dress');rect(18,torsoY,2,7-Math.min(squash,2),'dressLight');rect(24,torsoY+2,2,6,'dressShade');
poly([[18,24+bodyY],[26,24+bodyY],[29,30],[26,31],[14,31],[15,28]],'dress');rect(14,30,15,2,'hem');rect(15,28,3,2,'dressShade');rect(20,25+Math.min(squash,2),2,5-Math.min(squash,2),'dressLight');
// One shared face template, anchored for every clip: crown, skin, bangs, side lock.
// Eye lies two source pixels behind the forehead edge; nose/mouth are skin only.
let hx=state==='hurt'?[-2,-1,0][index]:0,hy=bodyY+headDrop;
const headRect=(x,y,w,h,color)=>rect(x+hx,y+hy,w,h,color),headPoly=(points,color)=>poly(points.map(([x,y])=>[x+hx,y+hy]),color);
headPoly([[15,6],[18,4],[23,4],[26,6],[28,9],[28,14],[26,18],[21,20],[15,18],[12,14],[12,9]],'hair');
headPoly([[12,10],[14,7],[15,14],[17,18],[19,20],[15,19],[12,15]],'hairShade');
// Rounded forehead -> one-pixel nose -> cheek -> receding, soft chin.
headPoly([[22,9],[26,9],[28,10],[28,13],[29,13],[29,14],[28,15],[28,17],[26,19],[23,19],[21,17],[20,13]],'skin');
headRect(22,17,1,2,'skinShade');headRect(24,19,2,1,'skin');headRect(27,16,1,1,'mouth');headRect(26,15,1,1,'blush');
// Sparse crown highlights, two short bangs, and a separate chin-length side lock.
headRect(18,5,4,1,'shine');headRect(23,6,2,1,'shine');
let fringe=state==='run'?-1:state==='mine'&&index===2?1:0;headPoly([[16,7],[22,7],[24,8],[23,10],[21,12+fringe],[21,10],[18,11],[16,14]],'hair');
headPoly([[23,7],[26,8],[27,10],[25,9],[24,10]],'hair');
headRect(17,9,2,2,'hairShade');
let side=state==='fall'?-2:state==='run'?-1:state==='swim'?(index%3)-1:0;headPoly([[17,12],[20,11],[21,14],[20,18],[20,20+side],[18,22+side],[18,18],[17,16]],'hair');
headRect(18,14,1,5,'hairShade');headRect(19,19,1,2,'hairMid');
if(blink||state==='death')headRect(23,12,3,1,'eyeDark');else{headRect(23,11,3,1,'eyeDark');headRect(24,12,2,2,'eye');headRect(25,13,1,1,'eyeDark');headRect(24,12,1,1,'shine')}
// Near arm poses and a pixel-authored pickaxe: no runtime limb rotation.
let handX=27,handY=26+bodyY;if(state==='mine'){handX=[27,29,31,29][index];handY=[20,18,25,28][index]}else if(swim){handX=[28,30,31,29,27,26][index];handY=[22,20,23,26,28,25][index]}else if(air){handX=29;handY=20}else if(moving){handX=27-stride[1];handY=27-Math.abs(stride[1])/2}
line(26,21+bodyY,handX,handY,'skin',2);rect(handX,handY,2,2,'skin');
if(tool&&!dead){let tip=state==='mine'?[[25,3],[34,5],[37,20],[34,28]][index]:[34,15];line(handX,handY,tip[0],tip[1],'wood',2);let axis=state==='mine'&&index>=2?[[tip[0]-2,tip[1]-6],[tip[0]+1,tip[1]+6]]:[[tip[0]-6,tip[1]-2],[tip[0]+5,tip[1]+2]];line(...axis[0],...axis[1],'iron',2);line(axis[0][0]+1,axis[0][1],axis[1][0],axis[1][1],'ironLight')}
let result={key,width:WIDTH,height:HEIGHT,pixels,headAnchor:{x:hx,y:hy},eyeAnchor:{x:23+hx,y:11+hy}};rasters.set(key,result);return result}
function create(p){return {state:'idle',clock:0,started:0,x:p.x,y:p.y,ground:!!p.ground,vy:p.vy||0,hp:p.hp,actualVx:0,lockUntil:0,lastMine:0,blinkUntil:0,nextBlink:3+((Math.imul(Math.floor(p.x*139+p.y*71)||17,1103515245)>>>0)/4294967296)*3,rng:Math.abs(Math.floor(p.x*139+p.y*71))||17,brakeUntil:0,walkDistance:0,lastDust:0,particles:[]}}
function update(p,dt=1/60,{surface=false}={}){let m=actors.get(p);if(!m){m=create(p);actors.set(p,m)}m.clock+=dt;let vx=(p.x-m.x)/dt,vy=p.vy??((p.y-m.y)/dt),speed=Math.abs(vx),ground=!!p.ground,wet=!!p.wet&&!p.inLava,startedJump=!!p.didJump||!!p.didBounce||m.ground&&!ground&&vy< -60,landed=!m.ground&&ground&&m.vy>80&&!wet;
if(Math.abs(m.actualVx)>40&&(speed<10||speed>40&&Math.sign(vx)!==Math.sign(m.actualVx)))m.brakeUntil=m.clock+.16;
if(m.clock>=m.nextBlink){m.blinkUntil=m.clock+.15;m.rng=(Math.imul(m.rng,1664525)+1013904223)>>>0;m.nextBlink=m.clock+3+m.rng/4294967296*3}
let desired;if(p.dead)desired='death';else if(Number.isFinite(m.hp)&&p.hp<m.hp){desired='hurt';m.lockUntil=m.clock+.25}else if(m.state==='hurt'&&m.clock<m.lockUntil)desired='hurt';else if(wet)desired='swim';else if(p.flying)desired='fly';else if((p.miningUntil||0)>(p.time||0)||m.state==='mine'&&m.clock<m.lockUntil){desired='mine';if((p.miningUntil||0)!==m.lastMine)m.lockUntil=m.clock+.4}else if(startedJump){desired='jump_start';m.lockUntil=m.clock+.2}else if(landed){desired='land';m.lockUntil=m.clock+.25}else if(m.clock<m.lockUntil&&['jump_start','land','hurt'].includes(m.state))desired=m.state;else if(!ground)desired=vy< -65?'jump_rise':vy>65?'fall':'jump_apex';else desired=speed<8?'idle':speed<160?'walk':'run';
if(desired!==m.state){m.state=desired;m.started=m.clock}m.actualVx=vx;m.lastMine=p.miningUntil||0;m.x=p.x;m.y=p.y;m.ground=ground;m.vy=vy;m.hp=p.hp;
for(let q of m.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=90*dt;q.life-=dt}m.particles=m.particles.filter(q=>q.life>0);
function dust(n,water=false){for(let i=0;i<n;i++)m.particles.push({x:p.x+5+i*3,y:p.y+28,vx:(i-(n-1)/2)*17-vx*.05,vy:-13-i*4,life:.24+i*.03,color:water?'#a8d8cc':surface?'#a0ad7d':'#8ca497'})}
if(landed)dust(3);m.walkDistance+=ground?speed*dt:0;if(ground&&speed>25&&m.walkDistance>26&&m.clock-m.lastDust>.18){dust(1);m.walkDistance=0;m.lastDust=m.clock}if(wet&&speed>30&&m.clock-m.lastDust>.4){dust(2,true);m.lastDust=m.clock}
return m}
function snapshot(p){let m=actors.get(p);if(!m){m=create(p);actors.set(p,m)}let c=clips[m.state],fps=c.fps;if(m.state==='walk'||m.state==='run')fps*=Math.max(.55,Math.min(1.4,Math.abs(m.actualVx)/(m.state==='run'?170:150)));let age=Math.max(0,m.clock-m.started),index=['land','jump_start','hurt','death'].includes(m.state)?Math.min(c.frames-1,Math.floor(age*fps)):Math.floor(age*fps)%c.frames;return {state:m.state,index,blink:m.clock<m.blinkUntil,brake:m.clock<m.brakeUntil,clock:m.clock,particles:m.particles}}
function atlas(doc,state,options){let key=[state,+options.blink,+options.tool,+options.brake].join(':');if(sheets.has(key))return sheets.get(key);let sheet=doc.createElement('canvas');sheet.width=WIDTH*clips[state].frames;sheet.height=HEIGHT;let q=sheet.getContext('2d');for(let i=0;i<clips[state].frames;i++){let im=q.createImageData(WIDTH,HEIGHT);im.data.set(frame(state,i,options).pixels);q.putImageData(im,i*WIDTH,0)}sheets.set(key,sheet);return sheet}
function draw(c,p,cam=0,time=0,bag=[]){let doc=c.canvas?.ownerDocument||root.document;if(!doc)return;let pose=snapshot(p),sheet=atlas(doc,pose.state,{blink:pose.blink,brake:pose.brake,tool:bag[18]>0});for(let q of pose.particles){c.globalAlpha=Math.min(1,q.life*4);c.fillStyle=q.color;c.fillRect(Math.round(q.x),Math.round(q.y-cam),1,1)}c.globalAlpha=1;c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(p.x+7),Math.round(p.y+28-cam));if(p.face<0)c.scale(-1,1);if(!p.dead&&p.inv>0&&Math.floor(p.inv*14)%2===0)c.globalAlpha=.45;c.drawImage(sheet,pose.index*WIDTH,0,WIDTH,HEIGHT,-20,-BASELINE,WIDTH,HEIGHT);c.restore()}
const api={WIDTH,HEIGHT,BASELINE,clips,palette,frame,create,update,snapshot,draw};if(typeof module!=='undefined')module.exports=api;root.CaveHero=api;
})(globalThis);
