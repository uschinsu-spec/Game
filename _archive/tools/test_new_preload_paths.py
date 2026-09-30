import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"h:\GOOGLE DRIVER\GAME"
assets_dir = os.path.join(base_dir, "assets")

# Check all paths that MainScene.js will load
loads_to_test = []

# Maps
loads_to_test.append("environment/maps/IMG_7504.png")
loads_to_test.append("environment/maps/valley_panorama.png")
loads_to_test.append("environment/maps/van_moc_sam_lam.png")

# Player
loads_to_test.append("characters/player/flying_sword.png")
loads_to_test.append("characters/player/player_idle.png")
loads_to_test.append("characters/player/player_run.png")
loads_to_test.append("characters/player/player_attack.png")
loads_to_test.append("characters/player/player_fly.png")

# Enemies
for i in range(1, 17):
    loads_to_test.append(f"characters/enemies/ground/enemy_{i}/idle_0.png")
    loads_to_test.append(f"characters/enemies/ground/enemy_{i}/idle_1.png")
    for r in range(4):
        loads_to_test.append(f"characters/enemies/ground/enemy_{i}/run_{r}.png")
    for a in range(4):
        loads_to_test.append(f"characters/enemies/ground/enemy_{i}/attack_{a}.png")

# Animated NPC (Dai Han Dao, Tho San Riu)
for f in range(1, 9):
    pad = f"{f:02d}"
    loads_to_test.append(f"characters/npc/animated/dai_han_dao/dai_han_3d_idle_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/dai_han_dao/dai_han_3d_run_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/dai_han_dao/dai_han_3d_attack_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/dai_han_dao/dai_han_3d_fly_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/tho_san_riu/tho_san_riu_3d_idle_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/tho_san_riu/tho_san_riu_3d_run_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/tho_san_riu/tho_san_riu_3d_attack_{pad}.png")
    loads_to_test.append(f"characters/npc/animated/tho_san_riu/tho_san_riu_3d_fly_{pad}.png")

# NPC Portraits
for n in range(1, 17):
    loads_to_test.append(f"characters/npc/portraits/npc_{n}.png")

# Icons
for i in range(10):
    loads_to_test.append(f"icons/skills/skill_{i}.png")
for k in range(1, 6):
    loads_to_test.append(f"icons/skills/unique/kiem_{k}.png")
for i in range(18):
    loads_to_test.append(f"icons/items/item_{i}.png")
for m in ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore']:
    loads_to_test.append(f"icons/materials/{m}.png")
for h in range(1, 8):
    loads_to_test.append(f"icons/materials/herb_{h}.png")
for c in ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top']:
    loads_to_test.append(f"icons/currencies/{c}.png")
for p in ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden']:
    loads_to_test.append(f"icons/pills/{p}.png")
for m in ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than']:
    loads_to_test.append(f"icons/manuals/{m}.png")
for i in range(12):
    loads_to_test.append(f"icons/stages/stage_{i}.png")
for icon in ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest']:
    loads_to_test.append(f"icons/ui/{icon}.png")
for icon in ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold']:
    loads_to_test.append(f"icons/ui/xianxia_{icon}_bright.png")

# VFX Elemental
elem_dirs = {'hoa': 'fire', 'loi': 'lightning', 'kim': 'metal', 'thuy': 'water', 'phong': 'wind', 'moc': 'wood', 'tho': 'earth', 'ly': 'physical'}
for elem, d in elem_dirs.items():
    loads_to_test.append(f"vfx/elemental/{d}/proj_1.png")
    for f in range(8):
        loads_to_test.append(f"vfx/elemental/{d}/frame_{f}.png")
    loads_to_test.append(f"vfx/elemental/{d}/proj_2.png")
    loads_to_test.append(f"vfx/elemental/{d}/array_3.png")
    loads_to_test.append(f"vfx/elemental/{d}/swarm_4.png")
    loads_to_test.append(f"vfx/elemental/{d}/colossus_5.png")
    loads_to_test.append(f"vfx/elemental/{d}/shockwave.png")
    loads_to_test.append(f"vfx/elemental/{d}/impact.png")

# Sword VFX
for i in range(8):
    loads_to_test.append(f"vfx/sword/kim_1_frame_{i}.png")
    loads_to_test.append(f"vfx/sword/kim_2_frame_{i}.png")
loads_to_test.append("vfx/sword/kim_3_frame_0.png")
loads_to_test.append("vfx/sword/tru_tien_shockwave.png")
loads_to_test.append("vfx/atlas/frame_7.png")
loads_to_test.append("vfx/sword/kiem_khi.png")
loads_to_test.append("vfx/sword/giant_tru_tien_sword.png")
loads_to_test.append("vfx/sword/vfx_loi.png")
loads_to_test.append("vfx/skills/vfx_heal.png")
loads_to_test.append("vfx/skills/vfx_shield.png")
loads_to_test.append("vfx/skills/vfx_speed.png")
loads_to_test.append("vfx/ultimates/vfx_divine.png")
loads_to_test.append("vfx/atlas/vfx_atlas.png")

missing = []
for rel in loads_to_test:
    full = os.path.join(assets_dir, rel)
    if not os.path.exists(full):
        missing.append(rel)

print(f"Tested {len(loads_to_test)} preload files.")
if missing:
    print(f"❌ Missing {len(missing)} files:")
    for m in missing:
        print("  -", m)
else:
    print("✅ TẤT CẢ 100% CÁC FILE PRELOAD ĐỀU TỒN TẠI HOÀN HẢO TRÊN Ổ ĐĨA!")
