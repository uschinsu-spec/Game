import { FACTION_ARCHETYPES } from './factionConstants.js';
import { continentPower } from './continentPowerFactory.js';

export const NORTH_CONTINENT_POWERS = Object.freeze([
  continentPower({id:"faction.hr.continent.north.nonhuman.bac_minh_hai_dinh",name:"Bắc Minh Hải Đình",archetype:FACTION_ARCHETYPES.NON_HUMAN_FACTION,continentIds:['north'],alignment:"trung lập",tags:["băng hải", "hải tộc"]}),
  continentPower({id:"faction.hr.continent.north.clan.huyen_bang_co_toc",name:"Huyền Băng Cổ Tộc",archetype:FACTION_ARCHETYPES.ANCIENT_CLAN,continentIds:['north'],alignment:"trung lập",tags:["huyết mạch", "hàn mạch"]}),
  continentPower({id:"faction.hr.continent.north.sect.huyen_bang_than_cung",name:"Huyền Băng Thần Cung",archetype:FACTION_ARCHETYPES.SECT,continentIds:['north'],alignment:"chính đạo",tags:["băng pháp", "phong ấn"]}),
  continentPower({id:"faction.hr.continent.north.sect.thien_tuyet_tong",name:"Thiên Tuyết Tông",archetype:FACTION_ARCHETYPES.SECT,continentIds:['north'],alignment:"chính đạo",tags:["tuyết pháp", "hàn kiếm"]}),
  continentPower({id:"faction.hr.continent.north.dynasty.bac_minh_hoang_dinh",name:"Bắc Minh Hoàng Đình",archetype:FACTION_ARCHETYPES.DYNASTY,continentIds:['north'],alignment:"chính thống",tags:["chính trị", "hàn phủ"]})
]);
