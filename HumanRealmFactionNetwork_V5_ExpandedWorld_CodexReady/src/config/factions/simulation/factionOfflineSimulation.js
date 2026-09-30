export function simulateOffline({elapsedCycles=0,maxMajorEvents=8,aggregateTick}){
  const cycles=Math.max(0,Math.floor(elapsedCycles));
  if(!cycles||typeof aggregateTick!=='function')return Object.freeze({cycles:0,events:[]});
  const bucket=Math.max(1,Math.ceil(cycles/24));
  const events=[];
  for(let c=0;c<cycles;c+=bucket){ const result=aggregateTick({from:c,to:Math.min(cycles,c+bucket),compressed:true})||{}; for(const e of result.events||[])if(events.length<maxMajorEvents)events.push(e); }
  return Object.freeze({cycles,events:Object.freeze(events)});
}
