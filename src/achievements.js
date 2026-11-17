/* Persistent event-driven achievements. No unlock depends on display text or frame rate. */
(function(root){'use strict';
const KEY='bathophobia-achievements-v1',rare=[40,41,50,51];
const definitions=[
['mineral-nerd','地质发烧友','Mineral nerd','收集摩根石、翠榴石、钼铅矿和铜水砷锌矿。','Collect morganite, demantoid, wulfenite and cuprian adamite.'],
['zen','禅','Zen','茶屋与茶田竣工后，第一次坐下品茶。','Sit for tea after completing the tea house and tea field.'],
['home','温馨的家','Home sweet home','完成基地的全部建设阶段。','Complete your homestead.'],
['onsen','火山风味','Volcanic Retreat','完成温泉的全部建设阶段。','Complete the hot spring.'],
['escape','惊险逃生','Narrow escape','在仅剩一颗心时甩掉追逐的影怪。','Lose a pursuing shadow off-screen while on one heart.'],
['panic','慌不择路','Panic attack','被影怪追逐时因摔落而死亡。','Die from a fall while being chased by a shadow.'],
['night-owl','夜猫子','Not tired yet','尝试在夜晚入睡。','Try to sleep at night.'],
['head','高空抛物','Mind your head','第一次被掉落的钟乳石砸中。','Get hit by a falling stalactite.'],
['slip','小心地滑','Oopsie!','在春季或夏季的地面滑倒。','Slip on the surface in spring or summer.'],
['water','落地水','Water MLG','下落超过八格，落入水池且未受伤。','Fall more than eight tiles into a pool without damage.'],
['thirsty','好渴！','Quite thirsty!','第一次进入铁帽型铅锌氧化带。','Enter the gossan oxidation zone.'],
['fools-gold','愚人金',"These ain't gold",'累计采集黄铁矿和黄铜矿各十块。','Collect ten pyrite and ten chalcopyrite.'],
['trial-fire','炉火纯青','Trial by Fire','升级高温炉，并完成一次高温炉专属加工。','Upgrade a high-temperature furnace and complete a high-temperature-only recipe.'],
['science','万物皆有理','It’s All Science','发现全部材料，并解锁全部现有合成配方。','Discover every material and unlock every current crafting recipe.'],
['nine-lives','猫有九条命','Cats have nine lives','在矿洞探险中累计死亡九次。','Die during nine cave expeditions.'],
['physics-chemistry','物法双修','Physics vs. Chemistry','用镐子与氢氟酸各破坏至少一块岩石。','Break at least one rock with a pickaxe and one with hydrofluoric acid.']
].map(([id,zh,en,descriptionZh,descriptionEn],icon)=>({id,zh,en,descriptionZh,descriptionEn,icon}));
function create(storage,notify=()=>{}){let unlocked={},oneHeartChasers=new Set(),dirty=false;const progress={collected:{2:0,44:0},materials:[],recipes:[],deaths:0,lastDeath:null,furnace:false,highCraft:false,pickaxe:false,acid:false};
try{let saved=JSON.parse(storage.getItem(KEY)||'null');if([1,2].includes(saved?.version)){for(let d of definitions)if(Number.isFinite(saved.unlocked?.[d.id])&&saved.unlocked[d.id]>0)unlocked[d.id]=saved.unlocked[d.id];let q=saved.progress||{};for(let id of [2,44])progress.collected[id]=Number.isSafeInteger(q.collected?.[id])&&q.collected[id]>=0?q.collected[id]:0;progress.materials=[...new Set((Array.isArray(q.materials)?q.materials:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<56&&i!==47))];progress.recipes=[...new Set((Array.isArray(q.recipes)?q.recipes:[]).filter(i=>typeof i==='string').slice(0,200))];progress.deaths=Number.isSafeInteger(q.deaths)&&q.deaths>=0?q.deaths:0;progress.lastDeath=typeof q.lastDeath==='string'?q.lastDeath:null;for(let k of ['furnace','highCraft','pickaxe','acid'])progress[k]=q[k]===true}}catch{}
function save(){try{storage.setItem(KEY,JSON.stringify({version:2,unlocked,progress}))}catch{}dirty=false}
function remember(list,id){if(!list.includes(id)){list.push(id);dirty=true}}
function flag(key){if(!progress[key]){progress[key]=true;dirty=true}}
function unlock(id){if(unlocked[id]||!definitions.some(d=>d.id===id))return false;unlocked[id]=Date.now();save();notify(definitions.find(d=>d.id===id));return true}
function milestones(){if(progress.collected[2]>=10&&progress.collected[44]>=10)unlock('fools-gold');if(progress.furnace&&progress.highCraft)unlock('trial-fire');if(progress.deaths>=9)unlock('nine-lives');if(progress.pickaxe&&progress.acid)unlock('physics-chemistry')}
function event(kind,x={}){if(kind==='sync'){if(rare.every(id=>x.found?.has(id)))unlock('mineral-nerd');if(x.home?.progress>=6)unlock('home');if(x.home?.onsen)unlock('onsen');let known=new Set([...(x.found||[])]);for(let bag of [x.home?.vault,x.bag])for(let [i,n]of (bag||[]).entries())if(n>0)known.add(i);if(x.home?.station?.furnaceTier===2)known.add(20);for(let id of known)if(Number.isInteger(id)&&id>=0&&id<56&&id!==47)remember(progress.materials,id);if(progress.materials.includes(20))flag('furnace');for(let id of [2,44]){let held=(x.home?.vault?.[id]||0)+(x.bag?.[id]||0);if(held>progress.collected[id]){progress.collected[id]=held;dirty=true}}let has=id=>progress.materials.includes(Number(id));for(let r of x.recipes||[]){let thermal=r.station!=='high'||progress.furnace,interior=!r.decoration||x.home?.interiorUnlocked;if(thermal&&interior&&Object.keys(r.input||{}).every(has)&&Object.keys(r.catalyst||{}).every(has)&&(r.alternatives||[]).every(group=>group.some(has)))remember(progress.recipes,r.id)}if(x.requiredMaterials?.length&&x.recipes?.length&&x.requiredMaterials.every(has)&&x.recipes.every(r=>progress.recipes.includes(r.id)))unlock('science')}
if(kind==='tea'&&x.home?.teaField&&x.home?.teaProgress>=8)unlock('zen');
if(kind==='sleep'&&x.denied)unlock('night-owl');if(kind==='trip'&&x.season<2)unlock('slip');if(kind==='hit'&&x.kind==='石钟乳')unlock('head');if(kind==='biome'&&x.gossan)unlock('thirsty');
if(kind==='water'&&x.fall>160&&x.descending&&!x.lava&&!x.damage&&x.hp>0)unlock('water');
if(kind==='chase'){if(x.hp===1&&!x.dead)for(let id of x.chasing||[])oneHeartChasers.add(id);for(let id of x.escaped||[]){if(oneHeartChasers.has(id)&&x.hp===1&&!x.dead)unlock('escape');oneHeartChasers.delete(id)}for(let id of [...oneHeartChasers])if(!(x.chasing||[]).includes(id))oneHeartChasers.delete(id)}
if(kind==='death'){if(x.fall&&x.chased)unlock('panic');if(x.expedition&&typeof x.runId==='string'&&x.runId&&x.runId!==progress.lastDeath){progress.deaths++;progress.lastDeath=x.runId;dirty=true}}
if(kind==='collect'&&[2,44].includes(x.type)&&Number.isSafeInteger(x.count)&&x.count>0){progress.collected[x.type]+=x.count;dirty=true}
if(kind==='craft'&&x.recipe){remember(progress.recipes,x.recipe.id);if(x.recipe.id==='high-furnace')flag('furnace');if(x.recipe.station==='high')flag('highCraft')}
if(kind==='break'){if(x.method==='pickaxe')flag('pickaxe');if(x.method==='acid')flag('acid')}
if(kind==='reset')oneHeartChasers.clear();milestones();if(dirty)save()}
return{unlocked,progress,unlock,event,count:()=>Object.keys(unlocked).length}}
const api={KEY,rare,definitions,create};if(typeof module!=='undefined')module.exports=api;root.CaveAchievements=api;
})(globalThis);
