function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  const evt = pointer?.event;
  evt?.stopPropagation?.();
  evt?.preventDefault?.();
}

function stopMotion(scene) {
  if (!scene) return;
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
  scene.gameplayPaused = true;
  scene.__uiHardPaused = true;
  scene.__uiWorldPaused = true;

  if (scene.physics?.world?.pause && !scene.physics.world.isPaused) {
    scene.physics.world.pause();
  }
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
  if (!scene || (scene.__uiTransitionDepth || 0) > 0) return;
  if (scene.activeModal?.active || scene.activeModalOverlay?.active) return;

  if (scene.physics?.world?.isPaused && scene.physics.world.resume) {
    scene.physics.world.resume();
  }
  if (scene.__uiTweensPaused && scene.tweens?.resumeAll) {
    scene.tweens.resumeAll();
  }
  if (scene.__uiAnimationsPaused && scene.anims?.resumeAll) {
    scene.anims.resumeAll();
  }

  scene.gameplayPaused = false;
  scene.__uiHardPaused = false;
  scene.__uiWorldPaused = false;
  scene.__uiTweensPaused = false;
  scene.__uiAnimationsPaused = false;
}

function uiPaused(scene) {
  return !!(scene?.gameplayPaused || scene?.__uiHardPaused);
}

export function installUiGameplayPauseOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__uiGameplayPauseInstalledV2) return;
  const proto = MainGameScene.prototype;
  proto.__uiGameplayPauseInstalledV2 = true;

  proto.isGameplayPaused = function isGameplayPaused() {
    return uiPaused(this);
  };
  proto.enterUiHardPause = function enterUiHardPause() {
    freezeWorld(this);
  };
  proto.exitUiHardPause = function exitUiHardPause() {
    resumeWorld(this);
  };

  const originalUpdate = proto.update;
  if (typeof originalUpdate === 'function' && !originalUpdate.__hardUiPauseWrapped) {
    const wrappedUpdate = function updateWithHardUiPause(...args) {
      if (uiPaused(this)) {
        stopMotion(this);
        return;
      }
      return originalUpdate.apply(this, args);
    };
    wrappedUpdate.__hardUiPauseWrapped = true;
    proto.update = wrappedUpdate;
  }

  // Wrap every final open* UI method AFTER all simplified UI modules are installed.
  // Transition depth prevents closeModal() inside one UI->another UI transition from
  // resuming the world for even a single frame.
  Object.getOwnPropertyNames(proto).forEach(name => {
    if (!/^open[A-Z]/.test(name)) return;
    const original = proto[name];
    if (typeof original !== 'function' || original.__hardUiOpenWrapped) return;
    const wrapped = function openWithHardUiPause(...args) {
      this.__uiTransitionDepth = (this.__uiTransitionDepth || 0) + 1;
      freezeWorld(this);
      try {
        return original.apply(this, args);
      } finally {
        this.__uiTransitionDepth = Math.max(0, (this.__uiTransitionDepth || 1) - 1);
        if (this.activeModal?.active || this.activeModalOverlay?.active) freezeWorld(this);
      }
    };
    wrapped.__hardUiOpenWrapped = true;
    proto[name] = wrapped;
  });

  const originalCloseModal = proto.closeModal;
  if (typeof originalCloseModal === 'function' && !originalCloseModal.__hardUiCloseWrapped) {
    const wrappedClose = function closeWithHardUiResume(...args) {
      const result = originalCloseModal.apply(this, args);
      if ((this.__uiTransitionDepth || 0) > 0) {
        freezeWorld(this);
      } else {
        resumeWorld(this);
      }
      return result;
    };
    wrappedClose.__hardUiCloseWrapped = true;
    proto.closeModal = wrappedClose;
  }

  // Final close button. It stops Phaser propagation itself and closes on pointerdown
  // so combat/world input can never steal the tap.
  proto.createModalCloseBtn = function createHardPauseCloseButton(panel) {
    const x = 205;
    const y = -432;
    const bg = this.add.rectangle(x, y, 108, 52, 0xc01835, 1)
      .setStrokeStyle(3, 0xffc7d0, 1)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, 'ĐÓNG', {
      fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '16px',
      fontStyle: 'bold', color: '#ffffff', stroke: '#5b0816', strokeThickness: 2
    }).setOrigin(0.5);

    let done = false;
    const closeNow = pointer => {
      stopPointer(this, pointer);
      if (done) return;
      done = true;
      stopMotion(this);
      this.closeModal();
    };
    bg.on('pointerdown', closeNow);
    bg.on('pointerup', pointer => stopPointer(this, pointer));
    panel?.add?.([bg, txt]);
    return bg;
  };
}
