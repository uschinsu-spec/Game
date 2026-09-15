(()=>{'use strict';
const d=window.GameServices?.enemyDomain,e=window.GameServices?.encounters,events=window.GameServices?.events;if(!d)throw new Error('EnemyDomain missing');
const defs=[
{id:'bamboo_cactoro',enemyId:'blob_cactoro',role:'mob',grade:'NHAT',minor:'SO',archetype:'SKIRMISHER',respawnSeconds:10,zoneModifiers:{hp:1,attack:1}},
{id:'bamboo_dragon',enemyId:'flying_dragon',role:'elite',grade:'NHAT',minor:'HAU',archetype:'ELITE',respawnSeconds:18,zoneModifiers:{hp:1.05},tags:['CASTER']},
{id:'creek_cactoro',enemyId:'blob_cactoro',role:'mob',grade:'NHAT',minor:'TRUNG',archetype:'SKIRMISHER',respawnSeconds:12,zoneModifiers:{hp:1.08,attack:1.05}},
{id:'creek_dragon',enemyId:'flying_dragon',role:'elite',grade:'NHI',minor:'SO',archetype:'ELITE',respawnSeconds:22,zoneModifiers:{hp:1.12,attack:1.08},tags:['CASTER']},
{id:'thanh_van_demon_boss',enemyId:'big_demon',role:'boss',grade:'NHI',minor:'HAU',archetype:'BOSS',respawnSeconds:999,zoneModifiers:{hp:1.35,attack:1.12},tags:['BOSS','ENCOUNTER']}
];for(const x of defs)if(!d.getTemplate(x.id))d.defineTemplate(x);
e?.define?.({id:'thanh_van_demon',name:'Hắc Dạ Ma Tôn',bossTemplateId:'thanh_van_demon_boss',zoneId:'thanh_van_region',subZoneId:'thanh_van_dinh',position:{x:0,y:0,z:78},resetPolicy:'ON_PLAYER_DEATH',repeatable:false,lootOnce:true});
events?.emit?.('enemy:pipelineReady',{templates:defs.map(x=>x.id),encounters:e?[...e.defs.keys()]:[]});
})();