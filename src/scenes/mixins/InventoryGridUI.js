import { gameState } from '../../state/gameState.js';
import { ITEM_EQUIPMENT_SLOTS } from '../../state/gameState.js';
import { getItemDef } from '../../config/itemCatalog.js?v=20261001-item-icons-v4';
import {
  listOwnedItems, getEquipmentStats, getPowerScore, equipItem, unequipItem, useItem,
  salvageGear, ensureItemTexture, setQuickSlot, enhanceGear, refineGear,
  rerollAffixes, repairGear, socketCore, unsocketCore
} from './ItemSystem.js?v=20261001-item-icons-v4';
import { stopPointer } from './UiModalManager.js';

const FONT='Be Vietnam Pro, sans-serif', COLS=7, ROWS=6, PAGE_SIZE=COLS*ROWS;
const FILTERS=[['all','Tất cả'],['gear','Trang bị'],['consumable','Tiêu hao'],['material','Nguyên liệu'],['core','Nội Đan'],['special','Đặc biệt']];
const SLOT_LABEL={weapon:'Vũ khí',armor:'Giáp',helm:'Mũ',boots:'Giày',amulet:'Hộ phù',shield:'Hộ thuẫn',ring:'Nhẫn',cloak:'Pháp bào'};
const KIND_LABEL={gear:'Trang bị',herb:'Linh thảo',ore:'Khoáng thạch',beast_material:'Nguyên liệu yêu thú',core:'Nội Đan',pill:'Đan dược',talisman:'Phù lục',formation:'Trận pháp',blueprint:'Đồ phổ',token:'Lệnh bài',key:'Bí cảnh lệnh',manual:'Công pháp',quest:'Vật phẩm nhiệm vụ'};
const SOURCE_LABEL={crafting:'Bách Nghệ / Chế tạo',sect_shop:'Cửa hàng Tông Môn',gathering:'Thu thập linh thảo',monster:'Quái vật',mining:'Khai khoáng',medicine_shop:'Dược Phường',merchant:'Thương nhân',dungeon:'Bí cảnh / Dungeon',quest:'Nhiệm vụ',sect_quest:'Nhiệm vụ Tông Môn',clan_quest:'Nhiệm vụ Gia Tộc'};
const STAT_LABEL={dmg:'Công kích',hp:'Sinh lực',mp:'Linh lực',def:'Phòng ngự',spd:'Tốc độ',dmgPct:'Công kích %',hpPct:'Sinh lực %',mpPct:'Linh lực %',defPct:'Phòng ngự %',critRate:'Tỷ lệ bạo kích',critDamage:'Sát thương bạo kích',armorPen:'Xuyên giáp',attackSpeed:'Tốc đánh',dodge:'Né tránh',lifeSteal:'Hút máu',elementDamage:'Sát thương hệ',damageReduction:'Giảm sát thương',controlPower:'Khống chế',healPower:'Hiệu quả hồi phục',spiritualSense:'Thần thức',cultivationSpeed:'Tốc độ tu luyện'};
const PERCENT_STATS=new Set(['dmgPct','hpPct','mpPct','defPct','critRate','critDamage','armorPen','attackSpeed','dodge','lifeSteal','elementDamage','damageReduction','controlPower','healPower']);
const CURRENCY_LABEL=['Bạc','Linh Thạch Hạ Phẩm','Linh Thạch Trung Phẩm','Linh Thạch Thượng Phẩm','Linh Thạch Cực Phẩm','Linh Thạch Cực Phẩm'];

function shell(scene,title,sub=''){return scene.createModalShell(title,sub,{headerY:-427,headerH:88,titleFontSize:'22px',titleY:-445,subY:-414,subtitleColor:'#9aeaff'});}
function btn(scene,panel,x,y,w,h,label,fn,active=false,enabled=true){const b=scene.add.rectangle(x,y,w,h,active?0x176b55:(enabled?0x183b4b:0x26343c),1).setStrokeStyle(1.5,active?0x7dffca:0x4b8192).setInteractive({useHandCursor:enabled});const t=scene.add.text(x,y,label,{fontFamily:FONT,fontSize:'11px',fontStyle:'bold',color:enabled?'#eefcff':'#74838c',align:'center',wordWrap:{width:w-8}}).setOrigin(.5);panel.add([b,t]);if(enabled)b.on('pointerdown',p=>{stopPointer(scene,p);fn?.();});return b;}
function matches(row,filter){if(filter==='all')return true;if(filter==='gear')return row.def.kind==='gear';if(filter==='consumable')return ['pill','talisman','formation'].includes(row.def.kind);if(filter==='material')return ['herb','ore','beast_material'].includes(row.def.kind);if(filter==='core')return row.def.kind==='core';if(filter==='special')return ['blueprint','token','key','manual','quest'].includes(row.def.kind);return true;}
function fmtNumber(v){const n=Number(v)||0;return Number.isInteger(n)?String(n):n.toFixed(2).replace(/\.00$/,'');}
function fmtStat(key,value,forcePercent=false){const suffix=(forcePercent||PERCENT_STATS.has(key))?'%':'';return `${STAT_LABEL[key]||key}: +${fmtNumber(value)}${suffix}`;}
function fmtStats(stats={},mult=1){const rows=Object.entries(stats||{}).filter(([,v])=>Number(v)!==0);return rows.length?rows.map(([k,v])=>fmtStat(k,Number(v)*mult)).join('\n'):'Không có';}
function sourceText(def){const rows=(def.sources||[]).map(x=>SOURCE_LABEL[x]||x);return rows.length?rows.join(' • '):'Chưa khai báo nguồn';}
function effectText(def){const e=def.effect||{};if(!e.type)return 'Không có hiệu ứng kích hoạt';if(e.type==='heal')return `Hồi ${fmtNumber(e.value)} HP.`;if(e.type==='mana')return `Hồi ${fmtNumber(e.value)} MP.`;if(e.type==='cultivation')return `Tăng tốc độ tu luyện +${fmtNumber(e.speed)} trong ${fmtNumber(e.durationSec)} giây.`;if(e.type==='sense')return `Tăng Thần thức +${fmtNumber(e.value)}.`;if(e.type==='breakthrough')return 'Dùng hỗ trợ đột phá bình cảnh cảnh giới.';if(e.type==='combat_damage')return `Gây ${fmtNumber(e.power)} sát thương chiến đấu${e.system?` • Hệ ${e.system}`:''}.`;if(e.type==='teleport_home')return 'Dịch chuyển về điểm an toàn đã định.';if(e.type==='buff')return `Buff ${fmtNumber(e.durationSec)} giây:\n${fmtStats(e.stats)}`;if(e.type==='formation')return `Triển khai trận ${fmtNumber(e.durationSec)} giây • Bán kính ${fmtNumber(e.radius)}:\n${fmtStats(e.stats)}`;return `Hiệu ứng: ${e.type}`;}
function acquiredText(ts){if(!Number(ts))return '—';try{return new Date(Number(ts)).toLocaleString('vi-VN');}catch{return '—';}}
function card(scene,panel,x,y,w,h,title){const bg=scene.add.rectangle(x,y,w,h,0x0b2230,.98).setStrokeStyle(1.2,0x37687a);const t=scene.add.text(x-w/2+12,y-h/2+10,title,{fontFamily:FONT,fontSize:'12px',fontStyle:'bold',color:'#7dd3fc'}).setOrigin(0,0);panel.add([bg,t]);return {x:x-w/2+12,y:y-h/2+34,w:w-24,h:h-44};}
function addBody(scene,panel,box,text,color='#dff8ff',fontSize='10px'){const t=scene.add.text(box.x,box.y,text,{fontFamily:FONT,fontSize,color,lineSpacing:3,wordWrap:{width:box.w}}).setOrigin(0,0);panel.add(t);return t;}
function addIcon(scene,panel,def,x,y,size){let placeholder=null;const iconKey=ensureItemTexture(scene,def,(loadedKey)=>{if(!placeholder?.active||!panel?.active)return;const im=scene.add.image(x,y,loadedKey).setDisplaySize(size,size);panel.add(im);placeholder.destroy();});if(iconKey&&scene.textures.exists(iconKey)){const im=scene.add.image(x,y,iconKey).setDisplaySize(size,size);panel.add(im);}else{placeholder=scene.add.text(x,y,def.kind==='gear'?'⚔':'◆',{fontSize:`${Math.round(size*.48)}px`,color:def.color||'#fff'}).setOrigin(.5);panel.add(placeholder);}}
function findOwnedRow(key){return listOwnedItems().find(r=>r.instance?.uid===key||(!r.instance&&r.itemId===key))||null;}

function buildGearDetail(row){const def=row.def,inst=row.instance;const enhance=Number(inst.enhance)||0,refine=Number(inst.refine)||0,mult=(1+enhance*.08)*(1+refine*.035);const out=[];out.push(`LỰC CHIẾN: ${getPowerScore(inst)}`);out.push('');out.push('CHỈ SỐ HIỆN TẠI');out.push(fmtStats(def.baseStats,mult));out.push('');out.push(`CƯỜNG HÓA: +${enhance}/15`);out.push(`TINH LUYỆN: ${refine}/10`);out.push(`ĐỘ BỀN: ${fmtNumber(inst.durability)}/${fmtNumber(def.durabilityMax||100)}`);out.push('');out.push('THUỘC TÍNH PHỤ');if(inst.affixes?.length)inst.affixes.forEach((a,i)=>out.push(`${i+1}. ${fmtStat(a.stat,a.value,true)}`));else out.push('Không có');out.push('');out.push(`KHẢM NỘI ĐAN: ${(inst.sockets||[]).filter(Boolean).length}/${(inst.sockets||[]).length}`);if(inst.sockets?.length)inst.sockets.forEach((id,i)=>{if(!id)return out.push(`${i+1}. Socket trống`);const core=getItemDef(id);out.push(`${i+1}. ${core?.name||id}`);Object.entries(core?.socketStats||{}).forEach(([k,v])=>out.push(`   ${fmtStat(k,v)}`));});else out.push('Không có socket');return out.join('\n');}
function buildNonGearDetail(row){const def=row.def,out=[];if(def.kind==='core'){out.push('THUỘC TÍNH KHẢM');out.push(fmtStats(def.socketStats));out.push('');out.push('CÔNG DỤNG');out.push(def.desc||'—');}else if(['pill','talisman','formation'].includes(def.kind)){out.push('HIỆU ỨNG');out.push(effectText(def));if(def.cooldownMs!=null){out.push('');out.push(`HỒI CHIÊU: ${fmtNumber((Number(def.cooldownMs)||0)/1000)} giây`);}}else{out.push('CÔNG DỤNG');out.push(def.desc||'—');}return out.join('\n');}
function buildInfo(row){const def=row.def,inst=row.instance;const out=[];out.push(`Loại: ${KIND_LABEL[def.kind]||def.kind}`);out.push(`Bậc: ${def.rankName||`Bậc ${def.rank??0}`}`);if(def.grade)out.push(`Phẩm chất: ${def.grade}`);if(def.realm)out.push(`Cảnh giới tương ứng: ${def.realm}`);if(def.systemName)out.push(`Hệ: ${def.systemName}`);else if(def.affinityName)out.push(`Thuộc tính: ${def.affinityName}`);if(def.slot)out.push(`Vị trí: ${SLOT_LABEL[def.slot]||def.slot}`);out.push(`Số lượng sở hữu: ${row.qty||1}`);if(def.stackable)out.push(`Xếp chồng tối đa: ${fmtNumber(def.maxStack||9999)}`);out.push(`Giá trị cơ sở: ${fmtNumber(def.price||0)} ${CURRENCY_LABEL[Math.max(0,Math.min(5,Number(def.rank)||0))]}`);out.push('');out.push('NGUỒN NHẬN');out.push(sourceText(def));out.push('');out.push('MÔ TẢ');out.push(def.desc||'Không có mô tả.');if(inst){const eq=gameState.itemState.equipped?.[def.slot]===inst.uid;out.push('');out.push('TRẠNG THÁI');out.push(`Đang trang bị: ${eq?'Có':'Không'}`);out.push(`Khóa: ${inst.locked?'Có':'Không'} • Yêu thích: ${inst.favorite?'Có':'Không'} • Ràng buộc: ${inst.bound?'Có':'Không'}`);out.push(`Nhận lúc: ${acquiredText(inst.acquiredAt)}`);}out.push('');out.push(`ID: ${def.id}`);return out.join('\n');}

export function installInventoryGridUI(MainGameScene){
  if(!MainGameScene?.prototype||MainGameScene.prototype.__inventoryGridV3Installed)return;const p=MainGameScene.prototype;p.__inventoryGridV3Installed=true;

  p.openGearPanel=function openGearPanel(filter='all',page=0){
    const panel=shell(this,'TÚI ĐỒ V3','Bấm vào vật phẩm để xem thông tin đầy đủ');
    FILTERS.forEach(([k,l],i)=>btn(this,panel,-200+i*80,-350,72,38,l,()=>this.openGearPanel(k,0),k===filter));
    let rows=listOwnedItems().filter(x=>matches(x,filter));rows.sort((a,b)=>(b.def.rank-a.def.rank)||((b.instance?getPowerScore(b.instance):0)-(a.instance?getPowerScore(a.instance):0))||a.def.name.localeCompare(b.def.name));
    const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));page=Math.max(0,Math.min(pages-1,Number(page)||0));const visible=rows.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
    const startX=-207,startY=-280;
    visible.forEach((row,i)=>{
      const col=i%COLS,rr=Math.floor(i/COLS),x=startX+col*69,y=startY+rr*67;
      const border=row.instance?.locked?0xfbbf24:0x4b8192;
      const bg=this.add.rectangle(x,y,58,58,0x102632,1).setStrokeStyle(1.5,border).setInteractive({useHandCursor:true});
      panel.add(bg);
      addIcon(this,panel,row.def,x,y,50);
      if(row.qty>1){
        panel.add(this.add.text(x+25,y+25,String(row.qty),{fontFamily:FONT,fontSize:'11px',fontStyle:'bold',color:'#ffffff',stroke:'#000000',strokeThickness:3}).setOrigin(1,1));
      }
      if(row.instance?.enhance){
        panel.add(this.add.text(x-25,y-25,`+${row.instance.enhance}`,{fontFamily:FONT,fontSize:'10px',fontStyle:'bold',color:'#fde68a',stroke:'#000000',strokeThickness:3}).setOrigin(0,0));
      }
      bg.on('pointerdown',ptr=>{stopPointer(this,ptr);this.openItemDetailPanel(row.instance?.uid||row.itemId,filter,page);});
    });
    panel.add(this.add.text(0,145,`${rows.length} mục • Trang ${page+1}/${pages}`,{fontFamily:FONT,fontSize:'11px',color:'#9aeaff'}).setOrigin(.5));
    btn(this,panel,-120,195,210,42,'‹ TRƯỚC',()=>this.openGearPanel(filter,page-1),false,page>0);btn(this,panel,120,195,210,42,'SAU ›',()=>this.openGearPanel(filter,page+1),false,page<pages-1);
    const stats=getEquipmentStats();const statText=Object.keys(stats).length?Object.entries(stats).slice(0,8).map(([k,v])=>fmtStat(k,v)).join(' • '):'Chưa có trang bị';
    panel.add(this.add.text(0,270,`Tổng chỉ số trang bị\n${statText}`,{fontFamily:FONT,fontSize:'10px',color:'#b8eafa',align:'center',wordWrap:{width:460},lineSpacing:4}).setOrigin(.5,0));
  };

  p.openItemDetailPanel=function openItemDetailPanel(itemKey,filter='all',page=0){
    const row=findOwnedRow(itemKey);if(!row){this.openGearPanel(filter,page);return;}
    const def=row.def,inst=row.instance;const panel=shell(this,'CHI TIẾT VẬT PHẨM',def.name);
    btn(this,panel,-205,-350,86,34,'← TÚI',()=>this.openGearPanel(filter,page));

    const top=this.add.rectangle(0,-278,470,118,0x0b2230,.98).setStrokeStyle(1.4,def.rankColor?parseInt(String(def.rankColor).replace('#',''),16):0x4b8192);panel.add(top);
    addIcon(this,panel,def,-188,-278,82);
    panel.add(this.add.text(-130,-316,def.name,{fontFamily:FONT,fontSize:'18px',fontStyle:'bold',color:def.color||def.rankColor||'#fff19a',wordWrap:{width:345}}).setOrigin(0,0));
    const summary=[KIND_LABEL[def.kind]||def.kind,def.rankName,def.grade,def.systemName||def.affinityName,def.slot?SLOT_LABEL[def.slot]:null].filter(Boolean).join(' • ');
    panel.add(this.add.text(-130,-280,summary,{fontFamily:FONT,fontSize:'10px',color:'#b8eafa',wordWrap:{width:345}}).setOrigin(0,0));
    const qtyLine=inst?`Lực chiến ${getPowerScore(inst)} • ${inst.durability<=0?'HỎNG':'Sẵn sàng sử dụng'}`:`Sở hữu ×${row.qty||1} • Giá trị ${fmtNumber(def.price||0)}`;
    panel.add(this.add.text(-130,-248,qtyLine,{fontFamily:FONT,fontSize:'10px',fontStyle:'bold',color:inst&&inst.durability<=0?'#ff7777':'#9fffd0',wordWrap:{width:345}}).setOrigin(0,0));

    const left=card(this,panel,-121,52,228,478,inst?'SỨC MẠNH & PHÁT TRIỂN':'HIỆU ỨNG / CÔNG DỤNG');
    const right=card(this,panel,121,52,228,478,'THÔNG TIN VẬT PHẨM');
    addBody(this,panel,left,inst?buildGearDetail(row):buildNonGearDetail(row),'#e8fbff','9.5px');
    addBody(this,panel,right,buildInfo(row),'#d8f4ff','9.5px');

    const reopen=()=>this.openItemDetailPanel(itemKey,filter,page);
    if(inst){
      const eq=gameState.itemState.equipped?.[def.slot]===inst.uid;
      btn(this,panel,-180,365,82,34,eq?'THÁO':'TRANG BỊ',()=>{const r=eq?unequipItem(def.slot):equipItem(inst.uid);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?(eq?'Đã tháo trang bị':'Đã trang bị'):r.error,r.success?'#61ffc0':'#ff7777');this.playerHpMax=this.calcPlayerMaxHp?.()||this.playerHpMax;this.playerDmg=this.calcPlayerDmg?.()||this.playerDmg;reopen();});
      btn(this,panel,-90,365,82,34,'CƯỜNG HÓA',()=>{const r=enhanceGear(inst.uid);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?`Cường hóa +${r.enhance}`:r.error,r.success?'#61ffc0':'#ff7777');reopen();});
      btn(this,panel,0,365,82,34,'TINH LUYỆN',()=>{const r=refineGear(inst.uid);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?`Tinh luyện ${r.refine}`:r.error,r.success?'#61ffc0':'#ff7777');reopen();});
      btn(this,panel,90,365,82,34,'TẨY LUYỆN',()=>{const r=rerollAffixes(inst.uid);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?'Đã tẩy luyện thuộc tính':r.error,r.success?'#61ffc0':'#ff7777');reopen();});
      btn(this,panel,180,365,82,34,'SỬA ĐỒ',()=>{const r=repairGear(inst.uid);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?(r.cost?`Đã sửa • ${r.cost}`:'Độ bền đang tối đa'):r.error,r.success?'#61ffc0':'#ff7777');reopen();});
      btn(this,panel,-180,410,82,34,inst.locked?'MỞ KHÓA':'KHÓA',()=>{inst.locked=!inst.locked;reopen();});
      const coreRow=listOwnedItems({kind:'core'}).sort((a,b)=>b.def.rank-a.def.rank)[0];const empty=(inst.sockets||[]).findIndex(x=>!x);const filled=(inst.sockets||[]).findIndex(Boolean);
      btn(this,panel,-90,410,82,34,'KHẢM',()=>{const r=empty>=0&&coreRow?socketCore(inst.uid,empty,coreRow.itemId):{success:false,error:empty<0?'Không còn socket':'Không có Nội Đan'};this.showFloatingText?.(this.player.x,this.player.y-60,r.success?'Khảm Nội Đan thành công':r.error,r.success?'#61ffc0':'#ff7777');reopen();},false,empty>=0&&!!coreRow);
      btn(this,panel,0,410,82,34,'THÁO KHẢM',()=>{const r=filled>=0?unsocketCore(inst.uid,filled):{success:false,error:'Không có Nội Đan đã khảm'};this.showFloatingText?.(this.player.x,this.player.y-60,r.success?'Đã tháo Nội Đan':r.error,r.success?'#61ffc0':'#ff7777');reopen();},false,filled>=0);
      btn(this,panel,90,410,82,34,inst.favorite?'BỎ YÊU THÍCH':'YÊU THÍCH',()=>{inst.favorite=!inst.favorite;reopen();});
      btn(this,panel,180,410,82,34,'PHÂN GIẢI',()=>{const r=salvageGear(inst.uid);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?'Đã phân giải trang bị':r.error,r.success?'#ffd700':'#ff7777');if(r.success)this.openGearPanel(filter,page);else reopen();},false,!inst.locked&&!eq);
    }else if(['pill','talisman','formation'].includes(def.kind)){
      btn(this,panel,-180,390,82,36,'SỬ DỤNG',()=>{const r=useItem(row.itemId,this);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?`Đã dùng ${def.name}`:r.error,r.success?'#66ffcc':'#ff6666');if((row.qty||1)<=1&&r.success)this.openGearPanel(filter,page);else reopen();});
      [0,1,2,3].forEach((slot,i)=>btn(this,panel,-90+i*90,390,82,36,`QUICK ${i+1}`,()=>{setQuickSlot(slot,row.itemId);reopen();},gameState.itemState.quickSlots?.[slot]===row.itemId));
    }
  };

  p.getItemInventorySummary=function(){return {owned:listOwnedItems().length,equipped:{...gameState.itemState.equipped},stats:getEquipmentStats()};};
}
