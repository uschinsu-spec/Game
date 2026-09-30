import { FACTION_ARCHETYPES } from './factionConstants.js';
import { continentPower } from './continentPowerFactory.js';

export const WEST_CONTINENT_POWERS = Object.freeze([
  continentPower({id:"faction.hr.continent.west.clan.hoang_co_vuong_toc",name:"Hoang Cổ Vương Tộc",archetype:FACTION_ARCHETYPES.ANCIENT_CLAN,continentIds:['west'],alignment:"trung lập",tags:["cổ huyết", "thể tu"]}),
  continentPower({id:"faction.hr.continent.west.sect.xich_nhat_than_cung",name:"Xích Nhật Thần Cung",archetype:FACTION_ARCHETYPES.SECT,continentIds:['west'],alignment:"hỗn hợp",tags:["hỏa pháp", "địa hỏa"]}),
  continentPower({id:"faction.hr.continent.west.academy.co_vuong_than_dien",name:"Cổ Vương Thần Điện",archetype:FACTION_ARCHETYPES.ACADEMY,continentIds:['west'],alignment:"trung lập",tags:["cổ mộ", "bí thuật"]}),
  continentPower({id:"faction.hr.continent.west.merchant.kim_sa_thuong_minh",name:"Kim Sa Thương Minh",archetype:FACTION_ARCHETYPES.MERCHANT_GUILD,continentIds:['west'],alignment:"trung lập",tags:["ốc đảo", "thương lộ"]}),
  continentPower({id:"faction.hr.continent.west.alliance.sa_hai_bo_minh",name:"Sa Hải Bộ Minh",archetype:FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE,continentIds:['west'],alignment:"trung lập",tags:["bộ tộc", "sa hải"]})
]);
