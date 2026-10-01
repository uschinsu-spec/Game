import { gameState } from '../../state/gameState.js';
import { listItems, getRealmItemRank, getRankMeta } from '../../config/itemCatalog.js?v=20261001-item-icons-v4';
import { getItemQuantity, buyItem } from './ItemSystem.js?v=20261001-item-icons-v4';
import { stopPointer } from './UiModalManager.js';

const FONT='Be Vietnam Pro, sans-serif';
function btn(scene,panel,x,y,w,h,label,fn,enabled=true){const b=scene.add.rectangle(x,y,w,h,enabled?0x174b56:0x27353b,1).setStrokeStyle(1.5,enabled?0x61ffc0:0x536270).setInteractive({useHandCursor:enabled});const t=scene.add.text(x,y,label,{fontFamily:FONT,fontSize:'11px',fontStyle:'bold',color:enabled?'#f4fdff':'#7e8d95',align:'center',wordWrap:{width:w-8}}).setOrigin(.5);panel.add([b,t]);if(enabled)b.on('pointerdown',p=>{stopPointer(scene,p);fn?.();});}
export function installMerchantTalismanFormationShop(MainGameScene){
  if(!MainGameScene?.prototype||MainGameScene.prototype.__merchantItemV3Installed)return;const p=MainGameScene.prototype;p.__merchantItemV3Installed=true;
  p.openMerchantSpecialShop=function(type='talismans',page=0){
    const kind=type==='formations'?'formation':type==='gear'?'gear':'talisman';const rank=getRealmItemRank(gameState.realmIdx);const items=listItems({kind}).filter(x=>x.rank<=rank).sort((a,b)=>a.rank-b.rank||a.name.localeCompare(b.name));
    const panel=this.createModalShell('THƯƠNG HỘI V3',kind==='formation'?'Trận pháp':kind==='gear'?'Trang bị':'Phù lục',{headerY:-427,headerH:88,titleFontSize:'22px',titleY:-445,subY:-414});
    const per=8,pages=Math.max(1,Math.ceil(items.length/per));page=Math.max(0,Math.min(pages-1,Number(page)||0));let y=-325;
    for(const def of items.slice(page*per,page*per+per)){const meta=getRankMeta(def.rank),key=meta.currencyKey,cost=Math.ceil((def.price||1)*2.5),have=Number(gameState.currencies?.[key]||0),owned=getItemQuantity(def.id);btn(this,panel,0,y,455,52,`${def.name} • Có ${owned} • ${cost} ${key.toUpperCase()}`,()=>{const r=buyItem(def.id,1,2.5);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?`Đã mua ${def.name}`:r.error,r.success?'#61ffc0':'#ff7777');this.updateHUD?.();this.openMerchantSpecialShop(type,page);},have>=cost);y+=62;}
    panel.add(this.add.text(0,190,`Trang ${page+1}/${pages}`,{fontFamily:FONT,fontSize:'11px',color:'#9aeaff'}).setOrigin(.5));btn(this,panel,-120,235,210,42,'‹ TRƯỚC',()=>this.openMerchantSpecialShop(type,page-1),page>0);btn(this,panel,120,235,210,42,'SAU ›',()=>this.openMerchantSpecialShop(type,page+1),page<pages-1);
  };
}
