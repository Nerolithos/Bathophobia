/* Surface night is presentation/state only; collision and mining remain unchanged. */
(function(root){'use strict';
const duration=3.6;
function advance(s,h,dt){if(!s.sleepTransition)return false;let q=s.sleepTransition;q.elapsed+=dt;let changed=false;if(q.elapsed>=1.65&&!q.switched){s.night=h.night=true;q.switched=true;changed=true}if(q.elapsed>=duration)s.sleepTransition=null;return changed}
function cover(t){return t<1.5?Math.max(0,t/1.5):t<1.95?1:Math.max(0,(duration-t)/1.65)}
function mask(c,w,h,t){let amount=cover(t),size=20;c.clearRect(0,0,w,h);c.fillStyle='#050710';for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){let edge=Math.max(Math.abs((x+10)/w*2-1),Math.abs((y+10)/h*2-1)),threshold=1-edge;c.globalAlpha=Math.max(0,Math.min(1,(amount*1.16-threshold)/.16));c.fillRect(x,y,size,size)}c.globalAlpha=1}
function paint(c,s,g,height,h){if(!s.night)return;const r=(x,y,w,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,hh)};
r(0,0,960,height,['#101d496e','#14193680','#23183e75','#17234880'][s.season]);
function lamp(x,y,scale=1){c.save();for(let i=4;i>0;i--){c.globalAlpha=.025+(4-i)*.012;r(x-i*9*scale,y-i*7*scale,i*18*scale,i*14*scale,'#ffd18a')}c.globalAlpha=.9;r(x-1,y-2,3,5,'#ffe3a0');c.restore()}
function window(x,y,w,hh){lamp(x+w/2,y+hh/2,.8);c.save();c.globalCompositeOperation='screen';c.globalAlpha=.38;r(x,y,w,hh,'#f1c77a');c.restore()}
if(h.progress>=6){if(s.inside){window(534,g-138,104,43);lamp(495,g-24);lamp(575,g-55,1.4)}else{window(488,g-72,57,38);window(633,g-72,28,38)}lamp(745,g-58)}
if((h.onsenStage||0)>=3){window(167,g-63,30,26);window(243,g-63,30,26);lamp(182,g-76);lamp(250,g-76);lamp(45,g-13);lamp(242,g-32)}lamp(420,g-14);
if(s.season===3){for(let x=0;x<960;x+=7)if(x<94||x>270)r(x,g-4-(x%3),8,5,'#c7d6e5');for(let i=0;i<85;i++)r((i*73+s.time*(10+i%4))%960,(i*37+s.time*(20+i%7))%height, i%4?2:3,2,'#d0dbea');if(h.progress>=5){r(464,g-129,53,3,'#c5d2e4');r(649,g-129,66,3,'#c5d2e4')}}
if(s.season===1){for(let i=0;i<135;i++){let x=(i*79-s.time*145)%1040;if(x<0)x+=1040;let y=(i*47+s.time*260)%height;if(s.inside&&x>472&&x<699&&y>g-152&&y<g)continue;for(let j=0;j<4;j++)r(x-j*2,y+j*3,1,3,'#9bbbd36b')}for(let i=0;i<26;i++){let age=(s.time*2.5+i*.37)%1,x=i*37%960;if(x>94&&x<270)continue;c.globalAlpha=(1-age)*.6;r(x-age*4,g-age*3,2,1,'#bcd6e4');r(x+age*4,g-age*3,2,1,'#bcd6e4')}c.globalAlpha=1}}
const api={duration,advance,cover,mask,paint};if(typeof module!=='undefined')module.exports=api;root.CaveNight=api;
})(globalThis);
