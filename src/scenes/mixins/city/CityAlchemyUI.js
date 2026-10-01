import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityAlchemyModal(scene){return openHubFeatureModal(scene,{title:'💊 ĐAN ĐƯỜNG',subtitle:'Luyện đan chuyên biệt',body:'Mở hệ luyện chế đan dược.',button:'MỞ LUYỆN ĐAN',accent:0x06b6d4,onPress:()=>scene.openCraftingPanel?.('pills')});}
