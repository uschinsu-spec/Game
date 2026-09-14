// Render/performance owner only. Never controls gameplay actors.
(()=>{
  const DPR=Math.max(1,window.devicePixelRatio||1),cores=navigator.hardwareConcurrency||4,memory=navigator.deviceMemory||4,lowPower=cores<=4||memory<=4;
  let scale=lowPower?1.55:(DPR>=3?1.3:1.15),quality=lowPower?'LOW':'MED',lowSamples=0,highSamples=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),applyScale=()=>engine.setHardwareScalingLevel(scale);applyScale();
  if(lowPower){scene.fogEnd=Math.min(scene.fogEnd,205);scene.fogStart=Math.min(scene.fogStart,95);shadow.blurKernel=8}

  const staticNames=new Set(['EnhancedGround','TerrainTerrace','EnhancedRoad','TrailStone','RoadEdgeStone','SpiritLake0','SpiritLake1','LakeRock','BridgePlank','ImmortalPeak','LanternPost','LanternBox','LanternCap','PagodaPodium','PagodaHall','PagodaRoof','PagodaColumn','SectPillarNew','SectBeamNew','SectRoofNew','TempleStepNew','CloudRibbon']);
  setTimeout(()=>{
    for(const m of scene.meshes)if(staticNames.has(m.name)&&m.freezeWorldMatrix)try{m.freezeWorldMatrix()}catch(_){}
    if(lowPower){const map=shadow.getShadowMap?.(),skip=new Set(['TrailStone','RoadEdgeStone','LakeRock','BridgePlank','CloudRibbon','EnhancedGround','EnhancedRoad','TerrainTerrace']);if(map?.renderList)map.renderList=map.renderList.filter(m=>!skip.has(m.name))}
  },600);

  // Cull only decorative world meshes. GLB actors are excluded by design.
  const cull={LanternPost:90,LanternBox:90,LanternCap:90,LakeRock:105,BridgePlank:110,CloudRibbon:lowPower?120:165,ImmortalPeak:210,PagodaPodium:155,PagodaHall:155,PagodaRoof:155,PagodaColumn:155};
  const updateStreaming=()=>{const px=player.position.x,pz=player.position.z;for(const m of scene.meshes){const r=cull[m.name];if(!r)continue;const q=m.getAbsolutePosition?m.getAbsolutePosition():m.position,visible=(q.x-px)**2+(q.z-pz)**2<=r*r;if(m.isEnabled()!==visible)m.setEnabled(visible)}};
  updateStreaming();const streamTimer=setInterval(updateStreaming,850);

  const perfTimer=setInterval(()=>{if(document.hidden)return;const fps=engine.getFps();if(fps<25){lowSamples++;highSamples=0}else if(fps>37){highSamples++;lowSamples=0}else{lowSamples=0;highSamples=0}if(lowSamples>=2){scale=clamp(scale+.12,1,1.85);lowSamples=0;quality=scale>1.55?'LOW':'MED';applyScale()}else if(highSamples>=4){scale=clamp(scale-.08,1,1.85);highSamples=0;quality=scale<1.22?'HIGH':'MED';applyScale()}const debug=document.querySelector('.debug');if(debug)debug.dataset.perf=`${Math.round(fps)} FPS • ${quality}`},2000);

  let running=true;document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){engine.stopRenderLoop();running=false}else if(!document.hidden&&!running){engine.runRenderLoop(()=>scene.render());running=true;engine.resize()}});
  window.addEventListener('pagehide',()=>{clearInterval(streamTimer);clearInterval(perfTimer)},{once:true});
})();