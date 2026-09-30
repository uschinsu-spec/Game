export function splitFaction(parent,{childIds=[],reason='civil_war',cycle=0}={}){return Object.freeze({type:'split',parentId:parent.id,childIds:Object.freeze([...childIds]),reason,cycle,lineageRootId:parent.meta?.lineageRootId||parent.id});}
export function mergeFactions(factionIds,newFactionId,{reason='alliance',cycle=0}={}){return Object.freeze({type:'merge',sourceFactionIds:Object.freeze([...factionIds]),newFactionId,reason,cycle});}
export function reviveFaction(factionId,{sponsorFactionId=null,cycle=0}={}){return Object.freeze({type:'revival',factionId,sponsorFactionId,cycle});}
