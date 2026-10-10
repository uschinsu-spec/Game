export const FLOOR_COUNT=99;
// Unique art is reused cyclically; enemies/NPCs and drops remain floor-specific.
export const EXTRA_MAP_ASSETS=Object.freeze([
  'MAP/map3',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_15 PM-1',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_17 PM-2',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_18 PM-3',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_19 PM-4',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_22 PM-5',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_25 PM-6',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_27 PM-7',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_28 PM-8',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_29 PM-9',
  'MAP/ChatGPT Image Oct 10, 2026, 01_56_30 PM-10',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_47 PM-1',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_48 PM-2',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_49 PM-3',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_51 PM-4',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_52 PM-5',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_53 PM-6',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_55 PM-7',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_56 PM-8',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_57 PM-9',
  'MAP/ChatGPT Image Oct 10, 2026, 01_58_58 PM-10',
]);
export function floorNumber(id='map'){
  const n=typeof id==='number'?id:id==='map'?1:/^map\d+$/.test(id)?Number(id.slice(3)):NaN;
  return Number.isInteger(n)&&n>=1&&n<=FLOOR_COUNT?n:1;
}
export function floorId(n){const floor=floorNumber(n);return floor===1?'map':`map${floor}`}
export function floorAsset(id){
  const n=floorNumber(id);
  return n===1?'map':n===2?'map2':EXTRA_MAP_ASSETS[(n-3)%EXTRA_MAP_ASSETS.length];
}
