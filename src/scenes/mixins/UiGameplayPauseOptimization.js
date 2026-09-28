function uiPaused(scene) {
  return !!(scene?.__uiWorldPaused || scene?.isModalOpen?.());
}

function stopMotion(scene) {
  scene.moveTarget = null;
  scene.player?.setVelocity?.(0, 0);
  if (scene.joy) {
    scene.joy.active = false;
    scene.joy.id = null;
    scene.joy.x = 0;
    scene.joy.y = 0;
  }
  scene.joyBase?.setVisible?.(false);
  scene.joyKnob?.setVisible?.(false);
}

function wrapBlockedMethod(proto, name, fallbackValue) {
  const original = proto[name];
  if (typeof original !== 'function' || original.__uiPauseWrapped) return;
  const wrapped = function uiPausedMethodGuard(...args) {
    if (uiPaused(this)) return fallbackValue;
    return original.apply(this, args);
  };
  wrapped.__uiPauseWrapped = true;
  proto[name] = wrapped;
}

export function installUiGameplayPauseOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__uiGameplayPauseInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__uiGameplayPauseInstalled = true;

  const originalUpdate = proto.update;
  if (typeof originalUpdate === 'function' && !originalUpdate.__uiPauseWrapped) {
    const wrappedUpdate = function updateWithUiSafeMode(...args) {
      if (uiPaused(this)) {
        stopMotion(this);
        return;
      }
      return originalUpdate.apply(this, args);
    };
    wrappedUpdate.__uiPauseWrapped = true;
    proto.update = wrappedUpdate;
  }

  // Dừng các tick nền như tụ khí, hồi phục, vườn và các tiến trình theo giây.
  wrapBlockedMethod(proto, 'onSecondTick');

  // Không cho AI/đạn/đòn đánh mới sinh ra khi UI đang mở.
  wrapBlockedMethod(proto, 'enemyAttack');
  wrapBlockedMethod(proto, 'enemyShootProjectile');

  // Nếu một đòn đã được lên lịch trước khi UI mở, vẫn chặn sát thương phát sinh.
  wrapBlockedMethod(proto, 'takePlayerDamage');
  wrapBlockedMethod(proto, 'takePartyFollowerDamage');

  // Không cho input chiến đấu hoặc portal kích hoạt xuyên qua UI.
  wrapBlockedMethod(proto, 'basicAttack');
  wrapBlockedMethod(proto, 'castSkill');
  wrapBlockedMethod(proto, 'performDash');
  wrapBlockedMethod(proto, 'triggerPortalTeleport');
}
