import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"h:\GOOGLE DRIVER\GAME\assets"

def inspect_dir(path, depth=0, max_depth=3):
    if depth > max_depth:
        return
    indent = "  " * depth
    try:
        entries = sorted(os.listdir(path))
    except Exception as e:
        print(f"{indent}[Error]: {e}")
        return

    dirs = [e for e in entries if os.path.isdir(os.path.join(path, e))]
    files = [e for e in entries if os.path.isfile(os.path.join(path, e))]
    
    dir_name = os.path.basename(path)
    print(f"{indent}📁 {dir_name}/ ({len(files)} files, {len(dirs)} subdirs)")
    if files and depth >= 2:
        sample = files[:5]
        print(f"{indent}   📄 Sample: {', '.join(sample)}{'...' if len(files) > 5 else ''}")
    elif files and len(files) <= 10:
        print(f"{indent}   📄 Files: {', '.join(files)}")
    elif files:
        print(f"{indent}   📄 Files ({len(files)}): {', '.join(files[:6])}...")

    for d in dirs:
        inspect_dir(os.path.join(path, d), depth + 1, max_depth)

inspect_dir(base_dir, 0, 4)
