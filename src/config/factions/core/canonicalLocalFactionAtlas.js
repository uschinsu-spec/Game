import { createFactionDefinition } from './factionDefinitions.js';
import { stableFactionId } from './factionIds.js';
import {
  FACTION_ARCHETYPES,
  FACTION_DATA_LEVELS,
  FACTION_POWER_TIERS,
  FACTION_SCOPES,
  FACTION_VISIBILITY
} from './factionConstants.js';
import { createBranch } from '../network/factionBranches.js?v=20260930-canonical-local-v1';

export const CANONICAL_LOCAL_FACTION_ATLAS_VERSION = '20260930-canonical-local-factions-v1';

const SURNAMES = Object.freeze(['Lâm','Tần','Tô','Mộ Dung','Diệp','Hàn','Lạc','Bạch','Cố','Tiêu','Sở','Ninh','Thẩm','Vân','Tạ','Đường']);
const REGION_SECT_SUFFIX = Object.freeze(['Đạo Tông','Huyền Tông','Chân Cung','Thiên Các','Thần Điện','Kiếm Tông']);
const MEDIUM_SECT_SUFFIX = Object.freeze(['Huyền Môn','Linh Tông','Kiếm Các','Đạo Viện','Sơn Trang','Chân Phái']);
const MINOR_SECT_SUFFIX = Object.freeze(['Linh Sơn Môn','Thanh Vân Các','Tụ Linh Phái','Huyền Phong Môn','Bạch Vân Quán','Tiểu Huyền Tông']);
const CONTINENT_FOCUS = Object.freeze({
  south:Object.freeze(['linh dược','linh điền','mộc pháp','thủy pháp']),
  east:Object.freeze(['kiếm đạo','lôi pháp','hải vận','phong pháp']),
  west:Object.freeze(['thể tu','hỏa pháp','sa hải','cổ thuật']),
  north:Object.freeze(['băng pháp','hàn kiếm','thủy pháp','phong ấn']),
  central:Object.freeze(['vạn pháp','trận pháp','đạo pháp','quân trận'])
});

function hash32(value){const s=String(value||'');let h=2166136261;for(let i=0;i<s.length;i+=1){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function pick(list,seed,offset=0){return list[(Number(seed)+offset)%list.length];}
function stripUnit(name){return String(name||'').replace(/\s+(Đại Vực|Huyền Vực|Hoang Vực|Hàn Thiên|Thánh Vực|Vực|Châu|Đạo|Lĩnh|Phủ)$/u,'').trim()||String(name||'Linh');}
function clampPower(value){return Math.max(1,Math.min(100,Math.round(value)));}
function basePower(tier,seed){const base=tier===FACTION_POWER_TIERS.MAJOR?62:tier===FACTION_POWER_TIERS.MEDIUM?48:34;return Object.freeze({cultivation:clampPower(base+(seed%9)),military:clampPower(base-3+((seed>>>3)%9)),economic:clampPower(base-7+((seed>>>5)%12)),political:clampPower(base-5+((seed>>>7)%10)),intelligence:clampPower(base-10+((seed>>>9)%12)),infrastructure:clampPower(base-6+((seed>>>11)%10)),prestige:clampPower(base+((seed>>>13)%8))});}
function detailMeta({node,region,kind,rankLabel,focus,seatName,branchPolicy,seed}){return Object.freeze({canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,mapNodeId:node.id,mapMarkerKind:'headquarters',rankLabel,seatName,kind,focus:Object.freeze([...focus]),branchPolicy,recruitmentPolicy:kind==='sect'?'linh căn + khảo hạch':'huyết mạch + khách khanh',leaderTitle:kind==='sect'?'Tông Chủ':'Gia Chủ',elderTitle:kind==='sect'?'Trưởng Lão':'Tộc Lão',territoryName:node.name,primaryRegionId:region?.id||null,description:kind==='sect'?`Tông môn cố định tại ${node.name}; có sơn môn, trưởng lão hội, đệ tử ngoại/nội môn và hệ phân tông.`:`Tu tiên gia tộc cố định tại ${node.name}; có chủ gia, tộc lão, dòng chính, chi tộc và hệ phân gia.`,seed});}
function definition({node,region,archetype,powerTier,name,slug,kind,rankLabel,focus,branchPolicy,seed}){return createFactionDefinition({
  id:stableFactionId({scope:node.type==='great_region'?'primary_region':'secondary_territory',archetype:kind,territoryId:node.id,slug}),
  name,archetype,scope:node.type==='great_region'?FACTION_SCOPES.PRIMARY_REGION:FACTION_SCOPES.SECONDARY_TERRITORY,powerTier,
  continentIds:[node.continentKey||region?.continentKey||'south'],homeTerritoryId:node.id,homePrimaryRegionId:region?.id||node.id,
  alignment:'trung lập',basePower:basePower(powerTier,seed),visibility:FACTION_VISIBILITY.PUBLIC,dataLevel:FACTION_DATA_LEVELS.CORE,
  tags:[kind,rankLabel,...focus],goals:['Defend','Recruit','BuildBranch'],
  meta:detailMeta({node,region,kind,rankLabel,focus,seatName:`${stripUnit(node.name)} ${kind==='sect'?'Sơn Môn':'Tổ Địa'}`,branchPolicy,seed})
});}
function addIndex(map,key,value){if(!key)return;if(!map.has(key))map.set(key,[]);map.get(key).push(value);}
function firstChildren(worldAdapter,parentId,type,limit=2){return worldAdapter?.getChildren?.(parentId,{types:[type],offset:0,limit})||[];}
function regionFor(worldAdapter,territory){return worldAdapter?.getAncestors?.(territory.id,true)?.find?.(node=>node.type==='great_region')||null;}
function markerForFaction(faction){return Object.freeze({id:`marker:${faction.id}`,markerType:'FACTION_HQ',factionId:faction.id,branchId:null,worldNodeId:faction.meta?.mapNodeId||faction.homeTerritoryId,territoryId:faction.homeTerritoryId,label:faction.name,archetype:faction.archetype,powerTier:faction.powerTier,branchType:null,subLabel:faction.archetype===FACTION_ARCHETYPES.SECT?'TÔNG MÔN':faction.archetype===FACTION_ARCHETYPES.ANCIENT_CLAN?'CỔ TỘC':'GIA TỘC',rankLabel:faction.meta?.rankLabel||faction.powerTier});}
function markerForBranch(branch,parentFaction){return Object.freeze({id:`marker:${branch.id}`,markerType:'FACTION_BRANCH',factionId:branch.parentFactionId,branchId:branch.id,worldNodeId:branch.mapNodeId||branch.territoryId,territoryId:branch.territoryId,label:branch.displayName||parentFaction?.name||branch.id,archetype:parentFaction?.archetype||null,powerTier:parentFaction?.powerTier||null,branchType:branch.branchType,subLabel:branch.markerLabel||branch.branchType,rankLabel:branch.markerLabel||branch.branchType});}

export function createCanonicalLocalFactionAtlas({worldAdapter}={}){
  const factions=[];const branches=[];const byJurisdiction=new Map();const byTerritoryBranches=new Map();const markersByTerritory=new Map();
  const territories=worldAdapter?.getAllTerritories?.()||[];const regionById=new Map();
  for(const territory of territories){const region=regionFor(worldAdapter,territory);if(region)regionById.set(region.id,region);}
  const regionPairById=new Map();
  for(const region of regionById.values()){
    const seed=hash32(region.id);const base=stripUnit(region.name);const focus=CONTINENT_FOCUS[region.continentKey]||CONTINENT_FOCUS.south;const surname=pick(SURNAMES,seed,3);
    const sect=definition({node:region,region,archetype:FACTION_ARCHETYPES.SECT,powerTier:FACTION_POWER_TIERS.MAJOR,name:`${base} ${pick(REGION_SECT_SUFFIX,seed)}`,slug:'regional_sect',kind:'sect',rankLabel:'Đại Tông cấp Vùng',focus:[pick(focus,seed),pick(focus,seed,1)],branchPolicy:'mỗi lãnh thổ trực thuộc có Phân Tông',seed});
    const clan=definition({node:region,region,archetype:FACTION_ARCHETYPES.CULTIVATION_FAMILY,powerTier:FACTION_POWER_TIERS.MAJOR,name:`${base} ${surname} Thế Gia`,slug:'regional_clan',kind:'family',rankLabel:'Đại Gia Tộc cấp Vùng',focus:[pick(focus,seed,2),'huyết mạch'],branchPolicy:'mỗi lãnh thổ trọng yếu có Phân Gia',seed:seed+17});
    factions.push(sect,clan);addIndex(byJurisdiction,region.id,sect);addIndex(byJurisdiction,region.id,clan);regionPairById.set(region.id,{sect,clan});
  }
  for(const territory of territories){
    const region=regionFor(worldAdapter,territory);const seed=hash32(territory.id);const base=stripUnit(territory.name);const focus=CONTINENT_FOCUS[territory.continentKey]||CONTINENT_FOCUS.south;const surnameA=pick(SURNAMES,seed,1);let surnameB=pick(SURNAMES,seed,7);if(surnameB===surnameA)surnameB=pick(SURNAMES,seed,9);
    const mediumSect=definition({node:territory,region,archetype:FACTION_ARCHETYPES.SECT,powerTier:FACTION_POWER_TIERS.MEDIUM,name:`${base} ${pick(MEDIUM_SECT_SUFFIX,seed)}`,slug:'medium_sect',kind:'sect',rankLabel:'Trung Tông',focus:[pick(focus,seed),pick(focus,seed,2)],branchPolicy:'có Ngoại Viện/Phân Đường tại quốc trực thuộc',seed});
    const mediumFamily=definition({node:territory,region,archetype:FACTION_ARCHETYPES.CULTIVATION_FAMILY,powerTier:FACTION_POWER_TIERS.MEDIUM,name:`${base} ${surnameA} Gia`,slug:'medium_family',kind:'family',rankLabel:'Trung Gia Tộc',focus:[pick(focus,seed,1),'thương lộ'],branchPolicy:'có Chi Tộc tại quốc trực thuộc',seed:seed+23});
    const minorSect=definition({node:territory,region,archetype:FACTION_ARCHETYPES.SECT,powerTier:FACTION_POWER_TIERS.MINOR,name:`${base} ${pick(MINOR_SECT_SUFFIX,seed)}`,slug:'minor_sect',kind:'sect',rankLabel:'Tiểu Tông',focus:[pick(focus,seed,3)],branchPolicy:'không mở rộng ngoài lãnh thổ nếu chưa thăng cấp',seed:seed+41});
    const minorFamily=definition({node:territory,region,archetype:FACTION_ARCHETYPES.CULTIVATION_FAMILY,powerTier:FACTION_POWER_TIERS.MINOR,name:`${base} ${surnameB} Thị`,slug:'minor_family',kind:'family',rankLabel:'Tiểu Gia Tộc',focus:[pick(focus,seed,2),'địa phương'],branchPolicy:'một tổ địa và các chi phòng nhỏ',seed:seed+59});
    for(const faction of [mediumSect,mediumFamily,minorSect,minorFamily]){factions.push(faction);addIndex(byJurisdiction,territory.id,faction);addIndex(markersByTerritory,territory.id,markerForFaction(faction));}
    const regional=regionPairById.get(region?.id);if(regional){
      const sectBranch=createBranch({parentFactionId:regional.sect.id,territoryId:territory.id,mapNodeId:territory.id,branchType:'phan_tong',displayName:`${regional.sect.name} · ${base} Phân Tông`,markerLabel:'PHÂN TÔNG',authority:.78,meta:{canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,parentRank:'Đại Tông cấp Vùng'}});
      const clanBranch=createBranch({parentFactionId:regional.clan.id,territoryId:territory.id,mapNodeId:territory.id,branchType:'phan_gia',displayName:`${regional.clan.name} · ${base} Phân Gia`,markerLabel:'PHÂN GIA',authority:.72,meta:{canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,parentRank:'Đại Gia Tộc cấp Vùng'}});
      branches.push(sectBranch,clanBranch);addIndex(byTerritoryBranches,territory.id,sectBranch);addIndex(byTerritoryBranches,territory.id,clanBranch);addIndex(markersByTerritory,territory.id,markerForBranch(sectBranch,regional.sect));addIndex(markersByTerritory,territory.id,markerForBranch(clanBranch,regional.clan));
    }
    const nations=firstChildren(worldAdapter,territory.id,'nation',2);const firstNation=nations[0]||null;const secondNation=nations[1]||firstNation;
    if(firstNation){const branch=createBranch({parentFactionId:mediumSect.id,territoryId:territory.id,mapNodeId:firstNation.id,branchType:'phan_duong',displayName:`${mediumSect.name} · ${stripUnit(firstNation.name)} Phân Đường`,markerLabel:'PHÂN ĐƯỜNG',authority:.58,meta:{canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,hostJurisdictionId:firstNation.id}});branches.push(branch);addIndex(byTerritoryBranches,territory.id,branch);addIndex(markersByTerritory,territory.id,markerForBranch(branch,mediumSect));}
    if(secondNation){const branch=createBranch({parentFactionId:mediumFamily.id,territoryId:territory.id,mapNodeId:secondNation.id,branchType:'chi_toc',displayName:`${mediumFamily.name} · ${stripUnit(secondNation.name)} Chi Tộc`,markerLabel:'CHI TỘC',authority:.52,meta:{canonical:true,atlasVersion:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,hostJurisdictionId:secondNation.id}});branches.push(branch);addIndex(byTerritoryBranches,territory.id,branch);addIndex(markersByTerritory,territory.id,markerForBranch(branch,mediumFamily));}
  }
  for(const regionFaction of regionPairById.values()){addIndex(markersByTerritory,regionFaction.sect.homeTerritoryId,markerForFaction(regionFaction.sect));addIndex(markersByTerritory,regionFaction.clan.homeTerritoryId,markerForFaction(regionFaction.clan));}
  const frozenFactions=Object.freeze(factions);const frozenBranches=Object.freeze(branches);
  return Object.freeze({
    version:CANONICAL_LOCAL_FACTION_ATLAS_VERSION,factions:frozenFactions,branches:frozenBranches,
    stats:Object.freeze({regions:regionById.size,territories:territories.length,factions:factions.length,branches:branches.length}),
    getFactionsForJurisdiction:id=>Object.freeze([...(byJurisdiction.get(id)||[])]),
    getBranchesForTerritory:id=>Object.freeze([...(byTerritoryBranches.get(id)||[])]),
    getMapMarkersForTerritory:id=>Object.freeze([...(markersByTerritory.get(id)||[])]),
    getMapMarkersForJurisdiction:id=>Object.freeze([...(markersByTerritory.get(id)||[])])
  });
}
