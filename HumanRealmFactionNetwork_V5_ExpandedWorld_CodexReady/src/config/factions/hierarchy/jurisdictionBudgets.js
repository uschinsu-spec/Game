export const JURISDICTION_BUDGETS = Object.freeze({
  realm:Object.freeze({local:0,presence:24}),
  continent:Object.freeze({local:8,presence:18}),
  great_region:Object.freeze({local:10,presence:14}),
  province:Object.freeze({local:14,presence:12}),
  nation:Object.freeze({local:10,presence:9}),
  commandery:Object.freeze({local:8,presence:8}),
  city_territory:Object.freeze({local:7,presence:7}),
  settlement:Object.freeze({local:4,presence:5})
});
export function getJurisdictionBudget(type,importance=1){const b=JURISDICTION_BUDGETS[type]||JURISDICTION_BUDGETS.settlement;const mul=Math.max(.5,Math.min(1.8,Number(importance)||1));return Object.freeze({local:Math.max(1,Math.round(b.local*mul)),presence:Math.max(2,Math.round(b.presence*mul))});}
