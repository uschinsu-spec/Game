import {makeWorld,clampIntoWorld} from '../world.js';
import {floorNumber,floorId} from '../floors.js';
import {Engine,REALMS,CONG_PHAP_LIST,SKILLS,syncStats,availableSkills} from '../cultivation.js';
import {SAVE_KEY,clamp} from '../core/runtime.js';

export const PersistenceSystem = {
  restore(){
    try{
      const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!s ||![1,2].includes(s.version))return;
      this.mapId=floorId(floorNumber(s.mapId));
      const p=this.player;for(const k of ['x','y','exp','gold','herbs','kills']){
        if(Number.isFinite(s[k]))p[k]=Math.max(0,s[k]);
      }
      p.realmIdx=clamp(Math.floor(s.version===1?(s.level||1)-1:(s.realmIdx||0)),0,28);
      if(s.version===1)p.exp=Math.min(p.exp,Engine.getRealm(p).expReq);
      if(s.version===2){
        p.ownedManuals=CONG_PHAP_LIST.filter(cp=>cp.id==='cp_dan_khi'||s.ownedManuals?.includes(cp.id)).map(cp=>cp.id);
        if(p.ownedManuals.includes(s.activeCongPhapId))p.activeCongPhapId=s.activeCongPhapId;
        if(availableSkills(p).some(sk=>sk.id===s.selectedSkillId))p.selectedSkillId=s.selectedSkillId;
        for(const sk of SKILLS){p.skillMastery[sk.id]=clamp(Math.floor(Number(s.skillMastery?.[sk.id])||0),0,3);p.skillExp[sk.id]=clamp(Number(s.skillExp?.[sk.id])||0,0,450)}
        for(const r of REALMS.filter(r=>r.bottleneck))p.pills[r.pillNeeded]=clamp(Math.floor(Number(s.pills?.[r.pillNeeded])||0),0,999);
      }
      syncStats(p,true);
      const pos=clampIntoWorld(p.x,p.y);p.x=pos.x;p.y=pos.y;
    }catch(e){console.warn('Không thể đọc save cũ:',e)}
  },
  save(){
    const p=this.player;
    try{
      localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,mapId:this.mapId,...Object.fromEntries(['x','y','realmIdx','exp','gold','herbs','kills','activeCongPhapId','ownedManuals','selectedSkillId','skillMastery','skillExp','pills'].map(k=>[k,p[k]]))}));
    }catch(e){console.warn('Không lưu được:',e)}
  },
  reset(){
    if(this.transitioning)return;
    const image=this.images.map||this.mapImages.get('map');
    if(!image){
      this.transitioning=true;
      this.loadFloorImage('map').then(image=>{this.images.map=image;this.transitioning=false;this.reset()})
        .catch(err=>{this.transitioning=false;console.error(err);this.toast('Không tải được tầng 1. Hãy thử lại.')});
      return;
    }
    this.images.map=image;
    if(this.mapId!=='map')delete this.images[this.mapId];
    this.mapId='map';this.mapStates={};this.portalCooldown=0;
    localStorage.removeItem(SAVE_KEY);this.player=this.makePlayer();this.state=makeWorld();this.refreshEnemies();this.ensureNPCs();this.cam.x=0;this.cam.y=0;
    this.auto=false;document.getElementById('auto-btn').classList.remove('on');document.getElementById('auto-text').textContent='Tự đánh';
    this.input.clear();this.target=null;this.lastManual=0;
  }
};
