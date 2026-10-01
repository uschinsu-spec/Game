const FAMILY_ARCHETYPES = new Set(['CULTIVATION_FAMILY', 'ANCIENT_CLAN']);
export const CLAN_RANKS = Object.freeze(['Ngoại Tính','Khách Khanh','Bàng Hệ','Trực Hệ','Chi Chủ','Trưởng Lão','Tộc Trưởng','Lão Tổ']);
const FONT = 'Be Vietnam Pro, sans-serif';

const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v || 0)));
export const fmt = value => Math.round(Number(value || 0)).toLocaleString('vi-VN');

export function getClanCoordinator(scene) { return scene?.getFactionRuntimeCoordinator?.() || scene?.__factionCoordinator || null; }
export function getClanNetwork(scene) { return getClanCoordinator(scene)?.network || scene?.getFactionRuntime?.()?.network || null; }

function factionFromOverride(network, value) {
  if (!value) return null;
  if (typeof value === 'string') return network?.getFaction?.(value) || null;
  if (value.id) return network?.getFaction?.(value.id) || value;
  return null;
}

function pickContextClan(scene, network) {
  const context = scene?.getCurrentFactionContext?.() || scene?.__factionContext || null;
  if (!context) return null;
  const cultivationId = context.controllers?.cultivationController;
  const controlled = cultivationId ? network?.getFaction?.(cultivationId) : null;
  if (controlled && FAMILY_ARCHETYPES.has(controlled.archetype)) return controlled;
  return (context.factions || []).find(f => FAMILY_ARCHETYPES.has(f?.archetype)) || null;
}

export function resolveClanContext(scene, factionOverride = null) {
  const coordinator = getClanCoordinator(scene);
  coordinator?.expireContracts?.();
  const network = getClanNetwork(scene);
  const state = coordinator?.state || coordinator?.gameState?.factionState || null;
  let faction = factionFromOverride(network, factionOverride);
  if (faction && !FAMILY_ARCHETYPES.has(faction.archetype)) faction = null;
  const affiliation = state?.affiliations?.CULTIVATION || state?.affiliations?.cultivation || null;
  if (!faction) faction = pickContextClan(scene, network);
  if (!faction && affiliation?.factionId) {
    const affiliated = network?.getFaction?.(affiliation.factionId);
    if (affiliated && FAMILY_ARCHETYPES.has(affiliated.archetype)) faction = affiliated;
  }
  if (!faction) return null;
  const relation = state?.relations?.[faction.id] || Object.freeze({ factionId: faction.id, reputation: 0, trust: 0, loyalty: 0, contribution: 0, prestige: 0, debt: 0, membershipRank: null });
  const membership = affiliation?.factionId === faction.id ? affiliation : null;
  const detail = coordinator?.materializeFactionSystems?.(faction.id) || null;
  const branches = network?.getFactionBranches?.(faction.id) || [];
  const vassals = network?.getFactionVassals?.(faction.id) || [];
  const territoryId = coordinator?.currentTerritoryId || scene?.getCurrentFactionContext?.()?.territoryId || null;
  const localBranch = branches.find(b => b.territoryId === territoryId) || null;
  return { scene, coordinator, network, state, faction, relation, membership, detail, branches, vassals, territoryId, localBranch };
}

export function isClanOfficialMember(ctx) { return !!ctx?.membership; }
export function isClanGuest(ctx) {
  if (!ctx?.faction?.id) return false;
  const cycle = Number(ctx.coordinator?.cycle || 0);
  return (ctx.state?.contracts || []).some(c => c.factionId === ctx.faction.id && c.type === 'guestElder' && c.status === 'active' && cycle < Number(c.startCycle || 0) + Number(c.duration || 0));
}
export function isClanMember(ctx) { return isClanOfficialMember(ctx) || isClanGuest(ctx); }
export function clanRank(ctx) {
  if (isClanGuest(ctx) && !isClanOfficialMember(ctx)) return 'Khách Khanh';
  return ctx?.relation?.membershipRank || ctx?.membership?.membershipRank || ctx?.membership?.rank || (isClanOfficialMember(ctx) ? CLAN_RANKS[0] : 'Khách Vãng Lai');
}
export function clanRankIndex(ctx) { const idx = CLAN_RANKS.indexOf(clanRank(ctx)); return idx < 0 ? -1 : idx; }
export function relationBand(value) { const v=Number(value||0); if(v<=-800)return'Tử Thù'; if(v<=-400)return'Thù Địch'; if(v<=-100)return'Ác Cảm'; if(v<100)return'Trung Lập'; if(v<300)return'Thiện Cảm'; if(v<600)return'Hữu Hảo'; if(v<900)return'Tôn Kính'; return'Sùng Kính'; }

export function clanSummary(ctx) {
  if (!ctx) return null;
  const econ = ctx.detail?.economy || {};
  return Object.freeze({
    name: ctx.faction.name,
    archetype: ctx.faction.archetype,
    rank: clanRank(ctx),
    member: isClanMember(ctx),
    reputation: Number(ctx.relation.reputation || 0),
    trust: Number(ctx.relation.trust || 0),
    loyalty: Number(ctx.relation.loyalty || 0),
    contribution: Number(ctx.relation.contribution || 0),
    treasury: Number(econ.treasury ?? ctx.faction.economy?.treasury ?? 0),
    branches: ctx.branches.length,
    vassals: ctx.vassals.length,
    localBranch: ctx.localBranch?.name || ctx.localBranch?.id || null,
    relationBand: relationBand(ctx.relation.reputation)
  });
}

export function syncClan(ctx) { ctx?.coordinator?.syncToGameState?.(); return resolveClanContext(ctx?.scene, ctx?.faction?.id); }

export function updateClanRelation(ctx, delta = {}) {
  if (!ctx?.coordinator || !ctx?.faction?.id) return null;
  const next = ctx.coordinator.updateFactionReputation(ctx.faction.id, delta);
  ctx.coordinator.syncToGameState?.();
  return next;
}

export function setClanMembershipRank(ctx, membershipRank) {
  if (!ctx?.coordinator || !ctx?.faction?.id) return null;
  const current = ctx.state?.relations?.[ctx.faction.id] || ctx.relation || { factionId: ctx.faction.id };
  const next = Object.freeze({ ...current, membershipRank: membershipRank ?? null });
  ctx.coordinator.state.relations = { ...(ctx.coordinator.state.relations || {}), [ctx.faction.id]: next };
  const affiliation = ctx.coordinator.state.affiliations?.CULTIVATION;
  if (affiliation?.factionId === ctx.faction.id && membershipRank != null) {
    ctx.coordinator.setPlayerAffiliation('CULTIVATION', ctx.faction.id, { ...affiliation, membershipRank });
  }
  ctx.coordinator.syncToGameState?.();
  return next;
}

export function recordClanMemory(ctx, type='helpedFaction', { severity=1, actionKey=null, meta={} }={}) {
  if (!ctx?.coordinator) return null;
  const memory = ctx.coordinator.addFactionMemory(ctx.faction.id, type, {
    severity,
    sourceTerritoryId: ctx.territoryId,
    meta: { ...meta, actionKey, timestamp: Date.now() }
  });
  ctx.coordinator.syncToGameState?.();
  return memory;
}

export function claimClanTimedBenefit(ctx, actionKey, cooldownMs, { contribution=0, loyalty=0, prestige=0, severity=.2, toast='Đã nhận phúc lợi.' }={}) {
  if (!isClanMember(ctx)) return { ok:false, reason:'NOT_MEMBER', message:'Bạn chưa phải thành viên gia tộc này.' };
  const list = ctx.state?.memories?.[ctx.faction.id] || [];
  const last = [...list].reverse().find(m => m?.meta?.actionKey === actionKey);
  const lastAt = Number(last?.meta?.timestamp || 0);
  const remain = Math.max(0, cooldownMs - (Date.now() - lastAt));
  if (remain > 0) return { ok:false, reason:'COOLDOWN', remainMs:remain, message:`Còn ${Math.ceil(remain/3600000)} giờ mới có thể nhận lại.` };
  recordClanMemory(ctx, 'helpedFaction', { severity, actionKey });
  updateClanRelation(ctx, { contribution, loyalty, prestige });
  return { ok:true, message:toast };
}

export function spendClanContribution(ctx, amount) {
  amount = Math.max(0, Number(amount || 0));
  if (!isClanMember(ctx)) return { ok:false, reason:'NOT_MEMBER', message:'Chỉ tộc nhân/khách khanh mới sử dụng được.' };
  const current = Number(ctx.state?.relations?.[ctx.faction.id]?.contribution ?? ctx.relation?.contribution ?? 0);
  if (current < amount) return { ok:false, reason:'INSUFFICIENT_CONTRIBUTION', message:`Cần ${fmt(amount)} cống hiến, hiện có ${fmt(current)}.` };
  updateClanRelation(ctx, { contribution: -amount });
  return { ok:true, remaining: current - amount };
}

export function joinClan(ctx) {
  if (!ctx?.coordinator) return { ok:false, message:'Faction V5 chưa sẵn sàng.' };
  if (isClanMember(ctx)) return { ok:false, message:'Bạn đã thuộc gia tộc này.' };
  if (ctx.faction.archetype === 'ANCIENT_CLAN') {
    if (isClanGuest(ctx)) return { ok:false, message:'Bạn đã có khế ước Khách Khanh với cổ tộc này.' };
    const contract = ctx.coordinator.acceptFactionContract({ factionId:ctx.faction.id, type:'guestElder', duration:720, payment:{ contribution:300 }, obligations:['Bảo vệ lợi ích cổ tộc','Không tiết lộ bí mật huyết mạch'], secrecy:.25 });
    updateClanRelation(ctx,{reputation:30, trust:20});
    setClanMembershipRank(ctx,'Khách Khanh');
    return { ok:true, guest:true, contract, message:'Đã ký khế ước Khách Khanh. Khế ước có thể tồn tại song song với thế lực tu luyện chính; huyết mạch trực hệ vẫn cần điều kiện riêng.' };
  }
  const occupied = ctx.state?.affiliations?.CULTIVATION;
  if (occupied?.factionId && occupied.factionId !== ctx.faction.id) return { ok:false, reason:'CULTIVATION_OCCUPIED', message:'Bạn đang có một thế lực tu luyện chính. Hãy rời thế lực đó trước khi gia nhập gia tộc thường.' };
  ctx.coordinator.setPlayerAffiliation('CULTIVATION', ctx.faction.id, { membershipRank:'Ngoại Tính', joinedAt:Date.now(), source:'clan_hall' });
  updateClanRelation(ctx,{reputation:20, trust:10, loyalty:10});
  setClanMembershipRank(ctx,'Ngoại Tính');
  recordClanMemory(resolveClanContext(ctx.scene,ctx.faction.id),'helpedFaction',{severity:.2,actionKey:'clan.join'});
  return { ok:true, message:`Đã gia nhập ${ctx.faction.name} với thân phận Ngoại Tính.` };
}

export function leaveClan(ctx) {
  if (!isClanMember(ctx)) return { ok:false, message:'Bạn không thuộc gia tộc/khế ước Khách Khanh này.' };
  if (isClanOfficialMember(ctx)) ctx.coordinator.clearPlayerAffiliation('CULTIVATION');
  const guest = (ctx.state?.contracts || []).find(c => c.factionId === ctx.faction.id && c.type === 'guestElder' && c.status === 'active');
  if (guest) ctx.coordinator.clearFactionContract?.(guest.id);
  updateClanRelation(ctx,{loyalty:-100, reputation:-30});
  setClanMembershipRank(ctx,null);
  ctx.coordinator.syncToGameState?.();
  return { ok:true, message:`Đã rời ${ctx.faction.name}. Quan hệ cá nhân vẫn được lưu.` };
}

export function promoteClanMember(ctx) {
  if (!isClanOfficialMember(ctx)) return { ok:false, message:'Khách Khanh không thể thăng huyết mạch/gia phả. Cần trở thành tộc nhân chính thức.' };
  const relation = ctx.state?.relations?.[ctx.faction.id] || ctx.relation;
  const currentName = relation.membershipRank || clanRank(ctx);
  const idx = Math.max(0, CLAN_RANKS.indexOf(currentName));
  if (idx >= CLAN_RANKS.length - 1) return { ok:false, message:'Đã đạt cấp bậc cao nhất.' };
  const requirements = [0,150,500,1200,2600,5200,9000,15000];
  const repReq = [0,0,100,250,450,650,800,900];
  const nextIdx = idx + 1;
  if (Number(relation.contribution||0) < requirements[nextIdx]) return { ok:false, message:`Cần ${fmt(requirements[nextIdx])} tổng cống hiến để thăng ${CLAN_RANKS[nextIdx]}.` };
  if (Number(relation.reputation||0) < repReq[nextIdx]) return { ok:false, message:`Cần ${fmt(repReq[nextIdx])} uy tín với gia tộc.` };
  updateClanRelation(ctx,{prestige:25, loyalty:10});
  setClanMembershipRank(ctx,CLAN_RANKS[nextIdx]);
  return { ok:true, rank:CLAN_RANKS[nextIdx], message:`Đã thăng cấp: ${CLAN_RANKS[nextIdx]}.` };
}

export function acceptClanDuty(ctx, { type='escort', duration=12, payment={}, obligations=[], penalties=[] }={}) {
  if (!ctx?.coordinator) return { ok:false, message:'Faction V5 chưa sẵn sàng.' };
  if (!isClanMember(ctx)) return { ok:false, message:'Chỉ tộc nhân hoặc Khách Khanh đang có hiệu lực mới nhận được ủy thác nội bộ.' };
  const exists = (ctx.state?.contracts || []).find(c => c.factionId === ctx.faction.id && c.type === type && c.status === 'active');
  if (exists) return { ok:false, existing:exists, message:'Bạn đã có một khế ước cùng loại đang hoạt động.' };
  const contract = ctx.coordinator.acceptFactionContract({ factionId:ctx.faction.id, type, duration, payment, obligations, penalties });
  ctx.coordinator.syncToGameState?.();
  return { ok:true, contract, message:'Đã nhận ủy thác. Khế ước đã được lưu vào Faction V5.' };
}

export function getClanQuestHooks(ctx) {
  const hooks = ctx?.coordinator?.getQuestHooks?.(ctx.faction.id) || [];
  const normalized = hooks.map(h => typeof h === 'string' ? h : (h?.title || h?.id || 'Ủy thác gia tộc')).filter(Boolean);
  return (normalized.length ? normalized : ['Bảo vệ sản nghiệp gia tộc','Hộ tống thương đội','Thu thập tài nguyên huyết mạch']).slice(0,3);
}

export function getClanDiplomacyRows(ctx, limit=6) {
  const map = new Map();
  for (const r of ctx?.network?.relations || []) {
    if (r.a !== ctx.faction.id && r.b !== ctx.faction.id) continue;
    map.set(r.id, r);
  }
  for (const r of ctx?.coordinator?.diplomacy?.toJSON?.() || []) {
    if (r.a !== ctx.faction.id && r.b !== ctx.faction.id) continue;
    map.set(r.id, r);
  }
  return [...map.values()].map(r => {
    const otherId = r.a === ctx.faction.id ? r.b : r.a;
    const other = ctx.network?.getFaction?.(otherId);
    return { ...r, otherId, otherName:other?.name || otherId };
  }).slice(0,limit);
}

export function createClanModal(scene, { title, subtitle, accent=0xf59e0b, background=0x0a141d, height=760 }={}) {
  scene?.closeModal?.();
  const width = Number(scene?.scale?.width || scene?.game?.config?.width || 540);
  const screenH = Number(scene?.scale?.height || scene?.game?.config?.height || 960);
  const pW = Math.min(500, width - 24), pH = Math.min(height, screenH - 28);
  const modal = scene.add.container(width/2, screenH/2).setDepth(2000005).setScrollFactor(0);
  const overlay = scene.add.rectangle(0,0,width,screenH,0x000000,.78).setInteractive(); modal.add(overlay);
  const panel = scene.add.graphics(); panel.fillStyle(background,.985); panel.fillRoundedRect(-pW/2,-pH/2,pW,pH,14); panel.lineStyle(2,accent,.95); panel.strokeRoundedRect(-pW/2,-pH/2,pW,pH,14); modal.add(panel);
  modal.add(scene.add.text(0,-pH/2+31,title,{fontFamily:'Cinzel, Philosopher, serif',fontSize:'19px',color:'#fff4bf',fontStyle:'bold',align:'center',wordWrap:{width:pW-44}}).setOrigin(.5));
  modal.add(scene.add.text(0,-pH/2+61,subtitle||'',{fontFamily:FONT,fontSize:'11px',color:'#d6ecf7',align:'center',wordWrap:{width:pW-44}}).setOrigin(.5));
  const close=()=>{ if(!modal?.active) return; modal.destroy(true); if(scene.activeModal===modal)scene.activeModal=null; if(scene.activeModalOverlay===overlay)scene.activeModalOverlay=null; };
  const closeHit=scene.add.rectangle(0,pH/2-31,156,36,accent,.28).setStrokeStyle(1,accent).setInteractive({useHandCursor:true});
  const closeTxt=scene.add.text(0,pH/2-31,'✕ ĐÓNG',{fontFamily:FONT,fontSize:'13px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5); closeHit.on('pointerdown',close); modal.add([closeHit,closeTxt]);
  scene.activeModal=modal; scene.activeModalOverlay=overlay;
  return {modal,pW,pH,close,contentTop:-pH/2+92};
}

export function addClanInfo(scene, modal, x, y, text, {size='12px',color='#d9eef7',width=440,style='normal'}={}) {
  const t=scene.add.text(x,y,text,{fontFamily:FONT,fontSize:size,color,fontStyle:style,wordWrap:{width,useAdvancedWrap:true},lineSpacing:4}); modal.add(t); return t;
}

export function addClanActionCard(scene, modal, { y, title, body='', button='THỰC HIỆN', accent=0xf59e0b, enabled=true, onPress=null, height=94 }={}) {
  const box=scene.add.rectangle(0,y,450,height,0x132330,.92).setStrokeStyle(1,accent,.6); modal.add(box);
  addClanInfo(scene,modal,-210,y-height/2+10,title,{size:'13px',color:'#fef08a',width:410,style:'bold'});
  addClanInfo(scene,modal,-210,y-height/2+33,body,{size:'10.5px',color:'#cbd5e1',width:300});
  const btn=scene.add.rectangle(160,y+height/2-22,108,28,enabled?accent:0x334155,enabled?.8:.5).setStrokeStyle(1,enabled?accent:0x64748b).setInteractive({useHandCursor:enabled});
  const txt=scene.add.text(160,y+height/2-22,button,{fontFamily:FONT,fontSize:'9.5px',fontStyle:'bold',color:enabled?'#ffffff':'#94a3b8'}).setOrigin(.5); modal.add([btn,txt]);
  if(enabled&&onPress)btn.on('pointerdown',onPress);
  return {box,btn,txt};
}

export function toastClan(scene, result, okIcon='✅') { scene?.showToast?.(`${result?.ok===false?'⚠️':okIcon} ${result?.message || ''}`); }
