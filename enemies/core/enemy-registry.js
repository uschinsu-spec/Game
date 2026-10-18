(() => {
  "use strict";

  /**
   * EnemyRegistry: Trung tâm đăng ký cấu hình, hình ảnh 3D và logic chiến đấu của mọi loại quái vật.
   */
  const _configs = new Map();
  const _visuals = new Map();
  const _attackLogics = new Map();

  const EnemyRegistry = {
    /**
     * Đăng ký cấu hình quái vật
     * @param {string} kind - Mã định danh quái (vd: 'wolf', 'golem', 'dragon', ...)
     * @param {object} config - Cấu hình stats, combat, model (glb/procedural), animations, palette
     */
    registerConfig(kind, config) {
      if (!kind || !config) throw new Error("[EnemyRegistry] registerConfig yêu cầu kind + config");
      _configs.set(kind, { ...config, kind });
    },

    /**
     * Đăng ký class Visual (cho quái procedural hoặc custom renderer)
     */
    registerVisual(kind, VisualClass) {
      if (!kind || typeof VisualClass !== "function") {
        throw new Error("[EnemyRegistry] registerVisual yêu cầu kind + VisualClass");
      }
      _visuals.set(kind, VisualClass);
    },

    /**
     * Đăng ký Attack Logic tùy biến riêng cho từng quái vật
     * @param {string} kindOrType - Tên loại quái hoặc tên attack type (vd: 'area_slam', 'ranged_projectile', 'boss_combo')
     * @param {object|Function} attackHandler - Object có hàm execute() hoặc Function
     */
    registerAttackLogic(kindOrType, attackHandler) {
      _attackLogics.set(kindOrType, attackHandler);
    },

    get(kind) {
      return _configs.get(kind) || null;
    },

    getVisualClass(kind) {
      return _visuals.get(kind) || null;
    },

    getAttackLogic(kindOrType) {
      return _attackLogics.get(kindOrType) || null;
    },

    list() {
      return Array.from(_configs.keys());
    },

    /**
     * Factory tạo Visual tương ứng: tự động phát hiện model GLB hoặc VisualClass đăng ký
     */
    createVisual(kind, scene, parent, id, level = 1) {
      const config = this.get(kind);
      if (!config) throw new Error(`[EnemyRegistry] Không tìm thấy config cho kind: "${kind}"`);

      const CustomClass = this.getVisualClass(kind);
      if (CustomClass) {
        return new CustomClass(scene, parent, id, level, config);
      }

      // Nếu cấu hình có GLB model, tự động dùng GlbEnemyVisual
      if (config.model?.type === "glb" || config.model?.path) {
        if (window.GlbEnemyVisual) {
          return new window.GlbEnemyVisual(scene, parent, id, level, config);
        }
      }

      throw new Error(`[EnemyRegistry] Không có VisualClass hoặc GLB model hợp lệ cho: "${kind}"`);
    }
  };

  window.EnemyRegistry = EnemyRegistry;
})();
