(()=>{'use strict';
const d=window.GameServices?.enemyDomain,e=window.GameServices?.encounters,events=window.GameServices?.events,entities=window.GameServices?.enemyEntities,catalog=window.GameCore?.phase13Catalog,loader=window.EnemyLoader,scene=window.GameRuntime?.scene;if(!d)throw new Error('EnemyDomain missing');

const villageDefs=[
 {id:'village_cat',enemyId:'blob_cat',role:'mob',grade:'NHAT',minor:'SO',archetype:'SKIRMISHER',respawnSeconds:9},
 {id:'village_dog',enemyId:'blob_dog',role:'mob',grade:'NHAT',minor:'SO',archetype:'SKIRMISHER',respawnSeconds:10},
 {id:'village_chicken',enemyId:'blob_chicken',role:'mob',grade:'NHAT',minor:'SO',archetype:'SKIRMISHER',respawnSeconds:8},
 {id:'village_bunny',enemyId:'big_bunny',role:'elite',grade:'NHAT',minor:'TRUNG',archetype:'ELITE',respawnSeconds:18},
 {id:'village_pigeon',enemyId:'flying_pigeon',role:'mob',grade:'NHAT',minor:'TRUNG',archetype:'FLYER',respawnSeconds:14,tags:['CASTER']}
];
const defs=[...villageDefs,{id:'bamboo_cactoro',enemyId:'blob_cactoro',role:'mob',grade:'NHAT',minor:'SO',archetype:'SKIRMISHER',respawnSeconds:10},{id:'bamboo_dragon',enemyId:'flying_dragon',role:'elite',grade:'NHAT',minor:'HAU',archetype:'ELITE',respawnSeconds:18,tags:['CASTER']},{id:'creek_cactoro',enemyId:'blob_greenblob',role:'mob',grade:'NHAT',minor:'TRUNG',archetype:'SKIRMISHER',respawnSeconds:12},{id:'creek_dragon',enemyId:'flying_dragon',role:'elite',grade:'NHI',minor:'SO',archetype:'ELITE',respawnSeconds:22,tags:['CASTER']},{id:'road_mushnub',enemyId:'blob_mushnub_evolved',role:'mob',grade:'NHAT',minor:'HAU',archetype:'BRUTE',respawnSeconds:14},{id:'road_armabee',enemyId:'flying_armabee',role:'mob',grade:'NHI',minor:'SO',archetype:'FLYER',respawnSeconds:17,tags:['CASTER']},{id:'road_brute',enemyId:'big_cactoro',role:'elite',grade:'NHI',minor:'TRUNG',archetype:'ELITE',respawnSeconds:24},{id:'peak_dragon',enemyId:'flying_dragon_evolved',role:'elite',grade:'NHI',minor:'TRUNG',archetype:'ELITE',respawnSeconds:24,tags:['CASTER']},{id:'peak_ghost',enemyId:'flying_ghost',role:'mob',grade:'NHI',minor:'SO',archetype:'FLYER',respawnSeconds:18},{id:'cave_ghost',enemyId:'flying_ghost_skull',role:'mob',grade:'NHI',minor:'TRUNG',archetype:'FLYER',respawnSeconds:18},{id:'cave_demon',enemyId:'flying_demon',role:'elite',grade:'NHI',minor:'HAU',archetype:'ELITE',respawnSeconds:24,tags:['CASTER']},{id:'thanh_van_demon_boss',enemyId:'big_demon',role:'boss',grade:'NHI',minor:'HAU',archetype:'BOSS',respawnSeconds:999,zoneModifiers:{hp:1.35,attack:1.12},tags:['BOSS','ENCOUNTER']}];
for(const x of defs)if(!d.getTemplate(x.id))d.defineTemplate(x);

// Thanh Vân Thôn keeps its central 56m safe hub. Four hunting pockets are added
// to the same map far enough away that random spawn radii cannot overlap the hub.
const village=catalog?.ZONES?.thanh_van_region;
if(village?.subZones){
 Object.assign(village.subZones,{
  village_north_wilds:Object.freeze({id:'village_north_wilds',name:'Bắc Ngoại Thanh Vân',center:{x:0,z:104},radius:30,populationBudget:4,groups:[{templateId:'village_dog',weight:4},{templateId:'village_chicken',weight:3},{templateId:'village_bunny',weight:1}],spiritDensity:1.12}),
  village_south_wilds:Object.freeze({id:'village_south_wilds',name:'Nam Ngoại Thanh Vân',center:{x:0,z:-108},radius:30,populationBudget:4,groups:[{templateId:'village_cat',weight:4},{templateId:'village_chicken',weight:3},{templateId:'village_dog',weight:2}],spiritDensity:1.10}),
  village_east_wilds:Object.freeze({id:'village_east_wilds',name:'Đông Ngoại Thanh Vân',center:{x:106,z:0},radius:30,populationBudget:4,groups:[{templateId:'village_cat',weight:4},{templateId:'village_pigeon',weight:2},{templateId:'village_bunny',weight:1}],spiritDensity:1.14}),
  village_west_wilds:Object.freeze({id:'village_west_wilds',name:'Tây Ngoại Thanh Vân',center:{x:-106,z:0},radius:30,populationBudget:4,groups:[{templateId:'village_dog',weight:3},{templateId:'village_pigeon',weight:2},{templateId:'village_bunny',weight:1}],spiritDensity:1.14})
 });
}

// Warm only the village models so enemies appear quickly without preloading the whole bestiary.
const villageEnemyIds=villageDefs.map(x=>x.enemyId);
loader?.preload?.(villageEnemyIds,scene)?.catch?.(err=>console.warn('[EnemyBootstrap] village preload',err));

// Presentation layer: show the real hit reaction clip when a living enemy takes damage.
events?.on?.('damage:resolved',payload=>{
 const ent=entities?.get?.(payload?.targetEntityId);
 if(!ent?.alive||!ent.renderer||!(Number(payload?.finalDamage)>0))return;
 if(ent.state==='ATTACK'||ent.state==='CAST'||ent.state==='DEAD')return;
 const ctrl=ent.renderer.animCtrl;
 if(!ctrl?.resolveAnimName?.('hit'))return;
 ent.renderer.play('hit',false,1.05,()=>{if(ent.alive&&ent.state!=='CHASE'&&ent.state!=='RETURN')ent.renderer?.play?.('idle',true,1)});
},{owner:'EnemyVillagePresentation'});

e?.define?.({id:'thanh_van_demon',name:'Hắc Dạ Ma Tôn',bossTemplateId:'thanh_van_demon_boss',zoneId:'co_dong_thanh_van_zone',subZoneId:'ancient_cave',position:{x:0,y:0,z:42},resetPolicy:'ON_PLAYER_DEATH',repeatable:false,lootOnce:true});
events?.emit?.('enemy:pipelineReady',{templates:defs.map(x=>x.id),villageTemplates:villageDefs.map(x=>x.id),villageSubZones:Object.keys(village?.subZones||{}).filter(k=>k.startsWith('village_')),encounters:e?[...e.defs.keys()]:[]});
})();