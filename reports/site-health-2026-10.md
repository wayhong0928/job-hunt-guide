# 全站健檢報告（2026-10）

- 範圍與日期：index.html、docs/*.md 產生的 7 個 pages/*.html，以及手寫的 resume-builder.html，共 9 頁；2026-10-05 檢查。重跑：`python scripts/site_health.py`
- 連結：內部 273 個（含錨點與資源檔）、外部 107 個不重複網址；發現 25、修 1、確認不需修改 0、留給人工 24
- 手機版（375×812）：9 頁；溢出 0 頁、修 0、留給人工 0；修正後 0 頁溢出
- 無障礙：9 頁；發現 80、修 30、留給人工 50
- build：無錯誤、無輸出警告；產物與 commit 只差 `data-updated` 時間戳（沒有人手改 HTML）；發現 2、修 0、留給人工 2
- 外部連結數量核對：docs 內出現 113 次、107 個不重複網址；直接用正規式數 docs/*.md 原文也是 113 次、107 個，與腳本實際請求的網址一致
- 本次只動連結、標題層級、Markdown 跳脫與 CSS，沒有改文章文字；pages/*.html 全部由 build.py 重新產生

## 檢查方式

- 腳本：`scripts/site_health.py`。它把整個 repo 複製到暫存目錄再跑 build.py，工作目錄不會被改到；所有檢查都對暫存目錄的產出進行。
- 內部連結：解析每頁 HTML 的 `href`／`src`，確認檔案存在、`#錨點` 對得到目標頁的 `id`。另外檢查 Markdown 表格有沒有某一列欄數多於表頭（多出的欄會被 Python-Markdown 直接丟掉）。
- 外部連結：先 HEAD，失敗再 GET；逾時 15 秒；User-Agent 用一般 Chrome 的字串。分類為正常、404/410、跳到別的網域、逾時、403/429（需人工確認）、連線錯誤，以及「執行環境擋住」（見下）。`doi.org` 本來就是轉址服務，轉到出版社網域算正常。
- 手機版：Playwright（Chromium）以 375×812 開每一頁，比較 `document.documentElement.scrollWidth` 與 `window.innerWidth`，再找出右緣超出畫面、而且不在可捲動容器裡的最內層元素。
- 無障礙：同樣用 Playwright 開頁（1280×900），在亮色與暗色兩種 `prefers-color-scheme` 下檢查 html lang、img alt、標題跳級、連結文字、表單控制項名稱，以及每個有文字的元素實際算出來的文字色與背景色對比（一般文字 4.5:1，大字 3:1；背景由下往上合成，漸層底色也算）。
- build：一般執行 `python build.py` 看輸出；另外用 `python -W default build.py` 打開 Python 警告再跑一次；最後逐檔比對產物與 repo 裡的版本。

## 一、連結

內部連結：273 個，全部指得到存在的檔案與標題，沒有需要修的。另有 63 個連結指向的錨點是 Python-Markdown 依標題順序自動編的（`#_5`、`#42` 這類，中文標題沒有英數字可用時產生），目前都對得上，但前面增刪標題就會指錯，列在「留給人工」。

外部連結數量：docs 內出現 113 次、107 個不重複網址；直接用正規式數 docs/*.md 原文也是 113 次、107 個；樣板與 resume-builder.html 沒有外部連結。腳本實際請求 107 個不重複網址。

本次結果：403/429（需人工確認） 20、404/410 4、正常 83（「跳到別的網域」等數字是修正後的重跑結果，已替換的連結不在其中）。

下表列出所有不是「正常」的連結，加上已修正的項目：

| 頁面（來源） | 連結 | 狀態 | 處置 |
|---|---|---|---|
| pages/cross-domain-narrative.html（docs/cross-domain-narrative.md:76）、pages/toolbox.html（docs/toolbox.md:302） | https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning | 跳到別的網域：301 永久轉址 → docs.cloud.google.com | **已替換**為 https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning （兩處）。確認依據：(1) 轉址由 cloud.google.com 自己以 301 發出，路徑完全相同；(2) 新頁標題是「MLOps: Continuous delivery and automation pipelines in machine learning」，與 toolbox.md 列的篇名一致；(3) 新頁 canonical 就是這個網址 |
| docs/toolbox.md:172 | https://cdn-careerservices.fas.harvard.edu/wp-content/uploads/sites/161/2024/10/2024-HES_resume-and-letter.pdf | 404/410：404 | 沒有替換，留給人工。同表 toolbox.md:170 的 HES 頁面現在只連到 2026/02/HES-Resume-samples-combined.pdf，檔名與標題都不同，無法確認是同一份文件 |
| docs/toolbox.md:175 | https://ocs.yale.edu/resources/resume-formatting/ | 404/410：404 | 沒有替換，留給人工。Yale OCS 站內找不到同名新頁（試過 /resume-formatting/、/resources/resume-formatting-and-common-errors/ 都是 404）；搜尋引擎仍收錄舊網址 |
| docs/toolbox.md:176 | https://ocs.yale.edu/channels/job-offers-salary-negotiations/ | 404/410：404 | 沒有替換，留給人工。Yale OCS 站內找不到同名新頁（試過 /job-offers-salary-negotiation/ 等路徑也是 404） |
| docs/toolbox.md:213 | https://help.cake.me/en/support/solutions/articles/60000355185-how-to-create-a-new-resume- | 404/410：404 | 沒有替換，留給人工。這一列本來就標「舊版說明，2024」，新版已列在 toolbox.md:212；換成新版會變成重複的兩列，刪列屬於內容調整 |
| docs/toolbox.md:180 | https://careercenter.umich.edu/content/interviewing-resources | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:204 | https://www.104.com.tw/faq/resume | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:205 | https://www.104.com.tw/faq/apply | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:231 | https://www.tealhq.com/post/resume-red-flags | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:234 | https://www.monster.com/career-advice/resume/one-page-vs-two-page-resume | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:235 | https://www.indeed.com/career-advice/resumes-cover-letters/how-long-should-a-resume-be | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:236 | https://www.indeed.com/career-advice/resumes-cover-letters/action-verbs | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:237 | https://www.indeed.com/career-advice/resumes-cover-letters/automated-screening-resume | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:238 | https://www.indeed.com/career-advice/resumes-cover-letters/ats-resume-template | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:239 | https://www.jobscan.co/blog/resume-tables-columns-ats/ | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:253 | https://www.bls.gov/ooh/computer-and-information-technology/computer-systems-analysts.htm | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:254 | https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:255 | https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:258 | https://www.indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:259 | https://www.indeed.com/career-advice/interviewing/how-to-answer-question-you-dont-know | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:261 | https://www.indeed.com/career-advice/career-development/how-to-ask-for-help-at-work | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:264 | https://medium.com/javarevisited/top-8-resources-to-crack-the-system-design-and-coding-interviews-in-2026-51d32eac6c07 | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:278 | https://www.hackingthecaseinterview.com/pages/questions-to-ask-end-of-consulting-interview | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:284 | https://www.jobscan.co/blog/career-change-resume/ | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |
| docs/toolbox.md:289 | https://www.forbes.com/sites/cherylrobinson/2024/05/03/the-ultimate-guide-to-writing-a-career-change-resume/ | 403/429（需人工確認）：GET 403 | 沒有修改，需人工確認。網站擋自動化請求（多為 Cloudflare 等防護），不算壞連結；請用瀏覽器開啟確認 |


## 二、手機版溢出（375×812）

修正前 0 頁溢出，修正後 0 頁。

| 頁面 | 元素 | 處置 |
|---|---|---|
| 全部 9 頁 | 沒有溢出（表格已是可水平捲動的區塊、pre 有 overflow-x: auto、首頁流程圖在窄螢幕改直排） | 沒有需要修的。姊妹站 ai-agent-notes、mis-thesis-guide 與本站共用同一份 style.css，它們因長網址、長行內程式碼溢出而加的 `.doc { overflow-wrap: break-word; }` 這裡也同步加入，保持三份樣式一致（預防用，不影響目前版面） |

## 三、無障礙

| 頁面 | 問題 | 處置 |
|---|---|---|
| 全部 9 頁 | html lang、img alt、連結文字 | 沒有問題：每頁都有 `lang="zh-Hant"`；沒有缺 alt 的圖片；沒有「這裡」「點此」之類的連結文字 |
| 全部 9 頁 | 標題跳級 | 沒有問題 |
| 全站（同上），以及 resume-builder.html 的「編輯／預覽」標題、提示文字、字級數值 | 對比不足：亮色：`--ink-faint` #8b857a 在 #fbfaf7／#f3f1eb／#ffffff 上只有 3.24–3.66:1 | **已修**：`--ink-faint` 改 #706b62（同色相調暗），對比 4.61–5.29:1；resume-builder.css 直接沿用同一個變數，不用另外改 |
| 全站（同上） | 對比不足：暗色：`--ink-faint` #857f74 在側欄 #1e1d1a 上 4.24:1、在面板 #1c1b18 上 4.33:1 | **已修**：暗色 `--ink-faint` 改 #8f8a7f，對比 4.62–5.31:1 |
| 有提示框的頁面 | 對比不足：提示框標題（warning／danger）用框線色 `--warn-rule` 當文字色：亮色 #d9a45b 對 #fdf3e7 只有 2.03:1；暗色 #a8763a 對 #2c231a 3.9:1 | **已修**：新增文字專用的 `--warn-ink`（亮 #916222、暗 #b98240，對比 4.82／4.65:1），框線仍用 `--warn-rule` |
| 有提示框的頁面 | 對比不足：提示框標題（tip／note）用 `--ok-rule`：亮色 #7fa06f 對 #eef5ec 2.64:1；暗色 #5f7a52 對 #1e2a1e 3.13:1 | **已修**：新增 `--ok-ink`（亮 #58734c、暗 #779866，對比 4.76／4.6:1），框線不變 |
| 全站 | 對比不足：「跳到主要內容」連結（鍵盤 Tab 時出現）：暗色是白字 #fff 配 `--accent` #d9a173，2.26:1 | **已修**：文字色改 `var(--panel)`，亮色仍是白字（7.39:1），暗色變深色字（7.62:1） |
| pages/toolbox.html（29）、pages/cover-letter.html（8）、pages/cross-domain-narrative.html（7）、pages/interview-prep.html（6） | 檢查清單的 checkbox 沒有可讀出的名稱，共 50 個：build.py 把 `- [ ]` 換成 `<input type="checkbox">`，後面的文字沒有用 `<label>` 綁定，螢幕報讀器只會念「核取方塊，未勾選」 | 沒有修改，留給人工（理由見「留給人工」） |

修正後重跑：對比不足 0 組、標題跳級 0、缺 alt 0、缺 lang 0。

## 四、build

| 項目 | 結果 | 處置 |
|---|---|---|
| `python build.py` | 結束碼 0，沒有警告或錯誤訊息 | — |
| `python -W default build.py` | 每讀一個來源檔出現一次 `ResourceWarning: unclosed file`：build.py 第 251、258、281 行的 `open(...).read()` 沒有關檔 | 不影響產物。沒有修改，留給人工 |
| 產物與 commit 比對 | 修正前：9 個檔只差 `data-updated="…"` 時間戳，其餘內容逐位元相同，沒有手改過的 HTML | 這次重新 build，時間戳已同步；成因在 build.py，留給人工（見下） |
| 修正後比對 | 10 個產物與工作目錄完全相同 | — |

## 留給人工

1. **外部連結：24 筆**（明細與各自的理由見第一節表格「處置」欄）。共通原則：找不到能確認是同一份文件的官方新網址就不替換；403/429 是網站擋機器人，不算壞連結，需要用瀏覽器確認。
2. **github.com 連結無法在這個環境檢查**：雲端執行環境的 GitHub 代理只開放本次作業的 repo，其餘 github.com 網址都回 403。這不是 GitHub 的回應，所以不能判定壞掉，也不能判定正常；請在一般網路環境執行 `python scripts/site_health.py --skip-browser` 重測。
3. **指向自動編號錨點的連結（63 個）**：目前都有效，但 `#_5` 這種 id 依標題出現順序產生，前面多一個或少一個中文標題就會整批位移、指到錯的段落。根治要在 build.py 設定 toc 的 `slugify`（例如保留中文字），屬於建置邏輯變更，而且會改掉所有現有錨點，需要人工決定。腳本的 JSON 輸出（`--json`）有完整清單。
4. **`data-updated` 時間戳每次提交都會落後**：build.py 用「來源檔最後一次 git 提交時間」當時間戳，但 HTML 是在提交前產生的，所以 commit 裡的 HTML 永遠記著上一次的時間，下一次任何人重建都會出現一批只有時間戳的變動。要改得改 build.py 的設計（例如改用檔案內容的雜湊判斷、或提交後再重建一次），超出這次可以自動修的範圍。腳本比對時已把這種差異和真正的內容差異分開。
5. **build.py 的 `ResourceWarning`**：改成 `with open(...) as f:` 即可，但這是建置程式碼，不在這次允許修改的範圍。
6. **檢查清單的 checkbox 沒有名稱（50 個）**：修法是讓 build.py 第 290 行附近產生的 `<input>` 用 `<label>` 包住後面的文字（或加 `aria-labelledby`）。這要改 build.py 的輸出結構，`assets/site.js` 記憶勾選狀態的選擇器也要一起確認，不屬於這次列出的機械性修正，也需要確認版面不受影響。

## 這次沒有檢查的部分

- 「soft 404」：網站回 200 但內容已經換成別的頁面，自動檢查看不出來。
- 滑鼠移過（hover）與鍵盤焦點狀態的對比只檢查了「跳到主要內容」連結；其他 hover 樣式沒有算。
- 手機版是在容器裡的 Chromium 跑的，系統中文字型是文泉驛正黑，不是 style.css 指定的思源黑體；字寬略有差異，所以溢出的修法用 `overflow-wrap`，不依賴特定字寬。
- 錯字與文章觀點不在本次範圍。
