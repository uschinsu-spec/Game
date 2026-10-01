/**
 * Deprecated compatibility export.
 *
 * Crafting data is owned by the canonical item/recipe system. A legacy modal
 * still imports CRAFTING_SYSTEM but does not read it; keep this inert export so
 * the browser module graph remains valid without restoring a duplicate crafting
 * catalog.
 */
export const CRAFTING_SYSTEM = Object.freeze({ deprecated: true });
