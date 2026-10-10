import {normalizeEquipmentInventory,normalizeEquipmentSlots,normalizeBaseGear,rebuildEquippedGear} from '../core/equipment-items.js';
import {normalizeResources} from '../core/profession-items.js';
import {makeWorld,clampIntoWorld} from '../world.js';
import {floorNumber,floorId,floorAsset} from '../floors.js';
import {Engine,REALMS,CONG_PHAP_LIST,SKILLS,syncStats,availableSkills} from '../cultivation.js';
import {SAVE_KEY,clamp} from '../core/runtime.js';
import {normalizeBeastLootId} from '../core/beast-loot.js';

export const PersistenceSystem = {
  restore(){
    try{
      const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!s ||![1,2,3,4,5].includes(s.version))return;
      this.mapId=floorId(floorNumber(s.mapId));
      const p=this.player;for(const k of ['x','y','exp','gold']){
        if(Number.isFinite(s[k]))p[k]=Math.max(0,s[k]);
      }
      p.realmIdx=clamp(Math.floor(s.version===1?(s.level||1)-1:(s.realmIdx||0)),0,28);
      if(s.version===1)p.exp=Math.min(p.exp,Engine.getRealm(p).expReq);
      if(s.version>=2){
        p.ownedManuals=CONG_PHAP_LIST.filter(cp=>s.ownedManuals?.includes(cp.id)).map(cp=>cp.id);
        p.activeCongPhapId=p.ownedManuals.includes(s.activeCongPhapId)?s.activeCongPhapId:(p.ownedManuals[0]||s.activeCongPhapId||null);
        if(availableSkills(p).some(sk=>sk.id===s.selectedSkillId))p.selectedSkillId=s.selectedSkillId;
        for(const sk of SKILLS){p.skillMastery[sk.id]=clamp(Math.floor(Number(s.skillMastery?.[sk.id])||0),0,3);p.skillExp[sk.id]=clamp(Number(s.skillExp?.[sk.id])||0,0,450)}
        for(const r of REALMS.filter(r=>r.bottleneck))p.pills[r.pillNeeded]=clamp(Math.floor(Number(s.pills?.[r.pillNeeded])||0),0,999);
        p.congPhapMastery=0.35;
        if(s.version>=3){
          const keys=['hp','mp','dmg','def','critRate','critDamage','attackSpeed','elementDamage','spiritualSense','hpPct','mpPct','dmgPct','defPct'];
          p.equippedGear=Object.fromEntries(keys.filter(k=>Number.isFinite(s.equippedGear?.[k]))
            .map(k=>[k,clamp(s.equippedGear[k],-99,1e9)]));
          p.spiritualSenseBonus=clamp(Number(s.spiritualSenseBonus)||0,0,1e9);
          const mastery=Number(s.congPhapMastery);
          p.congPhapMastery=p.activeCongPhapId&&Number.isFinite(mastery)?clamp(mastery,0,1):0;
          for(const id of ['tu_vi_pham','tu_vi_luyen_khi','tu_vi_truc_co','tu_vi_kim_dan','tu_vi_nguyen_anh','tu_vi_hoa_than']){
            p.pills[id]=clamp(Math.floor(Number(s.pills?.[id])||0),0,999);
          }
        }
      }
      if(s.version>=5&&s.materials&&typeof s.materials==='object'&&!Array.isArray(s.materials)){
        p.materials={};
        for(const [id,count] of Object.entries(s.materials)){
          const canonicalId=normalizeBeastLootId(id);
          if(canonicalId&&Number.isFinite(count)&&count>0){
            // Preserve previously earned Lục–Cửu Phẩm cores as Ngũ Phẩm of the same quality.
            p.materials[canonicalId]=clamp((p.materials[canonicalId]||0)+Math.floor(count),0,1000000000);
          }
        }
      }
      for(const id of ['hoi_huyet','hoi_linh']){const n=s.pills?.[id];p.pills[id]=Number.isFinite(n)?clamp(Math.floor(n),0,999):0}
      p.professionItems=normalizeResources(s.professionItems);
      p.gearInventory=normalizeEquipmentInventory(s.gearInventory);
      p.gearSlots=normalizeEquipmentSlots(s.gearSlots);
      p.baseEquippedGear=normalizeBaseGear({...s.equippedGear, ...s.baseEquippedGear});
      // Remove legacy starter bonuses; earned gear remains in gearSlots.
      const legacyBase=s.baseEquippedGear??s.equippedGear;
      if([0,12].includes(legacyBase?.dmg)&&legacyBase?.def===2&&Object.keys(legacyBase).every(k=>['dmg','def'].includes(k)))p.baseEquippedGear={};
      rebuildEquippedGear(p);
      syncStats(p,true);
      const pos=clampIntoWorld(p.x,p.y);p.x=pos.x;p.y=pos.y;
    }catch(e){console.warn('Không thể đọc save cũ:',e)}
  },
  save(){
    const p=this.player;
    try{
      localStorage.setItem(SAVE_KEY,JSON.stringify({version:5,mapId:this.mapId,...Object.fromEntries(['x','y','realmIdx','exp','gold','materials','professionItems','gearInventory','gearSlots','baseEquippedGear','activeCongPhapId','ownedManuals','selectedSkillId','skillMastery','skillExp','pills','equippedGear','spiritualSenseBonus','congPhapMastery'].map(k=>[k,p[k]]))}));
    }catch(e){console.warn('Không lưu được:',e)}
  },
  reset(){
    if(this.transitioning)return;
    const image=this.images.map||this.mapImages.get(floorAsset('map'));
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
