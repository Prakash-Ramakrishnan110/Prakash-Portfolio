import os
import shutil

src_dir = r"C:\Users\praka\.gemini\antigravity-ide\brain\5df16fa5-c59a-4237-9a23-f82dc906bfeb"
dst_dir = r"c:\Users\praka\Pictures\Prakash-Portfolio-main (3)\Prakash-Portfolio-main\images"

files = [
    ("aaes_illustration_1789283180915.png", "aaes_cover.png"),
    ("fairness_audit_illustration_1789283201099.png", "fairness_cover.png"),
    ("searchtrust_ml_illustration_1789283218993.png", "searchtrust_new_cover.png")
]

for src, dst in files:
    src_path = os.path.join(src_dir, src)
    dst_path = os.path.join(dst_dir, dst)
    shutil.copy(src_path, dst_path)
