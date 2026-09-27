import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix line 297
code = code.replace(
    ".setOrigin(.5).setStrokeStyle(1,0xd4af37)",
    ".setOrigin(.5).setStroke('#d4af37',1)"
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed line 297 dropItem stroke!")
