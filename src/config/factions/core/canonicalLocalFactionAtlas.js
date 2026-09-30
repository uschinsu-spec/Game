import { createFactionDefinition } from './factionDefinitions.js?v=20260930-canonical-local-v2';
import { stableFactionId } from './factionIds.js';
import {
  FACTION_ARCHETYPES,
  FACTION_DATA_LEVELS,
  FACTION_POWER_TIERS,
  FACTION_SCOPES,
  FACTION_VISIBILITY,
  MAX_REALM_INDEX
} from './factionConstants.js';
import { createBranch } from '../network/factionBranches.js?v=20260930-canonical-local-v1';
import { createSectStructure } from '../archetypes/sectStructure.js';
import { createFamilyStructure } from '../archetypes/familyStructure.js';

export const CANONICAL_LOCAL_FACTION_ATLAS_VERSION = '20260930-canonical-local-factions-v2-complete';

const SURNAMES = Object.freeze(['Lâm','Tần','Tô','Mộ Dung','Diệp','Hàn','Lạc','Bạch','Cố','Tiêu','Sở','Ninh','Thẩm','Vân','Tạ','Đường']);
const GIVEN_NAMES = Object.freeze(['Huyền Chân','Thanh Hà','Trường Phong','Tử Mặc','Lăng Tiêu','Vô Trần','Nguyệt Dao','Thiên Vũ','Nhược Thủy','Cảnh Hành','Hạo Nhiên','Băng Tâm']);
const REGION_SECT_SUFFIX = Object.freeze(['Đạo Tông','Huyền Tông','Chân Cung','Thiên Các','Thần Điện','Kiếm Tông']);
const MEDIUM_SECT_SUFFIX = Object.freeze(['Huyền Môn','Linh Tông','Kiếm Các','Đạo Viện','Sơn Trang','Chân Phái']);
const MINOR_SECT_SUFFIX = Object.freeze(['Linh Sơn Môn','Thanh Vân Các','Tụ Linh Phái','Huyền Phong Môn','Bạch Vân Quán','Tiểu Huyền Tông']);
const MOTTO_SECT = Object.freeze(['Đạo tâm như nhất, kiếm ý thông huyền','Hộ đạo thủ tâm, truyền thừa bất tuyệt','Tu thân luyện pháp, vấn đạo trường sinh','Lấy chính khí lập môn, lấy thực lực hộ đạo']);
const MOTTO_FAMILY = Object.freeze(['Huyết mạch đồng tâm, gia tộc trường tồn','Kính tổ trọng đạo, thủ nghiệp khai cương','Dòng chính làm gốc, chi mạch đồng vinh','Gia pháp nghiêm minh, truyền thừa bất tuyệt']);
const TECHNIQUE_SUFFIX = Object.freeze(['Chân Kinh','Huyền Điển','Kiếm Quyết','Đạo Thư','Luyện Thể Pháp','Linh Quyển']);
const CONTINENT_FOCUS = Object.freeze({
  south:Object.freeze(['linh dược','linh điền','mộc pháp','thủy pháp']),
  east:Object.freeze(['kiếm đạo','lôi pháp','hải vận','phong pháp']),
  west:Object.freeze(['thể tu','hỏa pháp','sa hải','cổ thuật']),
  north:Object.freeze(['băng pháp','hàn kiếm','thủy pháp','phong ấn']),
  central:Object.freeze(['vạn pháp','trận pháp','đạo pháp','quân trận'])
});

function hash32(value){const s=String(value||'');let h=2166136261;for(let i=0;i<s.length;i+=1){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function pick(list,seed,offset=0){return list[(Number(seed)+offset)%list.length];}
function stripUnit(name){return String(name||'').replace(/\s+(Đại Vực|Huyền Vực|Hoang Vực|Hàn Thiên|Thánh Vực|Vực|Châu|Đạo|Lĩnh|Phủ|Quốc)$/u,'').trim()||String(name||'Linh');}
function clampPower(value){return Math.max(1,Math.min(100,Math.round(value)));}
function clampRealm(value){return Math.max(0,Math.min(MAX_REALM_INDEX,Math.round(value)));}
function basePower(tier,seed){const base=tier===FACTION_POWER_TIERS.MAJOR?62:tier===FACTION_POWER_TIERS.MEDIUM?48:34;return Object.freeze({cultivation:clampPower(base+(seed%9)),military:clampPower(base-3+((seed>>>3)%9)),economic:clampPower(base-7+((seed>>>5)%12)),political:clampPower(base-5+((seed>>>7)%10)),intelligence:clampPower(base-10+((seed>>>9)%12)),infrastructure:clampPower(base-6+((seed>>>11)%10)),prestige:clampPower(base+((seed>>>13)%8))});}
function tierBase(tier,major,medium,minor){return tier===FACTION_POWER_TIERS.MAJOR?major:tier===FACTION_POWER_TIERS.MEDIUM?medium:minor;}

function profilePopulation(tier,kind,seed){
  const scale=tierBase(tier,1,0.42,0.16);
  const familyMul=kind==='family'?0.58:1;
  const population=Math.round((3200+(seed%1100))*scale*familyMul);
  const cultivators=Math.max(18,Math.round(population*(kind==='family'?0.34:0.42)));
  return Object.freeze({
    population,cultivators,
    eliteCultivators:Math.max(3,Math.round(cultivators*0.12)),
    elders:Math.max(2,Math.round(cultivators*0.035)),
    topExperts:Math.max(1,Math.round(cultivators*0.008)),
    army:Math.round(population*(kind==='family'?0.16:0.1)),
    guards:Math.round(population*0.07),craftsmen:Math.round(population*0.055),administrators:Math.round(population*0.025),
    meta:{canonical:true}
  });
}

function profileCultivators(tier,seed,node){
  const territoryMin=Number(node?.enemyProfile?.minRealmIdx||0);
  const territoryMax=Number(node?.enemyProfile?.maxRealmIdx||territoryMin+5);
  const tierBonus=tier===FACTION_POWER_TIERS.MAJOR?6:tier===FACTION_POWER_TIERS.MEDIUM?3:1;
  const leaderRealmIdx=clampRealm(Math.max(territoryMin+3,territoryMax+tierBonus));
  const ancestorRealmIdx=clampRealm(leaderRealmIdx+(tier===FACTION_POWER_TIERS.MAJOR?2:1));
  const byRealm={};
  const base=tierBase(tier,420,150,55);
  for(let i=Math.max(0,territoryMin);i<=Math.min(leaderRealmIdx,territoryMin+5);i+=1){byRealm[i]=Math.max(1,Math.round(base/Math.pow(2,i-territoryMin+1)));}
  byRealm[leaderRealmIdx]=(byRealm[leaderRealmIdx]||0)+1+(seed%3);
  return Object.freeze({byRealm:Object.freeze(byRealm),leaderRealmIdx,ancestorRealmIdx});
}

function profileEconomy(tier,kind,seed){
  const base=tierBase(tier,180000,68000,18000);
  const familyTrade=kind==='family'?1.22:1;
  return Object.freeze({
    treasury:Math.round(base*(1.6+(seed%35)/100)),
    income:Math.round(base*0.13),upkeep:Math.round(base*0.055),taxIncome:Math.round(base*0.025),
    tradeIncome:Math.round(base*0.05*familyTrade),resourceIncome:Math.round(base*0.045),
    militaryExpense:Math.round(base*0.03),researchExpense:Math.round(base*(kind==='sect'?0.026:0.016)),constructionExpense:Math.round(base*0.018),debt:0
  });
}

function profileResources(tier,focus,seed){
  const base=tierBase(tier,9000,3400,1100);
  const bonus=(seed%21)/100;
  const hasHerb=focus.some(x=>/dược|điền|mộc/i.test(x));
  const hasOre=focus.some(x=>/kiếm|kim|khoáng|thể/i.test(x));
  const hasFormation=focus.some(x=>/trận|phong ấn|đạo pháp/i.test(x));
  return Object.freeze({
    spiritStone:Math.round(base*(1.2+bonus)),herbs:Math.round(base*(hasHerb?0.78:0.38)),ores:Math.round(base*(hasOre?0.72:0.36)),
    monsterMaterials:Math.round(base*0.28),formationMaterials:Math.round(base*(hasFormation?0.6:0.3)),pillIngredients:Math.round(base*(hasHerb?0.62:0.32)),
    weaponMaterials:Math.round(base*(hasOre?0.6:0.31)),rareTreasures:Math.max(3,Math.round(base*0.012))
  });
}

function profileLaw(kind,tier){
  return Object.freeze({
    murderPenalty:tier===FACTION_POWER_TIERS.MAJOR?180:120,theftPenalty:kind==='family'?55:40,
    duelPolicy:kind==='sect'?'licensed':'family_arbitration',sectConflictPolicy:'restricted',
    contraband:Object.freeze(['tà vật cấm','độc vật vô danh']),taxRate:kind==='family'?0.06:0.04,
    cityWeaponPolicy:'allowed_but_restricted',wantedRules:Object.freeze({hostileAt:60,killOnSightAt:90})
  });
}

function detailMeta({node,region,kind,rankLabel,focus,seatName,branchPolicy,seed,foundingAge,leaderName,signatureTechnique,motto}){
  return Object.freeze({
    canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,mapNodeId:node.id,mapMarkerKind:'headquarters',rankLabel,seatName,kind,
    focus:Object.freeze([...focus]),branchPolicy,recruitmentPolicy:kind==='sect'?'linh căn + khảo hạch + công huân':'huyết mạch + hôn minh + khách khanh',
    leaderTitle:kind==='sect'?'Tông Chủ':'Gia Chủ',elderTitle:kind==='sect'?'Trưởng Lão':'Tộc Lão',leaderName,signatureTechnique,motto,
    foundingAge,territoryName:node.name,primaryRegionId:region?.id||null,
    description:kind==='sect'
      ? `${rankLabel} cố định tại ${node.name}; có sơn môn, trưởng lão hội, ngoại môn, nội môn, chân truyền, chấp pháp và hệ phân chi. Truyền thừa chủ đạo: ${signatureTechnique}.`
      : `${rankLabel} cố định tại ${node.name}; có tổ địa, chủ mạch, chi phòng, tộc lão, khách khanh và hệ phân gia/chi tộc. Gia truyền chủ đạo: ${signatureTechnique}.`,
    seed
  });
}

function organizationFor(kind,focus,seed){
  if(kind==='sect')return createSectStructure({resourceFocus:[...focus, ...focus, ...focus]});
  return createFamilyStructure({mainLine:'Chủ Mạch',branches:['Đông Chi','Tây Chi','Ngoại Chi'],bloodlinePurity:55+(seed%36),marriagePolicy:'strategic'});
}

function definition({node,region,archetype,powerTier,name,slug,kind,rankLabel,focus,branchPolicy,seed}){
  const base=stripUnit(node.name);
  const leaderSurname=kind==='family'?(SURNAMES.find(surname=>name.includes(surname))||pick(SURNAMES,seed)):pick(SURNAMES,seed,5);
  const leaderName=`${leaderSurname} ${pick(GIVEN_NAMES,seed,2)}`;
  const signatureTechnique=`${base} ${pick(TECHNIQUE_SUFFIX,seed,1)}`;
  const motto=kind==='sect'?pick(MOTTO_SECT,seed):pick(MOTTO_FAMILY,seed);
  const seatName=`${base} ${kind==='sect'?'Sơn Môn':'Tổ Địa'}`;
  return createFactionDefinition({
    id:stableFactionId({scope:node.type==='great_region'?'primary_region':'secondary_territory',archetype:kind,territoryId:node.id,slug}),
    name,archetype,scope:node.type==='great_region'?FACTION_SCOPES.PRIMARY_REGION:FACTION_SCOPES.SECONDARY_TERRITORY,powerTier,
    continentIds:[node.continentKey||region?.continentKey||'south'],homeTerritoryId:node.id,homePrimaryRegionId:region?.id||node.id,
    alignment:'trung lập',basePower:basePower(powerTier,seed),visibility:FACTION_VISIBILITY.PUBLIC,dataLevel:FACTION_DATA_LEVELS.CORE,
    tags:[kind,rankLabel,...focus],goals:['Defend','Recruit','BuildBranch','Trade','AcquireResource'],
    population:profilePopulation(powerTier,kind,seed),cultivators:profileCultivators(powerTier,seed,node),economy:profileEconomy(powerTier,kind,seed),
    resources:profileResources(powerTier,focus,seed),law:profileLaw(kind,powerTier),organization:organizationFor(kind,focus,seed),
    doctrine:{motto,signatureTechnique,focus:Object.freeze([...focus])},
    recruitment:{policy:kind==='sect'?'exam_and_merit':'bloodline_guest_elder',entryRealmMin:Math.max(0,Number(node?.enemyProfile?.minRealmIdx||0)),acceptsOutsiders:kind==='sect'||powerTier!==FACTION_POWER_TIERS.MAJOR},
    headquarters:{worldNodeId:node.id,name:seatName,type:kind==='sect'?'sect_headquarters':'family_estate',defenseTier:powerTier},
    meta:detailMeta({node,region,kind,rankLabel,focus,seatName,branchPolicy,seed,foundingAge:180+(seed%1320),leaderName,signatureTechnique,motto})
  });
}

function addIndex(map,key,value){if(!key)return;if(!map.has(key))map.set(key,[]);map.get(key).push(value);}
function firstChildren(worldAdapter,parentId,type,limit=5){return worldAdapter?.getChildren?.(parentId,{types:[type],offset:0,limit})||[];}
function regionFor(worldAdapter,territory){return worldAdapter?.getAncestors?.(territory.id,true)?.find?.(node=>node.type==='great_region')||null;}
function markerForFaction(faction){return Object.freeze({id:`marker:${faction.id}`,markerType:'FACTION_HQ',factionId:faction.id,branchId:null,worldNodeId:faction.meta?.mapNodeId||faction.homeTerritoryId,territoryId:faction.homeTerritoryId,label:faction.name,archetype:faction.archetype,powerTier:faction.powerTier,branchType:null,subLabel:faction.archetype===FACTION_ARCHETYPES.SECT?'TÔNG MÔN':'GIA TỘC',rankLabel:faction.meta?.rankLabel||faction.powerTier,seatName:faction.meta?.seatName||null});}
function markerForBranch(branch,parentFaction){return Object.freeze({id:`marker:${branch.id}`,markerType:'FACTION_BRANCH',factionId:branch.parentFactionId,branchId:branch.id,worldNodeId:branch.mapNodeId||branch.territoryId,territoryId:branch.territoryId,label:branch.displayName||parentFaction?.name||branch.id,archetype:parentFaction?.archetype||null,powerTier:parentFaction?.powerTier||null,branchType:branch.branchType,subLabel:branch.markerLabel||branch.branchType,rankLabel:branch.markerLabel||branch.branchType,seatName:branch.meta?.seatName||null});}
function makeBranch({parent,territory,node,type,label,nameSuffix,authority,parentRank,role}){
  const hostBase=stripUnit(node?.name||territory.name);
  return createBranch({
    parentFactionId:parent.id,territoryId:territory.id,mapNodeId:node?.id||territory.id,branchType:type,
    displayName:`${parent.name} · ${hostBase} ${nameSuffix}`,markerLabel:label,authority,
    meta:{canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,parentRank,hostJurisdictionId:node?.id||territory.id,seatName:`${hostBase} ${nameSuffix}`,role}
  });
}

export function createCanonicalLocalFactionAtlas({worldAdapter}={}){
  const factions=[];const branches=[];const byJurisdiction=new Map();const byTerritoryBranches=new Map();const markersByTerritory=new Map();const factionById=new Map();
  const territories=worldAdapter?.getAllTerritories?.()||[];const regionById=new Map();
  for(const territory of territories){const region=regionFor(worldAdapter,territory);if(region)regionById.set(region.id,region);}
  const regionPairById=new Map();

  for(const region of regionById.values()){
    const seed=hash32(region.id);const base=stripUnit(region.name);const focus=CONTINENT_FOCUS[region.continentKey]||CONTINENT_FOCUS.south;const surname=pick(SURNAMES,seed,3);
    const sect=definition({node:region,region,archetype:FACTION_ARCHETYPES.SECT,powerTier:FACTION_POWER_TIERS.MAJOR,name:`${base} ${pick(REGION_SECT_SUFFIX,seed)}`,slug:'regional_sect',kind:'sect',rankLabel:'Đại Tông cấp Vùng',focus:[pick(focus,seed),pick(focus,seed,1)],branchPolicy:'mỗi lãnh thổ trực thuộc có Phân Tông',seed});
    const clan=definition({node:region,region,archetype:FACTION_ARCHETYPES.CULTIVATION_FAMILY,powerTier:FACTION_POWER_TIERS.MAJOR,name:`${base} ${surname} Thế Gia`,slug:'regional_clan',kind:'family',rankLabel:'Đại Gia Tộc cấp Vùng',focus:[pick(focus,seed,2),'huyết mạch'],branchPolicy:'mỗi lãnh thổ trực thuộc có Phân Gia',seed:seed+17});
    for(const f of [sect,clan]){factions.push(f);factionById.set(f.id,f);addIndex(byJurisdiction,region.id,f);}
    regionPairById.set(region.id,{sect,clan});
  }

  for(const territory of territories){
    const region=regionFor(worldAdapter,territory);const seed=hash32(territory.id);const base=stripUnit(territory.name);const focus=CONTINENT_FOCUS[territory.continentKey]||CONTINENT_FOCUS.south;const surnameA=pick(SURNAMES,seed,1);let surnameB=pick(SURNAMES,seed,7);if(surnameB===surnameA)surnameB=pick(SURNAMES,seed,9);
    const mediumSect=definition({node:territory,region,archetype:FACTION_ARCHETYPES.SECT,powerTier:FACTION_POWER_TIERS.MEDIUM,name:`${base} ${pick(MEDIUM_SECT_SUFFIX,seed)}`,slug:'medium_sect',kind:'sect',rankLabel:'Trung Tông',focus:[pick(focus,seed),pick(focus,seed,2)],branchPolicy:'có Phân Đường tại quốc trực thuộc',seed});
    const mediumFamily=definition({node:territory,region,archetype:FACTION_ARCHETYPES.CULTIVATION_FAMILY,powerTier:FACTION_POWER_TIERS.MEDIUM,name:`${base} ${surnameA} Gia`,slug:'medium_family',kind:'family',rankLabel:'Trung Gia Tộc',focus:[pick(focus,seed,1),'thương lộ'],branchPolicy:'có Chi Tộc tại quốc trực thuộc',seed:seed+23});
    const minorSect=definition({node:territory,region,archetype:FACTION_ARCHETYPES.SECT,powerTier:FACTION_POWER_TIERS.MINOR,name:`${base} ${pick(MINOR_SECT_SUFFIX,seed)}`,slug:'minor_sect',kind:'sect',rankLabel:'Tiểu Tông',focus:[pick(focus,seed,3)],branchPolicy:'có Ngoại Viện địa phương; muốn mở rộng phải thăng cấp',seed:seed+41});
    const minorFamily=definition({node:territory,region,archetype:FACTION_ARCHETYPES.CULTIVATION_FAMILY,powerTier:FACTION_POWER_TIERS.MINOR,name:`${base} ${surnameB} Thị`,slug:'minor_family',kind:'family',rankLabel:'Tiểu Gia Tộc',focus:[pick(focus,seed,2),'địa phương'],branchPolicy:'có một Chi Phòng ngoài tổ địa',seed:seed+59});
    for(const faction of [mediumSect,mediumFamily,minorSect,minorFamily]){factions.push(faction);factionById.set(faction.id,faction);addIndex(byJurisdiction,territory.id,faction);addIndex(markersByTerritory,territory.id,markerForFaction(faction));}

    const regional=regionPairById.get(region?.id);
    if(regional){
      const regionBranches=[
        makeBranch({parent:regional.sect,territory,node:territory,type:'phan_tong',label:'PHÂN TÔNG',nameSuffix:'Phân Tông',authority:.78,parentRank:'Đại Tông cấp Vùng',role:'đại diện truyền thừa cấp vùng'}),
        makeBranch({parent:regional.clan,territory,node:territory,type:'phan_gia',label:'PHÂN GIA',nameSuffix:'Phân Gia',authority:.72,parentRank:'Đại Gia Tộc cấp Vùng',role:'quản lý chi sản và huyết mạch địa phương'})
      ];
      for(const branch of regionBranches){branches.push(branch);addIndex(byTerritoryBranches,territory.id,branch);addIndex(markersByTerritory,territory.id,markerForBranch(branch,factionById.get(branch.parentFactionId)));}
    }

    const nations=firstChildren(worldAdapter,territory.id,'nation',5);
    const hosts=[nations[0]||territory,nations[1]||nations[0]||territory,nations[2]||nations[0]||territory,nations[3]||nations[1]||territory];
    const localBranches=[
      makeBranch({parent:mediumSect,territory,node:hosts[0],type:'phan_duong',label:'PHÂN ĐƯỜNG',nameSuffix:'Phân Đường',authority:.60,parentRank:'Trung Tông',role:'tuyển đệ tử, truyền công và nhiệm vụ'}),
      makeBranch({parent:mediumFamily,territory,node:hosts[1],type:'chi_toc',label:'CHI TỘC',nameSuffix:'Chi Tộc',authority:.55,parentRank:'Trung Gia Tộc',role:'chi huyết mạch và thương lộ'}),
      makeBranch({parent:minorSect,territory,node:hosts[2],type:'ngoai_vien',label:'NGOẠI VIỆN',nameSuffix:'Ngoại Viện',authority:.42,parentRank:'Tiểu Tông',role:'thu nhận tạp dịch, ngoại môn và tài nguyên'}),
      makeBranch({parent:minorFamily,territory,node:hosts[3],type:'chi_phong',label:'CHI PHÒNG',nameSuffix:'Chi Phòng',authority:.38,parentRank:'Tiểu Gia Tộc',role:'chi phòng cư trú và kinh doanh địa phương'})
    ];
    for(const branch of localBranches){branches.push(branch);addIndex(byTerritoryBranches,territory.id,branch);addIndex(markersByTerritory,territory.id,markerForBranch(branch,factionById.get(branch.parentFactionId)));}
  }

  for(const regionFaction of regionPairById.values()){
    addIndex(markersByTerritory,regionFaction.sect.homeTerritoryId,markerForFaction(regionFaction.sect));
    addIndex(markersByTerritory,regionFaction.clan.homeTerritoryId,markerForFaction(regionFaction.clan));
  }

  const frozenFactions=Object.freeze(factions);const frozenBranches=Object.freeze(branches);
  return Object.freeze({
    version:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,factions:frozenFactions,branches:frozenBranches,
    stats:Object.freeze({regions:regionById.size,territories:territories.length,factions:factions.length,branches:branches.length,branchesPerTerritory:territories.length?branches.length/territories.length:0}),
    getFactionById:id=>factionById.get(id)||null,
    getFactionsForJurisdiction:id=>Object.freeze([...(byJurisdiction.get(id)||[])]),
    getBranchesForTerritory:id=>Object.freeze([...(byTerritoryBranches.get(id)||[])]),
    getMapMarkersForTerritory:id=>Object.freeze([...(markersByTerritory.get(id)||[])]),
    getMapMarkersForJurisdiction:id=>Object.freeze([...(markersByTerritory.get(id)||[])])
  });
}
