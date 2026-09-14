// Adaptive mobile-web runtime: dynamic resolution, distance culling, static-mesh freezing,
// background pause/resume and light device-based quality selection.
(() => {
  const DPR = Math.max(1, window.devicePixelRatio || 1);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const lowPower = cores <= 4 || memory <= 4;
  let scale = lowPower ? 1.55 : (DPR >= 3 ? 1.3 : 1.15);
  let quality = lowPower ? 'LOW' : 'MED';
  let lowSamples = 0, highSamples = 0;

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const applyScale = () => engine.setHardwareScalingLevel(scale);
  applyScale();

  if (lowPower) {
    scene.fogEnd = Math.min(scene.fogEnd, 205);
    scene.fogStart = Math.min(scene.fogStart, 95);
    shadow.blurKernel = 8;
  }

  // Only static environment belongs to this runtime optimizer.
  // Combat actors are controlled exclusively by EnemySystem/idle-adventure.
  const staticNames = new Set(['XianxiaWorld','HeavenRoad','SpiritPeak','hall','curvedRoof','SectStep','GatePillar','SectGate','Bamboo','BambooLeaves','ScholarRock','SpiritPond','MountainMist']);
  setTimeout(()=>{
    scene.meshes.forEach(m=>{
      if(staticNames.has(m.name) && m.freezeWorldMatrix) {
        try { m.freezeWorldMatrix(); } catch (_) {}
      }
    });
  }, 250);

  const cullRadius = {
    Bamboo: lowPower ? 72 : 92,
    BambooLeaves: lowPower ? 72 : 92,
    ScholarRock: lowPower ? 85 : 110,
    MountainMist: lowPower ? 135 : 175,
    SectStep: 125,
    SpiritPond: 125,
    hall: 145,
    curvedRoof: 145,
    GatePillar: 145,
    SectGate: 145
  };
  const streamable = scene.meshes.filter(m=>cullRadius[m.name]);
  const updateStreaming = ()=>{
    const p = player.position;
    for (const m of streamable) {
      const r = cullRadius[m.name];
      const q = m.getAbsolutePosition ? m.getAbsolutePosition() : m.position;
      const dx=q.x-p.x,dz=q.z-p.z;
      const visible=dx*dx+dz*dz <= r*r;
      if(m.isEnabled()!==visible) m.setEnabled(visible);
    }
  };
  updateStreaming();
  const streamTimer=setInterval(updateStreaming,700);

  const perfTimer=setInterval(()=>{
    if(document.hidden) return;
    const fps=engine.getFps();
    if(fps < 25){ lowSamples++; highSamples=0; }
    else if(fps > 37){ highSamples++; lowSamples=0; }
    else { lowSamples=0; highSamples=0; }

    if(lowSamples>=2){
      scale=clamp(scale+.12,1,1.85); lowSamples=0; quality=scale>1.55?'LOW':'MED'; applyScale();
    } else if(highSamples>=4){
      scale=clamp(scale-.08,1,1.85); highSamples=0; quality=scale<1.22?'HIGH':'MED'; applyScale();
    }

    const debug=document.querySelector('.debug');
    if(debug) debug.dataset.perf=`${Math.round(fps)} FPS • ${quality}`;
  },2000);

  let running=true;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden && running){
      engine.stopRenderLoop(); running=false;
    } else if(!document.hidden && !running){
      engine.runRenderLoop(()=>scene.render()); running=true;
      engine.resize();
    }
  });

  window.addEventListener('resize',()=>engine.resize(),{passive:true});
  window.addEventListener('pagehide',()=>{clearInterval(streamTimer);clearInterval(perfTimer)},{once:true});
})();