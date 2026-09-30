import os
import shutil

env_dir = r'H:\GOOGLE DRIVER\GAME\assets\environment'

# Source paths
src_map_0 = os.path.join(env_dir, 'IMG_7504.png')
src_map_1 = os.path.join(env_dir, 'valley_panorama.png')
src_map_2 = os.path.join(env_dir, 'van_moc_sam_lam.png')

# Target paths
target_map_0 = os.path.join(env_dir, 'map_0_thanh_van_thon.png')
target_map_1 = os.path.join(env_dir, 'map_1_thanh_van_ngoai_vi.png')
target_map_2 = os.path.join(env_dir, 'map_2_van_moc_sam_lam.png')

# 1. Copy to new organized names
if os.path.exists(src_map_0):
    shutil.copy2(src_map_0, target_map_0)
if os.path.exists(src_map_1):
    shutil.copy2(src_map_1, target_map_1)
if os.path.exists(src_map_2):
    shutil.copy2(src_map_2, target_map_2)

print("Created organized map panorama files.")

# 2. Delete maps subdirectory if exists
maps_subdir = os.path.join(env_dir, 'maps')
if os.path.exists(maps_subdir):
    shutil.rmtree(maps_subdir)
    print("Removed duplicate maps/ subdirectory.")

# 3. Clean up other redundant files in environment
files_to_remove = [
    'IMG_7504.png', 'THANH VAN THON.png', 'thanh_van_thon_panorama.png',
    'thanh_van_thon_village.png', 'valley_panorama.png', 'van_moc_sam_lam.png',
    'van_moc_sam_lam_960.png'
]

for f in files_to_remove:
    p = os.path.join(env_dir, f)
    if os.path.exists(p):
        os.remove(p)
        print(f"Removed unused/redundant file: {f}")

# 4. List remaining files
remaining = os.listdir(env_dir)
print(f"Environment directory organized cleanly. Remaining files: {remaining}")
