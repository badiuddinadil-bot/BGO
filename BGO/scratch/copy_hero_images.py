import shutil
import os

brain_dir = r"C:\Users\user\.gemini\antigravity\brain\60555fad-a7d5-4517-801b-dd5d99a03424"
target_dir = r"c:\Users\user\OneDrive\Desktop\BGO\assets"

os.makedirs(target_dir, exist_ok=True)

# Find generated files
files = os.listdir(brain_dir)

for f in files:
    if f.startswith("gulbarga_fort_mosque_") and f.endswith(".jpg"):
        src = os.path.join(brain_dir, f)
        dst = os.path.join(target_dir, "gulbarga_fort_mosque.jpg")
        shutil.copy(src, dst)
        print(f"Copied {src} -> {dst}")
    elif f.startswith("kbn_dargah_gulbarga_") and f.endswith(".jpg"):
        src = os.path.join(brain_dir, f)
        dst = os.path.join(target_dir, "kbn_dargah.jpg")
        shutil.copy(src, dst)
        print(f"Copied {src} -> {dst}")
