export function createEconomy(input={}) {
  return Object.freeze({ treasury:Number(input.treasury||0), income:Number(input.income||0), upkeep:Number(input.upkeep||0), taxIncome:Number(input.taxIncome||0), tradeIncome:Number(input.tradeIncome||0), resourceIncome:Number(input.resourceIncome||0), militaryExpense:Number(input.militaryExpense||0), researchExpense:Number(input.researchExpense||0), constructionExpense:Number(input.constructionExpense||0), debt:Number(input.debt||0) });
}

export function tickEconomy(econ, modifiers={}) {
  const gross=(econ.income+econ.taxIncome+econ.tradeIncome+econ.resourceIncome)*(modifiers.incomeMul??1);
  const expense=(econ.upkeep+econ.militaryExpense+econ.researchExpense+econ.constructionExpense)*(modifiers.expenseMul??1);
  let treasury=econ.treasury+gross-expense;
  let debt=econ.debt;
  if(treasury<0){ debt+=-treasury; treasury=0; }
  return createEconomy({...econ, treasury, debt});
}
