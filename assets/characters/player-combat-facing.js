// Player Combat Facing v1
// Locks the whole player toward the selected enemy during attack/cast so body, weapon animation and VFX share one direction.
(()=>{
  const runtime=window.GameRuntime;
  const scene=runtime?.scene;
  const player=runtime?.player;
  if(!scene||!player||window.__PLAYER_COMBAT_FACING_V1__)return;
  window.__PLAYER_COMBAT_FACING_V1__=true;

  const wrapAngle=a=>{
    while(a<=-Math.PI)a+=Math.PI*2;
    while(a>Math.PI)a-=Math.PI*2;
    return a;
  };
  const angleDelta=(from,to)=>wrapAngle(to-from);

  let combatAngle=Number.isFinite(player.rotation?.y)?player.rotation.y:0;
  let hasCombatAngle=false;
  let lockAge=99;
  let wasAttack=false;
  let wasCast=false;

  const originalSetTarget=window.setPlayerTargetAngle;
  window.setPlayerTargetAngle=(angle)=>{
    if(!Number.isFinite(angle))return;
    combatAngle=wrapAngle(angle);
    hasCombatAngle=true;
    lockAge=0;
    // Combat target selection should visually face the enemy immediately enough
    // that the first attack frame never fires sideways.
    const d=angleDelta(player.rotation.y,combatAngle);
    player.rotation.y=wrapAngle(player.rotation.y+d*0.88);
    if(typeof originalSetTarget==='function') originalSetTarget(combatAngle);
  };

  window.facePlayerTowardWorldPosition=(pos,instant=false)=>{
    if(!pos)return;
    const dx=pos.x-player.position.x;
    const dz=pos.z-player.position.z;
    if(Math.abs(dx)+Math.abs(dz)<0.0001)return;
    combatAngle=Math.atan2(dx,dz);
    hasCombatAngle=true;
    lockAge=0;
    if(instant) player.rotation.y=combatAngle;
    if(typeof originalSetTarget==='function') originalSetTarget(combatAngle);
  };

  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.max(.001,Math.min(.05,scene.getEngine().getDeltaTime()/1000));
    lockAge+=dt;
    const attacking=(typeof attackT!=='undefined'&&attackT>0)||window.PLAYER_ANIMATION_STATE==='attack';
    const casting=!!window.PLAYER_CAST_STATE?.active;
    if((attacking&&!wasAttack)||(casting&&!wasCast)) lockAge=0;
    wasAttack=attacking; wasCast=casting;

    // Keep facing lock through the full attack/cast and a short recovery window.
    const locked=hasCombatAngle&&(attacking||casting||lockAge<1.05);
    if(!locked)return;

    const d=angleDelta(player.rotation.y,combatAngle);
    const response=(attacking||casting)?32:18;
    const a=1-Math.exp(-response*dt);
    player.rotation.y=wrapAngle(player.rotation.y+d*a);

    window.PLAYER_COMBAT_FACING={angle:combatAngle,locked:true,attacking,casting};
  });

  console.info('[PlayerCombatFacing] Enemy-facing attack/cast lock active.');
})();
