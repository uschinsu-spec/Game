import {resourceId,resourceInfo,addResource,consumeResources,floorResourceRank} from '../core/profession-items.js';
import {floorNumber} from '../floors.js';
import {Engine,CONG_PHAP_LIST,CONG_PHAP_GRADES,syncStats,enemyStats,manualCost,pillCost,cultivationPillForRealm,cultivationPillExp} from '../cultivation.js';
import {sellCommonMaterials} from '../core/beast-loot.js';

export const ProgressionSystem = {
  gatherProfessionResource(kind) {
    if (this.player.dead || !['ore','herb'].includes(kind)) return false;
    const nearest=(this.state.deposits||[]).filter(n=>n.kind===kind&&n.readyAt<=this.gameTime)
      .sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0];
    if (!nearest || Math.hypot(nearest.x-this.player.x,nearest.y-this.player.y)>90) {
      this.toast('Hãy đến gần điểm thu thập');return false;
    }
    const rank=floorResourceRank(floorNumber(this.mapId));
    const roll=Math.random();const quality=rank===0?0:roll<.55?0:roll<.8?1:roll<.95?2:3;
    const id=resourceId(kind,rank,quality);
    addResource(this.player,id);nearest.readyAt=this.gameTime+45;
    this.toast('Thu được '+resourceInfo(id).name);this.save();return true;
  },
  craftProfessionItem(kind,rank,quality=0){
    if(this.player.dead||!['elixir','talisman'].includes(kind)||!Number.isInteger(rank)||rank<0||rank>floorResourceRank(floorNumber(this.mapId))||!Number.isInteger(quality)||quality<0||quality>3||(rank===0&&quality!==0))return false;
    const recipe=kind==='elixir'
      ?[[resourceId('herb',rank,quality),2],[resourceId('ore',rank,quality),1]]
      :[[resourceId('ore',rank,quality),2],[resourceId('herb',rank,quality),1]];
    if(!consumeResources(this.player,recipe)){this.toast('Thiếu nguyên liệu cùng phẩm cấp');return false}
    const id=resourceId(kind,rank,quality);addResource(this.player,id);
    this.toast('Chế tạo '+resourceInfo(id).name);this.save();return true;
  },
  useProfessionItem(id){
    const item=resourceInfo(id),p=this.player;
    if(p.dead||!item||!['elixir','talisman'].includes(item.kind)||(p.professionItems?.[id]||0)<1)return false;
    if(item.kind==='elixir'){
      if(p.hp>=p.maxHp&&p.mp>=p.maxMp){this.toast('HP và MP đã đầy');return false}
      p.hp=Math.min(p.maxHp,p.hp+p.maxHp*(.2+.08*item.rank+.03*item.quality));
      p.mp=Math.min(p.maxMp,p.mp+p.maxMp*(.15+.07*item.rank+.03*item.quality));
    }else{
      p.professionShield=Math.min(.65,.16+.07*item.rank+.03*item.quality);
      p.buffTime=10+item.rank*3+item.quality*2;p.buffId='profession_shield';
    }
    p.professionItems[id]--;this.toast('Đã sử dụng '+item.name);this.save();return true;
  },

  refreshEnemies(){
    for(const e of this.state.enemies){Object.assign(e,enemyStats(e.kind,this.player.realmIdx));e.maxHp=e.hp;e.stun=0;e.slow=0}
  },
  breakthrough(){
    const p=this.player,r=Engine.getRealm(p),cp=Engine.getCongPhap(p);
    if(p.realmIdx>=CONG_PHAP_GRADES[cp.grade].maxRealmIdx&&p.realmIdx<28){this.toast('Công pháp đã đạt giới hạn. Hãy học công pháp phẩm giai cao hơn.');return}
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
  useCultivationPill(){
    const p=this.player,pill=cultivationPillForRealm(p.realmIdx);
    if(p.dead||(p.pills[pill.id]||0)<1)return false;
    if(p.realmIdx>=28&&p.exp>=Engine.getRealm(p).expReq){this.toast('Tu vi đã đạt cực hạn');return false}
    p.pills[pill.id]--;
    const wasReady=p.exp>=Engine.getRealm(p).expReq;
    const gained=cultivationPillExp(p);
    Engine.addExp(p,gained);
    this.toast('Dùng '+pill.name+' · +'+gained.toLocaleString('vi-VN')+' Tu Vi'+(!wasReady&&p.exp>=Engine.getRealm(p).expReq?' · Có thể đột phá!':''));
    this.save();return true;
  },
  stopMeditation(){this.player.isMeditating=false;this.player.meditationAge=0},
  meditate(){
    if(this.player.dead)return;
    if(this.findNearest(260)){this.toast('Hãy rời xa yêu thú trước khi tĩnh tọa.');return}
    this.auto=false;this.ui.autoBtn.classList.remove('on');document.getElementById('auto-text').textContent='Tự đánh';
    this.target=null;this.input.clear();this.player.isMeditating=true;this.ui.close();this.toast('Đang tĩnh tọa · Di chuyển hoặc chiến đấu để dừng');
  }
};
