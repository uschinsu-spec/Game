/** World metadata and spawn points (coordinates expressed as pixels in map_original.png). */
import {enemyStats} from './cultivation.js';
import {FLOOR_COUNT,floorNumber,floorId} from './floors.js';
export const MAP_SCALE = 1.43;
// Spawn/collision data uses the original 941x1672 coordinate space.
// Reproject it onto the current landscape map without stretching the artwork.
const MAP_X_SCALE=1672/941*MAP_SCALE,MAP_Y_SCALE=941/1672*MAP_SCALE;
export const WORLD = Object.freeze({width:1672*MAP_SCALE,height:941*MAP_SCALE,name:'Vạn Mộc Sâm Lâm'});
export const PLAYER_SPAWN = Object.freeze({x:330*MAP_X_SCALE,y:560*MAP_Y_SCALE});
export function portalsFor(id){
  const n=floorNumber(id),portals=[];
  if(n>1)portals.push({id:'back',x:WORLD.width*.26,y:WORLD.height*.28,to:floorId(n-1)});
  if(n<FLOOR_COUNT)portals.push({id:'next',x:WORLD.width*(n===1?.86:.78),y:WORLD.height*.81,to:floorId(n+1)});
  return portals;
}

export const SPECIES = Object.freeze({
  wolf:   {name:'Yêu Lang',speed:67,aggro:205,radius:23,size:[86,73]},
  deer:   {name:'Linh Lộc',speed:84,aggro:0,radius:19,size:[82,86]},
});

const ENEMY_PLACES = [
  [485,500],[555,490],[588,605],[510,680],
  [603,770],[350,740],[580,850],[460,910],
  [380,1030],[540,1050],[505,1130],[610,1200],
  [570,1320],[380,1295],[485,1410],[640,1450],
  [610,1550],[350,360],[470,290],[530,365],
];

const HERB_PLACES = [
  [425,470],[610,540],[490,625],[380,695],[585,795],[340,850],
  [425,1000],[610,1050],[430,1175],[545,1270],[320,1380],[585,1450],
  [480,1530],[350,280],[600,340],
];

export function makeWorld(mapId='map') {
  const kind=floorNumber(mapId)===1?'deer':'wolf';
  const enemies = ENEMY_PLACES.map(([x,y],i)=>makeEnemy(kind,x*MAP_X_SCALE,y*MAP_Y_SCALE,i));
  const herbs = HERB_PLACES.map(([x,y],i)=>({id:i,x:x*MAP_X_SCALE,y:y*MAP_Y_SCALE,available:true,respawn:0,phase:i*.7}));
  return {enemies,herbs,drops:[],effects:[],texts:[]};
}

export function makeEnemy(kind,x,y,id) {
  const stats=enemyStats(kind,0);
  return {id,kind,x,y,homeX:x,homeY:y,...stats,maxHp:stats.hp,face: id%2===0?-1:1,
    moveAge:id*.17,walk:false,attackCD:0,attackAnim:0,attackAge:0,attackHit:false,flinch:0,dead:false,respawn:0,wander:1.5+(id%4)*.6,
    vx:0,vy:0};
}

export function clampIntoWorld(x,y,radius=22){return {
    x:Math.min(WORLD.width-radius,Math.max(radius,x)),
    y:Math.min(WORLD.height-radius,Math.max(radius,y))
};}

/** Simplified walkable map constraints. Can later be replaced by Tiled collisions. */
export function isWalkable(x,y,mapId='map') {
  if(floorNumber(mapId)>1){
    const nx=x/WORLD.width,ny=y/WORLD.height;
    return nx>.04&&nx<.96&&ny>.06&&ny<.94&&!(nx<.19&&ny<.28)&&!(nx>.83&&ny>.7);
  }
  const mx=x/MAP_X_SCALE,my=y/MAP_Y_SCALE;
  if(mx<35||mx>920||my<70||my>1620)return false;
  // Broad painted-water pockets at the lower left and upper right of the scene.
  if(my>1140 && mx<180 && my<1570)return false;
  if(my<300 && mx>790)return false;
  if(my>480 && my<810 && mx>830)return false;
  return true;
}
