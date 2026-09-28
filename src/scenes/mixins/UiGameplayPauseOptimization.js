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

function freezeWorld(scene) {
  if (!scene) return;
  stopMotion(scene);

  if (scene.physics?.world?.pause && !scene.physics.world.isPaused) {
    scene.physics.world.pause();
  }
  scene.__uiWorldPaused = true;

  if (!scene.__uiTweensPaused && scene.tweens?.pauseAll) {
    scene.tweens.pauseAll();
    scene.__uiTweensPaused = true;
  }

  if (!scene.__uiAnimationsPaused && scene.anims?.pauseAll) {
    scene.anims.pauseAll();
    scene.__uiAnimationsPaused = true;
  }
}

function resumeWorld(scene) {
  if (!scene) return;

  if (scene.physics?.world?.isPaused && scene.physics.world.resume) {
    scene.physics.world.resume();
  }
  if (scene.__uiTweensPaused && scene.tweens?.resumeAll) {
    scene.tweens.resumeAll();
  }
  if (scene.__uiAnimationsPaused && scene.anims?.resumeAll) {
    scene.anims.resumeAll();
  }

  scene.__uiWorldPaused = false;
  scene.__uiTweensPaused = false;
  scene.__uiAnimationsPaused = false;
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

  // Mọi modal hiện tại và modal mới đều tự đưa world vào trạng thái khu an toàn.
  Object.getOwnPropertyNames(proto).forEach(name => {
    if (!/^open[A-Z]/.test(name)) return;
    const original = proto[name];
    if (typeof original !== 'function' || original.__uiSafeOpenWrapped) return;
    const wrapped = function openWithFullGamePause(...args) {
      const result = original.apply(this, args);
      freezeWorld(this);
      return result;
    };
    wrapped.__uiSafeOpenWrapped = true;
    proto[name] = wrapped;
  });

  // Đóng UI thì toàn bộ world tiếp tục lại đúng trạng thái trước đó.
  const originalCloseModal = proto.closeModal;
  if (typeof originalCloseModal === 'function' && !originalCloseModal.__uiSafeCloseWrapped) {
    const wrappedClose = function closeWithWorldResume(...args) {
      const result = originalCloseModal.apply(this, args);
      resumeWorld(this);
      return result;
    };
    wrappedClose.__uiSafeCloseWrapped = true;
    proto.closeModal = wrappedClose;
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
