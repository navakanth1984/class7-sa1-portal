import os
import urllib.request

portal_dir = r"G:\navakanth001\class7-sa1-portal"
orbit_path = os.path.join(portal_dir, "OrbitControls.r128.js")

if not os.path.exists(orbit_path):
    print("Fetching OrbitControls.js for r128...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
    with open(orbit_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Saved: {orbit_path} ({len(content)} bytes)")
else:
    print("OrbitControls already exists!")
