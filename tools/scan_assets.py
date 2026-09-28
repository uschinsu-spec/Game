import os
import re
import json

base_dir = r"h:\GOOGLE DRIVER\GAME"
assets_dir = os.path.join(base_dir, "assets")

# 1. Collect all real files in assets/
actual_assets = {}
for root, dirs, files in os.walk(assets_dir):
    for f in files:
        full = os.path.join(root, f)
        rel = os.path.relpath(full, base_dir).replace('\\', '/')
        actual_assets[rel] = full

print(f"Total actual asset files: {len(actual_assets)}")

# 2. Collect all references in codebase
pattern = re.compile(r'[\'"`](assets/[^\'"`]+)[\'"`]')

code_refs = {}
for root, dirs, files in os.walk(base_dir):
    if any(x in root for x in ['.git', 'node_modules', '.gemini', 'tmp']):
        continue
    for f in files:
        if f.endswith(('.js', '.html', '.json', '.py', '.css')):
            p = os.path.join(root, f)
            rel_p = os.path.relpath(p, base_dir).replace('\\', '/')
            try:
                with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    matches = pattern.findall(content)
                    if matches:
                        code_refs[rel_p] = matches
            except Exception as e:
                print(f"Error reading {rel_p}: {e}")

print(f"\nFiles referencing assets: {len(code_refs)}")
for f, refs in code_refs.items():
    print(f"[{f}] -> {len(refs)} references")

# Check which referenced assets exist or do not exist
all_refs = set()
for rlist in code_refs.values():
    for r in rlist:
        all_refs.add(r)

existing_refs = {r for r in all_refs if r in actual_assets}
missing_refs = {r for r in all_refs if r not in actual_assets}

print(f"\nTotal unique referenced paths: {len(all_refs)}")
print(f"Existing references: {len(existing_refs)}")
print(f"Missing references: {len(missing_refs)}")
if missing_refs:
    print("\nSample missing references:")
    for r in sorted(list(missing_refs))[:20]:
        print("  -", r)
