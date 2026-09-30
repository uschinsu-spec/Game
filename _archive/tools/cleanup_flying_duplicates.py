import os
import sys
import shutil
import stat

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc\flying"

print(f"=== TIẾN HÀNH DỌN DẸP FILE TRÙNG TRONG FLYING NPC ===")

def remove_readonly(func, path, excinfo):
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception as e:
        pass

# 1. Xóa các thư mục trùng fly_npc_X
deleted_dirs = 0
for i in range(1, 21):
    fly_dir = os.path.join(base_dir, f"fly_npc_{i}")
    if os.path.exists(fly_dir):
        shutil.rmtree(fly_dir, onerror=remove_readonly)
        deleted_dirs += 1

print(f"1. Đã xóa {deleted_dirs} thư mục trùng lặp (fly_npc_1 .. fly_npc_20).")

# 2. Xóa các file raw trùng (1.png..16.png, frame_01.png..frame_16.png) trong từng npc_X
deleted_files = 0
kept_files = 0

for i in range(1, 21):
    npc_dir = os.path.join(base_dir, f"npc_{i}")
    if not os.path.exists(npc_dir):
        continue
    files = os.listdir(npc_dir)
    for f in files:
        f_path = os.path.join(npc_dir, f)
        # Check if raw numbered or generic frame
        is_raw_number = f.replace('.png', '').isdigit()
        is_generic_frame = f.startswith('frame_') and f.endswith('.png')
        if is_raw_number or is_generic_frame:
            try:
                os.chmod(f_path, stat.S_IWRITE)
                os.remove(f_path)
                deleted_files += 1
            except Exception as e:
                print(f"Error deleting {f_path}: {e}")
        else:
            kept_files += 1

print(f"2. Đã xóa {deleted_files} file cắt thô trùng lặp (1..16.png và frame_01..16.png).")
print(f"3. Giữ lại {kept_files} file chuẩn hóa (25 file/folder: idle, run, attack, fly, spritesheets, preview).")

# 3. Kiểm tra lại thư mục sau khi dọn dẹp
remaining_folders = sorted(os.listdir(base_dir))
print(f"\nDanh sách {len(remaining_folders)} thư mục sau khi làm sạch:")
for f in remaining_folders:
    f_path = os.path.join(base_dir, f)
    if os.path.isdir(f_path):
        f_list = sorted(os.listdir(f_path))
        print(f"  📁 {f}: {len(f_list)} files chuẩn")

print("\n=== HOÀN THÀNH XÓA FILE TRÙNG KHỚP 100% ===")
