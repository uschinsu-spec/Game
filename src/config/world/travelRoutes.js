/**
 * travelRoutes.js
 * Mọi đường chuyển map runtime nằm ở một nơi duy nhất.
 * Chỉ các Map 0-2 tồn tại; không giữ route ẩn/legacy tới map đã xóa.
 * portalVisible=false dùng cho đường đi được kích hoạt bởi hotspot/NPC thay vì portal hiển thị.
 */

export const TRAVEL_ROUTES = Object.freeze([
  Object.freeze({
    id: 'route_map0_to_map1', fromMapId: 0, toMapId: 1,
    sourceAnchor: Object.freeze({ x: 270, y: 760 }),
    targetSpawn: Object.freeze({ x: 420, y: 620 }),
    portalVisible: false,
    title: 'THANH VÂN NGOẠI VI', sub: 'RỜI THANH VÂN THÔN'
  }),
  Object.freeze({
    id: 'route_map1_to_map0', fromMapId: 1, toMapId: 0,
    sourceAnchor: Object.freeze({ side: 'left', offset: 250, y: 620 }),
    targetSpawn: Object.freeze({ x: 270, y: 760 }),
    title: 'THANH VÂN THÔN', sub: 'QUAY VỀ THÔN LÀNG AN TOÀN'
  }),
  Object.freeze({
    id: 'route_map1_to_map2', fromMapId: 1, toMapId: 2,
    sourceAnchor: Object.freeze({ side: 'right', offset: 350, y: 620 }),
    targetSpawn: Object.freeze({ side: 'left', offset: 350, y: 620 }),
    title: 'VẠN MỘC SÂM LÂM', sub: 'LỐI VÀO CỔ MỘC THÂM XỨ'
  }),
  Object.freeze({
    id: 'route_map2_to_map1', fromMapId: 2, toMapId: 1,
    sourceAnchor: Object.freeze({ side: 'left', offset: 250, y: 620 }),
    targetSpawn: Object.freeze({ side: 'right', offset: 500, y: 620 }),
    title: 'THANH VÂN NGOẠI VI', sub: 'QUAY VỀ NGOẠI VI'
  })
]);

export function getTravelRoutesForMap(mapId) {
  const id = Number(mapId);
  return TRAVEL_ROUTES.filter(route => route.fromMapId === id);
}

export function resolveAnchorPoint(anchor, map, fallback = { x: 350, y: 620 }) {
  if (!anchor) return { ...fallback };
  if (Number.isFinite(anchor.x)) return { x: Number(anchor.x), y: Number(anchor.y ?? fallback.y) };
  const worldWidth = Number(map?.worldWidth || 2880);
  const offset = Number(anchor.offset ?? 350);
  const x = anchor.side === 'right' ? Math.max(60, worldWidth - offset) : offset;
  return { x, y: Number(anchor.y ?? fallback.y) };
}
