const $=selector=>document.querySelector(selector);
import {Engine,REALMS,CONG_PHAP_LIST,CONG_PHAP_GRADES,SKILLS,SKILL_MASTERY_TIERS,availableSkills,manualCost,pillCost,cultivationPillForRealm,cultivationPillExp} from './cultivation.js';
import {floorNumber,FLOOR_COUNT} from './floors.js';
export class UI {
  constructor(game){
    this.game=game;this.lastHud=0;this.noticeTimer=0;
    this.overlay=$('#overlay');this.loading=$('#loading');
    this.autoBtn=$('#auto-btn');
    this.autoBtn.addEventListener('click',()=>{
      if(game.paused||game.player.dead)return;game.stopMeditation();
      game.auto=!game.auto;this.autoBtn.classList.toggle('on',game.auto);$('#auto-text').textContent=game.auto?'Đang tự đánh':'Tự đánh';
      this.toast(game.auto?'Đã bật tự động đánh quái':'Đã tắt tự động đánh');
    });
    $('#menu-btn').addEventListener('click',()=>this.menu());
    $('#bag-btn').addEventListener('click',()=>this.bag());
    $('#cultivation-btn').addEventListener('click',()=>{if(!game.player.dead)this.cultivation()});
    $('#resume-btn').addEventListener('click',()=>this.close());
    $('#reset-btn').addEventListener('click',()=>{
      if(window.confirm('Bắt đầu lại từ Phàm Nhân? Tiến trình đã lưu sẽ bị xóa.')){
        this.close();game.reset();this.toast('Hành trình tu tiên mới bắt đầu!');
      }
    });
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
    $('#skill-btn').setAttribute('aria-label',`${skill.name}, phím Q`);
    $('#gold').textContent=p.gold.toLocaleString('vi-VN');
    $('#wolf-count').textContent=`${Math.min(10,p.kills)}/10`;
    $('#herb-count').textContent=`${Math.min(5,p.herbs)}/5`;
    $('#quest-complete').hidden=!(p.kills>=10&&p.herbs>=5);
    $('#coords').textContent=`(${Math.round(p.x/1.43)}, ${Math.round(p.y/1.43)})`;
    for(const [key,id] of [['skill','skill-cd'],['heal','heal-cd']]){
      const cd=p.cooldowns[key],el=$('#'+id),btn=el.parentElement;
      btn.classList.toggle('cooling',cd>0.05);el.textContent=cd>0.05?Math.ceil(cd):'';
    }
  }
  show(title,description,details=''){
    this.game.input.clear();$('#cultivation-controls').hidden=true;
    this.game.paused=true;$('#resume-btn').onclick=null;$('#dialog-title').textContent=title;$('#dialog-text').textContent=description;
    $('#dialog-details').textContent=details;$('#resume-btn').textContent='Tiếp tục';this.overlay.hidden=false;
  }
  menu(){if(this.game.player.dead){this.dead();return}if(!this.overlay.hidden){this.close();return}this.show('Vạn Mộc Sâm Lâm','Game tu tiên 2D top-down · Lưu tiến trình tự động',
    'Điện thoại: Joystick để di chuyển, nút kiếm để đánh.\nMáy tính: WASD / phím mũi tên · Space/J đánh · Q thần thông · F hồi máu.\nChạm bản đồ để đi, chạm quái để chọn mục tiêu.\n☯ Tu luyện: tĩnh tọa, đột phá, học công pháp và chọn thần thông.');
  }
  bag(){if(this.game.player.dead){this.dead();return}const p=this.game.player;this.show('Hành trang','Vật phẩm và tiến trình hiện tại',
    `🪙 Linh thạch: ${p.gold}\n🌿 Linh thảo: ${p.herbs}\n⚔ Yêu Lang đã hạ: ${p.kills}\n✨ Tu vi: ${Math.floor(p.exp)}/${Engine.getRealm(p).expReq}\nCảnh giới: ${Engine.getRealm(p).name}\n${Object.entries(p.pills).filter(([,n])=>n>0).map(([name,n])=>name+': '+n).join('\n')}`);
  }
  cultivation(){
    const g=this.game,p=g.player,r=Engine.getRealm(p),cp=Engine.getCongPhap(p),pill=cultivationPillForRealm(p.realmIdx);
    this.show('Tu luyện',r.name,
      `Tu vi: ${Math.floor(p.exp)} / ${r.expReq}\nCông pháp: ${cp.name}\nGiới hạn: ${CONG_PHAP_GRADES[cp.grade].maxStage} · Tĩnh tọa: ${Engine.calcMeditationRate(p).toLocaleString('vi-VN')} tu vi/giây\nCông: ${Engine.calcElementalDamage(p,cp.elem==='Toàn Hệ'?'Kim':cp.elem)} · Thủ: ${Engine.calcElementalDefense(p,'Vật Lý')} · Thần thức: ${Engine.calcSpiritualSense(p)}\nBạo kích: ${Math.round(Engine.calcCritRate(p)*100)}% · Tốc độ đánh: ${Engine.calcAttackInterval(p)}ms\nLinh thạch: ${p.gold} · Linh thảo: ${p.herbs}\n${r.bottleneck?'Bình cảnh: cần '+r.pillNeeded+' (có '+(p.pills[r.pillNeeded]||0)+')':'Cảnh giới kế: '+(REALMS[p.realmIdx+1]?.name||'Đã đạt đỉnh')}`);
    const box=$('#cultivation-controls');box.replaceChildren();box.hidden=false;
    const button=(label,fn,disabled=false)=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.addEventListener('click',fn);box.append(b)};
    button('Tĩnh tọa',()=>g.meditate());
    button('Đột phá',()=>{g.breakthrough();this.cultivation()},p.exp<r.expReq||p.realmIdx===28);
    if(r.bottleneck){const cost=pillCost(p);button(`Luyện đan đột phá · ${cost.herbs} thảo + ${cost.gold} thạch`,()=>{g.craftPill();this.cultivation()})}
    button(`Luyện ${pill.name} · ${pill.herbs} thảo + ${pill.gold} thạch`,()=>{g.craftCultivationPill();this.cultivation()},p.herbs<pill.herbs||p.gold<pill.gold);
    button(`Dùng ${pill.name} (+${cultivationPillExp(p).toLocaleString('vi-VN')} Tu Vi) · Có ${p.pills[pill.id]||0}`,()=>{g.useCultivationPill();this.cultivation()},(p.pills[pill.id]||0)<1);
    const label=document.createElement('label');label.textContent='Công pháp';const select=document.createElement('select');
    for(const manual of CONG_PHAP_LIST){const o=document.createElement('option');o.value=manual.id;o.textContent=manual.name+' · '+manual.grade+(p.ownedManuals.includes(manual.id)?' · Đã học':' · '+manualCost(manual)+' thạch');select.append(o)}
    select.value=p.activeCongPhapId;label.append(select);box.append(label);
    button('Học / Vận công',()=>{g.learnManual(select.value);this.cultivation()});
    const skills=availableSkills(p);
    if(skills.length){const l=document.createElement('label');l.textContent='Thần thông phím Q';const sel=document.createElement('select');
      for(const sk of skills){const o=document.createElement('option');o.value=sk.id;o.textContent=sk.name+' · '+sk.elem+' · '+SKILL_MASTERY_TIERS[p.skillMastery[sk.id]||0].name;sel.append(o)}
      sel.value=p.selectedSkillId;sel.addEventListener('change',()=>{p.selectedSkillId=sel.value;g.save();describe()});
      const desc=document.createElement('p');const describe=()=>{const sk=SKILLS.find(s=>s.id===sel.value);desc.textContent=sk.desc+` · Hồi ${sk.cd}s · Linh lực ${Engine.calcSkillMpCost(p,sk).toLocaleString('vi-VN')} · Luyện chiêu ${p.skillExp[sk.id]||0}/${SKILL_MASTERY_TIERS[p.skillMastery[sk.id]||0].expReq}`};
      l.append(sel);box.append(l,desc);describe();
    }
  }
  dead(){this.show('Đạo tâm bất khuất','Bạn đã bị yêu thú đánh bại. Trở về điểm xuất phát để hồi phục.',
    `${Engine.getRealm(this.game.player).name} · Linh thạch ${this.game.player.gold}`);
    $('#resume-btn').textContent='Hồi sinh';
    $('#resume-btn').onclick=()=>{this.game.respawn();this.close();$('#resume-btn').onclick=null};
  }
  close(){if(this.game.player.dead)return;this.game.input.clear();this.overlay.hidden=true;this.game.paused=false}
}
