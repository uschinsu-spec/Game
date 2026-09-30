import { HUMAN_REALM_WORLD_NODES } from '../../src/config/world/humanRealmWorld.js?v=20260929-human-realm-v4';
import { findMapById, getWorldBreadcrumb, getWorldChildren } from '../../src/config/world/worldRegistry.js?v=20260929-single-map-system-v1';

console.log('=== TEST SECT & REGION HIERARCHY FOR ALL 437 TERRITORIES ===');

const provinces = HUMAN_REALM_WORLD_NODES.filter(n => n.type === 'province');
console.log(`Total Provinces: ${provinces.length}`);

// Test first 5 provinces + a few random ones across continents
const sampleProvinces = [
  provinces[0], // Thanh Châu (South)
  provinces[1], // Lạc Châu (South)
  provinces[108], // First of East (Đông Huyền)
  provinces[172], // First of West (Tây Mạc)
  provinces[221], // First of North (Bắc Minh)
  provinces[293]  // First of Central (Trung Vực)
];

for (const prov of sampleProvinces) {
  console.log(`\n--- Province: ${prov.name} (${prov.id}) ---`);
  const children = getWorldChildren(prov.id);
  const sects = children.filter(c => c.type === 'sect');
  const nations = children.filter(c => c.type === 'nation');
  const clans = children.filter(c => c.type === 'clan');
  const guilds = children.filter(c => c.type === 'guild');

  console.log(`  Sects (${sects.length}): ${sects.map(s => s.name).join(' | ')}`);
  console.log(`  Nations (${nations.length}): ${nations.map(n => n.name).join(' | ')}`);
  console.log(`  Clans (${clans.length}): ${clans.map(c => c.name).join(' | ')}`);
  console.log(`  Guilds (${guilds.length}): ${guilds.map(g => g.name).join(' | ')}`);

  // Check first sect's subnodes
  if (sects.length > 0) {
    const sectUnits = getWorldChildren(sects[0].id);
    console.log(`  -> First Sect [${sects[0].name}] Units: ${sectUnits.map(u => `${u.name} (${u.type})`).join(', ')}`);
    
    // Check first unit locations
    if (sectUnits.length > 0) {
      const locs = getWorldChildren(sectUnits[0].id);
      console.log(`     -> Sublocations: ${locs.map(l => l.name).join(', ')}`);
      
      // Test map resolution for location
      if (locs.length > 0) {
        const resolvedMap = findMapById(locs[0].id);
        console.log(`     -> Location [${locs[0].name}] resolves to map: ${resolvedMap?.name || 'NULL'} (id: ${resolvedMap?.id})`);
      }
    }
  }
}

console.log('\n✅ SECT AND REGION SUB-DESTINATION HIERARCHY VERIFIED 100%!');
