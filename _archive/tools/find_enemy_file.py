import os
import time

search_dirs = [
    r'C:\Users\nguye\Desktop',
    r'C:\Users\nguye\Downloads',
    r'C:\Users\nguye\Pictures',
    r'h:\GOOGLE DRIVER\GAME',
    r'h:\GOOGLE DRIVER'
]

now = time.time()
print("Recently modified image files in last 4 hours:")
for d in search_dirs:
    if os.path.exists(d):
        for root, dirs, files in os.walk(d):
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    fp = os.path.join(root, f)
                    try:
                        mtime = os.path.getmtime(fp)
                        if now - mtime < 4 * 3600:
                            t_str = time.strftime("%H:%M:%S", time.localtime(mtime))
                            print(f" [{t_str}] {fp} ({os.path.getsize(fp):,} bytes)")
                    except Exception:
                        pass
