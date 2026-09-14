// Xianxia idle-adventure core: auto travel, auto battle, stages, boss gates,
// four-slot cultivation arts, offline cultivation and persistent progression.
(()=>{
 const SAVE='thanh-van-idle-v1',OFFLINE_CAP=12*3600;
 const state=Object.assign({stage:1,realm:0,layer:1,xp:0,stones:0,power:120,lastSeen:Date.now(),boss:false},JSON.parse(localStorage.getItem(SAVE)||'{}'));
 const realms=['Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Hợp Thể','Đại Thừa','Độ Kiếp','Phi Thăng'];
 const zones=['Thanh Vân Sơn','Trúc Hải','Vạn Yêu Cốc','Huyền Thiên Thành','Ma Vực','Thiên Kiếm Sơn'];
 const stageEl=document.getElementById('idleStage'),realmEl=document.getElementById('realmLabel'),lootEl=document.getElementById('idleLoot'),progress=document.getElementById('stageProgress'),bossBtn=document.getElementById('bossChallenge'),offline=document.getElementById('offlineReward');
 let encounter=0,battle=0,enemyHp=0,enemyMax=0,enemy=null,running=true;
 const save=()=>{state.lastSeen=Date.now();localStorage.setItem(SAVE,JSON.stringify(state));};
 function zone(){return zones[Math.floor((state.stage-1)/25)%zones.length]}
 function refresh(){stageEl.textContent=`${zone()} · ${state.stage}`;realmEl.textContent=`${realms[state.realm]} ${state.layer} tầng`;lootEl.textContent=`Tu vi ${Math.floor(state.xp).toLocaleString()} · Linh thạch ${Math.floor(state.stones).toLocaleString()}`;progress.style.width=`${encounter*10}%`;bossBtn.classList.toggle('ready',encounter>=10);}
 function cultivate(amount){state.xp+=amount;state.stones+=amount*.22;const need=160*(state.realm+1)*state.layer;if(state.xp>=need){state.xp-=need;state.layer++;if(state.layer>9){state.layer=1;state.realm=Math.min(realms.length-1,state.realm+1)}state.power*=1.16}refresh();}
 function offlineReward(){const now=Date.now(),seconds=Math.min(OFFLINE_CAP,Math.max(0,(now-(state.lastSeen||now))/1000));if(seconds<90)return;const xp=seconds*(.18+state.stage*.006);state.xp+=xp;state.stones+=xp*.2;offline.innerHTML=`<strong>Bế quan ${Math.floor(seconds/3600)}g ${Math.floor(seconds%3600/60)}p</strong><span>+${Math.floor(xp).toLocaleString()} Tu Vi</span><span>+${Math.floor(xp*.2).toLocaleString()} Linh Thạch</span><button>Nhận</button>`;offline.classList.add('show');offline.querySelector('button').onclick=()=>offline.classList.remove('show');}
 offlineReward();
 // Old manual controls are disabled: the party advances automatically like an idle MMORPG.
 const joy=document.getElementById('joystick'),skills=document.querySelector('.portrait-skills'),menu=document.getElementById('menuToggle');if(joy)joy.style.display='none';if(skills)skills.style.display='none';if(menu)menu.style.display='none';
 function findEnemy(){const list=scene.meshes.filter(m=>m.name==='Demon'&&m.isEnabled());return list.sort((a,b)=>BABYLON.Vector3.DistanceSquared(a.position,player.position)-BABYLON.Vector3.DistanceSquared(b.position,player.position))[0]||null;}
 function startBattle(){enemy=findEnemy();enemyMax=95+state.stage*16;enemyHp=enemyMax;battle=performance.now();running=false;state.boss=encounter>=9;if(enemy){enemy.metadata=enemy.metadata||{};enemy.metadata.hp=enemyHp;enemy.metadata.maxHp=enemyMax;}document.getElementById('targetPanel')?.classList.add('show');document.getElementById('targetName').textContent=state.boss?'Yêu Vương':'Yêu Thú';}
 function damage(d){enemyHp-=d;if(enemy){enemy.metadata.hp=enemyHp;const bar=document.getElementById('targetHp');if(bar)bar.style.width=`${Math.max(0,enemyHp/enemyMax*100)}%`;}if(enemyHp<=0){if(enemy)enemy.setEnabled(false);enemy=null;running=true;encounter++;cultivate(22+state.stage*3);if(encounter>=10){state.stage++;encounter=0;cultivate(80+state.stage*5)}document.getElementById('targetPanel')?.classList.remove('show');save();}}
 // Four cultivation arts fire in sequence; changing their order later becomes the boss-build layer.
 const arts=[{n:'Thanh Vân Kiếm',m:1.0},{n:'Hộ Thể Chân Khí',m:.72},{n:'Thiên Lôi Quyết',m:1.3},{n:'Vạn Kiếm Quy Tông',m:1.55}];let art=0,lastCast=0;
 const team=[];function makeDisciple(x,matl){const r=new BABYLON.TransformNode('IdleDisciple',scene);r.parent=player;r.position.set(x,0,.8+Math.abs(x)*.2);const b=BABYLON.MeshBuilder.CreateCylinder('DiscipleBody',{height:1.65,diameter:.48,tessellation:8},scene);b.parent=r;b.position.y=.83;b.material=matl;team.push(r);return r}makeDisciple(-1.15,blueMat);makeDisciple(1.15,goldMat);makeDisciple(0,whiteMat);
 bossBtn.onclick=()=>{if(encounter>=9&&!enemy)startBattle();};
 scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(.033,engine.getDeltaTime()/1000),now=performance.now();if(running){const facing=new BABYLON.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));player.position.addInPlace(facing.scale(2.15*dt));if(player.position.z<-88){player.position.z=62;scene.meshes.filter(m=>m.name==='Demon').forEach(m=>m.setEnabled(true));}if(!enemy&&now-battle>1800)startBattle();}else if(enemy&&now-lastCast>920){lastCast=now;const a=arts[art++%arts.length];damage(state.power*a.m*.24);const label=document.getElementById('autoArt');if(label)label.textContent=a.n;}
  camera.alpha=-player.rotation.y-Math.PI/2;camera.beta=1.08;camera.radius=18;camera.target.copyFrom(player.position.add(new BABYLON.Vector3(0,1.45,-6.8)));refresh();});
 setInterval(save,10000);addEventListener('pagehide',save);refresh();
})();