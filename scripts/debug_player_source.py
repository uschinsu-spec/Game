from pathlib import Path
import subprocess, tempfile
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"characters"/"player"
REF="23859aeed4dd27e52469ddaa12025d13265a693b"

for name, grid in [("IMG_7539.png",(5,4)),("IMG_7540.png",(5,5))]:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        p=Path(tmp.name)
    with p.open("wb") as f:
        subprocess.run(["git","show",f"{REF}:assets/characters/player/{name}"],stdout=f,check=True)
    im=Image.open(p).convert("RGB")
    im.thumbnail((700,700), Image.Resampling.LANCZOS)
    draw=ImageDraw.Draw(im)
    cols,rows=grid
    for c in range(1,cols):
        x=round(c*im.width/cols); draw.line((x,0,x,im.height),fill=(255,0,0),width=2)
    for r in range(1,rows):
        y=round(r*im.height/rows); draw.line((0,y,im.width,y),fill=(255,0,0),width=2)
    im.save(OUT/f"debug_{name[:-4]}.webp","WEBP",quality=90,method=6)
    p.unlink()
