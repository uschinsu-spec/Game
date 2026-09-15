// Ordered mobile boot: GAME2 domain first, world/map services before runtime UI, UI last.
(()=>{'use strict';
const groups=[
 ['https://cdn.babylonjs.com/babylon.js'],
 ['https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js'],
 ['./core/config.js','./core/logger.js','./core/lifecycle.js','./core/rng.js','./core/clock.js','./core/event-bus.js','./core/tick-scheduler.js','./core/transaction.js','./core/save-system.js','./core/validator.js','./core/game-state.js','./core/input-system.js','./core/cultivation-domain.js','./core/cultivation-system.js','./core/meditation-system.js','./core/breakthrough-system.js','./core/combat-balance.js','./core/stat-system.js','./core/entity-health.js','./core/shield-system.js','./core/combat-state-system.js','./core/heal-system.js','./core/status-system.js','./core/death-system.js','./core/damage-system.js','./core/economy-catalog.js','./core/phase10-catalog.js','./core/pet-catalog.js','./core/phase12-catalog.js','./core/phase13-catalog.js','./core/asset-manifest.js','./core/economy-state.js','./core/world-state-system.js','./core/wallet-system.js','./core/item-system.js','./core/inventory-system.js','./core/equipment-system.js','./core/shop-system.js','./core/pet-system.js','./core/world-flag-system.js','./core/quest-system.js','./core/combat-bootstrap.js','./core/skill-catalog.js','./core/cooldown-system.js','./core/skill-resource-system.js','./core/craft-job-system.js','./core/alchemy-system.js','./core/crafting-system.js','./core/pill-system.js','./core/artifact-system.js','./core/phase10-bootstrap.js','./core/idle-progression-controller.js'],
 ['./assets/ui/ui-icons.js','./game.js'],
 ['./assets/environment/terrain/tex_01_Grass_Lush.js','./assets/environment/world/enhanced-world.js','./core/terrain-system.js','./core/environment-renderer.js','./core/world-streaming-system.js'],
 ['./core/player-rig-adapter.js','./core/socket-service.js','./core/player-renderer.js','./assets/characters/rigged-player.js'],
 ['./assets/enemies/enemy-registry.js','./assets/enemies/enemy-animation.js','./assets/enemies/enemy-loader.js'],
 ['./core/interaction-system.js','./core/enemy-domain.js','./core/enemy-entity-registry.js','./core/enemy-renderer.js','./core/spawn-system.js','./core/encounter-system.js','./core/enemy-bootstrap.js','./core/enemy-ai-system.js','./core/ground-loot-system.js','./core/loot-system.js','./core/pickup-system.js','./core/economy-bootstrap.js','./core/formation-system.js','./core/world-craft-nodes.js','./core/service-router.js','./core/dialogue-system.js','./core/npc-system.js','./core/quest-marker-system.js','./core/pet-renderer.js','./core/pet-capture-system.js'],
 ['./core/collision-system.js','./core/player-motor.js','./core/camera-controller.js','./core/input-adapter-keyboard.js','./core/input-adapter-mobile.js','./core/player-input-controller.js','./core/facing-controller.js','./core/player-animation-state-machine.js','./core/player-animation-diagnostics.js'],
 ['./core/world-system.js','./core/map-discovery-system.js','./core/waypoint-system.js','./core/teleport-system.js','./core/resource-node-system.js','./core/respawn-anchor-system.js','./core/map-state-system.js','./core/world-environment-system.js','./core/world-event-map-system.js','./core/map-data-system.js','./core/map-v2-ui.js'],
 ['./core/combat-controller.js','./core/combat-ui-adapter.js'],
 ['./core/spatial-query.js','./core/targeting-system.js','./core/projectile-system.js','./core/skill-effect-resolver.js','./core/skill-system.js','./core/cast-system.js','./core/projectile-renderer.js','./core/skill-ui-controller.js','./skill-vfx.js','./core/pet-ai-system.js'],
 ['./idle-adventure.js'],
 ['./core/progression-service.js','./core/economy-ui.js','./core/phase10-ui.js','./core/pet-ui.js','./core/phase12-ui.js'],
 ['./progression-systems.js','./mobile-runtime.js','./mobile-minimap.js']
];
const sequentialGroups=new Set([2,5,7,8,9,11,12]),total=groups.flat().length;let done=0,failed=false,timer;
const panel=document.createElement('section');panel.id='boot-status';panel.setAttribute('role','status');panel.style.cssText='position:fixed;inset:0;z-index:100000;background:#5aa8d6;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font:16px system-ui';
const message=document.createElement('p'),retry=document.createElement('button');retry.textContent='Tải lại game';retry.hidden=true;retry.style.cssText='padding:12px 24px;font:inherit;border-radius:12px';retry.onclick=()=>location.reload();panel.append(message,retry);document.body.appendChild(panel);
const status=()=>message.textContent=`Đang tải game ${Math.min(done,total)}/${total}`;
const fail=r=>{if(failed)return;failed=true;clearTimeout(timer);retry.hidden=false;message.textContent=`Không thể khởi động game: ${r}.`;try{window.GameRuntime?.engine?.stopRenderLoop()}catch(_){}};
function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=/^https?:\/\//i.test(src)?src:`${src}?t=${Date.now()}`;s.async=false;const to=setTimeout(()=>reject(new Error('Quá thời gian tải '+src)),25000);s.onload=()=>{clearTimeout(to);done++;status();resolve()};s.onerror=()=>{clearTimeout(to);reject(new Error('Không tải được '+src))};document.head.appendChild(s)})}
async function boot(){try{
 if('serviceWorker'in navigator){try{const r=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});await r.update();if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'})}catch(e){console.warn('[Boot] SW',e)}}
 status();for(let i=0;i<groups.length;i++){const g=groups[i];if(sequentialGroups.has(i)){for(const src of g)await load(src)}else await Promise.all(g.map(load))}
 const s=window.GameServices||{};
 window.GameCore.world=window.GameCore.world||new window.GameCore.WorldSystem();
 window.GameCore.mapDiscovery=window.GameCore.mapDiscovery||new window.GameCore.MapDiscoverySystem();
 window.GameCore.waypoints=window.GameCore.waypoints||new window.GameCore.WaypointSystem();
 window.GameCore.teleport=window.GameCore.teleport||new window.GameCore.TeleportSystem({waypoints:window.GameCore.waypoints});
 window.GameCore.resourceNodes=window.GameCore.resourceNodes||new window.GameCore.ResourceNodeSystem();
 window.GameCore.respawnAnchors=window.GameCore.respawnAnchors||new window.GameCore.RespawnAnchorSystem();
 Object.assign(window.GameServices,{world:window.GameCore.world,mapDiscovery:window.GameCore.mapDiscovery,waypoints:window.GameCore.waypoints,teleport:window.GameCore.teleport,resourceNodes:window.GameCore.resourceNodes,respawnAnchors:window.GameCore.respawnAnchors});
 await window.GameCore.world.ready;
 window.GameCore.mapState=window.GameCore.mapState||new window.GameCore.MapStateSystem();
 window.GameCore.worldEnvironment=window.GameCore.worldEnvironment||new window.GameCore.WorldEnvironmentSystem();
 window.GameCore.worldEvents=window.GameCore.worldEvents||new window.GameCore.WorldEventMapSystem();
 Object.assign(window.GameServices,{mapState:window.GameCore.mapState,worldEnvironment:window.GameCore.worldEnvironment,worldEvents:window.GameCore.worldEvents});
 window.GameCore.mapData=window.GameCore.mapData||new window.GameCore.MapDataSystem({world:()=>window.GameServices.world});window.GameServices.mapData=window.GameCore.mapData;
 window.GameCore.mapUI=window.GameCore.mapUI||new window.GameCore.MapV2UI();window.GameServices.mapUI=window.GameCore.mapUI;
 window.GameMapV2={open:(m='LOCAL')=>window.GameServices.mapUI?.open?.(m),close:()=>window.GameServices.mapUI?.close?.(),data:()=>window.GameServices.mapData?.local?.()};
 window.GameMiniMap={redraw:()=>window.GameServices.mapUI?.drawMini?.(performance.now()),range:72,open:()=>window.GameServices.mapUI?.open?.('LOCAL')};
 document.querySelectorAll('[data-ui-icon]').forEach(el=>{const p=window.UI_ICONS?.[el.dataset.uiIcon];if(p)el.src=p});
 const rt=window.GameRuntime;if(!rt)throw new Error('Thiếu GameRuntime');
 if(!s.events||!s.storage||!s.transactions||!s.worldState||!s.terrain||!s.environmentRenderer||!s.worldStreaming||!window.GameServices.world||!window.GameServices.mapDiscovery||!window.GameServices.waypoints||!window.GameServices.teleport||!window.GameServices.resourceNodes||!window.GameServices.respawnAnchors||!window.GameServices.mapState||!window.GameServices.worldEnvironment||!window.GameServices.worldEvents||!window.GameServices.mapData||!window.GameServices.mapUI||!s.cultivation||!s.damage||!s.wallet||!s.inventory||!s.pets||!s.interactions||!s.quests||!s.npcs||!s.spawnSystem||!s.skills||!s.casts)throw new Error('GAME2 world/map/core systems chưa khởi tạo đầy đủ');
 message.textContent='Đang dựng cảnh 3D…';timer=setTimeout(()=>fail('Cảnh 3D chưa sẵn sàng sau 30 giây'),30000);rt.scene.onAfterRenderObservable.addOnce(()=>{if(failed)return;clearTimeout(timer);panel.style.display='none'})
 }catch(e){fail(e.message);console.error('[Boot]',e)}}
boot()})();