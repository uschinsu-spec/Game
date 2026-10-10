import {ENEMY_SPECIES} from './enemy-master.js';
import {SKILL_VFX} from '../skill-vfx.js';
export const FRAME=176;
export const PLAYER_FRAME_WIDTH=192,PLAYER_FRAME_HEIGHT=108,PLAYER_SCALE=.75;
export const PLAYER_COLUMNS=10,PLAYER_FRAMES=10;
// Match the opaque idle body height (79px) of the player, not just cell size.
export const NPC_RENDER={NPC1:{scale:79/90,foot:101,center:110},NPC2:{scale:79/94,foot:101,center:109}};
export const PLAYER_FEET=[[126, 126, 126, 126, 126, 126, 126, 126, 126, 126], [126, 126, 122, 121, 126, 121, 125, 125, 125, 125], [123, 127, 127, 126, 126, 126, 126, 126, 126, 126], [126, 126, 126, 126, 126, 126, 126, 126, 126, 127]];
export const PLAYER_HEIGHTS=[[105, 105, 105, 105, 105, 105, 105, 105, 105, 105], [105, 103, 100, 100, 102, 99, 102, 102, 103, 100], [101, 103, 113, 115, 118, 112, 99, 98, 98, 100], [115, 115, 115, 102, 102, 102, 102, 103, 104, 106]];

export const SAVE_KEY='van-moc-sam-lam-save-v1';
export const TYPES=['player','NPC1','NPC2',...new Set(Object.values(ENEMY_SPECIES).map(e=>e.sprite)),SKILL_VFX.asset,'frame_7','basic_attack_slash','NPC/npc_truong_thon'];
export const GAMEPLAY=Object.freeze({characterSpeed:164,mapCacheLimit:3,maxFrameDelta:.035,saveInterval:12,minimapInterval:.3});
export const NPC_TEMPLATES=Object.freeze([
  Object.freeze({sprite:'NPC1',name:'Xích Phong',skillElement:'Kim'}),
  Object.freeze({sprite:'NPC2',name:'Bạch Vân',skillElement:'Hỏa'}),
]);
