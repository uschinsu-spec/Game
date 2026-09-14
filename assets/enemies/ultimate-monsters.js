// ============================================================================
// THANH VÂN TIÊN VỰC - PREMIUM 3D MONSTER ARENA V3
// Uses 3 higher-detail fantasy monsters from assets with full animation mapping.
// ============================================================================
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene) return;

  const catalog = [
    {
      id:'big_orc_skull', enemyId:'big_orc_skull', name:'Cốt Giáp Cuồng Thú', role:'mob', category:'big',
      modelPath:'./assets/enemies/big/orc_skull.glb', hpMult:1.45, speed:1.02, scale:1.12, yOffset:0,
      attackRange:2.45, attackAnim:'Punch', walkAnim:'Walk', idleAnim:'Idle', hitAnim:'HitReact', deathAnim:'Death',
      moveAnimSpeed:.66, attackAnimSpeed:.82
    },
    {
      id:'flying_dragon', enemyId:'flying_dragon', name:'Thanh Lôi Hỏa Long', role:'elite', category:'flying',
      modelPath:'./assets/enemies/flying/dragon.glb', hpMult:2.75, speed:1.22, scale:1.48, yOffset:1.8,
      attackRange:3.6, attackAnim:'Headbutt', walkAnim:'Fast_Flying', idleAnim:'Flying_Idle', hitAnim:'HitReact', deathAnim:'Death',
      moveAnimSpeed:.64, attackAnimSpeed:.82
    },
    {
      id:'big_bluedemon', enemyId:'big_bluedemon', name:'U Minh Lam Ma', role:'boss', category:'big',
      modelPath:'./assets/enemies/big/bluedemon.glb', hpMult:8.4, speed:.72, scale:1.78, yOffset:0,
      attackRange:3.35, attackAnim:'Punch', walkAnim:'Walk', idleAnim:'Idle', hitAnim:'HitReact', deathAnim:'Death',
      moveAnimSpeed:.58, attackAnimSpeed:.76
    }
  ];

  const lists={mob:catalog.filter(x=>x.role==='mob'),elite:catalog.filter(x=>x.role==='elite'),boss:catalog.filter(x=>x.role==='boss')};

  if(window.EnemyLoader){
    catalog.forEach(c=>window.EnemyLoader.loadModel(c.enemyId,scene).catch(e=>console.warn('[ArenaMonsters] preload',c.enemyId,e)));
  }

  const hpBgMat=new BABYLON.StandardMaterial('HpBgMatPremium',scene);
  hpBgMat.diffuseColor=BABYLON.Color3.FromHexString('#080b11');
  hpBgMat.emissiveColor=BABYLON.Color3.FromHexString('#030507');
  const hpFillMat=new BABYLON.StandardMaterial('HpFillMatPremium',scene);
  hpFillMat.diffuseColor=BABYLON.Color3.FromHexString('#3ce97b');
  hpFillMat.emissiveColor=BABYLON.Color3.FromHexString('#1aa353');
  const monstersRoot=new BABYLON.TransformNode('MonstersContainer',scene);

  function spawnMonster3D(entry,isBoss,angle,dist,stage,centerPos=null){
    const uid='Mob_'+entry.id+'_'+Date.now()+'_'+Math.floor(Math.random()*1000);
    const root=new BABYLON.TransformNode(uid,scene); root.parent=monstersRoot;
    const cx=centerPos?centerPos.x:0, cz=centerPos?centerPos.z:0;
    root.position.set(cx+Math.cos(angle)*dist,entry.yOffset||0,cz+Math.sin(angle)*dist);
    root.scaling.setAll((entry.scale||1)*(isBoss?1.15:1));

    const baseHp=(isBoss?(500+stage*75):(entry.role==='elite'?(160+stage*22):(50+stage*8)))*(entry.hpMult||1);
    const hpBarRoot=new BABYLON.TransformNode('HpBarRoot_'+uid,scene); hpBarRoot.parent=root;
    hpBarRoot.position.set(0,isBoss?3.35:(entry.category==='flying'?2.6:2.15),0);
    const hpBg=BABYLON.MeshBuilder.CreatePlane('HpBg_'+uid,{width:1.65,height:.21},scene); hpBg.parent=hpBarRoot; hpBg.material=hpBgMat; hpBg.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL; hpBg.isPickable=false;
    const hpFill=BABYLON.MeshBuilder.CreatePlane('HpFill_'+uid,{width:1.57,height:.145},scene); hpFill.parent=hpBarRoot; hpFill.position.z=-.01; hpFill.material=hpFillMat; hpFill.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL; hpFill.isPickable=false;

    const monsterObj={
      root,hpFill,id:entry.id,name:entry.name,role:entry.role,category:entry.category,isBoss,
      maxHp:Math.round(baseHp),hp:Math.round(baseHp),speed:entry.speed*(isBoss?.95:1),attackRange:entry.attackRange||2.4,
      attackCooldown:1.4,lastAttack:0,hurtTimer:0,isDying:false,animCtrl:null,visualMeshes:[],currentState:'walk',entry,
      playAnim:function(name,loop=true,speed=1,onEnd=null){
        if(!this.animCtrl)return;
        const map={walk:entry.walkAnim,idle:entry.idleAnim,attack:entry.attackAnim,hit:entry.hitAnim,die:entry.deathAnim};
        const actual=map[name]||name;
        let animSpeed=speed;
        if(name==='walk')animSpeed*=entry.moveAnimSpeed||.65;
        if(name==='attack')animSpeed*=entry.attackAnimSpeed||.8;
        if(name==='hit')animSpeed*=.9;
        if(name==='die')animSpeed*=.8;
        this.animCtrl.play(actual,loop,animSpeed,onEnd);
      }
    };

    (async()=>{
      try{
        const container=window.EnemyLoader?await window.EnemyLoader.loadModel(entry.enemyId,scene):null;
        if(!container)return;
        const instance=container.instantiateModelsToScene(name=>`${name}_${uid}`,false,{doNotInstantiate:true});
        for(const rootMesh of instance.rootNodes){rootMesh.parent=root;rootMesh.setEnabled(true);}
        const shadowGen=window.GameRuntime&&window.GameRuntime.shadow;
        for(const rootMesh of instance.rootNodes){
          rootMesh.getChildMeshes(false).forEach(m=>{
            m.setEnabled(true);m.isVisible=true;m.isPickable=true;m.checkCollisions=false;monsterObj.visualMeshes.push(m);
            if(shadowGen&&entry.category!=='flying')shadowGen.addShadowCaster(m);
            try{
              m.enableEdgesRendering();
              m.edgesWidth=isBoss?1.45:1.0;
              m.edgesColor=new BABYLON.Color4(.025,.015,.04,.30);
              if(m.material){
                m.material.backFaceCulling=true;
                if(m.material.emissiveColor)m.material.emissiveColor=m.material.emissiveColor.add(new BABYLON.Color3(.018,.018,.022));
                if(typeof m.material.roughness==='number')m.material.roughness=Math.min(.86,Math.max(.42,m.material.roughness));
                if(typeof m.material.metallic==='number')m.material.metallic=Math.min(.55,m.material.metallic);
              }
            }catch(_){}
          });
        }
        if(window.EnemyAnimationController){
          monsterObj.animCtrl=new window.EnemyAnimationController(instance.animationGroups);
          monsterObj.playAnim('walk',true,1);
        }
      }catch(err){console.error('[ArenaMonsters] model error',entry.id,err);}
    })();
    return monsterObj;
  }

  function chooseCatalogEntry(isBoss,stage,serial){
    if(isBoss)return lists.boss[0]||catalog[2];
    const s=Math.max(1,stage||1);
    const isElite=(s>=3&&serial%3===0)||(serial%4===0);
    return isElite?lists.elite[0]:lists.mob[0];
  }

  window.ArenaMonsterEngine={spawnMonster3D,chooseCatalogEntry,catalog,lists};
  console.info('Arena Monster Engine V3: Orc Skull + Flying Dragon + Blue Demon with full Idle/Move/Attack/Hit/Death animations.');
})();