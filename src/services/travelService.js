/**
 * travelService.js
 * =========================================================================
 * UNIFIED TRAVEL & TELEPORTATION SERVICE (TravelService)
 * =========================================================================
 * Trung tâm điều phối duy nhất cho toàn bộ các luồng di chuyển trong game:
 * - Portal (Cổng dịch chuyển)
 * - World Map Hierarchy UI (Bản đồ thế giới)
 * - Minimap & Fast Travel (Dịch chuyển nhanh)
 * - NPC Dialog & Quests (Rời thôn, giao nhiệm vụ, dịch chuyển cốt truyện)
 * - Tông Môn / Gia Tộc Truyền Tống Trận (Faction Travel Gates)
 * - Hồi sinh (Respawn) sau khi tử nạn
 * =========================================================================
 */
import { REALMS } from '../config/realmsData.js';
import {
  canEnterMap,
  findMapById,
  getMapById,
  getNodeRuntimePolicy,
  getWorldNode,
  RUNTIME_POLICIES,
  CANONICAL_MAP_KEYS,
  START_MAP_ID
} from '../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { getTravelRoutesForMap, resolveAnchorPoint } from '../config/world/travelRoutes.js?v=20260929-single-map-system-v2';
import { gameState } from '../state/gameState.js';
import {
  ensureWorldProgress,
  hasVisitedMap,
  isNodeDiscovered,
  markMapVisited,
  discoverNode
} from '../state/worldProgress.js';
import { hasCurrency, deductCurrency } from '../config/currencyData.js';

export const TRAVEL_SOURCES = Object.freeze({
  PORTAL: 'PORTAL',
  WORLD_MAP: 'WORLD_MAP',
  MINIMAP: 'MINIMAP',
  NPC: 'NPC',
  FACTION_GATE: 'FACTION_GATE',
  QUEST: 'QUEST',
  RESPAWN: 'RESPAWN',
  FAST_TRAVEL: 'FAST_TRAVEL',
  DIRECT: 'DIRECT'
});

export const TRAVEL_ERROR_CODES = Object.freeze({
  INVALID_DESTINATION: 'INVALID_DESTINATION',
  NOT_PLAYABLE: 'NOT_PLAYABLE',
  ALREADY_HERE: 'ALREADY_HERE',
  REALM_RESTRICTED: 'REALM_RESTRICTED',
  FACTION_RESTRICTED: 'FACTION_RESTRICTED',
  QUEST_BLOCKED: 'QUEST_BLOCKED',
  COOLDOWN_ACTIVE: 'COOLDOWN_ACTIVE',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  NOT_DISCOVERED: 'NOT_DISCOVERED',
  PANORAMA_LOAD_FAIL: 'PANORAMA_LOAD_FAIL'
});

const DEFAULT_COOLDOWN_MS = 2500;
const travelCooldowns = new Map();

class GameTravelService {
  constructor() {
    this.name = 'TravelService';
    this.version = '20260930-unified-travel-service-v1';
  }

  /**
   * Phân giải bản đồ đích từ bất kỳ loại Identifier nào
   */
  resolveDestinationMap(destinationId) {
    if (!destinationId) return null;
    if (typeof destinationId === 'object') {
      if (destinationId.id && destinationId.dimensions) return destinationId;
      if (destinationId.playableMapId) return findMapById(destinationId.playableMapId);
      if (destinationId.id) return findMapById(destinationId.id);
    }
    return findMapById(destinationId);
  }

  /**
   * Kiểm tra điều kiện di chuyển trước khi thực hiện
   */
  canTravel(destinationId, options = {}) {
    const targetMap = this.resolveDestinationMap(destinationId);
    if (!targetMap) {
      return { ok: false, reason: TRAVEL_ERROR_CODES.INVALID_DESTINATION, message: 'Điểm đến không tồn tại hoặc không hợp lệ.' };
    }

    const node = targetMap.locationNodeId ? getWorldNode(targetMap.locationNodeId) : null;
    const policy = getNodeRuntimePolicy(node || targetMap);
    if (policy === RUNTIME_POLICIES.NONE && !targetMap.dimensions) {
      return { ok: false, reason: TRAVEL_ERROR_CODES.NOT_PLAYABLE, message: 'Khu vực này chỉ dùng tổ chức bản đồ, không thể trực tiếp bước vào.' };
    }

    const currentMapId = gameState.currentMapId ?? START_MAP_ID;
    if (String(targetMap.id) === String(currentMapId)) {
      return { ok: false, reason: TRAVEL_ERROR_CODES.ALREADY_HERE, message: 'Đang ở tại địa điểm này.' };
    }

    // Kiểm tra cảnh giới (Realm)
    if (!options.skipRealmCheck) {
      const access = canEnterMap(targetMap.id, gameState);
      if (!access.ok) {
        const requiredRealm = REALMS[access.requiredRealmIdx]?.name || 'cảnh giới cao hơn';
        return {
          ok: false,
          reason: TRAVEL_ERROR_CODES.REALM_RESTRICTED,
          requiredRealmIdx: access.requiredRealmIdx,
          requiredRealmName: requiredRealm,
          message: `Tu vi chưa đủ! Cần [${requiredRealm}] để tiến vào.`
        };
      }
    }

    // Kiểm tra Fast Travel chỉ đến điểm đã khám phá
    if (options.source === TRAVEL_SOURCES.FAST_TRAVEL && !options.skipDiscoveredCheck) {
      const visited = hasVisitedMap(gameState, targetMap.id) || (node && isNodeDiscovered(gameState, node.id));
      if (!visited) {
        return { ok: false, reason: TRAVEL_ERROR_CODES.NOT_DISCOVERED, message: 'Chưa từng đặt chân đến đây, không thể dùng truyền tống nhanh.' };
      }
    }

    // Kiểm tra Cooldown vào lại thôn làng sau khi rời thôn (5 giây)
    const isTargetVillage = String(targetMap.id) === CANONICAL_MAP_KEYS.THANH_VAN_THON || String(targetMap.id) === '0' || String(targetMap.id) === 'thanh_van_thon';
    const scene = options.scene || window.__ACTIVE_PHASER_SCENE__;
    const reentryBlocked = Math.max(Number(scene?.villageReentryBlockedUntil || 0), Number(this.villageReentryBlockedUntil || 0));
    if (isTargetVillage && Date.now() < reentryBlocked) {
      const remainingSec = Math.max(1, Math.ceil((reentryBlocked - Date.now()) / 1000));
      return { ok: false, reason: TRAVEL_ERROR_CODES.COOLDOWN_ACTIVE, message: `⏳ Vừa rời thôn! Hãy chờ ${remainingSec}s trước khi quay lại.` };
    }

    // Kiểm tra Cooldown
    if (!options.skipCooldown && options.source === TRAVEL_SOURCES.PORTAL) {
      const cdKey = `portal_${String(currentMapId)}_${String(targetMap.id)}`;
      const expireTime = travelCooldowns.get(cdKey) || 0;
      if (Date.now() < expireTime) {
        return { ok: false, reason: TRAVEL_ERROR_CODES.COOLDOWN_ACTIVE, message: 'Trận pháp truyền tống đang hồi khí...' };
      }
    }

    // Kiểm tra Chi phí
    const cost = Number(options.cost || 0);
    const costType = options.costType || 'low';
    if (cost > 0 && !options.skipCost) {
      if (!hasCurrency(gameState, costType, cost)) {
        return { ok: false, reason: TRAVEL_ERROR_CODES.INSUFFICIENT_FUNDS, cost, costType, message: `Không đủ Linh Thạch! Cần ${cost} Linh Thạch để truyền tống.` };
      }
    }

    return { ok: true, map: targetMap, node };
  }

  /**
   * Tính toán toạ độ Spawn tối ưu cho bản đồ đích
   */
  resolveSpawnPoint(targetMap, fromMapId, options = {}) {
    if (Number.isFinite(options.spawnX) && Number.isFinite(options.spawnY)) {
      return { x: Number(options.spawnX), y: Number(options.spawnY) };
    }

    // Kiểm tra route định nghĩa tĩnh trong travelRoutes
    if (fromMapId) {
      const routes = getTravelRoutesForMap(fromMapId);
      const matchRoute = routes.find(r => String(r.toMapId) === String(targetMap.id));
      if (matchRoute?.targetSpawn) {
        return { x: Number(matchRoute.targetSpawn.x), y: Number(matchRoute.targetSpawn.y) };
      }
    }

    // Kiểm tra spawn mặc định của targetMap
    if (targetMap.assets?.spawn) {
      return { x: Number(targetMap.assets.spawn.x), y: Number(targetMap.assets.spawn.y) };
    }

    // Fallback chuẩn an toàn
    const defaultY = Number(targetMap.dimensions?.baseGroundY ?? 650);
    return { x: 270, y: defaultY };
  }

  /**
   * Thực thi toàn diện quy trình Travel (Di chuyển / Truyền tống)
   */
  travel(destinationId, options = {}) {
    const scene = options.scene || window.__ACTIVE_PHASER_SCENE__;
    const check = this.canTravel(destinationId, options);

    if (!check.ok) {
      if (!options.silent && scene?.showFloatingText) {
        const px = scene.player?.x ?? 270;
        const py = (scene.player?.y ?? 620) - 70;
        scene.showFloatingText(px, py, check.message, '#ff6677', '13px');
      }
      options.onFail?.(check.reason, check);
      return false;
    }

    const targetMap = check.map;
    const fromMapId = gameState.currentMapId ?? START_MAP_ID;
    const spawn = this.resolveSpawnPoint(targetMap, fromMapId, options);

    // Khấu trừ chi phí (nếu có)
    const cost = Number(options.cost || 0);
    const costType = options.costType || 'low';
    if (cost > 0 && !options.skipCost) {
      deductCurrency(gameState, costType, cost);
    }

    // Cài đặt Cooldown
    if (options.source === TRAVEL_SOURCES.PORTAL) {
      const cdKey = `portal_${String(fromMapId)}_${String(targetMap.id)}`;
      travelCooldowns.set(cdKey, Date.now() + (options.cooldownMs || DEFAULT_COOLDOWN_MS));
    }

    // Đóng toàn bộ Modal / Dialog đang mở
    scene?.closeModal?.();

    // Thực thi chuyển cảnh thông qua switchMap nội bộ
    if (typeof scene?.switchMap === 'function') {
      scene.switchMap(targetMap.id, spawn.x, spawn.y);
    } else {
      gameState.currentMapId = targetMap.id;
    }

    // Cập nhật trạng thái khám phá thế giới
    ensureWorldProgress(gameState);
    markMapVisited(gameState, targetMap.id, { unlockWaypoint: true });
    if (targetMap.locationNodeId) {
      discoverNode(gameState, targetMap.locationNodeId);
      gameState.worldProgress.currentLocationNodeId = targetMap.locationNodeId;
    }

    // Thông báo giao diện và hiệu ứng
    if (!options.silent && scene?.showFloatingText) {
      const msg = options.customMessage || `Đã đến: ${targetMap.name}`;
      const px = spawn.x ?? 270;
      const py = (spawn.y ?? 620) - 70;
      scene.showFloatingText(px, py, msg, '#66ffcc', '14px');
    }

    options.onSuccess?.(targetMap);
    return true;
  }
}

export const travelService = new GameTravelService();
export default travelService;
