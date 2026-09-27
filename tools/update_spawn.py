with open('src/main.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'const count=16;for(let i=0;i<count;i++){const type=Phaser.Utils.Array.GetRandom(s.enemies),x=470+i*125+Phaser.Math.Between(-35,35),y=Phaser.Math.Between(FIELD.top+20,FIELD.bottom-20);this.spawnEnemy(type,x,y);}',
    'const count=16;for(let i=0;i<count;i++){const type=Phaser.Utils.Array.GetRandom(s.enemies),x=390+i*115+Phaser.Math.Between(-25,25),y=Phaser.Math.Between(FIELD.top+20,FIELD.bottom-20);this.spawnEnemy(type,x,y);}'
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated startStage spawn distance!')
