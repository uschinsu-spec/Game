/**
 * travelRoutes.js
 * Mọi portal/đường chuyển map nằm ở một nơi, không hard-code rải rác trong Scene.
 */

export const TRAVEL_ROUTES = Object.freeze([
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
  }),
  Object.freeze({
    id: 'route_map2_to_map3', fromMapId: 2, toMapId: 3,
    sourceAnchor: Object.freeze({ side: 'right', offset: 350, y: 620 }),
    targetSpawn: Object.freeze({ side: 'left', offset: 350, y: 620 }),
    title: 'HUYẾT LẠC CẤM ĐỊA', sub: 'TIẾN VÀO CẤM ĐỊA TRÚC CƠ'
  }),
  Object.freeze({
    id: 'route_map3_to_map2', fromMapId: 3, toMapId: 2,
    sourceAnchor: Object.freeze({ side: 'left', offset: 250, y: 620 }),
    targetSpawn: Object.freeze({ side: 'right', offset: 500, y: 620 }),
    title: 'VẠN MỘC SÂM LÂM', sub: 'QUAY VỀ CỔ MỘC'
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
