import { W, H } from '../constants.js';
import { listRecipes, getItemDef, getRecipe, getRealmItemRank } from '../../config/itemCatalog.js?v=20261001-item-v3';
import { getItemQuantity, craftItem } from './ItemSystem.js?v=20261001-item-v3';
import { gameState } from '../../state/gameState.js';
import { stopPointer } from './UiModalManager.js';

const FONT='Be Vietnam Pro, sans-serif';
const TABS=[['gear','⚒ LUYỆN KHÍ'],['pills','💊 ĐAN'],['talismans','📜 PHÙ'],['formations','☸ TRẬN']];
function button(scene,panel,x,y,w,h,label,fn,active=false,enabled=true){
  const bg=scene.add.rectangle(x,y,w,h,active?0x146b78:(enabled?0x123b4b:0x26343c),1).setStrokeStyle(1.5,active?0x7cf3ff:0x4f8190).setInteractive({useHandCursor:enabled});
  const t=scene.add.text(x,y,label,{fontFamily:FONT,fontSize:'12px',fontStyle:'bold',color:enabled?'#f4fdff':'#7c8d96',align:'center',wordWrap:{width:w-10}}).setOrigin(.5);panel.add([bg,t]);
  if(enabled)bg.on('pointerdown',p=>{stopPointer(scene,p);fn?.();});return bg;
}
function shell(scene,title,sub=''){return scene.createModalShell(title,sub,{headerY:-427,headerH:88,titleFontSize:'22px',titleY:-445,subY:-414,subtitleColor:'#9aeaff'});}
function rankName(r){return ['Phàm','Nhất','Nhị','Tam','Tứ','Ngũ'][r]||String(r);}

export function installSimpleCraftingUI(MainGameScene){
  if(!MainGameScene?.prototype||MainGameScene.prototype.__simpleCraftingUiInstalled)return;
  const p=MainGameScene.prototype;p.__simpleCraftingUiInstalled=true;
  p.openCraftingPanel=function openCraftingPanel(tab='gear',rankFilter=null,recipeId=null,page=0){
    tab=TABS.some(x=>x[0]===tab)?tab:'gear';const maxRank=getRealmItemRank(gameState.realmIdx);const rank=rankFilter==null?maxRank:Math.max(0,Math.min(5,Number(rankFilter)||0));
    if(recipeId){
      const recipe=getRecipe(recipeId),def=getItemDef(recipe?.outputId);if(!recipe||!def)return this.openCraftingPanel(tab,rank,null,0);
      const panel=shell(this,'BÁCH NGHỆ V3','Chi tiết công thức');
      panel.add(this.add.text(-230,-340,def.name,{fontFamily:FONT,fontSize:'21px',fontStyle:'bold',color:def.color||'#fff19a',wordWrap:{width:460}}).setOrigin(0,.5));
      panel.add(this.add.text(-230,-302,`${def.rankName||''} • ${def.grade||def.kind} • Đang có: ${getItemQuantity(def.id)}`,{fontFamily:FONT,fontSize:'12px',color:'#9aeaff'}).setOrigin(0,.5));
      panel.add(this.add.text(-230,-255,def.desc||'',{fontFamily:FONT,fontSize:'13px',color:'#e4f9ff',wordWrap:{width:460},lineSpacing:5}).setOrigin(0,0));
      let y=-125;for(const req of recipe.inputs||[]){const rd=getItemDef(req.itemId),have=getItemQuantity(req.itemId),ok=have>=req.qty;panel.add(this.add.text(-220,y,`${ok?'✓':'✕'} ${rd?.name||req.itemId}: ${have}/${req.qty}`,{fontFamily:FONT,fontSize:'12px',fontStyle:'bold',color:ok?'#78ffc2':'#ff9aa8',wordWrap:{width:440}}).setOrigin(0,.5));y+=32;}
      if(recipe.currency?.amount){const have=Number(gameState.currencies?.[recipe.currency.key]||0);panel.add(this.add.text(-220,y,`${have>=recipe.currency.amount?'✓':'✕'} Linh thạch: ${have}/${recipe.currency.amount}`,{fontFamily:FONT,fontSize:'12px',color:have>=recipe.currency.amount?'#78ffc2':'#ff9aa8'}).setOrigin(0,.5));}
      button(this,panel,0,320,430,58,'XÁC NHẬN CHẾ TẠO',()=>{const r=craftItem(recipe.id,1);this.showFloatingText?.(this.player.x,this.player.y-60,r.success?`Chế tạo thành công [${def.name}]!`:`❌ ${r.error}` ,r.success?'#ffd700':'#ff6666','13px');this.updateHUD?.();this.openCraftingPanel(tab,rank,recipe.id,0);});
      button(this,panel,0,395,430,48,'‹ QUAY LẠI',()=>this.openCraftingPanel(tab,rank,null,page));return;
    }
    const panel=shell(this,'BÁCH NGHỆ V3','Một hệ chế tạo duy nhất');
    TABS.forEach(([k,l],i)=>button(this,panel,-180+i*120,-350,110,46,l,()=>this.openCraftingPanel(k,Math.min(rank,maxRank)),k===tab));
    const ranks=[0,1,2,3,4,5];ranks.forEach((r,i)=>button(this,panel,-200+i*80,-292,72,38,rankName(r),()=>this.openCraftingPanel(tab,r),r===rank,r<=maxRank));
    const all=listRecipes(tab,rank);const per=7,pages=Math.max(1,Math.ceil(all.length/per));page=Math.max(0,Math.min(pages-1,Number(page)||0));const rows=all.slice(page*per,page*per+per);
    let y=-225;for(const rec of rows){const def=getItemDef(rec.outputId),can=(rec.inputs||[]).every(x=>getItemQuantity(x.itemId)>=x.qty)&&Number(gameState.currencies?.[rec.currency?.key]||0)>=Number(rec.currency?.amount||0);button(this,panel,0,y,460,54,`${can?'✓':'•'} ${def?.name||rec.outputId}`,()=>this.openCraftingPanel(tab,rank,rec.id,page),false,true);y+=66;}
    panel.add(this.add.text(0,270,`Trang ${page+1}/${pages} • ${all.length} công thức`,{fontFamily:FONT,fontSize:'11px',color:'#9aeaff'}).setOrigin(.5));
    button(this,panel,-120,322,210,45,'‹ TRƯỚC',()=>this.openCraftingPanel(tab,rank,null,page-1),false,page>0);button(this,panel,120,322,210,45,'SAU ›',()=>this.openCraftingPanel(tab,rank,null,page+1),false,page<pages-1);
  };
}
