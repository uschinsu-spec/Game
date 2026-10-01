import { openHubFeatureModal } from '../HubFeatureModal.js';
export function openCityFreeMarketModal(scene){return openHubFeatureModal(scene,{title:'🪙 KHU GIAO DỊCH TỰ DO',subtitle:'Quy đổi tiền tệ',body:'Thực hiện quy đổi Bạc và Linh Thạch tại khu giao dịch.',button:'MỞ GIAO DỊCH',accent:0x10b981,onPress:()=>scene.openCurrencyExchangeModal?.()});}
