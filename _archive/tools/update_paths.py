with open('src/main.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("this.load.spritesheet('player_idle',A+'player.png'", "this.load.spritesheet('player_idle',A+'player_idle.png'")
c = c.replace("this.load.spritesheet('player_attack',A+'player_skill.png'", "this.load.spritesheet('player_attack',A+'player_attack.png'")

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('Successfully updated src/main.js to load player_idle.png and player_attack.png directly!')
