import { EventBus, GameEvents } from '../core/EventBus';
import { PlayerStateEnum, type CharacterStats } from '../core/Types';
import { Player } from '../entities/Player';
import { SkillSystem } from '../systems/SkillSystem';

export class HUDManager {
  private player: Player;
  private skillSystem: SkillSystem;
  private onAutoToggle: (running: boolean) => void;
  private onSpeedChange: (speed: number) => void;
  private onUltimateCast: () => void;

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
    }
  ) {
    this.player = player;
    this.skillSystem = skillSystem;
    this.onAutoToggle = callbacks.onAutoToggle;
    this.onSpeedChange = callbacks.onSpeedChange;
    this.onUltimateCast = callbacks.onUltimateCast;

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

    this.setText('gold', String(this.player.gold));
    this.setText('spirit', String(this.player.spirit));
    this.setText('power', stats.combatPower.toLocaleString());

    const questTarget = 10;
    this.setText('quest-text', `Tiêu diệt Thiên Mục Yêu (${this.player.questKills}/${questTarget})`);

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

    const stats = this.player.stats;
    switch (tabName) {
      case 'Nhân vật':
        content.innerHTML = `
          <div style="line-height: 1.8;">
            <b>Đẳng cấp:</b> Lv.${stats.level}<br>
            <b>Lực chiến:</b> <span style="color:#ffd700; font-size:15px; font-weight:bold;">${stats.combatPower.toLocaleString()}</span><br>
            <b>Khí huyết (HP):</b> ${stats.hp} / ${stats.maxHp}<br>
            <b>Linh lực (MP):</b> ${stats.mp} / ${stats.maxMp}<br>
            <b>Công kích:</b> ${stats.atk}<br>
            <b>Phòng ngự:</b> ${stats.def}<br>
            <b>Bạo kích:</b> ${(stats.critRate * 100).toFixed(0)}% (x${stats.critDmg} Sát thương)<br>
            <b>Xuyên thấu:</b> ${stats.penetration}<br>
            <b>Đã hạ ma vật:</b> ${this.player.kills}
          </div>
        `;
        break;

      case 'Luyện khí':
        content.innerHTML = `
          <div style="line-height: 1.8;">
            <b>Tiên Đỉnh Cổ:</b> Cấp 2 · Hỗn Nguyên Đỉnh<br>
            <b>Hỏa hầu:</b> Tam Muội Chân Hỏa<br>
            <b>Sản lượng linh dịch:</b> +15 Linh thạch / phút<br>
            <div style="margin-top: 12px;">
              <button id="alchemy-btn" style="background: linear-gradient(145deg, #2b778c, #134554); color: #fff; border: 1px solid #7beef7; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: bold; width: 100%;">
                🔥 Luyện Chế Bồi Nguyên Đan (+40 Tu vi)
              </button>
            </div>
          </div>
        `;
        const alchemyBtn = document.getElementById('alchemy-btn');
        if (alchemyBtn) {
          alchemyBtn.onclick = () => {
            this.player.addExp(40);
            this.showToast('Luyện chế thành công Bồi Nguyên Đan! +40 Tu vi!');
            this.renderModalContent('Luyện khí');
          };
        }
        break;

      case 'Động phủ':
        content.innerHTML = `
          <div style="line-height: 1.8;">
            <b>Động Thiên Phúc Địa:</b> Cửu U Tiên Đảo<br>
            <b>Nồng độ linh khí:</b> Cực Đậm (100%)<br>
            <b>Tu vi hiện tại:</b> ${this.player.exp} / ${this.player.maxExp}<br>
            <b>Tiến trình đột phá:</b> ${Math.round((this.player.exp / this.player.maxExp) * 100)}%<br>
            <div style="margin-top: 12px;">
              <button id="cultivate-btn" style="background: linear-gradient(145deg, #d47e24, #8a480a); color: #fff; border: 1px solid #fedb7c; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: bold; width: 100%;">
                ☯ Đột Phá Cảnh Giới Tu Vi
              </button>
            </div>
          </div>
        `;
        const cultivateBtn = document.getElementById('cultivate-btn');
        if (cultivateBtn) {
          cultivateBtn.onclick = () => {
            this.player.addExp(25);
            this.showToast('Tụ linh nhập đan điền! +25 Tu vi!');
            this.renderModalContent('Động phủ');
          };
        }
        break;

      case 'Pháp bảo':
        content.innerHTML = `
          <div style="line-height: 1.8;">
            <b>🗡️ Bản Mệnh Phi Kiếm:</b> Thanh Sương Kiếm <span style="color:#72e09b;">(Thượng Phẩm)</span><br>
            <b>🛡️ Hộ Thân Bảo Châu:</b> Hỗn Thiên Linh Châu <span style="color:#75b2ff;">(Cực Phẩm)</span><br>
            <b>📿 Định Hải Thần Thâm:</b> Đang khóa (Đạt Trúc Cơ mở)
          </div>
        `;
        break;

      case 'Tiên thuật': {
        const skillList = this.skillSystem.skills.map((s, i) => `
          <div style="margin-bottom: 8px; padding: 6px 8px; background: rgba(0,0,0,0.25); border-radius: 6px; border-left: 3px solid #${s.color.toString(16)};">
            <b>${i + 1}. ${s.name}</b> <small style="color:#ffd277;">(${s.icon})</small><br>
            <span style="font-size:11px; color:#d2dedb;">${s.description}</span><br>
            <span style="font-size:10px; color:#95c1b5;">ST: ${s.damageMultiplier}x · Hồi: ${s.cooldown / 1000}s · MP: ${s.mpCost} · Mục tiêu: ${s.targetCount}</span>
          </div>
        `).join('');

        const ult = this.skillSystem.ultimateSkill;
        const ultHtml = `
          <div style="margin-top: 10px; padding: 8px; background: rgba(80, 50, 10, 0.4); border-radius: 6px; border: 1px solid #e5b958;">
            <b style="color: #ffdc73;">🌟 ${ult.name}</b><br>
            <span style="font-size:11px; color:#ffe8b0;">${ult.description}</span><br>
            <span style="font-size:10px; color:#ffb049;">ST: ${ult.damageMultiplier}x · Hồi: ${ult.cooldown / 1000}s · MP: ${ult.mpCost} · Toàn màn hình</span>
          </div>
        `;
        content.innerHTML = skillList + ultHtml;
        break;
      }

      case 'Hóa linh':
      case 'Đồng hành':
      case 'Tông môn':
      case 'Tiên duyên':
        content.innerHTML = `
          <div style="line-height: 1.8;">
            <p>Hệ thống <b>${tabName}</b> đã sẵn sàng mở khi đạt cấp độ cao hơn!</p>
            <p style="margin-top: 8px; color: #a4d2c8;">Hãy tiếp tục trảm yêu đạp thủy để nhận thêm đan dược và bí kíp tiên gia.</p>
          </div>
        `;
        break;

      default:
        content.innerHTML = `<p>Đang cập nhật...</p>`;
    }
  }

  private setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  private setWidth(id: string, percentage: number): void {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Phaser.Math.Clamp(percentage, 0, 100)}%`;
  }

  public refreshAll(): void {
    this.updateStatsUI();
    this.updateStateUI(this.player.stateMachine.getCurrentStateName() as PlayerStateEnum);
  }
}
