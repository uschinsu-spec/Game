import ENEMY_DATA from '../data/enemies.json' with {type:'json'};
// Logical sprite IDs stay stable while assets are grouped by purpose.
export const ASSET_PATHS=Object.freeze({
  ...Object.fromEntries(Object.entries(ENEMY_DATA.enemies).map(([id,e])=>[id,e.path])),
  "map": "MAP/map",
  "map2": "MAP/map2",
  "player": "PLAYER/player",
  "NPC1": "NPC/NPC1",
  "NPC2": "NPC/NPC2",
  "NPC3": "NPC/NPC3",
  "NPC4": "NPC/NPC4",
  "NPC5": "NPC/NPC5",
  "NPC6": "NPC/NPC6",
  "NPC7": "NPC/NPC7",
  "NPC8": "NPC/NPC8",
  "frame_7": "VFX/frame_7",
  "basic_attack_slash": "VFX/basic_attack_slash",
  "luyen_khi_9he_7frame": "VFX/luyen_khi_9he_7frame",
  "avatar": "UI/avatar"
});

const pending=new Map();

/** Share in-flight requests; completed map images remain owned by the bounded LRU. */
export function loadImage(name){
  const asset=ASSET_PATHS[name]||name;
  if(pending.has(name))return pending.get(name);
  const request=new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error(`Không tải được asset: ${name}.webp`));
    img.src=new URL(`../../assets/webp/${asset}.webp`,import.meta.url).href;
  }).finally(()=>pending.delete(name));
  pending.set(name,request);
  return request;
}
