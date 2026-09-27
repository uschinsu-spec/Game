/**
 * currencyData.js
 * Hệ Thống Tiền Tệ Tu Tiên & Tỷ Lệ Quy Đổi 1:10000
 * ==========================================================
 * Bậc 1: Bạc (Silver) - Tiền tệ phàm nhân
 * Bậc 2: Linh Thạch Sơ Cấp (Hạ Phẩm) = 10,000 Bạc
 * Bậc 3: Linh Thạch Trung Cấp = 10,000 Linh Thạch Sơ Cấp
 * Bậc 4: Linh Thạch Thượng Phẩm = 10,000 Linh Thạch Trung Cấp
 * Bậc 5: Linh Thạch Cực Phẩm = 10,000 Linh Thạch Thượng Phẩm
 */

export const CURRENCY_RATIO = 10000;

export const CURRENCY_TIERS = [
  {
    key: 'silver',
    name: 'Bạc (Ngân Lượng)',
    short: 'Bạc',
    icon: '🪙',
    color: '#cbd5e1',
    desc: 'Tiền tệ lưu thông của phàm nhân thôn làng.',
    rank: 1,
    nextKey: 'low',
    prevKey: null
  },
  {
    key: 'low',
    name: 'Linh Thạch Sơ Cấp (Hạ Phẩm)',
    short: 'Linh Thạch (Sơ)',
    icon: '💎',
    color: '#38bdf8',
    desc: 'Linh thạch ngưng tụ linh khí cấp thấp (Luyện Khí - Trúc Cơ).',
    rank: 2,
    nextKey: 'mid',
    prevKey: 'silver'
  },
  {
    key: 'mid',
    name: 'Linh Thạch Trung Cấp',
    short: 'Linh Thạch (Trung)',
    icon: '🔮',
    color: '#a855f7',
    desc: 'Linh thạch chứa đựng linh khí nồng đậm (Kim Đan).',
    rank: 3,
    nextKey: 'high',
    prevKey: 'low'
  },
  {
    key: 'high',
    name: 'Linh Thạch Thượng Phẩm',
    short: 'Linh Thạch (Thượng)',
    icon: '✨',
    color: '#facc15',
    desc: 'Linh thạch tinh thuần cực hạn của tu chân giới (Nguyên Anh).',
    rank: 4,
    nextKey: 'extreme',
    prevKey: 'mid'
  },
  {
    key: 'extreme',
    name: 'Linh Thạch Cực Phẩm',
    short: 'Linh Thạch (Cực)',
    icon: '👑',
    color: '#f43f5e',
    desc: 'Chí bảo thiên địa ẩn chứa thiên địa linh mạch (Hóa Thần).',
    rank: 5,
    nextKey: null,
    prevKey: 'high'
  }
];

export const CURRENCY_MAP = Object.fromEntries(CURRENCY_TIERS.map(c => [c.key, c]));

/**
 * Đảm bảo cấu trúc currencies tồn tại trong gameState
 */
export function ensureCurrencies(gameState) {
  if (!gameState.currencies) {
    gameState.currencies = {
      silver: 0,
      low: gameState.gold || 0,
      mid: 0,
      high: 0,
      extreme: 0
    };
  }
  CURRENCY_TIERS.forEach(t => {
    if (gameState.currencies[t.key] === undefined || gameState.currencies[t.key] === null) {
      gameState.currencies[t.key] = 0;
    }
  });
  // Đồng bộ gameState.gold để tương thích
  gameState.gold = gameState.currencies.low;
  return gameState.currencies;
}

/**
 * Thêm tiền tệ an toàn
 */
export function addCurrency(gameState, key, amount) {
  const c = ensureCurrencies(gameState);
  if (c[key] !== undefined) {
    c[key] = Math.max(0, (c[key] || 0) + amount);
    if (key === 'low') gameState.gold = c.low;
  }
}

/**
 * Kiểm tra đủ tiền tệ
 */
export function hasCurrency(gameState, key, amount) {
  const c = ensureCurrencies(gameState);
  return (c[key] || 0) >= amount;
}

/**
 * Khấu trừ tiền tệ
 */
export function deductCurrency(gameState, key, amount) {
  const c = ensureCurrencies(gameState);
  if ((c[key] || 0) >= amount) {
    c[key] -= amount;
    if (key === 'low') gameState.gold = c.low;
    return true;
  }
  return false;
}

/**
 * Đổi lên bậc cao hơn (Tỷ lệ 10,000 : 1)
 */
export function exchangeUp(gameState, fromKey, targetCount = 1) {
  const c = ensureCurrencies(gameState);
  const tier = CURRENCY_MAP[fromKey];
  if (!tier || !tier.nextKey) return { success: false, msg: 'Không thể nâng cấp bậc cao hơn!' };

  const needFrom = targetCount * CURRENCY_RATIO;
  if ((c[fromKey] || 0) < needFrom) {
    return { success: false, msg: `Không đủ ${tier.name}! Cần ${needFrom.toLocaleString()} ${tier.short}.` };
  }

  c[fromKey] -= needFrom;
  c[tier.nextKey] = (c[tier.nextKey] || 0) + targetCount;
  if (fromKey === 'low' || tier.nextKey === 'low') gameState.gold = c.low;

  return {
    success: true,
    msg: `Đổi thành công ${needFrom.toLocaleString()} ${tier.short} ➔ +${targetCount} ${CURRENCY_MAP[tier.nextKey].short}!`
  };
}

/**
 * Đổi xuống bậc thấp hơn (Tỷ lệ 1 : 10,000)
 */
export function exchangeDown(gameState, fromKey, count = 1) {
  const c = ensureCurrencies(gameState);
  const tier = CURRENCY_MAP[fromKey];
  if (!tier || !tier.prevKey) return { success: false, msg: 'Không thể tách bậc thấp hơn!' };

  if ((c[fromKey] || 0) < count) {
    return { success: false, msg: `Không đủ ${tier.name}! Cần ${count} ${tier.short}.` };
  }

  const gainAmount = count * CURRENCY_RATIO;
  c[fromKey] -= count;
  c[tier.prevKey] = (c[tier.prevKey] || 0) + gainAmount;
  if (fromKey === 'low' || tier.prevKey === 'low') gameState.gold = c.low;

  return {
    success: true,
    msg: `Tách thành công ${count} ${tier.short} ➔ +${gainAmount.toLocaleString()} ${CURRENCY_MAP[tier.prevKey].short}!`
  };
}

/**
 * Định dạng hiển thị chuỗi tiền tệ ngắn gọn
 */
export function formatCurrencySummary(gameState) {
  const c = ensureCurrencies(gameState);
  const parts = [];
  if (c.extreme > 0) parts.push(`👑 ${c.extreme.toLocaleString()} Cực`);
  if (c.high > 0) parts.push(`✨ ${c.high.toLocaleString()} Thượng`);
  if (c.mid > 0) parts.push(`🔮 ${c.mid.toLocaleString()} Trung`);
  if (c.low > 0) parts.push(`💎 ${c.low.toLocaleString()} Sơ`);
  if (c.silver > 0 || parts.length === 0) parts.push(`🪙 ${c.silver.toLocaleString()} Bạc`);
  return parts.slice(0, 2).join(' · ');
}
