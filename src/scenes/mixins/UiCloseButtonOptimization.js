function stopPointerEvent(pointer) {
  const evt = pointer?.event;
  if (!evt) return;
  if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  if (typeof evt.preventDefault === 'function') evt.preventDefault();
}

function resetCombatTouch(scene) {
  if (!scene) return;
  scene.moveTarget = null;
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

  // Nút đóng dùng chung cho mọi modal: lớn, rõ và ổn định trên mobile.
  // Không đóng ở pointerdown vì lúc đó scene-level input vẫn đang xử lý cùng touch.
  // Chỉ đóng ở pointerup để không xuyên touch xuống map/combat phía sau modal.
  proto.createModalCloseBtn = function createModalCloseBtnOptimized(panel, x = 215, y = -280) {
    const safeX = x >= 0 ? Math.min(x, 184) : Math.max(x, -184);
    const width = 92;
    const height = 42;

    const btnBg = this.add.rectangle(safeX, y, width, height, 0x9f1d2d, 1)
      .setStrokeStyle(2, 0xfecaca, 1)
      .setInteractive({ useHandCursor: true });

    const btnTxt = this.add.text(safeX, y, 'ĐÓNG', {
      fontSize: '13px',
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setStroke('#4a0b14', 2).setOrigin(0.5);

    let pressedPointerId = null;

    const setNormal = () => {
      if (!btnBg?.active) return;
      btnBg.setFillStyle(0x9f1d2d, 1).setScale(1);
      if (btnTxt?.active) btnTxt.setColor('#ffffff').setScale(1);
    };

    const setPressed = () => {
      if (!btnBg?.active) return;
      btnBg.setFillStyle(0xdc263d, 1).setScale(0.96);
      if (btnTxt?.active) btnTxt.setColor('#fff3a8').setScale(0.96);
    };

    btnBg.on('pointerover', () => {
      if (pressedPointerId === null && btnBg?.active) {
        btnBg.setFillStyle(0xc52236, 1);
        if (btnTxt?.active) btnTxt.setColor('#fff3a8');
      }
    });

    btnBg.on('pointerout', () => {
      pressedPointerId = null;
      setNormal();
    });

    btnBg.on('pointerdown', (pointer) => {
      stopPointerEvent(pointer);
      resetCombatTouch(this);
      pressedPointerId = pointer?.id ?? 0;
      setPressed();
    });

    btnBg.on('pointerup', (pointer) => {
      stopPointerEvent(pointer);
      const pointerId = pointer?.id ?? 0;
      if (pressedPointerId !== null && pointerId !== pressedPointerId) return;
      pressedPointerId = null;
      resetCombatTouch(this);
      this.closeModal();
    });

    btnBg.on('pointerupoutside', (pointer) => {
      stopPointerEvent(pointer);
      pressedPointerId = null;
      setNormal();
    });

    panel.add([btnBg, btnTxt]);
    return btnBg;
  };

  // Mọi cách đóng modal (nút ĐÓNG, ESC, chuyển panel...) đều giải phóng touch combat.
  const originalCloseModal = proto.closeModal;
  if (typeof originalCloseModal === 'function' && !originalCloseModal.__uiCloseWrapped) {
    const wrappedCloseModal = function closeModalWithTouchReset(...args) {
      resetCombatTouch(this);
      return originalCloseModal.apply(this, args);
    };
    wrappedCloseModal.__uiCloseWrapped = true;
    proto.closeModal = wrappedCloseModal;
  }
}
