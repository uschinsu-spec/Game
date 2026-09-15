// GAME2 Player Model Bootstrap — rendering only. Animation/facing/gameplay ownership live in core systems.
(()=>{'use strict';
const renderer=window.GameServices?.playerRenderer;
if(!renderer){console.error('[PlayerModelBootstrap] PlayerRenderer unavailable');return}
if(window.__RIGGED_PLAYER_BOOTSTRAPPED__)return;
window.__RIGGED_PLAYER_BOOTSTRAPPED__=true;
renderer.load('./assets/characters/model-rigged.glb').catch(e=>{window.PLAYER_MODEL_ERROR=String(e?.message||e);console.error('[PlayerModelBootstrap]',e)});
})();