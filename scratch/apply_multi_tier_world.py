import re

with open('src/config/world/humanRealmWorld.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update import in humanRealmWorld.js
code = code.replace(
    "import { EXPANDED_HUMAN_REALM_ATLAS } from './humanRealmExpandedAtlas.js';",
    "import { EXPANDED_HUMAN_REALM_REGIONS, EXPANDED_HUMAN_REALM_ATLAS } from './humanRealmExpandedAtlas.js';"
)

# 2. Add Great Region wilds & secret realms in region generation loop
old_reg_loop = """  continent.regions.forEach((region, regionIndex) => {
    const regionNodeId = isSouth ? `nl.gr.${region.id}` : `${continentNodeId}.gr.${region.id}`;
    humanRealmNodes.push(Object.freeze({
      id: regionNodeId,
      type: 'great_region',
      displayTypeLabel: continent.primaryLabel.toUpperCase(),
      name: region.name,
      parentId: continentNodeId,
      continentId: continent.id,
      regionId: region.id,
      regionIndex: regionIndex + 1,
      theme: region.theme,
      desc: region.focus,
      climate: `${continent.climate}; ${region.focus}`,
      signatureProducts: Object.freeze([...continent.products]),
      signatureMinerals: Object.freeze([...continent.minerals]),
      signatureEnemies: Object.freeze([...continent.enemies]),
      dominantElements: Object.freeze([...region.elements]),
      subdivisionLabel: continent.secondaryLabel,
      counts: Object.freeze({ subdivisions: continent.secondaryPerPrimary }),
      status: 'playable'
    }));

    for (let territoryIndex = 0; territoryIndex < continent.secondaryPerPrimary; territoryIndex++) {
      humanRealmNodes.push(makeTerritoryNode(continent, region, regionNodeId, regionIndex, territoryIndex));
    }
  });"""

new_reg_loop = """  continent.regions.forEach((region, regionIndex) => {
    const regionNodeId = isSouth ? `nl.gr.${region.id}` : `${continentNodeId}.gr.${region.id}`;
    humanRealmNodes.push(Object.freeze({
      id: regionNodeId,
      type: 'great_region',
      displayTypeLabel: continent.primaryLabel.toUpperCase(),
      name: region.name,
      parentId: continentNodeId,
      continentId: continent.id,
      regionId: region.id,
      regionIndex: regionIndex + 1,
      theme: region.theme,
      desc: region.focus,
      climate: `${continent.climate}; ${region.focus}`,
      signatureProducts: Object.freeze([...continent.products]),
      signatureMinerals: Object.freeze([...continent.minerals]),
      signatureEnemies: Object.freeze([...continent.enemies]),
      dominantElements: Object.freeze([...region.elements]),
      subdivisionLabel: continent.secondaryLabel,
      counts: Object.freeze({ subdivisions: continent.secondaryPerPrimary }),
      status: 'playable'
    }));

    // Hoang Dã & Bí Cảnh cấp Đại Vực (4 Hoang Dã + 2 Bí Cảnh)
    const regionEntry = Array.isArray(EXPANDED_HUMAN_REALM_REGIONS)
      ? EXPANDED_HUMAN_REALM_REGIONS.find(r => r.name === region.name)
      : null;

    if (regionEntry) {
      (regionEntry.wilds || []).forEach((wName, wIdx) => {
        humanRealmNodes.push(Object.freeze({
          id: `${regionNodeId}.reg_wild.${slugifyVi(wName)}_${wIdx}`,
          type: 'location',
          name: wName,
          parentId: regionNodeId,
          desc: `${wName} là vùng hoang dã cấp đại vực bao la tại ${region.name}, yêu khí ngập trời và linh bảo ẩn tàng.`,
          locationKind: 'field',
          status: 'playable'
        }));
      });

      (regionEntry.secretRealms || []).forEach((sName, sIdx) => {
        humanRealmNodes.push(Object.freeze({
          id: `${regionNodeId}.reg_secret.${slugifyVi(sName)}_${sIdx}`,
          type: 'location',
          name: sName,
          parentId: regionNodeId,
          desc: `${sName} là bí cảnh cấp đại vực thượng cổ tại ${region.name}, chứa đựng cơ duyên phi thăng to lớn.`,
          locationKind: 'secret_realm',
          status: 'playable'
        }));
      });
    }

    for (let territoryIndex = 0; territoryIndex < continent.secondaryPerPrimary; territoryIndex++) {
      humanRealmNodes.push(makeTerritoryNode(continent, region, regionNodeId, regionIndex, territoryIndex));
    }
  });"""

code = code.replace(old_reg_loop, new_reg_loop)

# 3. Update generateProvinceSubnodes to include Châu, Quốc Gia, Thành multi-tier wilds & secrets
old_subnodes_func = """function generateProvinceSubnodes(territoryNode, index) {
  const subnodes = [];
  const territoryId = territoryNode.id;
  const territoryName = territoryNode.name;

  // 2. 5 QUỐC GIA - 5 THÀNH - 2 THÔN / 2 HOANG DÃ / 1 BÍ CẢNH (THEO Danh_sach_Nhan_Gioi_5QG_5Thanh_2Thon_HoangDa_BiCanh.txt)
  const atlasEntry = EXPANDED_HUMAN_REALM_ATLAS[index] || EXPANDED_HUMAN_REALM_ATLAS.find(a => a.name === territoryName);
  const isThanhChau = territoryId === 'nl.prov.thanh_linh.thanh_chau';

  if (atlasEntry && Array.isArray(atlasEntry.nations)) {
    atlasEntry.nations.forEach((nat, natIdx) => {
      const nationSlug = slugifyVi(nat.name);
      const isDaiLy = isThanhChau && natIdx === 0;
      const nationId = isDaiLy ? STARTER_WORLD_IDS.nation : `${territoryId}.nation.${nationSlug}_${natIdx}`;

      subnodes.push(Object.freeze({
        id: nationId,
        type: 'nation',
        name: nat.name,
        parentId: territoryId,
        desc: `${nat.name} thuộc ${territoryName}, quốc gia tu tiên với 5 đại thành trì và hàng vạn dặm linh địa.`,
        status: 'playable'
      }));

      // 5 Thành per Quốc Gia
      (nat.cities || []).forEach((city, cityIdx) => {
        const citySlug = slugifyVi(city.name);
        const cityId = `${nationId}.city.${citySlug}_${cityIdx}`;

        subnodes.push(Object.freeze({
          id: cityId,
          type: 'city_territory',
          name: city.name,
          parentId: nationId,
          desc: `${city.name} là đại thành trì trung tâm thuộc ${nat.name}, giao thương sầm uất và tụ tập tu sĩ bốn phương.`,
          locationKind: 'major_hub',
          status: 'playable'
        }));

        // 2 Thôn per Thành
        (city.villages || []).forEach((vName, vIdx) => {
          const isStarterVillage = isDaiLy && city.name.includes('Nam Sơn') && vName === 'Thanh Vân Thôn';
          const villageId = isStarterVillage ? STARTER_WORLD_IDS.map0 : `${cityId}.village.${slugifyVi(vName)}_${vIdx}`;

          subnodes.push(Object.freeze({
            id: villageId,
            type: 'location',
            name: vName,
            parentId: cityId,
            desc: `${vName} thuộc ${city.name}, nơi cư ngụ yên bình của các gia tộc tu tiên sơ cấp.`,
            playableMapId: isStarterVillage ? 0 : undefined,
            locationKind: 'safe_hub',
            status: 'playable'
          }));
        });

        // 2 Hoang Dã per Thành
        (city.wilds || []).forEach((wName, wIdx) => {
          const isStarterOuter = isDaiLy && city.name.includes('Nam Sơn') && wName === 'Thanh Vân Ngoại Vi';
          const isStarterForest = isDaiLy && city.name.includes('Nam Sơn') && wName === 'Vạn Mộc Sâm Lâm';
          const wildId = isStarterOuter ? STARTER_WORLD_IDS.map1 : (isStarterForest ? STARTER_WORLD_IDS.map2 : `${cityId}.wild.${slugifyVi(wName)}_${wIdx}`);

          subnodes.push(Object.freeze({
            id: wildId,
            type: 'location',
            name: wName,
            parentId: cityId,
            desc: `${wName} thuộc ${city.name}, vùng hoang dã nơi yêu thú sinh sống và sản sinh linh thảo.`,
            playableMapId: isStarterOuter ? 1 : (isStarterForest ? 2 : undefined),
            locationKind: 'field',
            status: 'playable'
          }));
        });

        // 1 Bí Cảnh per Thành
        (city.secretRealms || []).forEach((sName, sIdx) => {
          const secretId = `${cityId}.secret.${slugifyVi(sName)}_${sIdx}`;

          subnodes.push(Object.freeze({
            id: secretId,
            type: 'location',
            name: sName,
            parentId: cityId,
            desc: `${sName} thuộc ${city.name}, bí cảnh cổ xưa ẩn chứa truyền thừa và cấm chế thượng cổ.`,
            locationKind: 'secret_realm',
            status: 'playable'
          }));
        });
      });
    });
  }

  return subnodes;
}"""

new_subnodes_func = """function generateProvinceSubnodes(territoryNode, index) {
  const subnodes = [];
  const territoryId = territoryNode.id;
  const territoryName = territoryNode.name;

  const atlasEntry = EXPANDED_HUMAN_REALM_ATLAS[index] || EXPANDED_HUMAN_REALM_ATLAS.find(a => a.name === territoryName);
  const isThanhChau = territoryId === 'nl.prov.thanh_linh.thanh_chau';

  if (atlasEntry) {
    // 1. HOANG DÃ CẤP CHÂU (3 Hoang Dã)
    (atlasEntry.wilds || []).forEach((wName, wIdx) => {
      subnodes.push(Object.freeze({
        id: `${territoryId}.prov_wild.${slugifyVi(wName)}_${wIdx}`,
        type: 'location',
        name: wName,
        parentId: territoryId,
        desc: `${wName} là vùng hoang dã trọng yếu thuộc ${territoryName}, sản sinh kỳ trân dị bảo và yêu thú địa phương.`,
        locationKind: 'field',
        status: 'playable'
      }));
    });

    // 2. BÍ CẢNH CẤP CHÂU (2 Bí Cảnh)
    (atlasEntry.secretRealms || []).forEach((sName, sIdx) => {
      subnodes.push(Object.freeze({
        id: `${territoryId}.prov_secret.${slugifyVi(sName)}_${sIdx}`,
        type: 'location',
        name: sName,
        parentId: territoryId,
        desc: `${sName} là cổ bí cảnh ngàn năm tại ${territoryName}, nơi các tu sĩ tranh đoạt truyền thừa.`,
        locationKind: 'secret_realm',
        status: 'playable'
      }));
    });

    // 3. 5 QUỐC GIA PER CHÂU
    (atlasEntry.nations || []).forEach((nat, natIdx) => {
      const nationSlug = slugifyVi(nat.name);
      const isDaiLy = isThanhChau && natIdx === 0;
      const nationId = isDaiLy ? STARTER_WORLD_IDS.nation : `${territoryId}.nation.${nationSlug}_${natIdx}`;

      subnodes.push(Object.freeze({
        id: nationId,
        type: 'nation',
        name: nat.name,
        parentId: territoryId,
        desc: `${nat.name} thuộc ${territoryName}, quốc gia tu tiên với 5 đại thành trì và hàng vạn dặm linh địa.`,
        status: 'playable'
      }));

      // 3.1. Hoang Dã cấp Quốc Gia (2 Hoang Dã)
      (nat.wilds || []).forEach((wName, wIdx) => {
        subnodes.push(Object.freeze({
          id: `${nationId}.nat_wild.${slugifyVi(wName)}_${wIdx}`,
          type: 'location',
          name: wName,
          parentId: nationId,
          desc: `${wName} là vùng biên hoang hoang dã thuộc ${nat.name}.`,
          locationKind: 'field',
          status: 'playable'
        }));
      });

      // 3.2. Bí Cảnh cấp Quốc Gia (1 Bí Cảnh)
      (nat.secretRealms || []).forEach((sName, sIdx) => {
        subnodes.push(Object.freeze({
          id: `${nationId}.nat_secret.${slugifyVi(sName)}_${sIdx}`,
          type: 'location',
          name: sName,
          parentId: nationId,
          desc: `${sName} là hoàng gia bí cảnh tôn nghiêm của ${nat.name}.`,
          locationKind: 'secret_realm',
          status: 'playable'
        }));
      });

      // 3.3. 5 Thành per Quốc Gia
      (nat.cities || []).forEach((city, cityIdx) => {
        const citySlug = slugifyVi(city.name);
        const cityId = `${nationId}.city.${citySlug}_${cityIdx}`;

        subnodes.push(Object.freeze({
          id: cityId,
          type: 'city_territory',
          name: city.name,
          parentId: nationId,
          desc: `${city.name} là đại thành trì trung tâm thuộc ${nat.name}, giao thương sầm uất và tụ tập tu sĩ bốn phương.`,
          locationKind: 'major_hub',
          status: 'playable'
        }));

        // 2 Thôn per Thành
        (city.villages || []).forEach((vName, vIdx) => {
          const isStarterVillage = isDaiLy && city.name.includes('Nam Sơn') && vName === 'Thanh Vân Thôn';
          const villageId = isStarterVillage ? STARTER_WORLD_IDS.map0 : `${cityId}.village.${slugifyVi(vName)}_${vIdx}`;

          subnodes.push(Object.freeze({
            id: villageId,
            type: 'location',
            name: vName,
            parentId: cityId,
            desc: `${vName} thuộc ${city.name}, nơi cư ngụ yên bình của các gia tộc tu tiên sơ cấp.`,
            playableMapId: isStarterVillage ? 0 : undefined,
            locationKind: 'safe_hub',
            status: 'playable'
          }));
        });

        // 2 Hoang Dã per Thành
        (city.wilds || []).forEach((wName, wIdx) => {
          const isStarterOuter = isDaiLy && city.name.includes('Nam Sơn') && wName === 'Thanh Vân Ngoại Vi';
          const isStarterForest = isDaiLy && city.name.includes('Nam Sơn') && wName === 'Vạn Mộc Sâm Lâm';
          const wildId = isStarterOuter ? STARTER_WORLD_IDS.map1 : (isStarterForest ? STARTER_WORLD_IDS.map2 : `${cityId}.wild.${slugifyVi(wName)}_${wIdx}`);

          subnodes.push(Object.freeze({
            id: wildId,
            type: 'location',
            name: wName,
            parentId: cityId,
            desc: `${wName} thuộc ${city.name}, vùng hoang dã nơi yêu thú sinh sống và sản sinh linh thảo.`,
            playableMapId: isStarterOuter ? 1 : (isStarterForest ? 2 : undefined),
            locationKind: 'field',
            status: 'playable'
          }));
        });

        // 1 Bí Cảnh per Thành
        (city.secretRealms || []).forEach((sName, sIdx) => {
          const secretId = `${cityId}.secret.${slugifyVi(sName)}_${sIdx}`;

          subnodes.push(Object.freeze({
            id: secretId,
            type: 'location',
            name: sName,
            parentId: cityId,
            desc: `${sName} thuộc ${city.name}, bí cảnh cổ xưa ẩn chứa truyền thừa và cấm chế thượng cổ.`,
            locationKind: 'secret_realm',
            status: 'playable'
          }));
        });
      });
    });
  }

  return subnodes;
}"""

code = code.replace(old_subnodes_func, new_subnodes_func)

with open('src/config/world/humanRealmWorld.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated humanRealmWorld.js with multi-tier wilderness and secret realms successfully!")
