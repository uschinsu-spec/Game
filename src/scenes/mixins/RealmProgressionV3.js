/**
 * RealmProgressionV3.js (Re-export shim)
 * Bảng migration và logic tiến trình V3 đã được chuyển sang RealmProgression.js và realmMigration.js
 */
import { installRealmProgression, LEGACY_TO_V3, migrateLegacyRealmIndex, mapLegacyRealmThreshold } from './RealmProgression.js';

export { LEGACY_TO_V3, migrateLegacyRealmIndex, mapLegacyRealmThreshold };
export const installRealmProgressionV3 = installRealmProgression;
