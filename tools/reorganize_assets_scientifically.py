import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"h:\GOOGLE DRIVER\GAME"
assets_dir = os.path.join(base_dir, "assets")

print("=== BẮT ĐẦU TÁI CƠ CẤU ASSETS KHOA HỌC ===")

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

# 1. Tạo các thư mục chuẩn hóa
new_dirs = [
    "characters/player",
    "characters/npc/portraits",
    "characters/npc/animated/dai_han_dao",
    "characters/npc/animated/tho_san_riu",
    "characters/npc/animated/phu_nhan_xinh_dep",
    "characters/npc/animated/tien_phong_dao_cot",
    "characters/npc/animated/truong_lao_tong_mon",
    "characters/npc/animated/village",
    "characters/npc/flying",
    "characters/enemies/ground",
    "characters/enemies/flying",
    "characters/vehicles/horse_carriage",
    "environment/maps",
    "icons/categories",
    "icons/currencies",
    "icons/items",
    "icons/manuals",
    "icons/materials",
    "icons/pills",
    "icons/skills",
    "icons/stages",
    "icons/ui",
    "ui",
    "vfx/elemental/earth",
    "vfx/elemental/fire",
    "vfx/elemental/lightning",
    "vfx/elemental/metal",
    "vfx/elemental/physical",
    "vfx/elemental/water",
    "vfx/elemental/wind",
    "vfx/elemental/wood",
    "vfx/sword",
    "vfx/skills",
    "vfx/ultimates",
    "vfx/atlas"
]

for d in new_dirs:
    ensure_dir(os.path.join(assets_dir, d))

def move_file_or_dir(src, dst):
    if not os.path.exists(src):
        return False
    ensure_dir(os.path.dirname(dst))
    if os.path.exists(dst):
        if os.path.isdir(dst):
            shutil.rmtree(dst)
        else:
            os.remove(dst)
    shutil.move(src, dst)
    return True

def copy_or_move_contents(src_dir, dst_dir):
    if not os.path.exists(src_dir):
        return 0
    ensure_dir(dst_dir)
    count = 0
    for item in os.listdir(src_dir):
        s = os.path.join(src_dir, item)
        d = os.path.join(dst_dir, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.move(s, d)
        else:
            if os.path.exists(d):
                os.remove(d)
            shutil.move(s, d)
        count += 1
    return count

# Step 1: Move Player files
print("\n1. Di chuyển Player assets...")
player_src = os.path.join(assets_dir, "player")
for f in ["player_idle.png", "player_run.png", "player_attack.png", "player_fly.png", "flying_sword.png"]:
    sf = os.path.join(player_src, f)
    df = os.path.join(assets_dir, "characters/player", f)
    if os.path.exists(sf):
        move_file_or_dir(sf, df)
        print(f"  -> {f} to characters/player/{f}")

# Step 2: Move NPC Portraits
print("\n2. Di chuyển NPC Portraits...")
npc_src = os.path.join(assets_dir, "npc")
if os.path.exists(npc_src):
    for f in os.listdir(npc_src):
        if f.endswith(".png"):
            sf = os.path.join(npc_src, f)
            df = os.path.join(assets_dir, "characters/npc/portraits", f)
            move_file_or_dir(sf, df)
    print("  -> Đã di chuyển 16 portraits vào characters/npc/portraits/")

# Step 3: Move Animated NPCs
print("\n3. Di chuyển Animated NPCs...")
npc_models = {
    "player/NPC/Dai_Han_Dao": "characters/npc/animated/dai_han_dao",
    "player/NPC/Tho_San_Riu": "characters/npc/animated/tho_san_riu",
    "player/NPC/Phu_Nhan_Xinh_Dep": "characters/npc/animated/phu_nhan_xinh_dep",
    "player/NPC/Tien_Phong_Dao_Cot": "characters/npc/animated/tien_phong_dao_cot",
    "player/NPC/Truong_Lao_Tong_Mon": "characters/npc/animated/truong_lao_tong_mon",
    "player/NPC/Village": "characters/npc/animated/village",
}

for src_rel, dst_rel in npc_models.items():
    s_path = os.path.join(assets_dir, src_rel)
    d_path = os.path.join(assets_dir, dst_rel)
    if os.path.exists(s_path):
        copy_or_move_contents(s_path, d_path)
        print(f"  -> {src_rel} to {dst_rel}")

# Step 4: Move Flying NPCs
print("\n4. Di chuyển Flying NPCs...")
fly_npc_src = os.path.join(assets_dir, "player/NPC/FLY NPC")
fly_npc_dst = os.path.join(assets_dir, "characters/npc/flying")
if os.path.exists(fly_npc_src):
    count = copy_or_move_contents(fly_npc_src, fly_npc_dst)
    print(f"  -> Đã di chuyển {count} thư mục Flying NPC vào characters/npc/flying/")

# Step 5: Move Enemies (Ground & Flying)
print("\n5. Di chuyển Enemies...")
enemies_src = os.path.join(assets_dir, "enemies")
enemies_ground_dst = os.path.join(assets_dir, "characters/enemies/ground")
if os.path.exists(enemies_src):
    count = copy_or_move_contents(enemies_src, enemies_ground_dst)
    print(f"  -> Đã di chuyển {count} quái ground vào characters/enemies/ground/")

fly_enemies_src = os.path.join(assets_dir, "ENEMI FLY")
fly_enemies_dst = os.path.join(assets_dir, "characters/enemies/flying")
if os.path.exists(fly_enemies_src):
    count = copy_or_move_contents(fly_enemies_src, fly_enemies_dst)
    print(f"  -> Đã di chuyển {count} quái flying vào characters/enemies/flying/")

# Step 6: Move Vehicles
print("\n6. Di chuyển Vehicles...")
veh_src = os.path.join(assets_dir, "vehicles/Horse_Carriage_4Horses")
veh_dst = os.path.join(assets_dir, "characters/vehicles/horse_carriage")
if os.path.exists(veh_src):
    copy_or_move_contents(veh_src, veh_dst)
    print("  -> Đã di chuyển vehicles vào characters/vehicles/horse_carriage/")

# Step 7: Move VFX
print("\n7. Tái cơ cấu VFX...")
vfx_elems = ["earth", "fire", "lightning", "metal", "physical", "water", "wind", "wood"]
for elem in vfx_elems:
    s_elem = os.path.join(assets_dir, f"vfx/{elem}")
    d_elem = os.path.join(assets_dir, f"vfx/elemental/{elem}")
    if os.path.exists(s_elem):
        copy_or_move_contents(s_elem, d_elem)
        print(f"  -> vfx/{elem} to vfx/elemental/{elem}")

# VFX atlas files
for f in ["vfx_atlas.png", "luyen_khi_9he_7frame.png", "frame_7.png"]:
    sf = os.path.join(assets_dir, "vfx", f)
    df = os.path.join(assets_dir, "vfx/atlas", f)
    if os.path.exists(sf):
        move_file_or_dir(sf, df)
        print(f"  -> vfx/{f} to vfx/atlas/{f}")

# Step 8: Environment Maps
print("\n8. Tái cơ cấu Environment Maps...")
env_src = os.path.join(assets_dir, "environment")
env_maps_dst = os.path.join(assets_dir, "environment/maps")
ensure_dir(env_maps_dst)
if os.path.exists(env_src):
    for f in os.listdir(env_src):
        sf = os.path.join(env_src, f)
        df = os.path.join(env_maps_dst, f)
        if os.path.isfile(sf) and f.endswith(('.png', '.jpg')):
            # Copy to maps/ while keeping copy in environment/ for max safety
            shutil.copyfile(sf, df)
            print(f"  -> environment/{f} synced to environment/maps/{f}")

# Clean up empty legacy folders
print("\n9. Dọn dẹp thư mục rác cũ...")
cleanup_dirs = [
    os.path.join(assets_dir, "player/NPC/FLY NPC"),
    os.path.join(assets_dir, "player/NPC"),
    os.path.join(assets_dir, "player"),
    os.path.join(assets_dir, "npc"),
    os.path.join(assets_dir, "enemies"),
    os.path.join(assets_dir, "ENEMI FLY"),
    os.path.join(assets_dir, "vehicles/Horse_Carriage_4Horses"),
    os.path.join(assets_dir, "vehicles"),
]

for d in cleanup_dirs:
    if os.path.exists(d):
        try:
            if len(os.listdir(d)) == 0:
                os.rmdir(d)
                print(f"  -> Đã xóa thư mục trống: {d}")
            else:
                shutil.rmtree(d)
                print(f"  -> Đã dọn dẹp thư mục cũ: {d}")
        except Exception as e:
            print(f"  [Notice] {d}: {e}")

# Also clean up empty vfx element folders at root of vfx
for elem in vfx_elems:
    old_elem_d = os.path.join(assets_dir, f"vfx/{elem}")
    if os.path.exists(old_elem_d):
        try:
            shutil.rmtree(old_elem_d)
        except Exception:
            pass

print("\n=== HOÀN THÀNH TÁI CƠ CẤU ASSETS ===")
