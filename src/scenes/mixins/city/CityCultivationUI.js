import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityCultivationModal(scene){return openHubFeatureModal(scene,{title:'🧘 TU CHÂN LINH CÁC',subtitle:'Công pháp tu luyện',body:'Tra cứu và học công pháp tu luyện phù hợp.',button:'MỞ CÔNG PHÁP',accent:0x8b5cf6,onPress:()=>scene.openCongPhapPanel?.('Hoàng Giai','manuals')});}
