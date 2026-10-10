import {Engine,CONG_PHAP_LIST,CONG_PHAP_GRADES,syncStats,enemyStats,manualCost,pillCost} from '../cultivation.js';

export const ProgressionSystem = {
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
  learnManual(id){
    const p=this.player,cp=CONG_PHAP_LIST.find(c=>c.id===id);if(!cp)return;
    if(!p.ownedManuals.includes(id)){const cost=manualCost(cp);if(p.gold<cost){this.toast('Không đủ linh thạch');return}p.gold-=cost;p.ownedManuals.push(id)}
    p.activeCongPhapId=id;syncStats(p);this.save();
  },
  craftPill(){
    const p=this.player,r=Engine.getRealm(p);if(!r.bottleneck)return;
    const cost=pillCost(p);if(p.herbs<cost.herbs||p.gold<cost.gold){this.toast('Chưa đủ linh thảo hoặc linh thạch để luyện đan.');return}
    p.herbs-=cost.herbs;p.gold-=cost.gold;p.pills[r.pillNeeded]=(p.pills[r.pillNeeded]||0)+1;this.save();this.toast('Luyện thành '+r.pillNeeded);
  },
  stopMeditation(){this.player.isMeditating=false;this.player.meditationAge=0},
  meditate(){
    if(this.player.dead)return;
    if(this.findNearest(260)){this.toast('Hãy rời xa yêu thú trước khi tĩnh tọa.');return}
    this.auto=false;this.ui.autoBtn.classList.remove('on');document.getElementById('auto-text').textContent='Tự đánh';
    this.target=null;this.input.clear();this.player.isMeditating=true;this.ui.close();this.toast('Đang tĩnh tọa · Di chuyển hoặc chiến đấu để dừng');
  }
};
