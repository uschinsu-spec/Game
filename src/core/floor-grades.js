// Shared floor progression for beasts and professions.
export const FLOOR_GRADES=Object.freeze({firstRankFloor:2,floorsPerRank:12,floorsPerStage:3,maxRank:5});
export const FINAL_RANK_FLOOR=FLOOR_GRADES.firstRankFloor+FLOOR_GRADES.maxRank*FLOOR_GRADES.floorsPerRank-1;
export function rankForFloor(floor){
  if(!Number.isInteger(floor)||floor<FLOOR_GRADES.firstRankFloor)return 0;
  return Math.min(FLOOR_GRADES.maxRank,1+Math.floor((floor-FLOOR_GRADES.firstRankFloor)/FLOOR_GRADES.floorsPerRank));
}
export function stageForFloor(floor){
  if(!rankForFloor(floor))return -1;
  return Math.floor(((Math.min(floor,FINAL_RANK_FLOOR)-FLOOR_GRADES.firstRankFloor)%FLOOR_GRADES.floorsPerRank)/FLOOR_GRADES.floorsPerStage);
}
