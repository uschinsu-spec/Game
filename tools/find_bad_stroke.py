with open('src/main.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'setStrokeStyle' in line and 'add.text' in line:
        print(f"Bad line at {i+1}")
