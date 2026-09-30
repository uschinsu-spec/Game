import os

TARGET_FILE = r'H:\GOOGLE DRIVER\GAME\src\main.js'

code = '''const W=540,H=960,WORLD_W=2880,FIELD={left:42,right:WORLD_W-42,top:330,bottom:890};
const SAVE_KEY='pham-nhan-tu-tien-v4';

// 12 Classic Phàm Nhân Tu Tiên Maps & Sects
const STAGES=[
 {name:'Thất Huyền Môn',sub:'Kính Châu Ngoại Vi',goal:26,sky:0xffffff,tint:0xffffff,weather:'petal',boss:'Mặc Đại Phu (Đoạt Xá)',enemies:['mob_1','mob_2','mob_5','mob_7']},
 {name:'Hoàng Phong Cốc',sub:'Thái Nhạc Sơn Mạch',goal:30,sky:0xdfffee,tint:0xd9ffd7,weather:'leaf',boss:'Hồng Phất Tiên Tử (Ảo Ảnh)',enemies:['mob_3','mob_4','mob_5','mob_7']},
 {name:'Huyết Sắc Cấm Địa',sub:'Cấm Địa Thử Luyện',goal:34,sky:0xd7ddff,tint:0xd2c8ff,weather:'mist',boss:'Phong Nhạc Ma Tu',enemies:['mob_2','mob_4','mob_6','mob_8']},
 {name:'Yến Gia Bảo',sub:'Ma Đạo Xâm Lấn',goal:38,sky:0xffe7c7,tint:0xffd6ae,weather:'leaf',boss:'Quỷ Linh Môn Thiếu Chủ',enemies:['mob_1','mob_5','mob_6','mob_7']},
 {name:'Khôi Tinh Đảo',sub:'Loạn Tinh Hải Ngoại Vi',goal:42,sky:0xe6f8ff,tint:0xd8f5ff,weather:'spark',boss:'Ô Húy Ma Đầu',enemies:['mob_2','mob_3','mob_7','mob_8']},
 {name:'Thiên Tinh Thành',sub:'Song Thánh Cung Điện',goal:46,sky:0xffc09d,tint:0xffb379,weather:'ember',boss:'Ô Sào Lão Quái',enemies:['mob_4','mob_5','mob_6','mob_8']},
 {name:'Ngoại Hải Săn Yêu',sub:'Kỳ Lân Đảo Băng Diễm',goal:50,sky:0xb8a4d9,tint:0xad92d2,weather:'mist',boss:'Bát Giai Độc Giao',enemies:['mob_2','mob_6','mob_7','mob_8']},
 {name:'Hư Thiên Điện',sub:'Băng Phách Huyền Giới',goal:55,sky:0xff9d86,tint:0xff8b71,weather:'ember',boss:'Man Hồ Lão Ma',enemies:['mob_5','mob_6','mob_7','mob_8']},
 {name:'Lạc Vân Tông',sub:'Thiên Nam Khôi Phục',goal:58,sky:0xe7fbff,tint:0xd5f6ff,weather:'snow',boss:'Nam Lũng Hầu (Hóa Ma)',enemies:['mob_3','mob_4','mob_7','mob_8']},
 {name:'Mộ Lan Thảo Nguyên',sub:'Pháp Sĩ Đại Chiến',goal:62,sky:0xc8d5ff,tint:0xc3d6ff,weather:'storm',boss:'Mộ Lan Đại Pháp Sĩ',enemies:['mob_2','mob_6','mob_7','mob_8']},
 {name:'Côn Ngô Sơn',sub:'Cổ Ma Trấn Yêu Tháp',goal:66,sky:0xa99dcc,tint:0x9d8ec3,weather:'mist',boss:'Cổ Ma Phân Thân',enemies:['mob_3','mob_4','mob_6','mob_8']},
 {name:'Phi Thăng Linh Giới',sub:'Chân Tiên Độ Kiếp Đài',goal:72,sky:0xffe7ad,tint:0xffd788,weather:'storm',boss:'Thiên Kiếp Lôi Long',enemies:['mob_1','mob_2','mob_6','mob_8']}
];

// Monster Tiers (Nhất Giai -> Bát Giai Hóa Hình Yêu Tu)
const ENEMY_TYPES={
 mob_1:{tex:'enemy_1',name:'[Nhất Giai] Dã Lang Thú',hp:190,spd:62,dmg:20,scale:.60,tint:0xffffff,ai:'melee'},
 mob_2:{tex:'enemy_2',name:'[Nhị Giai] Ma Đạo Huyết Binh',hp:240,spd:54,dmg:26,scale:.62,tint:0xffffff,ai:'melee'},
 mob_3:{tex:'enemy_3',name:'[Tam Giai] Huyết Ảnh Ma Thứ',hp:210,spd:68,dmg:28,scale:.58,tint:0xffffff,ai:'hunter'},
 mob_4:{tex:'enemy_4',name:'[Tứ Giai] Thần Niệm Khôi Lỗi',hp:180,spd:42,dmg:35,scale:.58,tint:0xffffff,ai:'caster'},
 mob_5:{tex:'enemy_5',name:'[Ngũ Giai] Hắc Giáp Tê Ngưu',hp:330,spd:72,dmg:32,scale:.60,tint:0xffffff,ai:'charge'},
 mob_6:{tex:'enemy_6',name:'[Lục Giai] Cự Ma Hộ Pháp',hp:680,spd:46,dmg:52,scale:.68,tint:0xffffff,ai:'slam',elite:true},
 mob_7:{tex:'enemy_7',name:'[Thất Giai] Huyết Dực Yêu Điểu',hp:160,spd:84,dmg:22,scale:.56,tint:0xffffff,ai:'fly',flying:true},
 mob_8:{tex:'enemy_8',name:'[Bát Giai Hóa Hình] Cửu U Ma Tôn',hp:820,spd:50,dmg:65,scale:.68,tint:0xffffff,ai:'caster',elite:true}
};

// Cultivation Realms (Phàm Nhân Tu Tiên Canon)
const REALMS=[
 'Luyện Khí Tầng 1','Luyện Khí Tầng 4','Luyện Khí Tầng 8','Luyện Khí Tầng 13 Viên Mãn',
 'Trúc Cơ Sơ Kỳ','Trúc Cơ Trung Kỳ','Trúc Cơ Hậu Kỳ','Giả Đan Cảnh',
 'Kết Đan Sơ Kỳ (Kim Đan)','Kết Đan Trung Kỳ','Kết Đan Hậu Kỳ','Chuẩn Anh Cảnh',
 'Nguyên Anh Sơ Kỳ','Nguyên Anh Trung Kỳ','Nguyên Anh Hậu Kỳ (Đại Tu Sĩ)',
 'Hóa Thần Sơ Kỳ','Hóa Thần Trung Kỳ','Hóa Thần Hậu Kỳ',
 'Luyện Hư Kỳ','Hợp Thể Kỳ','Đại Thừa Kỳ','Độ Kiếp Chân Tiên'
];

// Spells of Hàn Lập & Magic Treasures
const SKILLS=[
 {name:'Thanh Trúc Kiếm Khí',cd:420,mana:8,frame:0,desc:'Thanh Nguyên Kiếm Quyết phóng kiếm mang sắc bén'},
 {name:'Vạn Kiếm Toái Ảnh',cd:3300,mana:28,frame:1,desc:'Vũ kiếm hộ thân chém nát kẻ địch xung quanh'},
 {name:'Tịch Tà Thần Lôi',cd:3900,mana:32,frame:2,desc:'Kim Lôi Tác - Sét vàng kim chuyên diệt ma khí'},
 {name:'Càn Lam Băng Diễm',cd:4600,mana:34,frame:3,desc:'Hàn băng cực độ đóng băng linh hồn kẻ địch'},
 {name:'Tử Cực Ma Hỏa',cd:4900,mana:38,frame:4,desc:'Hỏa cầu tử sắc phát nổ cuộn trào thiêu đốt'},
 {name:'Đại Canh Kiếm Trận',cd:10500,mana:72,frame:5,desc:'72 Thanh Trúc Phong Vân Kiếm kết thành tuyệt trận'},
 {name:'La Yên Bộ / Phong Lôi Dực',cd:1900,mana:10,frame:6,desc:'Phong Lôi Dực dịch chuyển né đòn chớp nhoáng'},
 {name:'Ngự Kiếm Phi Hành',cd:700,mana:0,frame:7,desc:'Đạp phi kiếm bay lơ lửng trên không trung'},
 {name:'Phệ Kim Trùng Quần',cd:7800,mana:55,frame:8,desc:'Bầy bọ vàng cắn nuốt chân khí và thân thể quái'},
 {name:'Phạm Thánh Chân Ma Thể',cd:10000,mana:48,frame:9,desc:'Kim Cang Thân Bất Hoại, tăng giáp và phản đòn'}
];

const RARITY=[
 {name:'Phàm Khí',color:0x9aa6b6,mult:1}, {name:'Linh Khí',color:0x61d27d,mult:1.3}, {name:'Pháp Bảo',color:0x59a8ff,mult:1.7},
 {name:'Cổ Bảo',color:0xba7cff,mult:2.2}, {name:'Linh Bảo',color:0xffa34f,mult:3}, {name:'Thông Thiên',color:0xffe66d,mult:4.2}
];

class GameScene extends Phaser.Scene{
 constructor(){
  super('GameScene');
  this.stageIndex=0;this.unlockedStage=0;this.kills=0;this.realm=0;this.exp=0;this.level=1;
  this.hp=1200;this.maxHp=1200;this.mp=300;this.maxMp=300;this.baseDamage=85;
  this.flying=false;this.skillReadyAt=Array(10).fill(0);this.inventory=[];this.equipment={};this.loadout=[0,1,2,3,5,8];
  this.menuHidden=false;this.skillsHidden=false;this.pickingSlot=0;
  this.panel=null;this.stageWon=false;this.enemySerial=0;this.dead=false;this.respawnTimer=null;this.invulnerableUntil=0;this.shield=0;this.lastQualityCheck=0;this.quality='high';this.weather=[];
  this.vfxPool=null;this.vfxActive=0;this.vfxStats={spawned:0,dropped:0};this.guardAuraSprite=null;
  
  // Phàm Nhân Tu Tiên Resources
  this.spiritStones=680;      // Linh Thạch
  this.bottleLiquid=5;        // Lục Dịch Chưởng Thiên Bình
  this.pills={truc_co:1, tay_tuy:2, ket_dan:0, nguyen_anh:0};
  this.materials={linh_duoc:25, canh_kim:8, yeu_dan:6};
  this.magicTreasure={name:'Thanh Trúc Phong Vân Kiếm (72 Chuôi)', level:1, canhKimInfused:0};
 }

 preload(){
  const A='./assets/';
  // Environment Background
  this.load.image('valley_panorama', A+'environment/valley_panorama.png');
  // UI Elements
  this.load.image('ui_avatar_frame', A+'ui/ui_avatar_frame.png');
  // Player Sprites & Weapon
  this.load.image('flying_sword', A+'player/flying_sword.png');
  this.load.spritesheet('player_idle', A+'player/player_idle.png', {frameWidth:128, frameHeight:128});
  this.load.spritesheet('player_run', A+'player/player_run.png', {frameWidth:128, frameHeight:128});
  this.load.spritesheet('player_attack', A+'player/player_attack.png', {frameWidth:128, frameHeight:128});
  // Enemies
  for(let i=1;i<=8;i++){this.load.spritesheet('enemy_'+i, A+'enemies/enemy_'+i+'.png', {frameWidth:128, frameHeight:128});}
  this.load.spritesheet('boss', A+'enemies/enemy_6.png', {frameWidth:128, frameHeight:128});
  // UI HUD Navigation & System Icons
  this.load.image('ui_icon_bag', A+'icons/ui/bag.png');
  this.load.image('ui_icon_realm', A+'icons/ui/realm.png');
  this.load.image('ui_icon_skills', A+'icons/ui/skills.png');
  this.load.image('ui_icon_auto', A+'icons/ui/auto.png');
  this.load.image('ui_icon_settings', A+'icons/ui/settings.png');
  this.load.image('ui_icon_map', A+'icons/ui/map.png');
  this.load.image('ui_icon_close', A+'icons/ui/close.png');
  this.load.image('ui_icon_gold', A+'icons/ui/gold.png');
  this.load.image('ui_icon_pill', A+'icons/ui/pill.png');
  this.load.image('ui_icon_quest', A+'icons/ui/quest.png');
  // Icons & Atlases
  for(let i=0;i<10;i++){this.load.image('skill_icon_'+i, A+'icons/skills/skill_'+i+'.png');}
  for(let i=0;i<18;i++){this.load.image('item_'+i, A+'icons/items/item_'+i+'.png');}
  for(let i=0;i<12;i++){this.load.image('stage_icon_'+i, A+'icons/stages/stage_'+i+'.png');}
  this.load.spritesheet('skill_icons', A+'icons/skill_icons.png', {frameWidth:96, frameHeight:96});
  this.load.spritesheet('items', A+'icons/items_atlas.png', {frameWidth:80, frameHeight:80});
  this.load.spritesheet('stage_icons', A+'icons/stage_icons.png', {frameWidth:72, frameHeight:72});
  // VFX
  this.load.spritesheet('vfx', A+'vfx/vfx_atlas.png', {frameWidth:128, frameHeight:128});
 }

 create(){
  this.loadSave();this.input.addPointer(5);this.physics.world.setBounds(0,0,WORLD_W,H);
  this.createAnimations();this.createWorld();this.createPlayer();
  this.enemyGroup=this.physics.add.group({runChildUpdate:false});
  this.enemyProjectiles=this.physics.add.group({maxSize:36});this.playerProjectiles=this.physics.add.group({maxSize:24});
  this.createVfxPool();
  this.physics.add.overlap(this.enemyProjectiles,this.player,(p)=>this.enemyProjectileHit(p));
  this.createHUD();this.createTouchControls();this.createMinimap();
  this.input.on('pointerdown',p=>{if(!this.panel&&p.y>=FIELD.top&&p.y<=FIELD.bottom)this.moveTarget={x:Phaser.Math.Clamp(p.x+this.cameras.main.scrollX,FIELD.left,FIELD.right),y:p.y};});
  this.keys=this.input.keyboard.addKeys('A,D,W,S,LEFT,RIGHT,UP,DOWN,SPACE,Q,E,F,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,ZERO');
  this.startStage(this.stageIndex);
  this.time.addEvent({delay:850,loop:true,callback:()=>this.regen()});
  this.time.addEvent({delay:1200,loop:true,callback:()=>this.manageEnemyLOD()});
  this.time.addEvent({delay:260,loop:true,callback:()=>this.updateMinimap()});
  this.time.addEvent({delay:5000,loop:true,callback:()=>this.autoSave()});
  // Chưởng Thiên Bình ngưng tụ Lục Dịch mỗi 25 giây
  this.time.addEvent({delay:25000,loop:true,callback:()=>{
   this.bottleLiquid=Math.min(99,this.bottleLiquid+1);
   this.showBanner('🌿 Bình Chưởng Thiên ngưng tụ +1 giọt Lục Dịch!');
   this.updateHUD();
  }});
 }

 createAnimations(){
  const make=(key,tex,start,end,rate,repeat=-1)=>{if(!this.anims.exists(key))this.anims.create({key,frames:this.anims.generateFrameNumbers(tex,{start,end}),frameRate:rate,repeat});};
  make('p_idle','player_idle',0,7,8);make('p_run','player_run',0,7,12);make('p_attack','player_attack',0,7,15,0);
  for(let i=1;i<=8;i++){
   const t='enemy_'+i;
   make('e_'+t+'_idle',t,0,1,4);
   make('e_'+t+'_run',t,2,5,8);
   make('e_'+t+'_attack',t,6,9,10,0);
   make('e_'+t,t,2,5,8);
  }
  make('e_boss_idle','boss',0,1,3);
  make('e_boss_run','boss',2,5,6);
  make('e_boss_attack','boss',6,9,8,0);
  make('e_boss','boss',2,5,6);
 }

 createWorld(){
  this.add.rectangle(WORLD_W/2,H/2,WORLD_W,H,0x061118).setDepth(-10);
  this.bg=this.add.tileSprite(WORLD_W/2,480,WORLD_W,960,'valley_panorama').setDepth(-8);
  this.decorGroup=this.add.group();
  for(let x=60;x<WORLD_W;x+=180){
   const y=Phaser.Math.Between(FIELD.top+10,FIELD.bottom-10),s=this.perspective(y);
   const t=this.add.ellipse(x,y+10,50*s,16*s,0x08151c,.40).setDepth(2);
   this.decorGroup.add(t);
  }
 }

 createPlayer(){
  this.player=this.physics.add.sprite(300,740,'player_idle',0).setScale(.72).setDepth(20);
  this.player.setCollideWorldBounds(true);
  this.player.body.setSize(44,70).setOffset(42,40);
  this.player.play('p_idle');
  this.sword=this.add.image(this.player.x,this.player.y+15,'flying_sword').setScale(.38).setDepth(19).setVisible(false);
  this.guardAuraSprite=this.add.ellipse(this.player.x,this.player.y,78,92,0x67e8f9,.18).setStrokeStyle(2,0x38bdf8,.7).setDepth(21).setVisible(false);
  this.cameras.main.setBounds(0,0,WORLD_W,H);
  this.cameras.main.startFollow(this.player,true,.08,.08,0,30);
  this.cameras.main.setDeadzone(35,30);
 }

 createVfxPool(){
  this.vfxPool=this.add.group({defaultKey:'vfx',maxSize:48});
  for(let i=0;i<24;i++){const s=this.add.image(-200,-200,'vfx',0).setVisible(false).setActive(false).setDepth(35);this.vfxPool.add(s);}
 }

 spawnVfx(x,y,frame=0,scale=1,opts={}){
  const maxActive=this.quality==='low'?10:20;
  if(this.vfxActive>=maxActive&&!opts.critical){this.vfxStats.dropped++;return null;}
  const v=this.vfxPool.get(x,y,'vfx',frame);
  if(!v)return null;
  this.vfxActive++;this.vfxStats.spawned++;
  const grow=opts.grow||1,duration=opts.duration||320,alpha=opts.alpha??.95,spin=opts.spin||0;
  v.clearTint().setActive(true).setVisible(true).setTexture('vfx',frame).setPosition(x,y).setFrame(frame).setScale(scale).setAlpha(alpha).setAngle(opts.angle||0).setDepth(opts.depth||35);
  if(opts.tint)v.setTint(opts.tint);
  this.tweens.killTweensOf(v);
  this.tweens.add({targets:v,scaleX:scale*grow,scaleY:scale*grow,alpha:0,angle:v.angle+spin,duration,ease:opts.ease||'Cubic.easeOut',onComplete:()=>{v.setActive(false).setVisible(false);this.vfxActive=Math.max(0,this.vfxActive-1);}});
  return v;
 }

 spawnVfxEcho(x,y,frame=0,scale=1,opts={}){
  const first=this.spawnVfx(x,y,frame,scale,opts);
  if(opts.echoDelay&&this.quality!=='low'){this.time.delayedCall(opts.echoDelay,()=>{if(this.player?.active){this.spawnVfx(x,y,frame,scale*(opts.echoScale||.85),{duration:(opts.duration||320)*.85,alpha:(opts.alpha||.95)*(opts.echoAlpha||.45),angle:(opts.angle||0)+15,tint:opts.tint,depth:(opts.depth||35)-1});}});}
  return first;
 }

 clearVfxPool(){
  if(!this.vfxPool)return;
  this.vfxPool.getChildren().forEach(v=>{this.tweens.killTweensOf(v);v.setActive(false).setVisible(false);});
  this.vfxActive=0;
 }

 vfxVisualLimit(highLimit,lowLimit){return this.quality==='low'?lowLimit:highLimit;}
 perspective(y){return .52+.83*Phaser.Math.Clamp((y-FIELD.top)/(FIELD.bottom-FIELD.top),0,1);}
 fixed(o,d=100){return o.setScrollFactor(0).setDepth(d);}

 createHUD(){
  // Avatar & Header Status Card
  this.fixed(this.add.circle(47,52,27,0x122e38).setStrokeStyle(2,0xd6b766),101);
  this.fixed(this.add.image(47,52,'player_idle',0).setScale(.39),102);
  this.fixed(this.add.image(47,52,'ui_avatar_frame').setScale(.60),103);
  this.nameText=this.fixed(this.add.text(86,15,'Hàn Lập • '+REALMS[this.realm],{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'15px',fontStyle:'bold',color:'#fff4d2',stroke:'#17343d',strokeThickness:3}),104);
  this.hpBar=this.fixed(this.add.rectangle(86,43,188,10,0xec605f).setOrigin(0),104);
  this.hpText=this.fixed(this.add.text(180,48,'',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'8px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5),105);
  this.mpBar=this.fixed(this.add.rectangle(86,60,188,8,0x44b9da).setOrigin(0),104);
  this.mpText=this.fixed(this.add.text(180,64,'',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'8px',fontStyle:'bold',color:'#e8fbff'}).setOrigin(.5),105);
  this.realmText=this.fixed(this.add.text(86,75,`💎 Linh Thạch: ${this.spiritStones}  •  🌿 Lục Dịch: ${this.bottleLiquid}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'10px',fontStyle:'bold',color:'#86efac',stroke:'#17343d',strokeThickness:2}),104);
  this.stageName=this.fixed(this.add.text(440,8,'',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'11px',fontStyle:'bold',color:'#fff1c3',align:'center'}).setOrigin(.5,0),108);
  
  // 5 Bottom Navigation Buttons
  this.navItems=[];
  this.makeBottomButton(55,'ui_icon_bag','TÚI ĐỒ',()=>this.openPanel('gear'));
  this.makeBottomButton(150,'ui_icon_realm','TU VI',()=>this.openPanel('realm'));
  this.makeBottomButton(245,'ui_icon_pill','CHƯỞNG THIÊN',()=>this.openPanel('alchemy'));
  this.makeBottomButton(340,'ui_icon_skills','THẦN THÔNG',()=>{this.pickingSlot=0;this.openPanel('skills');});
  this.autoBtn=this.makeBottomButton(435,'ui_icon_auto','AUTO',()=>{
   this.autoBattle=!this.autoBattle;
   this.showBanner(this.autoBattle?'☯ Tự Động Chiến Đấu':'⚔ Điều Khiển Thủ Công');
   this.updateAutoButtonState();
  });
  
  const toggle=this.fixed(this.add.text(516,927,'›',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'30px',fontStyle:'bold',color:'#fff1c3',stroke:'#17343d',strokeThickness:3}).setOrigin(.5).setInteractive(new Phaser.Geom.Rectangle(-17,-23,34,46),Phaser.Geom.Rectangle.Contains),130);
  toggle.on('pointerdown',()=>{
   this.menuHidden=!this.menuHidden;
   this.navItems.forEach(o=>o.setVisible(!this.menuHidden));
   toggle.setText(this.menuHidden?'‹':'›');
  });
 }

 calcBattlePower(){
  const gear=Object.values(this.equipment).reduce((a,b)=>a+(b?.power||0),0);
  const canhKimBonus=this.magicTreasure.canhKimInfused*35;
  return Math.round((this.baseDamage + gear + canhKimBonus)*26 + this.maxHp*0.85 + this.realm*580);
 }

 makeBottomButton(x,imageKey,label,cb){
  const bg=this.fixed(this.add.circle(x,904,24,0x0b1f2b,.92).setStrokeStyle(1.8,0xd4af37).setInteractive(new Phaser.Geom.Circle(24,24,24),Phaser.Geom.Circle.Contains),124);
  const icon=this.fixed(this.add.image(x,904,imageKey).setScale(.76),125);
  const t=this.fixed(this.add.text(x,946,label,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:'#fff8dc',stroke:'#18372e',strokeThickness:2}).setOrigin(.5),126);
  const trigger=()=>{
   this.tweens.add({targets:[bg,icon],scaleX:.88,scaleY:.88,yoyo:true,duration:70});
   cb();
  };
  bg.on('pointerdown',trigger);
  icon.setInteractive().on('pointerdown',trigger);
  this.navItems.push(bg,icon,t);
  return {bg,icon,t};
 }

 updateAutoButtonState(){
  if(!this.autoBtn)return;
  this.autoBtn.t.setColor(this.autoBattle?'#86efac':'#fca5a5');
  this.autoBtn.icon.setAlpha(this.autoBattle?1:.5);
  this.autoBtn.bg.setStrokeStyle(1.8,this.autoBattle?0x22c55e:0xd4af37);
 }

 createTouchControls(){
  const zone=this.fixed(this.add.rectangle(W/2,H/2,W,H,0x000000,0).setInteractive(),50);
  const base=this.fixed(this.add.circle(0,0,59,0xd9fff1,.12).setStrokeStyle(2,0xd9fff1,.36).setVisible(false),121);
  const knob=this.fixed(this.add.circle(0,0,23,0xd9fff1,.34).setStrokeStyle(2,0xffffff,.56).setVisible(false),122);
  this.joy={x:0,y:0,active:false,id:null};
  const upd=p=>{
   let dx=p.x-this.joy.cx,dy=p.y-this.joy.cy;
   const len=Math.hypot(dx,dy)||1,max=48;
   if(len>max){dx=dx/len*max;dy=dy/len*max;}
   knob.setPosition(this.joy.cx+dx,this.joy.cy+dy);
   this.joy.x=dx/max;this.joy.y=dy/max;
  };
  zone.on('pointerdown',p=>{
   if(this.panel||this.dead||this.joy.active)return;
   this.joy.active=true;this.joy.id=p.id;this.joy.cx=p.x;this.joy.cy=p.y;
   base.setPosition(p.x,p.y).setVisible(true);
   knob.setPosition(p.x,p.y).setVisible(true);
   upd(p);
  });
  this.input.on('pointermove',p=>{if(this.joy.active&&this.joy.id===p.id)upd(p)});
  const release=p=>{if(this.joy.id===p.id){this.joy.active=false;this.joy.id=null;this.joy.x=this.joy.y=0;base.setVisible(false);knob.setVisible(false)}};
  this.input.on('pointerup',release);
  this.input.on('pointerupoutside',release);

  // 4 Skill buttons
  this.skillButtons=[];
  this.skillRowItems=[];
  const skillPresses=new Map();
  const finishSkillPress=(p,cast)=>{
   const press=skillPresses.get(p.id);
   if(!press)return;
   press.timer.remove(false);
   skillPresses.delete(p.id);
   if(cast&&!press.long&&!press.cancelled&&!this.panel&&!this.dead)this.castSkill(this.loadout[press.slot]);
  };
  this.input.on('pointermove',p=>{
   const press=skillPresses.get(p.id);
   if(press&&Math.hypot(p.x-press.x,p.y-press.y)>24){
    press.cancelled=true;
    press.timer.remove(false);
   }
  });
  this.input.on('pointerup',p=>finishSkillPress(p,true));
  this.input.on('pointerupoutside',p=>finishSkillPress(p,false));
  
  const positions=[65,180,295,410];
  positions.forEach((x,slot)=>{
   const idx=this.loadout[slot];
   const bg=this.fixed(this.add.circle(x,808,23,0x0c2230,.92).setStrokeStyle(1.8,0xd4af37).setInteractive(new Phaser.Geom.Circle(23,23,23),Phaser.Geom.Circle.Contains),124);
   const b=this.fixed(this.add.image(x,808,'skill_icons',SKILLS[idx].frame).setScale(.58),125);
   const triggerPress=p=>{
    if(this.panel||this.dead)return;
    const press={slot,x:p.x,y:p.y,long:false,cancelled:false,timer:null};
    press.timer=this.time.delayedCall(500,()=>{
     if(press.cancelled||skillPresses.get(p.id)!==press||!p.isDown)return;
     press.long=true;
     this.pickingSlot=slot;
     this.openPanel('skills');
    });
    skillPresses.set(p.id,press);
   };
   bg.on('pointerdown',triggerPress);
   b.setInteractive().on('pointerdown',triggerPress);
   const label=this.fixed(this.add.text(x,843,SKILLS[idx].name.length>7?SKILLS[idx].name.slice(0,6)+'..':SKILLS[idx].name,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:'#f5ffed',stroke:'#18372e',strokeThickness:2}).setOrigin(.5),126);
   const cd=this.fixed(this.add.text(x,808,'',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#fff',stroke:'#17343d',strokeThickness:3}).setOrigin(.5),127);
   this.skillButtons.push({b,bg,cd,label,slot});
   this.skillRowItems.push(b,bg,cd,label);
  });
  const skillToggle=this.fixed(this.add.text(516,812,'›',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'28px',fontStyle:'bold',color:'#fff1c3',stroke:'#17343d',strokeThickness:3}).setOrigin(.5).setInteractive(new Phaser.Geom.Rectangle(-17,-23,34,46),Phaser.Geom.Rectangle.Contains),130);
  skillToggle.on('pointerdown',()=>{
   this.skillsHidden=!this.skillsHidden;
   this.skillRowItems.forEach(o=>o.setVisible(!this.skillsHidden));
   skillToggle.setText(this.skillsHidden?'‹':'›');
  });
 }

 createMinimap(){
  this.miniBg=this.fixed(this.add.circle(472,83,46,0x081f29,.93).setStrokeStyle(2,0xd4af37),115);
  this.mini=this.fixed(this.add.graphics(),116);
 }

 updateMinimap(){
  if(!this.mini||!this.player)return;
  this.mini.clear();
  const cx=472,cy=83,r=40;
  this.mini.fillStyle(0x0a2218,.75);
  this.mini.fillCircle(cx,cy,r);
  const px=(this.player.x/WORLD_W)*80-40,py=(this.player.y-FIELD.top)/(FIELD.bottom-FIELD.top)*70-35;
  this.mini.fillStyle(0xffd700,1);
  this.mini.fillTriangle(cx+px,cy+py-5,cx+px-5,cy+py+5,cx+px+5,cy+py+5);
  let n=0;
  this.enemyGroup.getChildren().forEach(e=>{
   if(!e.active||n>25)return;n++;
   const ex=(e.x/WORLD_W)*80-40,ey=(e.y-FIELD.top)/(FIELD.bottom-FIELD.top)*70-35;
   this.mini.fillStyle(e.isBoss?0xffa100:0xef4444,e.isBoss?1:.75);
   this.mini.fillCircle(cx+ex,cy+ey,e.isBoss?3.5:1.8);
  });
 }

 startStage(idx){
  this.respawnTimer?.remove();this.respawnTimer=null;this.invulnerableUntil=0;this.player.setAlpha(1);
  this.stageIndex=Phaser.Math.Clamp(idx||0,0,STAGES.length-1);
  this.stageWon=false;this.kills=0;this.dead=false;this.shield=0;this.boss=null;this.autoBattle=true;this.clearWeather();
  if(this.enemyGroup){this.enemyGroup.getChildren().forEach(e=>this.destroyEnemyUi(e));this.enemyGroup.clear(true,true);}
  this.enemyProjectiles?.clear(true,true);this.playerProjectiles?.clear(true,true);this.clearVfxPool();
  this.player.setPosition(300,740);this.player.setVelocity(0,0);this.hp=this.maxHp;this.mp=this.maxMp;
  const s=STAGES[this.stageIndex];
  this.stageName.setText(s.name.toUpperCase());
  this.createWeather(s.weather);
  const count=16;
  for(let i=0;i<count;i++){
   const type=Phaser.Utils.Array.GetRandom(s.enemies),x=390+i*115+Phaser.Math.Between(-25,25),y=Phaser.Math.Between(FIELD.top+20,FIELD.bottom-20);
   this.spawnEnemy(type,x,y);
  }
  this.spawnBoss(WORLD_W-300,720);this.updateHUD();this.autoSave();
 }

 spawnEnemy(type,x,y){
  const d=ENEMY_TYPES[type]||ENEMY_TYPES.mob_1;
  const e=this.enemyGroup.create(x,y,d.tex,0).setScale(d.scale*.86*this.perspective(y)).setDepth(10).setTint(d.tint);
  e.baseScale=d.scale*.86;e.enemyTex=d.tex;e.typeId=type;e.nameLabel=d.name;
  e.maxHp=Math.round(d.hp*(1+this.stageIndex*.17));e.hp=e.maxHp;e.speed=d.spd;
  e.damage=Math.round(d.dmg*(1+this.stageIndex*.11));e.flying=!!d.flying;e.elite=!!d.elite;
  e.ai=d.ai||'melee';e.serial=++this.enemySerial;e.freezeUntil=0;e.lastHit=0;e.lastSkill=0;e.homeX=x;e.homeY=y;
  e.body.setAllowGravity(false).setImmovable(false);e.setCollideWorldBounds(true);
  e.play('e_'+d.tex+'_run',true);e.body.setSize(46,46);
  if(e.elite)this.makeHpBar(e,76);
  return e;
 }

 spawnBoss(x,y){
  const mult=1+this.stageIndex*.30;
  const b=this.enemyGroup.create(x,y,'boss',0).setScale(.8*this.perspective(y)).setDepth(13).setTint(this.stageIndex>=5?STAGES[this.stageIndex].tint:0xffffff);
  b.baseScale=.8;b.enemyTex='boss';b.typeId='boss';b.nameLabel=STAGES[this.stageIndex].boss;
  b.maxHp=Math.round(5200*mult);b.hp=b.maxHp;b.speed=36+this.stageIndex*2;b.damage=Math.round(95*mult);
  b.flying=false;b.elite=true;b.isBoss=true;b.ai='boss';b.phase=1;b.freezeUntil=0;b.lastHit=0;b.lastSkill=0;
  b.body.setAllowGravity(false);b.setCollideWorldBounds(true);b.play('e_boss_run',true);b.body.setSize(95,70);
  this.makeHpBar(b,124);this.boss=b;
 }

 playEnemyAttack(e){
  if(!e?.active||!e.enemyTex)return;
  const key='e_'+e.enemyTex+'_attack';
  if(this.anims.exists(key)){
   e.play(key,true);
   e.once('animationcomplete',()=>{if(e.active&&e.anims.currentAnim?.key===key){const isMove=e.body&&Math.hypot(e.body.velocity.x,e.body.velocity.y)>6;e.play('e_'+e.enemyTex+(isMove?'_run':'_idle'),true);}});
  }
 }

 makeHpBar(e,w){
  e.hpBarBg=this.add.rectangle(e.x,e.y-e.displayHeight*.55-10,w,7,0x2b0b10).setDepth(30);
  e.hpBar=this.add.rectangle(e.x-w/2,e.y-e.displayHeight*.55-10,w,7,e.isBoss?0xffa100:0xef4444).setOrigin(0,.5).setDepth(31);
  e.hpBarW=w;
 }

 updateEnemyBar(e){
  if(!e.hpBar)return;
  e.hpBarBg.setPosition(e.x,e.y-e.displayHeight*.55-10);
  e.hpBar.setPosition(e.x-e.hpBarW/2,e.y-e.displayHeight*.55-10);
  e.hpBar.displayWidth=e.hpBarW*Math.max(0,e.hp/e.maxHp);
 }

 destroyEnemyUi(e){if(e?.hpBar){e.hpBar.destroy();e.hpBarBg.destroy();}}

 nearestEnemies(max=350,count=1){
  return this.enemyGroup.getChildren().filter(e=>e.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,e.x,e.y)<=max).sort((a,b)=>Phaser.Math.Distance.Between(this.player.x,this.player.y,a.x,a.y)-Phaser.Math.Distance.Between(this.player.x,this.player.y,b.x,b.y)).slice(0,count);
 }

 basicAttack(){
  if(this.time.now<(this.lastBasic||0)+250)return;
  this.lastBasic=this.time.now;
  this.playAttackAnim();
  const t=this.nearestEnemies(155,1)[0];
  if(t){this.hitEnemy(t,this.damage());this.spawnVfx(t.x,t.y,0,.46,{duration:220,grow:1.24,angle:this.player.flipX?180:0});}
  else this.projectileSlash(this.damage()*.76,440);
 }

 castSkill(i){
  if(this.panel||this.dead)return;
  const sk=SKILLS[i],now=this.time.now;
  if(now<this.skillReadyAt[i]||this.mp<sk.mana)return;
  this.skillReadyAt[i]=now+sk.cd;
  this.mp-=sk.mana;
  if(i!==7&&i!==9)this.playAttackAnim();
  if(i===0)this.projectileSlash(this.damage()*1.22,700);
  if(i===1)this.swordRain();
  if(i===2)this.chainLightning(); // Tịch Tà Thần Lôi
  if(i===3)this.iceSlash();       // Càn Lam Băng Diễm
  if(i===4)this.fireBurst();      // Tử Cực Ma Hỏa
  if(i===5)this.ultimate();       // Đại Canh Kiếm Trận
  if(i===6)this.dash();           // Phong Lôi Dực
  if(i===7)this.toggleFly();      // Ngự Kiếm Phi Hành
  if(i===8)this.swordFormation(); // Phệ Kim Trùng Quần
  if(i===9)this.guardAura();      // Phạm Thánh Chân Ma Thể
  this.updateHUD();
 }

 damage(){
  const gear=Object.values(this.equipment).reduce((a,b)=>a+(b?.power||0),0);
  const setBonus=this.setBonus();
  const canhKimBonus=this.magicTreasure.canhKimInfused*25;
  return Math.round(this.baseDamage*(1+this.realm*.085)+gear*.92+canhKimBonus+setBonus);
 }

 setBonus(){
  const rar=Object.values(this.equipment).map(x=>x?.rarity||0);
  if(rar.length>=4&&rar.filter(r=>r>=3).length>=4)return 70;
  if(rar.length>=6&&rar.every(r=>r>=2))return 40;
  return 0;
 }

 playAttackAnim(){
  this.player.play('p_attack',true);
  this.player.once('animationcomplete',()=>{if(this.player.active)this.player.play(this.flying?'p_run':'p_idle',true);});
 }

 projectileSlash(dmg,speed){
  const t=this.nearestEnemies(520,1)[0],dir=t?Math.sign(t.x-this.player.x)||1:(this.player.flipX?-1:1);
  const p=this.playerProjectiles.get(this.player.x+dir*34,this.player.y-5,'vfx',0);
  if(!p)return;
  p.enableBody(true,this.player.x+dir*34,this.player.y-5,true,true).setFrame(0).setScale(.58).setDepth(25).setFlipX(dir<0);
  p.body.setAllowGravity(false);
  if(t)this.physics.moveTo(p,t.x,t.y,speed);else p.setVelocityX(dir*speed);
  p.damage=dmg;p.hitSet=new Set();
  const ov=this.physics.add.overlap(p,this.enemyGroup,(proj,e)=>{
   if(!e.active||proj.hitSet.has(e))return;
   proj.hitSet.add(e);this.hitEnemy(e,dmg);
   if(proj.hitSet.size>=3){ov.destroy();this.releaseProjectile(proj);}
  });
  this.time.delayedCall(760,()=>{if(ov.active)ov.destroy();this.releaseProjectile(p);});
 }

 releaseProjectile(p){if(!p||!p.active)return;p.disableBody(true,true);}

 swordRain(){
  const ts=this.nearestEnemies(390,12),visual=this.vfxVisualLimit(7,4);
  ts.forEach((e,k)=>this.time.delayedCall(k*62,()=>{
   if(e.active){
    if(k<visual)this.spawnVfx(e.x,e.y-48,1,.52,{duration:300,grow:1.18,angle:(k%2?12:-12)});
    this.hitEnemy(e,this.damage()*.94);
   }
  }));
 }

 // Tịch Tà Thần Lôi (Sét Vàng Kim của Hàn Lập)
 chainLightning(){
  const ts=this.nearestEnemies(480,8);
  if(!ts.length)return;
  const g=this.add.graphics().setDepth(28),visual=this.vfxVisualLimit(8,5);
  g.lineStyle(this.quality==='low'?3:5,0xffe066,this.quality==='low'?.75:.95);
  let x=this.player.x,y=this.player.y;
  ts.forEach((e,k)=>{
   g.lineBetween(x,y,e.x,e.y);
   this.hitEnemy(e,this.damage()*1.35); // Diệt ma tăng 35% sát thương
   if(k<visual)this.spawnVfx(e.x,e.y,2,.54,{duration:240,grow:1.24,tint:0xffe066,angle:k*17});
   x=e.x;y=e.y;
  });
  this.time.delayedCall(this.quality==='low'?100:150,()=>g.destroy());
 }

 // Càn Lam Băng Diễm
 iceSlash(){
  const ts=this.nearestEnemies(300,14),visual=this.vfxVisualLimit(7,4);
  ts.forEach((e,k)=>{
   this.hitEnemy(e,this.damage()*.95);
   e.freezeUntil=this.time.now+2500;
   e.setTint(0x99ddff);
   if(k<visual)this.spawnVfx(e.x,e.y,3,.55,{duration:420,grow:1.14,tint:0x67e8f9,angle:(k%3-1)*10});
  });
 }

 // Tử Cực Ma Hỏa
 fireBurst(){
  const t=this.nearestEnemies(480,1)[0],tx=t?.x??this.player.x+(this.player.flipX?-220:220),ty=t?.y??this.player.y;
  const orb=this.playerProjectiles.get(this.player.x,this.player.y-10,'vfx',4);
  if(!orb)return;
  orb.enableBody(true,this.player.x,this.player.y-10,true,true).setFrame(4).setScale(.42).setDepth(25);
  orb.body.setAllowGravity(false);
  this.physics.moveTo(orb,tx,ty,550);
  this.time.delayedCall(420,()=>{
   if(!orb.active)return;
   const x=orb.x,y=orb.y;
   this.releaseProjectile(orb);
   this.spawnVfxEcho(x,y,4,.95,{critical:true,duration:450,grow:1.38,tint:0xc084fc,echoDelay:75,echoAlpha:.30,echoScale:.72});
   this.enemyGroup.getChildren().forEach(e=>{if(e.active&&Phaser.Math.Distance.Between(x,y,e.x,e.y)<165)this.hitEnemy(e,this.damage()*1.55);});
  });
 }

 // Đại Canh Kiếm Trận (72 Thanh Trúc Phong Vân Kiếm)
 ultimate(){
  const ts=this.nearestEnemies(580,24),ring=this.vfxVisualLimit(8,5),hits=this.vfxVisualLimit(8,4);
  this.spawnVfx(this.player.x,this.player.y,5,.85,{critical:true,duration:560,grow:1.32,alpha:.80,spin:26,tint:0x86efac});
  for(let r=0;r<ring;r++){
   const deg=r*360/ring,a=Phaser.Math.DegToRad(deg);
   this.time.delayedCall(r*26,()=>this.spawnVfx(this.player.x+Math.cos(a)*115,this.player.y+Math.sin(a)*85,5,.54,{duration:480,grow:1.18,angle:deg,spin:20,tint:0x86efac}));
  }
  ts.forEach((e,k)=>this.time.delayedCall(140+k*28,()=>{
   if(e.active){
    this.hitEnemy(e,this.damage()*1.95);
    if(k<hits)this.spawnVfx(e.x,e.y,5,.68,{duration:340,grow:1.26,angle:k*23,tint:0xffd700});
   }
  }));
  this.cameras.main.shake(this.quality==='low'?120:200,this.quality==='low'?.003:.005);
 }

 // Phệ Kim Trùng Quần
 swordFormation(){
  const ts=this.nearestEnemies(440,18),count=this.vfxVisualLimit(8,5);
  this.spawnVfx(this.player.x,this.player.y,8,.70,{critical:true,duration:500,grow:1.15,alpha:.50,spin:32,tint:0xffe066});
  for(let i=0;i<count;i++){
   const deg=i*360/count,a=Phaser.Math.DegToRad(deg);
   this.time.delayedCall(i*22,()=>this.spawnVfx(this.player.x+Math.cos(a)*100,this.player.y+Math.sin(a)*75,8,.52,{duration:450,grow:1.14,angle:deg+90,spin:24,tint:0xffe066}));
  }
  ts.forEach((e,k)=>this.time.delayedCall(180+k*24,()=>{if(e.active)this.hitEnemy(e,this.damage()*1.32);}));
 }

 // Phạm Thánh Chân Ma Thể (Hộ Thể Chân Khí)
 guardAura(){
  this.shield=Math.round(this.maxHp*.40+this.damage()*1.6);
  this.spawnVfxEcho(this.player.x,this.player.y,9,1.0,{critical:true,duration:550,grow:1.20,alpha:.85,tint:0xffd700,echoDelay:90,echoAlpha:.25,echoScale:.82});
  if(this.guardAuraSprite)this.guardAuraSprite.setVisible(true);
  this.showBanner('☯ Phạm Thánh Chân Ma Thể • Hộ Thể +'+this.shield);
 }

 hitEnemy(e,amount){
  if(!e.active)return;
  const crit=Math.random()<.15,dmg=Math.max(1,Math.round(amount*(.9+Math.random()*.2)*(crit?1.85:1)));
  e.hp-=dmg;
  const t=this.add.text(e.x,e.y-45,(crit?'✦ BẠO KÍCH ':'')+'-'+dmg,{fontFamily:'Cinzel,Be Vietnam Pro,sans-serif',fontSize:e.isBoss?'20px':'15px',fontStyle:'bold',color:crit?'#ffe066':'#fff27a',stroke:'#3a2300',strokeThickness:3}).setOrigin(.5).setDepth(40);
  this.tweens.add({targets:t,y:t.y-34,alpha:0,duration:550,onComplete:()=>t.destroy()});
  e.setAlpha(.55);
  this.time.delayedCall(65,()=>{if(e.active)e.setAlpha(1)});
  this.updateEnemyBar(e);
  if(e.isBoss)this.updateBossPhase(e);
  if(e.hp<=0)this.killEnemy(e);
 }

 updateBossPhase(b){
  if(!b.active)return;
  const p=b.hp/b.maxHp,newPhase=p<=.33?3:p<=.66?2:1;
  if(newPhase!==b.phase){
   b.phase=newPhase;b.speed+=8;b.damage=Math.round(b.damage*1.15);
   this.showBanner(`Ma Đạo Cuồng Bạo • Giai Đoạn ${newPhase}!`);
   this.cameras.main.shake(180,.004);
  }
 }

 killEnemy(e){
  this.destroyEnemyUi(e);
  const wasBoss=e.isBoss;
  e.disableBody(true,true);
  this.kills++;
  
  // Drops & Exp
  const gainedExp=wasBoss?350:25+(e.elite?80:0);
  const gainedStones=wasBoss?Phaser.Math.Between(40,90):Phaser.Math.Between(2,8);
  this.spiritStones+=gainedStones;
  this.gainExp(gainedExp);
  
  // Phàm Nhân Materials Drop (Yêu Đan, Canh Kim, Linh Dược)
  if(Math.random()<0.35){this.materials.linh_duoc+=1;}
  if(Math.random()<0.20){this.materials.canh_kim+=1;}
  if(wasBoss||Math.random()<0.25){this.materials.yeu_dan+=1;}
  
  if(Math.random()<(wasBoss?.98:.22))this.dropItem(wasBoss?3:0);
  this.updateHUD();
  
  this.time.delayedCall(wasBoss?6000:2500,()=>{
   if(wasBoss){
    if(!this.boss.active)this.spawnBoss(Phaser.Math.Clamp(this.player.x+350,FIELD.left,FIELD.right),650);
   }else{
    this.spawnEnemy(Phaser.Utils.Array.GetRandom(STAGES[this.stageIndex].enemies),Phaser.Math.Clamp(this.player.x+Phaser.Math.Between(-330,420),FIELD.left,FIELD.right),Phaser.Math.Between(FIELD.top+20,FIELD.bottom-20));
   }
   this.updateHUD();
  });
 }

 gainExp(n){
  this.exp+=n;
  let need=this.expNeed();
  while(this.exp>=need&&this.realm<REALMS.length-1){
   this.exp-=need;
   this.realm++;
   this.level++;
   this.maxHp=Math.round(this.maxHp*1.12);
   this.maxMp=Math.round(this.maxMp*1.08);
   this.baseDamage=Math.round(this.baseDamage*1.06);
   this.hp=this.maxHp;this.mp=this.maxMp;
   this.showBanner('☯ ĐỘT PHÁ • '+REALMS[this.realm]);
   this.spawnVfx(this.player.x,this.player.y,9,1.1,{critical:true,duration:600});
   need=this.expNeed();
  }
  this.updateHUD();
 }

 expNeed(){return 320+this.realm*160;}

 dropItem(bonus=0){
  const frame=Phaser.Math.Between(0,17),slot=['weapon','armor','helm','boots','ring','talisman'][frame%6],rarity=Phaser.Math.Clamp(Math.floor(frame/3)+bonus,0,5),power=Math.round((18+this.stageIndex*11+Phaser.Math.Between(0,20))*RARITY[rarity].mult);
  const itemNames=['Thanh Trúc Kiếm','Huyền Quy Giáp','Tử Kim Quan','Phong Hành Hài','Càn Khôn Giới','Thái Cực Bội'];
  const item={frame,slot,rarity,power,name:`${RARITY[rarity].name} ${itemNames[frame%6]} +${power}`};
  this.inventory.unshift(item);
  this.inventory=this.inventory.slice(0,30);
  if(!this.equipment[slot]||this.equipment[slot].power<power)this.equipment[slot]=item;
  
  const icon=this.fixed(this.add.image(270,250,'items',frame).setScale(.65),180);
  const tx=this.fixed(this.add.text(270,298,'Thu Hoạch: '+item.name,{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#ffe67b',backgroundColor:'rgba(6,16,26,.88)',padding:{x:8,y:5}}).setOrigin(.5).setStroke('#d4af37',1),180);
  this.tweens.add({targets:[icon,tx],alpha:0,y:'-=25',delay:650,duration:450,onComplete:()=>{icon.destroy();tx.destroy();}});
 }

 dash(){
  const ox=this.player.x,oy=this.player.y,dx=this.joy.x||(this.player.flipX?-1:1),dy=this.joy.y||0;
  this.player.setPosition(Phaser.Math.Clamp(this.player.x+dx*95,FIELD.left,FIELD.right),Phaser.Math.Clamp(this.player.y+dy*95,FIELD.top,FIELD.bottom));
  this.spawnVfx(ox,oy,6,.50,{duration:240,grow:1.20,alpha:.65,angle:this.player.flipX?180:0});
  this.spawnVfx(this.player.x,this.player.y,6,.60,{duration:260,grow:1.24,angle:this.player.flipX?180:0});
 }

 jump(){this.dash();}

 toggleFly(){
  this.flying=!this.flying;
  this.sword.setVisible(this.flying);
  this.showBanner(this.flying?'🗡 Ngự Kiếm Phi Hành (Phong Vân Kiếm)':'⚔ Thu Hồi Phi Kiếm');
 }

 enemyShoot(e,frame=10,speed=210){
  if(!e.active)return;
  const p=this.enemyProjectiles.get(e.x,e.y-10,'vfx',frame);
  if(!p)return;
  p.enableBody(true,e.x,e.y-10,true,true).setFrame(frame).setScale(.28).setDepth(24);
  p.body.setAllowGravity(false);
  p.damage=e.damage*.72;
  this.physics.moveTo(p,this.player.x,this.player.y,speed);
  this.time.delayedCall(2400,()=>{if(p.active)p.disableBody(true,true);});
 }

 enemyProjectileHit(p){
  if(!p.active||this.dead)return;
  const dmg=Math.round(p.damage||20);
  p.disableBody(true,true);
  this.applyPlayerDamage(dmg);
 }

 applyPlayerDamage(dmg){
  if(this.dead||this.time.now<this.invulnerableUntil)return;
  if(this.shield>0){
   const absorb=Math.min(this.shield,dmg);
   this.shield-=absorb;dmg-=absorb;
   this.spawnVfx(this.player.x,this.player.y,9,.45,{critical:true,duration:260,grow:1.16});
  }
  if(dmg<=0)return;
  this.hp=Math.max(0,this.hp-dmg);
  this.updateHUD();
  const now=this.time.now;
  if(dmg>=60&&(now-(this.lastShake||0)>900)){
   this.lastShake=now;
   this.cameras.main.shake(100,.0025);
  }
  if(this.hp<=0)this.playerDeath();
 }

 bossAttack(b,time,dist,dx){
  if(time-b.lastSkill<Math.max(1150,2300-b.phase*280))return;
  b.lastSkill=time;
  this.playEnemyAttack(b);
  const pattern=(Math.floor(time/1200)+b.phase+this.stageIndex)%3;
  if(pattern===0){
   this.telegraph(b.x,b.y,115,()=>{
    this.nearestEnemies(999,0);
    if(Phaser.Math.Distance.Between(b.x,b.y,this.player.x,this.player.y)<135)this.applyPlayerDamage(b.damage*1.15);
    this.spawnVfx(b.x,b.y,4,1.35,{critical:true,duration:420});
   });
  }else if(pattern===1){
   for(let i=-2;i<=2;i++)this.time.delayedCall((i+2)*110,()=>this.enemyShoot(b,11,260+Math.abs(i)*20));
  }else{
   for(let i=0;i<Math.min(4,b.phase+1);i++)this.time.delayedCall(i*130,()=>this.spawnEnemy(Phaser.Utils.Array.GetRandom(STAGES[this.stageIndex].enemies),b.x-180-i*70,b.y-20));
  }
 }

 telegraph(x,y,r,cb){
  const g=this.add.graphics().setDepth(26);
  g.lineStyle(4,0xff5c54,.8);
  g.strokeCircle(x,y,r);
  this.tweens.add({targets:g,alpha:.15,duration:520,onComplete:()=>{g.destroy();cb();}});
 }

 showBanner(msg){
  const t=this.fixed(this.add.text(270,300,msg,{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'19px',fontStyle:'bold',color:'#fff6a5',stroke:'#443000',strokeThickness:5}).setOrigin(.5),170);
  this.tweens.add({targets:t,y:270,alpha:0,delay:800,duration:550,onComplete:()=>t.destroy()});
 }

 openPanel(type){
  if(this.panel){this.closePanel();}
  const c=this.add.container(0,0).setScrollFactor(0).setDepth(220);
  this.panel=c;
  
  // Full screen dark tap-to-close backdrop
  const backdrop=this.add.rectangle(270,480,540,960,0x020b10,.82).setInteractive();
  backdrop.on('pointerdown',()=>this.closePanel());
  c.add(backdrop);
  
  // 3D Obsidian-Jade Modal Frame
  const bg=this.add.rectangle(270,480,500,700,0x081b25,.98).setStrokeStyle(2,0xb9a36b).setInteractive();
  c.add(bg);
  c.add(this.add.rectangle(270,157,468,48,0x0a2630,.98).setStrokeStyle(1,0x7da9a9));
  
  // 3D Close Button
  const closeBtnBg=this.add.circle(480,146,26,0x142d35,.98).setStrokeStyle(2,0xb9d5d2).setInteractive(new Phaser.Geom.Circle(26,26,29),Phaser.Geom.Circle.Contains);
  const closeIcon=this.add.image(480,146,'ui_icon_close').setScale(.54);
  const triggerClose=()=>{
   this.tweens.add({targets:[closeBtnBg,closeIcon],scaleX:.85,scaleY:.85,yoyo:true,duration:80});
   this.closePanel();
  };
  closeBtnBg.on('pointerdown',triggerClose);
  closeIcon.setInteractive().on('pointerdown',triggerClose);
  c.add([closeBtnBg,closeIcon]);
  
  if(type==='gear')this.renderGearPanel(c);
  if(type==='realm')this.renderRealmPanel(c);
  if(type==='alchemy')this.renderAlchemyPanel(c);
  if(type==='skills')this.renderSkillPanel(c);
  c.getAll().forEach(child=>child.setScrollFactor(0));
 }

 closePanel(){
  if(this.panel){
   this.panel.destroy(true);
   this.panel=null;
  }
 }

 renderGearPanel(c){
  c.add(this.add.text(270,158,'TÚI TRỮ VẬT & LUYỆN KHÍ',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'20px',fontStyle:'bold',color:'#ffe58a'}).setOrigin(.5));
  
  // Equipped Gear Slots
  const slots=['weapon','armor','helm','boots','ring','talisman'],names=['Thanh Trúc Kiếm','Huyền Quy Giáp','Tử Kim Quan','Phong Hành Hài','Càn Khôn Giới','Thái Cực Bội'];
  slots.forEach((s,i)=>{
   const x=105+(i%3)*165,y=220+Math.floor(i/3)*108,it=this.equipment[s],rar=it?RARITY[it.rarity]:null;
   const slotBox=this.add.rectangle(x,y,84,80,0x0a1b2a).setStrokeStyle(2,rar?rar.color:0x415b70).setInteractive();
   c.add(slotBox);
   if(it){
    const icon=this.add.image(x,y-8,'items',it.frame).setScale(.72);
    c.add(icon);
   }
   c.add(this.add.text(x,y+28,names[i]+(it?` +${it.power}`:''),{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:rar?'#ffd700':'#94a3b8'}).setOrigin(.5));
   
   // Tap slot to infuse Canh Kim
   slotBox.on('pointerdown',()=>{
    if(it){
     if(this.materials.canh_kim>=2){
      this.materials.canh_kim-=2;
      it.power+=18;
      this.magicTreasure.canhKimInfused+=1;
      this.showBanner(`⚔ Tôi Luyện Canh Kim vào ${it.name} (+18 Công)!`);
      this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
     }else{
      this.showBanner('Cần ít nhất 2 Canh Kim để tôi luyện trang bị!');
     }
    }
   });
  });
  
  // Action Buttons
  const autoEquipBtn=this.add.rectangle(170,442,170,44,0x103824).setStrokeStyle(1.5,0x22c55e).setInteractive();
  const autoEquipText=this.add.text(170,442,'⚔ Trang Bị Nhanh',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#86efac'}).setOrigin(.5);
  autoEquipBtn.on('pointerdown',()=>{
   this.inventory.forEach(item=>{
    if(!this.equipment[item.slot]||this.equipment[item.slot].power<item.power){
     this.equipment[item.slot]=item;
    }
   });
   this.showBanner('Đã trang bị bảo vật mạnh nhất!');
   this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
  });
  c.add([autoEquipBtn,autoEquipText]);
  
  const salvageBtn=this.add.rectangle(370,442,170,44,0x381216).setStrokeStyle(1.5,0xef4444).setInteractive();
  const salvageText=this.add.text(370,442,'♻ Thu Hồi Thu Bạc',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#fca5a5'}).setOrigin(.5);
  salvageBtn.on('pointerdown',()=>{
   const count=this.inventory.length;
   if(count>0){
    const gainedStones=count*25;
    this.spiritStones+=gainedStones;
    this.inventory=[];
    this.showBanner(`Đã phân giải ${count} món đồ, nhận +${gainedStones} Linh Thạch!`);
    this.updateHUD();this.closePanel();this.openPanel('gear');this.autoSave();
   }else{
    this.showBanner('Túi trữ vật hiện đang trống!');
   }
  });
  c.add([salvageBtn,salvageText]);

  // Inventory & Materials Header
  c.add(this.add.text(45,475,`⚔ Lực Chiến: ${this.calcBattlePower()}   •   💎 Linh Thạch: ${this.spiritStones}
✨ Canh Kim: ${this.materials.canh_kim}   •   🔮 Yêu Đan: ${this.materials.yeu_dan} (Chạm slot để khảm Canh Kim)
🎒 Sức Chứa Túi Đồ: ${this.inventory.length}/30`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',lineSpacing:6,color:'#d9f2ff'}));
  
  // Inventory Items Grid
  this.inventory.slice(0,18).forEach((it,i)=>{
   const x=64+(i%6)*82,y=590+Math.floor(i/6)*72,rar=RARITY[it.rarity];
   const itemBox=this.add.rectangle(x,y,60,60,0x061522).setStrokeStyle(1.5,rar.color).setInteractive();
   const icon=this.add.image(x,y-6,'items',it.frame).setScale(.56);
   const powerLabel=this.add.text(x,y+20,'+'+it.power,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:'#fef08a'}).setOrigin(.5);
   c.add([itemBox,icon,powerLabel]);
   
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
  c.add(this.add.text(270,158,'CẢNH GIỚI TU TIÊN',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'22px',fontStyle:'bold',color:'#ffe58a'}).setOrigin(.5));
  c.add(this.add.text(270,205,REALMS[this.realm],{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'24px',fontStyle:'bold',color:'#67e8f9'}).setOrigin(.5));
  
  const need=this.expNeed(),canBreak=this.exp>=need;
  c.add(this.add.text(270,248,`Tu Vi Tích Lũy: ${this.exp} / ${need} (${Math.floor(this.exp/need*100)}%)`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'13px',color:'#fff'}).setOrigin(.5));
  
  // Progress Bar
  c.add(this.add.rectangle(270,278,380,16,0x0a1c2b).setStrokeStyle(1.5,0xd4af37));
  c.add(this.add.rectangle(80,278,380*Math.min(1,this.exp/need),16,canBreak?0xffd700:0x22c55e).setOrigin(0,.5));
  
  // Breakthrough Button
  const breakBtn=this.add.rectangle(270,330,280,50,canBreak?0xb8860b:0x1a2632).setStrokeStyle(2,canBreak?0xffe066:0x526e82).setInteractive();
  const breakText=this.add.text(270,330,canBreak?'☯ ĐỘT PHÁ CẢNH GIỚI':'Chưa Đủ Tu Vi',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'15px',fontStyle:'bold',color:canBreak?'#fff':'#94a3b8'}).setOrigin(.5);
  breakBtn.on('pointerdown',()=>{
   if(canBreak){
    // Kiểm tra đan dược Trúc Cơ nếu ở tầng Luyện Khí 13
    if(this.realm===3&&this.pills.truc_co<=0){
     this.showBanner('Cần Trúc Cơ Đan (Luyện ở Chưởng Thiên Bình) để phá bình cảnh Trúc Cơ!');
     return;
    }
    if(this.realm===3&&this.pills.truc_co>0){
     this.pills.truc_co--;
     this.showBanner('Uống Trúc Cơ Đan, 100% Đột phá Trúc Cơ thành công!');
    }
    this.gainExp(0);
    this.closePanel();this.openPanel('realm');this.autoSave();
   }else{
    this.showBanner('Tu vi chưa viên mãn, hãy bế quan hoặc dùng Linh Dược!');
   }
  });
  c.add([breakBtn,breakText]);
  
  // Bế Quan Luyện Khí
  const medBtn=this.add.rectangle(270,396,280,48,0x0c3022).setStrokeStyle(1.5,0x22c55e).setInteractive();
  const medIcon=this.add.image(155,396,'ui_icon_pill').setScale(.48);
  const medText=this.add.text(285,396,'Bế Quan Khổ Tu (+180 Tu Vi)',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',fontStyle:'bold',color:'#86efac'}).setOrigin(.5);
  medBtn.on('pointerdown',()=>{
   this.gainExp(180);
   this.spawnVfx(this.player.x,this.player.y,9,.8);
   this.showBanner('Đạo hữu bế quan đắc đạo, nhận +180 Tu Vi!');
   this.closePanel();this.openPanel('realm');this.autoSave();
  });
  c.add([medBtn,medIcon,medText]);
  
  // Phàm Nhân Realm Lore Info
  c.add(this.add.text(55,455,`☯ Cảnh Giới Tu Tiên Phàm Nhân:
• Khí Huyết Tối Đa: +12.0% mỗi tầng cảnh giới
• Chân Nguyên Tối Đa: +8.0%
• Sát Thương Thần Thông: +8.5%
• Đan Dược Đột Phá: Trúc Cơ Đan: ${this.pills.truc_co} | Tẩy Tủy Đan: ${this.pills.tay_tuy}
  (Luyện chế đan dược tại Chưởng Thiên Bình để phá vỡ bình cảnh)`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'12px',lineSpacing:7,color:'#e8f6ff',wordWrap:{width:430}}));
 }

 // Chưởng Thiên Bình & Dược Viên Luyện Đan
 renderAlchemyPanel(c){
  c.add(this.add.text(270,158,'BÌNH CHƯỞNG THIÊN & DƯỢC VIÊN',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'18px',fontStyle:'bold',color:'#86efac'}).setOrigin(.5));
  
  // Chưởng Thiên Bình Status Card
  c.add(this.add.rectangle(270,225,440,84,0x06201a).setStrokeStyle(1.5,0x22c55e));
  c.add(this.add.image(90,225,'ui_icon_pill').setScale(.78));
  c.add(this.add.text(145,200,'CHƯỞNG THIÊN LỤC LỌ',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'15px',fontStyle:'bold',color:'#6ee7b7'}));
  c.add(this.add.text(145,225,`Linh Dịch Ngưng Tụ: ${this.bottleLiquid} Giọt  •  Linh Thảo: ${this.materials.linh_duoc}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',color:'#d1fae5'}));
  c.add(this.add.text(145,245,'(Ngưng tụ 1 giọt mỗi 25s hoặc khi diệt yêu thú tinh anh)',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',color:'#a7f3d0'}));
  
  // Thúc Chín Linh Dược Button
  const matureBtn=this.add.rectangle(170,295,180,38,0x103d2b).setStrokeStyle(1.5,0x34d399).setInteractive();
  const matureText=this.add.text(170,295,'🌿 Thúc Chín Thảo Dược',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',fontStyle:'bold',color:'#a7f3d0'}).setOrigin(.5);
  matureBtn.on('pointerdown',()=>{
   if(this.bottleLiquid>=1){
    this.bottleLiquid-=1;
    this.materials.linh_duoc+=10;
    this.showBanner('🌿 Dùng 1 giọt Lục Dịch thúc chín thu hoạch +10 Linh Dược Vạn Năm!');
    this.closePanel();this.openPanel('alchemy');this.autoSave();
   }else{
    this.showBanner('Chưa đủ Lục Dịch trong Chưởng Thiên Bình!');
   }
  });
  c.add([matureBtn,matureText]);
  
  // Dan recipes list
  c.add(this.add.text(50,330,'ĐAN DƯỢC THIÊN NAM (Luyện Đan Lô):',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#fef08a'}));
  
  const recipes=[
   {id:'truc_co',name:'Trúc Cơ Đan',desc:'100% Đột phá Trúc Cơ Kỳ',cost:{linh_duoc:8,yeu_dan:2}},
   {id:'tay_tuy',name:'Tẩy Tủy Đan',desc:'+150 HP & +40 MP Vĩnh Viễn',cost:{linh_duoc:5,yeu_dan:1}},
   {id:'nguyen_anh',name:'Nguyên Anh Đan',desc:'+600 Tu Vi Tức Thì',cost:{linh_duoc:15,yeu_dan:4}}
  ];
  
  recipes.forEach((rc,i)=>{
   const y=380+i*82;
   const box=this.add.rectangle(270,y,440,70,0x081d2a).setStrokeStyle(1.5,0x38bdf8);
   c.add(box);
   c.add(this.add.text(65,y-22,rc.name,{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'14px',fontStyle:'bold',color:'#7dd3fc'}));
   c.add(this.add.text(65,y-3,rc.desc,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'10px',color:'#e2e8f0'}));
   c.add(this.add.text(65,y+16,`Cần: ${rc.cost.linh_duoc} Linh Dược + ${rc.cost.yeu_dan} Yêu Đan | Đang có: ${this.pills[rc.id]||0}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',color:'#94a3b8'}));
   
   const brewBtn=this.add.rectangle(435,y,90,34,0x10364d).setStrokeStyle(1.2,0x38bdf8).setInteractive();
   const brewText=this.add.text(435,y,'Luyện Đan',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',fontStyle:'bold',color:'#bae6fd'}).setOrigin(.5);
   brewBtn.on('pointerdown',()=>{
    if(this.materials.linh_duoc>=rc.cost.linh_duoc&&this.materials.yeu_dan>=rc.cost.yeu_dan){
     this.materials.linh_duoc-=rc.cost.linh_duoc;
     this.materials.yeu_dan-=rc.cost.yeu_dan;
     this.pills[rc.id]=(this.pills[rc.id]||0)+1;
     if(rc.id==='tay_tuy'){this.maxHp+=150;this.maxMp+=40;this.hp=this.maxHp;this.mp=this.maxMp;}
     if(rc.id==='nguyen_anh'){this.gainExp(600);}
     this.showBanner(`🔥 Khai Lò Thành Công: Nhận 1 ${rc.name}!`);
     this.closePanel();this.openPanel('alchemy');this.autoSave();
    }else{
     this.showBanner('Không đủ nguyên liệu Linh Dược / Yêu Đan!');
    }
   });
   c.add([brewBtn,brewText]);
  });
 }

 renderSkillPanel(c){
  c.add(this.add.text(270,158,'TÀNG KINH CÁC • THẦN THÔNG HÀN LẬP',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'18px',fontStyle:'bold',color:'#ffe58a'}).setOrigin(.5));
  c.add(this.add.text(270,178,`Chọn thần thông gán vào ô kỹ năng ${this.pickingSlot+1}/4`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',color:'#93c5fd'}).setOrigin(.5));
  
  SKILLS.forEach((s,i)=>{
   const col=i%2,row=Math.floor(i/2),x=72+col*228,y=245+row*90;
   const equipped=this.loadout.slice(0,4).includes(i);
   
   const skillCard=this.add.rectangle(x+85,y,224,82,equipped?0x10283b:0x071522).setStrokeStyle(1.5,equipped?0x38bdf8:0x547087).setInteractive();
   const iconCircle=this.add.circle(x,y,22,0x06111a).setStrokeStyle(1.8,equipped?0x38bdf8:0xd4af37);
   const icon=this.add.image(x,y,'skill_icons',s.frame).setScale(.40);
   
   const title=this.add.text(x+32,y-25,`${i+1}. ${s.name}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'10px',fontStyle:'bold',color:equipped?'#7dd3fc':'#fff'});
   const stats=this.add.text(x+32,y-8,`CD: ${(s.cd/1000).toFixed(1)}s  •  MP: ${s.mana}`,{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',color:'#94a3b8'});
   const badge=this.add.text(x+32,y+10,equipped?'✦ ĐANG TRANG BỊ':'[ Chạm để trang bị ]',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'9px',fontStyle:'bold',color:equipped?'#fef08a':'#6ee7b7'});
   
   c.add([skillCard,iconCircle,icon,title,stats,badge]);
   
   skillCard.on('pointerdown',()=>{
    const existing=this.loadout.slice(0,4).indexOf(i);
    if(existing>=0&&existing!==this.pickingSlot)this.loadout[existing]=this.loadout[this.pickingSlot];
    this.loadout[this.pickingSlot]=i;
    this.refreshSkillButtons();
    this.showBanner(`Ô ${this.pickingSlot+1}: ${s.name}`);
    this.closePanel();this.autoSave();
   });
  });
 }

 refreshSkillButtons(){
  this.skillButtons.forEach((o,slot)=>{
   const idx=this.loadout[slot],name=SKILLS[idx].name;
   o.b.setFrame(SKILLS[idx].frame);
   o.label.setText(name.length>7?name.slice(0,6)+'..':name);
  });
 }

 regen(){
  this.mp=Math.min(this.maxMp,this.mp+8);
  if(this.flying)this.mp=Math.max(0,this.mp-1);
  if(this.shield>0)this.shield=Math.max(0,this.shield-1);
  this.updateHUD();
 }

 manageEnemyLOD(){
  this.enemyGroup.getChildren().forEach(e=>{
   if(!e.active)return;
   const dx=Math.abs(e.x-this.player.x),on=dx<(this.quality==='low'?720:930)||e.isBoss;
   e.body.enable=on;
   e.setAlpha(dx<1250?1:.28);
  });
  const fps=this.game.loop.actualFps;
  if(fps<42&&this.quality!=='low'){
   this.quality='low';
   while(this.weather.length>10){const o=this.weather.pop();o?.destroy();}
  }else if(fps>54&&this.quality==='low'){this.quality='high';}
 }

 createWeather(kind){
  this.weatherKind=kind;
  const count=this.quality==='low'?10:22;
  for(let i=0;i<count;i++){
   const c=this.add.circle(Phaser.Math.Between(0,WORLD_W),Phaser.Math.Between(90,780),kind==='mist'?Phaser.Math.Between(18,34):Phaser.Math.Between(2,4),kind==='ember'?0xff9b52:kind==='snow'?0xffffff:kind==='storm'?0xcde6ff:kind==='spark'?0xa9ecff:kind==='leaf'?0xaad56d:kind==='petal'?0xffb8d4:0xcfd7e8,kind==='mist'?.08:.55).setDepth(-5);
   c.vx=Phaser.Math.Between(-12,16);
   c.vy=kind==='storm'?Phaser.Math.Between(120,170):Phaser.Math.Between(12,42);
   this.weather.push(c);
  }
 }

 clearWeather(){this.weather.forEach(o=>o.destroy());this.weather=[];}

 updateWeather(dt){
  for(const o of this.weather){
   o.x+=o.vx*dt;o.y+=o.vy*dt;
   if(o.y>850){o.y=90;o.x=Phaser.Math.Between(this.cameras.main.scrollX,this.cameras.main.scrollX+W);}
   if(o.x<this.cameras.main.scrollX-100)o.x=this.cameras.main.scrollX+W+100;
   if(o.x>this.cameras.main.scrollX+W+100)o.x=this.cameras.main.scrollX-100;
  }
 }

 updateHUD(){
  const hpPct=Math.max(0,this.hp/this.maxHp),mpPct=Math.max(0,this.mp/this.maxMp);
  this.hpBar.displayWidth=188*hpPct;
  this.mpBar.displayWidth=188*mpPct;
  this.hpText.setText(`${Math.round(this.hp)}/${this.maxHp}`);
  this.mpText.setText(`${Math.round(this.mp)}/${this.maxMp}`);
  this.nameText.setText(`Hàn Lập • ${REALMS[this.realm]}`);
  this.realmText.setText(`💎 Linh Thạch: ${this.spiritStones}  •  🌿 Lục Dịch: ${this.bottleLiquid}`);
 }

 playerDeath(){
  if(this.dead)return;
  this.dead=true;
  this.showBanner('Đạo Thân Trọng Thương • Nguyên Thần Đang Phục Hồi...');
  this.player.setAlpha(.35);
  this.player.setVelocity(0,0);
  this.respawnTimer=this.time.delayedCall(3000,()=>{
   this.dead=false;
   this.hp=Math.round(this.maxHp*.55);
   this.mp=Math.round(this.maxMp*.55);
   this.player.setPosition(Phaser.Math.Clamp(this.player.x-240,FIELD.left,FIELD.right),740);
   this.player.setAlpha(1);
   this.invulnerableUntil=this.time.now+2500;
   this.showBanner('☯ Đạo Hữu Niết Bàn Trùng Sinh!');
   this.updateHUD();
  });
 }

 loadSave(){
  try{
   const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
   if(!s)return;
   this.unlockedStage=Phaser.Math.Clamp(s.unlockedStage||0,0,STAGES.length-1);
   this.realm=Phaser.Math.Clamp(s.realm||0,0,REALMS.length-1);
   this.exp=s.exp||0;
   this.spiritStones=s.spiritStones||680;
   this.bottleLiquid=s.bottleLiquid||5;
   if(s.pills)this.pills=s.pills;
   if(s.materials)this.materials=s.materials;
   if(s.equipment)this.equipment=s.equipment;
   if(s.loadout)this.loadout=s.loadout;
  }catch(e){}
 }

 autoSave(){
  try{
   localStorage.setItem(SAVE_KEY,JSON.stringify({
    version:4,
    unlockedStage:this.unlockedStage,
    stageIndex:this.stageIndex,
    realm:this.realm,
    exp:this.exp,
    spiritStones:this.spiritStones,
    bottleLiquid:this.bottleLiquid,
    pills:this.pills,
    materials:this.materials,
    equipment:this.equipment,
    loadout:this.loadout
   }));
  }catch(e){}
 }

 update(time,delta){
  const dt=delta/1000;
  this.updateWeather(dt);
  if(this.dead||!this.player.active)return;

  // Key controls / Joystick Movement
  let vx=0,vy=0;
  if(this.keys.A.isDown||this.keys.LEFT.isDown)vx=-1;
  if(this.keys.D.isDown||this.keys.RIGHT.isDown)vx=1;
  if(this.keys.W.isDown||this.keys.UP.isDown)vy=-1;
  if(this.keys.S.isDown||this.keys.DOWN.isDown)vy=1;
  if(this.joy.active){vx=this.joy.x;vy=this.joy.y;}

  if(this.moveTarget){
   const dx=this.moveTarget.x-this.player.x,dy=this.moveTarget.y-this.player.y;
   if(Math.hypot(dx,dy)<18){this.moveTarget=null;}
   else{vx=dx/Math.hypot(dx,dy);vy=dy/Math.hypot(dx,dy);}
  }

  // Auto Battle AI
  if(this.autoBattle&&!this.moveTarget&&!this.joy.active){
   const target=this.nearestEnemies(420,1)[0];
   if(target){
    const dist=Phaser.Math.Distance.Between(this.player.x,this.player.y,target.x,target.y);
    if(dist>140){vx=Math.sign(target.x-this.player.x);vy=Math.sign(target.y-this.player.y)*.6;}
    if(time>(this.lastAutoCast||0)+500){
     this.lastAutoCast=time;
     const available=this.loadout.slice(0,4).filter(sIdx=>time>=this.skillReadyAt[sIdx]&&this.mp>=SKILLS[sIdx].mana);
     if(available.length>0)this.castSkill(Phaser.Utils.Array.GetRandom(available));
     else this.basicAttack();
    }
   }
  }

  const speed=170*(this.flying?1.25:1);
  this.player.setVelocity(vx*speed,vy*speed);
  if(vx!==0)this.player.setFlipX(vx<0);

  if(vx!==0||vy!==0){
   if(this.player.anims.currentAnim?.key!=='p_attack')this.player.play('p_run',true);
  }else{
   if(this.player.anims.currentAnim?.key!=='p_attack')this.player.play('p_idle',true);
  }

  // Sword follows player
  if(this.sword&&this.flying){
   this.sword.setPosition(this.player.x,this.player.y+26).setFlipX(this.player.flipX);
  }
  if(this.guardAuraSprite){
   this.guardAuraSprite.setPosition(this.player.x,this.player.y).setVisible(this.shield>0);
  }

  // Update Skill cooldown UI
  this.skillButtons.forEach(o=>{
   const idx=this.loadout[o.slot],remain=Math.max(0,this.skillReadyAt[idx]-time);
   if(remain>0){
    o.cd.setText((remain/1000).toFixed(1));
    o.b.setAlpha(.45);
   }else{
    o.cd.setText('');
    o.b.setAlpha(this.mp<SKILLS[idx].mana?.5:1);
   }
  });

  // Enemy movement & attacks
  this.enemyGroup.getChildren().forEach(e=>{
   if(!e.active)return;
   this.updateEnemyBar(e);
   if(time<e.freezeUntil){e.setVelocity(0,0);return;}
   if(e.tint!==0xffffff&&time>=e.freezeUntil)e.clearTint();
   
   const dist=Phaser.Math.Distance.Between(e.x,e.y,this.player.x,this.player.y);
   const dx=this.player.x-e.x;
   if(dx!==0)e.setFlipX(dx<0);

   if(e.isBoss){
    this.bossAttack(e,time,dist,dx);
    if(dist>130)this.physics.moveTo(e,this.player.x,this.player.y,e.speed);
    else e.setVelocity(0,0);
   }else{
    if(dist>65){
     this.physics.moveTo(e,this.player.x,this.player.y,e.speed);
    }else{
     e.setVelocity(0,0);
     if(time>(e.lastHit||0)+1300){
      e.lastHit=time;
      this.playEnemyAttack(e);
      this.applyPlayerDamage(e.damage);
     }
    }
   }
  });
 }
}

const config={
 type:Phaser.AUTO,
 width:W,
 height:H,
 parent:'game-container',
 physics:{default:'arcade',arcade:{gravity:{y:0},debug:false}},
 scene:[GameScene],
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}
};

window.game=new Phaser.Game(config);
'''

with open(TARGET_FILE, 'w', encoding='utf-8') as f:
    f.write(code)

print("Saved Phàm Nhân Tu Tiên src/main.js successfully!")
