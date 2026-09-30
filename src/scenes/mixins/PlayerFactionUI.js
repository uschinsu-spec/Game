const FONT = 'Be Vietnam Pro, sans-serif';

const AFFILIATION_LABELS = Object.freeze({
  CULTIVATION: { label: 'Đạo Thống', empty: 'Chưa bái nhập' },
  POLITICAL: { label: 'Triều Đình', empty: 'Chưa nhập sĩ' },
  PROFESSION: { label: 'Bách Nghệ', empty: 'Chưa nhập hội' },
  COMMERCE: { label: 'Thương Hội', empty: 'Chưa giao kết' },
  SOCIAL: { label: 'Minh Hội', empty: 'Chưa kết minh' },
  SECRET: { label: 'Ám Mạch', empty: 'Chưa dính líu' }
});

const PLAYER_FACTION_STAGE_LABELS = Object.freeze({
  'Local Group': 'Tụ Nghĩa Chi Chúng',
  'Minor Faction': 'Tiểu Thế Lực',
  'Regional Faction': 'Nhất Phương Thế Lực',
  'Major Faction': 'Đại Tông Thế Lực',
  'Territory Overlord': 'Bá Chủ Nhất Vực',
  'Regional Overlord': 'Hùng Chủ Nhất Phương',
  'Continental Power': 'Đại Lục Cự Phách',
  'Human Realm Power': 'Nhân Giới Chí Tôn'
});

function countWantedEntries(table) {
  if (!table || typeof table !== 'object') return 0;
  return Object.values(table).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function formatWantedState(wanted = {}) {
  const parts = [];
  const city = countWantedEntries(wanted.cityWanted);
  const territory = countWantedEntries(wanted.territoryWanted);
  const nation = countWantedEntries(wanted.nationWanted);
  const continent = countWantedEntries(wanted.continentWanted);
  const humanRealm = Math.max(0, Number(wanted.humanRealmWanted) || 0);

  if (city) parts.push(`Thành Trì ${city}`);
  if (territory) parts.push(`Lãnh Vực ${territory}`);
  if (nation) parts.push(`Quốc Độ ${nation}`);
  if (continent) parts.push(`Đại Lục ${continent}`);
  if (humanRealm) parts.push(`Nhân Giới ${humanRealm}`);
  return parts.length ? parts.join(' • ') : 'Vô';
}

function getStageLabel(stage) {
  const raw = typeof stage === 'string' ? stage : stage?.name;
  if (!raw) return '';
  return PLAYER_FACTION_STAGE_LABELS[raw] || raw;
}

export function installPlayerFactionUI(MainGameScene, { network, gameState, coordinator } = {}) {
  if (!MainGameScene?.prototype) return;
  const p = MainGameScene.prototype;
  if (p.__playerFactionUiInstalled) return;
  p.__playerFactionUiInstalled = true;

  p.openPlayerFactionPanel = function openPlayerFactionPanel() {
    const panel = this.createModalShell?.(
      'THÂN PHẬN & THẾ LỰC',
      'Đạo thống, nhân mạch, khế ước và ân oán',
      { subtitleColor: '#9aeaff' }
    );
    if (!panel) return null;

    const state = coordinator?.state || gameState?.factionState || {};
    let y = -305;

    for (const slot of ['CULTIVATION', 'POLITICAL', 'PROFESSION', 'COMMERCE', 'SOCIAL', 'SECRET']) {
      const membership = state.affiliations?.[slot];
      const faction = membership?.factionId ? network?.getFaction(membership.factionId) : null;
      const ui = AFFILIATION_LABELS[slot];
      const value = faction?.name || membership?.factionId || ui.empty;

      panel.add(this.add.text(-215, y, `${ui.label}: ${value}`, {
        fontFamily: FONT,
        fontSize: '13px',
        color: faction ? '#fff1a8' : '#9bb6c2',
        wordWrap: { width: 430 }
      }));
      y += 37;
    }

    const playerFaction = (state.playerCreatedFactions || [])[0];
    const stage = playerFaction ? coordinator?.getPlayerFactionStage(playerFaction.id) : null;
    const stageLabel = getStageLabel(stage);
    const wantedLabel = formatWantedState(state.wanted || {});
    const proposalCount = (state.diplomacyProposals || []).length;

    panel.add(this.add.text(
      -215,
      y,
      `Cơ Nghiệp Tự Lập: ${playerFaction?.name || 'Chưa khai sơn lập phái'}${stageLabel ? ` • ${stageLabel}` : ''}\n` +
      `Khế Ước: ${(state.contracts || []).length} • Truy Sát Lệnh: ${wantedLabel}\n` +
      `Bang Giao Nghị Thư: ${proposalCount}`,
      {
        fontFamily: FONT,
        fontSize: '13px',
        color: '#e7fbff',
        wordWrap: { width: 430 },
        lineSpacing: 5
      }
    ));

    return panel;
  };
}
