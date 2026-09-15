(()=>{'use strict';
const balance=Object.freeze({
  defenseK:100,
  resistanceMin:-0.75,
  resistanceMax:0.75,
  elementAdvantage:1.20,
  elementDisadvantage:0.85,
  combatExitDelay:5,
  playerRespawnDelay:1.5,
  playerRespawnInvulnerability:2,
  realmSuppression:Object.freeze({
    equalOrLower:Object.freeze({multiplier:1,lethalFloor:0}),
    plus1:Object.freeze({multiplier:.20,lethalFloor:1}),
    plus2:Object.freeze({multiplier:.05,lethalFloor:1}),
    plus3:Object.freeze({multiplier:.01,lethalFloor:1})
  })
});
const counters=Object.freeze({METAL:'WOOD',WOOD:'EARTH',EARTH:'WATER',WATER:'FIRE',FIRE:'METAL'});
window.GameCore=window.GameCore||{};
window.GameCore.combatBalance=balance;
window.GameCore.elementCounters=counters;
})();