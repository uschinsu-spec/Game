// Adaptive Mobile Visual Fidelity & Performance Manager
(() => {
  'use strict';
  if (!window.GameRuntime) return;
  const { engine, scene, player, capabilities = {} } = window.GameRuntime;
  const isTouchDevice = !!capabilities.isTouchDevice;
  const isIOS = !!capabilities.isIOS;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const weakDevice = cores <= 4 || memory <= 3;
  const PRESET_KEY = 'tu_tien_graphics_preset';
  let currentPreset='balanced';
  try{currentPreset=localStorage.getItem(PRESET_KEY)||'balanced'}catch(_){}
  if(!['ultra','balanced','eco'].includes(currentPreset))currentPreset='balanced';
  const PRESETS={
    ultra:{name:'HD Sắc Nét',scale:1,fxaa:true,bloom:!isTouchDevice,shadowBlur:isTouchDevice?5:10,aniso:isTouchDevice?2:4},
    balanced:{name:'Cân Bằng',scale:1,fxaa:true,bloom:false,shadowBlur:isTouchDevice?4:8,aniso:2},
    eco:{name:'Tiết Kiệm Pin',scale:weakDevice?1.35:1.25,fxaa:false,bloom:false,shadowBlur:2,aniso:1}
  };
  let activeScale=PRESETS[currentPreset].scale,dynamicScale=activeScale,lowSamples=0,highSamples=0,lastScaleChange=0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function applyPreset(name,save=true){
    if(!PRESETS[name])name='balanced';currentPreset=name;if(save)try{localStorage.setItem(PRESET_KEY,name)}catch(_){}
    const cfg=PRESETS[name];activeScale=cfg.scale;dynamicScale=activeScale;lowSamples=highSamples=0;
    if(engine){engine.setHardwareScalingLevel(dynamicScale);engine.resize()}
    const pipeline=window.GameRuntime?.pipeline;if(pipeline){pipeline.fxaaEnabled=cfg.fxaa;pipeline.bloomEnabled=cfg.bloom}
    const shadow=window.GameRuntime?.shadow;if(shadow)shadow.blurKernel=cfg.shadowBlur;
    if(typeof BABYLON!=='undefined'&&BABYLON.Texture)BABYLON.Texture.DEFAULT_ANISOTROPIC_FILTERING_LEVEL=cfg.aniso;
  }
  setTimeout(()=>applyPreset(currentPreset,false),120);
  const staticPrefixes=['EnhancedGround','TerrainTerrace','EnhancedRoad','TrailStone','RoadEdgeStone','SpiritLake','LakeRock','BridgePlank','ImmortalPeak','LanternPost','LanternBox','LanternCap','PagodaPodium','PagodaHall','PagodaRoof','PagodaColumn','SectPillarNew','SectBeamNew','SectRoofNew','TempleStepNew','CloudRibbon'];
  setTimeout(()=>{if(!scene)return;for(const m of scene.meshes){if(!m||m.isDisposed()||!staticPrefixes.some(p=>m.name&&m.name.startsWith(p)))continue;try{m.freezeWorldMatrix?.()}catch(_){}try{if(m.material?.freeze&&!m.material.isFrozen)m.material.freeze()}catch(_){}m.isPickable=false}},900);
  const cullRules=[['Lantern',75],['LakeRock',95],['BridgePlank',110],['CloudRibbon',135],['ImmortalPeak',190],['Pagoda',145],['Sect',145],['TempleStep',135]];
  function cullRadiusFor(name){for(const[p,r]of cullRules)if(name&&name.startsWith(p))return r;return 0}
  const updateStreaming=()=>{if(!player||!scene||document.hidden)return;const px=player.position.x,pz=player.position.z;for(const m of scene.meshes){if(!m||m.isDisposed())continue;const r=cullRadiusFor(m.name);if(!r)continue;const q=m.getAbsolutePosition?m.getAbsolutePosition():m.position,dx=q.x-px,dz=q.z-pz,visible=dx*dx+dz*dz<=r*r;if(m.isEnabled()!==visible)m.setEnabled(visible)}};
  const streamTimer=setInterval(updateStreaming,isTouchDevice?1200:900);
  const perfTimer=setInterval(()=>{if(document.hidden||!engine)return;const fps=engine.getFps(),now=performance.now();if(fps<28){lowSamples++;highSamples=0}else if(fps>50){highSamples++;lowSamples=0}else{lowSamples=Math.max(0,lowSamples-1);highSamples=Math.max(0,highSamples-1)}const maxScale=currentPreset==='eco'?1.55:(weakDevice?1.45:1.30);if(lowSamples>=3&&now-lastScaleChange>3500){dynamicScale=clamp(dynamicScale+.1,activeScale,maxScale);lowSamples=0;lastScaleChange=now;engine.setHardwareScalingLevel(dynamicScale)}else if(highSamples>=6&&dynamicScale>activeScale&&now-lastScaleChange>5000){dynamicScale=clamp(dynamicScale-.05,activeScale,maxScale);highSamples=0;lastScaleChange=now;engine.setHardwareScalingLevel(dynamicScale)}},1800);
  let running=true;document.addEventListener('visibilitychange',()=>{if(!engine||!scene)return;if(document.hidden&&running){engine.stopRenderLoop();running=false}else if(!document.hidden&&!running){engine.runRenderLoop(()=>scene.render());running=true;engine.resize()}});
  window.addEventListener('pagehide',e=>{if(!e.persisted){clearInterval(streamTimer);clearInterval(perfTimer)}});
  window.MobileGraphics={presets:PRESETS,getPreset:()=>currentPreset,getScale:()=>dynamicScale,setPreset:applyPreset};
})();