import { contractId } from '../core/factionIds.js';

export const CONTRACT_TYPES = Object.freeze(['escort','mercenary','guestElder','protector','supplier','merchant','assassin','spy','bountyHunter']);

export function createFactionContract({ playerId='player',factionId,type,serial=0,startCycle=0,duration=1,payment={},obligations=[],penalties=[],secrecy=0,status='active' }) {
  if(!CONTRACT_TYPES.includes(type)) throw new Error(`Unknown contract type ${type}`);
  return Object.freeze({id:contractId(playerId,factionId,type,serial),playerId,factionId,type,startCycle,duration,payment:Object.freeze({...payment}),obligations:Object.freeze([...obligations]),penalties:Object.freeze([...penalties]),secrecy:Math.max(0,Math.min(1,secrecy)),status});
}

export const isContractExpired=(contract,currentCycle)=>contract.status!=='active'||currentCycle>=contract.startCycle+contract.duration;
