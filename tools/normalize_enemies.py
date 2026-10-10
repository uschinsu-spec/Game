"""Import enemy sheets using their actual grid lines, not equal-width guesses.
Nine-column sources are padded with their last frame to the runtime 10x2 layout.
The original PNGs remain untouched. Existing WebPs are backed up before replacement.
"""
import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
NINE_COLUMNS = {9, 11, 19, 23, 38}

def grid(image, columns):
    pixels = np.asarray(image).astype(float)
    strength = np.median(np.abs(np.diff(pixels, axis=1)).mean(axis=2), axis=0)
    boundaries = []
    for x in np.argsort(strength)[::-1]:
        if 100 < x < image.width-100 and all(abs(int(x)-v)>150 for v in boundaries):
            boundaries.append(int(x)+1)
            if len(boundaries) == columns-1:
                break
    horizontal = np.median(np.abs(np.diff(pixels, axis=0)).mean(axis=2), axis=1)
    low, high = int(image.height*.42), int(image.height*.58)
    middle = low+int(np.argmax(horizontal[low:high]))+1
    return [0, *sorted(boundaries), image.width], [0, middle, image.height]

def clean(cell, index):
    pixels = np.array(cell)
    if index == 11:
        # This source has an erroneous grayscale matte in its alpha channel.
        # Its colored mantis and green effects are intact in RGB.
        rgb = pixels[:, :, :3].astype(float)
        chroma = rgb.max(axis=2)-rgb.min(axis=2)
        alpha = np.maximum(np.clip((chroma-25)/15, 0, 1)*255,
                           np.clip((pixels[:, :, 3].astype(float)-130)/80, 0, 1)*255)
    else:
        # Discard near-transparent grid marks and color contamination.
        alpha = np.clip((pixels[:, :, 3].astype(float)-80)/155, 0, 1)*255
    rgb = pixels[:, :, :3].astype(float)
    neutral = (rgb.max(axis=2)-rgb.min(axis=2) < 20) & (rgb.min(axis=2) > 170) & (alpha > 0)
    lines = (neutral.mean(axis=0) > .55)[None, :] | (neutral.mean(axis=1) > .55)[:, None]
    alpha[neutral & lines] = 0
    pixels[:, :, 3] = alpha.astype('uint8')
    pixels[pixels[:, :, 3] == 0, :3] = 0
    return Image.fromarray(pixels)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--only', type=int, help='Reimport one enemy by source index')
    parser.add_argument('--missing', action='store_true', help='Import only missing files')
    parser.add_argument('--start', type=int, default=1, help='First output enemy number')
    parser.add_argument('--columns', default='', help='Overrides, e.g. 52:9,64:8')
    args = parser.parse_args()
    overrides = dict(tuple(map(int, pair.split(':'))) for pair in args.columns.split(',') if pair)
    sources = sorted(args.source.glob('*.png'))
    if not sources:
        raise SystemExit('No PNG sources found')
    output = ROOT/'assets/webp/ENEMIES'
    entries = json.loads((ROOT/'src/data/enemies.json').read_text(encoding='utf-8'))['enemies']
    def destination(index):
        entry = entries.get(f'enemy{index}')
        return ROOT/'assets/webp'/(entry['path']+'.webp') if entry else output/'GROUND'/f'enemy{index}.webp'
    audit = ROOT.parent/'output'/('enemy-repair-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
    backup = audit/'backup'; backup.mkdir(parents=True)
    report = []
    preview = Image.new('RGB', (1200, 120*((len(sources)+3)//4)), '#354a3b')
    draw = ImageDraw.Draw(preview)
    for index, source in enumerate(sources, args.start):
        if args.only and index != args.only: continue
        if args.missing and destination(index).exists(): continue
        image = Image.open(source).convert('RGBA')
        columns = overrides.get(index, 9 if index in NINE_COLUMNS else 10)
        xs, ys = grid(image, columns)
        frames = []
        for row in range(2):
            cells = []
            for col in range(columns):
                cell = clean(image.crop((xs[col]+5, ys[row]+5, xs[col+1]-5, ys[row+1]-5)), index)
                bbox = cell.getchannel('A').getbbox()
                if not bbox:
                    raise ValueError(f'{source.name}: empty frame {row},{col}')
                cells.append(cell.crop(bbox))
            while len(cells) < 10:
                cells.append(cells[-1].copy())
            frames.extend(cells)
        scale = min(156/max(f.width for f in frames), 156/max(f.height for f in frames))
        sheet = Image.new('RGBA', (1760, 352))
        for n, frame in enumerate(frames):
            frame = frame.resize((max(1,round(frame.width*scale)),max(1,round(frame.height*scale))),Image.Resampling.LANCZOS)
            sheet.paste(frame, (n%10*176+(176-frame.width)//2, n//10*176+173-frame.height))
        target = destination(index)
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists(): shutil.copy2(target, backup/target.name)
        temporary = target.with_suffix('.tmp.webp')
        sheet.save(temporary, 'WEBP', quality=90, method=6)
        temporary.replace(target)
        with Image.open(target) as check:
            check.load()
            assert check.size == (1760,352) and check.mode == 'RGBA'
            for row in range(2):
                for col in range(10):
                    cell = check.crop((col*176,row*176,(col+1)*176,(row+1)*176))
                    b = cell.getchannel('A').getbbox()
                    assert b and b[0] >= 8 and b[2] <= 168 and b[1] >= 8 and b[3] <= 174, (index,row,col,b)
        thumb = sheet.copy(); thumb.thumbnail((295,98))
        x=(index-args.start)%4*300; y=(index-args.start)//4*120
        preview.paste(thumb,(x,y),thumb);draw.text((x,y+99),f'enemy{index} ({columns} source columns)',fill='white')
        report.append({'id':f'enemy{index}','source':source.name,'columns':columns,'x_boundaries':xs,'y_boundaries':ys,'frames':20,'size':[1760,352]})
        print(f'OK enemy{index}: {columns} columns -> 10, 20 intact frames')
    preview.save(audit/'preview.jpg')
    (audit/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(f'Backup, report and preview: {audit}')

if __name__ == '__main__': main()
