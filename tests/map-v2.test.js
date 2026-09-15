(()=>{'use strict';
function assert(name,c){if(!c)throw new Error(name)}
async function runMapV2Tests(){const out=[],test=async(name,fn)=>{try{await fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}},s=GameServices,d=s.mapData,m=s.mapState,c=GameCore.phase13Catalog;
await test('three map levels available',()=>{assert('minimap api',!!window.GameMiniMap);assert('local mode',typeof s.mapUI?.drawLocal==='function');assert('world mode',typeof s.mapUI?.drawWorld==='function')});
await test('authoritative map source has no CombatRuntime',()=>{assert('legacy combat dependency',!String(GameCore.MapDataSystem).includes('CombatRuntime'));assert('scene name scan',!String(GameCore.MapDataSystem).includes('transformNodes'))});
await test('world map uses six phase14 zones',()=>{const w=d.world();assert('six zones',w.nodes.length===6);assert('edges',w.edges.length>=5)});
await test('fog is discovery backed',()=>{const z=c.ZONES[d.zoneId()],p=d.player().position,k=d.chunkKey(z,p),old=s.worldState.state.discoveredChunks[k];delete s.worldState.state.discoveredChunks[k];assert('hidden when undiscovered',d.pointDiscovered(z.id,p)===false);if(old)s.worldState.state.discoveredChunks[k]=old;else{s.worldState.state.discoveredChunks[k]=Date.now();s.worldState.save('TEST_RESTORE')}});
await test('custom marker persists and removes',()=>{const zoneId=d.zoneId(),r=m.add({zoneId,position:{x:2,z:3},label:'Test marker'});assert('add',r.ok);assert('listed',m.list(zoneId).some(x=>x.id===r.marker.id));assert('remove',m.remove(r.marker.id));assert('gone',!m.list(zoneId).some(x=>x.id===r.marker.id))});
await test('waypoint quest poi event icons available',()=>{const x=d.local(),k=new Set(x.markers.map(v=>v.kind));assert('waypoint',k.has('WAYPOINT'));assert('icons',!!GameCore.MAP_ICONS.WAYPOINT&&!!GameCore.MAP_ICONS.QUEST&&!!GameCore.MAP_ICONS.EVENT)});
await test('weather and time source',()=>{const e=s.worldEnvironment.snapshot(d.zoneId());assert('weather',!!e.weather);assert('time',/^\d\d:\d\d$/.test(e.labelTime));assert('period',!!e.period)});
await test('map pointer owner channel',()=>{const id=99123;assert('claim',s.input.claimPointer(id,'MAP_V2'));assert('owner',s.input.getPointerOwner(id)==='MAP_V2');s.input.releasePointer(id);assert('released',!s.input.getPointerOwner(id))});
await test('authoring tool exposed',()=>{assert('overlay',!!document.getElementById('mapV2Overlay'));assert('authoring',typeof s.mapUI?.addMarkerAt==='function')});
await test('no stage/current arena dependency',()=>{const src=String(GameCore.MapDataSystem)+String(GameCore.MapV2UI);assert('stage',!/stage/i.test(src));assert('arena',!/currentArena|arenaMonster/i.test(src))});
await test('snapshot performance budget',()=>{for(let i=0;i<10;i++)d.local();const t=performance.now();for(let i=0;i<250;i++)d.local();const avg=(performance.now()-t)/250;assert(`avg ${avg.toFixed(2)}ms`,avg<16)});
return{ok:out.every(x=>x.ok),results:out}}
window.runMapV2Tests=runMapV2Tests;
})();