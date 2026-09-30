export const FACTION_SYSTEM_VERSION = '20260930-human-realm-faction-network-v5-expanded-world-clean-install';

export const FACTION_ARCHETYPES = Object.freeze({
  SECT: 'SECT', CULTIVATION_FAMILY: 'CULTIVATION_FAMILY', ANCIENT_CLAN: 'ANCIENT_CLAN',
  DYNASTY: 'DYNASTY', CITY_STATE: 'CITY_STATE', MERCHANT_GUILD: 'MERCHANT_GUILD',
  PROFESSION_GUILD: 'PROFESSION_GUILD', ACADEMY: 'ACADEMY',
  LOOSE_CULTIVATOR_ALLIANCE: 'LOOSE_CULTIVATOR_ALLIANCE', UNDERWORLD: 'UNDERWORLD',
  DEMONIC_FACTION: 'DEMONIC_FACTION', NON_HUMAN_FACTION: 'NON_HUMAN_FACTION',
  ADMINISTRATION: 'ADMINISTRATION', MILITARY_ORDER: 'MILITARY_ORDER', INTELLIGENCE_NETWORK: 'INTELLIGENCE_NETWORK'
});
export const FACTION_SCOPES = Object.freeze({
  HUMAN_REALM:'HUMAN_REALM', CONTINENT:'CONTINENT', PRIMARY_REGION:'PRIMARY_REGION',
  SECONDARY_TERRITORY:'SECONDARY_TERRITORY', NATION:'NATION', COMMANDERY:'COMMANDERY', CITY:'CITY',
  SETTLEMENT:'SETTLEMENT', SITE:'SITE', LOCAL:'LOCAL'
});
export const FACTION_POWER_TIERS = Object.freeze({SUPREME:'SUPREME',OVERLORD:'OVERLORD',MAJOR:'MAJOR',MEDIUM:'MEDIUM',MINOR:'MINOR',LOCAL:'LOCAL'});
export const FACTION_VISIBILITY = Object.freeze({PUBLIC:'PUBLIC',REGIONAL:'REGIONAL',HIDDEN:'HIDDEN',SECRET:'SECRET',UNKNOWN:'UNKNOWN'});
export const FACTION_DATA_LEVELS = Object.freeze({CORE:'CORE',GENERATED:'GENERATED',BACKGROUND:'BACKGROUND'});
export const INTEL_LEVELS = Object.freeze({UNKNOWN:0,RUMORED:1,KNOWN:2,PROFILED:3,INFILTRATED:4,FULL_INTEL:5});
export const RELATION_TYPES = Object.freeze({
  ALLIED:'ALLIED',FRIENDLY:'FRIENDLY',NEUTRAL:'NEUTRAL',RIVAL:'RIVAL',HOSTILE:'HOSTILE',WAR:'WAR',
  VASSAL:'VASSAL',OVERLORD:'OVERLORD',PROTECTED:'PROTECTED',TRADE_PARTNER:'TRADE_PARTNER',
  BLOOD_FEUD:'BLOOD_FEUD',MARRIAGE_ALLIANCE:'MARRIAGE_ALLIANCE',SECRET_ALLIANCE:'SECRET_ALLIANCE'
});
export const VASSAL_TYPES = Object.freeze({VASSAL:'VASSAL',PROTECTED:'PROTECTED',AFFILIATE:'AFFILIATE',CLIENT:'CLIENT'});
export const AFFILIATION_SLOTS = Object.freeze({CULTIVATION:'CULTIVATION',POLITICAL:'POLITICAL',PROFESSION:'PROFESSION',COMMERCE:'COMMERCE',SOCIAL:'SOCIAL',SECRET:'SECRET'});
export const LIFECYCLE_STATES = Object.freeze({FOUNDING:'FOUNDING',GROWTH:'GROWTH',STABLE:'STABLE',GOLDEN_AGE:'GOLDEN_AGE',DECLINE:'DECLINE',CRISIS:'CRISIS',VASSALIZED:'VASSALIZED',COLLAPSED:'COLLAPSED',REVIVAL:'REVIVAL'});
export const WAR_TYPES = Object.freeze({TRADE_CONFLICT:'trade_conflict',PROXY_WAR:'proxy_war',BORDER_CONFLICT:'border_conflict',RESOURCE_WAR:'resource_war',SECT_WAR:'sect_war',REGIONAL_WAR:'regional_war',CONTINENTAL_WAR:'continental_war',REALM_CRISIS:'realm_crisis'});
export const GOAL_TYPES = Object.freeze({EXPAND:'Expand',DEFEND:'Defend',RECRUIT:'Recruit',TRADE:'Trade',ACQUIRE_RESOURCE:'AcquireResource',ACQUIRE_SECRET_REALM:'AcquireSecretRealm',RESEARCH:'Research',BUILD_BRANCH:'BuildBranch',FORM_ALLIANCE:'FormAlliance',BREAK_ALLIANCE:'BreakAlliance',SUBJUGATE:'Subjugate',WAR:'War',RECOVER:'Recover',HIDE:'Hide'});
export const CONTROLLER_DIMENSIONS = Object.freeze(['political','cultivation','economic','security','intelligence','underworld']);
export const SITE_CONTROLLER_DIMENSIONS = Object.freeze(['security','resource','cultivation','exploration','intelligence','underworld']);
export const MAX_REALM_INDEX = 28;
export const CONTINENT_KEYS = Object.freeze(['south','east','west','north','central']);
export const CANONICAL_PLAYER_SECT_IDS = Object.freeze(['van_kiem_tong','thai_bach_tong','liet_diem_cung','bang_phach_cac','hau_tho_mon','thanh_moc_cac','phong_loi_cac','cuu_tieu_loi_dien','thanh_the_tong']);
export const TICK_KINDS = Object.freeze({SHORT:'short',DAILY:'daily',MONTHLY:'monthly',SEASONAL:'seasonal',YEARLY:'yearly'});
export const JURISDICTION_NODE_TYPES = Object.freeze(['realm','continent','great_region','province','nation','city_territory','settlement']);
export const SITE_NODE_TYPES = Object.freeze(['location']);
