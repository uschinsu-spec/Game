import { openClanMainHallModal } from './ClanMainHallUI.js?v=20261001-org-relations-v40';
import { openClanLibraryModal } from './ClanLibraryUI.js?v=20261001-org-relations-v40';
import { openClanAlchemyModal } from './ClanAlchemyUI.js?v=20261001-org-relations-v40';
import { openClanForgeModal } from './ClanForgeUI.js?v=20261001-org-relations-v40';
import { openClanDisciplineModal } from './ClanDisciplineUI.js?v=20261001-org-relations-v40';
import { openClanMissionModal } from './ClanMissionUI.js?v=20261001-org-relations-v40';
import { openClanHerbGardenModal } from './ClanHerbGardenUI.js?v=20261001-org-relations-v40';
import { openClanMartialArenaModal } from './ClanMartialArenaUI.js?v=20261001-org-relations-v40';
import { openClanTravelGateModal } from './ClanTravelGateUI.js?v=20261001-org-relations-v40';
import { resolveClanContext, joinClan, leaveClan, toastClan } from './ClanFactionBridge.js?v=20261001-org-relations-v40';

export class ClanHubUIManager {
  static openBuildingUI(scene, buildingKey, faction) {
    if (!scene) return null;
    const key=String(buildingKey||'').toLowerCase();
    if(key.includes('đại điện')||key.includes('tộc trưởng')||key.includes('main_hall')||key.includes('truong_thon'))return openClanMainHallModal(scene,faction);
    if(key.includes('tàng thư')||key.includes('thư các')||key.includes('library'))return openClanLibraryModal(scene,faction);
    if(key.includes('đan dược')||key.includes('alchemy')||key.includes('duoc_diem'))return openClanAlchemyModal(scene,faction);
    if(key.includes('lò rèn')||key.includes('forge')||key.includes('tho_ren'))return openClanForgeModal(scene,faction);
    if(key.includes('chấp pháp')||key.includes('discipline')||key.includes('giới luật'))return openClanDisciplineModal(scene,faction);
    if(key.includes('nhiệm vụ')||key.includes('mission')||key.includes('tuu_lau'))return openClanMissionModal(scene,faction);
    if(key.includes('linh điền')||key.includes('dược viên')||key.includes('garden')||key.includes('nong_phu'))return openClanHerbGardenModal(scene,faction);
    if(key.includes('diễn võ')||key.includes('arena')||key.includes('võ đài')||key.includes('vo_quan'))return openClanMartialArenaModal(scene,faction);
    if(key.includes('xuất hành')||key.includes('travel')||key.includes('cổng')||key.includes('ve_si_cong'))return openClanTravelGateModal(scene,faction);
    return openClanMainHallModal(scene,faction);
  }
}

export function installClanHubUI(MainGameScene){
  if(!MainGameScene?.prototype)return;
  const p=MainGameScene.prototype;if(p.__clanHubUiInstalled)return;p.__clanHubUiInstalled=true;
  p.getCurrentClanContext=function(factionOverride=null){return resolveClanContext(this,factionOverride);};
  p.openClanBuildingUI=function(buildingKey,factionOverride=null){const ctx=resolveClanContext(this,factionOverride);if(!ctx){this.showToast?.('⚠️ Khu vực hiện tại không có Gia Tộc/Cổ Tộc hợp lệ trong Faction V5.');return null;}return ClanHubUIManager.openBuildingUI(this,buildingKey,ctx.faction);};
  p.joinCurrentClan=function(factionOverride=null){const ctx=resolveClanContext(this,factionOverride);const result=ctx?joinClan(ctx):{ok:false,message:'Không tìm thấy gia tộc hợp lệ.'};toastClan(this,result);this.updateHUD?.();return result;};
  p.leaveCurrentClan=function(factionOverride=null){const ctx=resolveClanContext(this,factionOverride);const result=ctx?leaveClan(ctx):{ok:false,message:'Không tìm thấy gia tộc hợp lệ.'};toastClan(this,result);this.updateHUD?.();return result;};
}
