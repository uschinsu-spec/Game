import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {VILLAGE_ELDER,MAP_SCALE,storyNPCsFor} from '../src/world.js';
import {UI} from '../src/ui.js';
assert.equal(VILLAGE_ELDER.x/MAP_SCALE,288);assert.equal(VILLAGE_ELDER.y/MAP_SCALE,144);
assert.equal(storyNPCsFor('map').length,1);assert.equal(storyNPCsFor('map2').length,0);
for(const zoom of [1,1.7]){
 let opened=0;
 const g=Object.assign(Object.create(Game.prototype),{mapId:'map',player:{dead:false},state:{enemies:[]},cam:{x:100,y:50},viewScale:zoom,canvas:{getBoundingClientRect:()=>({left:12,top:20})},stopMeditation(){},ui:{villageElder(){opened++}},target:{kind:'enemy'}});
 for(const y of [VILLAGE_ELDER.y-50,VILLAGE_ELDER.y-VILLAGE_ELDER.height-13])g.tap(12+(VILLAGE_ELDER.x-100)*zoom,20+(y-50)*zoom);
 assert.equal(opened,2);assert.equal(g.target,null);
 g.mapId='map2';g.tap(12+(VILLAGE_ELDER.x-100)*zoom,20+(VILLAGE_ELDER.y-100)*zoom);assert.equal(opened,2);
}
const element=()=>({classList:{remove(){}},hidden:false,children:[],textContent:'',replaceChildren(){this.children=[]},append(...children){this.children.push(...children)},addEventListener(){}});
const elements=new Map();globalThis.document={querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)},createElement:element};
const ui=Object.assign(Object.create(UI.prototype),{game:{input:{clear(){}},player:{}},overlay:element()});
for(let i=0;i<5;i++){ui.villageElder(i);assert.equal(ui.game.paused,true);assert.equal(ui.overlay.hidden,false);assert.equal(elements.get('#dialog-title').textContent,'Trưởng Thôn');assert.ok(elements.get('#dialog-details').textContent.length>50);assert.equal(elements.get('#cultivation-controls').children.length,6)}
ui.close();assert.equal(ui.game.paused,false);assert.equal(ui.overlay.hidden,true);
console.log('PASS: elder position, map isolation, scaled body/name clicks and all tutorial dialogue topics');
