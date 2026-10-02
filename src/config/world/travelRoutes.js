/**
 * travelRoutes.js
 * Mọi đường chuyển map runtime nằm ở một nơi duy nhất.
 * ID map dùng canonical string key, không dùng số.
 * portalVisible=false dùng cho đường đi được kích hoạt bởi hotspot/NPC thay vì portal hiển thị.
 */
import { CANONICAL_MAP_KEYS } from './masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';

const THON = CANONICAL_MAP_KEYS.THANH_VAN_THON;
const NGOAI_VI = CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI;

export const TRAVEL_ROUTES = Object.freeze([
  Object.freeze({
    id: 'route_thon_to_ngoai_vi', fromMapId: THON, toMapId: NGOAI_VI,
    sourceAnchor: Object.freeze({ x: 270, y: 760 }),
    targetSpawn: Object.freeze({ x: 1792, y: 1792 }),
    portalVisible: false,
    title: 'THANH VÂN NGOẠI VI', sub: 'RỜI THANH VÂN THÔN'
  }),
  Object.freeze({
    id: 'route_ngoai_vi_to_thon', fromMapId: NGOAI_VI, toMapId: THON,
    sourceAnchor: Object.freeze({ x: 1792, y: 3400 }),
    targetSpawn: Object.freeze({ x: 270, y: 760 }),
    title: 'THANH VÂN THÔN', sub: 'QUAY VỀ THÔN LÀNG AN TOÀN'
  })
]);

export function getTravelRoutesForMap(mapId) {
  const id = String(mapId);
  return TRAVEL_ROUTES.filter(route => String(route.fromMapId) === id);
}

export function resolveAnchorPoint(anchor, map, fallback = { x: 350, y: 620 }) {
  if (!anchor) return { ...fallback };
  if (Number.isFinite(anchor.x)) return { x: Number(anchor.x), y: Number(anchor.y ?? fallback.y) };
  const worldWidth = Number(map?.worldWidth || 2880);
  const offset = Number(anchor.offset ?? 350);
  const x = anchor.side === 'right' ? Math.max(60, worldWidth - offset) : offset;
  return { x, y: Number(anchor.y ?? fallback.y) };
}
