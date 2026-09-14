(()=>{
const K='tv-prog-v2';
const legacy=JSON.parse(localStorage.getItem('tv-prog-v1')||'{}');
const d=Object.assign({gear:legacy.gear||0,skill:legacy.skill||1,pet:legacy.pet||1,research:legacy.research||1,food:legacy.food||0,traps:legacy.traps||0,clatter:legacy.clatter||1,coins:legacy.coins||0},JSON.parse(localStorage.getItem(K)||'{}'));
const save=()=>localStorage.setItem(K,JSON.stringify(d));
window.SoloProgression=d;
window.getProgressionPower=()=>d.gear*8+(d.skill-1)*20+d.research*2+Math.max(0,d.pet-1)*3;

const hud=document.getElementById('hud'),m=document.createElement('section');m.className='system-modal';m.innerHTML='<div class="system-sheet"><header><b id="sysTitle">Hệ thống</b><button id="sysClose">×</button></header><div id="sysBody" class="system-body"></div></div>';hud.appendChild(m);
const t=m.querySelector('#sysTitle'),b=m.querySelector('#sysBody');m.querySelector('#sysClose').onclick=()=>m.classList.remove('show');
function toast(x){let e=document.getElementById('lootToast');if(!e){e=document.createElement('div');e.id='lootToast';e.className='loot-toast';hud.appendChild(e)}e.textContent=x;e.classList.add('show');clearTimeout(e.h);e.h=setTimeout(()=>e.classList.remove('show'),1200)}
function idle(){return window.IdleCore&&window.IdleCore.state}
function realmText(){const s=idle();return s?`Cảnh giới ${s.realm+1} · Tầng ${s.layer}`:'Đang đồng bộ tu luyện'}

addEventListener('idle:mobWin',e=>{d.gear++;if((e.detail.stage+d.gear)%4===0)d.skill++;save();toast('Nhận trang bị tự động')});
addEventListener('idle:bossWin',e=>{d.gear+=2;d.coins++;d.food++;if(e.detail.stage%4===0)d.traps++;if(e.detail.stage%5===0)d.pet++;save();toast('Boss rơi chiến lợi phẩm')});

function open(k){m.classList.add('show');if(k==='gear')gear();if(k==='skills')skills();if(k==='pet')pet();if(k==='bag')clatter();if(k==='cultivate')cultivate()}
document.querySelectorAll('.bottom-nav button').forEach(x=>x.onclick=()=>open(x.dataset.panel));
function gear(){t.textContent='Trang bị';b.innerHTML=`<div class="system-summary">Trang bị là hệ thống duy nhất quản lý vật phẩm và cường hóa.</div><div class="big-stat">${d.gear} món đã thu thập</div><button id="enhanceGear">Cường hóa · 25 Linh thạch</button>`;b.querySelector('#enhanceGear').onclick=()=>{const c=window.IdleCore;if(!c||c.state.stones<25)return toast('Không đủ Linh thạch');c.state.stones-=25;d.gear++;c.save();save();gear()}}
function skills(){t.textContent='Công pháp';b.innerHTML=`<div class="system-summary">Công pháp chỉ quản lý sức mạnh kỹ năng Auto Combat.</div><div class="big-stat">Cấp công pháp ${d.skill}</div>`}
function slots(r){let a=0,p=0;if(r>=29)a++;if(r>=38)p++;if(r>=47)p++;if(r>=64)a++;if(r>=85)p++;if(r>=98)p++;if(r>=123)p++;if(r>=136)p++;return[a,p]}
function pet(){const s=slots(d.research);t.textContent='Linh thú';b.innerHTML=`<div class="pet-card"><div class="pet-orb">獸</div><div><b>Thanh Linh Hồ</b><span>Cấp linh thú ${d.pet}</span><span>Mộc 6 · Thủy 4</span></div></div><div class="system-summary">Linh thú và nghiên cứu chỉ nằm trong hệ thống này. ${s[0]} chủ động · ${s[1]} bị động.</div><button id="researchPet">Nghiên cứu ${d.research} · 40 Linh thạch</button><button id="capturePet">Bắt linh thú · Linh thiện ${d.food} · Bẫy ${d.traps}</button>`;b.querySelector('#researchPet').onclick=()=>{const c=window.IdleCore;if(!c||c.state.stones<40)return toast('Không đủ Linh thạch');c.state.stones-=40;d.research++;c.save();save();pet()};b.querySelector('#capturePet').onclick=()=>{if(!d.food||!d.traps)return toast('Cần Linh thiện và Bẫy');d.food--;d.traps--;d.pet++;save();pet();toast('Bắt linh thú thành công')}}
function clatter(){t.textContent='Pháp Ấn';b.innerHTML=`<div class="system-summary">Pháp Ấn quản lý ô ấn và Coin; tối đa 9 ô.</div><div class="big-stat">${d.clatter}/9 ô · ${d.coins} Coin</div><div class="clatter-grid">${Array.from({length:9},(_,i)=>`<i class="${i<d.clatter?'open':''}">${i<d.clatter?'印':'🔒'}</i>`).join('')}</div><button id="unlockClatter" ${d.coins<3||d.clatter>=9?'disabled':''}>Mở ô · 3 Coin</button>`;b.querySelector('#unlockClatter').onclick=()=>{if(d.coins<3||d.clatter>=9)return;d.coins-=3;d.clatter++;save();clatter()}}
function cultivate(){const s=idle();t.textContent='Tu luyện';b.innerHTML=`<div class="big-stat">${realmText()}</div><div class="system-summary">Tu luyện/cảnh giới/EXP chỉ do IdleCore quản lý.<br>${s?`EXP hiện tại ${Math.floor(s.xp).toLocaleString()} · Chiến lực nền ${Math.floor(s.power).toLocaleString()}`:''}<br>Chiến lực phụ trợ +${window.getProgressionPower()}</div>`}
})();