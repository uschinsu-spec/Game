import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 for(const width of [1672,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:941},isMobile:width===390,hasTouch:width===390});const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  const url=(process.env.GAME_URL||'http://127.0.0.1:8123/')+'?debug';await page.goto(url);await page.waitForFunction(()=>window.__GAME_DEBUG__,null,{polling:100});
  const amounts=await page.evaluate(()=>{const g=window.__GAME_DEBUG__,p=g.player;g.paused=true;p.hp=10;p.mp=10;p.pills.hoi_huyet=5;p.pills.hoi_linh=5;p.cooldowns.heal=0;p.cooldowns.mana=0;g.ui.pillSlots={hp:"hoi_huyet",mp:"hoi_linh"};g.ui.refreshRecoveryPills();return {hp:p.maxHp,mp:p.maxMp}});
  // Allow input without advancing the world/regen while clicking.
  await page.evaluate(()=>{const g=window.__GAME_DEBUG__;g.step=()=>{};g.paused=false});
  await page.locator('#heal-btn').click();
  const hp=await page.evaluate(()=>{const p=window.__GAME_DEBUG__.player;return {hp:p.hp,mp:p.mp,count:p.pills.hoi_huyet}});
  assert.equal(hp.hp,Math.min(amounts.hp,10+Math.floor(amounts.hp*.32)));assert.equal(hp.mp,10);assert.equal(hp.count,4);
  await page.locator('#mana-btn').click();const mp=await page.evaluate(()=>{const p=window.__GAME_DEBUG__.player;return {mp:p.mp,count:p.pills.hoi_linh}});assert.equal(mp.mp,Math.min(amounts.mp,10+Math.floor(amounts.mp*.32)));assert.equal(mp.count,4);
  const guards=await page.evaluate(()=>{const g=window.__GAME_DEBUG__,p=g.player;const cooling=g.useRecoveryPill('mp');p.cooldowns.mana=0;p.mp=p.maxMp;const full=g.useRecoveryPill('mp');p.mp=0;p.pills.hoi_linh=0;const empty=g.useRecoveryPill('mp');p.pills.hoi_linh=4;g.save();return {cooling,full,empty}});assert.deepEqual(guards,{cooling:false,full:false,empty:false});
  const h=await page.locator('#heal-btn').boundingBox(),m=await page.locator('#mana-btn').boundingBox();assert.ok(m.x>h.x&&Math.abs(m.y-h.y)<1,'HP and MP adjacent');
  await page.locator('#dock-toggle').click();assert.equal(await page.locator('#command-dock').isVisible(),false);assert.equal(await page.locator('#dock-toggle').isVisible(),true);assert.equal(await page.locator('#auto-btn').isVisible(),true);
  await page.reload();await page.waitForFunction(()=>window.__GAME_DEBUG__,null,{polling:100});assert.equal(await page.locator('#command-dock').isVisible(),false);assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.player.pills.hoi_linh),4);assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.player.pills.hoi_huyet),4);
  await page.locator('#dock-toggle').click();assert.equal(await page.locator('#command-dock').isVisible(),true);
  await page.locator('#bag-btn').click();assert.ok(await page.getByRole('button',{name:'Luyện Hồi Linh Đan · 10 Linh Thạch',exact:true}).isVisible());await page.locator('#resume-btn').click();
  assert.deepEqual(errors,[]);console.log('PASS recovery UI '+width+': adjacent pills, HP/MP recovery, inventory, cooldown/full/empty gates, persisted hide/show and refill access');await context.close();
 }
}finally{await browser.close()}
