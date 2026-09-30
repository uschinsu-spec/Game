import { FACTION_ARCHETYPES } from './factionConstants.js';
import { continentPower } from './continentPowerFactory.js';

export const CENTRAL_CONTINENT_POWERS = Object.freeze([
  continentPower({id:"faction.hr.continent.central.sect.van_phap_than_dien",name:"Vạn Pháp Thần Điện",archetype:FACTION_ARCHETYPES.SECT,continentIds:['central'],alignment:"chính đạo",tags:["vạn pháp", "tu luyện"]}),
  continentPower({id:"faction.hr.continent.central.dynasty.thien_do_thanh_trieu",name:"Thiên Đô Thánh Triều",archetype:FACTION_ARCHETYPES.DYNASTY,continentIds:['central'],alignment:"chính thống",tags:["chính trị", "quân sự"]}),
  continentPower({id:"faction.hr.continent.central.clan.cuu_thien_co_toc",name:"Cửu Thiên Cổ Tộc",archetype:FACTION_ARCHETYPES.ANCIENT_CLAN,continentIds:['central'],alignment:"trung lập",tags:["cổ huyết", "thánh vực"]}),
  continentPower({id:"faction.hr.continent.central.academy.thanh_linh_hoc_cung",name:"Thánh Linh Học Cung",archetype:FACTION_ARCHETYPES.ACADEMY,continentIds:['central'],alignment:"trung lập",tags:["học thuật", "đạo pháp"]}),
  continentPower({id:"faction.hr.continent.central.merchant.trung_vuc_thuong_lien",name:"Trung Vực Thương Liên",archetype:FACTION_ARCHETYPES.MERCHANT_GUILD,continentIds:['central'],alignment:"trung lập",tags:["kinh tế", "liên vực"]}),
  continentPower({id:"faction.hr.continent.central.sect.hao_thien_chien_dien",name:"Hạo Thiên Chiến Điện",archetype:FACTION_ARCHETYPES.SECT,continentIds:['central'],alignment:"chính thống",tags:["quân trận", "hộ vực"]})
]);
