'use strict';
const assert=require('node:assert/strict'),E=require('./src/engine');
const floor=500,cap=floor-12,world={solid(x,y){return y>=25},water(){return null},bouncers(){return [{x:210,y:floor}]}},start=cap-E.PH-320;
let p=E.spawn(203,start);p.ground=false;let bounced=false,min=Infinity,launch;
for(let i=0;i<160;i++){E.step(p,0,false,world);if(p.didBounce&&!bounced){bounced=true;launch=p.y;assert.equal(p.hp,5);assert.equal(p.damage,0)}else if(bounced){min=Math.min(min,p.y);if(p.vy>=0)break}}
assert(bounced);assert(Math.abs(launch-min-160)<6,'rebound must reach half the fall height');
let miss=E.spawn(250,start);miss.ground=false;for(let i=0;i<120&&!miss.ground;i++)E.step(miss,0,false,world);assert(miss.hp<5,'missing cap must retain fall damage');
let up=E.spawn(203,cap-E.PH+5);up.ground=false;up.vy=-200;E.step(up,0,false,world);assert(!up.didBounce,'cap is one way');
for(let n of [1,2,3,4]){let w={water(x,y){return y>=4&&y<4+n?{pool:true,lava:false}:null}};assert.equal(E.poolDepth(w,8,4),n)}assert.equal(E.poolDepth({water(){return {pool:true,lava:true}}},8,4),0);
for(let edge of [250,350,500,600])assert(Math.abs(E.biomeHeat(edge-.001)-E.biomeHeat(edge+.001))<.001);assert.equal(E.biomeHeat(280),1);assert.equal(E.biomeHeat(400),0);
console.log('PASS: half-height bounce, landing-only immunity, one-way cap, deep ordinary water restriction and continuous biome blend.');
// Radiation proximity refreshes the timer; leaving or collecting starts the
// full ten-second tail. Exactly seven tiles is included; beyond it is safe.
const D=require('./src/threats'),ore={id:'radio',type:9,x:300,y:200,enabled:true},taken=new Set();
let actor=E.spawn(300-7-140,188-E.PH/2);D.updateDizziness(actor,[ore],taken);assert.equal(actor.dizzy,10);actor.x-=.01;D.updateDizziness(actor,[ore],taken);assert(actor.dizzy<10);for(let i=0;i<600;i++)D.updateDizziness(actor,[ore],taken);assert.equal(actor.dizzy,0);actor.x+=.01;D.updateDizziness(actor,[ore],taken);assert.equal(actor.dizzy,10);taken.add('radio');D.updateDizziness(actor,[ore],taken);assert(!actor.radiationNear);assert(actor.dizzy>9.9);
// Falling stones leave one supported aragonite collectible, even after contact.
let stone={id:'drop-test',x:207,y:20,length:26,phase:'falling',vy:0},drops=[],target=E.spawn(400,100),floorWorld={solid(x,y){return y>=10},water(){return null}};
for(let i=0;i<100;i++)drops.push(...D.update({stones:[stone],shadows:[]},target,floorWorld,0).filter(e=>e.drop).map(e=>e.drop));assert.equal(drops.length,1);assert.equal(drops[0].type,8);assert.equal(drops[0].y,200);assert(floorWorld.solid(Math.floor(drops[0].x/E.T),drops[0].y/E.T));
console.log('PASS: seven-tile radiation boundary, refresh and ten-second tail, collection clears source; one supported aragonite drop on stone impact.');
