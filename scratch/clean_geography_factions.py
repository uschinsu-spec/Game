import re

with open('src/config/world/humanRealmWorld.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove makeFactionProfile function
code = re.sub(r'function makeFactionProfile\(.*?^}\n', '', code, flags=re.MULTILINE | re.DOTALL)

# 2. Update makeTerritoryNode
old_terr_build = """  const enemyProfile = realmBand(continent, regionIndex, territoryIndex);
  const factionProfile = makeFactionProfile(continent, region, territoryName, regionIndex, territoryIndex);

  return Object.freeze({"""

new_terr_build = """  const enemyProfile = realmBand(continent, regionIndex, territoryIndex);

  return Object.freeze({"""
code = code.replace(old_terr_build, new_terr_build)

# Remove faction fields from makeTerritoryNode return
code = re.sub(r'\s+cultivationFactions:.*?\n', '\n', code)
code = re.sub(r'\s+factionProfile,?\n', '\n', code)
code = re.sub(r'\s+sectsAndFamilies:.*?\n', '\n', code)

# 3. In ALL_CONTINENT_SPECS, remove factionKinds, factionSuffixes
code = re.sub(r'\s+factionKinds:.*?\n', '\n', code)
code = re.sub(r'\s+factionSuffixes:.*?\n', '\n', code)

# 4. Remove apexSect from region definitions in ALL_CONTINENT_SPECS
# Format: ['id','Name','theme','shortTheme','desc',['Elements'],'ApexSect', [...namedTerritories]] or ['id', ... 'ApexSect']
# Let's inspect region items
# In normalizedContinents:
old_norm = """const normalizedContinents = ALL_CONTINENT_SPECS.map(continent => Object.freeze({
  ...continent,
  regions: Object.freeze(continent.regions.map(([id, name, theme, shortTheme, focus, elements, apexSect, namedTerritories]) => Object.freeze({
    id, name, theme, shortTheme, focus, elements: Object.freeze([...elements]), apexSect,
    namedTerritories: namedTerritories ? Object.freeze([...namedTerritories]) : null
  })))
}));"""

new_norm = """const normalizedContinents = ALL_CONTINENT_SPECS.map(continent => Object.freeze({
  ...continent,
  regions: Object.freeze(continent.regions.map(([id, name, theme, shortTheme, focus, elements, _legacyApexSect, namedTerritories]) => Object.freeze({
    id, name, theme, shortTheme, focus, elements: Object.freeze([...elements]),
    namedTerritories: namedTerritories ? Object.freeze([...namedTerritories]) : null
  })))
}));"""
code = code.replace(old_norm, new_norm)

# Remove apexSect: region.apexSect from great_region node
code = re.sub(r'\s+apexSect:\s*region\.apexSect,?\n', '\n', code)

# 5. Clean NATION_TYPES
code = code.replace(
    "const NATION_TYPES = ['Hoàng Triều', 'Cổ Quốc', 'Vương Triều', 'Tiên Môn', 'Thế Gia', 'Thương Minh'];",
    "const NATION_TYPES = ['Hoàng Triều', 'Cổ Quốc', 'Vương Triều', 'Đế Quốc', 'Thương Minh', 'Thành Bang'];"
)

with open('src/config/world/humanRealmWorld.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Purged geography factions from humanRealmWorld.js successfully")
