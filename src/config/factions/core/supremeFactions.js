import { createFactionDefinition } from './factionDefinitions.js';
import { FACTION_ARCHETYPES, FACTION_SCOPES, FACTION_POWER_TIERS, FACTION_VISIBILITY } from './factionConstants.js';

const S = FACTION_SCOPES.HUMAN_REALM;
const T = FACTION_POWER_TIERS.SUPREME;

const raw = [
  ['faction.hr.supreme.sect.cuu_thien_thanh_dia','Cửu Thiên Thánh Địa',FACTION_ARCHETYPES.SECT,['central'],'chính đạo',['thánh pháp','tu luyện']],
  ['faction.hr.supreme.academy.thai_nhat_dao_cung','Thái Nhất Đạo Cung',FACTION_ARCHETYPES.ACADEMY,['central'],'chính đạo',['đạo pháp','nghiên cứu']],
  ['faction.hr.supreme.dynasty.hao_thien_than_trieu','Hạo Thiên Thần Triều',FACTION_ARCHETYPES.DYNASTY,['central'],'trung lập/chính thống',['chính trị','quân sự']],
  ['faction.hr.supreme.clan.tu_vi_co_toc','Tử Vi Cổ Tộc',FACTION_ARCHETYPES.ANCIENT_CLAN,['central'],'trung lập',['tinh tượng','huyết mạch']],
  ['faction.hr.supreme.alliance.dong_huyen_kiem_minh','Đông Huyền Kiếm Minh',FACTION_ARCHETYPES.SECT,['east'],'chính đạo',['kiếm đạo','liên minh']],
  ['faction.hr.supreme.nonhuman.long_uyen_long_toc','Long Uyên Long Tộc',FACTION_ARCHETYPES.NON_HUMAN_FACTION,['east'],'trung lập',['long mạch','thủy vực']],
  ['faction.hr.supreme.nonhuman.bac_minh_long_cung','Bắc Minh Long Cung',FACTION_ARCHETYPES.NON_HUMAN_FACTION,['north'],'trung lập',['băng hải','thủy phủ']],
  ['faction.hr.supreme.clan.cuc_han_co_toc','Cực Hàn Cổ Tộc',FACTION_ARCHETYPES.ANCIENT_CLAN,['north'],'trung lập',['hàn huyết','băng pháp']],
  ['faction.hr.supreme.clan.hoang_co_than_toc','Hoang Cổ Thần Tộc',FACTION_ARCHETYPES.ANCIENT_CLAN,['west'],'trung lập',['cổ huyết','thể tu']],
  ['faction.hr.supreme.alliance.vo_tan_sa_hai_minh','Vô Tận Sa Hải Minh',FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE,['west'],'trung lập',['sa hải','thương lộ']],
  ['faction.hr.supreme.merchant.van_bao_thuong_minh','Vạn Bảo Thương Minh',FACTION_ARCHETYPES.MERCHANT_GUILD,['south','east','west','north','central'],'trung lập',['kinh tế','đấu giá']],
  ['faction.hr.supreme.intel.thien_co_cac','Thiên Cơ Các',FACTION_ARCHETYPES.ACADEMY,['south','east','west','north','central'],'trung lập',['tình báo','bảng xếp hạng']],
  ['faction.hr.supreme.profession.dan_minh','Đan Minh',FACTION_ARCHETYPES.PROFESSION_GUILD,['south','east','west','north','central'],'trung lập',['đan đạo','linh dược']],
  ['faction.hr.supreme.profession.thien_cong_khi_minh','Thiên Công Khí Minh',FACTION_ARCHETYPES.PROFESSION_GUILD,['south','east','west','north','central'],'trung lập',['luyện khí','pháp bảo']],
  ['faction.hr.supreme.profession.phu_tran_tong_hoi','Phù Trận Tổng Hội',FACTION_ARCHETYPES.PROFESSION_GUILD,['south','east','west','north','central'],'trung lập',['phù lục','trận pháp']],
  ['faction.hr.supreme.infrastructure.truyen_tong_dien','Truyền Tống Điện',FACTION_ARCHETYPES.PROFESSION_GUILD,['south','east','west','north','central'],'trung lập',['truyền tống','hạ tầng']],
  ['faction.hr.supreme.alliance.tan_tu_minh','Tán Tu Minh',FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE,['south','east','west','north','central'],'trung lập',['tán tu','commission']],
  ['faction.hr.supreme.academy.van_phap_hoc_cung','Vạn Pháp Học Cung',FACTION_ARCHETYPES.ACADEMY,['central'],'trung lập',['học thuật','công pháp']],
  ['faction.hr.supreme.demonic.ma_uyen_thanh_dien','Ma Uyên Thánh Điện',FACTION_ARCHETYPES.DEMONIC_FACTION,['south','east','west','north','central'],'ma đạo',['ma đạo','xâm nhập']],
  ['faction.hr.supreme.underworld.hac_thien_hoi','Hắc Thiên Hội',FACTION_ARCHETYPES.UNDERWORLD,['south','east','west','north','central'],'trung lập/ngầm',['hắc thị','sát thủ']],
  ['faction.hr.supreme.dynasty.dai_can_thien_trieu','Đại Càn Thiên Triều',FACTION_ARCHETYPES.DYNASTY,['central','east'],'chính thống',['chính trị','thương lộ']],
  ['faction.hr.supreme.sect.huyen_thien_dao_tong','Huyền Thiên Đạo Tông',FACTION_ARCHETYPES.SECT,['south','central'],'chính đạo',['đạo pháp','trận pháp']],
  ['faction.hr.supreme.nonhuman.van_yeu_than_dinh','Vạn Yêu Thần Đình',FACTION_ARCHETYPES.NON_HUMAN_FACTION,['south','west','north'],'trung lập/đối kháng',['yêu tộc','thú triều']],
  ['faction.hr.supreme.merchant.thien_ha_thuong_lien','Thiên Hà Thương Liên',FACTION_ARCHETYPES.MERCHANT_GUILD,['east','central'],'trung lập',['hải vận','liên lục địa']]
];

export const SUPREME_FACTIONS = Object.freeze(raw.map(([id,name,archetype,continents,alignment,tags]) => createFactionDefinition({
  id, name, archetype, scope: S, powerTier: T, continentIds: continents, alignment, tags,
  visibility: archetype === FACTION_ARCHETYPES.UNDERWORLD || archetype === FACTION_ARCHETYPES.DEMONIC_FACTION ? FACTION_VISIBILITY.HIDDEN : FACTION_VISIBILITY.PUBLIC,
  dna: {
    culture: tags[0], doctrine: tags[0],
    economicModel: tags.includes('kinh tế') || archetype === FACTION_ARCHETYPES.MERCHANT_GUILD ? 'trade' : undefined,
    secrecy: archetype === FACTION_ARCHETYPES.UNDERWORLD ? 0.95 : archetype === FACTION_ARCHETYPES.DEMONIC_FACTION ? 0.8 : 0.25
  },
  basePower: { cultivation: 85, military: 80, economic: 70, political: 70, intelligence: 60, infrastructure: 60, prestige: 90 }
})));
