import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityForgeModal(scene){return openHubFeatureModal(scene,{title:'🔥 KHU LUYỆN KHÍ',subtitle:'Rèn đúc trang bị',body:'Mở hệ chế tác binh khí và trang bị.',button:'MỞ LUYỆN KHÍ',accent:0xf97316,onPress:()=>scene.openCraftingPanel?.('gear')});}
