export function createGameMapManifestAdapter({worldAdapter,getWorldNodeForMap=null}={}){
 function nodeIdFrom(value){if(value&&typeof value==='object')return value.locationNodeId||value.nodeId||value.geography?.nodeId||null;if(getWorldNodeForMap){const n=getWorldNodeForMap(value);if(n)return n.id;}return typeof value==='string'?value:null;}
 function resolveJurisdiction(value){const nodeId=nodeIdFrom(value);return nodeId?worldAdapter?.resolveJurisdictionForNode?.(nodeId):null;}
 function resolveTerritory(value){const nodeId=nodeIdFrom(value);return nodeId?worldAdapter?.getTerritoryForWorldNode?.(nodeId):null;}
 return Object.freeze({resolveMasterMap:value=>value&&typeof value==='object'?value:null,resolveJurisdiction,resolveJurisdictionId:value=>resolveJurisdiction(value)?.id||null,resolveTerritory,resolveTerritoryId:value=>resolveTerritory(value)?.id||null,resolveWorldNodeId:nodeIdFrom});
}
