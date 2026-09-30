import re

# 1. Clean humanRealmWorld.js
with open('src/config/world/humanRealmWorld.js', 'r', encoding='utf-8') as f:
    hr_code = f.read()

# Clean normalizedContinents
hr_code = re.sub(
    r'regions:\s*Object\.freeze\(continent\.regions\.map\(\(\[id, name, theme, shortTheme, focus, elements, [^\]]+\]\)',
    'regions: Object.freeze(continent.regions.map(([id, name, theme, shortTheme, focus, elements, namedTerritories])',
    hr_code
)

# Remove the 7th element from region arrays
# e.g., ['thanh_linh','Thanh Linh Vực','starter','Linh','sơn thủy ôn hòa...',['Mộc','Thủy'],'Thánh Tông', ['Thanh Châu'...]]
# -> ['thanh_linh','Thanh Linh Vực','starter','Linh','sơn thủy ôn hòa...',['Mộc','Thủy'], ['Thanh Châu'...]]
# or ['cuc_han','Cực Hàn Hàn Thiên','polar','Cực','băng nguyên...',['Băng','Thủy'],'Cực Hàn Tiên Cung']
# -> ['cuc_han','Cực Hàn Hàn Thiên','polar','Cực','băng nguyên...',['Băng','Thủy']]

def clean_region_line(match):
    line = match.group(0)
    # Match pattern: ,(\[[^\]]+\]),'[^']+'(,?.*)
    cleaned = re.sub(r',(\[[^\]]+\]),\'[^\']+\'(\s*,\s*\[|\s*\])', r',\1\2', line)
    # If no trailing array, e.g. ,['Mộc','Hỏa'],'Vạn Dược Thánh Các']
    cleaned = re.sub(r',(\[[^\]]+\]),\'[^\']+\'\]', r',\1]', cleaned)
    return cleaned

hr_lines = hr_code.split('\n')
for i, line in enumerate(hr_lines):
    if re.search(r'^\s*\[\'[a-z0-9_]+\',\s*\'', line):
        hr_lines[i] = clean_region_line(re.match(r'.*', line))

hr_code = '\n'.join(hr_lines)

with open('src/config/world/humanRealmWorld.js', 'w', encoding='utf-8') as f:
    f.write(hr_code)


# 2. Clean masterMapManifest.js
with open('src/config/world/masterMapManifest.js', 'r', encoding='utf-8') as f:
    mmm_code = f.read()

# Replace factionProfile in masterMapManifest.js
old_fac_manifest = """      // 10. Thế lực & Tông môn
      factionProfile: Object.freeze({
        dominantFaction: node.factionProfile?.dominantFactionId || null,
        apexSect: detailProfile?.politics?.apexSect || 'Thánh Tông',
        localFactions: Object.freeze(node.cultivationFactions || detailProfile?.politics?.factions || []),
        coreConflict: detailProfile?.politics?.conflict || 'Tranh đoạt linh mạch và tài nguyên'
      }),"""

new_fac_manifest = """      // 10. Thế lực (Đang để trống để thiết kế mới)
      factionProfile: Object.freeze({
        dominantFaction: null,
        localFactions: Object.freeze([]),
        coreConflict: null
      }),"""

mmm_code = mmm_code.replace(old_fac_manifest, new_fac_manifest)

# Clean requiresFactionId
mmm_code = mmm_code.replace("requiresFactionId: null,\n", "")
mmm_code = mmm_code.replace("requiresFactionId: null\n", "")

with open('src/config/world/masterMapManifest.js', 'w', encoding='utf-8') as f:
    f.write(mmm_code)


# 3. Clean humanRealmDetailedAtlas.js
with open('src/config/world/humanRealmDetailedAtlas.js', 'r', encoding='utf-8') as f:
    atlas_code = f.read()

atlas_code = re.sub(
    r'dominantFaction:\s*node\.factionProfile.*?,\n',
    'dominantFaction: null,\n',
    atlas_code
)

with open('src/config/world/humanRealmDetailedAtlas.js', 'w', encoding='utf-8') as f:
    f.write(atlas_code)

print("Deep cleaned all faction and sect fields across atlas and manifest files!")
