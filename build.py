#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
從 docs/*.md 產生 pages/*.html。
用法：python3 build.py
需求：pip install markdown
"""
import os
import re
import json
import html
import subprocess
import markdown

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(ROOT, "docs")
PAGES = os.path.join(ROOT, "pages")

# (檔名, 標題, 一句話說明)
NAV = [
    ("求職起步", [
        ("getting-started", "求職起步總覽", "整體規劃、心態調整、資源盤點、求職時程怎麼抓"),
    ]),
    ("履歷準備", [
        ("resume-writing", "履歷寫作", "內容結構、量化成就寫法、動詞庫、ATS 優化、常見地雷"),
    ]),
    ("求職平台", [
        ("platforms", "求職平台攻略", "LinkedIn／104／Cake 差異與寫法、平台各自的經營重點"),
    ]),
    ("面試準備", [
        ("interview-prep", "面試準備", "STAR 法、行為面試、技術面試、談薪資、反問問題"),
    ]),
    ("背景敘事", [
        ("cross-domain-narrative", "跨領域背景敘事技巧", "非本科／轉職／跨產業背景怎麼包裝成優勢"),
    ]),
    ("工具箱", [
        ("toolbox", "工具箱", "checklist、AI 提示詞範本、延伸閱讀與來源書目"),
    ]),
]

SLUG_TITLE = {}
FLAT = []
for _sec, items in NAV:
    for slug, title, desc in items:
        SLUG_TITLE[slug] = title
        FLAT.append((slug, title, desc))


_UPDATED_CACHE = {}


def source_updated(src):
    """取得來源檔最後一次 Git 提交的 Unix 時間戳。

    未安裝 Git、指令失敗或檔案尚無提交紀錄時，改用檔案的
    mtime。結果會在單次建置期間快取，避免每次產生側欄都重複查詢。
    """
    if src in _UPDATED_CACHE:
        return _UPDATED_CACHE[src]

    rel = os.path.relpath(src, ROOT).replace(os.sep, "/")
    updated = None
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ct", "--", rel],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
            timeout=5,
        )
        value = result.stdout.strip()
        if result.returncode == 0 and value.isdigit():
            updated = int(value)
    except (OSError, subprocess.TimeoutExpired):
        pass

    if updated is None:
        updated = int(os.stat(src).st_mtime)
    _UPDATED_CACHE[src] = updated
    return updated


def nav_html(active, prefix=""):
    out = ['<nav class="sidenav" id="sidenav" aria-label="全站導覽">']
    out.append(f'<a class="brand" href="{prefix}index.html"><span class="brand-mark">◈</span>'
               f'<span class="brand-text">求職準備<br><small>知識庫</small></span></a>')
    out.append('<div class="navsearch"><input type="search" id="navfilter" '
               'placeholder="篩選頁面…" aria-label="篩選頁面"></div>')
    for sec, items in NAV:
        out.append(f'<div class="navsec"><h2>{sec}</h2><ul>')
        for slug, title, _d in items:
            cls = ' class="active"' if slug == active else ""
            updated = source_updated(os.path.join(DOCS, slug + ".md"))
            out.append(f'<li{cls}><a href="{prefix}pages/{slug}.html" '
                       f'data-title="{title}" data-slug="{slug}" '
                       f'data-updated="{updated}">{title}</a></li>')
        out.append("</ul></div>")
    out.append("</nav>")
    return "\n".join(out)


TEMPLATE = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}｜求職與面試準備知識庫</title>
<meta name="description" content="{desc}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#128188;</text></svg>">
<link rel="stylesheet" href="../assets/style.css">
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>
<button class="navtoggle" id="navtoggle" aria-label="開啟導覽">☰</button>
{nav}
<div class="wrap">
<main id="main">
<p class="crumb"><a href="../index.html">首頁</a> ／ {section}</p>
<article class="doc" data-updated="{updated}">
{body}
</article>
<nav class="pager">{pager}</nav>
<footer class="foot">
<p>本站為個人學習筆記彙整，非官方規範。實際求職決策一律以你的求職策略、目標產業慣例與應徵企業的實際要求為準。</p>
<p><a href="../pages/toolbox.html">工具箱：延伸閱讀與來源書目</a></p>
</footer>
</main>
<aside class="toc" id="toc"><h2>本頁目錄</h2>{toc}</aside>
</div>
<script src="../assets/site.js"></script>
</body>
</html>
"""


SEC_DESC = {
    "求職起步": "從整體規劃開始：時程怎麼抓、心態怎麼調整、手邊資源怎麼盤點。",
    "履歷準備": "把經歷寫成看得懂、也過得了 ATS 的成就陳述。",
    "求職平台": "不同平台的定位差很多，經營方式也不一樣。",
    "面試準備": "從行為面試到技術面試，再到談薪與反問。",
    "背景敘事": "非本科、轉職、跨產業背景怎麼講成一個站得住腳的故事。",
    "工具箱": "可以直接拿來用的清單、提示詞範本與延伸閱讀。",
}

INDEX_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>求職與面試準備知識庫</title>
<meta name="description" content="履歷寫作、求職平台攻略、面試準備與跨領域背景敘事的通用知識庫。">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#128188;</text></svg>">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<a class="skip" href="#main">跳到主要內容</a>
<button class="navtoggle" id="navtoggle" aria-label="開啟導覽">☰</button>
{nav}
<div class="wrap solo">
<main id="main">

<header class="hero">
<span class="tag">求職準備 ／ 履歷與面試</span>
<h1>求職與面試準備<br>知識庫</h1>
<p>把履歷寫作、求職平台攻略、面試準備與跨領域背景敘事整理成一張可以反覆查閱的地圖。內容涵蓋履歷結構與量化成就寫法、ATS 優化、各求職平台的差異、STAR 法與行為面試、技術面試與談薪，以及非本科／轉職背景怎麼包裝成優勢。</p>
<p>本站以<strong>台灣一般求職者</strong>（含應屆畢業生與轉職者）為預設情境。各產業、各公司的實際要求不同，站內內容僅供參考，請以應徵企業的實際規定與你自己的判斷為準。</p>
<p>站內沒有任何使用者的真實履歷內容或個人求職經歷——所有範例都是通用的示範素材。</p>
</header>

<div class="notice">
<b>先講清楚四件事</b>
<ol>
<li>這是<strong>個人學習筆記</strong>的彙整，不是任何機構或求職平台的官方規範，也不能取代你自己的求職策略判斷。</li>
<li>實際要求一律以：應徵企業／HR 的實際規定 → 目標產業慣例 → 求職平台使用條款 為準。</li>
<li>站內的判準門檻（履歷格式、面試題型、ATS 規則）會因產業與公司而異，引用前請自行查證最新版本。</li>
<li>本站內容由作者規劃、篩選與審定，撰寫過程使用 AI 工具協助蒐集資料、查證出處與草擬文字。站內引用的連結與資料均經工具查證並標明查證日期，但作者尚未逐項取得原始來源逐一核對——<strong>請勿直接引用本站的整理，一律回到原始來源查證後再引用。</strong>作者對本站公開的內容負責：發現錯誤請回報，作者會更正或撤下。</li>
</ol>
</div>

<div class="homesearch">
<input type="search" id="homefilter" placeholder="搜尋主題…（例如：STAR、ATS、談薪、反問）" aria-label="搜尋主題">
</div>

<div class="flowbox">
<h2>求職的骨架：從盤點到決策的五個階段</h2>
<div class="flow">
<div class="step"><b>自我盤點</b><span>釐清定位、優勢與目標產業<br><em>→ 求職起步總覽</em></span></div>
<div class="arrow">→</div>
<div class="step"><b>履歷準備</b><span>把經歷寫成看得懂又能過 ATS 的成就<br><em>→ 履歷寫作</em></span></div>
<div class="arrow">→</div>
<div class="step"><b>投遞與經營</b><span>選對平台、建立能見度<br><em>→ 求職平台攻略</em></span></div>
<div class="arrow">→</div>
<div class="step"><b>面試表現</b><span>STAR、技術面試、反問問題<br><em>→ 面試準備</em></span></div>
<div class="arrow">→</div>
<div class="step"><b>敘事與決策</b><span>背景敘事、談薪與最終決策<br><em>→ 跨領域背景敘事技巧</em></span></div>
</div>
</div>

{sections}

<footer class="foot">
<p>本站為個人學習筆記彙整，非官方規範。實際求職決策一律以你的求職策略、目標產業慣例與應徵企業的實際要求為準。</p>
<p><a href="pages/toolbox.html">工具箱：延伸閱讀與來源書目</a>　·　最後更新：2026-09</p>
</footer>

</main>
</div>
<script src="assets/site.js"></script>
</body>
</html>
"""


def build_index():
    parts = []
    for i, (sec, items) in enumerate(NAV, start=1):
        cards = []
        for slug, title, desc in items:
            cards.append(f'<a class="card" href="pages/{slug}.html">'
                         f'<h3>{title}</h3><p>{desc}</p></a>')
        parts.append(
            f'<section class="mapsec"><h2><span class="num">{i:02d}</span>{sec}</h2>'
            f'<p class="secdesc">{SEC_DESC.get(sec, "")}</p>'
            f'<div class="cards">{"".join(cards)}</div></section>')
    out = INDEX_TEMPLATE.format(nav=nav_html(None, prefix=""), sections="\n".join(parts))
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(out)
    print("  [ok] index.html")


def section_of(slug):
    for sec, items in NAV:
        for s, _t, _d in items:
            if s == slug:
                return sec
    return ""


def build():
    os.makedirs(PAGES, exist_ok=True)
    md = markdown.Markdown(extensions=["extra", "toc", "sane_lists", "admonition"],
                           extension_configs={"toc": {"toc_depth": "2-3"}})
    for i, (slug, title, desc) in enumerate(FLAT):
        src = os.path.join(DOCS, slug + ".md")
        if not os.path.exists(src):
            print("  [!] missing", src)
            continue
        md.reset()
        text = open(src, encoding="utf-8").read()
        # 移除 Markdown 檔開頭的 H1（HTML 由樣板統一呈現）
        text = re.sub(r"\A#\s+.*\n", "", text)
        body = md.convert(text)
        # 內部連結：docs/*.md → 同目錄的 *.html
        body = re.sub(r'href="(?!https?:|#|\.\./)([A-Za-z0-9\-_]+)\.md(#[^"]*)?"',
                      lambda m: 'href="%s.html%s"' % (m.group(1), m.group(2) or ""), body)
        body = f"<h1>{title}</h1>\n<p class='lede'>{desc}</p>\n" + body
        # 讓 - [ ] 變成可勾選
        body = body.replace("<li>[ ] ", '<li class="chk"><input type="checkbox"> ')
        body = body.replace("<li>[x] ", '<li class="chk"><input type="checkbox" checked> ')
        prev_ = FLAT[i - 1] if i > 0 else None
        next_ = FLAT[i + 1] if i < len(FLAT) - 1 else None
        pager = ""
        if prev_:
            pager += f'<a class="prev" href="{prev_[0]}.html">← {prev_[1]}</a>'
        if next_:
            pager += f'<a class="next" href="{next_[0]}.html">{next_[1]} →</a>'
        toc = md.toc.replace('<div class="toc">', '<div class="toc-body">')
        out = TEMPLATE.format(title=title, desc=html.escape(desc, quote=True),
                              nav=nav_html(slug, prefix="../"), body=body,
                              toc=toc, pager=pager, section=section_of(slug),
                              updated=source_updated(src))
        with open(os.path.join(PAGES, slug + ".html"), "w", encoding="utf-8") as f:
            f.write(out)
        print("  [ok]", slug + ".html")

    # 給首頁搜尋用的索引
    idx = [{"slug": s, "title": t, "desc": d, "section": section_of(s)} for s, t, d in FLAT]
    with open(os.path.join(ROOT, "assets", "index.json"), "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    build()
    build_index()
    print("完成。")
