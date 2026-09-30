with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\HudMixin.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update createSkillBar to cleanly end without atkBtn
old_skill_end = """    // Auto Toggle Button (Tap: Toggle Auto | Hold/Long-press: Open Auto Settings Menu)
    const autoX = startX + 5 * gap + 8;
    this.autoBtnBg = this.fixed(this.add.rectangle(autoX, y, 52, 56, 0x111e30, 0).setInteractive({ useHandCursor: true }), 205);
    this.autoBtnIcon = this.fixed(this.add.image(autoX, y - 10, 'xianxia_auto').setDisplaySize(46, 46), 206);
    this.autoBtnLabel = this.fixed(this.add.text(autoX, y + 18, 'TỰ ĐỘNG', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setStroke('#0a1b20', 3).setOrigin(0.5), 207);
    
    let autoPressTimer = null;
    let isAutoLongPress = false;
    this.autoBtnBg.on('pointerdown', () => {
      isAutoLongPress = false;
      autoPressTimer = this.time.delayedCall(380, () => {
        isAutoLongPress = true;
        this.openAfkPanel();
      });
    });
    this.autoBtnBg.on('pointerup', () => {
      if (autoPressTimer) autoPressTimer.remove(false);
      if (!isAutoLongPress) {
        this.toggleAutoFight();
      }
    });
    this.autoBtnBg.on('pointerout', () => {
      if (autoPressTimer) autoPressTimer.remove(false);
    });
    this.updateAutoBtnVisual();

    this.skillContainer.add([atkBtn, atkIcon, atkLabel, this.autoBtnBg, this.autoBtnIcon, this.autoBtnLabel]);
  },"""

new_skill_end = """  },"""

# 2. Update createSideToggleButtons
old_side_buttons = """  createSideToggleButtons() {
    if (this.sideToggleContainer) this.sideToggleContainer.destroy(true);
    this.sideToggleContainer = this.add.container(0, 0).setDepth(209);

    // ── NÚT DƯỠNG SỨC (🛌) ── Phía trên nút Skill, bỏ nút Tĩnh Tọa riêng
    const isRest = gameState.isResting;
    const restToggle = this.fixed(this.add.rectangle(W - 24, H - 175, 40, 58, isRest ? 0x14382a : 0x1a0d2c, 0.93)
      .setStrokeStyle(2, isRest ? 0x4ade80 : 0x553366)
      .setInteractive({ useHandCursor: true }), 209);
    const restToggleIcon = this.fixed(this.add.text(W - 24, H - 185, '🛌', { fontSize: '18px' }).setOrigin(0.5), 210);
    const restToggleTxt = this.fixed(this.add.text(W - 24, H - 161, isRest ? 'Dừng' : 'Nghỉ', {
      fontSize: '10px', fontStyle: 'bold', color: isRest ? '#4ade80' : '#9966cc'
    }).setOrigin(0.5), 210);

    restToggle.on('pointerdown', () => this.toggleResting());

    if (isRest) {
      this.tweens.add({
        targets: restToggle,
        alpha: { from: 0.7, to: 1 },
        duration: 650,
        yoyo: true,
        repeat: -1
      });
    }

    // ── NÚT SKILL TOGGLE ──
    const skillToggle = this.fixed(this.add.rectangle(W - 24, H - 107, 40, 58, 0x0d1a2c, 0.9)
      .setStrokeStyle(1.5, 0x334466)
      .setInteractive({ useHandCursor: true }), 209);
    const skillToggleIcon = this.fixed(this.add.text(W - 24, H - 117, '⚡', { fontSize: '20px' }).setOrigin(0.5), 210);
    const skillToggleTxt = this.fixed(this.add.text(W - 24, H - 93, 'Chiêu', {
      fontSize: '10px', fontStyle: 'bold', color: '#88bbff'
    }).setOrigin(0.5), 210);

    skillToggle.on('pointerdown', () => {
      this.skillsVisible = !this.skillsVisible;
      if (this.skillContainer) this.skillContainer.setVisible(this.skillsVisible);
    });

    // ── NÚT MENU ──
    const menuToggle = this.fixed(this.add.rectangle(W - 24, H - 40, 40, 54, 0x0d1a2c, 0.9)
      .setStrokeStyle(1.5, 0x334466)
      .setInteractive({ useHandCursor: true }), 209);
    const menuToggleIcon = this.fixed(this.add.text(W - 24, H - 50, '☰', { fontSize: '20px' }).setOrigin(0.5), 210);
    const menuToggleTxt = this.fixed(this.add.text(W - 24, H - 28, 'Menu', {
      fontSize: '10px', fontStyle: 'bold', color: '#88aacc'
    }).setOrigin(0.5), 210);

    menuToggle.on('pointerdown', () => {
      this.menuVisible = !this.menuVisible;
      if (this.menuContainer) this.menuContainer.setVisible(this.menuVisible);
    });

    this.sideToggleContainer.add([
      restToggle, restToggleIcon, restToggleTxt,
      skillToggle, skillToggleIcon, skillToggleTxt,
      menuToggle, menuToggleIcon, menuToggleTxt
    ]);
  },"""

new_side_buttons = """  createSideToggleButtons() {
    if (this.sideToggleContainer) this.sideToggleContainer.destroy(true);
    this.sideToggleContainer = this.add.container(0, 0).setDepth(209);

    // ── 1. NÚT DƯỠNG SỨC (🛌 Nghỉ) ──
    const isRest = gameState.isResting;
    const restToggle = this.fixed(this.add.rectangle(W - 24, H - 175, 40, 56, isRest ? 0x14382a : 0x1a0d2c, 0.93)
      .setStrokeStyle(2, isRest ? 0x4ade80 : 0x553366)
      .setInteractive({ useHandCursor: true }), 209);
    const restToggleIcon = this.fixed(this.add.text(W - 24, H - 185, '🛌', { fontSize: '18px' }).setOrigin(0.5), 210);
    const restToggleTxt = this.fixed(this.add.text(W - 24, H - 161, isRest ? 'Dừng' : 'Nghỉ', {
      fontSize: '10px', fontStyle: 'bold', color: isRest ? '#4ade80' : '#9966cc'
    }).setOrigin(0.5), 210);

    restToggle.on('pointerdown', () => this.toggleResting());

    if (isRest) {
      this.tweens.add({
        targets: restToggle,
        alpha: { from: 0.7, to: 1 },
        duration: 650,
        yoyo: true,
        repeat: -1
      });
    }

    // ── 2. NÚT AUTO (TỰ ĐỘNG CHIẾN ĐẤU & TU LUYỆN) ── (Thay cho nút Chiêu cũ)
    const isAuto = !!gameState.autoFight;
    this.sideAutoBtnBg = this.fixed(this.add.rectangle(W - 24, H - 108, 40, 56, isAuto ? 0x13382c : 0x0d1a2c, 0.93)
      .setStrokeStyle(1.5, isAuto ? 0x4ade80 : 0x334466)
      .setInteractive({ useHandCursor: true }), 209);
    
    this.sideAutoBtnIcon = this.fixed(this.add.image(W - 24, H - 118, 'xianxia_auto').setDisplaySize(32, 32), 210);
    this.sideAutoBtnLabel = this.fixed(this.add.text(W - 24, H - 93, 'Auto', {
      fontSize: '10px', fontStyle: 'bold', color: isAuto ? '#4ade80' : '#88bbff'
    }).setOrigin(0.5), 210);

    let autoPressTimer = null;
    let isAutoLongPress = false;
    this.sideAutoBtnBg.on('pointerdown', () => {
      isAutoLongPress = false;
      autoPressTimer = this.time.delayedCall(380, () => {
        isAutoLongPress = true;
        this.openAfkPanel();
      });
    });
    this.sideAutoBtnBg.on('pointerup', () => {
      if (autoPressTimer) autoPressTimer.remove(false);
      if (!isAutoLongPress) {
        this.toggleAutoFight();
      }
    });
    this.sideAutoBtnBg.on('pointerout', () => {
      if (autoPressTimer) autoPressTimer.remove(false);
    });

    // ── 3. NÚT MENU (☰) ── TỰ ĐỘNG ẨN/HIỆN CẢ 02 HÀNG UI PHÍA DƯỚI (Chiêu & Menu)
    const menuToggle = this.fixed(this.add.rectangle(W - 24, H - 42, 40, 54, 0x0d1a2c, 0.9)
      .setStrokeStyle(1.5, 0x334466)
      .setInteractive({ useHandCursor: true }), 209);
    const menuToggleIcon = this.fixed(this.add.text(W - 24, H - 52, '☰', { fontSize: '20px' }).setOrigin(0.5), 210);
    const menuToggleTxt = this.fixed(this.add.text(W - 24, H - 30, 'Menu', {
      fontSize: '10px', fontStyle: 'bold', color: '#88aacc'
    }).setOrigin(0.5), 210);

    menuToggle.on('pointerdown', () => {
      this.menuVisible = !this.menuVisible;
      this.skillsVisible = this.menuVisible;
      if (this.menuContainer) this.menuContainer.setVisible(this.menuVisible);
      if (this.skillContainer) this.skillContainer.setVisible(this.menuVisible);
    });

    this.sideToggleContainer.add([
      restToggle, restToggleIcon, restToggleTxt,
      this.sideAutoBtnBg, this.sideAutoBtnIcon, this.sideAutoBtnLabel,
      menuToggle, menuToggleIcon, menuToggleTxt
    ]);
    this.updateAutoBtnVisual();
  },"""

# 3. Update updateAutoBtnVisual
old_auto_visual = """  updateAutoBtnVisual() {
    if (!this.autoBtnIcon) return;
    const mode = gameState.autoMode || 'farm';
    let labelText = 'TỰ ĐỘNG';
    if (mode === 'march') labelText = 'HÀNH QUÂN';
    else if (mode === 'rush') labelText = 'VƯỢT MAP';
    
    if (this.autoBtnLabel) this.autoBtnLabel.setText(labelText);

    if (gameState.autoFight) {
      if (mode === 'rush') {
        this.autoBtnIcon.setTint(0xffaa44);
        if (this.autoBtnLabel) this.autoBtnLabel.setColor('#ffaa44');
      } else if (mode === 'march') {
        this.autoBtnIcon.setTint(0x44ddff);
        if (this.autoBtnLabel) this.autoBtnLabel.setColor('#44ddff');
      } else {
        this.autoBtnIcon.setTint(0x44ffcc);
        if (this.autoBtnLabel) this.autoBtnLabel.setColor('#44ffcc');
      }
    } else {
      this.autoBtnIcon.clearTint();
      if (this.autoBtnLabel) this.autoBtnLabel.setColor('#ffffff');
    }
  },"""

new_auto_visual = """  updateAutoBtnVisual() {
    const isAuto = !!gameState.autoFight;
    const mode = gameState.autoMode || 'farm';

    // Update Side AUTO Button
    if (this.sideAutoBtnBg) {
      this.sideAutoBtnBg.setFillStyle(isAuto ? 0x13382c : 0x0d1a2c, 0.93);
      this.sideAutoBtnBg.setStrokeStyle(1.5, isAuto ? 0x4ade80 : 0x334466);
    }
    if (this.sideAutoBtnIcon) {
      if (isAuto) {
        if (mode === 'rush') this.sideAutoBtnIcon.setTint(0xffaa44);
        else if (mode === 'march') this.sideAutoBtnIcon.setTint(0x44ddff);
        else this.sideAutoBtnIcon.setTint(0x44ffcc);
      } else {
        this.sideAutoBtnIcon.clearTint();
      }
    }
    if (this.sideAutoBtnLabel) {
      let labelText = 'Auto';
      if (mode === 'march') labelText = 'Quân';
      else if (mode === 'rush') labelText = 'Vượt';
      this.sideAutoBtnLabel.setText(labelText);
      this.sideAutoBtnLabel.setColor(isAuto ? '#4ade80' : '#88bbff');
    }

    // Update bottom skill bar auto button if exists
    if (this.autoBtnIcon) {
      let labelText = 'TỰ ĐỘNG';
      if (mode === 'march') labelText = 'HÀNH QUÂN';
      else if (mode === 'rush') labelText = 'VƯỢT MAP';
      if (this.autoBtnLabel) this.autoBtnLabel.setText(labelText);

      if (isAuto) {
        if (mode === 'rush') {
          this.autoBtnIcon.setTint(0xffaa44);
          if (this.autoBtnLabel) this.autoBtnLabel.setColor('#ffaa44');
        } else if (mode === 'march') {
          this.autoBtnIcon.setTint(0x44ddff);
          if (this.autoBtnLabel) this.autoBtnLabel.setColor('#44ddff');
        } else {
          this.autoBtnIcon.setTint(0x44ffcc);
          if (this.autoBtnLabel) this.autoBtnLabel.setColor('#44ffcc');
        }
      } else {
        this.autoBtnIcon.clearTint();
        if (this.autoBtnLabel) this.autoBtnLabel.setColor('#ffffff');
      }
    }
  },"""

# Normalize \r\n and replace
text_norm = text.replace('\r\n', '\n')
text_norm = text_norm.replace(old_skill_end.replace('\r\n', '\n'), new_skill_end.replace('\r\n', '\n'))
text_norm = text_norm.replace(old_side_buttons.replace('\r\n', '\n'), new_side_buttons.replace('\r\n', '\n'))
text_norm = text_norm.replace(old_auto_visual.replace('\r\n', '\n'), new_auto_visual.replace('\r\n', '\n'))

with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\HudMixin.js', 'w', encoding='utf-8') as f:
    f.write(text_norm)

print("Updated HudMixin.js with Menu hiding 2 rows and side AUTO button!")
