const FONT='Be Vietnam Pro, sans-serif';

function txt(scene,panel,x,y,text,size='13px',color='#e7fbff',width=440){
  const t=scene.add.text(x,y,text,{fontFamily:FONT,fontSize:size,color,wordWrap:{width,useAdvancedWrap:true},lineSpacing:4}).setOrigin(0,0);
  panel.add(t);
  return t;
}

function archetypeLabel(faction){
  if(faction?.archetype==='SECT')return 'TÔNG MÔN';
  if(faction?.archetype==='ANCIENT_CLAN')return 'CỔ TỘC / THẾ GIA';
  if(faction?.archetype==='CULTIVATION_FAMILY')return 'TU TIÊN GIA TỘC';
  return faction?.archetype||'THẾ LỰC';
}

function compactNumber(value){
  const n=Math.max(0,Number(value||0));
  if(n>=1000000)return `${(n/1000000).toFixed(n>=10000000?0:1)}M`;
  if(n>=1000)return `${(n/1000).toFixed(n>=10000?0:1)}K`;
  return String(Math.round(n));
}

function topResources(resources={}){
  const labels={spiritStone:'Linh Thạch',herbs:'Linh Thảo',ores:'Khoáng',monsterMaterials:'Yêu Liệu',formationMaterials:'Trận Liệu',pillIngredients:'Đan Liệu',weaponMaterials:'Khí Liệu',rareTreasures:'Dị Bảo'};
  return Object.entries(resources)
    .filter(([,v])=>Number(v)>0)
    .sort((a,b)=>Number(b[1])-Number(a[1]))
    .slice(0,4)
    .map(([k,v])=>`${labels[k]||k} ${compactNumber(v)}`)
    .join(' • ');
}

export function installFactionUI(MainGameScene,{network,gameState,coordinator}={}){
  if(!MainGameScene?.prototype||!network)return;
  const p=MainGameScene.prototype;
  if(p.__factionUiInstalled)return;
  p.__factionUiInstalled=true;

  p.openFactionPanel=function(factionId){
    const f=network.getFaction(factionId);
    if(!f)return null;
    const panel=this.createModalShell?.('THẾ LỰC NHÂN GIỚI',f.name,{subtitleColor:'#9aeaff',headerFill:0x0a3b52,bgFill:0x062a3b});
    if(!panel)return null;

    const state=coordinator?.state||gameState?.factionState||{};
    const relation=state.relations?.[f.id]||{};
    const currentTerritoryId=coordinator?.currentTerritoryId;
    const controllers=currentTerritoryId?network.getTerritoryControllers(currentTerritoryId):{};
    const influence=currentTerritoryId?(network.getInfluenceForTerritory(currentTerritoryId).find(x=>x.factionId===f.id)?.influence||{}):{};
    const branches=network.getFactionBranches(f.id);
    const vassals=network.getFactionVassals?.(f.id)||[];
    const status=coordinator?.factionStatuses?.get(f.id)||'STABLE';
    const economy=coordinator?.economyByFaction?.get(f.id)||f.economy||{};
    const diplomacy=(coordinator?.diplomacy?.toJSON?.()||[]).filter(r=>r.a===f.id||r.b===f.id).slice(0,3);
    const meta=f.meta||{};
    const canonical=Boolean(meta.canonical);
    const pop=f.population||{};
    const cultivators=f.cultivators||{};
    const org=f.organization||{};
    const resources=f.resources||{};

    txt(this,panel,-220,-322,`${archetypeLabel(f)} • ${meta.rankLabel||f.powerTier} • ${status}`,'12px',f.archetype==='SECT'?'#cfa0ff':'#ffc27d');
    txt(this,panel,-220,-289,`${canonical?'CANONICAL • ':''}${meta.seatName||f.headquarters?.name||'Tổng bộ/Tổ địa'}\n${meta.leaderTitle||'Thủ lĩnh'}: ${meta.leaderName||'—'} • Thành lập khoảng ${meta.foundingAge||'—'} năm\nĐịa bàn gốc: ${meta.territoryName||f.homeTerritoryId||'—'}`,'11.5px','#e7fbff',430);

    txt(this,panel,-220,-210,`TRUYỀN THỪA\n${meta.signatureTechnique||f.doctrine?.signatureTechnique||'—'} • ${(meta.focus||f.tags||[]).slice(0,4).join(' • ')}\n“${meta.motto||f.doctrine?.motto||'Tu đạo thủ tâm'}”`,'11px','#d9c7ff',430);

    txt(this,panel,-220,-128,`QUY MÔ\nNhân khẩu ${compactNumber(pop.population)} • Tu sĩ ${compactNumber(pop.cultivators)} • Tinh anh ${compactNumber(pop.eliteCultivators)} • Trưởng lão ${compactNumber(pop.elders)}\nCảnh giới thủ lĩnh: ${cultivators.leaderRealmIdx??0} • Lão tổ/Thái thượng: ${cultivators.ancestorRealmIdx??cultivators.leaderRealmIdx??0}`,'10.8px','#bdefff',430);

    const ranks=(org.ranks||[]).slice(-5).join(' › ');
    txt(this,panel,-220,-43,`TỔ CHỨC\n${ranks||`${meta.leaderTitle||'Thủ lĩnh'} • ${meta.elderTitle||'Trưởng lão'}`}\nTuyển người: ${meta.recruitmentPolicy||f.recruitment?.policy||'Theo quy chế thế lực'}`,'10.5px','#b8dbe8',430);

    txt(this,panel,-220,35,`PHÂN CHI ${branches.length} • CHƯ HẦU ${vassals.length}\n${branches.slice(0,3).map(b=>`• ${b.displayName||b.markerLabel||b.branchType}`).join('\n')||'• Chưa có phân chi'}`,'10px','#ffe9a8',430);

    txt(this,panel,-220,115,`KINH TẾ & TÀI NGUYÊN\nNgân khố ${compactNumber(economy.treasury)} • Thu ${compactNumber(economy.income)} • Thương ${compactNumber(economy.tradeIncome)}\n${topResources(resources)||'Chưa có thống kê tài nguyên'}`,'10px','#c9e7ca',430);

    txt(this,panel,-220,190,`ẢNH HƯỞNG HIỆN TẠI\nChính ${Math.round(influence.political||0)} • Tu ${Math.round(influence.cultivation||0)} • Kinh ${Math.round(influence.economic||0)} • Quân ${Math.round(influence.military||0)}\nQuan hệ người chơi ${relation.reputation??0} • ${diplomacy.map(r=>r.type).join(', ')||'Ngoại giao động chưa phát sinh'}`,'10px','#d7eff7',430);

    if(meta.description)txt(this,panel,-220,268,meta.description,'9.5px','#83a8b9',430);
    return panel;
  };
}
