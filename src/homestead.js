/* Surface storage is deliberately isolated from expedition inventory. */
(function(root){'use strict';
const S=typeof module!=='undefined'?require('./systems'):root.CaveSystems;
const KEY='bathophobia-homestead-v1',seasons=['春','夏','秋','冬'];
const plans=[{name:'水泥地基',cost:{31:8}},{name:'合金承重框架',cost:{28:6}},{name:'墙体与楼板',cost:{31:12,38:20}},{name:'石膏墙板',cost:{36:8}},{name:'木屋顶',cost:{38:30,28:2,32:5,4:5}},{name:'玻璃窗与竣工',cost:{21:8}}];
function counts(a){return Array.from({length:S.IDs.COUNT},(_,i)=>Number.isSafeInteger(a?.[i])&&a[i]>=0?a[i]:0)}
function fresh(){return {version:2,vault:counts(),escrow:counts(),activeRun:false,descents:0,season:2,progress:0,station:{furnaceTier:1},onsen:false,onsenStage:0,interiorUnlocked:false,furniture:{ladder:false,cabinet:false},lastGather:-1}}
function settle(h){if(!h.activeRun)return false;h.escrow.forEach((n,i)=>h.vault[i]+=n);h.escrow=counts();h.activeRun=false;return true}
function save(h,storage){try{storage.setItem(KEY,JSON.stringify(h))}catch{}}
function load(storage){let h=fresh();try{let x=JSON.parse(storage.getItem(KEY));if([1,2].includes(x?.version)){h={...h,...x,vault:counts(x.vault),escrow:counts(x.escrow),station:{furnaceTier:x.station?.furnaceTier===2?2:1}};h.descents=Number.isSafeInteger(x.descents)&&x.descents>=0?x.descents:0;h.season=Number.isInteger(x.season)&&x.season>=0&&x.season<4?x.season:2;h.lastGather=Number.isSafeInteger(x.lastGather)?x.lastGather:-1;if(x.version===1&&h.progress>=4)h.progress++;h.version=2;h.loadout=Array.isArray(x.loadout)?x.loadout.filter(i=>[14,15,17,18,34].includes(i)).slice(0,2):[];h.progress=Math.max(0,Math.min(plans.length,Math.floor(Number(h.progress)||0)));h.onsen=x.onsen===true;h.onsenStage=h.onsen?4:Math.max(0,Math.min(3,Math.floor(Number(x.onsenStage)||0))); h.interiorUnlocked=x.interiorUnlocked===true&&h.progress===plans.length;h.furniture={ladder:x.furniture?.ladder===true,cabinet:x.furniture?.cabinet===true};h.activeRun=x.activeRun===true}}catch{}settle(h);save(h,storage);return h}
function begin(h){settle(h);h.descents++;h.season=(h.season+1)%4;h.activeRun=true;h.escrow=counts();let bag=counts();for(let i of (h.loadout||[]).slice(0,2)){if([14,15,17,18,34].includes(i)&&h.vault[i]>0&&(i!==14||bag[14]===0)){h.vault[i]--;bag[i]++}}h.loadout=[];h.escrow=counts(bag);return bag}
function sync(h,bag){if(h.activeRun)h.escrow=counts(bag)}
function build(h){let p=plans[h.progress];if(!p)return {ok:false,message:'小屋已经竣工'};if(Object.entries(p.cost).some(([i,n])=>h.vault[i]<n))return {ok:false,message:'材料不足，请继续收集和加工'};for(let [i,n]of Object.entries(p.cost))h.vault[i]-=n;h.progress++;return {ok:true,message:p.name+'完成'}}
function gather(h){if(h.lastGather===h.descents)return false;h.lastGather=h.descents;h.vault[16]+=4;return true}
const onsenCost={11:10,10:10,37:20,30:10};
const onsenStages=[{name:'整理泉边',cost:{30:10}},{name:'修建池边',cost:{37:12}},{name:'安装设施',cost:{37:8,10:10}},{name:'温泉启用',cost:{11:10}}];
function upgradeOnsen(h){let stage=h.onsen?4:h.onsenStage||0,p=onsenStages[stage];if(!p)return {ok:false,message:'温泉已建成'};if(Object.entries(p.cost).some(([i,n])=>(h.vault[i]||0)<n))return {ok:false,message:'温泉材料不足'};for(let [i,n]of Object.entries(p.cost))h.vault[i]-=n;h.onsenStage=stage+1;h.onsen=h.onsenStage===4;return {ok:true,message:p.name+'完成'}}
const furniturePlans={ladder:{name:'室内梯子',cost:{37:4}},cabinet:{name:'玻璃橱',cost:{21:4,37:8}}};
function furnish(h,id){let p=furniturePlans[id];if(!p||!h.interiorUnlocked||h.progress<plans.length)return {ok:false,message:'进入完工房屋后解锁内饰'};if(h.furniture[id])return {ok:false,message:'已经建成'};if(Object.entries(p.cost).some(([i,n])=>(h.vault[i]||0)<n))return {ok:false,message:'材料不足'};for(let[i,n]of Object.entries(p.cost))h.vault[i]-=n;h.furniture[id]=true;return {ok:true,message:p.name+'完成'}}
const constructionProjects=[{id:'house',name:'山居小屋',stages:plans,progress:h=>h.progress,build},{id:'onsen',name:'山泉温泉',stages:onsenStages,progress:h=>h.onsen?onsenStages.length:h.onsenStage||0,build:upgradeOnsen}];
for(let [id,p]of Object.entries(furniturePlans))constructionProjects.push({id,name:p.name,stages:[p],available:h=>h.interiorUnlocked,progress:h=>h.furniture[id]?1:0,build:h=>furnish(h,id)});
// Register future surface structures here: the review route always completes this same registry.
const structures={house:h=>h.progress=plans.length,furnace:h=>h.station.furnaceTier=2,onsen:h=>{h.onsen=true;h.onsenStage=onsenStages.length},interior:h=>{h.interiorUnlocked=true;h.furniture={ladder:true,cabinet:true}} };
function completeAll(h=fresh()){Object.values(structures).forEach(complete=>complete(h));return h}
const api={furniturePlans,furnish,constructionProjects,structures,completeAll,onsenStages,onsenCost,upgradeOnsen,KEY,seasons,plans,fresh,load,save,settle,begin,sync,build,gather};if(typeof module!=='undefined')module.exports=api;root.CaveHomestead=api;
})(globalThis);
