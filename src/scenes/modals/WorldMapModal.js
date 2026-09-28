/**
 * WorldMapModal.js
 * Quản lý: openMapPanel (Bản đồ thế giới) - Chuyển sang SimplePrimaryUI
 */
import { CharacterMapPrimaryModal } from '../mixins/SimplePrimaryUI.js';

export const WorldMapModal = {
  openMapPanel(...args) {
    return CharacterMapPrimaryModal.openMapPanel.apply(this, args);
  }
};

