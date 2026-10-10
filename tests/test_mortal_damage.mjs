import assert from 'node:assert/strict';
import {Engine,REALMS} from '../src/cultivation.js';
import {CharactersSystem} from '../src/systems/characters.js';
import {PersistenceSystem} from '../src/systems/persistence.js';
import {NpcAiSystem} from '../src/systems/npc-ai.js';
import {SAVE_KEY} from '../src/core/runtime.js';
assert.equal(REALMS[0].dmg,5);
const p=CharactersSystem.makePlayer();assert.equal(p.maxHp,100);assert.equal(Engine.calcSkillDamage(p,'basic_attack').damage,5);
const g={mapId:'map2',state:{},makePlayer:CharactersSystem.makePlayer};NpcAiSystem.ensureNPCs.call(g);
for(const npc of g.state.npcs){assert.equal(npc.realmIdx,0);assert.equal(Engine.calcSkillDamage(npc,'basic_attack').damage,5)}
assert.equal(Engine.calcSkillDamage(Engine.createCharacter('Phàm Nhân'),'basic_attack').damage,5);
p.equippedGear.dmg=3;assert.equal(Engine.calcSkillDamage(p,'basic_attack').damage,8,'earned equipment damage remains additive');
p.realmIdx=1;assert.ok(Engine.calcSkillDamage(p,'basic_attack').damage>5,'higher realms retain cultivation amplification');
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
store.set(SAVE_KEY,JSON.stringify({version:5,mapId:'map',realmIdx:0,baseEquippedGear:{dmg:12,def:2},equippedGear:{dmg:12,def:2}}));
const restored={player:CharactersSystem.makePlayer()};PersistenceSystem.restore.call(restored);
assert.equal(restored.player.baseEquippedGear.dmg??0,0);assert.equal(Engine.calcSkillDamage(restored.player,'basic_attack').damage,5,'legacy starter damage migrated');
console.log('PASS mortal baseline: player/NPC 5 basic damage, 100 base HP, earned gear scaling, higher realms and old save migration');

assert.equal(p.maxMp,100);
const fresh=CharactersSystem.makePlayer();
assert.equal(fresh.activeCongPhapId,null);assert.deepEqual(fresh.ownedManuals,[]);assert.deepEqual(fresh.equippedGear,{});
assert.equal(Engine.calcElementalDefense(fresh),0);assert.equal(Engine.calcMeditationRate(fresh),0);
fresh.isMeditating=true;Engine.meditateTick(fresh,10);assert.equal(fresh.exp,0);assert.equal(fresh.congPhapMastery,0);
for(const realm of REALMS){fresh.realmIdx=realm.id;assert.equal(Engine.calcMaxHp(fresh),realm.hp);assert.equal(Engine.calcMaxMp(fresh),realm.manaMax);assert.equal(Engine.calcElementalDamage(fresh),realm.dmg);assert.equal(Engine.calcElementalDefense(fresh),realm.def)}
fresh.activeCongPhapId='cp_dan_khi';fresh.realmIdx=0;assert.equal(Engine.calcMaxHp(fresh),105);assert.ok(Engine.calcMeditationRate(fresh)>0);
assert.equal(restored.player.activeCongPhapId,null);assert.equal(restored.player.maxHp,100);assert.equal(Engine.calcElementalDefense(restored.player),0);
console.log('PASS: no automatic manual or equipment; exact realm baseline, explicit manuals still work');
