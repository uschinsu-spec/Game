// ============================================================================
// THANH VÂN TIÊN VỰC - ARENA ENEMY ADAPTER V5
// Uses EnemyRegistry as the single source of truth for model/stats/animation data.
// Arena-only concerns stay here: role selection, stage scaling, HP-bar quality policy.
// ============================================================================
(()=>{
  'use strict';
  const scene=BABYLON.EngineStore.LastCreatedScene;if(!scene)return;
  const registry=window.EnemyRegistry;if(!registry){console.error('[ArenaMonsterEngine] EnemyRegistry missing');return;}
  const runtime=window.GameRuntime||{},caps=runtime.capabilities||{},isTouch=!!caps.isTouchDevice,shadowGen=runtime.shadow||null;
  const EDGE_NEAR_DIST=isTouch?28:42,HP_NEAR_DIST=isTouch?42:60,SHADOW_NEAR_DIST=isTouch?24:36;

  const ARENA_DEFS=[
    {enemyId:'blob_cactoro',role:'mob',hpMult:1.0,moveAnimSpeed:.72,attackAnimSpeed:.88},
    {enemyId:'flying_dragon',role:'elite',hpMult:2.4,moveAnimSpeed:.68,attackAnimSpeed:.85},
    {enemyId:'big_demon',role:'boss',hpMult:7.5,moveAnimSpeed:.62,attackAnimSpeed:.78}
  ];
  const catalog=ARENA_DEFS.map(def=>{
    const base=registry.get(def.enemyId);
    if(!base)throw new Error(`Unknown enemyId ${def.enemyId}`);
    return {
      ...def,
      id:def.enemyId,
      name:base.name,
      category:base.cat,
      modelPath:base.modelPath,
      speed:base.speed,
      scale:base.scale,
      yOffset:base.groundOffset||0,
      attackRange:base.attackRange,
      damage:base.damage,
      baseHp:base.hp,
      registry:base
    };
  });
  const lists={mob:catalog.filter(x=>x.role==='mob'),elite:catalog.filter(x=>x.role==='elite'),boss:catalog.filter(x=>x.role==='boss')};

  const hpBgMat=new BABYLON.StandardMaterial('HpBgMat',scene);hpBgMat.diffuseColor=BABYLON.Color3.FromHexString('#090d14');hpBgMat.emissiveColor=BABYLON.Color3.FromHexString('#05070a');hpBgMat.freeze();
  const hpFillMat=new BABYLON.StandardMaterial('HpFillMat',scene);hpFillMat.diffuseColor=BABYLON.Color3.FromHexString('#35d96f');hpFillMat.emissiveColor=BABYLON.Color3.FromHexString('#199447');hpFillMat.freeze();
  const monstersRoot=new BABYLON.TransformNode('MonstersContainer',scene);

  function setShadowState(monster,enabled){if(!shadowGen||monster.category==='flying'||monster._shadowEnabled===enabled)return;monster._shadowEnabled=enabled;for(const mesh of monster.visualMeshes){try{if(enabled)shadowGen.addShadowCaster(mesh,false);else shadowGen.removeShadowCaster(mesh,false)}catch(_){}}}
  function setEdgeState(monster,enabled){if(monster._edgesEnabled===enabled)return;monster._edgesEnabled=enabled;for(const mesh of monster.visualMeshes){try{if(enabled){mesh.enableEdgesRendering();mesh.edgesWidth=monster.isBoss?1.6:1.1;mesh.edgesColor=new BABYLON.Color4(.05,.02,.08,.42)}else mesh.disableEdgesRendering()}catch(_){}}}
  function updateVisualQuality(monster,distance){if(!monster?.root)return;const important=monster.isBoss||monster.role==='elite';setEdgeState(monster,important||distance<=EDGE_NEAR_DIST);setShadowState(monster,monster.isBoss||distance<=SHADOW_NEAR_DIST);const hpVisible=monster.isBoss||distance<=HP_NEAR_DIST;if(monster.hpBarRoot&&monster._hpVisible!==hpVisible){monster._hpVisible=hpVisible;monster.hpBarRoot.setEnabled(hpVisible)}}

  function spawnMonster3D(entry,isBoss,angle,dist,stage,centerPos=null){
    const uid='Mob_'+entry.id+'_'+Date.now()+'_'+Math.floor(Math.random()*1000),root=new BABYLON.TransformNode(uid,scene);root.parent=monstersRoot;root.metadata={isEnemy:true,enemyId:entry.enemyId,isBoss:!!isBoss};
    const cx=centerPos?centerPos.x:0,cz=centerPos?centerPos.z:0;root.position.set(cx+Math.cos(angle)*dist,entry.yOffset||0,cz+Math.sin(angle)*dist);root.scaling.setAll((entry.scale||1)*(isBoss?1.18:1));
    const regHp=Math.max(1,entry.baseHp||100),stageScale=1+Math.max(0,(stage||1)-1)*.08,baseHp=regHp*stageScale*(entry.hpMult||1)*(isBoss?1.35:1);
    const hpBarRoot=new BABYLON.TransformNode('HpBarRoot_'+uid,scene);hpBarRoot.parent=root;hpBarRoot.position.set(0,isBoss?3.1:(entry.category==='flying'?2.5:1.9),0);
    const hpBg=BABYLON.MeshBuilder.CreatePlane('HpBg_'+uid,{width:1.55,height:.2},scene);hpBg.parent=hpBarRoot;hpBg.material=hpBgMat;hpBg.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;hpBg.isPickable=false;
    const hpFill=BABYLON.MeshBuilder.CreatePlane('HpFill_'+uid,{width:1.48,height:.14},scene);hpFill.parent=hpBarRoot;hpFill.position.z=-.01;hpFill.material=hpFillMat;hpFill.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;hpFill.isPickable=false;
    const monsterObj={root,hpBarRoot,hpFill,id:entry.id,enemyId:entry.enemyId,name:entry.name,role:entry.role,category:entry.category,isBoss,maxHp:Math.round(baseHp),hp:Math.round(baseHp),speed:(entry.speed||2)*(isBoss?.95:1),damage:entry.damage||50,attackRange:entry.attackRange||2.2,attackCooldown:1.35,lastAttack:0,hurtTimer:0,isDying:false,animCtrl:null,visualMeshes:[],currentState:'walk',entry,_shadowEnabled:false,_edgesEnabled:false,_hpVisible:true,playAnim:function(name,loop=true,speed=1,onEnd=null){if(!this.animCtrl)return null;let logical=name;if(name==='walk'&&this.category==='flying')logical='flying';let animSpeed=speed;if(name==='walk')animSpeed*=entry.moveAnimSpeed||.72;if(name==='attack')animSpeed*=entry.attackAnimSpeed||.85;return this.animCtrl.play(logical,loop,animSpeed,onEnd)},updateVisualQuality:function(distance){updateVisualQuality(this,distance)}};
    (async()=>{try{const container=window.EnemyLoader?await window.EnemyLoader.loadModel(entry.enemyId,scene):null;if(!container||root.isDisposed())return;const instance=container.instantiateModelsToScene(name=>`${name}_${uid}`,false,{doNotInstantiate:true});for(const rootMesh of instance.rootNodes){rootMesh.parent=root;rootMesh.setEnabled(true);rootMesh.getChildMeshes(false).forEach(m=>{m.setEnabled(true);m.isVisible=true;m.isPickable=false;m.checkCollisions=false;monsterObj.visualMeshes.push(m)})}if(window.EnemyAnimationController){monsterObj.animCtrl=new window.EnemyAnimationController(instance.animationGroups);if(!monsterObj.playAnim('walk',true,1))monsterObj.playAnim('idle',true,1)}updateVisualQuality(monsterObj,dist)}catch(err){console.error('[ArenaMonsterEngine] model error',entry.id,err)}})();
    return monsterObj;
  }
  function chooseCatalogEntry(isBoss,stage,serial){if(isBoss)return lists.boss[0]||null;const s=Math.max(1,stage||1),isElite=(s>=3&&serial%3===0)||(serial%4===0);return isElite?(lists.elite[0]||lists.mob[0]):lists.mob[0]}
  window.ArenaMonsterEngine={spawnMonster3D,chooseCatalogEntry,catalog,lists,updateVisualQuality};
  console.info('[ArenaMonsterEngine] V5 registry-backed runtime enabled');
})();