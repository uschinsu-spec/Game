import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Check for any .setStrokeStyle on .add.text
bad_text_strokes = re.findall(r"add\.text\([^)]+\)[^;]+\.setStrokeStyle", code)
print("Bad text.setStrokeStyle calls:", len(bad_text_strokes))

# Check for any undefined variables or calls
print("Checking syntax with Node...")
