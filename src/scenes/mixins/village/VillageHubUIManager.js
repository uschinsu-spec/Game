const NPC_KEY_MAP = Object.freeze({
  chief: 'truong_thon',
  truong_thon: 'truong_thon',
  'trưởng thôn': 'truong_thon',
  farmer: 'nong_phu',
  nong_phu: 'nong_phu',
  'nông phu': 'nong_phu',
  forge: 'tho_ren',
  tho_ren: 'tho_ren',
  'thợ rèn': 'tho_ren',
  merchant: 'thuong_hoi',
  thuong_hoi: 'thuong_hoi',
  'thương nhân': 'thuong_hoi',
  tavern: 'tuu_lau',
  tuu_lau: 'tuu_lau',
  chu_tuu_quan: 'tuu_lau',
  'chủ tửu quán': 'tuu_lau',
  'tửu quán': 'tuu_lau',
  medicine: 'duoc_diem',
  duoc_diem: 'duoc_diem',
  duoc_nuong: 'duoc_diem',
  'dược nương': 'duoc_diem',
  'dược điếm': 'duoc_diem',
  mill: 'tho_xay',
  tho_xay: 'tho_xay',
  'thợ xay': 'tho_xay',
  leave_village: 've_si_cong',
  ve_si_cong: 've_si_cong',
  exit: 've_si_cong',
  roi_thon: 've_si_cong',
  'rời thôn': 've_si_cong',
  'cổng xuất thôn': 've_si_cong',
  martial_hall: 'vo_quan',
  vo_quan: 'vo_quan',
  'võ quán': 'vo_quan'
});

export class VillageHubUIManager {
  static async openBuildingUI(scene, buildingKey) {
    const key = String(buildingKey || '').trim().toLowerCase();
    if (key === 'leave_village' || key === 'roi_thon' || key === 'exit' || key === 'rời thôn' || key === 'cổng xuất thôn' || key === 've_si_cong') {
      if (typeof scene?.leaveThanhVanVillageDirect === 'function') {
        return scene.leaveThanhVanVillageDirect();
      }
      return travelService.travel(CANONICAL_MAP_KEYS.THANH_VAN_NGOAI_VI, {
        scene,
        source: TRAVEL_SOURCES.NPC,
        spawnX: 1792,
        spawnY: 1792
      });
    }
    const npcId = NPC_KEY_MAP[key] || key;

    if (typeof scene?.openNpcDialogModal === 'function') {
      return scene.openNpcDialogModal(npcId);
    }
    scene?.showToast?.(`⚠️ Không mở được giao diện: ${buildingKey}`);
    return null;
  }
}

export function installVillageHubUI(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const p = MainGameScene.prototype;
  if (p.__villageHubUiInstalled) return;
  p.__villageHubUiInstalled = true;
  p.openVillageBuildingUI = function(buildingKey) {
    return VillageHubUIManager.openBuildingUI(this, buildingKey);
  };
}
