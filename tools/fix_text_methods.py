import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix lines 155 and 156
code = code.replace(
    "this.quest=this.fixed(this.add.text(12,104,'',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',lineSpacing:4,color:'#e2e8f0',backgroundColor:'rgba(8,18,28,.84)',padding:{x:8,y:6}}).setStrokeStyle(1,0x94721c));",
    "this.quest=this.fixed(this.add.text(12,104,'',{fontFamily:'Be Vietnam Pro,sans-serif',fontSize:'11px',lineSpacing:4,color:'#e2e8f0',backgroundColor:'rgba(8,18,28,.84)',padding:{x:8,y:6}}).setStroke('#94721c',1));"
)

code = code.replace(
    "this.stageName=this.fixed(this.add.text(270,106,'',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#fff9d4',backgroundColor:'rgba(16,36,48,.88)',padding:{x:10,y:5}}).setOrigin(.5).setStrokeStyle(1,0xd4af37));",
    "this.stageName=this.fixed(this.add.text(270,106,'',{fontFamily:'Philosopher,Be Vietnam Pro,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#fff9d4',backgroundColor:'rgba(16,36,48,.88)',padding:{x:10,y:5}}).setOrigin(.5).setStroke('#d4af37',1));"
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed text stroke methods in src/main.js successfully!")
