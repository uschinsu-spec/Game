import { createBranch } from './factionBranches.js'; import { hash32 } from '../generation/factionGenerator.js'; import { FACTION_ARCHETYPES } from '../core/factionConstants.js';
const PLAYER_REGION_INFLUENCE=Object.freeze({van_kiem_tong:['dong_huyen','thanh_linh','trung_thien'],thai_bach_tong:['van_son','trung_thien','thanh_linh'],liet_diem_cung:['tay_hoang','van_son','trung_thien'],bang_phach_cac:['bac_han','thuong_hai','trung_thien'],hau_tho_mon:['van_son','tay_hoang','thanh_linh'],thanh_moc_cac:['thanh_linh','nam_hoang','trung_thien'],phong_loi_cac:['thuong_hai','dong_huyen','trung_thien'],cuu_tieu_loi_dien:['trung_thien','dong_huyen','thuong_hai'],thanh_the_tong:['nam_hoang','tay_hoang','van_son']});
const ALWAYS_BRANCH_IDS=new Set(['faction.hr.supreme.merchant.van_bao_thuong_minh','faction.hr.supreme.intel.thien_co_cac','faction.hr.supreme.profession.dan_minh','faction.hr.supreme.profession.thien_cong_khi_minh','faction.hr.supreme.profession.phu_tran_tong_hoi','faction.hr.supreme.infrastructure.truyen_tong_dien']);
export function shouldHaveBranch(faction,territory,worldSeed='default'){
 if(!faction||!territory||!faction.continentIds?.includes(territory.continentKey))return false;
 if(faction.homeTerritoryId===territory.id)return true;
 if(ALWAYS_BRANCH_IDS.has(faction.id))return true;
 if(PLAYER_REGION_INFLUENCE[faction.id])return territory.continentKey!=='south'||PLAYER_REGION_INFLUENCE[faction.id].includes(territory.regionKey);
 if(faction.scope==='CONTINENT')return (hash32(`${worldSeed}:${faction.id}:${territory.id}:branch`)%100)<42;
 if(faction.scope==='HUMAN_REALM')return (hash32(`${worldSeed}:${faction.id}:${territory.id}:branch`)%100)<18;
 return false;
}
export function planBranchesForTerritory({territory,coreFactions=[],worldSeed='default'}={}){if(!territory)return Object.freeze([]);const out=[];for(const f of coreFactions){if(!shouldHaveBranch(f,territory,worldSeed))continue;const type=f.archetype===FACTION_ARCHETYPES.MERCHANT_GUILD?'chi_hội':f.archetype===FACTION_ARCHETYPES.PROFESSION_GUILD?'phân_hội':f.archetype===FACTION_ARCHETYPES.ACADEMY?'phân_các':'phân_tông';out.push(createBranch({parentFactionId:f.id,territoryId:territory.id,branchType:type,authority:f.scope==='CONTINENT'?.8:.65,assets:[],meta:{generatedBaseline:true,territoryName:territory.name}}));}return Object.freeze(out);}
