/* Persistent event-driven achievements. No unlock depends on display text or frame rate. */
(function(root){'use strict';
const KEY='bathophobia-achievements-v1',rare=[40,41,50,51];
const definitions=[
['mineral-nerd','地质发烧友','Mineral nerd','收集摩根石、翠榴石、钼铅矿和铜水砷锌矿。','Collect morganite, demantoid, wulfenite and cuprian adamite.'],
['zen','禅','Zen','茶屋与茶田竣工后，第一次坐下品茶。','Sit for tea after completing the tea house and tea field.'],
['home','温馨的家','Home sweet home','完成基地的全部建设阶段。','Complete your homestead.'],
['onsen','火山风味','Vulcanic retreat','完成温泉的全部建设阶段。','Complete the hot spring.'],
['escape','惊险逃生','Narrow escape','在仅剩一颗心时甩掉追逐的影怪。','Lose a pursuing shadow off-screen while on one heart.'],
['panic','慌不择路','Panic attack','被影怪追逐时因摔落而死亡。','Die from a fall while being chased by a shadow.'],
['night-owl','夜猫子','Not tired yet','尝试在夜晚入睡。','Try to sleep at night.'],
['head','高空抛物','Mind your head','第一次被掉落的钟乳石砸中。','Get hit by a falling stalactite.'],
['slip','小心地滑','Oopsey','在春季或夏季的地面滑倒。','Slip on the surface in spring or summer.'],
['water','落地水','Water MLG','下落超过八格，落入水池且未受伤。','Fall more than eight tiles into a pool without damage.'],
['thirsty','好渴！','Quite thirsty!','第一次进入铁帽型铅锌氧化带。','Enter the gossan oxidation zone.']
].map(([id,zh,en,descriptionZh,descriptionEn],icon)=>({id,zh,en,descriptionZh,descriptionEn,icon}));
function create(storage,notify=()=>{}){let unlocked={},oneHeartChasers=new Set();try{let saved=JSON.parse(storage.getItem(KEY)||'null');if(saved?.version===1)for(let d of definitions)if(Number.isFinite(saved.unlocked?.[d.id])&&saved.unlocked[d.id]>0)unlocked[d.id]=saved.unlocked[d.id]}catch{}
function unlock(id){if(unlocked[id]||!definitions.some(d=>d.id===id))return false;unlocked[id]=Date.now();try{storage.setItem(KEY,JSON.stringify({version:1,unlocked}))}catch{}notify(definitions.find(d=>d.id===id));return true}
function event(kind,x={}){if(kind==='sync'){if(rare.every(id=>x.found?.has(id)))unlock('mineral-nerd');if(x.home?.progress>=6)unlock('home');if(x.home?.onsen)unlock('onsen')}
if(kind==='tea'&&x.home?.teaField&&x.home?.teaProgress>=8)unlock('zen');
if(kind==='sleep'&&x.denied)unlock('night-owl');if(kind==='trip'&&x.season<2)unlock('slip');if(kind==='hit'&&x.kind==='石钟乳')unlock('head');if(kind==='biome'&&x.gossan)unlock('thirsty');
if(kind==='water'&&x.fall>160&&x.descending&&!x.lava&&!x.damage&&x.hp>0)unlock('water');
if(kind==='chase'){if(x.hp===1&&!x.dead)for(let id of x.chasing||[])oneHeartChasers.add(id);for(let id of x.escaped||[]){if(oneHeartChasers.has(id)&&x.hp===1&&!x.dead)unlock('escape');oneHeartChasers.delete(id)}for(let id of [...oneHeartChasers])if(!(x.chasing||[]).includes(id))oneHeartChasers.delete(id)}
if(kind==='death'&&x.fall&&x.chased)unlock('panic');if(kind==='reset')oneHeartChasers.clear()}
return{unlocked,unlock,event,count:()=>Object.keys(unlocked).length}}
const api={KEY,rare,definitions,create};if(typeof module!=='undefined')module.exports=api;root.CaveAchievements=api;
})(globalThis);
