// GAME2 compatibility facade. PlayerAnimationStateMachine owns locomotion/actions.
(()=>{'use strict';window.__PLAYER_ANIMATION_PRO_GAME2__=true;
window.triggerPlayerAttackAnimation=()=>{window.GameServices?.events?.emit?.('player:attackRequested',{entityId:'player'})};
window.triggerPlayerHitAnimation=()=>{window.GameServices?.events?.emit?.('player:hitVisualRequested',{entityId:'player'})};
window.triggerPlayerSpellPose=()=>false;
})();