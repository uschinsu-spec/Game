import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
try{
 for(const [name,width,height,mobile] of [['desktop',1672,941,false],['mobile',390,844,true],['landscape',844,390,true],['narrow',320,740,true],['tablet',768,1024,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:8000/')+'?debug');
  await page.waitForFunction(()=>window.__GAME_DEBUG__,null,{polling:100});
  await page.evaluate(()=>{const g=window.__GAME_DEBUG__;g.player.x=1050;g.player.y=650;g.render();g.drawMinimap();g.ui.update(performance.now()+1000);document.querySelector('#notice').classList.remove('show')});
  const layout=await page.evaluate(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect();const hud=rect('.hud'),map=rect('.mapbox');
   const buttons=[...document.querySelectorAll('.command-dock button')].map(el=>{const r=el.getBoundingClientRect();return {id:el.id,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}});
   const dock=rect('.command-dock');return {dock:{top:dock.top,height:dock.height},buttons,topOverlap:hud.right>map.left&&hud.bottom>map.top,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(layout.topOverlap,false,name+' HUD and minimap do not overlap');assert.equal(layout.overflow,false);
  for(const b of layout.buttons){assert.ok(b.left>=0&&b.right<=width&&b.top>=0&&b.bottom<=height,name+' '+b.id+' is on screen');assert.ok(b.width>=32&&b.height>=44,name+' touch target '+b.id)}
  if(width>700)for(const b of layout.buttons.filter(b=>!b.id.match(/character|bag|cultivation|menu|settings/))){assert.ok(b.top>=layout.dock.top+layout.dock.height*.31,name+' '+b.id+' below upper frame rail');assert.ok(b.bottom<=layout.dock.top+layout.dock.height*.83,name+' '+b.id+' above lower frame rail')} 
  assert.equal(await page.locator('#quick-skill-2').isDisabled(),false);
  for(const [id,title] of [['character-btn','Nhân vật'],['bag-btn','Hành trang'],['cultivation-btn','Tu luyện'],['menu-btn','Vạn Mộc Sâm Lâm']]){
   await page.locator('#'+id).click();assert.equal(await page.locator('#dialog-title').textContent(),title);assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.paused),true);await page.locator('#resume-btn').click();
  }
  await page.locator('#settings-btn').click();await page.locator('.settings-row input').first().uncheck();assert.equal(await page.locator('.mapbox').isVisible(),false);await page.locator('.settings-row input').first().check();await page.locator('.settings-row input').nth(1).uncheck();assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.showDamageNumbers),false);await page.locator('.settings-row input').nth(1).check();await page.locator('#resume-btn').click();
  await page.locator('#auto-btn').click();assert.equal(await page.locator('#auto-btn').getAttribute('aria-pressed'),'true');await page.locator('#auto-btn').click();
  await page.evaluate(async()=>{const {syncStats}=await import('/src/cultivation.js');const g=window.__GAME_DEBUG__;g.player.realmIdx=28;syncStats(g.player,true);g.ui.update(performance.now()+5000)});
  assert.equal(await page.locator('#quick-skill-2').isDisabled(),false);
  await page.keyboard.press('Digit1');assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.player.selectedSkillId),'kiem_2');
  await page.evaluate(async()=>{const {syncStats}=await import('/src/cultivation.js');const g=window.__GAME_DEBUG__;g.player.realmIdx=0;g.player.selectedSkillId='kiem_1';g.auto=false;g.player.cooldowns.skill=0;g.player.attackAnim=0;g.player.skillAnim=0;document.activeElement?.blur();syncStats(g.player,true);g.ui.update(performance.now()+10000);g.render();g.drawMinimap();document.querySelector('#notice').classList.remove('show')});
  await page.mouse.move(width/2, height/2);
  if(process.env.SCREENSHOT_DIR){await page.screenshot({path:process.env.SCREENSHOT_DIR+'/wuxia-ui-'+name+'.png'});if(name==='desktop')await page.locator('.command-dock').screenshot({path:process.env.SCREENSHOT_DIR+'/wuxia-dock-fixed.png'})}
  assert.deepEqual(errors,[]);console.log('PASS wuxia UI '+name+': layout, live panels, settings, quick skills and asset loading');await context.close();
 }
}finally{await browser.close()}



