/* Surface night is presentation/state only; collision and mining remain unchanged. */
(function(root){'use strict';
const duration=3.6;
function advance(s,h,dt){if(!s.sleepTransition)return false;let q=s.sleepTransition;q.elapsed+=dt;let changed=false;if(q.elapsed>=1.65&&!q.switched){s.night=h.night=true;q.switched=true;changed=true}if(q.elapsed>=duration)s.sleepTransition=null;return changed}
function cover(t){return t<1.5?Math.max(0,t/1.5):t<1.95?1:Math.max(0,(duration-t)/1.65)}
function mask(c,w,h,t){let amount=cover(t),size=20;c.clearRect(0,0,w,h);c.fillStyle='#050710';for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){let edge=Math.max(Math.abs((x+10)/w*2-1),Math.abs((y+10)/h*2-1)),threshold=1-edge;c.globalAlpha=Math.max(0,Math.min(1,(amount*1.16-threshold)/.16));c.fillRect(x,y,size,size)}c.globalAlpha=1}
// Independent hashed phases prevent diagonal rows; depth controls scale and fall speed.
function snow(c,s,g,height){
const random=(i,k)=>{let n=Math.imul(i+71,k+0x9e3779b9);n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return ((n^(n>>>16))>>>0)/4294967296},wrap=(v,n)=>(v%n+n)%n;
const count=s.night?150:105,t=s.time;
for(let i=0;i<count;i++){
let depth=random(i,13),speed=12+depth*34+random(i,29)*12,phase=random(i,47)*Math.PI*2;
let x=Math.round(wrap(random(i,61)*1040+t*(2+random(i,83)*13)+Math.sin(t*(.22+random(i,107)*.65)+phase)*(5+depth*15)+Math.sin(t*.16+phase*2)*9,1040)-40);
let y=Math.round(wrap(random(i,139)*(height+48)+t*speed,height+48)-24);
let interior=s.snowInterior||(s.inside?{left:474,right:696,top:g-150,bottom:g}:null);if(interior&&x>interior.left&&x<interior.right&&y>interior.top&&y<interior.bottom)continue;
c.globalAlpha=.32+depth*.58;c.fillStyle=s.night?(depth>.65?'#e0e9ef':'#b4c8dd'):(depth>.65?'#f0f2e7':'#cbdcd9');
if(depth<.36)c.fillRect(x,y,1,1);else if(depth<.78)c.fillRect(x,y,2,2);else{let arm=depth>.93?2:1;c.fillRect(x-arm,y,arm*2+1,1);c.fillRect(x,y-arm,1,arm*2+1);if(depth>.93){c.globalAlpha*=.65;c.fillRect(x-1,y-1,3,3)}}
}c.globalAlpha=1;
}
function paint(c,s,g,height,h){if(!s.night)return;const r=(x,y,w,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,hh)};
r(0,0,960,height,['#101d496e','#14193680','#23183e75','#17234880'][s.season]);
function lamp(x,y,scale=1){c.save();for(let i=4;i>0;i--){c.globalAlpha=.025+(4-i)*.012;r(x-i*9*scale,y-i*7*scale,i*18*scale,i*14*scale,'#ffd18a')}c.globalAlpha=.9;r(x-1,y-2,3,5,'#ffe3a0');c.restore()}
function window(x,y,w,hh){lamp(x+w/2,y+hh/2,.8);c.save();c.globalCompositeOperation='screen';c.globalAlpha=.38;r(x,y,w,hh,'#f1c77a');c.restore()}
if(h.progress>=6){if(s.inside){window(534,g-138,104,43);lamp(495,g-24);lamp(575,g-55,1.4)}else{window(488,g-72,57,38);window(633,g-72,28,38)}lamp(745,g-58)}
if((h.onsenStage||0)>=3){window(167,g-63,30,26);window(243,g-63,30,26);lamp(182,g-76);lamp(250,g-76);lamp(45,g-13);lamp(242,g-32)}lamp(420,g-14);
if(s.season===3){for(let x=0;x<960;x+=7)if(x<94||x>270)r(x,g-4-(x%3),8,5,'#c7d6e5');snow(c,s,g,height);if(h.progress>=5&&!s.inside){r(464,g-129,53,3,'#c5d2e4');r(649,g-129,66,3,'#c5d2e4')}}
if(s.season===1){for(let i=0;i<135;i++){let x=(i*79-s.time*145)%1040;if(x<0)x+=1040;let y=(i*47+s.time*260)%height;if(s.inside&&x>472&&x<699&&y>g-152&&y<g)continue;for(let j=0;j<4;j++)r(x-j*2,y+j*3,1,3,'#9bbbd36b')}for(let i=0;i<26;i++){let age=(s.time*2.5+i*.37)%1,x=i*37%960;if(x>94&&x<270)continue;c.globalAlpha=(1-age)*.6;r(x-age*4,g-age*3,2,1,'#bcd6e4');r(x+age*4,g-age*3,2,1,'#bcd6e4')}c.globalAlpha=1}}
const api={snow,duration,advance,cover,mask,paint};if(typeof module!=='undefined')module.exports=api;root.CaveNight=api;
})(globalThis);
