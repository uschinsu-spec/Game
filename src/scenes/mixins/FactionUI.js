const FONT='Be Vietnam Pro, sans-serif';

function txt(scene,panel,x,y,text,size='13px',color='#e7fbff',width=440){
  const t=scene.add.text(x,y,text,{fontFamily:FONT,fontSize:size,color,wordWrap:{width,useAdvancedWrap:true},lineSpacing:5}).setOrigin(0,0);
  panel.add(t);
  return t;
}

function archetypeLabel(faction){
  if(faction?.archetype==='SECT')return 'TÔNG MÔN';
  if(faction?.archetype==='ANCIENT_CLAN')return 'CỔ TỘC / THẾ GIA';
  if(faction?.archetype==='CULTIVATION_FAMILY')return 'TU TIÊN GIA TỘC';
  return faction?.archetype||'THẾ LỰC';
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
    const economy=coordinator?.economyByFaction?.get(f.id)||{};
    const diplomacy=(coordinator?.diplomacy?.toJSON?.()||[]).filter(r=>r.a===f.id||r.b===f.id).slice(0,3);
    const meta=f.meta||{};
    const canonical=Boolean(meta.canonical);

    txt(this,panel,-220,-320,`${archetypeLabel(f)} • ${meta.rankLabel||f.powerTier} • ${status}`,'12px',f.archetype==='SECT'?'#cfa0ff':'#ffc27d');
    txt(this,panel,-220,-282,`${canonical?'CANONICAL • ':''}${meta.seatName||'Tổng bộ/Tổ địa'}\nĐịa bàn gốc: ${meta.territoryName||f.homeTerritoryId||'—'}\nChuyên môn: ${(meta.focus||f.tags||[]).slice(0,4).join(' • ')||'—'}`,'12px','#e7fbff',430);
    txt(this,panel,-220,-190,`Cơ cấu: ${meta.leaderTitle||'Thủ lĩnh'} • ${meta.elderTitle||'Trưởng lão'}\nTuyển người: ${meta.recruitmentPolicy||'Theo quy chế thế lực'}\nMở rộng: ${meta.branchPolicy||'Theo tình hình lãnh địa'}`,'12px','#bdefff',430);
    txt(this,panel,-220,-98,`Chi nhánh cố định: ${branches.length} • Chư hầu: ${vassals.length}\n${branches.slice(0,4).map(b=>`• ${b.displayName||b.markerLabel||b.branchType}`).join('\n')||'• Chưa có phân chi'}`,'11.5px','#ffe9a8',430);
    txt(this,panel,-220,24,`Ảnh hưởng tại khu vực hiện tại${currentTerritoryId?` (${currentTerritoryId})`:''}:\nChính trị ${Math.round(influence.political||0)} • Tu luyện ${Math.round(influence.cultivation||0)} • Kinh tế ${Math.round(influence.economic||0)} • Quân sự ${Math.round(influence.military||0)}`,'11.5px','#b8dbe8',430);
    txt(this,panel,-220,102,`Controller: Chính trị ${network.getFaction(controllers.politicalController)?.name||'Tranh chấp'} • Tu luyện ${network.getFaction(controllers.cultivationController)?.name||'Tranh chấp'}\nKinh tế: Ngân khố ${Math.round(economy.treasury||0)} • Thu ${Math.round(economy.income||0)}`,'11px','#a8c7d4',430);
    txt(this,panel,-220,174,`Quan hệ người chơi: ${relation.reputation??0}\nNgoại giao: ${diplomacy.map(r=>`${r.type} (T${Math.round(r.trust||0)})`).join(', ')||'Chưa có dữ liệu động'}`,'11px','#d7eff7',430);
    if(meta.description)txt(this,panel,-220,242,meta.description,'10.5px','#83a8b9',430);

    return panel;
  };
}
