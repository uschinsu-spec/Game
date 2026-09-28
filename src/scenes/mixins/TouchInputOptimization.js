import { W, H } from '../constants.js';

function resetJoy(scene) {
  if (!scene || !scene.joy) return;
  scene.joy.active = false;
  scene.joy.id = null;
  scene.joy.x = 0;
  scene.joy.y = 0;
  if (scene.joyBase?.setVisible) scene.joyBase.setVisible(false);
  if (scene.joyKnob?.setVisible) scene.joyKnob.setVisible(false);
}

function isReservedUiZone(pointer) {
  if (!pointer) return true;
  // Toàn bộ HUD phía trên, skill/menu phía dưới và sidebar bên phải
  // được dành riêng cho UI, tuyệt đối không khởi tạo joystick/world input.
  return pointer.y < 155 || pointer.y > H - 150 || pointer.x > W - 58;
}

export function installTouchInputOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__touchInputOptimized) return;
  const proto = MainGameScene.prototype;
  proto.__touchInputOptimized = true;

  // Override joystick động: UI luôn có ưu tiên cao hơn world/combat input.
  proto.createDynamicTouchControls = function createDynamicTouchControlsOptimized() {
    resetJoy(this);

    if (this.joyBase) this.joyBase.destroy();
    if (this.joyKnob) this.joyKnob.destroy();

    this.joyBase = this.fixed(
      this.add.circle(0, 0, 50, 0xd9fff1, 0.15)
        .setStrokeStyle(2, 0x66ffcc, 0.45)
        .setVisible(false),
      220
    );
    this.joyKnob = this.fixed(
      this.add.circle(0, 0, 22, 0xd9fff1, 0.4)
        .setStrokeStyle(2, 0xffffff, 0.75)
        .setVisible(false),
      221
    );

    // Bảo đảm chỉ GameObject ở trên cùng nhận input khi nhiều lớp VFX/UI chồng nhau.
    if (this.input?.setTopOnly) this.input.setTopOnly(true);
    else if (this.input) this.input.topOnly = true;

    // Nếu hàm bị gọi lại, tháo listener cũ trước để tránh nhân đôi input.
    const old = this._touchInputHandlers;
    if (old && this.input) {
      this.input.off('pointerdown', old.pointerDown);
      this.input.off('pointermove', old.pointerMove);
      this.input.off('pointerup', old.release);
      this.input.off('pointerupoutside', old.release);
      this.input.off('gameout', old.gameOut);
      this.input.off('gameobjectdown', old.gameObjectDown);
      if (old.blur) window.removeEventListener('blur', old.blur);
      if (old.visibility) document.removeEventListener('visibilitychange', old.visibility);
    }

    const release = (pointer) => {
      if (!pointer || this.joy.id === pointer.id || !this.joy.active) {
        resetJoy(this);
      }
    };

    const gameObjectDown = () => {
      // Khi người chơi bấm bất kỳ GameObject interactive nào (UI, portal...),
      // hủy joystick/tap-to-move đang giữ để thao tác UI không bị combat chiếm mất.
      resetJoy(this);
      this.moveTarget = null;
    };

    const pointerDown = (pointer, currentlyOver = []) => {
      if (!pointer) return;

      if (this.isModalOpen?.()) {
        resetJoy(this);
        return;
      }

      // Phaser truyền danh sách interactive objects bên dưới pointer.
      // Có object => đây là thao tác UI/world-interactive, không phải joystick.
      if (Array.isArray(currentlyOver) && currentlyOver.length > 0) {
        resetJoy(this);
        this.moveTarget = null;
        return;
      }

      if (isReservedUiZone(pointer)) {
        resetJoy(this);
        this.moveTarget = null;
        return;
      }

      // Không cho ngón tay thứ hai cướp joystick đang hoạt động.
      if (this.joy.active && this.joy.id !== pointer.id) return;

      this.joy.active = true;
      this.joy.id = pointer.id;
      this.joy.startX = pointer.x;
      this.joy.startY = pointer.y;
      this.joy.x = 0;
      this.joy.y = 0;
      this.joyBase.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joyKnob.setPosition(pointer.x, pointer.y).setVisible(true);
    };

    const pointerMove = (pointer) => {
      if (!pointer || !this.joy.active || this.joy.id !== pointer.id) return;
      if (pointer.isDown === false) {
        resetJoy(this);
        return;
      }

      let dx = pointer.x - this.joy.startX;
      let dy = pointer.y - this.joy.startY;
      const len = Math.hypot(dx, dy) || 1;
      const max = 45;
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      this.joyKnob.setPosition(this.joy.startX + dx, this.joy.startY + dy);
      this.joy.x = dx / max;
      this.joy.y = dy / max;
    };

    const gameOut = () => resetJoy(this);
    const blur = () => resetJoy(this);
    const visibility = () => {
      if (document.hidden) resetJoy(this);
    };

    this._touchInputHandlers = {
      pointerDown,
      pointerMove,
      release,
      gameOut,
      gameObjectDown,
      blur,
      visibility
    };

    this.input.on('pointerdown', pointerDown);
    this.input.on('pointermove', pointerMove);
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
    this.input.on('gameout', gameOut);
    this.input.on('gameobjectdown', gameObjectDown);
    window.addEventListener('blur', blur, { passive: true });
    document.addEventListener('visibilitychange', visibility, { passive: true });
  };

  // Chuyển map phải xóa hoàn toàn trạng thái touch cũ; nếu không joy.active có thể
  // giữ true và khóa Auto vì Auto chỉ chạy khi !joy.active.
  const originalSwitchMap = proto.switchMap;
  if (typeof originalSwitchMap === 'function') {
    proto.switchMap = function switchMapWithTouchReset(...args) {
      resetJoy(this);
      this.moveTarget = null;
      const result = originalSwitchMap.apply(this, args);
      resetJoy(this);
      return result;
    };
  }
}
