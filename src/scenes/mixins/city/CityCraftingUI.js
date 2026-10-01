import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityCraftingModal(scene){return openHubFeatureModal(scene,{title:'☸ BÁCH NGHỆ CÁC',subtitle:'Trận pháp chuyên môn',body:'Mở khu giao dịch và sử dụng trận pháp theo cảnh giới.',button:'MỞ TRẬN PHÁP',accent:0xa855f7,onPress:()=>scene.openMerchantSpecialShop?.('formations')});}
