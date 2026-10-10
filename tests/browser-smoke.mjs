// Optional: install Playwright separately, or set PLAYWRIGHT_MODULE to its entrypoint.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:'playwright');
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
try{
  for(const mobile of [false,true]){
    const context=await browser.newContext({
      viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
    await page.goto(`${process.env.GAME_URL||'http://127.0.0.1:8000/'}?debug`);
    await page.waitForFunction(()=>window.__GAME_DEBUG__);
    await page.evaluate(async()=>{
      const g=window.__GAME_DEBUG__;g.paused=true;
      if(document.getElementById('dash-btn'))throw Error('Unexpected DASH button');
      const first=g.mapId;
      if(!await g.travel())throw Error('Forward travel failed');
      const {syncStats}=await import('/src/cultivation.js');
      g.player.realmIdx=1;syncStats(g.player,true);g.player.x=1000;g.player.y=600;
      const e=g.state.enemies[0];Object.assign(e,{x:1240,y:600,hp:1e9,maxHp:1e9,dead:false});
      g.state.enemies=[e];g.player.mp=1;g.player.selectedSkillId='kiem_1';
      if(!g.skill()||g.player.mp!==0)throw Error('Skill failed');
      g.stepEffects(.15);g.render();g.drawMinimap();g.ui.update(performance.now()+1000);
      g.stepEffects(1);g.render();
      if(!g.state.effects.some(f=>f.type==='skillImpact'))throw Error('Impact missing');
      g.ui.cultivation();g.ui.close();
      if(!await g.travel('back')||g.mapId!==first)throw Error('Return travel failed');
      g.render();
    });
    if(mobile){
      const cdp=await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:480}]});
      assert.ok(await page.evaluate(()=>window.__GAME_DEBUG__.input.joyPointer!==null));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.equal(await page.evaluate(()=>window.__GAME_DEBUG__.input.joyPointer),null);
    }else{
      await page.keyboard.down('KeyD');
      assert.ok(await page.evaluate(()=>window.__GAME_DEBUG__.input.vector().active));
      await page.keyboard.up('KeyD');
    }
    assert.deepEqual(errors,[]);
    if(process.env.SCREENSHOT_DIR){
      await page.screenshot({path:`${process.env.SCREENSHOT_DIR}/refactor-${mobile?'mobile':'desktop'}.png`});
    }
    console.log(`PASS browser ${mobile?'mobile':'desktop'}: startup, rendering, skill, impact, UI, travel and input`);
    await context.close();
  }
}finally{await browser.close()}
