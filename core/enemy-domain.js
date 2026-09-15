(()=>{'use strict';
const GRADE_MAJOR=Object.freeze({NHAT:0,NHI:1,TAM:2,TU:3,NGU:4});
const GRADE_LABEL=Object.freeze({NHAT:'Nhất',NHI:'Nhị',TAM:'Tam',TU:'Tứ',NGU:'Ngũ'});
const MINOR_INDEX=Object.freeze({SO:0,TRUNG:1,HAU:2,DINH:3});
const MINOR_LABEL=Object.freeze({SO:'Sơ',TRUNG:'Trung',HAU:'Hậu',DINH:'Đỉnh'});
const ARCHETYPE_DEFAULTS=Object.freeze({
 SKIRMISHER:{hp:90,attack:8,defense:4,speed:3.0,aggroRange:11,leashRange:22},
 BRUTE:{hp:140,attack:11,defense:8,speed:2.2,aggroRange:10,leashRange:20},
 FLYER:{hp:105,attack:10,defense:5,speed:2.8,aggroRange:13,leashRange:24},
 ELITE:{hp:240,attack:17,defense:12,speed:2.5,aggroRange:14,leashRange:28},
 BOSS:{hp:900,attack:26,defense:20,speed:2.1,aggroRange:18,leashRange:36}
});
function normalizeGrade(v='NHAT'){const k=String(v||'NHAT').toUpperCase();return Object.prototype.hasOwnProperty.call(GRADE_MAJOR,k)?k:'NHAT'}
function normalizeMinor(v='SO'){const k=String(v||'SO').toUpperCase();return Object.prototype.hasOwnProperty.call(MINOR_INDEX,k)?k:'SO'}
function categoryArchetype(asset,role='mob'){if(role==='boss')return'BOSS';if(role==='elite')return'ELITE';if(asset?.cat==='flying')return'FLYER';if(asset?.cat==='big')return'BRUTE';return'SKIRMISHER'}
function statScale(grade,minor){const g=GRADE_MAJOR[normalizeGrade(grade)],m=MINOR_INDEX[normalizeMinor(minor)];return{hp:1+g*.9+m*.18,attack:1+g*.72+m*.14,defense:1+g*.8+m*.16,speed:1+Math.min(.18,g*.025+m*.012)}}
class EnemyDomain{
 constructor({registry=window.EnemyRegistry}={}){this.registry=registry;this.templates=new Map()}
 assetDefinition(enemyId){const a=this.registry?.get?.(enemyId);if(!a)return null;return Object.freeze({id:a.id,name:a.name,codeName:a.codeName,category:a.cat,icon:a.icon,modelPath:a.modelPath,anims:[...(a.anims||[])],groundOffset:Number(a.groundOffset)||0,height:Number(a.height)||1,radius:Number(a.radius)||.35,colliderHeight:Number(a.colliderHeight)||.8,colliderRadius:Number(a.colliderRadius)||.32,attackRange:Number(a.attackRange)||2,attackWindup:Number(a.attackWindup)||.1,hitTime:Number(a.hitTime)||.4,recoveryTime:Number(a.recoveryTime)||.7,footstepTimes:[...(a.footstepTimes||[])]})}
 defineTemplate(def={}){const asset=this.assetDefinition(def.enemyId);if(!asset)throw new Error(`Unknown enemy asset ${def.enemyId}`);const grade=normalizeGrade(def.grade),minor=normalizeMinor(def.minor),role=def.role||'mob',archetype=def.archetype||categoryArchetype(asset,role),base=ARCHETYPE_DEFAULTS[archetype]||ARCHETYPE_DEFAULTS.SKIRMISHER,scale=statScale(grade,minor),zone=def.zoneModifiers||{};const t=Object.freeze({id:def.id||`${def.enemyId}_${grade}_${minor}_${role}`,enemyId:def.enemyId,role,archetype,grade,gradeLabel:GRADE_LABEL[grade],majorRealmIndex:GRADE_MAJOR[grade],minor,minorLabel:MINOR_LABEL[minor],minorRealmIndex:MINOR_INDEX[minor],asset,stats:Object.freeze({maxHP:Math.max(1,Math.round((def.baseHP||base.hp)*scale.hp*(zone.hp||1))),attack:Math.max(1,(def.attack||base.attack)*scale.attack*(zone.attack||1)),defense:Math.max(0,(def.defense||base.defense)*scale.defense*(zone.defense||1)),moveSpeed:Math.max(.2,(def.moveSpeed||base.speed)*scale.speed*(zone.speed||1)),aggroRange:Math.max(2,Number(def.aggroRange||base.aggroRange)),leashRange:Math.max(4,Number(def.leashRange||base.leashRange))}),respawnSeconds:Math.max(1,Number(def.respawnSeconds)||12),lootTableId:def.lootTableId||null,tags:Object.freeze([...(def.tags||[])])});this.templates.set(t.id,t);return t}
 getTemplate(id){return this.templates.get(String(id))||null}
 realmLabel(t){return `${t.gradeLabel} Giai · ${t.minorLabel}`}
}
window.GameCore=window.GameCore||{};window.GameCore.EnemyDomain=EnemyDomain;window.GameCore.enemyDomain=window.GameCore.enemyDomain||new EnemyDomain();window.GameServices=Object.assign(window.GameServices||{},{enemyDomain:window.GameCore.enemyDomain});
})();