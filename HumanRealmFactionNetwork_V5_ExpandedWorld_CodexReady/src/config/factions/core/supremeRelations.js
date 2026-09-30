import { createRelation } from '../network/factionDiplomacy.js';
import { RELATION_TYPES } from './factionConstants.js';

const R = [];
const add=(a,b,type,extra={})=>R.push(createRelation({a,b,type,...extra}));
add('faction.hr.supreme.sect.cuu_thien_thanh_dia','faction.hr.supreme.academy.thai_nhat_dao_cung',RELATION_TYPES.FRIENDLY,{trust:180,respect:260,grievance:45});
add('faction.hr.supreme.dynasty.hao_thien_than_trieu','faction.hr.supreme.clan.tu_vi_co_toc',RELATION_TYPES.MARRIAGE_ALLIANCE,{trust:220,respect:170,economicDependency:90});
add('faction.hr.supreme.merchant.van_bao_thuong_minh','faction.hr.supreme.intel.thien_co_cac',RELATION_TYPES.TRADE_PARTNER,{trust:160,economicDependency:260});
add('faction.hr.supreme.demonic.ma_uyen_thanh_dien','faction.hr.supreme.sect.cuu_thien_thanh_dia',RELATION_TYPES.HOSTILE,{grievance:650,fear:130});
add('faction.hr.supreme.underworld.hac_thien_hoi','faction.hr.supreme.demonic.ma_uyen_thanh_dien',RELATION_TYPES.NEUTRAL,{trust:-80,fear:90,economicDependency:70});
add('faction.hr.supreme.nonhuman.bac_minh_long_cung','faction.hr.supreme.clan.cuc_han_co_toc',RELATION_TYPES.RIVAL,{respect:180,grievance:120});
add('faction.hr.supreme.alliance.dong_huyen_kiem_minh','faction.hr.supreme.nonhuman.long_uyen_long_toc',RELATION_TYPES.NEUTRAL,{trust:40,respect:130});
add('faction.hr.supreme.clan.hoang_co_than_toc','faction.hr.supreme.alliance.vo_tan_sa_hai_minh',RELATION_TYPES.RIVAL,{respect:150,grievance:110,economicDependency:80});
export const SUPREME_RELATIONS=Object.freeze(R);
