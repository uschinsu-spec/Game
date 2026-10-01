import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityTravelGateModal(scene){return openHubFeatureModal(scene,{title:'🌀 TRẠM TRUYỀN TỐNG',subtitle:'Dịch chuyển liên vùng',body:'Mở đại bản đồ để chọn điểm đến hợp lệ.',button:'CHỌN ĐIỂM ĐẾN',accent:0x3b82f6,onPress:()=>scene.openMapPanel?.('nam_lang',1)});}
