import os
import re

portal_dir = r"G:\navakanth001\class7-sa1-portal"

# Read local library assets
with open(os.path.join(portal_dir, "three.r128.min.js"), "r", encoding="utf-8") as f:
    three_js = f.read()

with open(os.path.join(portal_dir, "OrbitControls.r128.js"), "r", encoding="utf-8") as f:
    orbit_js = f.read()

with open(os.path.join(portal_dir, "confetti.browser.min.js"), "r", encoding="utf-8") as f:
    confetti_js = f.read()

with open(os.path.join(portal_dir, "katex.min.js"), "r", encoding="utf-8") as f:
    katex_js = f.read()

with open(os.path.join(portal_dir, "katex.auto-render.min.js"), "r", encoding="utf-8") as f:
    katex_render_js = f.read()

with open(os.path.join(portal_dir, "katex.min.css"), "r", encoding="utf-8") as f:
    katex_css = f.read()

print("[+] Read all offline library assets.")

# =====================================================================
# 1. SCIENCE BUNDLE
# =====================================================================
def build_science_offline():
    src_path = os.path.join(portal_dir, "science_sa1.html")
    dst_path = os.path.join(portal_dir, "Class7_Science_SA1_Interactive_Offline.html")
    with open(src_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace KaTeX CSS via exact string match or regex without repl parsing
    css_match = re.search(r'<link rel="stylesheet" href="https://cdn\.jsdelivr\.net/npm/katex@[^"]+/dist/katex\.min\.css"[^>]*>', html)
    if css_match:
        html = html[:css_match.start()] + f'<style>/* Inlined KaTeX CSS */\n{katex_css}\n</style>' + html[css_match.end():]

    # Replace KaTeX JS
    kjs_match = re.search(r'<script defer src="https://cdn\.jsdelivr\.net/npm/katex@[^"]+/dist/katex\.min\.js"[^>]*></script>', html)
    if kjs_match:
        html = html[:kjs_match.start()] + f'<script>/* Inlined KaTeX JS */\n{katex_js}\n</script>' + html[kjs_match.end():]

    kauto_match = re.search(r'<script defer src="https://cdn\.jsdelivr\.net/npm/katex@[^"]+/dist/contrib/auto-render\.min\.js"[^>]*></script>', html)
    if kauto_match:
        html = html[:kauto_match.start()] + f'<script>/* Inlined KaTeX Auto-Render */\n{katex_render_js}\n</script>' + html[kauto_match.end():]

    # Replace Three.js & OrbitControls
    three_match = re.search(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r128/three\.min\.js"></script>', html)
    if three_match:
        html = html[:three_match.start()] + f'<script>/* Inlined Three.js r128 */\n{three_js}\n</script>' + html[three_match.end():]

    orbit_match = re.search(r'<script src="https://cdn\.jsdelivr\.net/npm/three@0\.128\.0/examples/js/controls/OrbitControls\.js"></script>', html)
    if orbit_match:
        html = html[:orbit_match.start()] + f'<script>/* Inlined OrbitControls */\n{orbit_js}\n</script>' + html[orbit_match.end():]

    # Add Confetti before </body>
    if "/* Inlined Confetti */" not in html:
        html = html.replace('</body>', f'<script>/* Inlined Confetti */\n{confetti_js}\n</script>\n</body>')

    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    # Mirror to Science folder
    sci_dir = r"G:\navakanth001\7th Class\Science\SA1"
    with open(os.path.join(sci_dir, "Class7_Science_SA1_Interactive_Offline.html"), "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[+] Built Science Offline Bundle: {dst_path} ({round(os.path.getsize(dst_path)/1024)} KB)")

# =====================================================================
# 2. COMPUTERS BUNDLE
# =====================================================================
def build_computers_offline():
    src_path = os.path.join(portal_dir, "computers_sa1.html")
    dst_path = os.path.join(portal_dir, "Class7_Computers_SA1_Interactive_Offline.html")
    with open(src_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace Three.js & OrbitControls
    three_match = re.search(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r128/three\.min\.js"></script>', html)
    if three_match:
        html = html[:three_match.start()] + f'<script>/* Inlined Three.js r128 */\n{three_js}\n</script>' + html[three_match.end():]

    orbit_match = re.search(r'<script src="https://cdn\.jsdelivr\.net/npm/three@0\.128\.0/examples/js/controls/OrbitControls\.js"></script>', html)
    if orbit_match:
        html = html[:orbit_match.start()] + f'<script>/* Inlined OrbitControls */\n{orbit_js}\n</script>' + html[orbit_match.end():]

    if "/* Inlined Confetti */" not in html:
        html = html.replace('</body>', f'<script>/* Inlined Confetti */\n{confetti_js}\n</script>\n</body>')

    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    # Mirror to Computers folder
    comp_dir = r"G:\navakanth001\7th Class\Computers\SA1"
    with open(os.path.join(comp_dir, "Class7_Computers_SA1_Interactive_Offline.html"), "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[+] Built Computers Offline Bundle: {dst_path} ({round(os.path.getsize(dst_path)/1024)} KB)")

# =====================================================================
# 3. GK BUNDLE
# =====================================================================
def build_gk_offline():
    src_path = os.path.join(portal_dir, "gk_sa1.html")
    dst_path = os.path.join(portal_dir, "Class7_GK_SA1_Interactive_Offline.html")
    with open(src_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace Three.js & OrbitControls
    three_match = re.search(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r128/three\.min\.js"></script>', html)
    if three_match:
        html = html[:three_match.start()] + f'<script>/* Inlined Three.js r128 */\n{three_js}\n</script>' + html[three_match.end():]

    orbit_match = re.search(r'<script src="https://cdn\.jsdelivr\.net/npm/three@0\.128\.0/examples/js/controls/OrbitControls\.js"></script>', html)
    if orbit_match:
        html = html[:orbit_match.start()] + f'<script>/* Inlined OrbitControls */\n{orbit_js}\n</script>' + html[orbit_match.end():]

    if "/* Inlined Confetti */" not in html:
        html = html.replace('</body>', f'<script>/* Inlined Confetti */\n{confetti_js}\n</script>\n</body>')

    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    # Mirror to GK folder
    gk_dir = r"G:\navakanth001\7th Class\GK\SA1"
    with open(os.path.join(gk_dir, "Class7_GK_SA1_Interactive_Offline.html"), "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[+] Built GK Offline Bundle: {dst_path} ({round(os.path.getsize(dst_path)/1024)} KB)")

# =====================================================================
# 4. SOCIAL BUNDLE
# =====================================================================
def build_social_offline():
    src_path = os.path.join(portal_dir, "social_sa1.html")
    dst_path = os.path.join(portal_dir, "Class7_Social_SA1_Interactive_Offline.html")
    with open(src_path, "r", encoding="utf-8") as f:
        html = f.read()

    bundled_extras = f"""
    <!-- Inlined Offline WebGL & Utility Engines -->
    <script>
    /* Inlined Confetti */
    {confetti_js}
    /* Inlined Three.js r128 */
    {three_js}
    /* Inlined OrbitControls */
    {orbit_js}
    </script>
    """
    if "/* Inlined Confetti */" not in html:
        html = html.replace('</body>', f"{bundled_extras}\n</body>")

    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    # Mirror to Social folder
    soc_dir = r"G:\navakanth001\7th Class\Social\SA1"
    with open(os.path.join(soc_dir, "Class7_Social_SA1_Interactive_Offline.html"), "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[+] Built Social Offline Bundle: {dst_path} ({round(os.path.getsize(dst_path)/1024)} KB)")

build_science_offline()
build_computers_offline()
build_gk_offline()
build_social_offline()
print("\n[SUCCESS] All 4 offline interactive bundles created successfully!")
