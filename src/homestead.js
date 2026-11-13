/* Surface storage is deliberately isolated from expedition inventory. */
(function(root){'use strict';
const S=typeof module!=='undefined'?require('./systems'):root.CaveSystems;
const KEY='bathophobia-homestead-v1',seasons=['春','夏','秋','冬'];
const plans=[{name:'水泥地基',cost:{31:8}},{name:'合金承重框架',cost:{28:6}},{name:'墙体与楼板',cost:{31:12,16:8}},{name:'木屋顶',cost:{16:12,28:2}},{name:'玻璃窗与竣工',cost:{21:8}}];
function counts(a){return Array.from({length:S.IDs.COUNT},(_,i)=>Number.isSafeInteger(a?.[i])&&a[i]>=0?a[i]:0)}
function fresh(){return {version:1,vault:counts(),escrow:counts(),activeRun:false,descents:0,season:2,progress:0,station:{furnaceTier:1},lastGather:-1}}
function settle(h){if(!h.activeRun)return false;h.escrow.forEach((n,i)=>h.vault[i]+=n);h.escrow=counts();h.activeRun=false;return true}
function save(h,storage){try{storage.setItem(KEY,JSON.stringify(h))}catch{}}
function load(storage){let h=fresh();try{let x=JSON.parse(storage.getItem(KEY));if(x?.version===1){h={...h,...x,vault:counts(x.vault),escrow:counts(x.escrow),station:{furnaceTier:x.station?.furnaceTier===2?2:1}};h.descents=Number.isSafeInteger(x.descents)&&x.descents>=0?x.descents:0;h.season=Number.isInteger(x.season)&&x.season>=0&&x.season<4?x.season:2;h.lastGather=Number.isSafeInteger(x.lastGather)?x.lastGather:-1;h.progress=Math.max(0,Math.min(plans.length,Math.floor(Number(h.progress)||0)));h.activeRun=x.activeRun===true}}catch{}settle(h);save(h,storage);return h}
function begin(h){settle(h);h.descents++;h.season=(h.season+1)%4;h.activeRun=true;h.escrow=counts();return counts()}
function sync(h,bag){if(h.activeRun)h.escrow=counts(bag)}
function build(h){let p=plans[h.progress];if(!p)return {ok:false,message:'小屋已经竣工'};if(Object.entries(p.cost).some(([i,n])=>h.vault[i]<n))return {ok:false,message:'材料不足，请继续收集和加工'};for(let [i,n]of Object.entries(p.cost))h.vault[i]-=n;h.progress++;return {ok:true,message:p.name+'完成'}}
function gather(h){if(h.lastGather===h.descents)return false;h.lastGather=h.descents;h.vault[16]+=4;return true}
const api={KEY,seasons,plans,fresh,load,save,settle,begin,sync,build,gather};if(typeof module!=='undefined')module.exports=api;root.CaveHomestead=api;
})(globalThis);
