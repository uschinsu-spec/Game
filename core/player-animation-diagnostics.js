(()=>{'use strict';
class PlayerAnimationDiagnostics{
 constructor({renderer=window.GameServices?.playerRenderer,animation=window.GameServices?.playerAnimation,motor=window.GameServices?.playerMotor,facing=window.GameServices?.facing,events=window.GameServices?.events}={}){Object.assign(this,{renderer,animation,motor,facing,events});this.panel=null;if(this.enabled())this.mount();events?.on?.('player:modelReady',()=>this.refresh(),{owner:'PlayerAnimationDiagnostics'})}
 enabled(){try{return new URLSearchParams(location.search).get('debugAnimation')==='1'||localStorage.getItem('GAME2_DEBUG_ANIMATION')==='1'}catch(_){return false}}
 snapshot(){return{model:this.renderer?.snapshot?.()||null,animation:this.animation?.snapshot?.()||null,velocity:this.motor?.getVelocity?.()||null,moving:this.motor?.isMoving?.()||false,facing:window.PLAYER_FACING_DEBUG||null}}
 mount(){if(this.panel)return;const p=document.createElement('pre');p.id='player-animation-debug';p.style.cssText='position:fixed;left:8px;top:110px;z-index:99998;max-width:360px;max-height:55vh;overflow:auto;padding:8px;border-radius:8px;background:#00151ddd;color:#bffcff;font:11px/1.35 monospace;pointer-events:none;white-space:pre-wrap';document.body.appendChild(p);this.panel=p;const tick=()=>{if(!this.panel)return;this.refresh();requestAnimationFrame(tick)};requestAnimationFrame(tick)}
 refresh(){if(this.panel)this.panel.textContent=JSON.stringify(this.snapshot(),null,2)}
 dispose(){this.panel?.remove();this.panel=null;this.events?.disposeOwner?.('PlayerAnimationDiagnostics')}
}
window.GameCore=window.GameCore||{};window.GameCore.PlayerAnimationDiagnostics=PlayerAnimationDiagnostics;window.GameCore.playerAnimationDiagnostics=window.GameCore.playerAnimationDiagnostics||new PlayerAnimationDiagnostics();window.GameServices=Object.assign(window.GameServices||{},{playerAnimationDiagnostics:window.GameCore.playerAnimationDiagnostics});
})();