/** Item icon streaming V3: chỉ materialize icon của item đang sở hữu/đang hiển thị. */
import { listOwnedItems, ensureItemTexture } from './ItemSystem.js?v=20261001-item-icons-v4';
export function installItemIconStreaming(MainGameScene){
  if(!MainGameScene?.prototype||MainGameScene.prototype.__itemIconStreamingV3Installed)return;const p=MainGameScene.prototype;p.__itemIconStreamingV3Installed=true;
  p.ensureOwnedItemIcons=function(limit=84){const rows=listOwnedItems().slice(0,Math.max(1,Number(limit)||84));rows.forEach(r=>ensureItemTexture(this,r.def));return rows.length;};
  p.ensureItemIcon=function(itemOrId){return ensureItemTexture(this,itemOrId);};
}
