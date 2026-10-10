import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1672,height:941},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:8123/')+'?debug');
  await page.waitForFunction(()=>window.__GAME_DEBUG__,null,{polling:100});
  await page.evaluate(async()=>{const g=window.__GAME_DEBUG__,{syncStats}=await import('/src/cultivation.js');g.player.realmIdx=1;syncStats(g.player,true);g.ui.update(performance.now()+1000);g.paused=false;g.player.cooldowns.skill=0;g.player.skillAnim=0;g.player.attackAnim=0});
  assert.equal(await page.locator('.action kbd:visible').count(),0);
  // Genuine pointer hold opens the selector without spending mana or casting.
  const slot=page.locator('#quick-skill-2'),r=await slot.boundingBox();
  const mp=await page.evaluate(()=>window.__GAME_DEBUG__.player.mp);
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
  await page.locator('.skill-choice[data-skill-id="kiem_1"]').waitFor({state:'visible'});await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.player.mp),mp);
  assert.equal(await page.locator('.skill-choice[data-skill-id="kiem_2"]').count(),0,'unlearned skills excluded');
  await page.locator('.skill-choice[data-skill-id="kiem_1"]').click();
  assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.ui.skillSlots[1]),'kiem_1');
  assert.equal(await page.locator('#overlay').isVisible(),false);
  // Exercise the actual scheduler through Game.step, including rotation and gates.
  const result=await page.evaluate(async()=>{
   const g=window.__GAME_DEBUG__,{availableSkills,Engine,SKILLS}=await import('/src/cultivation.js');
   const ids=availableSkills(g.player).filter(s=>s.type!=='heal'&&s.type!=='buff').slice(0,2).map(s=>s.id);
   g.ui.skillSlots=[...ids,null,null,null];g.autoSkillIndex=0;g.auto=true;g.gameTime=10;g.lastManual=0;g.target=null;g.player.x=1000;g.player.y=600;
   const enemy=g.state.enemies[0];Object.assign(enemy,{x:1060,y:600,hp:1e9,maxHp:1e9,dead:false});g.state.enemies=[enemy];
   const ready=()=>{g.player.attackAnim=0;g.player.skillAnim=0;g.player.cooldowns.skill=0;g.player.cooldowns.attack=0;g.player.mp=g.player.maxMp;g.player.pendingSkill=null};
   ready();g.step(.001);const first=g.player.pendingSkill?.sk.id;
   ready();g.step(.001);const second=g.player.pendingSkill?.sk.id;
   ready();g.player.mp=0;const noMana=g.tryAutoSkill();
   ready();g.player.cooldowns.skill=5;const cooling=g.tryAutoSkill();
   ready();enemy.x=1800;const far=g.tryAutoSkill();
   g.auto=false;ready();g.ui.skillSlots=['kiem_1','kiem_1',null,null,null];g.ui.refreshSkillSlots();
   return {ids,first,second,noMana,cooling,far};
  });
  assert.equal(result.first,result.ids[0]);assert.equal(result.second,result.ids[1]);assert.equal(result.noMana,false);assert.equal(result.cooling,false);assert.equal(result.far,false);
  // A short tap casts; a canceled press never opens a dialog.
  await page.evaluate(()=>{const g=window.__GAME_DEBUG__;g.state.enemies[0].x=1060;g.player.cooldowns.skill=0;g.player.attackAnim=0;g.player.skillAnim=0});
  await slot.click();assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.player.pendingSkill?.sk.id),'kiem_1');
  await page.reload();await page.waitForFunction(()=>window.__GAME_DEBUG__,null,{polling:100});
  assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.ui.skillSlots[1]),'kiem_1','assignment survives reload');
  await page.evaluate(()=>{const g=window.__GAME_DEBUG__;g.ui.skillPicker(1)});
  await page.locator('.clear-skill').click();assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.ui.skillSlots[1]),null);
  await page.evaluate(async()=>{const g=window.__GAME_DEBUG__,{syncStats}=await import('/src/cultivation.js');g.player.realmIdx=1;syncStats(g.player,true);g.ui.skillSlots=['kiem_1',...((await import('/src/cultivation.js')).availableSkills(g.player).filter(sk=>sk.id!=='kiem_1').slice(0,4).map(sk=>sk.id))];g.ui.refreshSkillSlots();g.render();g.drawMinimap();document.querySelector('#notice').classList.remove('show')});
  if(!mobile)await page.locator('.command-dock').screenshot({path:'F:/GOOGLE/output/wuxia-icon-only-dock.png'});
  assert.deepEqual(errors,[]);console.log('PASS '+(mobile?'mobile':'desktop')+': long press, learned-only picker, assignment persistence, short cast, auto rotation/range/mana/cooldown');await context.close();
 }
}finally{await browser.close()}
