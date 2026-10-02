from pathlib import Path
import subprocess, tempfile
import numpy as np
import cv2
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parents[1]
PLAYER = ROOT / "assets" / "characters" / "player"
REF = "23859aeed4dd27e52469ddaa12025d13265a693b"
OUT = 192
PALETTE = np.array([[254,254,254],[198,198,198]], dtype=np.int32)

SHEETS = {
    "attack": ("IMG_7539.png", 20),
    "run": ("IMG_7540.png", 25),
}

def restore(name, dst):
    with dst.open("wb") as f:
        subprocess.run(["git","show",f"{REF}:assets/characters/player/{name}"],stdout=f,check=True)

def checker_foreground_mask(cell):
    rgb = np.asarray(cell.convert("RGB")).astype(np.int32)
    d0=np.sqrt(np.sum((rgb-PALETTE[0])**2,axis=2))
    d1=np.sqrt(np.sum((rgb-PALETTE[1])**2,axis=2))
    dist=np.minimum(d0,d1)

    candidate=(dist<=72).astype(np.uint8)
    n,labels,_,_=cv2.connectedComponentsWithStats(candidate,8)
    border=np.unique(np.concatenate([labels[0,:],labels[-1,:],labels[:,0],labels[:,-1]]))
    border=border[border!=0]
    bg=np.isin(labels,border)

    spread=rgb.max(axis=2)-rgb.min(axis=2)
    mean=rgb.mean(axis=2)
    for _ in range(5):
        ring=cv2.dilate(bg.astype(np.uint8),np.ones((3,3),np.uint8),iterations=1).astype(bool)&~bg
        growable=(dist<=125)|((spread<=28)&(mean>=145))
        add=ring&growable
        if not add.any():
            break
        bg|=add

    return (~bg).astype(np.uint8)*255

def human_mask(cell, session):
    cut=remove(cell,session=session,alpha_matting=False,post_process_mask=True)
    if not isinstance(cut,Image.Image):
        cut=Image.open(cut)
    return np.asarray(cut.convert("RGBA"))[:,:,3]

def combine(cell, session):
    src=np.asarray(cell.convert("RGBA")).copy()
    key=checker_foreground_mask(cell)
    human=human_mask(cell,session)

    # Intersection: a pixel must be accepted both as non-checker and as human.
    # Low human threshold preserves hair/robe edges; key mask removes false bg blocks.
    mask=((key>0)&(human>=24)).astype(np.uint8)

    # Remove tiny residue and keep main silhouette plus nearby meaningful pieces.
    n,labels,stats,cent=cv2.connectedComponentsWithStats(mask,8)
    if n<=1:
        raise RuntimeError("No player silhouette")
    areas=stats[1:,cv2.CC_STAT_AREA]
    main=int(np.argmax(areas))+1
    main_area=int(stats[main,cv2.CC_STAT_AREA])
    keep=labels==main

    mx,my=cent[main]
    for lab in range(1,n):
        if lab==main:
            continue
        area=int(stats[lab,cv2.CC_STAT_AREA])
        if area<max(10,int(main_area*0.002)):
            continue
        x,y=cent[lab]
        if np.hypot(x-mx,y-my)<max(mask.shape)*0.42:
            keep|=labels==lab

    # Morphological close fills 1px breaks but does not recreate long checker lines.
    keep=cv2.morphologyEx(keep.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((3,3),np.uint8),iterations=1)

    # Use human matte only on accepted silhouette for smooth antialias.
    alpha=np.zeros_like(human,dtype=np.uint8)
    accepted=keep.astype(bool)
    alpha[accepted]=human[accepted]
    alpha[alpha<22]=0
    alpha[alpha>235]=255

    # Suppress extremely thin straight horizontal/vertical residues that survive both masks.
    # Only outside the dense body core: line opening finds rigid checker edges.
    binmask=(alpha>20).astype(np.uint8)
    hline=cv2.morphologyEx(binmask,cv2.MORPH_OPEN,np.ones((1,13),np.uint8))
    vline=cv2.morphologyEx(binmask,cv2.MORPH_OPEN,np.ones((13,1),np.uint8))
    lines=(hline|vline).astype(bool)

    # Do not remove line pixels sitting in locally dense foreground (actual limbs/hair).
    density=cv2.blur(binmask.astype(np.float32),(7,7))
    rigid=lines&(density<0.48)
    alpha[rigid]=0

    src[:,:,3]=alpha
    return Image.fromarray(src,"RGBA")

def fit(img):
    w,h=img.size
    scale=min(OUT/w,OUT/h)
    nw,nh=max(1,round(w*scale)),max(1,round(h*scale))
    img=img.resize((nw,nh),Image.Resampling.LANCZOS)
    canvas=Image.new("RGBA",(OUT,OUT),(0,0,0,0))
    canvas.alpha_composite(img,((OUT-nw)//2,(OUT-nh)//2))
    return canvas

def build(kind,src,count,session):
    sheet=Image.open(src).convert("RGBA")
    w,h=sheet.size
    xs=[round(i*w/5) for i in range(6)]
    ys=[round(i*h/5) for i in range(6)]

    for p in PLAYER.glob(f"player_{kind}_[0-9][0-9].webp"):
        p.unlink()

    for idx in range(count):
        row,col=divmod(idx,5)
        cell=sheet.crop((xs[col],ys[row],xs[col+1],ys[row+1]))
        out=fit(combine(cell,session))
        out.save(PLAYER/f"player_{kind}_{idx+1:02d}.webp","WEBP",lossless=True,quality=100,method=4)

session=new_session("u2net_human_seg")
with tempfile.TemporaryDirectory() as td:
    td=Path(td)
    for kind,(name,count) in SHEETS.items():
        src=td/name
        restore(name,src)
        build(kind,src,count,session)

print("OK: hybrid human+checker masks generated run=25 attack=20.")
