function stopPointerEvent(pointer) {
  const evt = pointer?.event;
  if (!evt) return;
  if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  if (typeof evt.preventDefault === 'function') evt.preventDefault();
}

function resetCombatTouch(scene) {
  if (!scene) return;
  scene.moveTarget = null;
  if (scene.player?.body?.setVelocity) scene.player.setVelocity(0, 0);
  if (!scene.joy) return;
  scene.joy.active = false;
  scene.joy.id = null;
  scene.joy.x = 0;
  scene.joy.y = 0;
  if (scene.joyBase?.setVisible) scene.joyBase.setVisible(false);
  if (scene.joyKnob?.setVisible) scene.joyKnob.setVisible(false);
}

export function installUiCloseButtonOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__uiCloseButtonOptimized) return;

  const proto = MainGameScene.prototype;
  proto.__uiCloseButtonOptimized = true;

  // Mobile-first close button: fixed at the top-right of every fullscreen modal.
  // Close on pointerdown so one tap always works even during combat-heavy scenes.
  proto.createModalCloseBtn = function createModalCloseBtnOptimized(panel) {
    const x = 205;
    const y = -432;
    const width = 104;
    const height = 48;

    const btnBg = this.add.rectangle(x, y, width, height, 0xb91c2c, 1)
      .setStrokeStyle(2.5, 0xffc3cc, 1)
      .setInteractive({ useHandCursor: true });

    const btnTxt = this.add.text(x, y, 'ĐÓNG', {
      fontSize: '15px',
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setStroke('#4a0b14', 2).setOrigin(0.5);

    let closed = false;
    const closeNow = (pointer) => {
      stopPointerEvent(pointer);
      if (closed) return;
      closed = true;
      this.lastModalClosedAt = Date.now();
      resetCombatTouch(this);
      this.closeModal();
    };

    btnBg.on('pointerdown', closeNow);
    btnBg.on('pointerover', () => {
      if (btnBg?.active) btnBg.setFillStyle(0xe11d48, 1);
      if (btnTxt?.active) btnTxt.setColor('#fff4a8');
    });
    btnBg.on('pointerout', () => {
      if (btnBg?.active) btnBg.setFillStyle(0xb91c2c, 1);
      if (btnTxt?.active) btnTxt.setColor('#ffffff');
    });

    panel.add([btnBg, btnTxt]);
    return btnBg;
  };

  // Every close path releases touch state and resumes world physics.
  const originalCloseModal = proto.closeModal;
  if (typeof originalCloseModal === 'function' && !originalCloseModal.__uiCloseWrapped) {
    const wrappedCloseModal = function closeModalWithTouchReset(...args) {
      this.lastModalClosedAt = Date.now();
      resetCombatTouch(this);
      const result = originalCloseModal.apply(this, args);
      if (this.physics?.world?.isPaused && this.physics.world.resume) {
        this.physics.world.resume();
      }
      this.__uiWorldPaused = false;
      return result;
    };
    wrappedCloseModal.__uiCloseWrapped = true;
    proto.closeModal = wrappedCloseModal;
  }
}
