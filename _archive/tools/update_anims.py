with open('src/main.js', 'r', encoding='utf-8') as f:
    c = f.read()

old_anims = """  ['goblin','boar','bat'].forEach(t=>{
   make('e_'+t+'_idle',t,0,1,4);
   make('e_'+t+'_run',t,2,5,8);
   make('e_'+t+'_attack',t,6,9,10,0);
   make('e_'+t,t,2,5,8);
  });"""

new_anims = """  for(let i=1;i<=8;i++){
   const t='enemy_'+i;
   make('e_'+t+'_idle',t,0,1,4);
   make('e_'+t+'_run',t,2,5,8);
   make('e_'+t+'_attack',t,6,9,10,0);
   make('e_'+t,t,2,5,8);
  }"""

if old_anims in c:
    c = c.replace(old_anims, new_anims)
else:
    # Try with single space indentation
    import re
    c = re.sub(r"\[\s*'goblin'\s*,\s*'boar'\s*,\s*'bat'\s*\]\.forEach\([^}]+\}\s*\);", new_anims, c)

old_preload = """     for(let i=1;i<=8;i++){this.load.spritesheet('enemy_'+i,A+'enemy_'+i+'.png',{frameWidth:128,frameHeight:128});}
   this.load.spritesheet('boss',A+'enemy_6.png',{frameWidth:128,frameHeight:128});"""

new_preload = """  ['enemy_1','enemy_2','enemy_3','enemy_4','enemy_5','enemy_6','enemy_7','enemy_8'].forEach(k=>this.load.spritesheet(k,A+k+'.png',{frameWidth:128,frameHeight:128}));
  this.load.spritesheet('boss',A+'enemy_6.png',{frameWidth:128,frameHeight:128});"""

c = c.replace(old_preload, new_preload)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated createAnimations and preload for all 8 enemy types!")
