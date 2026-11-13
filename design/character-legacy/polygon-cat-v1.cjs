/* Stage 1 only: three static original catgirl poses. Gameplay resources stay intact. */
(function(root){'use strict';
const WIDTH=32,HEIGHT=48,BASELINE=46,poses=['idle_3q','side_right','side_left'];
const palette={outline:'#34463f',hair:'#e9e8dd',shine:'#fff8ea',hairShade:'#b9c9be',hairDeep:'#91aaa0',eye:'#4c9c77',eyeDark:'#275b4d',skin:'#f3d0bd',skinShade:'#d6b3a2',blush:'#dba4a2',ear:'#d7a6a1',mouth:'#b68d85',dress:'#497e67',dressShade:'#315848',dressLight:'#80ad89',hem:'#b2c79e',boot:'#5a4845',bootLight:'#8d6d59',strap:'#9a7955',metal:'#d2bb86'};
const colors=Object.fromEntries(Object.entries(palette).map(([k,v])=>[k,[...v.slice(1).match(/../g).map(x=>parseInt(x,16)),255]])),cache=new Map(),sprites=new Map();
function frame(pose='idle_3q'){if(!poses.includes(pose))throw Error('Unknown pose '+pose);if(cache.has(pose))return cache.get(pose);if(pose==='side_left'){let right=frame('side_right'),pixels=new Uint8ClampedArray(WIDTH*HEIGHT*4);for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)pixels.set(right.pixels.subarray((y*WIDTH+x)*4,(y*WIDTH+x+1)*4),(y*WIDTH+WIDTH-1-x)*4);let pic={pose,width:WIDTH,height:HEIGHT,pixels};cache.set(pose,pic);return pic}
let pixels=new Uint8ClampedArray(WIDTH*HEIGHT*4),front=pose==='idle_3q';
const rect=(x,y,w,h,col)=>{for(let yy=Math.max(0,y);yy<Math.min(HEIGHT,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(WIDTH,x+w);xx++)pixels.set(colors[col],(yy*WIDTH+xx)*4)};
const poly=(points,col)=>{for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){let a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&x+.5<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside}if(inside)rect(x,y,1,1,col)}};
// Thin tail behind the skirt, with a warm-white tip. Different static silhouettes.
if(front){poly([[11,34],[10,39],[7,42],[4,41],[2,38],[2,33],[4,30],[5,31],[4,34],[4,38],[6,40],[8,38],[9,33]],'outline');poly([[10,34],[9,39],[6,41],[4,39],[3,36],[3,33],[4,32],[4,37],[6,39],[8,37]],'hairShade');rect(3,31,2,3,'hair')}
else{poly([[12,35],[9,38],[5,39],[2,37],[1,34],[2,30],[4,29],[5,31],[3,32],[3,35],[5,37],[8,36],[10,33]],'outline');poly([[11,35],[8,37],[5,38],[3,36],[2,33],[3,30],[4,30],[3,33],[4,35],[6,36],[9,34]],'hairShade');rect(2,30,2,2,'hair')}
// Boots / legs keep the same sole anchor in every pose. Ears and tail are visual only.
rect(13,37,4,7,'skinShade');rect(20,37,4,7,'skin');rect(12,42,5,4,'outline');rect(19,42,6,4,'outline');rect(13,42,4,3,'boot');rect(20,42,5,3,'boot');rect(13,42,3,1,'bootLight');rect(20,42,3,1,'bootLight');
// Green explorer dress: fitted bodice, belt, satchel and a flared hem (no copied apron).
poly([[13,25],[20,25],[23,28],[23,32],[26,37],[24,39],[11,39],[10,37],[12,32]],'outline');poly([[14,26],[20,26],[22,28],[21,33],[24,37],[12,37],[14,32]],'dress');rect(13,28,2,5,'dressShade');rect(17,27,2,5,'dressLight');rect(12,37,12,1,'hem');rect(12,38,12,1,'dressShade');rect(13,32,9,2,'strap');rect(18,32,2,1,'metal');rect(21,31,3,4,'boot');rect(21,31,3,1,'strap');rect(22,32,1,1,'metal');
rect(16,23,4,4,'skin');rect(15,26,2,1,'shine');rect(17,27,2,1,'hem');rect(19,26,2,1,'shine');
// Far / near arms; shoulders stay readable below the shoulder-length hair.
rect(11,28,2,6,'dressShade');rect(10,33,3,3,'skinShade');rect(22,28,3,4,'dress');rect(23,32,2,4,'skin');rect(23,35,2,1,'skinShade');
if(front){
 // Round crown, deliberately different ear widths for 3/4 perspective.
 poly([[7,11],[6,3],[8,2],[13,7],[19,7],[23,3],[25,4],[25,11],[27,15],[26,20],[28,23],[24,23],[24,25],[20,24],[10,25],[7,23],[4,23],[6,19],[5,15]],'outline');
 poly([[8,11],[7,4],[11,8],[20,8],[24,5],[24,12],[26,16],[25,20],[26,22],[22,23],[21,24],[10,24],[8,21],[6,22],[7,17],[6,15]],'hair');
 poly([[8,5],[11,9],[8,10]],'ear');poly([[23,6],[23,10],[21,10]],'ear');
 poly([[7,15],[9,12],[11,15],[10,21],[12,24],[9,23],[7,20],[6,22]],'hairShade');rect(23,19,2,4,'hairShade');
 // Rounded face, two eyes with slight perspective asymmetry.
 poly([[12,12],[20,11],[23,13],[24,16],[24,20],[21,23],[17,24],[13,22],[11,19],[10,16]],'skin');rect(11,17,1,3,'skinShade');
 rect(12,15,5,1,'eyeDark');rect(13,16,4,4,'eyeDark');rect(14,16,3,3,'eye');rect(14,16,1,2,'shine');rect(15,19,2,1,'dressLight');
 rect(20,15,3,1,'eyeDark');rect(20,16,3,4,'eyeDark');rect(20,16,2,3,'eye');rect(20,16,1,1,'shine');rect(20,19,2,1,'dressLight');
 rect(12,20,2,1,'blush');rect(22,20,1,1,'blush');rect(19,20,1,1,'skinShade');rect(18,22,2,1,'mouth');
 // Asymmetric fringe and two fluffy cheek locks, leaving both eyes exposed.
 poly([[10,10],[16,9],[22,10],[24,12],[22,14],[20,12],[18,14],[16,12],[13,15],[12,13],[10,16]],'hair');
 rect(12,9,5,1,'shine');rect(18,10,3,1,'shine');rect(8,13,2,4,'hairShade');
 poly([[9,15],[11,15],[12,20],[11,22],[12,25],[9,23],[8,20],[7,21]],'hair');rect(9,18,1,4,'hairShade');poly([[24,15],[26,17],[25,21],[26,23],[23,22],[24,19]],'hair');
}else{
 // Same crown / ears / dress at a side angle; one inset emerald eye.
 poly([[10,11],[10,3],[12,2],[17,7],[21,7],[24,3],[26,5],[26,11],[28,14],[28,20],[26,23],[22,24],[17,25],[12,24],[9,25],[9,22],[6,23],[8,18],[7,14]],'outline');
 poly([[11,11],[11,4],[15,8],[22,8],[24,5],[25,7],[25,12],[27,15],[27,20],[25,22],[21,23],[16,24],[12,23],[10,24],[10,21],[8,22],[9,17],[8,14]],'hair');
 poly([[12,5],[15,9],[12,10]],'ear');poly([[24,6],[24,10],[22,10]],'ear');
 poly([[9,14],[12,12],[14,17],[13,22],[15,24],[11,23],[10,24],[10,20],[8,22]],'hairShade');rect(14,18,2,5,'hairDeep');
 poly([[20,11],[25,12],[27,14],[27,17],[29,17],[28,19],[27,20],[27,22],[24,24],[21,23],[19,20],[18,16]],'skin');
 rect(22,14,4,1,'eyeDark');rect(23,15,3,4,'eyeDark');rect(23,15,2,3,'eye');rect(23,15,1,2,'shine');rect(23,18,2,1,'dressLight');rect(25,20,1,1,'blush');rect(26,21,1,1,'mouth');rect(20,21,1,2,'skinShade');
 poly([[13,10],[19,9],[24,11],[26,13],[24,13],[22,12],[21,15],[19,13],[17,16],[17,12],[14,14]],'hair');rect(15,9,4,1,'shine');rect(20,10,2,1,'shine');
 poly([[15,15],[18,14],[19,18],[18,22],[19,24],[16,23],[15,20],[13,21]],'hair');rect(16,18,1,4,'hairShade');
}
let result={pose,width:WIDTH,height:HEIGHT,pixels};cache.set(pose,result);return result}
function draw(c,pose,x,feetY,scale=1){let pic=frame(pose),sprite=sprites.get(pose);if(!sprite){let doc=c.canvas?.ownerDocument||root.document;if(!doc)return;sprite=doc.createElement('canvas');sprite.width=WIDTH;sprite.height=HEIGHT;let q=sprite.getContext('2d'),im=q.createImageData(WIDTH,HEIGHT);im.data.set(pic.pixels);q.putImageData(im,0,0);sprites.set(pose,sprite)}c.save();c.imageSmoothingEnabled=false;c.drawImage(sprite,Math.round(x-WIDTH*scale/2),Math.round(feetY-BASELINE*scale),WIDTH*scale,HEIGHT*scale);c.restore()}
// Compatible mapping for a later replacement; this stage intentionally contains no new motion frames.
function poseForState(state,face=1){return state==='idle'?'idle_3q':face<0?'side_left':'side_right'}
const api={WIDTH,HEIGHT,BASELINE,poses,palette,frame,draw,poseForState};if(typeof module!=='undefined')module.exports=api;root.CavePlayerConcept=api;
})(globalThis);
