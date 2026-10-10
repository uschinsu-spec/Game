import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {EQUIPMENT_ICONS,PROFESSION_ICONS,MANUAL_ICONS} from '../src/core/icon-catalog.js';
import {EQUIPMENT_SLOTS,equipmentId,equipmentInfo} from '../src/core/equipment-items.js';
import {FAMILIES,resourceId,resourceInfo} from '../src/core/profession-items.js';
import {CONG_PHAP_LIST,SKILLS} from '../src/cultivation.js';
for(const slot of EQUIPMENT_SLOTS){assert.ok(EQUIPMENT_ICONS[slot.id]);for(let grade=1;grade<=5;grade++)for(let quality=0;quality<4;quality++)assert.ok(EQUIPMENT_ICONS[equipmentInfo(equipmentId(slot.id,grade,quality)).slot])}
for(const kind of Object.keys(FAMILIES))for(let grade=0;grade<=5;grade++)for(let q=0;q<(grade?4:1);q++)assert.ok(PROFESSION_ICONS[resourceInfo(resourceId(kind,grade,q)).kind]);
for(const manual of CONG_PHAP_LIST)assert.ok(MANUAL_ICONS[manual.grade]);
for(const file of [...Object.values(EQUIPMENT_ICONS),...Object.values(PROFESSION_ICONS),...Object.values(MANUAL_ICONS),...SKILLS.map(s=>'skills/unique/'+s.id)])assert.ok(existsSync(new URL('../assets/icons/'+file+'.webp',import.meta.url)),file);
const manifest=JSON.parse(readFileSync(new URL('../assets/icons/source-manifest.json',import.meta.url)));
for(const [dst,hash] of Object.entries(manifest.sha256))assert.equal(createHash('sha256').update(readFileSync(new URL('../assets/icons/'+dst+'.webp',import.meta.url))).digest('hex'),hash);
console.log('PASS: icon coverage for 160 gear variants, 84 profession items, every manual and skill; copies match source');
