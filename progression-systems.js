(()=>{
  const K = 'tv-prog-v2';
  const legacy = JSON.parse(localStorage.getItem('tv-prog-v1') || '{}');
  const d = Object.assign({ gear: legacy.gear || 0, skill: legacy.skill || 1, pet: legacy.pet || 1, research: legacy.research || 1, food: legacy.food || 0, traps: legacy.traps || 0, clatter: legacy.clatter || 1, coins: legacy.coins || 0 }, JSON.parse(localStorage.getItem(K) || '{}'));
  const save = () => { localStorage.setItem(K, JSON.stringify(d)); window.IdleCore?.refresh?.(); };
  window.SoloProgression = d;
  window.getProgressionPower = () => d.gear * 8 + (d.skill - 1) * 20 + d.research * 2 + Math.max(0, d.pet - 1) * 3;

  const hud = document.getElementById('hud');
  const m = document.createElement('section');
  m.className = 'system-modal';
  m.innerHTML = '<div class="system-sheet"><header><b id="sysTitle">Hệ thống</b><button id="sysClose">✕</button></header><div id="sysBody" class="system-body"></div></div>';
  hud.appendChild(m);

  const t = m.querySelector('#sysTitle'), b = m.querySelector('#sysBody');
  m.querySelector('#sysClose').onclick = () => {
    m.classList.remove('show');
    document.querySelectorAll('.ulala-dock .ulala-dock-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.ulala-dock .ulala-dock-tab[data-panel="battle"]')?.classList.add('active');
  };

  function toast(x) {
    let e = document.getElementById('lootToast');
    if (!e) {
      e = document.createElement('div');
      e.id = 'lootToast';
      e.className = 'loot-toast';
      hud.appendChild(e);
    }
    e.textContent = x;
    e.classList.add('show');
    clearTimeout(e.h);
    e.h = setTimeout(() => e.classList.remove('show'), 1200);
  }

  function idle() { return window.IdleCore && window.IdleCore.state; }
  function realmText() { const s = idle(); return s ? `Cảnh giới ${s.realm + 1} · Tầng ${s.layer}` : 'Đang đồng bộ tu luyện'; }

  addEventListener('idle:mobWin', e => {
    d.gear++;
    if ((e.detail.stage + d.gear) % 4 === 0) d.skill++;
    save();
    toast('🎁 Nhặt trang bị rơi từ quái!');
  });

  addEventListener('idle:bossWin', e => {
    d.gear += 2; d.coins++; d.food++;
    if (e.detail.stage % 4 === 0) d.traps++;
    if (e.detail.stage % 5 === 0) d.pet++;
    save();
    toast('👑 Boss rơi chiến lợi phẩm quý!');
  });

  function open(k, btnEl) {
    document.querySelectorAll('.ulala-dock .ulala-dock-tab').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    if (k === 'battle') {
      m.classList.remove('show');
      return;
    }

    m.classList.add('show');
    if (k === 'gear') gear();
    if (k === 'skills') skills();
    if (k === 'pet') pet();
    if (k === 'bag') clatter();
    if (k === 'cultivate') cultivate();
    if (k === 'map') mapPanel();
    if (k === 'log') logPanel();
  }

  document.querySelectorAll('.ulala-dock .ulala-dock-tab').forEach(x => {
    x.onclick = () => open(x.dataset.panel, x);
  });

  const mapBtn = document.getElementById('mapBtn');
  if (mapBtn) mapBtn.onclick = () => open('map');
  const logBtn = document.getElementById('logBtn');
  if (logBtn) logBtn.onclick = () => open('log');

  function gear() {
    t.textContent = 'Trang Bị & Khảm Ngọc';
    b.innerHTML = `
      <div class="system-summary">Trang bị tăng trực tiếp Lực Chiến (CP) và uy lực xuất chiêu.</div>
      <div class="big-stat">🗡️ ${d.gear} Món Trang Bị Đã Thu Thập</div>
      <button id="enhanceGear">Cường Hóa Trang Bị · 25 Linh Thạch</button>
    `;
    b.querySelector('#enhanceGear').onclick = () => {
      const c = window.IdleCore;
      if (!c || c.state.stones < 25) return toast('Không đủ Linh thạch!');
      c.state.stones -= 25;
      d.gear++;
      c.save();
      save();
      gear();
      toast('Cường hóa thành công! +8 CP');
    };
  }

  function skills() {
    t.textContent = 'Công Pháp & Kỹ Năng';
    b.innerHTML = `
      <div class="system-summary">Tăng cấp công pháp giúp tăng hệ số sát thương của cả 4 ô kỹ năng trên thanh Skill Deck.</div>
      <div class="big-stat">📜 Cấp Công Pháp: ${d.skill}</div>
      <button id="upgradeSkill">Lĩnh Ngộ Công Pháp · 50 Linh Thạch</button>
    `;
    b.querySelector('#upgradeSkill').onclick = () => {
      const c = window.IdleCore;
      if (!c || c.state.stones < 50) return toast('Không đủ Linh thạch!');
      c.state.stones -= 50;
      d.skill++;
      c.save();
      save();
      skills();
      toast('Lĩnh ngộ công pháp thành công! +20 CP');
    };
  }

  function slots(r) {
    let a = 0, p = 0;
    if (r >= 29) a++; if (r >= 38) p++; if (r >= 47) p++;
    if (r >= 64) a++; if (r >= 85) p++; if (r >= 98) p++;
    if (r >= 123) a++; if (r >= 136) p++;
    return [a, p];
  }

  function pet() {
    const s = slots(d.research);
    const isVisible = typeof window.isPetVisible === 'function' ? window.isPetVisible() : true;
    t.textContent = 'Linh Thú Đồng Hành';
    b.innerHTML = `
      <div class="pet-card">
        <div class="pet-orb">🦊</div>
        <div style="flex:1;">
          <b style="font-size:15px;color:#52391e;">Thanh Linh Hồ (Cấp ${d.pet})</b>
          <div style="font-size:11px;color:#856445;margin-top:2px;">Hệ Mộc 6 / Thủy 4 · Trạng thái: <b>${isVisible ? '🟢 Đang Xuất Chiến' : '⚪ Đang Nghỉ Ngơi (Ẩn)'}</b></div>
        </div>
      </div>
      <div class="system-summary">Linh thú phụ trợ chiến đấu, tự động hỗ trợ tăng sát thương và chiến lực CP.</div>
      <button id="togglePet" style="background:${isVisible ? 'linear-gradient(180deg, #708499, #4a5c70)' : 'linear-gradient(180deg, #3ad37b, #1b8a4a)'};box-shadow:0 4px 0 ${isVisible ? '#2d3a47' : '#125c31'};">
        ${isVisible ? '💤 Thu Hồi Linh Thú (Tắt / Ẩn khỏi màn hình)' : '✨ Xuất Chiến Linh Thú (Bật / Hiện ra màn hình)'}
      </button>
      <button id="researchPet">Nghiên Cứu Linh Thú (${d.research}) · 40 Linh Thạch</button>
      <button id="capturePet">Bắt Linh Thú Mới · Thức ăn ${d.food} / Bẫy ${d.traps}</button>
    `;
    b.querySelector('#togglePet').onclick = () => {
      const cur = typeof window.isPetVisible === 'function' ? window.isPetVisible() : true;
      if (typeof window.setPetVisible === 'function') window.setPetVisible(!cur);
      pet();
      toast(!cur ? '✨ Linh thú đã xuất chiến!' : '💤 Đã thu hồi linh thú vào túi!');
    };
    b.querySelector('#researchPet').onclick = () => {
      const c = window.IdleCore;
      if (!c || c.state.stones < 40) return toast('Không đủ Linh thạch!');
      c.state.stones -= 40;
      d.research++;
      c.save();
      save();
      pet();
      toast('Nghiên cứu linh thú thành công!');
    };
    b.querySelector('#capturePet').onclick = () => {
      if (!d.food || !d.traps) return toast('Cần Thức ăn và Bẫy linh thú!');
      d.food--;
      d.traps--;
      d.pet++;
      save();
      pet();
      toast('Bắt linh thú thành công! Cấp +1');
    };
  }

  function cultivate() {
    const s = idle();
    t.textContent = 'Đại Điện Tu Luyện';
    b.innerHTML = `
      <div class="big-stat">${realmText()}</div>
      <div class="system-summary">
        <b>Tu Vi Hiện Tại:</b> ${s ? Math.floor(s.xp).toLocaleString() : 0} EXP<br>
        <b>Chiến Lực Nền Tảng:</b> ${s ? Math.floor(s.power).toLocaleString() : 0}<br>
        <b>Chiến Lực Phụ Trợ (Trang bị/Linh thú):</b> +${window.getProgressionPower()}
      </div>
    `;
  }

  function mapPanel() {
    const s = idle();
    t.textContent = 'Bản Đồ Tiên Giới';
    b.innerHTML = `
      <div class="system-summary">Bản đồ các đại lục tu tiên thế giới Ulala. Vượt qua ải 20 để mở khóa vùng đất tiếp theo.</div>
      <div class="big-stat">🗺️ Vùng Đất: Thanh Vân Sơn (Ải ${s ? s.stage : 1})</div>
    `;
  }

  function logPanel() {
    t.textContent = 'Chiến Báo & Lịch Sử';
    b.innerHTML = `
      <div class="system-summary">Ghi lại toàn bộ chiến tích tiêu diệt quái vật và Boss.</div>
      <div class="big-stat">📜 Đội hình tự động săn quái ổn định 100%</div>
    `;
  }
})();