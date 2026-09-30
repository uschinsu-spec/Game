import { FACTION_ARCHETYPES } from './factionConstants.js';
import { continentPower } from './continentPowerFactory.js';

export const EAST_CONTINENT_POWERS = Object.freeze([
  continentPower({id:"faction.hr.continent.east.sect.thien_kiem_dao_thong",name:"Thiên Kiếm Đạo Thống",archetype:FACTION_ARCHETYPES.SECT,continentIds:['east'],alignment:"chính đạo",tags:["kiếm đạo", "Thiên Kiếm"]}),
  continentPower({id:"faction.hr.continent.east.nonhuman.thuong_hai_hai_toc",name:"Thương Hải Hải Tộc",archetype:FACTION_ARCHETYPES.NON_HUMAN_FACTION,continentIds:['east'],alignment:"trung lập",tags:["hải vực", "Thương Hải"]}),
  continentPower({id:"faction.hr.continent.east.dynasty.dong_huyen_hoang_trieu",name:"Đông Huyền Hoàng Triều",archetype:FACTION_ARCHETYPES.DYNASTY,continentIds:['east'],alignment:"chính thống",tags:["chính trị", "đạo thống"]}),
  continentPower({id:"faction.hr.continent.east.sect.loi_trach_dien",name:"Lôi Trạch Thần Điện",archetype:FACTION_ARCHETYPES.SECT,continentIds:['east'],alignment:"trung lập",tags:["lôi pháp", "Lôi Trạch"]}),
  continentPower({id:"faction.hr.continent.east.merchant.thuong_hai_lien_minh",name:"Thương Hải Thương Liên",archetype:FACTION_ARCHETYPES.MERCHANT_GUILD,continentIds:['east'],alignment:"trung lập",tags:["hải vận", "thương cảng"]})
]);
