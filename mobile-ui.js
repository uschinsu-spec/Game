window.setupMobileHud=function(hud){
  const root=hud.root;root.classList.add('xianxia-hud');
  const panel=root.querySelector('.top-left'),name=panel.querySelector('.name');name.textContent='Vân Du';
  const portrait=document.createElement('div');portrait.className='cultivator-portrait';portrait.innerHTML='<span class="atlas-icon icon-portrait" aria-hidden="true"></span>';panel.prepend(portrait);
  const eyebrow=document.createElement('div');eyebrow.className='cultivator-rank';eyebrow.textContent='TÁN TU · HẮC LÂM';name.before(eyebrow);
  const health=document.createElement('span');health.className='health-numbers';panel.querySelector('.bar').appendChild(health);
  panel.querySelector('.bar').setAttribute('aria-label','Sinh lực');
  const goldLabel=hud.gold.parentNode;if(goldLabel.firstChild.nodeType===3)goldLabel.firstChild.textContent='◈ ';
  const skills=['Kiếm khí','Phong luân','Lôi kích','Liên hoa','Thiên thạch'];
  hud.skillEls.forEach((button,i)=>{
    button.querySelector('svg')?.remove();
    const icon=document.createElement('span');icon.className=`atlas-icon icon-skill-${i}`;icon.setAttribute('aria-hidden','true');button.prepend(icon);
    const label=document.createElement('span');label.className='skill-name';label.textContent=skills[i];button.appendChild(label);
  });
  const bag=root.querySelector('.inventory-button');bag.innerHTML='<span class="atlas-icon icon-bag" aria-hidden="true"></span><span>Túi đồ</span>';bag.setAttribute('aria-label','Mở túi đồ');bag.title='Túi đồ [I]';
  const title=root.querySelector('.inventory-title');title.innerHTML='<span>TÚI CÀN KHÔN</span><button type="button" class="inventory-close" aria-label="Đóng túi đồ">×</button>';
  title.querySelector('button').addEventListener('click',()=>hud.toggleInventory());
  const location=document.createElement('div');location.className='map-location';location.textContent='HẮC LÂM';root.querySelector('.minimap').appendChild(location);
  const notice=document.createElement('div');notice.className='respawn-notice';notice.setAttribute('role','status');notice.hidden=true;root.appendChild(notice);
  const update=hud.update.bind(hud);hud.update=function(){
    update();health.textContent=`${Math.ceil(hud.player.hp)} / ${hud.player.maxHp}`;
    panel.classList.toggle('low-health',hud.player.hp/hud.player.maxHp<.3);
    notice.hidden=!hud.player.dead;if(hud.player.dead)notice.textContent=`Nguyên thần hồi phục · ${Math.max(1,Math.ceil(hud.player.respawn))}s`;
    // Limit nameplate clutter around the player's silhouette on small screens.
    for(const monster of hud.entities.monsters){const label=hud.labels.get(monster.id);label.classList.toggle('minor-enemy',hud.combat.target?.id!==monster.id);}
    hud.skillEls.forEach((button,i)=>button.setAttribute('aria-label',skills[i]+(hud.combat.cds[i]>0?`, hồi chiêu ${Math.ceil(hud.combat.cds[i])} giây`:'')));
  };
};
