import { REALMS } from '../../config/realmsData.js?v=20260930-faction-fix-v1';
import { travelService, TRAVEL_SOURCES } from '../../services/travelService.js';

const FONT = 'Be Vietnam Pro, sans-serif';

function txt(scene, panel, x, y, text, size = '13px', color = '#e7fbff', width = 440) {
  const t = scene.add.text(x, y, text, {
    fontFamily: FONT,
    fontSize: size,
    color,
    wordWrap: { width, useAdvancedWrap: true },
    lineSpacing: 4
  }).setOrigin(0, 0);
  panel.add(t);
  return t;
}

function isFamilyArchetype(archetype) {
  return archetype === 'CULTIVATION_FAMILY' || archetype === 'ANCIENT_CLAN' || archetype === 'family';
}

function archetypeLabel(faction) {
  if (faction?.archetype === 'SECT') return 'TÔNG MÔN TU TIÊN';
  if (faction?.archetype === 'ANCIENT_CLAN') return 'CỔ TỘC THẾ GIA';
  if (faction?.archetype === 'CULTIVATION_FAMILY') return 'TU TIÊN THẾ GIA';
  if (faction?.archetype === 'DYNASTY') return 'HOÀNG TRIỀU TU TIÊN';
  if (faction?.archetype === 'MERCHANT_GUILD') return 'THƯƠNG MINH HỘI';
  if (faction?.archetype === 'ACADEMY') return 'ĐẠO CUNG HỌC VIỆN';
  return 'THẾ LỰC TU TIÊN';
}

function rankLabelVi(f) {
  const metaRank = f?.meta?.rankLabel || '';
  if (metaRank.includes('Trấn Vực')) return metaRank;
  if (metaRank.includes('Trấn Châu')) return metaRank;
  if (metaRank.includes('Trấn Quốc')) return metaRank;
  if (metaRank.includes('Trấn Thành')) return metaRank;
  if (metaRank.includes('Tối Cao') || metaRank.includes('Bá Chủ')) return metaRank;
  if (metaRank.includes('Đại Gia Tộc') || metaRank.includes('cấp Vùng')) return 'Đại Thế Gia Trấn Vực';
  if (metaRank.includes('Đại Tông')) return 'Đại Tông Môn Trấn Vực';
  if (metaRank.includes('Trung Tông')) return 'Tông Môn Trấn Châu';
  if (metaRank.includes('Trung Gia Tộc') || metaRank.includes('Trung Thế Gia')) return 'Thế Gia Trấn Châu';
  if (metaRank.includes('Tiểu Tông')) return 'Tông Môn Trấn Quốc';
  if (metaRank.includes('Tiểu Gia Tộc') || metaRank.includes('Tiểu Thế Gia')) return 'Thế Gia Trấn Quốc';

  const isClan = isFamilyArchetype(f?.archetype);
  const tier = f?.powerTier || '';
  const scope = f?.scope || '';

  if (tier === 'SUPREME' || scope === 'HUMAN_REALM') {
    if (f?.archetype === 'ANCIENT_CLAN') return 'Cổ Tộc Tối Cao (Cấp Nhân Giới)';
    if (f?.archetype === 'SECT') return 'Thánh Địa Tối Cao (Cấp Nhân Giới)';
    if (f?.archetype === 'DYNASTY') return 'Thần Triều Tối Cao';
    if (f?.archetype === 'MERCHANT_GUILD') return 'Thương Minh Toàn Giới';
    if (f?.archetype === 'ACADEMY') return 'Đạo Cung Tối Cao';
    return isClan ? 'Cổ Tộc Tối Cao' : 'Thánh Địa Tối Cao';
  }

  if (tier === 'OVERLORD' || scope === 'CONTINENT') {
    if (f?.archetype === 'SECT') return 'Đại Tông Bá Chủ Đại Lục';
    if (isClan) return 'Cổ Tộc Bá Chủ Đại Lục';
    if (f?.archetype === 'DYNASTY') return 'Hoàng Triều Bá Chủ Đại Lục';
    return 'Bá Chủ Đại Lục';
  }

  if (tier === 'MAJOR' || scope === 'PRIMARY_REGION') {
    return isClan ? 'Đại Thế Gia Trấn Vực' : 'Đại Tông Môn Trấn Vực';
  }

  if (tier === 'MEDIUM') {
    return isClan ? 'Thế Gia Trấn Châu' : 'Tông Môn Trấn Châu';
  }

  if (tier === 'MINOR') {
    return isClan ? 'Thế Gia Trấn Quốc' : 'Tông Môn Trấn Quốc';
  }

  if (tier === 'LOCAL') {
    return isClan ? 'Thế Gia Trấn Thành' : 'Tông Môn Trấn Thành';
  }

  return isClan ? 'Thế Gia Trấn Châu' : 'Tông Môn Trấn Châu';
}

function statusVi(status) {
  const map = {
    STABLE: 'ỔN ĐỊNH',
    EXPANDING: 'HƯNG THỊNH',
    CONTESTED: 'TRANH ĐOẠT',
    WEAKENED: 'SUY THOÁI',
    PEACE: 'HÒA BÌNH',
    WAR: 'CHIẾN TRANH'
  };
  return map[status] || 'ỔN ĐỊNH';
}

function compactNumber(value) {
  const n = Math.max(0, Number(value || 0));
  if (n >= 1000000) return `${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(Math.round(n));
}

function getRealmNameByIdx(idx) {
  if (idx === undefined || idx === null) return 'Kim Đan Sơ Kỳ';
  const num = Number(idx);
  if (REALMS && REALMS[num]?.name) return REALMS[num].name;
  if (num >= 35) return 'Độ Kiếp Viên Mãn';
  if (num >= 33) return 'Đại Thừa Đỉnh Phong';
  if (num >= 31) return 'Hợp Thể Hậu Kỳ';
  if (num >= 29) return 'Luyện Hư Đỉnh Phong';
  if (num >= 25) return 'Hóa Thần Đỉnh Phong';
  if (num >= 21) return 'Nguyên Anh Đỉnh Phong';
  if (num >= 17) return 'Kim Đan Đỉnh Phong';
  if (num >= 13) return 'Trúc Cơ Đỉnh Phong';
  if (num >= 1) return `Luyện Khí Tầng ${num}`;
  return 'Phàm Nhân';
}

function topResources(resources = {}) {
  const labels = {
    spiritStone: 'Linh Thạch',
    herbs: 'Linh Thảo',
    ores: 'Khoáng Thạch',
    monsterMaterials: 'Yêu Liệu',
    formationMaterials: 'Trận Liệu',
    pillIngredients: 'Đan Liệu',
    weaponMaterials: 'Khí Liệu',
    rareTreasures: 'Dị Bảo'
  };
  const list = Object.entries(resources)
    .filter(([, v]) => Number(v) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 4)
    .map(([k, v]) => `${labels[k] || k} ${compactNumber(v)}`);

  if (list.length > 0) return list.join(' • ');
  return 'Linh Thạch 120K • Khoáng Thạch 45K • Linh Thảo 38K • Đan Liệu 12K';
}

function hashStr(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SURNAME_POOL = ['Lâm', 'Tần', 'Tô', 'Mộ Dung', 'Diệp', 'Hàn', 'Lạc', 'Bạch', 'Cố', 'Tiêu', 'Sở', 'Ninh', 'Thẩm', 'Vân', 'Tạ', 'Đường', 'Âu Dương', 'Nam Cung', 'Khương', 'Cơ'];
const GIVEN_POOL = ['Huyền Chân', 'Thanh Hà', 'Trường Phong', 'Tử Mặc', 'Lăng Tiêu', 'Vô Trần', 'Nguyệt Dao', 'Thiên Vũ', 'Nhược Thủy', 'Cảnh Hành', 'Hạo Nhiên', 'Băng Tâm', 'Trường Sinh', 'Cửu Tiêu'];
const TECH_POOL = ['Chân Kinh', 'Huyền Điển', 'Kiếm Quyết', 'Đạo Thư', 'Luyện Thể Pháp', 'Linh Quyển', 'Tâm Pháp', 'Thần Thông', 'Vạn Kiếm Quy Tông', 'Băng Phách Quyết'];

function enrichFactionData(f, worldNode = null) {
  const seed = hashStr(f?.id || f?.name || 'faction_key');
  const isClan = isFamilyArchetype(f?.archetype);
  const tier = f?.powerTier || (worldNode?.type === 'great_region' ? 'MAJOR' : worldNode?.type === 'province' ? 'MEDIUM' : worldNode?.type === 'nation' ? 'MINOR' : 'LOCAL');
  const scope = f?.scope || (worldNode?.type === 'great_region' ? 'PRIMARY_REGION' : 'SECONDARY_TERRITORY');

  // 1. Meta rank
  let rankLabel = f?.meta?.rankLabel;
  if (!rankLabel || rankLabel === 'Thế Gia Trấn Vực' || rankLabel === 'Tông Môn Trấn Vực') {
    if (worldNode?.rulerFaction?.rankLabel) {
      rankLabel = worldNode.rulerFaction.rankLabel;
    } else {
      rankLabel = rankLabelVi({ ...f, powerTier: tier, scope });
    }
  }

  // 2. Population
  const pop = { ...(f?.population || {}) };
  if (!pop.population || Number(pop.population) === 0) {
    if (tier === 'SUPREME' || scope === 'HUMAN_REALM') {
      pop.population = 85000 + (seed % 35000);
      pop.cultivators = Math.round(pop.population * 0.45);
      pop.eliteCultivators = Math.round(pop.cultivators * 0.12);
      pop.elders = Math.round(pop.cultivators * 0.03);
    } else if (tier === 'OVERLORD' || scope === 'CONTINENT') {
      pop.population = 38000 + (seed % 15000);
      pop.cultivators = Math.round(pop.population * 0.4);
      pop.eliteCultivators = Math.round(pop.cultivators * 0.1);
      pop.elders = Math.round(pop.cultivators * 0.025);
    } else if (tier === 'MAJOR' || scope === 'PRIMARY_REGION' || rankLabel.includes('Trấn Vực')) {
      pop.population = 16000 + (seed % 6000);
      pop.cultivators = Math.round(pop.population * 0.38);
      pop.eliteCultivators = Math.round(pop.cultivators * 0.09);
      pop.elders = Math.round(pop.cultivators * 0.02);
    } else if (tier === 'MEDIUM' || rankLabel.includes('Trấn Châu')) {
      pop.population = 5800 + (seed % 2500);
      pop.cultivators = Math.round(pop.population * 0.35);
      pop.eliteCultivators = Math.round(pop.cultivators * 0.08);
      pop.elders = Math.round(pop.cultivators * 0.02);
    } else if (tier === 'MINOR' || rankLabel.includes('Trấn Quốc')) {
      pop.population = 2200 + (seed % 900);
      pop.cultivators = Math.round(pop.population * 0.3);
      pop.eliteCultivators = Math.round(pop.cultivators * 0.06);
      pop.elders = Math.round(pop.cultivators * 0.018);
    } else {
      pop.population = 850 + (seed % 350);
      pop.cultivators = Math.round(pop.population * 0.28);
      pop.eliteCultivators = Math.round(pop.cultivators * 0.05);
      pop.elders = Math.round(pop.cultivators * 0.015);
    }
  }

  // 3. Cultivators & Realms
  const cultivators = { ...(f?.cultivators || {}) };
  if (!cultivators.leaderRealmIdx || Number(cultivators.leaderRealmIdx) === 0) {
    if (tier === 'SUPREME' || scope === 'HUMAN_REALM') {
      cultivators.leaderRealmIdx = 28; // Hóa Thần Đỉnh Phong
      cultivators.ancestorRealmIdx = 33; // Đại Thừa Đỉnh Phong
    } else if (tier === 'OVERLORD' || scope === 'CONTINENT') {
      cultivators.leaderRealmIdx = 27; // Hóa Thần Hậu Kỳ
      cultivators.ancestorRealmIdx = 28; // Hóa Thần Đỉnh Phong
    } else if (tier === 'MAJOR' || scope === 'PRIMARY_REGION' || rankLabel.includes('Trấn Vực')) {
      cultivators.leaderRealmIdx = 25 + (seed % 2); // Hóa Thần Sơ/Trung Kỳ
      cultivators.ancestorRealmIdx = 27; // Hóa Thần Hậu Kỳ
    } else if (tier === 'MEDIUM' || rankLabel.includes('Trấn Châu')) {
      cultivators.leaderRealmIdx = 21 + (seed % 3); // Nguyên Anh
      cultivators.ancestorRealmIdx = 24; // Nguyên Anh Đỉnh Phong
    } else if (tier === 'MINOR' || rankLabel.includes('Trấn Quốc')) {
      cultivators.leaderRealmIdx = 17 + (seed % 3); // Kim Đan
      cultivators.ancestorRealmIdx = 20; // Kim Đan Đỉnh Phong
    } else {
      cultivators.leaderRealmIdx = 13 + (seed % 3); // Trúc Cơ
      cultivators.ancestorRealmIdx = 16; // Trúc Cơ Đỉnh Phong
    }
  }

  // 4. Economy
  const economy = { ...(f?.economy || {}) };
  if (!economy.treasury || Number(economy.treasury) === 0) {
    if (tier === 'SUPREME' || scope === 'HUMAN_REALM') {
      economy.treasury = 9500000 + (seed % 3500000);
      economy.income = Math.round(economy.treasury * 0.12);
      economy.tradeIncome = Math.round(economy.treasury * 0.05);
    } else if (tier === 'OVERLORD' || scope === 'CONTINENT') {
      economy.treasury = 3800000 + (seed % 1200000);
      economy.income = Math.round(economy.treasury * 0.11);
      economy.tradeIncome = Math.round(economy.treasury * 0.045);
    } else if (tier === 'MAJOR' || scope === 'PRIMARY_REGION' || rankLabel.includes('Trấn Vực')) {
      economy.treasury = 1400000 + (seed % 450000);
      economy.income = Math.round(economy.treasury * 0.1);
      economy.tradeIncome = Math.round(economy.treasury * 0.04);
    } else if (tier === 'MEDIUM' || rankLabel.includes('Trấn Châu')) {
      economy.treasury = 380000 + (seed % 120000);
      economy.income = Math.round(economy.treasury * 0.09);
      economy.tradeIncome = Math.round(economy.treasury * 0.035);
    } else if (tier === 'MINOR' || rankLabel.includes('Trấn Quốc')) {
      economy.treasury = 95000 + (seed % 35000);
      economy.income = Math.round(economy.treasury * 0.08);
      economy.tradeIncome = Math.round(economy.treasury * 0.03);
    } else {
      economy.treasury = 32000 + (seed % 12000);
      economy.income = Math.round(economy.treasury * 0.07);
      economy.tradeIncome = Math.round(economy.treasury * 0.025);
    }
  }

  // 5. Meta details
  const meta = { ...(f?.meta || {}) };
  if (!meta.leaderTitle) {
    meta.leaderTitle = isClan ? 'Gia Chủ' : (tier === 'SUPREME' ? 'Thánh Chủ' : 'Tông Chủ');
  }
  if (!meta.leaderName || meta.leaderName === '—') {
    const surname = SURNAME_POOL.find(s => (f.name || '').includes(s)) || SURNAME_POOL[seed % SURNAME_POOL.length];
    const given = GIVEN_POOL[(seed >>> 3) % GIVEN_POOL.length];
    meta.leaderName = `${surname} ${given}`;
  }
  if (!meta.foundingAge || meta.foundingAge === '—') {
    if (tier === 'SUPREME' || scope === 'HUMAN_REALM') meta.foundingAge = 12000 + (seed % 8000);
    else if (tier === 'OVERLORD' || scope === 'CONTINENT') meta.foundingAge = 4500 + (seed % 2500);
    else if (tier === 'MAJOR' || scope === 'PRIMARY_REGION' || rankLabel.includes('Trấn Vực')) meta.foundingAge = 1800 + (seed % 1200);
    else if (tier === 'MEDIUM' || rankLabel.includes('Trấn Châu')) meta.foundingAge = 750 + (seed % 450);
    else if (tier === 'MINOR' || rankLabel.includes('Trấn Quốc')) meta.foundingAge = 320 + (seed % 180);
    else meta.foundingAge = 120 + (seed % 80);
  }
  if (!meta.territoryName || meta.territoryName === '—') {
    meta.territoryName = worldNode?.name || f.homeTerritoryId || (tier === 'SUPREME' ? 'Trấn Thủ Toàn Nhân Giới' : 'Nhân Giới');
  }
  if (!meta.seatName || meta.seatName === '—') {
    const cleanName = (f.name || '').replace(/(Thế Gia|Cổ Tộc|Tông Môn|Đạo Tông|Thánh Địa|Thương Minh|Gia Tộc|Danh Môn|Hào Tộc)/g, '').trim();
    meta.seatName = `${cleanName || f.name} ${isClan ? 'Tổ Địa' : 'Sơn Môn'}`;
  }
  if (!meta.signatureTechnique || meta.signatureTechnique === '—') {
    const cleanName = (f.name || '').replace(/(Thế Gia|Cổ Tộc|Tông Môn|Đạo Tông|Thánh Địa|Thương Minh|Gia Tộc)/g, '').trim();
    const tech = TECH_POOL[(seed >>> 5) % TECH_POOL.length];
    meta.signatureTechnique = `${cleanName} ${tech}`;
  }
  if (!meta.motto || meta.motto === '—') {
    meta.motto = isClan ? 'Huyết mạch đồng tâm, gia tộc trường tồn' : 'Đạo tâm như nhất, kiếm ý thông huyền';
  }
  meta.rankLabel = rankLabel;

  return {
    ...f,
    powerTier: tier,
    scope,
    rankLabel,
    population: pop,
    cultivators,
    economy,
    meta
  };
}

export function installFactionUI(MainGameScene, { network, gameState, coordinator } = {}) {
  if (!MainGameScene?.prototype || !network) return;
  const p = MainGameScene.prototype;
  if (p.__factionUiInstalled) return;
  p.__factionUiInstalled = true;

  p.openFactionPanel = function(factionId, context = null) {
    let rawFaction = network.getFaction(factionId);
    if (!rawFaction && context?.faction) {
      rawFaction = context.faction;
    }
    if (!rawFaction && context?.ruler) {
      const isClan = context.ruler.type === 'Thế Gia' || context.ruler.type === 'Gia Tộc';
      rawFaction = {
        id: factionId,
        name: context.ruler.name,
        archetype: context.ruler.archetype || (isClan ? 'CULTIVATION_FAMILY' : 'SECT'),
        powerTier: context.node?.type === 'great_region' ? 'MAJOR' : context.node?.type === 'province' ? 'MEDIUM' : context.node?.type === 'nation' ? 'MINOR' : 'LOCAL',
        scope: context.node?.type === 'great_region' ? 'PRIMARY_REGION' : 'SECONDARY_TERRITORY',
        homeTerritoryId: context.node?.id || null,
        meta: {
          rankLabel: context.ruler.rankLabel || (context.ruler.duty ? `${context.ruler.type} ${context.ruler.duty}` : null),
          territoryName: context.node?.name || null
        }
      };
    }
    if (!rawFaction) return null;

    const f = enrichFactionData(rawFaction, context?.node || null);

    const panel = this.createModalShell?.('THẾ LỰC NHÂN GIỚI', f.name, {
      subtitleColor: '#9aeaff',
      headerFill: 0x0a3b52,
      bgFill: 0x062a3b
    });
    if (!panel) return null;

    const isClan = isFamilyArchetype(f.archetype);
    const state = coordinator?.state || gameState?.factionState || {};
    const relation = state.relations?.[f.id] || {};
    const currentTerritoryId = coordinator?.currentTerritoryId || context?.node?.id;
    const influenceData = currentTerritoryId ? (network.getInfluenceForTerritory(currentTerritoryId).find(x => x.factionId === f.id)?.influence || {}) : {};
    const branches = network.getFactionBranches(f.id) || [];
    const status = coordinator?.factionStatuses?.get(f.id) || 'STABLE';
    const economy = f.economy || {};
    const meta = f.meta || {};
    const pop = f.population || {};
    const cultivators = f.cultivators || {};
    const org = f.organization || {};
    const resources = f.resources || {};

    // 1. Cấp Bậc & Trạng Thái
    txt(this, panel, -220, -326, `${archetypeLabel(f)} • ${f.rankLabel} • ${statusVi(status)}`, '12.5px', isClan ? '#ffc27d' : '#d8b4fe');

    // 2. Đại Bản Doanh & Thủ Lĩnh
    const seatTitle = isClan ? 'Tổ Địa' : 'Sơn Môn';
    txt(this, panel, -220, -295, `ĐẠI BẢN DOANH: ${meta.seatName || f.headquarters?.name || seatTitle}\n${meta.leaderTitle || (isClan ? 'Gia Chủ' : 'Tông Chủ')}: ${meta.leaderName || '—'} • Thành lập khoảng ${compactNumber(meta.foundingAge)} năm\nĐịa bàn trấn thủ: ${meta.territoryName || f.homeTerritoryId || '—'}`, '11.5px', '#e7fbff', 430);

    // 3. Truyền Thừa & Tôn Chỉ
    const focusTags = (meta.focus || f.tags || []).filter(t => !t.includes('Trấn') && t !== 'sect' && t !== 'family').slice(0, 4);
    const focusText = focusTags.length > 0 ? ` • ${focusTags.join(' • ')}` : '';
    txt(this, panel, -220, -222, `TRUYỀN THỪA & ĐẠO THỐNG\nTuyệt kỹ: ${meta.signatureTechnique || f.doctrine?.signatureTechnique || '—'}${focusText}\nTôn chỉ: “${meta.motto || f.doctrine?.motto || 'Tu đạo thủ tâm'}”`, '11px', '#d9c7ff', 430);

    // 4. Quy Mô Lực Lượng
    const leaderRealmText = getRealmNameByIdx(cultivators.leaderRealmIdx);
    const ancestorRealmText = getRealmNameByIdx(cultivators.ancestorRealmIdx ?? (Number(cultivators.leaderRealmIdx) + 2));
    txt(this, panel, -220, -148, `QUY MÔ & TU VI\nNhân khẩu: ${compactNumber(pop.population)} • Tu sĩ: ${compactNumber(pop.cultivators)} • Tinh anh: ${compactNumber(pop.eliteCultivators)} • Trưởng lão: ${compactNumber(pop.elders)}\nCảnh giới Thủ Lĩnh: ${leaderRealmText} • Lão Tổ / Thái Thượng: ${ancestorRealmText}`, '11px', '#bdefff', 430);

    // 5. Tổ Chức & Tuyển Nhân Tài
    const ranks = (org.ranks || []).slice(-5).join(' › ');
    txt(this, panel, -220, -74, `TỔ CHỨC\nCơ cấu: ${ranks || `${meta.leaderTitle || (isClan ? 'Gia Chủ' : 'Tông Chủ')} • ${meta.elderTitle || (isClan ? 'Tộc Lão' : 'Trưởng Lão')}`}\nTuyển đệ tử: ${meta.recruitmentPolicy || 'Theo khảo hạch linh căn & quy chuẩn đạo thống'}`, '10.5px', '#b8dbe8', 430);

    // 6. Thế Lực Phụ Thuộc / Cấp Trên
    if (branches.length > 0) {
      const subTitle = isClan ? 'THẾ GIA PHỤ THUỘC' : 'TÔNG MÔN PHỤ THUỘC';
      const branchNames = branches.map(b => `• ${b.displayName || b.markerLabel}`).join('    ');
      txt(this, panel, -220, 0, `${subTitle} (${branches.length})\n${branchNames}`, '10.5px', '#ffe9a8', 430);
    } else {
      let superiorName = null;
      if (f.homePrimaryRegionId && f.homePrimaryRegionId !== f.homeTerritoryId) {
        const regFactions = network.getFactionsForJurisdiction?.(f.homePrimaryRegionId) || [];
        const superior = regFactions.find(rf => isClan ? isFamilyArchetype(rf.archetype) : rf.archetype === 'SECT');
        if (superior && superior.id !== f.id) superiorName = superior.name;
      }
      if (superiorName) {
        txt(this, panel, -220, 0, `QUAN HỆ THẾ LỰC\n• Trạng thái: ${isClan ? 'Thế Gia' : 'Tông Môn'} phụ thuộc địa phương\n• Trực thuộc: ${superiorName}`, '10.5px', '#ffe9a8', 430);
      } else {
        txt(this, panel, -220, 0, `QUAN HỆ THẾ LỰC\n• Thế lực độc lập trấn thủ một phương`, '10.5px', '#ffe9a8', 430);
      }
    }

    // 7. Kinh Tế & Tài Nguyên
    txt(this, panel, -220, 70, `KINH TẾ & TÀI NGUYÊN\nNgân khố: ${compactNumber(economy.treasury)} • Thu nhập: ${compactNumber(economy.income)} • Thương mại: ${compactNumber(economy.tradeIncome)}\nTài nguyên dồi dào: ${topResources(resources)}`, '10.5px', '#c9e7ca', 430);

    // 8. Ảnh Hưởng Địa Phương
    const seedNum = hashStr(f.id);
    const polInf = influenceData.political ? Math.round(influenceData.political) : (50 + (seedNum % 40));
    const cultInf = influenceData.cultivation ? Math.round(influenceData.cultivation) : (60 + (seedNum % 35));
    const econInf = influenceData.economic ? Math.round(influenceData.economic) : (45 + (seedNum % 45));
    const milInf = influenceData.military ? Math.round(influenceData.military) : (55 + (seedNum % 38));
    txt(this, panel, -220, 140, `ẢNH HƯỞNG ĐỊA PHƯƠNG\nChính trị: ${polInf} • Tu đạo: ${cultInf} • Kinh tế: ${econInf} • Quân sự: ${milInf}\nQuan hệ người chơi: ${relation.reputation ?? 0} (Trung Lập)`, '10.5px', '#d7eff7', 430);

    // 9. Mô tả văn phong
    if (meta.description) {
      txt(this, panel, -220, 206, meta.description, '10px', '#94b8c9', 430);
    }

    // 10. Nút Hành Động: 1) QUAY LẠI BẢN ĐỒ - 2) DI CHUYỂN ĐẾN SƠN MÔN / TỔ ĐỊA
    const previousNodeId = context?.node?.id || this.__lastMapNodeId || f.homeTerritoryId || meta.mapNodeId;
    const targetNodeId = meta.mapNodeId || f.homeTerritoryId || f.headquarters?.worldNodeId || context?.node?.id;
    const btnLabel = isClan ? 'DI CHUYỂN ĐẾN TỔ ĐỊA' : 'DI CHUYỂN ĐẾN SƠN MÔN';

    // Nút 1: QUAY LẠI BẢN ĐỒ (Bên trái)
    const backBg = this.add.rectangle(-105, 325, 198, 44, 0x092230, 1)
      .setStrokeStyle(2, 0x38bdf8);
    const backTxt = this.add.text(-105, 325, '↩ QUAY LẠI BẢN ĐỒ', {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#67e8f9'
    }).setOrigin(0.5);

    backBg.setInteractive({ useHandCursor: true });
    backBg.on('pointerover', () => {
      backBg.setFillStyle(0x0c374d, 1);
      backBg.setStrokeStyle(2.5, 0xffffff);
    });
    backBg.on('pointerout', () => {
      backBg.setFillStyle(0x092230, 1);
      backBg.setStrokeStyle(2, 0x38bdf8);
    });
    backBg.on('pointerdown', pointer => {
      pointer?.event?.stopPropagation?.();
      this.closeModal?.();
      if (this.openMapPanel && previousNodeId) {
        this.openMapPanel(previousNodeId);
      }
    });

    // Nút 2: DI CHUYỂN ĐẾN TỔ ĐỊA / SƠN MÔN (Bên phải)
    const moveBg = this.add.rectangle(105, 325, 198, 44, isClan ? 0x3d2008 : 0x1d0f36, 1)
      .setStrokeStyle(2, isClan ? 0xf59e0b : 0xa855f7);
    const moveTxt = this.add.text(105, 325, `⚔ ${btnLabel}`, {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: isClan ? '#fef3c7' : '#f3e8ff'
    }).setOrigin(0.5);

    moveBg.setInteractive({ useHandCursor: true });
    moveBg.on('pointerover', () => {
      moveBg.setFillStyle(isClan ? 0x5a310c : 0x32165c, 1);
      moveBg.setStrokeStyle(2.5, 0xffffff);
    });
    moveBg.on('pointerout', () => {
      moveBg.setFillStyle(isClan ? 0x3d2008 : 0x1d0f36, 1);
      moveBg.setStrokeStyle(2, isClan ? 0xf59e0b : 0xa855f7);
    });
    moveBg.on('pointerdown', pointer => {
      // Validate before closing the faction panel.  A blocked destination must
      // leave its context visible instead of silently returning to the hub.
      pointer?.event?.stopPropagation?.();
      pointer?.event?.stopImmediatePropagation?.();
      pointer?.event?.preventDefault?.();

      const factionMapId = f.headquarters?.playableMapId;
      if (!factionMapId) {
        this.showNotification?.('Thế lực này chưa khai báo điểm đến hợp lệ.');
        return;
      }

      const travelOptions = {
        scene: this,
        source: TRAVEL_SOURCES.FACTION_GATE,
        customMessage: `Đã đến: ${f.name} (${isClan ? 'Tổ Địa' : 'Sơn Môn'})`
      };
      const check = travelService.canTravel(factionMapId, travelOptions);
      if (!check.ok) {
        this.showNotification?.(check.message || 'Chưa thể di chuyển đến thế lực này.');
        return;
      }

      // Destroying the modal in the same pointer event exposes the hotbar
      // beneath it, so the click can also cast a skill.  Finish the event
      // first, then close and execute the single canonical travel request.
      const executeTravel = () => {
        this.closeModal?.();
        travelService.travel(factionMapId, travelOptions);
      };
      if (this.time?.delayedCall) this.time.delayedCall(0, executeTravel);
      else Promise.resolve().then(executeTravel);
    });

    panel.add([backBg, backTxt, moveBg, moveTxt]);
    return panel;
  };
}
