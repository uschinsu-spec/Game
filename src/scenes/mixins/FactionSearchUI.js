const FONT='Be Vietnam Pro, sans-serif';

function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}
function kindLabel(f){return f?.archetype==='SECT'?'TÔNG MÔN':(f?.archetype==='CULTIVATION_FAMILY'||f?.archetype==='ANCIENT_CLAN')?'GIA TỘC':f?.archetype||'THẾ LỰC';}

export function installFactionSearchUI(MainGameScene,{network,coordinator}={}){
  if(!MainGameScene?.prototype||!network)return;
  const p=MainGameScene.prototype;
  if(p.__factionSearchUiInstalled)return;
  p.__factionSearchUiInstalled=true;

  p.openFactionSearchPanel=function(query=''){
    const q=normalize(query).trim();
    const all=network.getAllKnownFactions();
    const list=all.filter(f=>{
      if(!q)return Boolean(f.meta?.canonical)||f.visibility==='PUBLIC';
      const haystack=normalize([
        f.name,f.id,f.meta?.rankLabel,f.meta?.territoryName,f.meta?.seatName,
        ...(f.meta?.focus||[]),...(f.tags||[])
      ].join(' '));
      return haystack.includes(q);
    }).sort((a,b)=>{
      const ca=a.meta?.canonical?1:0,cb=b.meta?.canonical?1:0;
      if(ca!==cb)return cb-ca;
      return String(a.name).localeCompare(String(b.name),'vi');
    }).slice(0,11);

    const panel=this.createModalShell?.('TÌM THẾ LỰC',q?`Kết quả cho “${query}”`:`${all.length} thế lực có thể tra cứu`,{subtitleColor:'#9aeaff'});
    if(!panel)return null;

    if(!list.length){
      const empty=this.add.text(0,-40,'Không tìm thấy thế lực phù hợp.\nCó thể tìm theo tên, cấp bậc, địa bàn hoặc chuyên môn.',{fontFamily:FONT,fontSize:'13px',color:'#9bb6c2',align:'center',wordWrap:{width:390,useAdvancedWrap:true}}).setOrigin(.5);
      panel.add(empty);return panel;
    }

    list.forEach((f,i)=>{
      const intel=coordinator?.getFactionIntel?.(f.id);
      const publicKnown=f.visibility==='PUBLIC'||Boolean(f.meta?.canonical);
      const name=intel?.name||(publicKnown?f.name:'Chưa đủ tình báo');
      const rank=intel?.powerTier||f.meta?.rankLabel||f.powerTier||'—';
      const territory=f.meta?.territoryName||f.homeTerritoryId||'—';
      const label=`${name}\n${kindLabel(f)} • ${rank} • ${territory}`;
      const y=-304+i*57;
      const bg=this.add.rectangle(0,y,450,50,0x0d3347,1).setStrokeStyle(1,f.archetype==='SECT'?0xa97be1:0xd99858).setInteractive({useHandCursor:true});
      const t=this.add.text(-205,y,label,{fontFamily:FONT,fontSize:'10.5px',color:publicKnown||intel?'#fff1d6':'#9bb6c2',lineSpacing:3,wordWrap:{width:400,useAdvancedWrap:true}}).setOrigin(0,.5);
      bg.on('pointerdown',()=>{if(publicKnown||intel)this.openFactionPanel?.(f.id);});
      panel.add([bg,t]);
    });
    return panel;
  };
}
