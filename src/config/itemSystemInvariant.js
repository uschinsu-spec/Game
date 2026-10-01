/** Bảo đảm GAME chỉ có đúng một item runtime V3. */
const EXPECTED_OWNER='ItemSystemV3';
export function assertSingleItemSystem(MainGameScene){
  const p=MainGameScene?.prototype,errors=[];
  if(!p)throw new Error('[ItemSystemInvariant] MainGameScene.prototype không tồn tại.');
  if(p.__itemSystemOwner!==EXPECTED_OWNER)errors.push(`Owner phải là ${EXPECTED_OWNER}, hiện tại ${String(p.__itemSystemOwner)}.`);
  if(p.__itemSystemV3Installed!==true)errors.push('ItemSystem V3 chưa được cài đặt.');
  for(const fn of ['addItem','removeItem','getItemQuantity','listOwnedItems','equipItem','unequipItem','useItem','craftItem','enhanceGear','socketCore','salvageGear']) if(typeof p[fn]!=='function')errors.push(`Thiếu ${fn}().`);
  if(errors.length)throw new Error(`[ItemSystemInvariant] ${errors.join(' ')}`);
  return Object.freeze({owner:EXPECTED_OWNER,singleRuntime:true,catalogStats:p.itemCatalogStats||{}});
}
