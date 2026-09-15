(()=>{'use strict';
const WEATHER=['TRỜI QUANG','SƯƠNG MỎNG','GIÓ NÚI','MƯA LINH KHÍ'];
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0}
class WorldEnvironmentSystem{
 constructor({worldState=window.GameServices?.worldState,events=window.GameServices?.events,scheduler=window.GameServices?.scheduler}={}){Object.assign(this,{worldState,events,scheduler});const w=worldState.state;w.environment=w.environment||{epoch:Date.now(),cycleMinutes:48};this.state=w.environment;this.lastKey='';worldState.save?.('ENV_INIT');scheduler?.register?.('SLOW',()=>this.tick(),{owner:'WorldEnvironmentSystem',label:'world-weather-time'})}
 snapshot(zoneId){const cycle=Math.max(12,Number(this.state.cycleMinutes)||48),elapsed=(Date.now()-Number(this.state.epoch||Date.now()))/60000,day=(elapsed%cycle+cycle)%cycle,minutes=Math.floor(day/cycle*1440),hour=Math.floor(minutes/60),minute=minutes%60,period=hour<5?'ĐÊM':hour<11?'SÁNG':hour<14?'TRƯA':hour<18?'CHIỀU':hour<20?'HOÀNG HÔN':'ĐÊM',bucket=Math.floor(elapsed/6),weather=WEATHER[hash(`${zoneId||'world'}:${bucket}`)%WEATHER.length];return{hour,minute,period,weather,labelTime:`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`}}
 tick(){const zoneId=this.worldState.state.currentZoneId,s=this.snapshot(zoneId),k=`${zoneId}:${s.period}:${s.weather}`;if(k!==this.lastKey){this.lastKey=k;this.events?.emit?.('world:environmentChanged',{zoneId,...s})}}
 dispose(){this.scheduler?.unregisterOwner?.('WorldEnvironmentSystem')}
}
window.GameCore=window.GameCore||{};window.GameCore.WorldEnvironmentSystem=WorldEnvironmentSystem;
})();