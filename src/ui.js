import {RECOVERY_PILLS,recoveryInfo,recoveryChoices} from './core/recovery-pills.js';
import {EQUIPMENT_ICONS,PROFESSION_ICONS,MANUAL_ICONS} from './core/icon-catalog.js';
import {EQUIPMENT_SLOTS,EQUIPMENT_GRADES,EQUIPMENT_QUALITIES,equipmentId,equipmentInfo,equipmentRecipe} from './core/equipment-items.js';
import {GRADES,QUALITIES,resourceInfo,rankForFloor} from './core/profession-items.js';
const $=selector=>document.querySelector(selector);
import {Engine,REALMS,CONG_PHAP_LIST,CONG_PHAP_GRADES,SKILLS,SKILL_MASTERY_TIERS,availableSkills,manualCost,pillCost,cultivationPillForRealm,cultivationPillExp} from './cultivation.js';
import {floorNumber,FLOOR_COUNT} from './floors.js';
import {BEAST_MATERIALS,lootInfo} from './core/beast-loot.js';
function icon(file){const img=document.createElement('img');img.className='game-icon';img.alt='';img.setAttribute('aria-hidden','true');img.src=new URL('../assets/icons/'+file+'.webp',import.meta.url).href;return img;}
function prepend(parent,child){if(parent.prepend)parent.prepend(child);else parent.append(child);}
export class UI {
  constructor(game){
    this.game=game;this.lastHud=0;this.noticeTimer=0;
    this.overlay=$('#overlay');this.loading=$('#loading');
    this.autoBtn=$('#auto-btn');
    this.autoBtn.addEventListener('click',()=>{
      if(game.paused||game.player.dead)return;game.stopMeditation();
      game.auto=!game.auto;this.autoBtn.classList.toggle('on',game.auto);this.autoBtn.setAttribute('aria-pressed',String(game.auto));$('#auto-text').textContent=game.auto?'Đang tự đánh':'Tự đánh';
      this.toast(game.auto?'Đã bật tự động đánh quái':'Đã tắt tự động đánh');
    });
    $('#menu-btn').addEventListener('click',()=>this.menu());
    $('#character-btn').addEventListener('click',()=>this.character());
    $('#settings-btn').addEventListener('click',()=>this.settings());
    this.preferences={minimap:true,damageNumbers:true,bottomBar:true};
    try{const saved=JSON.parse(localStorage.getItem('van-moc-ui-preferences')||'{}');for(const key of Object.keys(this.preferences))if(typeof saved[key]==='boolean')this.preferences[key]=saved[key]}catch{}
    this.applyPreferences();
    this.skillSlots=["kiem_1","kiem_2","kiem_3","kiem_4","kiem_5"];try{const saved=JSON.parse(localStorage.getItem("van-moc-skill-slots")||"null");if(Array.isArray(saved)&&saved.length===5)this.skillSlots=saved.map(id=>id===null||SKILLS.some(sk=>sk.tier>0&&sk.id===id)?id:null)}catch{}
    this.attackSlot='basic_attack';try{const saved=JSON.parse(localStorage.getItem('van-moc-attack-slot')||'"basic_attack"');if(saved===null||SKILLS.some(sk=>sk.id===saved))this.attackSlot=saved}catch{}
    this.pillSlots={hp:null,mp:null};try{const saved=JSON.parse(localStorage.getItem('van-moc-pill-slots')||'{}');for(const kind of ['hp','mp'])if(recoveryInfo(kind,saved[kind]))this.pillSlots[kind]=saved[kind]}catch{}
    this.bindSkillSlots();
    $('#dock-toggle').addEventListener('click',()=>{this.preferences.bottomBar=!this.preferences.bottomBar;this.applyPreferences()});
    $('#bag-btn').addEventListener('click',()=>this.bag());
    $('#cultivation-btn').addEventListener('click',()=>{if(!game.player.dead)this.cultivation()});
    $('#resume-btn').addEventListener('click',()=>this.close());
    const closeBtn=$('#dialog-close-btn');
    if(closeBtn)closeBtn.addEventListener('click',()=>this.close());
    if(this.overlay){
      this.overlay.addEventListener('click',e=>{
        if(e.target===this.overlay)this.close();
      });
    }
    const tabNav=$('#dialog-nav-tabs');
    if(tabNav){
      const tabs=tabNav.querySelectorAll?tabNav.querySelectorAll('.nav-tab'):[];
      for(const t of tabs){
        t.addEventListener('click',()=>{
          const tab=t.dataset?.tab||t.getAttribute?.('data-tab');
          if(tab==='character')this.character();
          else if(tab==='bag')this.bag();
          else if(tab==='cultivation')this.cultivation();
          else if(tab==='menu')this.menu();
          else if(tab==='settings')this.settings();
        });
      }
    }
    $('#reset-btn').addEventListener('click',()=>{
      if(window.confirm('Bắt đầu lại từ Phàm Nhân? Tiến trình đã lưu sẽ bị xóa.')){
        this.close();game.reset();this.toast('Hành trình tu tiên mới bắt đầu!');
      }
    });
  }
  setActiveTab(tabName){
    const nav=$('#dialog-nav-tabs');
    if(nav)nav.hidden=!tabName;
    if(!tabName||!nav)return;
    const tabs=nav.querySelectorAll?nav.querySelectorAll('.nav-tab'):[];
    for(const t of tabs){
      const match=(t.dataset?.tab||t.getAttribute?.('data-tab'))===tabName;
      t.classList?.toggle?.('active',match);
    }
  }
  toast(message,duration=2900){
    const e=$('#notice');e.textContent=message;e.classList.add('show');
    clearTimeout(this.noticeTimer);this.noticeTimer=setTimeout(()=>e.classList.remove('show'),duration);
  }
  setLoading(message){$('#loading-text').textContent=message}
  hideLoading(){this.loading.hidden=true}
  update(now){
    if(now-this.lastHud<130)return;this.lastHud=now;
    const p=this.game.player;
    $('.map-name').textContent=`Tầng ${floorNumber(this.game.mapId)} / ${FLOOR_COUNT}`;
    $('#hp-fill').style.width=(100*p.hp/p.maxHp)+'%';$('#hp-text').textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;
    $('#mp-fill').style.width=(100*p.mp/p.maxMp)+'%';$('#mp-text').textContent=`${Math.ceil(p.mp)} / ${p.maxMp}`;
    const realm=Engine.getRealm(p),skill=SKILLS.find(s=>s.id===p.selectedSkillId);
    $('#level').textContent=realm.tier;$('#realm-name').textContent='· '+realm.major;
    $('#exp-fill').style.width=Math.min(100,100*p.exp/realm.expReq)+'%';
    $('#exp-text').textContent=p.realmIdx===28?'Hóa Thần Đỉnh Phong':`Tu vi ${Math.floor(p.exp)} / ${realm.expReq}${p.exp>=realm.expReq?' · Đột phá!':''}`;
    $('#skill-btn .button-label').textContent=p.realmIdx<1?'Chưa mở':skill.name;


    $('#gold').textContent=p.gold.toLocaleString('vi-VN');
    this.autoBtn.setAttribute('aria-pressed',String(this.game.auto));this.autoBtn.classList.toggle('on',this.game.auto);
    $('#auto-text').textContent=this.game.auto?'Đang tự đánh':'Tự đánh';
    this.refreshSkillSlots();this.refreshRecoveryPills();
    for(const [selector,value,max] of [['.meter.hp',p.hp,p.maxHp],['.meter.mp',p.mp,p.maxMp],['.meter.exp',p.exp,realm.expReq]]){
      const el=$(selector);el.setAttribute('aria-valuemin','0');el.setAttribute('aria-valuemax',String(max));el.setAttribute('aria-valuenow',String(Math.max(0,Math.min(max,value))));
    }
    $('#coords').textContent=`(${Math.round(p.x/1.43)}, ${Math.round(p.y/1.43)})`;
    for(const [key,id] of [['heal','heal-cd'],['mana','mana-cd']]){
      const cd=p.cooldowns[key]||0,el=$('#'+id),btn=el.parentElement;
      btn.classList.toggle('cooling',cd>0.05);el.textContent=cd>0.05?Math.ceil(cd):'';
    }
  }
  show(title,description,details='',tab=null){
    this.game.input.clear();
    const dt=$('#dialog-details');
    if(dt){
      dt.classList?.remove?.('skill-picker');
      dt.textContent=details;
    }
    clearTimeout(this.noticeTimer);
    const nt=$('#notice');if(nt)nt.classList?.remove?.('show');
    const cc=$('#cultivation-controls');if(cc)cc.hidden=true;
    const rb=$('#reset-btn');if(rb)rb.hidden=false;
    this.game.paused=true;
    const rsm=$('#resume-btn');if(rsm){rsm.onclick=null;rsm.textContent='Tiếp tục';}
    const dTitle=$('#dialog-title');if(dTitle)dTitle.textContent=title;
    const dText=$('#dialog-text');if(dText)dText.textContent=description;
    this.overlay.hidden=false;
    this.setActiveTab(tab);
  }
  slotSkill(index){
    const id=index<0?this.attackSlot:this.skillSlots[index];
    return SKILLS.find(sk=>(sk.tier>0||index<0&&sk.id==='basic_attack')&&sk.id===id&&sk.minRealm<=this.game.player.realmIdx);
  }
  refreshSkillSlots(){
    const p=this.game.player;
    const buttons=[[-1,$('#attack-btn')],[0,$('#skill-btn')],...Array.from({length:4},(_,i)=>[i+1,$('#quick-skill-'+(i+2))])];
    for(const [index,btn] of buttons){
      const sk=this.slotSkill(index);
      btn.disabled=false;btn.classList.toggle('locked',!sk);btn.classList.toggle('empty-slot',!sk);
      btn.setAttribute('aria-label',sk?sk.name+' · Nhấn giữ để đổi kỹ năng':'Ô kỹ năng trống · Nhấn giữ để chọn');
      btn.title=sk?sk.name+' · Nhấn giữ để đổi':'Nhấn giữ để chọn kỹ năng đã học';
      const img=btn.querySelector?.('img');if(img)img.hidden=!sk;
      if(sk&&img){const url=new URL('../assets/icons/skills/unique/'+sk.id+'.webp',import.meta.url).href;if(img.src!==url)img.src=url}
      const cd=p.cooldowns[sk?.id==='basic_attack'?'attack':'skill'];btn.classList.toggle('cooling',!!sk&&cd>.05);const cdEl=btn.querySelector?.('.cooldown');if(cdEl)cdEl.textContent=sk&&cd>.05?Math.ceil(cd):'';
    }
  }
  bindSkillSlots(){
    const buttons=[[-1,$('#attack-btn')],[0,$('#skill-btn')],...Array.from({length:4},(_,i)=>[i+1,$('#quick-skill-'+(i+2))]),['hp',$('#heal-btn')],['mp',$('#mana-btn')]];
    for(const [index,btn] of buttons){
      if(!btn)continue;
      btn.dataset??={};
      btn.dataset.skillSlot=String(index);
      let press=null;
      const cancel=()=>{if(press)clearTimeout(press.timer);press=null;btn.classList.remove('holding')};
      btn.addEventListener('pointerdown',e=>{
        if(e.button!==0||this.game.paused||this.game.player.dead)return;
        e.preventDefault();e.stopImmediatePropagation();cancel();btn.setPointerCapture(e.pointerId);
        press={id:e.pointerId,x:e.clientX,y:e.clientY,held:false};btn.classList.add('holding');
        press.timer=setTimeout(()=>{if(!press)return;press.held=true;btn.classList.remove('holding');this.skillPicker(index)},480);
      });
      btn.addEventListener('pointermove',e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>12)cancel()});
      btn.addEventListener('pointerup',e=>{if(!press||press.id!==e.pointerId)return;const held=press.held;cancel();if(!held)this.castSlot(index)});
      for(const event of ['pointercancel','lostpointercapture'])btn.addEventListener(event,cancel);
      btn.addEventListener('contextmenu',e=>e.preventDefault());
      btn.addEventListener('click',e=>{e.preventDefault();if(e.detail===0)this.castSlot(index)});
      btn.addEventListener('keydown',e=>{if(e.code==='Enter'&&e.shiftKey){e.preventDefault();this.skillPicker(index)}});
      if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('blur',cancel);
    }
  }
  castSlot(index){
    if(typeof index==='string'){this.castRecoverySlot(index);return}
    const sk=this.slotSkill(index),g=this.game;
    if(g.paused||g.player.dead)return;
    if(!sk){this.skillPicker(index);return}
    g.stopMeditation();if(sk.id==='basic_attack')g.attack();else{g.player.selectedSkillId=sk.id;g.skill()}
  }
  quickSkill(tier){this.castSlot(tier-1)}
  skillPicker(index){
    if(typeof index==='string'){this.pillPicker(index);return}
    this.show('Chọn kỹ năng','Kỹ năng trong các ô sẽ được Auto lần lượt sử dụng. Nhấn giữ ô để đổi.');
    $('#reset-btn').hidden=true;
    const details=$('#dialog-details');details.replaceChildren();details.classList.add('skill-picker');
    const skills=availableSkills(this.game.player);if(index<0)skills.unshift(SKILLS.find(sk=>sk.id==='basic_attack'));
    if(!skills.length){const p=document.createElement('p');p.textContent='Chưa học thần thông. Đột phá Luyện Khí Tầng 1 để mở kỹ năng.';details.append(p)}
    const choose=id=>{if(index<0){this.attackSlot=id;try{localStorage.setItem('van-moc-attack-slot',JSON.stringify(id))}catch{}}else{this.skillSlots[index]=id;try{localStorage.setItem('van-moc-skill-slots',JSON.stringify(this.skillSlots))}catch{}}this.refreshSkillSlots();this.close()};
    for(const sk of skills){
      const btn=document.createElement('button');btn.className='skill-choice';btn.dataset.skillId=sk.id;
      btn.setAttribute('aria-pressed',String((index<0?this.attackSlot:this.skillSlots[index])===sk.id));
      btn.append(icon('skills/unique/'+sk.id));const text=document.createElement('span');text.textContent=sk.name;btn.append(text);
      btn.addEventListener('click',()=>choose(sk.id));details.append(btn);
    }
    const clear=document.createElement('button');clear.className='skill-choice clear-skill';clear.textContent='Để trống ô';clear.addEventListener('click',()=>choose(null));details.append(clear);
  }
  refreshRecoveryPills(){
    const p=this.game.player;
    for(const kind of ['hp','mp']){
      const item=recoveryInfo(kind,this.pillSlots[kind]),count=item?p[item.source]?.[item.id]||0:0;
      const btn=$('#'+(kind==='hp'?'heal':'mana')+'-btn'),image=btn?.querySelector?.('img'),badge=$('#'+kind+'-pill-count');
      if(btn)btn.classList.toggle('empty-slot',!item||count<1);if(btn)btn.classList.toggle('out-of-pills',count<1);
      if(image)image.hidden=!item||count<1;if(badge)badge.hidden=!item||count<1;if(badge)badge.textContent=count;
      if(item&&image){const url=new URL('../assets/icons/'+item.icon+'.webp',import.meta.url).href;if(image.src!==url)image.src=url}
      if(btn){
        btn.title=item&&count>0?item.name+' · Có '+count+' · Giữ để đổi đan':'Ô đan hồi '+kind.toUpperCase()+' trống · Giữ để chọn từ túi đồ';
        btn.setAttribute('aria-label',btn.title);
      }
    }
  }
  castRecoverySlot(kind){
    const g=this.game;if(g.paused||g.player.dead)return;
    const item=recoveryInfo(kind,this.pillSlots[kind]);
    if(!item||(g.player[item.source]?.[item.id]||0)<1){this.pillPicker(kind);return}
    g.stopMeditation();g.useRecoveryPill(kind);
  }
  pillPicker(kind){
    this.show('Chọn đan dược hồi '+kind.toUpperCase(),'Chỉ hiển thị đan dược hồi phục đang có trong túi đồ.');$('#reset-btn').hidden=true;
    const details=$('#dialog-details');details.replaceChildren();details.classList.add('skill-picker');
    const choose=id=>{this.pillSlots[kind]=id;try{localStorage.setItem('van-moc-pill-slots',JSON.stringify(this.pillSlots))}catch{}this.refreshRecoveryPills();this.close()};
    const items=recoveryChoices(this.game.player,kind);
    if(!items.length){const text=document.createElement('p');text.textContent='Túi đồ chưa có đan dược phù hợp.';details.append(text)}
    for(const item of items){const btn=document.createElement('button');btn.className='skill-choice';btn.dataset.itemId=item.id;btn.setAttribute('aria-pressed',String(this.pillSlots[kind]===item.id));btn.append(icon(item.icon));const text=document.createElement('span');text.textContent=item.name+' ×'+this.game.player[item.source][item.id];btn.append(text);btn.addEventListener('click',()=>choose(item.id));details.append(btn)}
    const clear=document.createElement('button');clear.className='skill-choice clear-skill';clear.textContent='Để trống ô';clear.addEventListener('click',()=>choose(null));details.append(clear);
  }
  applyPreferences(){
    $('.mapbox').hidden=!this.preferences.minimap;
    this.game.showDamageNumbers=this.preferences.damageNumbers;
    $('#command-dock').hidden=!this.preferences.bottomBar;
    $('#game-shell').classList.toggle('dock-hidden',!this.preferences.bottomBar);
    const toggle=$('#dock-toggle');toggle.setAttribute('aria-expanded',String(this.preferences.bottomBar));toggle.textContent=this.preferences.bottomBar?'⌄':'⌃';
    toggle.title=this.preferences.bottomBar?'Ẩn thanh UI phía dưới':'Hiện thanh UI phía dưới';toggle.setAttribute('aria-label',toggle.title);
    try{localStorage.setItem('van-moc-ui-preferences',JSON.stringify(this.preferences))}catch{}
  }
  settings(){
    this.show('Cài Đặt','Tùy chỉnh hiển thị trong hành trình','','settings');
    const details=$('#dialog-details');
    if(details.replaceChildren)details.replaceChildren();

    const list=document.createElement('div');
    list.className='settings-list';

    const options=[
      ['minimap','Bản Đồ Thu Nhỏ','Hiển thị bản đồ mini ở góc trên bên phải màn hình'],
      ['damageNumbers','Số Sát Thương Bay','Hiển thị lượng sát thương nhảy số khi đánh trúng quái'],
      ['bottomBar','Thanh Công Cụ Dưới','Hiển thị thanh kỹ năng và phím thao tác phía dưới']
    ];

    for(const [key,title,desc] of options){
      const card=document.createElement('div');
      card.className='settings-card';
      const label=document.createElement('div');
      label.className='settings-card-label';
      const strong=document.createElement('strong');
      strong.textContent=title;
      const small=document.createElement('small');
      small.textContent=desc;
      label.append(strong,small);

      const toggle=document.createElement('label');
      toggle.className='gold-toggle';
      const input=document.createElement('input');
      input.type='checkbox';
      input.checked=this.preferences[key];
      const slider=document.createElement('span');
      slider.className='gold-toggle-slider';
      toggle.append(input,slider);

      input.addEventListener('change',()=>{
        this.preferences[key]=input.checked;
        this.applyPreferences();
        this.toast(`Đã ${input.checked?'bật':'tắt'} ${title.toLowerCase()}`);
      });

      card.append(label,toggle);
      list.append(card);
    }

    const versionCard=document.createElement('div');
    versionCard.className='settings-card';
    versionCard.style.marginTop='6px';
    const vLabel=document.createElement('div');
    vLabel.className='settings-card-label';
    const vTitle=document.createElement('strong');
    vTitle.textContent='Vạn Mộc Sâm Lâm · Tiên Hiệp Hoàng Kim';
    const vInfo=document.createElement('small');
    vInfo.textContent='Phiên bản MMORPG 5.0 · Engine Tu Tiên Top-down 2D';
    vLabel.append(vTitle,vInfo);
    versionCard.append(vLabel);
    list.append(versionCard);

    details.append(list);
    const rb=$('#reset-btn');
    if(rb)rb.hidden=true;
  }
  character(){
    const p=this.game.player,r=Engine.getRealm(p),cp=Engine.getCongPhap(p);
    this.show('Nhân Vật',r.name+' · '+r.major,'','character');
    const details=$('#dialog-details');
    if(details.replaceChildren)details.replaceChildren();

    const sheet=document.createElement('div');
    sheet.className='char-sheet';

    // Left: Character Showcase
    const showcase=document.createElement('div');
    showcase.className='char-showcase';
    const ring=document.createElement('div');
    ring.className='char-avatar-ring';
    const portrait=document.createElement('img');
    portrait.src=new URL('../assets/webp/UI/avatar.webp',import.meta.url).href;
    portrait.alt='Thanh Phong';
    ring.append(portrait);

    const nameBadge=document.createElement('div');
    nameBadge.className='char-name-badge';
    nameBadge.textContent='Thanh Phong (Kiếm Tu)';
    const realmBadge=document.createElement('div');
    realmBadge.className='char-realm-badge';
    realmBadge.textContent=r.name+' · '+r.tier;
    showcase.append(ring,nameBadge,realmBadge);

    const gearWrap=document.createElement('div');
    gearWrap.className='char-gear-wrap';
    for(const slot of EQUIPMENT_SLOTS){
      const id=p.gearSlots?.[slot.id],info=equipmentInfo(id);
      const slotTile=document.createElement('div');
      slotTile.className='char-gear-slot'+(info?' equipped':'');
      slotTile.title=slot.name+(info?`: ${info.name} (${GRADES[info.grade]} · ${QUALITIES[info.quality]}) - Nhấp để tháo`:' - Trống (Mở Túi Đồ để mặc)');

      const itemImg=icon(EQUIPMENT_ICONS[slot.id]);
      if(!info)itemImg.style.opacity='0.35';
      slotTile.append(itemImg);

      const tag=document.createElement('span');
      tag.className='gear-label';
      tag.textContent=slot.name.split(' ')[0];
      slotTile.append(tag);

      if(info){
        slotTile.addEventListener('click',()=>{
          if(this.game.unequipGear(slot.id)){
            this.toast('Đã tháo '+info.name);
            this.character();
          }
        });
      }else{
        slotTile.addEventListener('click',()=>this.bag());
      }
      gearWrap.append(slotTile);
    }
    showcase.append(gearWrap);

    // Right: Attributes Table Card
    const statsCard=document.createElement('div');
    statsCard.className='char-stats-card';
    const cardTitle=document.createElement('div');
    cardTitle.className='card-title';
    cardTitle.textContent='Chỉ Số Thuộc Tính Chiến Đấu';
    statsCard.append(cardTitle);

    const statsList=[
      ['Sinh Lực (HP)',Math.ceil(p.hp)+' / '+p.maxHp],
      ['Linh Lực (MP)',Math.ceil(p.mp)+' / '+p.maxMp],
      ['Công Kích',Engine.calcElementalDamage(p,'Vật Lý')+' (Vật Lý)'],
      ['Phòng Ngự',Engine.calcElementalDefense(p,'Vật Lý')],
      ['Tỷ Lệ Bạo Kích',Math.round(Engine.calcCritRate(p)*100)+'%'],
      ['Thần Thức',Engine.calcSpiritualSense(p)],
      ['Tốc Độ Ra Đòn',Engine.calcAttackInterval(p)+' ms'],
      ['Tốc Độ Tĩnh Tọa',Engine.calcMeditationRate(p).toLocaleString('vi-VN')+' tu vi/giây']
    ];

    for(const [name,val] of statsList){
      const row=document.createElement('div');
      row.className='char-stat-row';
      const label=document.createElement('span');
      label.textContent=name;
      const stat=document.createElement('strong');
      stat.textContent=val;
      row.append(label,stat);
      statsCard.append(row);
    }

    const manualBox=document.createElement('div');
    manualBox.className='char-manual-box';
    const manualHead=document.createElement('div');
    manualHead.className='char-manual-header';
    manualHead.textContent='Công Pháp: '+(cp?.name||'Chưa học');
    const masteryPct=Math.round(p.congPhapMastery*100);
    const manualRate=document.createElement('span');
    manualRate.textContent=masteryPct+'%';
    manualHead.append(manualRate);
    const manualBar=document.createElement('div');
    manualBar.className='char-manual-bar';
    const manualFill=document.createElement('span');
    manualFill.style.width=masteryPct+'%';
    manualBar.append(manualFill);
    manualBox.append(manualHead,manualBar);
    statsCard.append(manualBox);

    sheet.append(showcase,statsCard);
    details.append(sheet);

    const box=$('#cultivation-controls');
    if(box){
      if(box.replaceChildren)box.replaceChildren();
      box.hidden=false;
      const toBag=document.createElement('button');
      toBag.textContent='Mở Túi Đồ & Trang Bị';
      prepend(toBag,icon('equipment/armor'));
      toBag.addEventListener('click',()=>this.bag());
      const toCult=document.createElement('button');
      toCult.textContent='Tu Luyện & Đột Phá';
      prepend(toCult,icon('ui/realm'));
      toCult.addEventListener('click',()=>this.cultivation());
      box.append(toBag,toCult);
    }
    const rb=$('#reset-btn');
    if(rb)rb.hidden=true;
  }
  villageElder(topic=0){
    const topics=[
      ['Chào mừng','Chào con, ta là Trưởng Thôn. Con đang ở tầng 1 của Vạn Mộc Sâm Lâm. Hãy làm quen cách điều khiển, săn thú và tu luyện trước khi bước sang tầng tiếp theo.'],
      ['Di chuyển','Máy tính: dùng WASD hoặc phím mũi tên để di chuyển, hoặc nhấp vào vị trí trên bản đồ. Điện thoại: kéo joystick để đi; chạm vào NPC để trò chuyện.'],
      ['Chiến đấu & đồ rơi','Space/J hoặc nút Tấn công để đánh thường; Q để dùng thần thông khi đạt Luyện Khí; F để hồi máu. Có thể bật Tự đánh. Đồ rơi hiện icon và tên, sau 2 giây tự vào túi của người gây tổng sát thương cao nhất. Mở Hành trang để xem vật phẩm.'],
      ['Tu luyện','Mở bảng Tu luyện để tĩnh tọa tích lũy tu vi. Khi đủ tu vi, chọn Đột phá; một số bình cảnh cần đan dược. Học công pháp, chọn thần thông và luyện đan trong bảng này. Săn thú cho vật liệu, không cộng tu vi trực tiếp.'],
      ['Chuyển tầng','Đi vào truyền tống trận để sang tầng tiếp theo; dùng trận quay về để trở lại. Tầng 2 có NPC chiến đấu cảnh giới Phàm Nhân. Hãy chuẩn bị sinh lực, linh lực và cảnh giới trước khi tiến sâu vào rừng.']
    ];
    this.show('Trưởng Thôn',topics[topic][0],topics[topic][1]);
    $('#reset-btn').hidden=true;$('#resume-btn').textContent='Kết thúc đối thoại';
    const box=$('#cultivation-controls');box.replaceChildren();box.hidden=false;
    const portrait=document.createElement('img');portrait.className='elder-portrait';portrait.alt='Trưởng Thôn';portrait.src=new URL('../assets/webp/NPC/npc_truong_thon.webp',import.meta.url).href;box.append(portrait);
    for(const [i,[label]] of topics.entries()){
      const button=document.createElement('button');button.textContent=label;button.disabled=i===topic;
      button.addEventListener('click',()=>this.villageElder(i));box.append(button);
    }
  }
  menu(){
    if(this.game.player.dead){this.dead();return;}
    this.show('Hệ Thống','Vạn Mộc Sâm Lâm · Cửu Trọng Đại Ngàn','','menu');
    const details=$('#dialog-details');
    if(details.replaceChildren)details.replaceChildren();

    const grid=document.createElement('div');
    grid.className='menu-grid';

    const menuItems=[
      {
        icon:'⚔',
        title:'Hướng Dẫn Thao Tác',
        desc:'WASD di chuyển · Space/J đánh · Q thần thông · F hồi máu',
        action:()=>this.toast('Máy tính: WASD / Phím mũi tên · Điện thoại: Joystick ảo')
      },
      {
        icon:'👴',
        title:'Gặp Trưởng Thôn',
        desc:'Lắng nghe chỉ dẫn tu tiên từ Trưởng Thôn',
        action:()=>this.villageElder(0)
      },
      {
        icon:'🗺',
        title:'Bản Đồ Đại Ngàn',
        desc:`Đang ở Tầng ${floorNumber(this.game.mapId)} / ${FLOOR_COUNT} · Tọa độ (${Math.round(this.game.player.x/1.43)}, ${Math.round(this.game.player.y/1.43)})`,
        action:()=>this.toast(`Tầng ${floorNumber(this.game.mapId)} / ${FLOOR_COUNT}`)
      },
      {
        icon:'🏆',
        title:'Thành Tựu Tu Chân',
        desc:`Cảnh giới: ${Engine.getRealm(this.game.player).name} · Linh thạch: ${this.game.player.gold.toLocaleString('vi-VN')}`,
        action:()=>this.toast(`Cảnh giới hiện tại: ${Engine.getRealm(this.game.player).name}`)
      },
      {
        icon:'💾',
        title:'Lưu Tiến Trình',
        desc:'Lưu thủ công dữ liệu cảnh giới và hành trang',
        action:()=>{this.game.save();this.toast('Đã lưu tiến trình tu tiên thành công!');}
      },
      {
        icon:'▶',
        title:'Tiếp Tục Hành Trình',
        desc:'Đóng menu và tiếp tục khám phá đại ngàn',
        action:()=>this.close()
      }
    ];

    for(const item of menuItems){
      const card=document.createElement('div');
      card.className='menu-card';
      const iconEl=document.createElement('div');
      iconEl.className='menu-card-icon';
      iconEl.textContent=item.icon;
      const content=document.createElement('div');
      content.className='menu-card-content';
      const title=document.createElement('strong');
      title.textContent=item.title;
      const desc=document.createElement('small');
      desc.textContent=item.desc;
      content.append(title,desc);
      card.append(iconEl,content);
      card.addEventListener('click',item.action);
      grid.append(card);
    }

    details.append(grid);
  }
  bag(){
    if(this.game.player.dead){this.dead();return;}
    const p=this.game.player;
    this.show('Túi Đồ','Hành Trang & Kho Báu Tu Tiên','','bag');
    const details=$('#dialog-details');
    if(details.replaceChildren)details.replaceChildren();

    const sheet=document.createElement('div');
    sheet.className='inv-sheet';

    // Top Bar: Currencies
    const topBar=document.createElement('div');
    topBar.className='inv-top-bar';
    const goldLine=document.createElement('div');
    goldLine.className='inv-currency';
    const stoneImg=document.createElement('img');
    stoneImg.className='inv-spirit-stone';
    stoneImg.src='./assets/webp/UI/wuxia_spirit_stone.webp';
    stoneImg.alt='';
    stoneImg.draggable=false;
    goldLine.append(stoneImg);
    const goldText=document.createElement('span');
    goldText.textContent='Linh Thạch: '+p.gold.toLocaleString('vi-VN');
    goldLine.append(goldText);

    const expLine=document.createElement('div');
    expLine.className='inv-currency';
    expLine.append(icon('ui/realm'));
    const expText=document.createElement('span');
    expText.textContent='Tu Vi: '+Math.floor(p.exp)+' / '+Engine.getRealm(p).expReq;
    expLine.append(expText);

    topBar.append(goldLine,expLine);
    sheet.append(topBar);

    // Collect all bag items
    const invItems=[];

    // Gear in inventory
    for(const [id,count] of Object.entries(p.gearInventory||{})){
      const info=equipmentInfo(id);
      if(info&&count>0){
        invItems.push({
          type:'gear',id,count,name:info.name,
          iconFile:EQUIPMENT_ICONS[info.slot],
          desc:`Phẩm giai: ${GRADES[info.grade]} · ${QUALITIES[info.quality]}\nÔ trang bị: ${info.slot}\n`+Object.entries(info.stats).map(([k,v])=>`+${v} ${k}`).join(', '),
          actionLabel:'Mặc Trang Bị',
          action:()=>{if(this.game.equipGear(id)){this.toast('Đã mặc '+info.name);this.bag();}}
        });
      }
    }

    // Beast Materials
    const materialIcons={da_thu:'beast_pelt',long_thu:'beast_fur',huyet_thu:'beast_blood'};
    for(const [id,count] of Object.entries(p.materials||{}).sort(([a],[b])=>a.localeCompare(b,'vi'))){
      const info=lootInfo(id);
      if(info&&count>0){
        invItems.push({
          type:'material',id,count,name:info.name,
          iconFile:id.startsWith('noi_dan_')?'pills/pill_golden':'materials/'+(materialIcons[id]||'beast_pelt'),
          desc:`Vật liệu thu thập từ yêu thú đại ngàn.\nCó thể bán lấy Linh Thạch hoặc dùng luyện khí trang bị.`,
          actionLabel:'Bán Lấy Linh Thạch',
          action:()=>{this.game.sellBeastMaterials();this.bag();}
        });
      }
    }

    // Profession Items
    for(const [id,count] of Object.entries(p.professionItems||{})){
      const info=resourceInfo(id);
      if(info&&count>0){
        const isUsable=['elixir','talisman'].includes(info.kind);
        invItems.push({
          type:'profession',id,count,name:info.name,
          iconFile:PROFESSION_ICONS[info.kind],
          desc:`Tài nguyên nghề nghiệp (${info.kind}).\nPhẩm: ${GRADES[info.grade]||'Sơ cấp'}.`,
          actionLabel:isUsable?'Sử Dụng':null,
          action:isUsable?()=>{if(info.kind==='elixir')this.game.useRecoveryPill(p.hp<p.maxHp?'hp':'mp',p,id);else this.game.useProfessionItem(id);this.bag();}:null
        });
      }
    }

    // Pills
    for(const [name,count] of Object.entries(p.pills||{})){
      if(count>0){
        const pill=Object.values(RECOVERY_PILLS).find(item=>item.id===name);
        const isRecovery=!!pill;
        invItems.push({
          type:'pill',id:name,count,name:pill?.name||name,
          iconFile:pill?.icon||(name.includes('tu_vi')?'pills/pill_cultivation':'pills/pill_breakthrough'),
          desc:isRecovery?`Đan dược hồi phục ${pill.name}.\nPhục hồi 32% sinh lực/linh lực tức thì.`:`Đan dược tu luyện / đột phá bình cảnh tu vi.`,
          actionLabel:isRecovery?'Dùng Hồi Phục':(name.startsWith('tu_vi')?'Dùng Tăng Tu Vi':null),
          action:isRecovery?()=>{this.game.useRecoveryPill(pill.kind,this.game.player,name);this.bag();}:(name.startsWith('tu_vi')?()=>{this.game.useCultivationPill(name);this.bag();}:null)
        });
      }
    }

    // Split container
    const split=document.createElement('div');
    split.className='inv-split';

    // 25-slot matrix (5 columns)
    const matrix=document.createElement('div');
    matrix.className='inv-matrix';

    // Inspector card
    const inspector=document.createElement('div');
    inspector.className='inv-detail-card';

    const renderInspector=(item)=>{
      if(inspector.replaceChildren)inspector.replaceChildren();
      if(!item){
        const emptyHead=document.createElement('div');
        emptyHead.className='inv-detail-title';
        const emStrong=document.createElement('strong');
        emStrong.textContent='Ô Trống';
        const emSmall=document.createElement('small');
        emSmall.textContent='Chọn một vật phẩm bên trái để xem thông tin';
        emptyHead.append(emStrong,emSmall);
        inspector.append(emptyHead);
        return;
      }

      const head=document.createElement('div');
      head.className='inv-detail-header';
      const iconWrap=document.createElement('div');
      iconWrap.className='inv-detail-icon';
      iconWrap.append(icon(item.iconFile));

      const titleWrap=document.createElement('div');
      titleWrap.className='inv-detail-title';
      const nameEl=document.createElement('strong');
      nameEl.textContent=item.name;
      const countEl=document.createElement('small');
      countEl.textContent='Số lượng trong túi: ×'+item.count.toLocaleString('vi-VN');
      titleWrap.append(nameEl,countEl);
      head.append(iconWrap,titleWrap);

      const body=document.createElement('div');
      body.className='inv-detail-body';
      body.textContent=item.desc;

      inspector.append(head,body);

      if(item.actionLabel&&item.action){
        const actions=document.createElement('div');
        actions.className='inv-detail-actions';
        const actBtn=document.createElement('button');
        actBtn.textContent=item.actionLabel;
        actBtn.addEventListener('click',item.action);
        actions.append(actBtn);
        inspector.append(actions);
      }
    };

    let selectedItem=invItems[0]||null;
    renderInspector(selectedItem);

    // Build at least 25 slots
    const totalSlots=Math.max(25,Math.ceil(invItems.length/5)*5);
    for(let i=0;i<totalSlots;i++){
      const item=invItems[i];
      const slot=document.createElement('div');
      slot.className='item-slot'+(item&&item===selectedItem?' selected':'');

      if(item){
        slot.append(icon(item.iconFile));
        if(item.count>1){
          const badge=document.createElement('span');
          badge.className='slot-count';
          badge.textContent=item.count>999?'999+':item.count;
          slot.append(badge);
        }
        slot.title=`${item.name} ×${item.count}`;
        slot.addEventListener('click',()=>{
          selectedItem=item;
          const allSlots=matrix.querySelectorAll?.('.item-slot')||[];
          for(const s of allSlots)s.classList?.remove?.('selected');
          slot.classList.add('selected');
          renderInspector(item);
        });
      }

      matrix.append(slot);
    }

    split.append(matrix,inspector);
    sheet.append(split);
    details.append(sheet);

    // Quick Action Bar in #cultivation-controls
    const box=$('#cultivation-controls');
    if(box){
      if(box.replaceChildren)box.replaceChildren();
      box.hidden=false;

      const totalMaterials=Object.keys(BEAST_MATERIALS).reduce((sum,id)=>sum+(p.materials?.[id]||0),0);
      const sellBtn=document.createElement('button');
      sellBtn.textContent='Bán Da/Lông/Huyết lấy Linh Thạch';
      sellBtn.disabled=!totalMaterials;
      sellBtn.addEventListener('click',()=>{this.game.sellBeastMaterials();this.bag();});
      box.append(sellBtn);

      const action=(title,fn,file)=>{
        const b=document.createElement('button');
        b.textContent=title;
        if(file)prepend(b,icon(file));
        b.addEventListener('click',()=>{if(fn())this.bag();});
        box.append(b);
      };

      for(const [kind,pill] of Object.entries(RECOVERY_PILLS)){
        action('Luyện '+pill.name+' · '+pill.gold+' Thạch',()=>this.game.craftRecoveryPill(kind),pill.icon);
      }
      action('Khai thác Khoáng Thạch',()=>this.game.gatherProfessionResource('ore'),'professions/mining');
      action('Thu hái Linh Thảo',()=>this.game.gatherProfessionResource('herb'),'professions/herb');

      const select=document.createElement('select');
      const rank=rankForFloor(floorNumber(this.game.mapId));
      for(let g=0;g<=rank;g++){
        for(let q=0;q<(g?4:1);q++){
          const opt=document.createElement('option');
          opt.value=g+':'+q;
          opt.textContent=GRADES[g]+(g?' · '+QUALITIES[q]:'');
          select.append(opt);
        }
      }
      select.value=rank+':0';
      box.append(select);
      const selected=()=>select.value.split(':').map(Number);

      action('Luyện Đan (2 Thảo + 1 Khoáng)',()=>this.game.craftProfessionItem('elixir',...selected()),'professions/elixir');
      action('Chế Phù (2 Khoáng + 1 Thảo)',()=>this.game.craftProfessionItem('talisman',...selected()),'professions/talisman');

      const craftLabel=document.createElement('label');
      craftLabel.textContent='Luyện khí:';
      const slotSelect=document.createElement('select');
      for(const slot of EQUIPMENT_SLOTS){
        const o=document.createElement('option');
        o.value=slot.id;
        o.textContent=slot.name;
        slotSelect.append(o);
      }
      craftLabel.append(slotSelect);
      box.append(craftLabel);

      const gearGrade=document.createElement('select');
      for(let grade=1;grade<=rankForFloor(floorNumber(this.game.mapId));grade++){
        for(let quality=0;quality<4;quality++){
          const o=document.createElement('option');
          o.value=grade+':'+quality;
          o.textContent=GRADES[grade]+' · '+QUALITIES[quality];
          gearGrade.append(o);
        }
      }
      if(gearGrade.options.length){
        gearGrade.value=Math.max(1,rankForFloor(floorNumber(this.game.mapId)))+':0';
        box.append(gearGrade);
        const selectedGear=()=>{
          const [grade,quality]=gearGrade.value.split(':').map(Number);
          return equipmentId(slotSelect.value,grade,quality);
        };
        action('Chế tạo trang bị',()=>this.game.craftGear(selectedGear()),'professions/craft');
      }
    }
  }
  cultivation(){
    const g=this.game,p=g.player,r=Engine.getRealm(p),cp=Engine.getCongPhap(p),pill=cultivationPillForRealm(p.realmIdx);
    this.show('Tu Luyện',r.name+' · '+r.major,'','cultivation');
    const details=$('#dialog-details');
    if(details.replaceChildren)details.replaceChildren();

    const sheet=document.createElement('div');
    sheet.className='cult-sheet';

    // Top: Taiji Yin-Yang Sphere Banner
    const sphere=document.createElement('div');
    sphere.className='cult-sphere-banner';
    const taiji=document.createElement('div');
    taiji.className='cult-taiji';
    const taijiImg=document.createElement('img');
    taijiImg.className='cult-taiji-seal';
    taijiImg.src='./assets/webp/UI/wuxia_taiji_seal.webp';
    taijiImg.alt='☯';
    taijiImg.draggable=false;
    taiji.append(taijiImg);
    sphere.append(taiji);

    const rInfo=document.createElement('div');
    rInfo.className='cult-realm-info';
    const rName=document.createElement('div');
    rName.className='cult-realm-name';
    rName.textContent=r.name+(r.bottleneck?' (Bình Cảnh)':'');
    const expBar=document.createElement('div');
    expBar.className='cult-exp-bar';
    const expFill=document.createElement('span');
    const expPct=Math.min(100,Math.floor(100*p.exp/r.expReq));
    expFill.style.width=expPct+'%';
    const expTxt=document.createElement('span');
    expTxt.className='cult-exp-text';
    expTxt.textContent=`Tu Vi: ${Math.floor(p.exp)} / ${r.expReq} (${expPct}%)`;
    expBar.append(expFill,expTxt);
    rInfo.append(rName,expBar);
    sphere.append(rInfo);
    sheet.append(sphere);

    // 2-column Grid: Cong Phap & Skills
    const grid=document.createElement('div');
    grid.className='cult-grid';

    // Left Card: Công Pháp
    const cpCard=document.createElement('div');
    cpCard.className='cult-card';
    const cpTitle=document.createElement('div');
    cpTitle.className='card-title';
    cpTitle.textContent='Công Pháp Đang Vận Hành';
    cpCard.append(cpTitle);

    const cpNameRow=document.createElement('div');
    cpNameRow.className='char-stat-row';
    const cpNameSp=document.createElement('span');cpNameSp.textContent='Tên:';
    const cpNameSt=document.createElement('strong');cpNameSt.textContent=cp?.name||'Chưa học';
    cpNameRow.append(cpNameSp,cpNameSt);

    const cpGradeRow=document.createElement('div');
    cpGradeRow.className='char-stat-row';
    const cpGradeSp=document.createElement('span');cpGradeSp.textContent='Phẩm Giai:';
    const cpGradeSt=document.createElement('strong');cpGradeSt.textContent=cp?.grade||'—';
    cpGradeRow.append(cpGradeSp,cpGradeSt);

    const cpRateRow=document.createElement('div');
    cpRateRow.className='char-stat-row';
    const cpRateSp=document.createElement('span');cpRateSp.textContent='Tĩnh Tọa:';
    const cpRateSt=document.createElement('strong');cpRateSt.textContent='+'+Engine.calcMeditationRate(p).toLocaleString('vi-VN')+' tu vi/s';
    cpRateRow.append(cpRateSp,cpRateSt);

    const cpLimitRow=document.createElement('div');
    cpLimitRow.className='char-stat-row';
    const cpLimitSp=document.createElement('span');cpLimitSp.textContent='Giới Hạn:';
    const cpLimitSt=document.createElement('strong');cpLimitSt.textContent=cp?CONG_PHAP_GRADES[cp.grade].maxStage:'—';
    cpLimitRow.append(cpLimitSp,cpLimitSt);

    cpCard.append(cpTitle,cpNameRow,cpGradeRow,cpRateRow,cpLimitRow);

    // Right Card: Thần Thông
    const skCard=document.createElement('div');
    skCard.className='cult-card';
    const skTitle=document.createElement('div');
    skTitle.className='card-title';
    skTitle.textContent='Thần Thông Chiến Đấu';

    const curSkill=SKILLS.find(s=>s.id===p.selectedSkillId)||SKILLS[0];
    const skNameRow=document.createElement('div');
    skNameRow.className='char-stat-row';
    const skNameSp=document.createElement('span');skNameSp.textContent='Kỹ Năng:';
    const skNameSt=document.createElement('strong');skNameSt.textContent=curSkill.name+' ('+curSkill.elem+')';
    skNameRow.append(skNameSp,skNameSt);

    const skCdRow=document.createElement('div');
    skCdRow.className='char-stat-row';
    const skCdSp=document.createElement('span');skCdSp.textContent='Hồi Chiêu:';
    const skCdSt=document.createElement('strong');skCdSt.textContent=curSkill.cd+' giây';
    skCdRow.append(skCdSp,skCdSt);

    const skMpRow=document.createElement('div');
    skMpRow.className='char-stat-row';
    const skMpSp=document.createElement('span');skMpSp.textContent='Tiêu Hao MP:';
    const skMpSt=document.createElement('strong');skMpSt.textContent=String(Engine.calcSkillMpCost(p,curSkill));
    skMpRow.append(skMpSp,skMpSt);

    const skTierRow=document.createElement('div');
    skTierRow.className='char-stat-row';
    const skTierSp=document.createElement('span');skTierSp.textContent='Cảnh Giới Thần Thông:';
    const skTierSt=document.createElement('strong');skTierSt.textContent=SKILL_MASTERY_TIERS[p.skillMastery[curSkill.id]||0].name;
    skTierRow.append(skTierSp,skTierSt);

    skCard.append(skTitle,skNameRow,skCdRow,skMpRow,skTierRow);

    grid.append(cpCard,skCard);
    sheet.append(grid);
    details.append(sheet);

    // Buttons in #cultivation-controls (Must have > 4 children for verify_cultivation test)
    const box=$('#cultivation-controls');
    if(box){
      if(box.replaceChildren)box.replaceChildren();
      box.hidden=false;
      const button=(label,fn,disabled=false,file)=>{
        const b=document.createElement('button');
        b.textContent=label;
        if(file)prepend(b,icon(file));
        b.disabled=disabled;
        b.addEventListener('click',fn);
        box.append(b);
      };

      button('Tĩnh Tọa',()=>g.meditate(),false,'ui/realm');
      button('Đột Phá Cảnh Giới',()=>{g.breakthrough();this.cultivation();},p.exp<r.expReq||p.realmIdx===28,'pills/pill_breakthrough');
      if(r.bottleneck){
        const cost=pillCost(p);
        button(`Luyện Đan Đột Phá · ${cost.gold} Thạch`,()=>{g.craftPill();this.cultivation();},p.gold<cost.gold,'pills/pill_breakthrough');
      }
      button(`Luyện ${pill.name} · ${pill.gold} Thạch`,()=>{g.craftCultivationPill();this.cultivation();},p.gold<pill.gold,'ui/pill');
      button(`Dùng ${pill.name} (+${cultivationPillExp(p).toLocaleString('vi-VN')} Tu Vi) · Có ${p.pills[pill.id]||0}`,()=>{g.useCultivationPill(pill.id);this.cultivation();},(p.pills[pill.id]||0)<1,'pills/pill_cultivation');

      const label=document.createElement('label');
      label.textContent='Công pháp:';
      prepend(label,icon(MANUAL_ICONS[cp?.grade||'Hoàng Giai']));
      const select=document.createElement('select');
      const emptyManual=document.createElement('option');emptyManual.value='';emptyManual.textContent='Chọn công pháp để học';select.append(emptyManual);
      for(const manual of CONG_PHAP_LIST){
        const o=document.createElement('option');
        o.value=manual.id;
        o.textContent=manual.name+' · '+manual.grade+(p.ownedManuals.includes(manual.id)?' · Đã học':' · '+manualCost(manual)+' thạch');
        select.append(o);
      }
      select.value=p.activeCongPhapId||'';
      label.append(select);
      box.append(label);

      select.addEventListener('change',()=>{
        const manual=CONG_PHAP_LIST.find(m=>m.id===select.value);
        if(manual&&label.querySelector?.('img'))label.querySelector('img').src=icon(MANUAL_ICONS[manual.grade]).src;
      });
      button('Học / Vận Công',()=>{g.learnManual(select.value);this.cultivation();});

      const skills=availableSkills(p);
      if(skills.length){
        const l=document.createElement('label');
        l.textContent='Thần thông Q:';
        prepend(l,icon('ui/skills'));
        const sel=document.createElement('select');
        for(const sk of skills){
          const o=document.createElement('option');
          o.value=sk.id;
          o.textContent=sk.name+' · '+sk.elem+' · '+SKILL_MASTERY_TIERS[p.skillMastery[sk.id]||0].name;
          sel.append(o);
        }
        sel.value=p.selectedSkillId;
        sel.addEventListener('change',()=>{
          p.selectedSkillId=sel.value;
          g.save();
          describe();
        });
        const desc=document.createElement('p');
        const describe=()=>{
          const sk=SKILLS.find(s=>s.id===sel.value);
          if(sk)desc.textContent=sk.desc+` · Hồi ${sk.cd}s · MP ${Engine.calcSkillMpCost(p,sk).toLocaleString('vi-VN')} · Thuần thục ${p.skillExp[sk.id]||0}/${SKILL_MASTERY_TIERS[p.skillMastery[sk.id]||0].expReq}`;
        };
        l.append(sel);
        box.append(l,desc);
        describe();
      }
    }
  }
  dead(){this.show('Đạo tâm bất khuất','Bạn đã bị yêu thú đánh bại. Trở về điểm xuất phát để hồi phục.',
    `${Engine.getRealm(this.game.player).name} · Linh thạch ${this.game.player.gold}`);
    $('#resume-btn').textContent='Hồi sinh';
    $('#resume-btn').onclick=()=>{this.game.respawn();this.close();$('#resume-btn').onclick=null};
  }
  close(){if(this.game.player.dead)return;this.game.input.clear();this.overlay.hidden=true;this.game.paused=false;$('#reset-btn').hidden=false}
}
