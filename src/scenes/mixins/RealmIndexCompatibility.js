/**
 * RealmIndexCompatibility.js (Re-export shim)
 * Bảng migration và logic tương thích đã được chuyển sang RealmProgression.js và realmMigration.js
 */
import { installRealmProgression, migrateLegacyRealmIndex, stageMinRealm, LEGACY_TO_V3 } from './RealmProgression.js';

export { migrateLegacyRealmIndex, stageMinRealm, LEGACY_TO_V3 };
export const installRealmIndexCompatibility = installRealmProgression;
