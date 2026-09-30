import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

path = r"h:\GOOGLE DRIVER\GAME\src\scenes\mixins\ModalMixin.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

method_pattern = re.compile(r'^\s\s([a-zA-Z0-9_]+)\s*\((.*?)\)\s*\{')
methods = []

for i, line in enumerate(lines):
    m = method_pattern.match(line)
    if m:
        methods.append((i + 1, m.group(1), m.group(2)))

print(f"Total lines in ModalMixin.js: {len(lines)}")
print(f"Total methods: {len(methods)}\n")

for idx, (line_no, name, args) in enumerate(methods):
    next_line = methods[idx + 1][0] if idx + 1 < len(methods) else len(lines)
    length = next_line - line_no
    print(f"Line {line_no:4d} - {name}({args}) -> ~{length} lines")
