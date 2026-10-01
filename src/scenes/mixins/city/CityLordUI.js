import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityLordModal(scene){return openHubFeatureModal(scene,{title:'🏯 PHỦ THÀNH CHỦ',subtitle:'Quản lý hành trình trong thành',body:'Xem đại bản đồ và các khu vực có thể tiếp cận từ thành thị hiện tại.',button:'MỞ ĐẠI BẢN ĐỒ',accent:0xf59e0b,onPress:()=>scene.openMapPanel?.('nam_lang')});}
