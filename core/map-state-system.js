(()=>{'use strict';
const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
class MapStateSystem{
 constructor({worldState=window.GameServices?.worldState,events=window.GameServices?.events}={}){Object.assign(this,{worldState,events});const w=worldState?.state;if(!w)throw new Error('WORLD_STATE_REQUIRED');w.mapV2=w.mapV2||{version:1,customMarkers:{},ui:{localZoom:1,worldZoom:1}};w.mapV2.customMarkers=w.mapV2.customMarkers||{};w.mapV2.ui=w.mapV2.ui||{localZoom:1,worldZoom:1};this.state=w.mapV2}
 save(reason='MAP_STATE'){this.worldState?.save?.(reason);this.events?.emit?.('map:stateChanged',{reason});return true}
 list(zoneId=null){return Object.values(this.state.customMarkers).filter(m=>!zoneId||m.zoneId===zoneId).map(clone)}
 add({zoneId,position,label='Dấu cá nhân',icon='◆'}={}){if(!zoneId||!Number.isFinite(position?.x)||!Number.isFinite(position?.z))return{ok:false,reason:'INVALID_MARKER'};if(Object.keys(this.state.customMarkers).length>=64)return{ok:false,reason:'MARKER_LIMIT'};const id=`mk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,m={id,zoneId:String(zoneId),position:{x:Number(position.x),y:Number(position.y)||0,z:Number(position.z)},label:String(label||'Dấu cá nhân').slice(0,40),icon:String(icon||'◆').slice(0,4),createdAt:Date.now()};this.state.customMarkers[id]=m;this.save('MAP_MARKER_ADD');this.events?.emit?.('map:markerAdded',clone(m));return{ok:true,marker:clone(m)}}
 update(id,patch={}){const m=this.state.customMarkers[id];if(!m)return{ok:false,reason:'MARKER_MISSING'};if(patch.label!=null)m.label=String(patch.label).slice(0,40);if(patch.icon!=null)m.icon=String(patch.icon).slice(0,4);if(Number.isFinite(patch.position?.x)&&Number.isFinite(patch.position?.z))m.position={x:Number(patch.position.x),y:Number(patch.position.y)||0,z:Number(patch.position.z)};this.save('MAP_MARKER_UPDATE');this.events?.emit?.('map:markerUpdated',clone(m));return{ok:true,marker:clone(m)}}
 remove(id){const m=this.state.customMarkers[id];if(!m)return false;delete this.state.customMarkers[id];this.save('MAP_MARKER_REMOVE');this.events?.emit?.('map:markerRemoved',{id,zoneId:m.zoneId});return true}
 clearZone(zoneId){let n=0;for(const m of this.list(zoneId)){delete this.state.customMarkers[m.id];n++}if(n)this.save('MAP_MARKER_CLEAR_ZONE');return n}
 setZoom(level,value){const k=level==='WORLD'?'worldZoom':'localZoom';this.state.ui[k]=Math.max(.55,Math.min(3,Number(value)||1));this.save('MAP_ZOOM');return this.state.ui[k]}
 getZoom(level){return Number(this.state.ui[level==='WORLD'?'worldZoom':'localZoom'])||1}
}
window.GameCore=window.GameCore||{};window.GameCore.MapStateSystem=MapStateSystem;
})();