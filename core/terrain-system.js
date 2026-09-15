(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class TerrainSystem{
 constructor({catalog=window.GameCore?.phase13Catalog,scene=window.GameRuntime?.scene}={}){Object.assign(this,{catalog,scene})}
 zone(id){return this.catalog.ZONES[id]||null}
 inBounds(zoneId,p){const b=this.zone(zoneId)?.bounds;if(!b||!p)return false;return p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ}
 distToSegment(p,a,b){const vx=b.x-a.x,vz=b.z-a.z,wx=p.x-a.x,wz=p.z-a.z,d=vx*vx+vz*vz||1,t=clamp((wx*vx+wz*vz)/d,0,1),x=a.x+t*vx,z=a.z+t*vz;return Math.hypot(p.x-x,p.z-z)}
 masks(zoneId,p){const t=this.zone(zoneId)?.terrain||{},water=(t.water||[]).some(w=>Math.hypot(p.x-w.center.x,p.z-w.center.z)<=w.radius),road=(t.roads||[]).some(r=>this.distToSegment(p,r.a,r.b)<=r.width*.5),blocked=(t.blocked||[]).some(r=>p.x>=r.minX&&p.x<=r.maxX&&p.z>=r.minZ&&p.z<=r.maxZ);return{water,road,blocked,boundary:!this.inBounds(zoneId,p)}}
 spiritDensity(zoneId,p){const z=this.zone(zoneId);if(!z)return 1;let d=Number(z.spiritDensity)||1;for(const s of Object.values(z.subZones||{}))if(Math.hypot(p.x-s.center.x,p.z-s.center.z)<=s.radius)d=Math.max(d,Number(s.spiritDensity)||d);return d}
 sampleHeight(zoneId,p){if(!this.inBounds(zoneId,p))return null;if(this.scene&&typeof BABYLON!=='undefined'){const ray=new BABYLON.Ray(new BABYLON.Vector3(p.x,40,p.z),new BABYLON.Vector3(0,-1,0),80),hit=this.scene.pickWithRay(ray,m=>m?.metadata?.walkable===true,false);if(hit?.hit)return hit.pickedPoint?.y??0}return 0}
 isWalkable(zoneId,p){const m=this.masks(zoneId,p);return!m.water&&!m.blocked&&!m.boundary}
}
window.GameCore=window.GameCore||{};window.GameCore.TerrainSystem=TerrainSystem;window.GameCore.terrain=window.GameCore.terrain||new TerrainSystem();window.GameServices=Object.assign(window.GameServices||{},{terrain:window.GameCore.terrain});
})();