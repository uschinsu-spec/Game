// Mobile pinch zoom for the fixed third-person MMORPG camera.
(() => {
  const ZOOM_MIN = 10;
  const ZOOM_MAX = 31;
  const ZOOM_DEFAULT = 18;

  cameraRadius = ZOOM_DEFAULT;
  camera.lowerRadiusLimit = ZOOM_MIN;
  camera.upperRadiusLimit = ZOOM_MAX;

  document.documentElement.style.touchAction = 'none';
  document.body.style.touchAction = 'none';
  canvas.style.touchAction = 'none';

  let startDistance = 0;
  let startRadius = cameraRadius;
  const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  const clamp=v=>Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,v));

  function beginPinch(e){if(e.touches&&e.touches.length>=2){startDistance=distance(e.touches[0],e.touches[1]);startRadius=cameraRadius;if(e.cancelable)e.preventDefault();}}
  function movePinch(e){if(!e.touches||e.touches.length<2||startDistance<=0)return;const current=distance(e.touches[0],e.touches[1]);if(current<=0)return;cameraRadius=clamp(startRadius*(startDistance/current));camera.radius=cameraRadius;if(e.cancelable)e.preventDefault();}
  function endPinch(e){if(!e.touches||e.touches.length<2)startDistance=0}

  window.addEventListener('touchstart',beginPinch,{passive:false,capture:true});
  window.addEventListener('touchmove',movePinch,{passive:false,capture:true});
  window.addEventListener('touchend',endPinch,{passive:false,capture:true});
  window.addEventListener('touchcancel',endPinch,{passive:false,capture:true});
})();
