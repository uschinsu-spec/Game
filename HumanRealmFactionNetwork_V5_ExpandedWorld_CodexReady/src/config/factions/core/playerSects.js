import { createFactionDefinition } from './factionDefinitions.js';
import { FACTION_ARCHETYPES, FACTION_SCOPES, FACTION_POWER_TIERS, CANONICAL_PLAYER_SECT_IDS } from './factionConstants.js';
import { createSectStructure } from '../archetypes/sectStructure.js';

export const PLAYER_SECT_RANKS = Object.freeze([
  { id:0,key:'za_yi',name:'Tạp Dịch',reqContrib:0,salaryGold:50,salaryHerb:2,salaryOre:1 },
  { id:1,key:'outer',name:'Đệ Tử Ngoại Môn',reqContrib:100,salaryGold:100,salaryHerb:5,salaryOre:2 },
  { id:2,key:'inner',name:'Đệ Tử Nội Môn',reqContrib:350,salaryGold:300,salaryHerb:15,salaryOre:6 },
  { id:3,key:'true',name:'Đệ Tử Chân Truyền',reqContrib:900,salaryGold:800,salaryHerb:35,salaryOre:15 },
  { id:4,key:'steward',name:'Chấp Sự',reqContrib:1800,salaryGold:1500,salaryHerb:60,salaryOre:25 },
  { id:5,key:'elder',name:'Trưởng Lão',reqContrib:3500,salaryGold:3000,salaryHerb:120,salaryOre:50 },
  { id:6,key:'hall_master',name:'Điện Chủ',reqContrib:6500,salaryGold:5000,salaryHerb:180,salaryOre:75 },
  { id:7,key:'grand_elder',name:'Thái Thượng Trưởng Lão',reqContrib:10000,salaryGold:8000,salaryHerb:300,salaryOre:120 },
  { id:8,key:'sect_master',name:'Tông Chủ',reqContrib:18000,salaryGold:15000,salaryHerb:500,salaryOre:200 }
]);

export const PLAYER_SECT_CATALOG = Object.freeze([
 {id:'van_kiem_tong',elem:'Kiếm',name:'Vạn Kiếm Tông',title:'Kiếm Đạo Chí Tôn',desc:'Kiếm đạo đại tông, lấy kiếm ý, kiếm trận và ngự kiếm làm căn cơ.',buffDesc:'+15% Sát Thương Kiếm Thuật, +5% Bạo Kích',bonusDmgMul:1.15,critBonus:5,icon:'skill_0',doctrine:'Kiếm đạo',signature:['Vạn Kiếm Quy Tông','Kiếm Trận','Ngự Kiếm'],departments:['Kiếm Các','Chấp Kiếm Điện','Kiếm Trận Viện']},
 {id:'thai_bach_tong',elem:'Kim',name:'Thái Bạch Kim Tông',title:'Canh Kim Linh Pháp',desc:'Kim hệ đại tông, chuyên Canh Kim sát phạt, kim giáp và luyện khí chiến binh.',buffDesc:'+15% Sát Thương Hệ Kim, +10% Giáp Hộ Thể',bonusDmgMul:1.15,defBonus:10,icon:'skill_2',doctrine:'Canh Kim',signature:['Kim Cương Hộ Thể','Canh Kim Kiếm Khí'],departments:['Canh Kim Điện','Kim Khí Viện','Luyện Khí Đường']},
 {id:'liet_diem_cung',elem:'Hỏa',name:'Liệt Diễm Thần Cung',title:'Hỏa Pháp Phần Thiên',desc:'Hỏa đạo chiến tông nắm chân hỏa, hỏa trận và thuật thiêu đốt.',buffDesc:'+15% Sát Thương Hệ Hỏa, Thiêu đốt giảm 10% Giáp',bonusDmgMul:1.15,burnBonus:10,icon:'skill_3',doctrine:'Hỏa pháp',signature:['Phần Thiên Chân Hỏa','Hỏa Vực'],departments:['Chân Hỏa Điện','Hỏa Trận Viện','Đan Hỏa Phòng']},
 {id:'bang_phach_cac',elem:'Thủy',name:'Băng Phách Tiên Các',title:'Băng Tuyết U Hàn',desc:'Thủy-băng đại tông, kiểm soát hàn khí, thủy vực và phòng ngự băng phách.',buffDesc:'+15% Sát Thương Hệ Thủy, +10% Hộ Thể Chân Khí',bonusDmgMul:1.15,defBonus:10,icon:'skill_4',doctrine:'Băng Thủy',signature:['Băng Phách Hộ Thể','Hàn Vực'],departments:['Băng Tâm Các','Hàn Tuyền Viện','Thủy Pháp Điện']},
 {id:'hau_tho_mon',elem:'Thổ',name:'Hậu Thổ Huyền Tông',title:'Bàn Thạch Bất Diệt',desc:'Thổ hệ đại tông, nắm địa mạch, trận địa và phòng ngự trọng giáp.',buffDesc:'+25% Sinh Mệnh Tối Đa, +20% Giáp Hộ Thể',hpBonus:25,defBonus:20,icon:'skill_8',doctrine:'Hậu Thổ',signature:['Địa Mạch Hộ Thể','Bàn Thạch Pháp'],departments:['Địa Mạch Điện','Hộ Sơn Viện','Trận Thổ Đường']},
 {id:'thanh_moc_cac',elem:'Mộc',name:'Thanh Mộc Dược Các',title:'Trường Sinh Linh Dược',desc:'Mộc hệ đại tông kết hợp sinh cơ, luyện đan, linh điền và trị liệu.',buffDesc:'+20% Hiệu Quả Đan Dược & Hồi Máu, +30% Linh Thảo Dược Điền',healBonus:20,herbBonus:30,icon:'skill_7',doctrine:'Mộc Sinh',signature:['Thanh Mộc Sinh Cơ','Linh Dược'],departments:['Dược Vương Điện','Linh Điền Viện','Đan Các']},
 {id:'phong_loi_cac',elem:'Phong',name:'Thiên Phong Thần Tông',title:'Ngự Phong Thần Hành',desc:'Phong hệ thân pháp đại tông, nổi danh tốc độ, phi hành và trinh sát.',buffDesc:'+25% Tốc Độ Xuất Chiêu, +15% Tỷ Lệ Né Tránh',spdBonus:25,dodgeBonus:15,icon:'skill_5',doctrine:'Phong đạo',signature:['Thiên Phong Bộ','Ngự Phong'],departments:['Thiên Phong Điện','Phi Hành Viện','Tuần Phong Đường']},
 {id:'cuu_tieu_loi_dien',elem:'Lôi',name:'Cửu Tiêu Lôi Điện',title:'Thiên Kiếp Thần Lôi',desc:'Lôi đạo chiến tông, nắm thiên lôi, lôi trận và thuật trấn ma.',buffDesc:'+20% Sát Thương Hệ Lôi, Sét giáng gây tê liệt',bonusDmgMul:1.20,paralyzeBonus:10,icon:'skill_1',doctrine:'Lôi pháp',signature:['Cửu Tiêu Thần Lôi','Lôi Trận'],departments:['Thiên Lôi Điện','Lôi Trạch Viện','Trấn Ma Đường']},
 {id:'thanh_the_tong',elem:'Vật Lý',name:'Cửu Chuyển Thánh Thể Tông',title:'Nhục Thân Thành Thánh',desc:'Thể tu đại tông, luyện thể, cận chiến và kháng sát thương.',buffDesc:'+20% Công Kích Vật Lý, +15% Kháng Sát Thương',bonusDmgMul:1.20,dmgReduct:15,icon:'skill_9',doctrine:'Thể tu',signature:['Cửu Chuyển Thánh Thể','Phá Sơn Quyền'],departments:['Luyện Thể Điện','Chiến Thể Viện','Huyết Khí Đường']}
]);

const INFLUENCE = Object.freeze({
 van_kiem_tong:['south','east','central'], thai_bach_tong:['south','central'], liet_diem_cung:['south','west','central'],
 bang_phach_cac:['south','north','central'], hau_tho_mon:['south','west'], thanh_moc_cac:['south','central'],
 phong_loi_cac:['south','east','central'], cuu_tieu_loi_dien:['south','east','central'], thanh_the_tong:['south','west','central']
});

export const PLAYER_SECT_FACTIONS = Object.freeze(PLAYER_SECT_CATALOG.map((sect,index)=>createFactionDefinition({
  id:sect.id,name:sect.name,archetype:FACTION_ARCHETYPES.SECT,scope:FACTION_SCOPES.PRIMARY_REGION,
  powerTier:FACTION_POWER_TIERS.MAJOR,continentIds:INFLUENCE[sect.id]||['south'],alignment:'chính đạo',
  tags:['player_joinable','canonical_v5_player_sect',`element:${sect.elem}`],
  dna:{culture:'cultivation',doctrine:sect.doctrine,elements:[sect.elem],recruitmentPolicy:'talent_based',loyaltyCulture:.82,expansionism:.45+(index%3)*.08,riskTolerance:.35+(index%4)*.08,resourcePriority:sect.departments},
  basePower:{cultivation:74+(index%3)*3,military:66+(index%4)*3,economic:48+(index%5)*4,political:45,intelligence:40,infrastructure:55,prestige:74,resourceControl:52},
  meta:{canonicalPlayerSect:true,gameplaySectData:{...sect},ranks:PLAYER_SECT_RANKS,structure:createSectStructure({resourceFocus:sect.departments})}
})));

export const PLAYER_SECT_COMPAT_IDS = CANONICAL_PLAYER_SECT_IDS;
export function getPlayerSectFactionById(id){return PLAYER_SECT_FACTIONS.find(f=>f.id===id)||null;}
export function getPlayerSectGameplayData(id){return PLAYER_SECT_CATALOG.find(f=>f.id===id)||null;}
export function getPlayerSectRank(rankIdx){return PLAYER_SECT_RANKS[Math.max(0,Math.min(PLAYER_SECT_RANKS.length-1,Number(rankIdx)||0))];}
