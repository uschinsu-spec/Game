/**
 * ItemSystem.js — public facade for Item Runtime V3.
 *
 * The runtime implementation lives in ItemSystemCore.js. This facade keeps the
 * existing import path stable and explicitly re-exports getItemByName, which is
 * consumed by CombatMixin and SimplePrimaryUI.
 */
export * from './ItemSystemCore.js?v=20261001-item-system-binding-fix-v1';
export { getItemByName } from '../../config/itemCatalog.js?v=20261001-item-icons-v4';
