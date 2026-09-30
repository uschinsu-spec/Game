import { assetId } from '../core/factionIds.js';

export const ASSET_TYPES = Object.freeze(['city','sectMountain','familyEstate','fortress','mine','herbGarden','spiritVein','market','auctionHouse','port','teleportNode','secretRealm','forbiddenZone','caravan','workshop']);

export function createFactionAsset({ factionId, type, worldNodeId, slot=0, value=50, production={}, security=50, status='active', meta={} }) {
  if (!ASSET_TYPES.includes(type)) throw new Error(`Unknown asset type ${type}`);
  return Object.freeze({ id:assetId(factionId,type,worldNodeId,slot), factionId,type,worldNodeId,value:Number(value),production:Object.freeze({...production}),security:Number(security),status,meta:Object.freeze({...meta}) });
}
