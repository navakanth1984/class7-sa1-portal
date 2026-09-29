import os
import urllib.request
import re
from bs4 import BeautifulSoup

portal_dir = r"G:\navakanth001\class7-sa1-portal"
html_path = os.path.join(portal_dir, "maths_sa1.html")
css_path = os.path.join(portal_dir, "maths_enhancements.css")
js_3d_path = os.path.join(portal_dir, "maths_3d.js")
js_interactive_path = os.path.join(portal_dir, "maths_interactive.js")

out_primary = os.path.join(portal_dir, "maths_sa1.html")
out_whatsapp = os.path.join(portal_dir, "Class7_Maths_SA1_Interactive_Offline.html")

print("1. Reading source files...")
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

with open(css_path, "r", encoding="utf-8") as f:
    css_enhancements = f.read()

with open(js_3d_path, "r", encoding="utf-8") as f:
    js_3d = f.read()

with open(js_interactive_path, "r", encoding="utf-8") as f:
    js_interactive = f.read()

print("2. Fetching/Caching Three.js r128 & Confetti...")
headers = {'User-Agent': 'Mozilla/5.0'}
cache_three = os.path.join(portal_dir, "three.r128.min.js")
cache_confetti = os.path.join(portal_dir, "confetti.browser.min.js")

if os.path.exists(cache_three):
    with open(cache_three, "r", encoding="utf-8") as f:
        three_min_js = f.read()
else:
    req_three = urllib.request.Request("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", headers=headers)
    with urllib.request.urlopen(req_three) as resp:
        three_min_js = resp.read().decode('utf-8')
    with open(cache_three, "w", encoding="utf-8") as f:
        f.write(three_min_js)

if os.path.exists(cache_confetti):
    with open(cache_confetti, "r", encoding="utf-8") as f:
        confetti_min_js = f.read()
else:
    req_confetti = urllib.request.Request("https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js", headers=headers)
    with urllib.request.urlopen(req_confetti) as resp:
        confetti_min_js = resp.read().decode('utf-8')
    with open(cache_confetti, "w", encoding="utf-8") as f:
        f.write(confetti_min_js)

print("3. Cleaning any prior inlined script/CSS blocks...")
# Remove prior inlined CSS block if present
html = re.sub(r'/\* --- Next-Gen Enhancements Inlined --- \*/.*?(?=</style>)', '', html, flags=re.DOTALL)

# Remove prior inlined script blocks if present
html = re.sub(r'<!-- Inlined Canvas Confetti Library.*?</body>', '</body>', html, flags=re.DOTALL)

# Remove external tags if present
html = re.sub(r'<link rel="stylesheet" href="maths_enhancements\.css">', '', html)
html = re.sub(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/.*?"></script>', '', html)
html = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/three@.*?/OrbitControls\.js"></script>', '', html)
html = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/canvas-confetti.*?"></script>', '', html)
html = re.sub(r'<script src="maths_3d\.js.*?"></script>', '', html)
html = re.sub(r'<script src="maths_interactive\.js.*?"></script>', '', html)

print("4. Inlining fresh enhancements CSS...")
html = html.replace('</style>', f"\n/* --- Next-Gen Enhancements Inlined --- */\n{css_enhancements}\n</style>", 1)

print("5. Inlining fresh 3D & Interactive scripts before </body>...")
bundled_scripts = f"""
  <!-- Inlined Canvas Confetti Library (100% Offline) -->
  <script>
{confetti_min_js}
  </script>

  <!-- Inlined Three.js r128 Library (100% Offline 3D WebGL) -->
  <script>
{three_min_js}
  </script>

  <!-- Inlined 3D Spatial Math Exploratorium Engine (Mathematically Exact Polyhedra & Nets) -->
  <script>
{js_3d}
  </script>

  <!-- Inlined Audio, Mind Maps, Quiz, Retention, Smart Navigation & Scratchpad Engine -->
  <script>
{js_interactive}
  </script>
"""

html = html.replace('</body>', f"{bundled_scripts}</body>", 1)

print("6. Verifying link integrity...")
soup = BeautifulSoup(html, 'html.parser')
all_ids = set(tag.get('id') for tag in soup.find_all(True) if tag.get('id'))
broken = []
for a in soup.find_all('a'):
    href = a.get('href', '')
    if href.startswith('#'):
        target_id = href[1:]
        if target_id not in all_ids:
            broken.append(target_id)

if broken:
    print(f"WARNING: Found {len(broken)} broken in-page links:")
    for b in broken:
        print(" -", b)
else:
    print("SUCCESS: 100% of in-page anchor links match target element IDs!")

print("7. Writing output files...")
with open(out_primary, "w", encoding="utf-8") as f:
    f.write(html)

with open(out_whatsapp, "w", encoding="utf-8") as f:
    f.write(html)

size_primary = os.path.getsize(out_primary)
print(f"Complete! Generated:")
print(f" - {out_primary} ({round(size_primary/1024)} KB)")
print(f" - {out_whatsapp} ({round(size_primary/1024)} KB)")
