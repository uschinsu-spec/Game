import re

def update_ui():
    with open('src/main.js', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Replace makeTextButton & sidebar creation in createHUD
    old_sidebar_code = """  // 3D Sidebar Buttons
  this.makeTextButton(486,235,'🎒\\nTúi Đồ',()=>this.openPanel('gear'));
  this.makeTextButton(486,292,'☯\\nCảnh Giới',()=>this.openPanel('realm'));
  this.makeTextButton(486,349,'⚔\\nTự Động',()=>{this.autoBattle=!this.autoBattle;this.showBanner(this.autoBattle?'☯ Tự Động Chiến Đấu':'⚔ Điều Khiển Thủ Công');});
  this.makeTextButton(486,406,'✦\\nThần Thông',()=>this.openPanel('skills'));
  this.stageProgressBg=this.fixed(this.add.rectangle(270,214,300,5,0x0b1926),106);
  this.stageProgress=this.fixed(this.add.rectangle(120,214,0,5,0xffd700).setOrigin(0,.5),107);
 }
 calcBattlePower(){
  const gear=Object.values(this.equipment).reduce((a,b)=>a+(b?.power||0),0);
  return Math.round((this.baseDamage + gear)*24 + this.maxHp*0.85 + this.level*120 + this.realm*450);
 }
 makeTextButton(x,y,label,cb){
  const bg=this.fixed(this.add.circle(x,y,23,0x081522,.92).setStrokeStyle(2,0xd4af37).setInteractive({useHandCursor:true}),124);
  const t=this.fixed(this.add.text(x,y,label,{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'10px',align:'center',fontStyle:'bold',color:'#fff9d8'}).setOrigin(.5),125);
  bg.on('pointerdown',()=>{
   this.tweens.add({targets:[bg,t],scaleX:.88,scaleY:.88,yoyo:true,duration:80});
   cb();
  });
  return bg;
 }"""

    new_sidebar_code = """  // 3D Sidebar Buttons with 3D Icons
  this.make3DSideButton(488,235,'items',0,'Túi Đồ',()=>this.openPanel('gear'));
  this.make3DSideButton(488,296,'skill_icons',9,'Tu Vi',()=>this.openPanel('realm'));
  this.autoBtn=this.make3DSideButton(488,357,'skill_icons',0,'Tự Động',()=>{
   this.autoBattle=!this.autoBattle;
   this.showBanner(this.autoBattle?'☯ Tự Động Chiến Đấu':'⚔ Điều Khiển Thủ Công');
   this.updateAutoButtonState();
  });
  this.make3DSideButton(488,418,'skill_icons',5,'Kỹ Năng',()=>this.openPanel('skills'));
  this.stageProgressBg=this.fixed(this.add.rectangle(270,214,300,5,0x0b1926),106);
  this.stageProgress=this.fixed(this.add.rectangle(120,214,0,5,0xffd700).setOrigin(0,.5),107);
 }
 calcBattlePower(){
  const gear=Object.values(this.equipment).reduce((a,b)=>a+(b?.power||0),0);
  return Math.round((this.baseDamage + gear)*24 + this.maxHp*0.85 + this.level*120 + this.realm*450);
 }
 make3DSideButton(x,y,atlas,frame,label,cb){
  const bg=this.fixed(this.add.circle(x,y,24,0x071624,.95).setStrokeStyle(2,0xd4af37).setInteractive(new Phaser.Geom.Circle(24,24,24),Phaser.Geom.Circle.Contains),124);
  const icon=this.fixed(this.add.image(x,y-5,atlas,frame).setScale(atlas==='items'?.42:.38),125);
  const t=this.fixed(this.add.text(x,y+13,label,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:'#fff6a5'}).setOrigin(.5),126);
  bg.on('pointerdown',()=>{
   this.tweens.add({targets:[bg,icon,t],scaleX:.88,scaleY:.88,yoyo:true,duration:80});
   cb();
  });
  return {bg,icon,t};
 }
 updateAutoButtonState(){
  if(!this.autoBtn)return;
  this.autoBtn.bg.setFillStyle(this.autoBattle?0x103426:0x221118,.95);
  this.autoBtn.bg.setStrokeStyle(2,this.autoBattle?0x22c55e:0xef4444);
  this.autoBtn.t.setColor(this.autoBattle?'#86efac':'#fca5a5');
 }"""

    code = code.replace(old_sidebar_code, new_sidebar_code)

    # 2. Replace Modal and Panel system
    old_panel_system_regex = r"openPanel\(type\)\{[\s\S]+?closePanel\(\)\{[\s\S]+?renderGearPanel[\s\S]+?renderRealmPanel[\s\S]+?renderSkillPanel[\s\S]+?refreshSkillButtons\(\)"

    new_panel_system = """openPanel(type){
  if(this.panel){this.closePanel();}
  const c=this.add.container(0,0).setScrollFactor(0).setDepth(220);
  this.panel=c;
  
  // Full screen dark tap-to-close backdrop
  const backdrop=this.add.rectangle(270,480,540,960,0x000000,.75).setInteractive();
  backdrop.on('pointerdown',()=>this.closePanel());
  c.add(backdrop);
  
  // 3D Obsidian-Jade Modal Frame
  const bg=this.add.image(270,480,'ui_modal_bg').setScale(1).setInteractive();
  c.add(bg);
  
  // Big Easy-to-tap 3D Close Button
  const closeBtnBg=this.add.circle(480,146,22,0x2b0b10,.95).setStrokeStyle(2,0xd4af37).setInteractive(new Phaser.Geom.Circle(22,22,22),Phaser.Geom.Circle.Contains);
  const closeBtnText=this.add.text(480,146,'✕',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'18px',fontStyle:'bold',color:'#fef08a'}).setOrigin(.5);
  closeBtnBg.on('pointerdown',()=>{
   this.tweens.add({targets:[closeBtnBg,closeBtnText],scaleX:.85,scaleY:.85,yoyo:true,duration:80});
   this.closePanel();
  });
  c.add([closeBtnBg,closeBtnText]);
  
  if(type==='gear')this.renderGearPanel(c);
  if(type==='realm')this.renderRealmPanel(c);
  if(type==='skills')this.renderSkillPanel(c);
 }
 closePanel(){
  if(this.panel){
   this.panel.destroy(true);
   this.panel=null;
  }
 }
 renderGearPanel(c){
  c.add(this.add.text(270,148,'TÚI TRỮ VẬT & TRANG BỊ',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'20px',fontStyle:'bold',color:'#ffe58a'}).setOrigin(.5));
  
  // Equipped Gear Slots
  const slots=['weapon','armor','helm','boots','ring','talisman'],names=['Tiên Kiếm','Chiến Giáp','Đạo Quan','Tiên Hài','Càn Khôn Giới','Hộ Thể Phù'];
  slots.forEach((s,i)=>{
   const x=105+(i%3)*165,y=220+Math.floor(i/3)*108,it=this.equipment[s],rar=it?RARITY[it.rarity]:null;
   const slotBox=this.add.rectangle(x,y,84,80,0x0a1b2a).setStrokeStyle(2,rar?rar.color:0x415b70).setInteractive();
   c.add(slotBox);
   if(it){
    const icon=this.add.image(x,y-8,'items',it.frame).setScale(.72);
    c.add(icon);
   }
   c.add(this.add.text(x,y+28,names[i]+(it?` +${it.power}`:''),{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'10px',fontStyle:'bold',color:rar?'#ffd700':'#94a3b8'}).setOrigin(.5));
   
   // Tap equipped slot to enhance
   slotBox.on('pointerdown',()=>{
    if(it){
     it.power+=12;
     this.showBanner(`⚔ Cường Hóa ${it.name} +12 Công!`);
     this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
    }
   });
  });
  
  // Action Buttons: Trang Bị Nhanh & Thu Hồi
  const autoEquipBtn=this.add.rectangle(170,442,160,34,0x103824).setStrokeStyle(1.5,0x22c55e).setInteractive();
  const autoEquipText=this.add.text(170,442,'⚔ Trang Bị Nhanh',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#86efac'}).setOrigin(.5);
  autoEquipBtn.on('pointerdown',()=>{
   this.inventory.forEach(item=>{
    if(!this.equipment[item.slot]||this.equipment[item.slot].power<item.power){
     this.equipment[item.slot]=item;
    }
   });
   this.showBanner('Đã tự động mặc trang bị lực chiến cao nhất!');
   this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
  });
  c.add([autoEquipBtn,autoEquipText]);
  
  const salvageBtn=this.add.rectangle(370,442,160,34,0x381216).setStrokeStyle(1.5,0xef4444).setInteractive();
  const salvageText=this.add.text(370,442,'♻ Phân Giải Thu Hồi',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#fca5a5'}).setOrigin(.5);
  salvageBtn.on('pointerdown',()=>{
   const count=this.inventory.length;
   if(count>0){
    const gainedExp=count*45;
    this.gainExp(gainedExp);
    this.inventory=[];
    this.showBanner(`Đã thu hồi ${count} trang bị, nhận +${gainedExp} Tu Vi!`);
    this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
   }else{
    this.showBanner('Túi đồ hiện đang trống!');
   }
  });
  c.add([salvageBtn,salvageText]);

  // Inventory Grid Header
  c.add(this.add.text(45,475,`⚔ Lực Chiến: ${this.calcBattlePower()}   •   Sát Thương: ${this.damage()}\n❤️ Khí Huyết: ${this.maxHp}   •   💧 Chân Nguyên: ${this.maxMp}\n🎒 Sức Chứa Túi Đồ: ${this.inventory.length}/30 (Chạm vào món đồ để trang bị)`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',lineSpacing:6,color:'#d9f2ff'}));
  
  // Inventory Items Grid
  this.inventory.slice(0,18).forEach((it,i)=>{
   const x=64+(i%6)*82,y=590+Math.floor(i/6)*72,rar=RARITY[it.rarity];
   const itemBox=this.add.rectangle(x,y,60,60,0x061522).setStrokeStyle(1.5,rar.color).setInteractive();
   const icon=this.add.image(x,y-6,'items',it.frame).setScale(.56);
   const powerLabel=this.add.text(x,y+20,'+'+it.power,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:'#fef08a'}).setOrigin(.5);
   c.add([itemBox,icon,powerLabel]);
   
   // Tap item to equip
   itemBox.on('pointerdown',()=>{
    const old=this.equipment[it.slot];
    this.equipment[it.slot]=it;
    this.inventory.splice(i,1);
    if(old)this.inventory.unshift(old);
    this.showBanner(`Đã trang bị: ${it.name}!`);
    this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
   });
  });
 }
 renderRealmPanel(c){
  c.add(this.add.text(270,148,'CẢNH GIỚI TU LUYỆN',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'22px',fontStyle:'bold',color:'#ffe58a'}).setOrigin(.5));
  c.add(this.add.text(270,205,REALMS[this.realm],{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'26px',fontStyle:'bold',color:'#67e8f9'}).setOrigin(.5));
  
  const need=this.expNeed(),canBreak=this.exp>=need;
  c.add(this.add.text(270,248,`Tu Vi Tích Lũy: ${this.exp} / ${need} (${Math.floor(this.exp/need*100)}%)`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'13px',color:'#fff'}).setOrigin(.5));
  
  // Progress Bar
  c.add(this.add.rectangle(270,278,380,16,0x0a1c2b).setStrokeStyle(1.5,0xd4af37));
  c.add(this.add.rectangle(80,278,380*Math.min(1,this.exp/need),16,canBreak?0xffd700:0x22c55e).setOrigin(0,.5));
  
  // Breakthrough Button
  const breakBtn=this.add.rectangle(270,330,220,44,canBreak?0xb8860b:0x1a2632).setStrokeStyle(2,canBreak?0xffe066:0x526e82).setInteractive();
  const breakText=this.add.text(270,330,canBreak?'☯ ĐỘT PHÁ CẢNH GIỚI':'Chưa Đủ Tu Vi',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'15px',fontStyle:'bold',color:canBreak?'#fff':'#94a3b8'}).setOrigin(.5);
  breakBtn.on('pointerdown',()=>{
   if(canBreak){
    this.gainExp(0); // Triggers breakthrough logic
    this.closePanel();this.openPanel('realm');this.autoSave();
   }else{
    this.showBanner('Tu vi chưa viên mãn, hãy đánh quái hoặc bế quan!');
   }
  });
  c.add([breakBtn,breakText]);
  
  // Meditate / Bế Quan Luyện Khí Button
  const medBtn=this.add.rectangle(270,390,220,36,0x0c3022).setStrokeStyle(1.5,0x22c55e).setInteractive();
  const medText=this.add.text(270,390,'🌿 Bế Quan Luyện Khí (+150 Tu Vi)',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#86efac'}).setOrigin(.5);
  medBtn.on('pointerdown',()=>{
   this.gainExp(150);
   this.spawnVfx(this.player.x,this.player.y,9,.8);
   this.showBanner('Đạo hữu bế quan đắc đạo, nhận +150 Tu Vi!');
   this.closePanel();this.openPanel('realm');this.autoSave();
  });
  c.add([medBtn,medText]);
  
  c.add(this.add.text(55,445,`☯ Đột Phá Cảnh Giới Tăng Vĩnh Viễn:\n• Khí Huyết Tối Đa +10.5%\n• Chân Nguyên Tối Đa +6.5%\n• Sát Thương Cơ Bản +4.5%\n• Uy Áp Cảnh Giới +7.5% Sát Thương Toàn Thân\n\nCảnh Giới Hiện Tại Đã Khai Mở Ải: ${Math.max(this.unlockedStage+1,1)}/${STAGES.length}.`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'13px',lineSpacing:8,color:'#e8f6ff',wordWrap:{width:430}}));
 }
 renderSkillPanel(c){
  c.add(this.add.text(270,148,'TÀNG KINH CÁC • THẦN THÔNG',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'20px',fontStyle:'bold',color:'#ffe58a'}).setOrigin(.5));
  c.add(this.add.text(270,178,'(Chạm vào Thần Thông để trang bị vào 6 ô phím tắt)',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',color:'#93c5fd'}).setOrigin(.5));
  
  SKILLS.forEach((s,i)=>{
   const col=i%2,row=Math.floor(i/2),x=72+col*248,y=230+row*92;
   const equipped=this.loadout.includes(i);
   
   const skillCard=this.add.rectangle(x+85,y,235,80,equipped?0x10283b:0x071522).setStrokeStyle(1.5,equipped?0x38bdf8:0x547087).setInteractive();
   const iconCircle=this.add.circle(x,y,24,0x06111a).setStrokeStyle(2,equipped?0x38bdf8:0xd4af37);
   const icon=this.add.image(x,y,'skill_icons',s.frame).setScale(.45);
   
   const title=this.add.text(x+32,y-25,`${i+1}. ${s.name}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',fontStyle:'bold',color:equipped?'#7dd3fc':'#fff'});
   const stats=this.add.text(x+32,y-7,`CD: ${(s.cd/1000).toFixed(1)}s  •  MP: ${s.mana}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'10px',color:'#94a3b8'});
   const badge=this.add.text(x+32,y+10,equipped?'✦ ĐANG TRANG BỊ':'[ Chạm để trang bị ]',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'10px',fontStyle:'bold',color:equipped?'#fef08a':'#6ee7b7'});
   
   c.add([skillCard,iconCircle,icon,title,stats,badge]);
   
   skillCard.on('pointerdown',()=>{
    if(i===6||i===7)return; // Dash and Fly have dedicated buttons
    const existing=this.loadout.indexOf(i);
    if(existing>=0){
     this.showBanner(`Kỹ năng ${s.name} đã được trang bị!`);
    }else{
     this.loadout.shift();
     this.loadout.push(i);
     this.refreshSkillButtons();
     this.showBanner(`Đã trang bị ${s.name} vào phím tắt!`);
     this.closePanel();this.openPanel('skills');this.autoSave();
    }
   });
  });
 }
 refreshSkillButtons()"""

    code = re.sub(old_panel_system_regex, new_panel_system, code)

    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(code)

    print("Upgraded main.js UI system and interactive panels successfully!")

if __name__ == '__main__':
    update_ui()
