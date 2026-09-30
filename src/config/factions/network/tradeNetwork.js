export function createTradeRoute({ id, originTerritoryId, destinationTerritoryId, capacity=100, risk=0.2, distance=1, controllerFactionId=null, tax=0.05, security=0.5, resources=[] }) {
  return Object.freeze({ id, originTerritoryId,destinationTerritoryId,capacity:Number(capacity),risk:Math.max(0,Math.min(1,risk)),distance:Number(distance),controllerFactionId,tax:Math.max(0,Math.min(1,tax)),security:Math.max(0,Math.min(1,security)),resources:Object.freeze([...resources]),status:'open' });
}

export function effectiveRouteCapacity(route,{war=false,blockade=false,securityDelta=0}={}) {
  if(route.status!=='open'||blockade) return 0;
  const risk=Math.max(0,Math.min(1,route.risk+(war?.2:0)-securityDelta));
  return Math.max(0,Math.round(route.capacity*(1-risk)));
}
