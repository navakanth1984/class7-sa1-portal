import os

index_path = r"G:\navakanth001\class7-sa1-portal\index.html"

with open(index_path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update Science Card
sci_needle = """          <div class="btn-row">
            <a href="SA1_Science_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_Science_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
        </div>"""

sci_replacement = """          <div class="btn-row">
            <a href="SA1_Science_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_Science_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
          <div class="btn-row" style="grid-template-columns: 1fr;">
            <a href="Class7_Science_SA1_Interactive_Offline.html" download class="btn-sub" style="color: #34d399; border-color: rgba(16, 185, 129, 0.4);"><span style="font-size:1.1rem;">📲</span> Download 100% Offline Bundle (WhatsApp Ready)</a>
          </div>
        </div>"""

if sci_needle in html:
    html = html.replace(sci_needle, sci_replacement)
    print("[+] Science offline button added.")

# 2. Update Social Card
soc_needle = """          <div class="btn-row">
            <a href="SA1_Social_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_Social_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
        </div>"""

soc_replacement = """          <div class="btn-row">
            <a href="SA1_Social_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_Social_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
          <div class="btn-row" style="grid-template-columns: 1fr;">
            <a href="Class7_Social_SA1_Interactive_Offline.html" download class="btn-sub" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);"><span style="font-size:1.1rem;">📲</span> Download 100% Offline Bundle (WhatsApp Ready)</a>
          </div>
        </div>"""

if soc_needle in html:
    html = html.replace(soc_needle, soc_replacement)
    print("[+] Social offline button added.")

# 3. Update Computers Card
comp_needle = """          <div class="btn-row">
            <a href="SA1_Computers_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_Computers_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
        </div>"""

comp_replacement = """          <div class="btn-row">
            <a href="SA1_Computers_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_Computers_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
          <div class="btn-row" style="grid-template-columns: 1fr;">
            <a href="Class7_Computers_SA1_Interactive_Offline.html" download class="btn-sub" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);"><span style="font-size:1.1rem;">📲</span> Download 100% Offline Bundle (WhatsApp Ready)</a>
          </div>
        </div>"""

if comp_needle in html:
    html = html.replace(comp_needle, comp_replacement)
    print("[+] Computers offline button added.")

# 4. Update GK Card
gk_needle = """          <div class="btn-row">
            <a href="SA1_GK_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_GK_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
        </div>"""

gk_replacement = """          <div class="btn-row">
            <a href="SA1_GK_Master_Solutions.docx" download class="btn-sub">Solutions DOCX</a>
            <a href="SA1_GK_English_Audio_Guide.mp3" download class="btn-sub">Download MP3</a>
          </div>
          <div class="btn-row" style="grid-template-columns: 1fr;">
            <a href="Class7_GK_SA1_Interactive_Offline.html" download class="btn-sub" style="color: #f472b6; border-color: rgba(236, 72, 153, 0.4);"><span style="font-size:1.1rem;">📲</span> Download 100% Offline Bundle (WhatsApp Ready)</a>
          </div>
        </div>"""

if gk_needle in html:
    html = html.replace(gk_needle, gk_replacement)
    print("[+] GK offline button added.")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(html)

print("[SUCCESS] Central Portal index.html updated with all 5 offline bundle download buttons!")
