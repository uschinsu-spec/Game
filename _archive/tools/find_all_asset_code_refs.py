import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"h:\GOOGLE DRIVER\GAME"

file_patterns = [
    re.compile(r'([\'"`])(\.?\/?assets\/[^\'"\n`]+)\1'),
    re.compile(r'([\'"`])([a-zA-Z0-9_\-\/]+\.(?:png|jpg|jpeg|webp|json|wav|mp3|ogg))\1'),
]

results = []

for root, dirs, files in os.walk(base_dir):
    if any(k in root for k in ['.git', 'node_modules', '.gemini', 'tmp']):
        continue
    for f in files:
        if f.endswith(('.js', '.html', '.css', '.json', '.py', '.md')):
            path = os.path.join(root, f)
            rel_path = os.path.relpath(path, base_dir).replace('\\', '/')
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    lines = fp.readlines()
                for line_no, line in enumerate(lines, 1):
                    for pat in file_patterns:
                        for m in pat.finditer(line):
                            val = m.group(2)
                            if 'assets' in val or any(val.endswith(ext) for ext in ['.png', '.jpg', '.webp']):
                                results.append({
                                    'file': rel_path,
                                    'line_no': line_no,
                                    'line': line.strip(),
                                    'ref': val
                                })
            except Exception as e:
                print(f"Error reading {rel_path}: {e}")

print(f"Total matching asset references in code: {len(results)}")
by_file = {}
for r in results:
    by_file.setdefault(r['file'], []).append(r)

for f, items in sorted(by_file.items()):
    print(f"\n--- {f} ({len(items)} refs) ---")
    for item in items[:15]:
        print(f"  L{item['line_no']}: {item['ref']}  -->  {item['line'][:90]}")
    if len(items) > 15:
        print(f"  ... and {len(items) - 15} more lines")
