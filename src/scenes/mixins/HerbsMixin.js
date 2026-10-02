/** World Resource Runtime V3 — ownership đi thẳng vào ItemSystem V3. */
import { gameState } from '../../state/gameState.js';
import { getMapById, CANONICAL_MAP_KEYS } from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { listItems, getRealmItemRank } from '../../config/itemCatalog.js?v=20261001-item-v3';
import { addItem, getItemQuantity } from './ItemSystem.js?v=20261001-item-v3';

function rankForWorld() { return getRealmItemRank(gameState.realmIdx); }
function pickPool(kind) {
  const rank=rankForWorld();
  const pool=listItems({kind,rank});
  return pool.length?pool:listItems({kind,rank:0});
}
function colorNum(hex='#86efac') { try { return Phaser.Display.Color.HexStringToColor(hex).color; } catch { return 0x86efac; } }

export const HerbsMixin = {
  initHerbs() {
    this.cleanupWorldResources?.();
    this.herbsGroup=[]; this.mineralNodes=[]; this.herbTarget=null; this.mineralTarget=null;
    const map=this.currentMap||getMapById(gameState.currentMapId);
    if(map?.isPeaceZone||map?.id===CANONICAL_MAP_KEYS.THANH_VAN_THON) return;
    const totalW=this.worldW||32000, herbPoints=[], orePoints=[];
    if ((this.worldH || 0) > 1500) {
      const step = 420;
      let hIdx = 0, oIdx = 0;
      const herbs=pickPool('herb'), ores=pickPool('ore');
      for (let x = 350; x < totalW - 350; x += step) {
        for (let y = this.field.top + 70; y < this.field.bottom - 70; y += step) {
          const jx = x + Phaser.Math.Between(-70, 70);
          const jy = y + Phaser.Math.Between(-70, 70);
          if ((hIdx + oIdx) % 2 === 0) {
            this.spawnOneHerb(jx, jy, 1, hIdx, herbs[hIdx % herbs.length]);
            hIdx++;
          } else {
            this.spawnMineralNode(jx, jy, 1, oIdx, ores[oIdx % ores.length]);
            oIdx++;
          }
        }
      }
      return;
    }
    const ranges=[[750,4000,900,1],[4200,12000,650,2],[12200,22000,450,3],[22200,totalW-400,300,4]];
    for(const [a,b,step,z] of ranges){
      for(let x=a;x<Math.min(b,totalW-300);x+=step+Phaser.Math.Between(-80,100)) herbPoints.push({x,z});
      for(let x=a+220;x<Math.min(b,totalW-300);x+=Math.round(step*1.25)+Phaser.Math.Between(-60,120)) orePoints.push({x,z});
    }
    const herbs=pickPool('herb'), ores=pickPool('ore');
    herbPoints.forEach((p,i)=>this.spawnOneHerb(p.x,Phaser.Math.Between(this.field.top+35,this.field.bottom-35),p.z,i,herbs[i%herbs.length]));
    orePoints.forEach((p,i)=>this.spawnMineralNode(p.x,Phaser.Math.Between(this.field.top+42,this.field.bottom-38),p.z,i,ores[i%ores.length]));
  },

  cleanupWorldResources() {
    (this.herbsGroup||[]).forEach(h=>{h?.container?.destroy?.(true);h?.hitZone?.destroy?.();});
    (this.mineralNodes||[]).forEach(n=>{n?.container?.destroy?.(true);n?.hitZone?.destroy?.();});
  },

  spawnOneHerb(x,y,zone=1,idx=0,def=null) {
    def ||= pickPool('herb')[idx%pickPool('herb').length]; if(!def)return null;
    const tint=colorNum(def.color), container=this.add.container(x,y).setDepth(Math.floor(y)+3);
    const shadow=this.add.ellipse(0,14,34,10,0x000000,.3), aura=this.add.ellipse(0,7,38,16,tint,.22);
    const icon=this.add.text(0,-4,'🌿',{fontSize:'28px'}).setOrigin(.5);
    const bg=this.add.rectangle(0,-37,150,18,0x07131d,.92).setStrokeStyle(1,tint,1);
    const label=this.add.text(0,-37,def.name,{fontFamily:'sans-serif',fontSize:'8px',fontStyle:'bold',color:def.color||'#86efac',stroke:'#000',strokeThickness:2}).setOrigin(.5);
    const promptBg=this.add.rectangle(0,-57,82,16,0x103622,.96).setStrokeStyle(1,0x86efac).setVisible(false);
    const prompt=this.add.text(0,-57,'🌿 [Thu Hái]',{fontFamily:'sans-serif',fontSize:'7px',fontStyle:'bold',color:'#bbf7d0'}).setOrigin(.5).setVisible(false);
    container.add([shadow,aura,icon,bg,label,promptBg,prompt]);
    this.tweens.add({targets:aura,scaleX:1.25,scaleY:1.25,alpha:.08,yoyo:true,repeat:-1,duration:1000+Math.random()*300});
    const hitZone=this.add.rectangle(x,y-16,112,68,0x000000,0).setInteractive({useHandCursor:true}).setDepth(Math.floor(y)+5);
    const herb={x,y,zone,idx,herbDef:def,container,hitZone,promptBg,prompt,isHarvested:false};
    hitZone.on('pointerdown',pointer=>{pointer?.event?.stopPropagation?.();this.interactWithHerb(herb);});
    const near=Math.abs(x-(this.player?.x??350))<=950;container.setVisible(near);hitZone.setVisible(near);this.herbsGroup.push(herb);return herb;
  },

  interactWithHerb(herb) {
    if(!herb||herb.isHarvested||!this.player?.active)return;
    if(gameState.isResting){gameState.isResting=false;this.createSideToggleButtons?.();}
    const dist=Phaser.Math.Distance.Between(this.player.x,this.player.y,herb.x,herb.y);
    if(dist<=90)return this.harvestHerb(herb);
    this.herbTarget=herb;this.showFloatingText?.(this.player.x,this.player.y-40,`🌿 Đang tiến lại hái ${herb.herbDef.name}...`,'#86efac','11px');
    this.moveTarget={x:herb.x,y:herb.y,onArrive:()=>{this.herbTarget=null;this.harvestHerb(herb);}};
  },

  harvestHerb(herb) {
    if(!herb||herb.isHarvested||!this.player?.active)return; herb.isHarvested=true;this.herbTarget=null;
    const count=herb.zone>=3?Phaser.Math.Between(2,3):Phaser.Math.Between(1,2); addItem(herb.herbDef.id,count);
    herb.promptBg?.setVisible(false);herb.prompt?.setVisible(false);this.spawnVfx?.(herb.x,herb.y,0,.7,{tint:colorNum(herb.herbDef.color),duration:350});
    this.showFloatingText?.(this.player.x,this.player.y-65,`🌿 +${count} [${herb.herbDef.name}]`,herb.herbDef.color||'#4ade80','13px');this.updateHUD?.();
    this.tweens.add({targets:herb.container,scaleX:.1,scaleY:.1,alpha:0,duration:300,onComplete:()=>{herb.container?.setVisible(false);herb.hitZone?.setVisible(false);}});
    const delay=Phaser.Math.Between(25000,40000);this.time.delayedCall(delay,()=>{if(herb&&this.scene?.isActive())this.respawnHerb(herb);});
  },

  respawnHerb(herb) { if(!herb)return;herb.isHarvested=false;herb.container?.setScale(1).setAlpha(1);const near=Math.abs(herb.x-(this.player?.x??350))<=950;herb.container?.setVisible(near);herb.hitZone?.setVisible(near); },

  initMineralNodes() {
    // initHerbs() khởi tạo đồng thời cả hai nguồn. Giữ API để MainScene/code cũ gọi an toàn.
    if(!Array.isArray(this.mineralNodes))this.mineralNodes=[];
  },

  spawnMineralNode(x,y,zone=1,idx=0,def=null) {
    def ||= pickPool('ore')[idx%pickPool('ore').length]; if(!def)return null;
    const tint=colorNum(def.color),container=this.add.container(x,y).setDepth(Math.floor(y)+3);
    const shadow=this.add.ellipse(0,14,38,12,0x000000,.35),aura=this.add.ellipse(0,8,42,18,tint,.28);
    const icon=this.add.text(0,-4,'⛏️',{fontSize:'28px'}).setOrigin(.5);
    const bg=this.add.rectangle(0,-36,150,18,0x07131d,.92).setStrokeStyle(1,tint,1);
    const label=this.add.text(0,-36,def.name,{fontFamily:'sans-serif',fontSize:'8px',fontStyle:'bold',color:def.color||'#e2e8f0',stroke:'#000',strokeThickness:2}).setOrigin(.5);
    const promptBg=this.add.rectangle(0,-56,86,16,0x3f3410,.96).setStrokeStyle(1,0xfde047).setVisible(false);
    const prompt=this.add.text(0,-56,'⛏ [Khai Khoáng]',{fontFamily:'sans-serif',fontSize:'7px',fontStyle:'bold',color:'#fef08a'}).setOrigin(.5).setVisible(false);
    container.add([shadow,aura,icon,bg,label,promptBg,prompt]);this.tweens.add({targets:aura,scaleX:1.3,scaleY:1.3,alpha:.1,yoyo:true,repeat:-1,duration:1000+Math.random()*300});
    const hitZone=this.add.rectangle(x,y-18,116,68,0x000000,0).setInteractive({useHandCursor:true}).setDepth(Math.floor(y)+5);
    const node={x,y,zone,idx,def,container,hitZone,promptBg,prompt,isHarvested:false};hitZone.on('pointerdown',p=>{p?.event?.stopPropagation?.();this.interactWithMineral(node);});
    const near=Math.abs(x-(this.player?.x??350))<=950;container.setVisible(near);hitZone.setVisible(near);this.mineralNodes.push(node);return node;
  },

  interactWithMineral(node) {
    if(!node||node.isHarvested||!this.player?.active)return;const dist=Phaser.Math.Distance.Between(this.player.x,this.player.y,node.x,node.y);
    if(dist<=90)return this.harvestMineral(node);this.mineralTarget=node;this.showFloatingText?.(this.player.x,this.player.y-40,`⛏ Đang tiến lại khai thác ${node.def.name}...`,node.def.color||'#ddd','11px');
    this.moveTarget={x:node.x,y:node.y,onArrive:()=>{this.mineralTarget=null;this.harvestMineral(node);}};
  },

  harvestMineral(node) {
    if(!node||node.isHarvested||!this.player?.active)return;node.isHarvested=true;this.mineralTarget=null;
    const count=node.zone>=4?Phaser.Math.Between(2,3):node.zone>=2?Phaser.Math.Between(1,2):1;addItem(node.def.id,count);node.promptBg?.setVisible(false);node.prompt?.setVisible(false);
    this.spawnVfx?.(node.x,node.y,0,.55,{tint:colorNum(node.def.color),duration:330});this.showFloatingText?.(this.player.x,this.player.y-64,`⛏ +${count} [${node.def.name}]`,node.def.color||'#ddd','12px');this.updateHUD?.();
    this.tweens.add({targets:node.container,scaleX:.12,scaleY:.12,alpha:0,duration:280,onComplete:()=>{node.container?.setVisible(false);node.hitZone?.setVisible(false);}});
    this.time.delayedCall(Phaser.Math.Between(30000,45000),()=>{if(!node||!this.scene?.isActive())return;node.isHarvested=false;node.container?.setScale(1).setAlpha(1);const near=Math.abs((this.player?.x??350)-node.x)<=950;node.container?.setVisible(near);node.hitZone?.setVisible(near);});
  },

  updateMineralNodes() { this.updateWorldResourceVisibility?.(this.mineralNodes); },
  updateWorldResourceVisibility(nodes=[]) {
    if(!this.player?.active)return;const px=this.player.x,py=this.player.y;
    for(const n of nodes||[]){if(!n?.container)continue;if(n.isHarvested){n.container.setVisible(false);n.hitZone?.setVisible(false);continue;}const near=Math.abs(n.x-px)<=950;n.container.setVisible(near);n.hitZone?.setVisible(near);if(!near)continue;const prompt=Phaser.Math.Distance.Between(px,py,n.x,n.y)<=125;n.promptBg?.setVisible(prompt);n.prompt?.setVisible(prompt);}
  },
  getWorldMineralInventory() { return listItems({kind:'ore'}).map(def=>({...def,count:getItemQuantity(def.id)})).filter(x=>x.count>0); },
  updateHerbs() { this.updateWorldResourceVisibility(this.herbsGroup);this.updateWorldResourceVisibility(this.mineralNodes); }
};
