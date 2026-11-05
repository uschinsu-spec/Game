import { EventBus, GameEvents } from '../core/EventBus';
import { PlayerStateEnum, type CharacterStats } from '../core/Types';
import { Player } from '../entities/Player';
import { SkillSystem } from '../systems/SkillSystem';
import { SaveSystem } from '../services/SaveSystem';

export class HUDManager {
  private player: Player;
  private skillSystem: SkillSystem;
  private onAutoToggle: (running: boolean) => void;
  private onSpeedChange: (speed: number) => void;
  private onUltimateCast: () => void;
  private onBossHunt: () => void;

  private isAuto = true;
  private speedMultiplier = 1;
  private currentModalTab = 'Động phủ';

  constructor(
    player: Player,
    skillSystem: SkillSystem,
    callbacks: {
      onAutoToggle: (running: boolean) => void;
      onSpeedChange: (speed: number) => void;
      onUltimateCast: () => void;
      onBossHunt: () => void;
    }
  ) {
    this.player = player;
    this.skillSystem = skillSystem;
    this.onAutoToggle = callbacks.onAutoToggle;
    this.onSpeedChange = callbacks.onSpeedChange;
    this.onUltimateCast = callbacks.onUltimateCast;
    this.onBossHunt = callbacks.onBossHunt;

    this.setupListeners();
    this.bindDOM();
    this.refreshAll();
  }

  private setupListeners(): void {
    EventBus.on(GameEvents.PLAYER_STATS_CHANGED, () => this.updateStatsUI());
    EventBus.on(GameEvents.PLAYER_STATE_CHANGED, (state: PlayerStateEnum) => this.updateStateUI(state));
    EventBus.on(GameEvents.TOAST_MESSAGE, (msg: string) => this.showToast(msg));
    EventBus.on(GameEvents.BATTLE_LOG, (log: string) => this.addBattleFeed(log));
  }

  private bindDOM(): void {
    // Auto Button Toggle
    const autoBtn = document.getElementById('auto-btn');
    if (autoBtn) {
      autoBtn.onclick = () => {
        this.isAuto = !this.isAuto;
        autoBtn.classList.toggle('active', this.isAuto);
        const small = autoBtn.querySelector('small');
        if (small) small.textContent = this.isAuto ? 'Auto' : 'Dừng';
        this.onAutoToggle(this.isAuto);
        this.showToast(this.isAuto ? 'Đã bật Tự Động Trảm Yêu' : 'Đã tạm dừng tự động');
      };
    }

    // Cauldron (Lò Luyện Đan / Tiên Đỉnh) Quick Button
    const cauldronBtn = document.getElementById('cauldron-btn');
    if (cauldronBtn) {
      cauldronBtn.onclick = () => {
        this.openModal('Luyện khí');
      };
    }

    // Four configurable auto-skill slots. Tapping a slot enables/disables its auto-cast.
    document.querySelectorAll<HTMLButtonElement>('[data-skill-index]').forEach((button) => {
      const index = Number(button.dataset.skillIndex);
      const skill = this.skillSystem.skills[index];
      if (!skill) return;
      button.classList.toggle('active', skill.autoEnabled);
      button.onclick = () => {
        skill.autoEnabled = !skill.autoEnabled;
        button.classList.toggle('active', skill.autoEnabled);
        button.setAttribute('aria-pressed', String(skill.autoEnabled));
        this.showToast(`${skill.name}: ${skill.autoEnabled ? 'Tự động' : 'Tạm tắt'}`);
      };
    });

    // Match speed cycles through supported values and updates the scene clock.
    const speedBtn = document.getElementById('speed-btn');
    if (speedBtn) speedBtn.onclick = () => {
      const speeds = [1, 2, 3];
      const next = speeds[(speeds.indexOf(this.speedMultiplier) + 1) % speeds.length];
      this.speedMultiplier = next;
      speedBtn.textContent = `x${next}`;
      this.onSpeedChange(next);
      this.showToast(`Tốc độ trận đấu x${next}`);
    };

    // Boss quick action.
    const bossBtn = document.getElementById('boss-quick-btn');
    if (bossBtn) {
      const activate = () => this.onBossHunt();
      bossBtn.addEventListener('click', activate);
      bossBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
    }

    // Ultimate Button
    const skillBtn = document.getElementById('skill-btn');
    if (skillBtn) {
      skillBtn.onclick = () => {
        this.onUltimateCast();
      };
    }

    // Navigation dock items with data-panel
    document.querySelectorAll<HTMLElement>('[data-panel]').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('selected'));
        if (btn.classList.contains('dock-item')) {
          btn.classList.add('selected');
        }
        const tab = btn.dataset.panel || 'Nhân vật';
        this.openModal(tab);
      };
      if (btn instanceof HTMLElement && btn.getAttribute('role') === 'button') {
        btn.onkeydown = (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); btn.click(); }
        };
      }
    });

    // Close modal by tapping its backdrop or pressing Escape.
    const modal = document.getElementById('modal');
    if (modal) modal.addEventListener('click', (event) => {
      if (event.target === modal) this.closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeModal();
    });

    // Modal Close
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal();
    }
  }

  public updateStatsUI(): void {
    const stats: CharacterStats = this.player.stats;

    this.setText('level', `Lv.${stats.level}`);
    this.setText('hp-text', `${stats.hp} / ${stats.maxHp}`);
    this.setWidth('hp-bar', (stats.hp / stats.maxHp) * 100);
    this.setText('mp-text', `${stats.mp} / ${stats.maxMp}`);
    this.setWidth('mp-bar', (stats.mp / stats.maxMp) * 100);

    this.setText('gold', String(this.player.gold));
    this.setText('spirit', String(this.player.spirit));
    this.setText('power', stats.combatPower.toLocaleString());

    const questTarget = 10;
    this.setText('quest-text', `Tiêu diệt Thiên Mục Yêu (${this.player.kills % questTarget}/${questTarget})`);

    const modal = document.getElementById('modal');
    if (modal && !modal.classList.contains('hidden')) {
      this.renderModalContent(this.currentModalTab);
    }
  }

  public updateStateUI(state: PlayerStateEnum): void {
    const stateTexts: Record<PlayerStateEnum, string> = {
      [PlayerStateEnum.IDLE]: '✦ TĨNH TÂM ĐIỀU HÒA ✦',
      [PlayerStateEnum.RUNNING]: '✦ ĐẠP THỦY PHI HÀNH ✦',
      [PlayerStateEnum.DETECTING]: '✦ PHÁT HIỆN YÊU KHÍ ✦',
      [PlayerStateEnum.COMBAT]: '✦ TRẢM YÊU TRỪ MA ✦',
      [PlayerStateEnum.BOSS_COMBAT]: '⚠️ QUYẾT CHIẾN MA VƯƠNG ⚠️',
      [PlayerStateEnum.LOOTING]: '✦ THU THẬP LINH THẠCH ✦',
      [PlayerStateEnum.RESUMING]: '✦ ỔN ĐỊNH LINH LỰC ✦',
      [PlayerStateEnum.DEAD]: '☠ TRỌNG THƯƠNG TRỌNG SINH ☠'
    };

    const text = stateTexts[state] || '✦ ĐANG TU LUYỆN ✦';
    this.addBattleFeed(text);
  }

  public addBattleFeed(message: string): void {
    const feed = document.getElementById('battle-feed');
    if (!feed) return;
    const ticker = feed.querySelector('.ticker-text');
    if (ticker) {
      ticker.textContent = message;
    }
  }

  public showToast(message: string): void {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout((this as unknown as { _toastTimer?: number })._toastTimer);
    (this as unknown as { _toastTimer?: number })._toastTimer = window.setTimeout(() => {
      el.classList.remove('show');
    }, 1600);
  }

  public openModal(tabName: string): void {
    this.currentModalTab = tabName;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    if (!modal || !title) return;

    title.textContent = tabName;
    this.renderModalContent(tabName);
    modal.classList.remove('hidden');
  }

  public closeModal(): void {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
  }


  private renderModalContent(tabName: string): void {
    const content = document.getElementById('modal-content');
    if (!content) return;
    const p = this.player;
    const s = p.stats;
    const realmLabel = ['Luyện Khí · Sơ Kỳ','Luyện Khí · Trung Kỳ','Luyện Khí · Hậu Kỳ','Luyện Khí · Viên Mãn','Trúc Cơ · Sơ Kỳ','Trúc Cơ · Trung Kỳ','Trúc Cơ · Hậu Kỳ','Trúc Cơ · Viên Mãn','Kim Đan · Sơ Kỳ','Kim Đan · Viên Mãn'];
    const currentRealm = realmLabel[p.realmIndex] || realmLabel[0];
    const nextRealmLevel = (p.realmIndex + 1) * 5;
    const safe = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const actionButton = (label: string, action: string, attrs = '') => '<button type="button" data-action="' + action + '" ' + attrs + ' style="margin:5px 0;padding:9px 12px;width:100%;border:1px solid #d7b86e;border-radius:8px;background:linear-gradient(145deg,#315d69,#173340);color:#fff1c8;font-weight:700;">' + label + '</button>';
    let html = '';
    switch (tabName) {
      case 'Nhân vật':
        html = '<div style="line-height:1.9"><b>Cảnh giới:</b> ' + currentRealm + '<br><b>Cấp độ:</b> Lv.' + s.level + '<br><b>Lực chiến:</b> ' + s.combatPower.toLocaleString() + '<br><b>HP:</b> ' + s.hp + ' / ' + s.maxHp + '<br><b>MP:</b> ' + s.mp + ' / ' + s.maxMp + '<br><b>Công kích:</b> ' + s.atk + '<br><b>Phòng ngự:</b> ' + s.def + '<br><b>Bạo kích:</b> ' + (s.critRate * 100).toFixed(0) + '% · x' + s.critDmg + '<br><b>Xuyên thấu:</b> ' + s.penetration + '<br><b>Yêu ma đã diệt:</b> ' + p.kills + '</div>';
        break;
      case 'Động phủ':
        html = '<div style="line-height:1.8"><b>Tu vi:</b> ' + p.exp + ' / ' + p.maxExp + '<br><b>Linh thạch:</b> ' + p.spirit + '<br><b>Tu luyện:</b> 5 linh thạch + 5 MP để nhận 15 tu vi.<br><b>Đột phá:</b> cần đủ tu vi, cấp độ ' + nextRealmLevel + ' và ' + ((p.realmIndex + 2) * 10) + ' linh thạch.' + actionButton('☯ Tụ khí tu luyện (-5 Linh thạch, -5 MP)', 'cultivate') + actionButton('⚡ Đột phá cảnh giới', 'breakthrough') + '</div>';
        break;
      case 'Luyện khí':
        html = '<div style="line-height:1.8"><b>Tiên Đỉnh Cổ · Luyện đan</b><br>Công thức Bồi Nguyên Đan: 1 Thanh Trúc Dược Thảo + 30 bạc + 3 linh thạch.<br>Đan dược hồi 30% HP và MP khi sử dụng.' + actionButton('🔥 Luyện Bồi Nguyên Đan', 'craft') + '<p>Thảo dược hiện có: ' + (p.inventory.find(i => i.name === 'Thanh Trúc Dược Thảo')?.amount || 0) + '</p></div>';
        break;
      case 'Pháp bảo':
      case 'Trang bị': {
        const slots = [{key:'weapon',label:'Phi kiếm'},{key:'armor',label:'Tiên giáp'},{key:'accessory',label:'Linh phù'}];
        html = '<div style="line-height:1.8"><b>Trang bị đang mặc</b>';
        for (const slot of slots) {
          const item = p.equipment[slot.key as 'weapon'|'armor'|'accessory'];
          html += '<div style="padding:8px;margin:6px 0;background:#102b36;border-radius:8px">' + slot.label + ': ' + (item ? safe(item.name) + ' · +' + (item.atk || 0) + ' ATK / +' + (item.def || 0) + ' DEF / +' + (item.hp || 0) + ' HP' + actionButton('Tháo trang bị', 'unequip', 'data-slot="' + slot.key + '"') : 'Chưa trang bị') + '</div>';
        }
        html += '<p>Trang bị mới được nhận từ quái tinh anh và Boss. Mở Túi đồ để trang bị.</p></div>';
        break;
      }
      case 'Túi đồ': {
        html = '<div style="line-height:1.6"><b>Kho vật phẩm · ' + p.inventory.length + ' loại</b>';
        if (!p.inventory.length) html += '<p>Túi đồ đang trống. Hãy đánh quái để thu thập bạc, linh thạch, thảo dược và trang bị.</p>';
        for (const item of p.inventory) {
          const details = item.type === 'equipment' ? ' · ' + (item.atk ? '+' + item.atk + ' ATK ' : '') + (item.def ? '+' + item.def + ' DEF ' : '') + (item.hp ? '+' + item.hp + ' HP ' : '') + (item.mp ? '+' + item.mp + ' MP' : '') : ' · x' + item.amount;
          html += '<div style="display:flex;align-items:center;gap:6px;padding:7px;margin:5px 0;background:rgba(0,0,0,.25);border-radius:8px"><span>' + item.iconText + '</span><span style="flex:1">' + safe(item.name) + '<small style="display:block;color:#b8d3cc">' + item.quality + details + '</small></span>';
          if (item.type === 'equipment') html += '<button type="button" data-action="equip" data-item-id="' + safe(item.id) + '">Trang bị</button>';
          if (item.type === 'potion') html += '<button type="button" data-action="use" data-item-id="' + safe(item.id) + '">Dùng</button>';
          html += '</div>';
        }
        html += '</div>';
        break;
      }
      case 'Nhiệm vụ':
      case 'Bảng vàng': {
        const milestone = (p.questClaims + 1) * 10;
        const canClaim = p.kills >= milestone;
        html = '<div style="line-height:1.8"><b>Nhiệm vụ trảm yêu</b><br>Đã tiêu diệt: ' + p.kills + ' / ' + milestone + '<br>Phần thưởng: 120 bạc · 8 linh thạch · 80 tu vi<br>Đã nhận: ' + p.questClaims + ' lần' + actionButton(canClaim ? '🎁 Nhận thưởng nhiệm vụ' : 'Chưa đủ điều kiện nhận thưởng', 'quest', canClaim ? '' : 'disabled') + '</div>';
        break;
      }
      case 'Tiên thuật': {
        const skillList = this.skillSystem.skills.map((skill, index) => '<div style="padding:8px;margin:6px 0;background:rgba(0,0,0,.25);border-radius:8px"><b>' + (index + 1) + '. ' + safe(skill.name) + '</b><br><small>' + safe(skill.description) + '</small><br><small>ST: ' + skill.damageMultiplier + 'x · Hồi: ' + skill.cooldown / 1000 + 's · MP: ' + skill.mpCost + '</small></div>').join('');
        html = skillList + '<p>Tắt/bật tự động từng kỹ năng bằng 4 nút phía trên chiến trường.</p>';
        break;
      }
      case 'Phúc lợi':
      case 'Tài thần': {
        const today = new Date().toISOString().slice(0,10);
        const claimed = p.dailyClaimDate === today;
        html = '<div style="line-height:1.8"><b>Phúc lợi đăng nhập</b><br>Thưởng mỗi ngày: 100 bạc · 5 linh thạch · 50 tu vi.' + actionButton(claimed ? 'Đã nhận phúc lợi hôm nay' : '🎁 Nhận phúc lợi hôm nay', 'daily', claimed ? 'disabled' : '') + '</div>';
        break;
      }
      case 'Linh bảo':
      case 'Tiên hoàn':
      case 'Tiên duyên':
      case 'Tông môn':
      case 'Hóa linh':
      case 'Đồng hành':
        html = '<div style="line-height:1.8"><b>' + safe(tabName) + '</b><p>Chức năng này chưa được triển khai trong bản hiện tại. Không có giao dịch, tài nguyên hoặc phần thưởng giả lập ở đây.</p><p style="color:#b8d3cc">Các thao tác sẽ được mở khi có hệ thống dữ liệu và gameplay tương ứng.</p></div>';
        break;
      default:
        html = '<p>Chức năng chưa được triển khai.</p>';
    }
    content.innerHTML = html;
    content.onclick = (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('button[data-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.action || '';
      let success = false;
      if (action === 'cultivate') success = p.cultivate(15);
      if (action === 'breakthrough') success = p.breakthrough();
      if (action === 'craft') success = p.craftRecoveryPill();
      if (action === 'quest') success = p.claimKillQuest();
      if (action === 'equip') success = p.equipItem(button.dataset.itemId || '');
      if (action === 'unequip') success = p.unequipItem((button.dataset.slot || 'weapon') as 'weapon'|'armor'|'accessory');
      if (action === 'use') success = p.usePotion(button.dataset.itemId || '');
      if (action === 'daily') success = p.claimDailyWelfare();
      if (success) {
        SaveSystem.save(p);
        this.showToast('Đạo hữu đã hoàn tất thao tác!');
      } else {
        this.showToast('Chưa đủ điều kiện hoặc thiếu nguyên liệu.');
      }
      this.renderModalContent(this.currentModalTab);
      this.updateStatsUI();
    };
  }

  private setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  private setWidth(id: string, percentage: number): void {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Phaser.Math.Clamp(percentage, 0, 100)}%`;
  }

  public updateCooldowns(time: number): void {
    this.skillSystem.skills.forEach((skill, index) => {
      const button = document.querySelector<HTMLButtonElement>('[data-skill-index="' + index + '"]');
      if (!button) return;
      const remaining = Math.max(0, skill.cooldown - (time - skill.lastUsedTime));
      const ratio = skill.cooldown > 0 ? remaining / skill.cooldown : 0;
      button.style.setProperty('--cooldown', (ratio * 360) + 'deg');
      button.dataset.cooldown = remaining > 0 ? (remaining / 1000).toFixed(1) + 's' : '';
      button.classList.toggle('cooling', remaining > 0);
    });
    const ultimate = document.getElementById('skill-btn');
    if (ultimate) {
      const remaining = Math.max(0, this.skillSystem.ultimateSkill.cooldown - (time - this.skillSystem.ultimateSkill.lastUsedTime));
      const ratio = this.skillSystem.ultimateSkill.cooldown > 0 ? remaining / this.skillSystem.ultimateSkill.cooldown : 0;
      ultimate.style.setProperty('--cooldown', (ratio * 360) + 'deg');
      ultimate.dataset.cooldown = remaining > 0 ? Math.ceil(remaining / 1000) + 's' : '';
      ultimate.classList.toggle('cooling', remaining > 0);
    }
  }

  public refreshAll(): void {
    this.updateStatsUI();
    this.updateStateUI(this.player.stateMachine.getCurrentStateName() as PlayerStateEnum);
  }
}
