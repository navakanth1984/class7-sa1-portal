import os
import re

portal_dir = r"G:\navakanth001\class7-sa1-portal"

files = ["science_sa1.html", "computers_sa1.html", "gk_sa1.html", "social_sa1.html"]

for fn in files:
    path = os.path.join(portal_dir, fn)
    if not os.path.exists(path):
        print(f"Missing: {fn}")
        continue
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    
    scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', text)
    styles = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\']', text)
    
    print(f"\n--- {fn} ({round(len(text)/1024)} KB) ---")
    print(f"External Scripts ({len(scripts)}): {scripts}")
    print(f"External Stylesheets ({len(styles)}): {styles}")
