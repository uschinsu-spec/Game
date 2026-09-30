with open('src/scenes/mixins/WorldMapHierarchyUI.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove line 150-152: Tu tien: ...
code = code.replace("""  if (c.cultivationFamilies || c.minorSects || c.smallSecretRealms || c.localForbiddenZones) {
    lines.push(`Tu tiên: ${c.cultivationFamilies || 0} gia tộc • ${c.minorSects || 0} tiểu tông • ${c.smallSecretRealms || 0} bí cảnh • ${c.localForbiddenZones || 0} cấm địa`);
  }
""", "")

# Remove line 162: Tông môn: ...
code = code.replace("  if (node.cultivationFactions?.length) lines.push(`Tông môn: ${compactList(node.cultivationFactions, 3)}`);\n", "")

# Remove line 192-194: 🏯 Tông môn/Thế lực: ...
code = code.replace("""  if (node.cultivationFactions?.length || node.notablePowers?.length) {
    lines.push(`🏯 Tông môn/Thế lực: ${compactList(node.cultivationFactions || node.notablePowers, 3)}`);
  }
""", "")

with open('src/scenes/mixins/WorldMapHierarchyUI.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated WorldMapHierarchyUI.js successfully")
