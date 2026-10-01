import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityTreasureGuildModal(scene){return openHubFeatureModal(scene,{title:'💎 VẠN BẢO THƯƠNG HỘI',subtitle:'Phù lục và bảo vật',body:'Mở gian hàng phù lục theo cảnh giới hiện tại.',button:'MỞ GIAN HÀNG PHÙ LỤC',accent:0x22c55e,onPress:()=>scene.openMerchantSpecialShop?.('talismans')});}
