import {portalsFor,makeWorld} from '../world.js';
import {floorNumber,floorAsset} from '../floors.js';
import {loadImage,GAMEPLAY} from '../core/runtime.js';

export const TravelSystem = {
  async loadFloorImage(id){
    const asset=floorAsset(id);
    if(this.mapImages.has(asset)){
      const image=this.mapImages.get(asset);this.mapImages.delete(asset);this.mapImages.set(asset,image);return image;
    }
    const image=await loadImage(asset);
    this.mapImages.set(asset,image);
    while(this.mapImages.size>GAMEPLAY.mapCacheLimit)this.mapImages.delete(this.mapImages.keys().next().value);
    return image;
  },
  async travel(direction='next'){
    if(this.transitioning||this.player.dead)return false;
    const exit=portalsFor(this.mapId).find(p=>p.id===direction);
    if(!exit)return false;
    this.transitioning=true;this.input.clear();
    const destination=exit.to,previous=this.mapId;
    let image;
    try{image=await this.loadFloorImage(destination)}
    catch(err){console.error('Không tải được tầng:',destination,err);this.portalCooldown=2;this.transitioning=false;this.toast('Không tải được tầng tiếp theo. Hãy thử lại.');return false}
    this.stopMeditation();this.input.clear();this.target=null;this.tapMarker=null;
    this.state.effects=[];this.state.texts=[];this.mapStates[this.mapId]=this.state;
    this.mapId=destination;this.state=this.mapStates[destination]||makeWorld(destination);
    if(!this.mapStates[destination])this.refreshEnemies();
    this.ensureNPCs();
    const p=this.player,portal=portalsFor(destination).find(p=>p.to===previous);
    p.x=portal.x+(direction==='next'?90:-90);p.y=portal.y;
    p.walk=false;p.attackAnim=0;p.skillAnim=0;p.pendingSkill=null;p.attackAge=0;p.skillAge=0;
    this.portalCooldown=1.5;this.lastManual=this.gameTime;
    this.images[destination]=image;delete this.images[previous];
    this.transitioning=false;this.drawMinimap();this.save();this.toast(`Đã đến tầng ${floorNumber(destination)} / 99`);
    return true;
  }
};
