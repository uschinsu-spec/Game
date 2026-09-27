import os

file_path = 'src/main.js'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace all brute and elite textures with valid textures
code = code.replace("tiger:{tex:'brute'", "tiger:{tex:'boar'")
code = code.replace("brute:{tex:'brute'", "brute:{tex:'goblin'")
code = code.replace("brute_red:{tex:'brute'", "brute_red:{tex:'goblin'")
code = code.replace("demon_guard:{tex:'brute'", "demon_guard:{tex:'goblin'")
code = code.replace("thunder_guard:{tex:'brute'", "thunder_guard:{tex:'goblin'")
code = code.replace("ghost_guard:{tex:'brute'", "ghost_guard:{tex:'goblin'")
code = code.replace("celestial_guard:{tex:'elite'", "celestial_guard:{tex:'boss'")
code = code.replace("ice_golem:{tex:'elite'", "ice_golem:{tex:'boar'")
code = code.replace("elite_guard:{tex:'elite'", "elite_guard:{tex:'boss'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Safely replaced all invalid enemy texture keys in src/main.js!")
