import fs from 'fs';

let code = fs.readFileSync('src/config/world/humanRealmWorld.js', 'utf8');

const startMarker = 'function generateProvinceSubnodes(territoryNode, index) {';
const endMarker = '// 2. 5 QUỐC GIA - 5 THÀNH';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `function generateProvinceSubnodes(territoryNode, index) {
  const subnodes = [];
  const territoryId = territoryNode.id;
  const territoryName = territoryNode.name;

  `;
  code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
  fs.writeFileSync('src/config/world/humanRealmWorld.js', code, 'utf8');
  console.log('OK: removed legacy sect generator');
} else {
  console.error('Marker not found:', startIdx, endIdx);
}
