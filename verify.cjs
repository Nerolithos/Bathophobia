'use strict';
const assert=require('node:assert/strict');
const E=require('./dist/engine.js'),{T,W,H,DT}=E;
function empty(id=0){return {id,tiles:Array.from({length:H},()=>new Uint8Array(W)),water:Array.from({length:H},()=>Array(W).fill(null))}}
function rock(seg,x,y){seg.tiles[y][x]=1}
// Closed natural depression: no terrain edits, pool contained within the walls.
let basin=empty();for(let x=8;x<=16;x++)rock(basin,x,12);for(let y=8;y<=12;y++){rock(basin,8,y);rock(basin,16,y)}let before=JSON.stringify(basin.tiles);E.waterField(basin,null,10,[{x:12,y:9,head:9}]);assert.equal(JSON.stringify(basin.tiles),before);assert(basin.water[11][12].pool);assert.equal(basin.water[11][7],null);
// A missing lip creates a real spill. The first eight falling cells have full
// force; cells 9–11 fade and cell 12 has no physical force.
let spill=empty();for(let x=8;x<=14;x++)rock(spill,x,8);rock(spill,8,7);E.waterField(spill,null,1,[{x:11,y:6,head:6}]);assert(spill.water[8][15]);assert.equal(spill.water[15][15].strength,1);assert(spill.water[16][15].strength<1);assert.equal(spill.water[19][15].strength,0);assert(!spill.water[20][15]);
// Pools and streams use the same physical integrator as play and graph search.
let dry=empty(),world=E.worldFor(dry,null),s=E.spawn(10*T+3,4*T);s.ground=false;for(let i=0;i<24;i++)E.step(s,0,false,world);let dryVelocity=s.vy;
let wet=empty();for(let y=0;y<H;y++)wet.water[y][10]={pool:false,strength:1,run:0};let flowing=E.spawn(10*T+3,4*T);flowing.ground=false;for(let i=0;i<24;i++)E.step(flowing,0,false,E.worldFor(wet,null));assert(flowing.vy<=170);assert(flowing.vy<dryVelocity);
function fall(pool){let a=empty();for(let x=2;x<W-2;x++)rock(a,x,22);if(pool)for(let y=20;y<22;y++)a.water[y][10]={pool:true,strength:1,run:0};let v=E.spawn(10*T+3,2*T);v.ground=false;v.hp=3;for(let i=0;i<180&&!v.ground&&!v.dead;i++)E.step(v,0,false,E.worldFor(a,null));return v}
assert(fall(false).hp<3);assert.equal(fall(true).hp,4);
let j=E.spawn(200,100);j.ground=false;E.step(j,0,true,world);E.step(j,0,true,world);E.step(j,0,true,world);assert.equal(j.jumps,2);
// Replays certify actual coordinates and inputs; no teleporting, no replacement
// platforms, and no dry-only approximation. Every accepted tile equals raw CA.
let total=0,frames=0,maxAttempt=0,pools=0,streams=0;
for(let seed of [1,127301,999999]){let previous=null,entry=null,lastExit=null;for(let id=0;id<36;id++){let seg=E.makeSegment(seed,id,previous,entry,0,600);assert(seg,`no certified continuation at seed ${seed}, segment ${id}`);assert.deepEqual(seg.tiles,E.terrain(seed,id,seg.attempt),'terrain must be unmodified cellular automata');maxAttempt=Math.max(maxAttempt,seg.attempt);let replay={...seg.entry};if(lastExit)assert.deepEqual(replay,lastExit);let w=E.worldFor(seg,previous);for(let [dir,jump]of seg.proof.commands){E.step(replay,dir,!!jump,w);assert(!replay.dead,`death at ${seed}/${id}`);assert.equal(replay.damage,0,'certificate must be zero damage');frames++}for(let field of ['x','y','vy','apex','time','ceiling','hp','jumps'])assert.equal(replay[field],seg.proof.exit[field],`replay mismatch ${field}`);assert(replay.y+E.PH>=(id+1)*H*T);assert.equal(replay.hp,5);pools+=seg.water.flat().filter(v=>v?.pool).length;streams+=seg.water.flat().filter(v=>v&&!v.pool).length;previous=seg;entry=seg.proof.exit;lastExit={...entry};total++}}
assert(pools>0&&streams>0);console.log(`PASS: closed pool, open-lip waterfall, fade after 8 tiles, water drag, fall damage, water immunity, double jump. ${total} untouched CA segments over 3 seeds; ${frames} real physics frames; ${36*H}m descent per seed; max resample ${maxAttempt}; ${pools} pool cells / ${streams} stream cells.`);

// Also replay with both neighboring segments present, as in the real game.
for(let seed of [1,127301,3469400539]){let segments=[],prev=null,entry=null;for(let id=0;id<36;id++){let s=E.makeSegment(seed,id,prev,entry,0,600);assert(s);segments.push(s);prev=s;entry=s.proof.exit}let world={solid(x,y){if(x<2||x>=E.W-2||y<0)return true;let seg=segments[Math.floor(y/E.H)];return seg?!!seg.tiles[y%E.H][x]:false},water(x,y){return segments[Math.floor(y/E.H)]?.water[y%E.H]?.[x]||null}};let p={...segments[0].entry};for(let seg of segments){for(let [d,j]of seg.proof.commands){E.step(p,d,!!j,world);assert(!p.dead);assert.equal(p.damage,0)}assert.equal(p.x,seg.proof.exit.x,`x diverged ${seed}/${seg.id}`);assert.equal(p.y,seg.proof.exit.y,`y diverged ${seed}/${seg.id}`)}console.log('Combined world replay passed:',seed,'depth',Math.floor(p.y/E.T),'hp',p.hp)}
