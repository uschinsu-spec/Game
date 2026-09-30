const VERBS=['bảo vệ','hộ tống','điều tra','thu thập','trấn áp','phá trận','giải cứu','săn đuổi','thương lượng'];
export function questHooksFromFaction({faction,territoryId,event=null,assets=[]}){
  const targets=[...assets.map(a=>a.worldNodeId),territoryId].filter(Boolean);
  const base=faction?.name||'thế lực địa phương';
  return Object.freeze(Array.from({length:Math.min(6,Math.max(3,targets.length+2))},(_,i)=>Object.freeze({
    id:`questhook.${faction?.id||'unknown'}.${territoryId}.${i}`,
    title:`${VERBS[i%VERBS.length]} cho ${base}`,
    factionId:faction?.id||null,territoryId,target:targets[i%targets.length]||territoryId,eventId:event?.id||null,
    type:event?.type||'faction_job'
  })));
}
