import {RECOVERY_PILLS} from '../core/recovery-pills.js';
import {equipmentInfo,equipmentRecipe,craftEquipment,equipItem,unequipItem,rebuildEquippedGear} from '../core/equipment-items.js';
import {floorNumber} from '../floors.js';
import {resourceId,resourceInfo,addResource,consumeResources,gatherResource,recipeFor,rankForFloor} from '../core/profession-items.js';
import {Engine,CONG_PHAP_LIST,CONG_PHAP_GRADES,syncStats,enemyStats,manualCost,pillCost,CULTIVATION_PILLS,cultivationPillForRealm,cultivationPillExp} from '../cultivation.js';
import {sellCommonMaterials} from '../core/beast-loot.js';

export const ProgressionSystem = {
  craftRecoveryPill(kind){
    const pill=RECOVERY_PILLS[kind],p=this.player;if(!pill||p.dead)return false;
    if(p.gold<pill.gold){this.toast('Không đủ linh thạch để luyện '+pill.name);return false}
    if((p.pills[pill.id]||0)>=999){this.toast('Túi đan dược đã đầy');return false}
    p.gold-=pill.gold;p.pills[pill.id]=(p.pills[pill.id]||0)+1;
    this.save();this.ui?.refreshRecoveryPills();this.toast('Luyện thành '+pill.name);return true;
  },
  craftGear(id){
    if(this.player.dead)return false;
    const item=equipmentInfo(id),recipe=equipmentRecipe(id);
    if(!item||!recipe)return false;
    if(item.grade>rankForFloor(floorNumber(this.mapId))){this.toast('Phẩm cấp trang bị chưa mở tại tầng này');return false;}
    if(!craftEquipment(this.player,id)){
      this.toast(`Cần ${recipe.oreCount} Khoáng Thạch đúng phẩm và ${recipe.materialCount} ${recipe.materialId==='da_thu'?'Da Thú':'Huyết Thú'}`);
      return false;
    }
    this.toast('Luyện khí thành công: '+item.name);this.save();return true;
  },
  equipGear(id){
    if(this.player.dead||!equipItem(this.player,id))return false;
    syncStats(this.player);this.toast('Trang bị: '+equipmentInfo(id).name);this.save();return true;
  },
  unequipGear(slot){
    if(this.player.dead||!unequipItem(this.player,slot))return false;
    syncStats(this.player);this.toast('Đã tháo trang bị');this.save();return true;
  },
  gatherProfessionResource(kind){
    if(this.player.dead||!['ore','herb'].includes(kind))return false;
    const now=this.gameTime||0;
    const node=(this.state.deposits||[]).filter(n=>n.kind===kind&&now>=n.readyAt).sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0];
    if(!node||Math.hypot(node.x-this.player.x,node.y-this.player.y)>95){this.toast('Hãy đến gần điểm thu thập trên bản đồ');return false}
    node.readyAt=now+45;
    const item=gatherResource(this.player,kind,floorNumber(this.mapId));this.toast('Thu được '+item.name);this.save();return true;
  },
  craftProfessionItem(kind,grade,quality){
    if(this.player.dead||!Number.isInteger(grade)||grade<0||grade>5||!Number.isInteger(quality)||quality<0||quality>3||(grade===0&&quality!==0))return false;
    if(grade>rankForFloor(floorNumber(this.mapId))){this.toast('Phẩm cấp chưa mở ở tầng này');return false}
    const recipe=recipeFor(kind,grade,quality);if(!recipe)return false;
    if(!consumeResources(this.player,recipe)){this.toast('Thiếu nguyên liệu cùng phẩm cấp');return false}
    const id=resourceId(kind,grade,quality);addResource(this.player,id);this.toast('Chế tạo: '+resourceInfo(id).name);this.save();return true;
  },
  useProfessionItem(id){
    const item=resourceInfo(id),p=this.player;if(!item||!['elixir','talisman'].includes(item.kind)||p.dead||(p.professionItems?.[id]||0)<1)return false;
    if(item.kind==='elixir'){
      if(p.hp>=p.maxHp&&p.mp>=p.maxMp){this.toast('Khí huyết và linh lực đã đầy');return false}
      p.hp=Math.min(p.maxHp,p.hp+p.maxHp*(.18+item.grade*.08+item.quality*.04));
      p.mp=Math.min(p.maxMp,p.mp+p.maxMp*(.14+item.grade*.07+item.quality*.03));
    }else{
      if(p.buffTime>0){this.toast('Hiệu ứng phù lục khác đang còn hiệu lực');return false}
      p.buffId='profession_shield';p.buffTime=8+item.grade*3+item.quality*2;
    }
    p.professionItems[id]--;this.toast('Sử dụng '+item.name);this.save();return true;
  },
  refreshEnemies(){
    for(const e of this.state.enemies){Object.assign(e,enemyStats(e.kind,e.beastRank,e.beastStage));e.maxHp=e.hp;e.stun=0;e.slow=0}
  },
  breakthrough(){
    const p=this.player,r=Engine.getRealm(p),cp=Engine.getCongPhap(p);
    if(cp&&p.realmIdx>=CONG_PHAP_GRADES[cp.grade].maxRealmIdx&&p.realmIdx<28){this.toast('Công pháp đã đạt giới hạn. Hãy học công pháp phẩm giai cao hơn.');return}
    const pill=p.pills[r.pillNeeded]>0?r.pillNeeded:null;
    const result=Engine.breakthrough(p,pill);if(!result.success){this.toast(result.reason);return}
    if(pill)p.pills[pill]--;syncStats(p,true);this.refreshEnemies();this.stopMeditation();
    this.state.effects.push({type:'level',x:p.x,y:p.y,life:.9,max:.9});this.toast(result.message);this.save();
  },
  sellBeastMaterials(){
    const result=sellCommonMaterials(this.player);
    if(!result.items){this.toast('Không có Da Thú, Lông Thú hoặc Huyết Thú để bán');return false}
    this.toast(`Đã bán ${result.items} nguyên liệu · +${result.gold.toLocaleString('vi-VN')} Linh Thạch`);
    this.save();return true;
  },
  learnManual(id){
    const p=this.player,cp=CONG_PHAP_LIST.find(c=>c.id===id);if(!cp)return;
    if(!p.ownedManuals.includes(id)){const cost=manualCost(cp);if(p.gold<cost){this.toast('Không đủ linh thạch');return}p.gold-=cost;p.ownedManuals.push(id)}
    p.activeCongPhapId=id;syncStats(p);this.save();
  },
  craftPill(){
    const p=this.player,r=Engine.getRealm(p);if(!r.bottleneck)return;
    const cost=pillCost(p);if(p.gold<cost.gold){this.toast('Không đủ linh thạch để luyện đan.');return}
    p.gold-=cost.gold;p.pills[r.pillNeeded]=(p.pills[r.pillNeeded]||0)+1;this.save();this.toast('Luyện thành '+r.pillNeeded);
  },
  craftCultivationPill(){
    const p=this.player,pill=cultivationPillForRealm(p.realmIdx);
    if(p.dead)return false;
    if(p.gold<pill.gold){this.toast('Không đủ linh thạch để luyện '+pill.name);return false}
    p.gold-=pill.gold;p.pills[pill.id]=(p.pills[pill.id]||0)+1;
    this.toast('Luyện thành '+pill.name);this.save();return true;
  },
  useCultivationPill(itemId=cultivationPillForRealm(this.player.realmIdx)?.id){
    const p=this.player,pill=CULTIVATION_PILLS.find(item=>item.id===itemId);
    if(!pill||p.dead||(p.pills?.[pill.id]||0)<1)return false;
    if(p.realmIdx>=28&&p.exp>=Engine.getRealm(p).expReq){this.toast('Tu vi đã đạt cực hạn');return false}
    p.pills[pill.id]--;
    const wasReady=p.exp>=Engine.getRealm(p).expReq;
    const gained=cultivationPillExp(p,pill);
    Engine.addExp(p,gained);
    this.toast('Dùng '+pill.name+' · +'+gained.toLocaleString('vi-VN')+' Tu Vi'+(!wasReady&&p.exp>=Engine.getRealm(p).expReq?' · Có thể đột phá!':''));
    this.save();return true;
  },
  stopMeditation(){this.player.isMeditating=false;this.player.meditationAge=0},
  meditate(){
    if(this.player.dead)return;
    if(!this.player.activeCongPhapId){
      this.player.activeCongPhapId='cp_dan_khi';
      if(Array.isArray(this.player.ownedManuals)&&!this.player.ownedManuals.includes('cp_dan_khi'))this.player.ownedManuals.push('cp_dan_khi');
      if(!this.player.congPhapMastery)this.player.congPhapMastery=0.35;
    }
    if(!Engine.getCongPhap(this.player)){this.toast('Hãy học công pháp trước khi tĩnh tọa.');return}
    if(this.findNearest(260)){this.toast('Hãy rời xa yêu thú trước khi tĩnh tọa.');return}
    this.auto=false;this.ui?.autoBtn?.classList?.remove('on');
    const autoText=document.getElementById('auto-text');if(autoText)autoText.textContent='Tự đánh';
    this.target=null;this.input.clear();this.player.isMeditating=true;this.ui?.close?.();this.toast('Đang tĩnh tọa · Di chuyển hoặc chiến đấu để dừng');
  }
};
