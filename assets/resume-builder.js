/* 履歷範本編輯器：簡化 Markdown 解析、即時預覽、本機暫存、版面設定與匯出 */
(function () {
  "use strict";

  var KEY = "jh-resume-builder:v1";
  var KEY_SETTINGS = "jh-resume-builder:settings:v1";
  var KEY_MUTE_TIP = "jh-resume-builder:print-tip-off";

  /* localStorage 可能被封鎖，一律包 try/catch；失敗時回傳 null／false，頁面照常運作 */
  function lsGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
  }
  function lsDel(k) {
    try { localStorage.removeItem(k); return true; } catch (e) { return false; }
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function bold(t) { return t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }

  /* 行內語法：先整行跳脫，連結先換成佔位符再套粗體，避免粗體改到網址 */
  function inline(s) {
    var links = [];
    var t = esc(s.replace(/\u0000/g, ""));
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
      if (!/^(https?:\/\/|mailto:)/i.test(url)) { return m; }
      links.push('<a href="' + url + '">' + bold(text) + "</a>");
      return "\u0000" + (links.length - 1) + "\u0000";
    });
    return bold(t).replace(/\u0000(\d+)\u0000/g, function (m, i) { return links[i]; });
  }

  function parse(src) {
    var lines = src.replace(/\r\n?/g, "\n").split("\n");
    var doc = { name: null, contact: null, pre: { head: null, blocks: [] }, sections: [] };
    var sec = null;
    var item = doc.pre;
    var expectContact = false;
    var listOpen = false;
    var m;

    function target() {
      if (!item) {
        item = { head: null, blocks: [] };
        sec.items.push(item);
      }
      return item;
    }

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (line === "") { listOpen = false; return; }
      if (expectContact) {
        expectContact = false;
        if (!/^(#{1,3}\s|-\s)/.test(line)) { doc.contact = line; return; }
      }
      if (doc.name === null && !sec && (m = /^#\s+(.*)$/.exec(line))) {
        doc.name = m[1];
        expectContact = true;
      } else if ((m = /^##\s+(.*)$/.exec(line))) {
        sec = { title: m[1], items: [] };
        doc.sections.push(sec);
        item = null;
        listOpen = false;
      } else if (sec && (m = /^###\s+(.*)$/.exec(line))) {
        item = { head: m[1].split(/\s*[｜|]\s*/), blocks: [] };
        sec.items.push(item);
        listOpen = false;
      } else if ((m = /^-\s+(.*)$/.exec(line))) {
        var blocks = target().blocks;
        if (!listOpen) { blocks.push({ type: "ul", items: [] }); listOpen = true; }
        blocks[blocks.length - 1].items.push(m[1]);
      } else {
        target().blocks.push({ type: "p", text: line });
        listOpen = false;
      }
    });
    return doc;
  }

  function renderItem(it, heading) {
    var out = ['<div class="rb-item">'];
    if (heading) { out.push(heading); }
    if (it.head) {
      var p = it.head;
      var title = p[0];
      var period = p.length >= 3 ? p[p.length - 1] : "";
      var org = p.slice(1, p.length >= 3 ? -1 : undefined).join("｜");
      out.push('<div class="rb-item-head"><span class="rb-role"><strong>' + inline(title) + "</strong>" +
        (org ? '<span class="rb-org">' + inline(org) + "</span>" : "") + "</span>" +
        (period ? '<span class="rb-period">' + inline(period) + "</span>" : "") + "</div>");
    }
    it.blocks.forEach(function (b) {
      if (b.type === "p") {
        out.push("<p>" + inline(b.text) + "</p>");
      } else {
        out.push("<ul>" + b.items.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + "</ul>");
      }
    });
    out.push("</div>");
    return out.join("");
  }

  function render(src) {
    var doc = parse(src);
    var out = [];
    if (doc.name !== null || doc.contact !== null) {
      out.push('<header class="rb-head">' +
        (doc.name !== null ? '<h1 class="rb-name">' + inline(doc.name) + "</h1>" : "") +
        (doc.contact !== null ? '<p class="rb-contact">' + inline(doc.contact) + "</p>" : "") +
        "</header>");
    }
    if (doc.pre.blocks.length) { out.push(renderItem(doc.pre, null)); }
    doc.sections.forEach(function (s) {
      /* 區塊標題放進第一個項目裡一起避免分頁，才不會孤單留在頁尾 */
      var h2 = "<h2>" + inline(s.title) + "</h2>";
      out.push('<section class="rb-sec">');
      if (s.items.length) {
        s.items.forEach(function (it, i) { out.push(renderItem(it, i === 0 ? h2 : null)); });
      } else {
        out.push(h2);
      }
      out.push("</section>");
    });
    if (!out.length) {
      out.push('<p class="rb-empty">在左邊輸入內容，這裡會即時顯示預覽。</p>');
    }
    return out.join("\n");
  }

  /* ---------- 內容檢查：只提醒，不擋 ---------- */
  var WEAK = /^(負責|協助|參與|幫忙)/;

  function check(src) {
    var doc = parse(src);
    var res = [];
    var holders = (src.match(/⟨[^⟩\n]*⟩/g) || []).length;
    res.push(holders
      ? { ok: false, text: "還有 " + holders + " 處 ⟨ ⟩ 提示文字沒換成你的內容。" }
      : { ok: true, text: "提示文字都換掉了。" });
    if (doc.name === null) {
      res.push({ ok: false, text: "第一行用「# 姓名」寫上你的名字。" });
    }
    if (doc.contact === null) {
      res.push({ ok: false, text: "姓名下一行還沒有聯絡方式，可以用上方的按鈕插入。" });
    }
    var noPeriod = 0;
    var weak = 0;
    doc.sections.forEach(function (s) {
      s.items.forEach(function (it) {
        if (it.head && it.head.length < 3) { noPeriod++; }
        it.blocks.forEach(function (b) {
          if (b.type !== "ul") { return; }
          b.items.forEach(function (x) { if (WEAK.test(x.replace(/\*\*/g, ""))) { weak++; } });
        });
      });
    });
    if (noPeriod) {
      res.push({ ok: false, text: "有 " + noPeriod + " 個項目標題少了期間，格式是「職稱｜單位｜期間」。" });
    }
    if (weak) {
      res.push({ ok: false, text: "有 " + weak + " 條條列用「負責／協助／參與」開頭，改用具體的動詞，寫出你做了什麼、結果如何。" });
    }
    if (res.length === 1 && res[0].ok) {
      res.push({ ok: true, text: "格式沒看到問題。內容是否貼近職缺，還是要自己對照職缺說明。" });
    }
    return res;
  }

  /* ---------- 範例（engineer 用 textarea 裡的預設內容） ---------- */
  var TEMPLATES = {
    student: [
      "# 林小華",
      "⟨你的 Email⟩｜⟨你的手機⟩｜新竹市｜[github.com/⟨帳號⟩](https://github.com/⟨帳號⟩)",
      "",
      "## 學歷",
      "### 資訊管理學系 學士（大三）｜範例大學｜2023/09 – 預計 2027/06",
      "- 相關課程：資料庫系統、系統分析與設計、資料探勘",
      "",
      "## 專案",
      "### 校園二手書媒合網站｜課程期末專案，四人小組負責後端｜2025",
      "- 用 Python Flask 與 SQLite 建立書籍刊登與搜尋功能，期末展示前邀請三十位同學試用，依回饋修正三個操作流程。",
      "",
      "### 選課衝堂提醒工具｜個人專案｜2024",
      "- 讀取學校公開的課程資料，選課時自動標出衝堂與學分上限，程式碼放在 GitHub，約四十位同學用過。",
      "",
      "## 社團與活動",
      "### 資訊研究社 教學長｜範例大學｜2024/09 – 2025/06",
      "- 規劃八堂 Python 入門課，每堂約二十五人參加，整理講義與作業範本留給下一屆沿用。",
      "",
      "## 技能",
      "- **程式語言**：Python、JavaScript、SQL",
      "- **工具**：Git、Figma、Excel",
      "",
      "## 語言能力",
      "- 英文：TOEIC 多益 785 分（2025）",
      ""
    ].join("\n"),
    career: [
      "# 陳小安",
      "⟨你的 Email⟩｜⟨你的手機⟩｜台中市｜[作品集](https://example.com)",
      "",
      "## 專業摘要",
      "三年電商行銷經驗，長期用數據調整廣告與會員活動。近一年自學 SQL 與 Python，完成兩個分析專案，正在轉往資料分析職務。",
      "",
      "## 相關專案",
      "### 會員回購分析｜個人專案｜2025",
      "- 用公開的電商資料集與 SQL 計算各月新客的三個月回購率，比較首購品類與回購的關係，整理成十頁分析報告放在作品集。",
      "",
      "### 廣告成效儀表板｜工作中主動改善｜2024",
      "- 把每週手動整理的廣告報表改成 Looker Studio 儀表板，報表製作時間由半天縮短為三十分鐘。",
      "",
      "## 工作經歷",
      "### 行銷專員｜範例電商有限公司｜2022/03 – 至今",
      "- 規劃會員分眾簡訊活動，依購買頻率分三組測試不同優惠，整理各組回購差異，作為下一季會員方案的依據。",
      "- 每月彙整廣告投放數據並提出預算調整建議，供主管決定下月的投放配置。",
      "",
      "## 學歷",
      "### 企業管理學系 學士｜範例大學｜2017 – 2021",
      "",
      "## 技能",
      "- **資料分析**：SQL、Python（pandas）、Excel 樞紐分析",
      "- **視覺化**：Looker Studio、Tableau",
      "- **行銷工具**：Google Analytics、Meta 廣告管理員",
      ""
    ].join("\n")
  };
  var TEMPLATE_NAMES = { engineer: "在職工程師", student: "學生找實習", career: "跨領域轉職" };

  /* ---------- 插入用的區塊 ----------
     同名區塊（## 標題）只會有一個：已經存在就在區塊尾端加一個項目或條列，
     沒有才在游標位置建立新區塊。single 的區塊（專業摘要）已存在時只把游標移過去。 */
  var BLOCKS = {
    summary: { title: "專業摘要", body: "⟨兩到四行：你的定位、核心經驗，以及能為這個職缺帶來什麼⟩", single: true },
    work: { title: "工作經歷", item: true,
      body: "### ⟨職稱⟩｜⟨公司⟩｜⟨2024/07 – 至今⟩\n- ⟨動詞開頭：做了什麼、怎麼做、結果如何⟩" },
    intern: { title: "實習經歷", item: true,
      body: "### ⟨實習職稱⟩｜⟨公司⟩｜⟨2025/07 – 2025/08⟩\n- ⟨動詞開頭：做了什麼、怎麼做、結果如何⟩" },
    project: { title: "專案", item: true,
      body: "### ⟨專案名稱⟩｜⟨課程、個人或團隊，你的角色⟩｜⟨年份⟩\n- ⟨用了什麼技術、解決什麼問題、結果如何⟩" },
    edu: { title: "學歷", item: true,
      body: "### ⟨系所 學位⟩｜⟨學校⟩｜⟨入學 – 畢業或預計畢業⟩\n- 相關課程：⟨只列跟職缺有關的⟩" },
    club: { title: "社團與活動", item: true,
      body: "### ⟨社團名稱 職位⟩｜⟨學校⟩｜⟨期間⟩\n- ⟨規劃或帶領了什麼，規模多大⟩" },
    skills: { title: "技能", body: "- **⟨類別⟩**：⟨技能一⟩、⟨技能二⟩" },
    cert: { title: "證照", body: "- ⟨證照名稱⟩（⟨發證單位⟩，⟨年份⟩）" },
    lang: { title: "語言能力", body: "- ⟨語言⟩：⟨檢定名稱與成績，或實際使用的情境⟩" },
    award: { title: "得獎", body: "- ⟨獎項名稱⟩（⟨主辦單位⟩，⟨年份⟩）" }
  };
  /* 語言檢定：一律加進「語言能力」區塊 */
  var LANGS = {
    toeic: "- 英文：TOEIC 多益 ⟨分數⟩ 分（⟨年份⟩）",
    ielts: "- 英文：IELTS 雅思 ⟨總分⟩ 級（⟨年份⟩）",
    toefl: "- 英文：TOEFL iBT 托福 ⟨分數⟩ 分（⟨年份⟩）",
    gept: "- 英文：全民英檢 GEPT ⟨級別⟩（⟨年份⟩）",
    jlpt: "- 日文：JLPT 日本語能力試驗 ⟨N1–N5⟩（⟨年份⟩）",
    topik: "- 韓文：TOPIK 韓國語能力測驗 ⟨級數⟩（⟨年份⟩）"
  };

  function findSection(lines, title) {
    for (var i = 0; i < lines.length; i++) {
      var m = /^##\s+(.*)$/.exec(lines[i].trim());
      if (m && m[1].trim() === title) { return i; }
    }
    return -1;
  }

  /* 加到既有區塊尾端；回傳 { text, caret }，找不到區塊回傳 null */
  function appendToSection(src, title, body, isItem) {
    var lines = src.replace(/\r\n?/g, "\n").split("\n");
    var start = findSection(lines, title);
    if (start === -1) { return null; }
    var end = lines.length;
    for (var j = start + 1; j < lines.length; j++) {
      if (/^##\s/.test(lines[j].trim())) { end = j; break; }
    }
    var last = end - 1;
    while (last > start && lines[last].trim() === "") { last--; }
    var head = lines.slice(0, last + 1).concat(isItem ? [""] : [], body.split("\n")).join("\n");
    var rest = lines.slice(last + 1);
    while (rest.length && rest[0].trim() === "") { rest.shift(); }
    return { text: head + (rest.length ? "\n\n" + rest.join("\n") : "\n"), caret: head.length };
  }

  /* 游標位置插入一段新區塊，前後補空行 */
  function insertAt(src, at, block) {
    var before = src.slice(0, at);
    var after = src.slice(at);
    var lead = before === "" || /\n\n$/.test(before) ? "" : (/\n$/.test(before) ? "\n" : "\n\n");
    var tail = after === "" || /^\n/.test(after) ? "\n" : "\n\n";
    var text = lead + block + tail;
    return { text: before + text + after, caret: before.length + lead.length + block.length };
  }

  /* 點一次區塊或語言檢定按鈕的結果；summary 已存在時 text 不變，只回傳游標位置 */
  function addBlock(src, at, def) {
    var lines = src.replace(/\r\n?/g, "\n").split("\n");
    var idx = findSection(lines, def.title);
    if (idx !== -1 && def.single) {
      return { text: src, caret: lines.slice(0, idx + 1).join("\n").length, existed: true };
    }
    var added = appendToSection(src, def.title, def.body, def.item);
    if (added) { return added; }
    return insertAt(src, at, "## " + def.title + "\n" + def.body);
  }

  /* 聯絡方式接在姓名下一行；還沒有姓名就先補一行 */
  function addContact(src, snippet) {
    var lines = src.replace(/\r\n?/g, "\n").split("\n");
    var nameAt = -1;
    for (var i = 0; i < lines.length; i++) {
      if (/^#\s+/.test(lines[i].trim())) { nameAt = i; break; }
      if (lines[i].trim() !== "") { break; }
    }
    if (nameAt === -1) {
      return "# ⟨你的姓名⟩\n" + snippet + "\n\n" + src;
    }
    var next = lines[nameAt + 1];
    if (next !== undefined && next.trim() !== "" && !/^(#{1,3}\s|-\s)/.test(next.trim())) {
      lines[nameAt + 1] = next.replace(/\s+$/, "") + "｜" + snippet;
    } else {
      lines.splice(nameAt + 1, 0, snippet);
    }
    return lines.join("\n");
  }

  /* ---------- 版面設定：只用本機字型，不載入外部字型 ---------- */
  var FONTS = {
    sans: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Helvetica Neue", Arial, sans-serif',
    serif: '"Noto Serif TC", "Source Han Serif TC", "PingFang TC", "Songti TC", "PMingLiU", Georgia, serif',
    kai: '"DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif',
    arial: 'Arial, "Helvetica Neue", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'
  };
  var DEFAULTS = { body: "sans", head: "serif", size: 10.5, weight: 400, track: 0, lh: 1.6, mv: 15, mh: 16 };
  var RANGES = { size: [9, 12], track: [0, 0.12], lh: [1.3, 2], mv: [8, 25], mh: [8, 25] };

  function cleanSettings(saved) {
    var s = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = saved && Object.prototype.hasOwnProperty.call(saved, k) ? saved[k] : DEFAULTS[k];
      if (k === "body" || k === "head") {
        s[k] = Object.prototype.hasOwnProperty.call(FONTS, v) ? v : DEFAULTS[k];
      } else if (k === "weight") {
        s[k] = [300, 400, 500].indexOf(Number(v)) !== -1 ? Number(v) : DEFAULTS[k];
      } else {
        var n = Number(v);
        s[k] = isFinite(n) && n >= RANGES[k][0] && n <= RANGES[k][1] ? n : DEFAULTS[k];
      }
    });
    return s;
  }
  function loadSettings() {
    var saved = null;
    try { saved = JSON.parse(lsGet(KEY_SETTINGS) || "null"); } catch (e) { saved = null; }
    return cleanSettings(saved);
  }

  /* 下載檔名與 PDF 預設檔名：姓名_履歷 */
  function fileBase(src) {
    var name = parse(src).name;
    name = name && !/⟨/.test(name) ? name.replace(/[\\\/:*?"<>|]/g, "").trim() : "";
    return (name || "我的") + "_履歷";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("rb-input");
    var output = document.getElementById("rb-output");
    if (!input || !output) { return; }
    var status = document.getElementById("rb-status");
    var checks = document.getElementById("rb-checks");
    var tplSelect = document.getElementById("rb-template");
    var fileInput = document.getElementById("rb-file");
    var dialog = document.getElementById("rb-print-dialog");

    TEMPLATES.engineer = input.defaultValue;
    var dirty = false; /* 上次下載或列印之後有沒有再改過 */

    function setStatus(text, warn) {
      if (!status) { return; }
      status.textContent = text;
      status.classList.toggle("rb-warn", Boolean(warn));
    }
    function isTemplate(v) {
      return Object.keys(TEMPLATES).some(function (k) { return TEMPLATES[k].trim() === v.trim(); });
    }
    function renderChecks() {
      if (!checks) { return; }
      checks.innerHTML = check(input.value).map(function (c) {
        return '<li class="' + (c.ok ? "rb-ok" : "rb-todo") + '">' + esc(c.text) + "</li>";
      }).join("");
    }
    function update() {
      output.innerHTML = render(input.value);
      renderChecks();
    }

    var timer = null;
    function persist() {
      timer = null;
      if (lsSet(KEY, input.value)) {
        setStatus(dirty ? "已暫存在這個瀏覽器，還沒下載備份。" : "已暫存在這個瀏覽器。");
      } else {
        setStatus("這個瀏覽器封鎖了本機儲存，內容不會自動暫存，離開前請下載 .md 備份。", true);
      }
    }
    function replaceContent(text, message) {
      if (timer) { clearTimeout(timer); timer = null; }
      input.value = text;
      update();
      lsSet(KEY, text);
      dirty = false;
      setStatus(message);
    }

    var stored = lsGet(KEY);
    if (stored !== null && stored !== "") { input.value = stored; }
    update();

    input.addEventListener("input", function () {
      dirty = true;
      update();
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(persist, 400);
    });
    window.addEventListener("pagehide", function () { if (timer) { clearTimeout(timer); persist(); } });

    /* 離開前提醒：有還沒下載或列印過的修改時，瀏覽器會跳出確認視窗 */
    window.addEventListener("beforeunload", function (e) {
      if (!dirty || isTemplate(input.value)) { return; }
      e.preventDefault();
      e.returnValue = "";
    });

    /* 範例 */
    if (tplSelect) {
      tplSelect.addEventListener("change", function () {
        var key = tplSelect.value;
        tplSelect.value = "";
        if (!TEMPLATES[key]) { return; }
        if (!isTemplate(input.value) && input.value.trim() !== "" &&
            !window.confirm("套用「" + TEMPLATE_NAMES[key] + "」範例會取代你目前的內容，建議先下載 .md 備份。要繼續嗎？")) {
          return;
        }
        replaceContent(TEMPLATES[key], "已套用「" + TEMPLATE_NAMES[key] + "」範例。");
      });
    }

    /* 插入聯絡方式與區塊 */
    Array.prototype.forEach.call(document.querySelectorAll("[data-contact]"), function (btn) {
      btn.addEventListener("click", function () {
        input.value = addContact(input.value, btn.getAttribute("data-contact"));
        input.dispatchEvent(new Event("input"));
        input.focus();
      });
    });
    function applyBlock(def) {
      var v = input.value;
      var at = typeof input.selectionStart === "number" ? input.selectionStart : v.length;
      var r = addBlock(v, at, def);
      input.focus();
      if (r.text !== v) {
        input.value = r.text;
        input.dispatchEvent(new Event("input"));
      }
      input.setSelectionRange(r.caret, r.caret);
      if (r.existed) { setStatus("已經有「" + def.title + "」了，游標移到那一段。"); }
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-block]"), function (btn) {
      btn.addEventListener("click", function () {
        var def = BLOCKS[btn.getAttribute("data-block")];
        if (def) { applyBlock(def); }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (btn) {
      btn.addEventListener("click", function () {
        var line = LANGS[btn.getAttribute("data-lang")];
        if (line) { applyBlock({ title: "語言能力", body: line }); }
      });
    });

    /* 版面設定 */
    var settings = loadSettings();
    var controls = document.querySelectorAll("#rb-settings [data-key]");
    function applySettings() {
      var st = output.style;
      st.setProperty("--rb-font", FONTS[settings.body]);
      st.setProperty("--rb-head-font", FONTS[settings.head]);
      st.setProperty("--rb-size", settings.size + "pt");
      st.setProperty("--rb-weight", String(settings.weight));
      st.setProperty("--rb-track", settings.track + "em");
      st.setProperty("--rb-lh", String(settings.lh));
      st.setProperty("--rb-mv", settings.mv + "mm");
      st.setProperty("--rb-mh", settings.mh + "mm");
      var labels = {
        size: settings.size + " pt",
        track: settings.track === 0 ? "無" : settings.track.toFixed(2) + " 字寬",
        lh: settings.lh.toFixed(2) + " 倍",
        mv: settings.mv + " mm",
        mh: settings.mh + " mm"
      };
      Object.keys(labels).forEach(function (k) {
        var o = document.getElementById("rb-out-" + k);
        if (o) { o.textContent = labels[k]; }
      });
    }
    function syncControls() {
      Array.prototype.forEach.call(controls, function (el) {
        el.value = String(settings[el.getAttribute("data-key")]);
      });
    }
    Array.prototype.forEach.call(controls, function (el) {
      el.addEventListener("input", function () {
        var k = el.getAttribute("data-key");
        var next = {};
        Object.keys(settings).forEach(function (x) { next[x] = settings[x]; });
        next[k] = el.value;
        settings = cleanSettings(next);
        applySettings();
        lsSet(KEY_SETTINGS, JSON.stringify(settings));
      });
    });
    var settingsReset = document.getElementById("rb-settings-reset");
    if (settingsReset) {
      settingsReset.addEventListener("click", function () {
        settings = cleanSettings(null);
        lsDel(KEY_SETTINGS);
        syncControls();
        applySettings();
      });
    }
    syncControls();
    applySettings();

    /* 下載與開啟 .md */
    var dl = document.getElementById("rb-download");
    if (dl) {
      dl.addEventListener("click", function () {
        var blob = new Blob([input.value], { type: "text/markdown;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = fileBase(input.value) + ".md";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        dirty = false;
        setStatus("已下載 " + a.download + "，下次可以用「開啟 .md 檔」接著編輯。");
      });
    }
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        fileInput.value = "";
        if (!f) { return; }
        if (!isTemplate(input.value) && input.value.trim() !== "" &&
            !window.confirm("開啟「" + f.name + "」會取代你目前的內容。要繼續嗎？")) {
          return;
        }
        var reader = new FileReader();
        reader.onload = function () { replaceContent(String(reader.result), "已開啟 " + f.name + "。"); };
        reader.onerror = function () { setStatus("讀不到這個檔案，請確認是文字檔（.md 或 .txt）。", true); };
        reader.readAsText(f, "utf-8");
      });
    }

    /* 列印：PDF 預設檔名跟著姓名走，印完視為已備份 */
    var originalTitle = document.title;
    window.addEventListener("beforeprint", function () { document.title = fileBase(input.value); });
    window.addEventListener("afterprint", function () {
      document.title = originalTitle;
      dirty = false;
    });

    var printBtn = document.getElementById("rb-print");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        if (dialog && typeof dialog.showModal === "function" && lsGet(KEY_MUTE_TIP) !== "1") {
          dialog.showModal();
        } else {
          window.print();
        }
      });
    }
    if (dialog) {
      var go = document.getElementById("rb-print-go");
      var cancel = document.getElementById("rb-print-cancel");
      var mute = document.getElementById("rb-print-mute");
      if (go) {
        go.addEventListener("click", function () {
          if (mute && mute.checked) { lsSet(KEY_MUTE_TIP, "1"); }
          dialog.close();
          /* 等對話框關掉、畫面重畫後再開列印視窗 */
          setTimeout(function () { window.print(); }, 50);
        });
      }
      if (cancel) { cancel.addEventListener("click", function () { dialog.close(); }); }
    }

    var resetBtn = document.getElementById("rb-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!window.confirm("確定要清除你目前的內容，還原成範例嗎？清除後無法復原。")) { return; }
        lsDel(KEY);
        replaceContent(input.defaultValue, "已還原成範例。");
      });
    }
  });

  /* 給測試用：不影響頁面 */
  window.ResumeBuilder = {
    parse: parse, render: render, inline: inline, check: check, addContact: addContact,
    addBlock: addBlock, BLOCKS: BLOCKS, LANGS: LANGS
  };
})();
