import { FACTION_ARCHETYPES } from './factionConstants.js';
import { continentPower } from './continentPowerFactory.js';

export const SOUTH_CONTINENT_POWERS = Object.freeze([
  continentPower({id:"faction.hr.continent.south.dynasty.dai_ly_hoang_trieu",name:"Đại Ly Hoàng Triều",archetype:FACTION_ARCHETYPES.DYNASTY,continentIds:['south'],alignment:"chính thống",tags:["chính trị", "lãnh thổ"]}),
  continentPower({id:"faction.hr.continent.south.sect.thanh_huyen_dao_tong",name:"Thanh Huyền Đạo Tông",archetype:FACTION_ARCHETYPES.SECT,continentIds:['south'],alignment:"chính đạo",tags:["tu luyện", "Thanh Linh"]}),
  continentPower({id:"faction.hr.continent.south.nonhuman.nam_hoang_yeu_dinh",name:"Nam Hoang Yêu Đình",archetype:FACTION_ARCHETYPES.NON_HUMAN_FACTION,continentIds:['south'],alignment:"trung lập/đối kháng",tags:["yêu tộc", "Nam Hoang"]}),
  continentPower({id:"faction.hr.continent.south.merchant.van_bao_nam_lang",name:"Vạn Bảo Nam Lăng Tổng Hội",archetype:FACTION_ARCHETYPES.MERCHANT_GUILD,continentIds:['south'],alignment:"trung lập",tags:["kinh tế", "đấu giá"]}),
  continentPower({id:"faction.hr.continent.south.alliance.trung_thien_lien_minh",name:"Trung Thiên Liên Minh",archetype:FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE,continentIds:['south'],alignment:"trung lập",tags:["liên minh", "Trung Thiên"]})
]);
