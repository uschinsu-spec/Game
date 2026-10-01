import { openHubFeatureModal } from '../HubFeatureModal.js';
import { gameState } from '../../../state/gameState.js';
export function openCityArenaModal(scene){
  const formed=!!gameState.party?.isFormed;
  return openHubFeatureModal(scene,{title:'⚔️ ĐẤU TRƯỜNG',subtitle:'Tổ đội chiến đấu',body:formed?'Tổ đội 4 hiệp khách đang hoạt động.':'Lập tổ đội 4 hiệp khách để cùng xuất chiến.',button:formed?'GIẢI TÁN TỔ ĐỘI':'LẬP TỔ ĐỘI',accent:0xef4444,onPress:()=>{if(!gameState.party)gameState.party={};gameState.party.isFormed=!formed;if(gameState.party.isFormed)scene.initPartyFollowers?.();else scene.destroyPartyFollowers?.();scene.updateHUD?.();scene.showToast?.(gameState.party.isFormed?'⚔️ Đã lập tổ đội.':'Đã giải tán tổ đội.');}});
}
