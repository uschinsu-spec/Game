import os
from PIL import Image

ICONS_BASE = r'H:\GOOGLE DRIVER\GAME\assets\icons'

def optimize_icons():
    print("=== Optimizing and Resizing All Icons in assets/icons ===")
    total_before = 0
    total_after = 0
    processed_count = 0
    
    # Target sizes for specific subdirectories
    custom_sizes = {
        'skills': (96, 96),
        'stages': (72, 72),
        'items': (80, 80)
    }
    
    # Process all files
    for root, dirs, files in os.walk(ICONS_BASE):
        subfolder = os.path.basename(root)
        for f in files:
            if not f.endswith('.png'):
                continue
            
            filepath = os.path.join(root, f)
            size_before = os.path.getsize(filepath)
            total_before += size_before
            
            # Skip atlases during directory walk, we'll re-optimize them specifically
            if f in ['skill_icons.png', 'items_atlas.png', 'stage_icons.png'] and root == ICONS_BASE:
                continue
                
            try:
                img = Image.open(filepath).convert('RGBA')
                
                # Determine optimal target size:
                if subfolder in custom_sizes:
                    target_w, target_h = custom_sizes[subfolder]
                else:
                    # General library cut icons (01_VU_KHI .. 20_BACH_NGHE_CHE_TAO)
                    target_w, target_h = (64, 64)
                
                # Resize if larger than target
                if img.width != target_w or img.height != target_h:
                    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
                
                # Save with maximum PNG compression and optimization
                img.save(filepath, 'PNG', optimize=True, compress_level=9)
                
                size_after = os.path.getsize(filepath)
                total_after += size_after
                processed_count += 1
            except Exception as e:
                print(f"Error processing {filepath}: {e}")
                total_after += size_before

    # Now rebuild and optimize the 3 Atlases directly from the optimized files
    print("\nRebuilding optimized Atlases...")
    
    # 1. skill_icons.png (10 frames x 96x96 = 960x96)
    skill_atlas = Image.new('RGBA', (96 * 10, 96), (0, 0, 0, 0))
    skills_dir = os.path.join(ICONS_BASE, 'skills')
    for i in range(10):
        sp = os.path.join(skills_dir, f'skill_{i}.png')
        if os.path.exists(sp):
            s_img = Image.open(sp).resize((76, 76), Image.Resampling.LANCZOS)
            skill_atlas.paste(s_img, (i * 96 + 10, 10), s_img)
    skill_atlas_p = os.path.join(ICONS_BASE, 'skill_icons.png')
    skill_atlas.save(skill_atlas_p, 'PNG', optimize=True, compress_level=9)
    total_after += os.path.getsize(skill_atlas_p)
    
    # 2. items_atlas.png (18 frames x 80x80 = 1440x80)
    items_atlas = Image.new('RGBA', (80 * 18, 80), (0, 0, 0, 0))
    items_dir = os.path.join(ICONS_BASE, 'items')
    for i in range(18):
        ip = os.path.join(items_dir, f'item_{i}.png')
        if os.path.exists(ip):
            it_img = Image.open(ip).resize((64, 64), Image.Resampling.LANCZOS)
            items_atlas.paste(it_img, (i * 80 + 8, 8), it_img)
    items_atlas_p = os.path.join(ICONS_BASE, 'items_atlas.png')
    items_atlas.save(items_atlas_p, 'PNG', optimize=True, compress_level=9)
    total_after += os.path.getsize(items_atlas_p)

    # 3. stage_icons.png (12 frames x 72x72 = 864x72)
    stage_atlas = Image.new('RGBA', (72 * 12, 72), (0, 0, 0, 0))
    stages_dir = os.path.join(ICONS_BASE, 'stages')
    for i in range(12):
        stp = os.path.join(stages_dir, f'stage_{i}.png')
        if os.path.exists(stp):
            st_img = Image.open(stp).resize((58, 58), Image.Resampling.LANCZOS)
            stage_atlas.paste(st_img, (i * 72 + 7, 7), st_img)
    stage_atlas_p = os.path.join(ICONS_BASE, 'stage_icons.png')
    stage_atlas.save(stage_atlas_p, 'PNG', optimize=True, compress_level=9)
    total_after += os.path.getsize(stage_atlas_p)

    mb_before = total_before / (1024 * 1024)
    mb_after = total_after / (1024 * 1024)
    reduction = ((total_before - total_after) / total_before) * 100

    print(f"\n==========================================")
    print(f" Optimization Summary:")
    print(f" - Total files processed: {processed_count + 3}")
    print(f" - Size Before: {mb_before:.2f} MB")
    print(f" - Size After:  {mb_after:.2f} MB")
    print(f" - Reduced:     {mb_before - mb_after:.2f} MB ({reduction:.1f}% reduction)")
    print(f"==========================================")

if __name__ == '__main__':
    optimize_icons()
