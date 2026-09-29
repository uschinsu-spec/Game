/**
 * ModalMixin.js
 * Modular Modal Aggregator for Xianxia Game Scene.
 *
 * Map UI is intentionally NOT part of this aggregator.
 * WorldMapHierarchyUI is the single owner of openMapPanel().
 */
import { ModalCore } from '../modals/ModalCore.js';
import { CharacterSectModal } from '../modals/CharacterSectModal.js';
import { SkillCongPhapModal } from '../modals/SkillCongPhapModal.js';
import { GearCraftingModal } from '../modals/GearCraftingModal.js';
import { CharacterPrimaryModal } from './SimplePrimaryUI.js?v=20260929-single-map-system-v1';
import { SimpleWelcomeModal } from './SimpleWelcomeUI.js';
import { SaveLoadWelcomeModal } from '../modals/SaveLoadWelcomeModal.js';
import { AdminTestModal } from '../modals/AdminTestModal.js';

export const ModalMixin = {
  ...ModalCore,
  ...CharacterSectModal,
  ...SkillCongPhapModal,
  ...GearCraftingModal,
  openCharacterPanel: CharacterPrimaryModal.openCharacterPanel,
  ...SimpleWelcomeModal,
  ...SaveLoadWelcomeModal,
  ...AdminTestModal
};
