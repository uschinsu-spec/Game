(()=>{'use strict';
const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
class WorldStateSystem{
 constructor({store=window.GameServices?.economyStore,events=window.GameServices?.events}={}){Object.assign(this,{store,events});const s=store.state;s.world=s.world||{version:1,currentZoneId:'thanh_van_region',discoveredPOIs:{},discoveredChunks:{},unlockedWaypoints:{thanh_van_courtyard:true},resourceNodes:{},lastRespawnAnchorId:'thanh_van_courtyard'};this.state=s.world;store.save()}
 save(reason='WORLD_STATE'){this.store.save();this.events?.emit?.('world:stateSaved',{reason});return true}
 discoverPOI(id){if(this.state.discoveredPOIs[id])return false;this.state.discoveredPOIs[id]=Date.now();this.save('DISCOVER_POI');this.events?.emit?.('world:poiDiscovered',{poiId:id});return true}
 discoverChunk(zoneId,key){const id=`${zoneId}:${key}`;if(this.state.discoveredChunks[id])return false;this.state.discoveredChunks[id]=Date.now();this.save('DISCOVER_CHUNK');this.events?.emit?.('world:chunkDiscovered',{zoneId,chunkKey:key});return true}
 unlockWaypoint(id){if(this.state.unlockedWaypoints[id])return false;this.state.unlockedWaypoints[id]=Date.now();this.save('UNLOCK_WAYPOINT');this.events?.emit?.('waypoint:unlocked',{waypointId:id});return true}
 setZone(zoneId){if(this.state.currentZoneId===zoneId)return false;this.state.currentZoneId=zoneId;this.save('SET_ZONE');return true}
 snapshot(){return clone(this.state)}
}
window.GameCore=window.GameCore||{};window.GameCore.WorldStateSystem=WorldStateSystem;window.GameCore.worldState=window.GameCore.worldState||new WorldStateSystem();window.GameServices=Object.assign(window.GameServices||{},{worldState:window.GameCore.worldState});
})();