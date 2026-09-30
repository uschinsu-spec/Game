with open('src/main.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update FIELD
c = c.replace(
    "const W=540,H=960,WORLD_W=2880,FIELD={left:42,right:WORLD_W-42,top:530,bottom:792};",
    "const W=540,H=960,WORLD_W=2880,FIELD={left:42,right:WORLD_W-42,top:620,bottom:840};"
)

# 2. Update createPlayer
c = c.replace(
    "this.player=this.physics.add.sprite(300,680,'player_idle',0).setScale(.65).setDepth(22);",
    "this.player=this.physics.add.sprite(300,740,'player_idle',0).setScale(.65).setDepth(22);"
)
c = c.replace(
    "this.playerShadow=this.add.ellipse(300,721,55,13,0x172d13,.27).setDepth(9);",
    "this.playerShadow=this.add.ellipse(300,772,48,12,0x172d13,.32).setDepth(9);"
)

# 3. Update startStage
c = c.replace(
    "this.player.setPosition(300,680);",
    "this.player.setPosition(300,740);"
)
c = c.replace(
    "this.spawnBoss(WORLD_W-300,650);",
    "this.spawnBoss(WORLD_W-300,720);"
)

# 4. Update shadow in update loop
c = c.replace(
    "this.playerShadow.setPosition(this.player.x,this.player.y+41);",
    "this.playerShadow.setPosition(this.player.x,this.player.y+32.5);"
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Ground baseline and player shadow positions calibrated successfully!")
