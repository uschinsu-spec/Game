with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Smooth Camera Follow
code = code.replace(
    "this.cameras.main.startFollow(this.player,true,.09,1);",
    "this.cameras.main.startFollow(this.player,true,0.08,0.04);this.cameras.main.setFollowOffset(0, -20);"
)

# 2. Add Shake Throttle & Only Shake on Heavy Hit / Criticals
code = code.replace(
    "this.updateHUD();this.cameras.main.shake(80,.0035);if(this.hp<=0)this.playerDeath();",
    "this.updateHUD();const now=this.time.now;if(dmg>=60&&(now-(this.lastShake||0)>900)){this.lastShake=now;this.cameras.main.shake(100,.0025);}if(this.hp<=0)this.playerDeath();"
)

# 3. Soften Ultimate and Sword Formation Shakes
code = code.replace(
    "this.cameras.main.shake(240,.006);",
    "this.cameras.main.shake(160,.003);"
)
code = code.replace(
    "this.cameras.main.shake(140,.004);",
    "this.cameras.main.shake(100,.0025);"
)
code = code.replace(
    "this.cameras.main.shake(260,.008);",
    "this.cameras.main.shake(180,.004);"
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Optimized camera follow and eliminated frequent screen shakes!")
