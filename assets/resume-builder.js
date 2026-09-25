/* 履歷範本編輯器：簡化 Markdown 解析、即時預覽、本機暫存 */
(function () {
  "use strict";

  var KEY = "jh-resume-builder:v1";

  /* localStorage 可能被封鎖，一律包 try/catch；失敗時回傳 false，頁面照常運作 */
  function load() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); return true; } catch (e) { return false; }
  }
  function clear() {
    try { localStorage.removeItem(KEY); return true; } catch (e) { return false; }
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

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("rb-input");
    var output = document.getElementById("rb-output");
    var status = document.getElementById("rb-status");
    var printBtn = document.getElementById("rb-print");
    var resetBtn = document.getElementById("rb-reset");
    if (!input || !output) { return; }

    function setStatus(text, warn) {
      if (!status) { return; }
      status.textContent = text;
      status.classList.toggle("rb-warn", Boolean(warn));
    }
    function update() { output.innerHTML = render(input.value); }

    var stored = load();
    if (stored !== null && stored !== "") { input.value = stored; }
    update();

    var timer = null;
    function persist() {
      timer = null;
      if (save(input.value)) {
        setStatus("已自動暫存。");
      } else {
        setStatus("這個瀏覽器封鎖了本機儲存，內容不會自動暫存，離開前請自行備份。", true);
      }
    }
    input.addEventListener("input", function () {
      update();
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(persist, 400);
    });
    window.addEventListener("pagehide", function () { if (timer) { clearTimeout(timer); persist(); } });

    if (printBtn) {
      printBtn.addEventListener("click", function () { window.print(); });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!window.confirm("確定要清除你目前的內容，還原成範例嗎？清除後無法復原。")) { return; }
        if (timer) { clearTimeout(timer); timer = null; }
        clear();
        input.value = input.defaultValue;
        update();
        setStatus("已還原成範例。");
      });
    }
  });

  /* 給測試用：不影響頁面 */
  window.ResumeBuilder = { parse: parse, render: render, inline: inline };
})();
