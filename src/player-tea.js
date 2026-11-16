/* Image-model-painted seiza poses; surface-only, original player atlas preserved. */
(function(root){const data={width:256,height:256,baseline:224,frames:6};
data.frame=(sip,time=0)=>sip<0?5:sip<.4?1:sip<.8?2:sip<1.8?3:sip<2.2?4:5;
if(typeof module!=='undefined'){module.exports=data;return}const base=new URL('./',document.currentScript.src);
data.load=()=>{if(!data.image){data.image=new Image();data.image.src=new URL(base.pathname.endsWith('/src/')?'../assets/characters/player-detail/tea-atlas.png':'characters/player-detail/tea-atlas.png',base)}};
data.draw=(c,x,feet,sip,time)=>{data.load();if(!data.image.complete||!data.image.naturalWidth)return false;let f=data.frame(sip,time),breath=sip<0?Math.floor(Math.sin(time*2)*.7):0;c.save();c.imageSmoothingEnabled=false;c.drawImage(data.image,f*256,0,256,256,Math.round(x-64),Math.round(feet-112+breath),128,128);c.restore();return true};root.CavePlayerTea=data;
})(globalThis);
