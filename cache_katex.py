import os
import urllib.request

portal_dir = r"G:\navakanth001\class7-sa1-portal"
katex_js = os.path.join(portal_dir, "katex.min.js")
katex_render_js = os.path.join(portal_dir, "katex.auto-render.min.js")
katex_css = os.path.join(portal_dir, "katex.min.css")

headers = {'User-Agent': 'Mozilla/5.0'}

def fetch(url, dest):
    if not os.path.exists(dest):
        print(f"Fetching {url} -> {dest}")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
        with open(dest, "wb") as f:
            f.write(content)
        print(f"Saved: {dest} ({len(content)} bytes)")
    else:
        print(f"Already exists: {dest}")

fetch("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js", katex_js)
fetch("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js", katex_render_js)
fetch("https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css", katex_css)
print("KaTeX offline assets ready!")
