/**
 * ModalMixin.js
 * Modular Modal Aggregator for Xianxia Game Scene
 * 
 * Tách thành các module chức năng độc lập:
 *  - ModalCore: isModalOpen, createModalCloseBtn, closeModal
 *  - CharacterSectModal: Nhân vật, Tông môn, Đổi linh thạch
 *  - SkillCongPhapModal: Kỹ năng, Công pháp 8 hệ
 *  - GearCraftingModal: Trang bị, Túi đồ, Luyện đan & Chế tạo
 *  - WorldMapModal: Bản đồ thế giới
 *  - SaveLoadWelcomeModal: Lưu game, Nạp save, Màn hình chào
 *  - AdminTestModal: Menu Test Game / GM Admin
 */
import { ModalCore } from '../modals/ModalCore.js';
import { CharacterSectModal } from '../modals/CharacterSectModal.js';
import { SkillCongPhapModal } from '../modals/SkillCongPhapModal.js';
import { GearCraftingModal } from '../modals/GearCraftingModal.js';
import { CharacterMapPrimaryModal } from './SimplePrimaryUI.js';
import { SimpleWelcomeModal } from './SimpleWelcomeUI.js';
import { SaveLoadWelcomeModal } from '../modals/SaveLoadWelcomeModal.js';
import { AdminTestModal } from '../modals/AdminTestModal.js';

export const ModalMixin = {
  ...ModalCore,
  ...CharacterSectModal,
  ...SkillCongPhapModal,
  ...GearCraftingModal,
  ...CharacterMapPrimaryModal,
  ...SimpleWelcomeModal,
  ...SaveLoadWelcomeModal,
  ...AdminTestModal
};

