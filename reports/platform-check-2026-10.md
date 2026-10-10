# 平台事實查核報告（2026-10）

- 範圍與日期：docs/*.md 共 7 頁全部讀過，其中 5 頁含可查證的平台事實（platforms、interview-prep、cover-letter、resume-writing、toolbox）；2026-10-10 查核
- 事實：共列出 51 條可查證的平台事實（同一事實出現在多頁時算 1 條）
- 判定：仍正確 42、已過時 0、查無 4、無法判定 5
- 修改：0 處。沒有任何一條能找到官方原文寫的跟本站不一樣，所以 docs/*.md 一個字都沒改，也沒有更新任何頁面的查證日期
- build：`python3 build.py` 執行無錯誤；因為 docs 沒有改動，重新產生的 pages/*.html 跟 repo 裡的版本完全一樣
- 出處只用平台官方網域（linkedin.com 說明中心與官方部落格、104.com.tw 常見問題、blog.104.com.tw「104職場力」、help.cake.me、cake.me）；第三方網站一律不採計
- 沒有登入任何平台。104 與 Yourator 的頁面會先跳 Cloudflare 安全驗證，104 用一般瀏覽器（Chromium，未登入）開得到內容，Yourator 開不到；Indeed 對本查核環境一律回 403

## 查核方式

1. 逐頁讀 docs/*.md，挑出提到平台功能、欄位名稱、字數／數量上限、公開設定與「平台官方建議」的句子。寫作建議、觀點、經驗談，以及沒有指名來源的一般性說法都不查。toolbox.md checklist 的題目只是把 platforms.md 的事實改寫成問句，所以併在 platforms.md 的對應條目裡，不另外計數。
2. 每一條都到官方頁面找原文。說明中心頁面先用 curl 抓；遇到 Cloudflare 驗證（104）時改用 headless Chromium 開頁、讀取頁面文字，全程沒有登入。
3. 判定標準：
   - **仍正確**：官方原文跟本站說法一致。
   - **已過時**：官方原文明確寫的不一樣。
   - **查無**：官方頁面看得到，但找不到這件事。
   - **無法判定**：官方頁面打不開，或答案只在要登入的頁面裡。

## 已過時（修改清單）

本次沒有「已過時」的事實，因此沒有修改。

| 頁面 | 原句 | 官方原文（逐字） | 出處網址 | 改成什麼 |
|---|---|---|---|---|
| （無） | — | — | — | — |

## 查無／無法判定

| # | 頁面 | 原句 | 判定 | 查了哪些地方 | 為什麼判不了 |
|---|---|---|---|---|---|
| N1 | platforms.md 2.1 | 「Headline 出現在每個搜尋結果與邀請請求裡，也是 LinkedIn 內部關鍵字比對權重最高的欄位。」 | 查無 | LinkedIn Help：Create a good LinkedIn profile（a554351）、Your LinkedIn profile（a564064）、Edit the About section（a553140）、Manage your Experience section（a593695）；LinkedIn Talent Blog「10 Profile Headlines」；LinkedIn Sales Blog「12 steps to a better LinkedIn profile in 2025」；以 linkedin.com/help 為範圍搜尋 | 官方頁面只說 Headline 會顯示在姓名下方、可以自己改寫，找不到「出現在每個搜尋結果與邀請」或「關鍵字權重最高」的說法。官方沒有公開搜尋排序權重 |
| N2 | platforms.md 2.1 | 「同時做到三件事最理想：清楚陳述目前角色或目標角色、點出一到兩個具體技能或專長、暗示你能帶來的價值。」 | 查無 | 同 N1，特別逐段讀了 Talent Blog「10 Profile Headlines」全文 | 官方部落格的寫法是 “treat it like a mission statement — encapsulating who you are and why people should connect with you”，以及 “You get 220 characters”。「三件事」這個拆法在官方頁面找不到，可能是本站自己整理的，但句子讀起來像是在轉述官方部落格 |
| N3 | platforms.md 2.2 | 「但只有前 200 到 300 字元會在『顯示更多』被點開前露出」 | 查無 | LinkedIn Help a553140、a554351；Talent Blog「14 Profile Summary Examples」 | 官方只寫了 About 的上限（“2,600 characters max”），找不到收合前顯示幾個字元。實際顯示多少也會因裝置與版面而不同 |
| N4 | platforms.md 2.2 | 「招募者初次瀏覽個人檔案的時間很短，Headline、大頭照、About 三者是優先優化的順序。」 | 查無 | 同 N1、N3 | 官方頁面找不到招募者瀏覽時間的數據，也找不到這三個欄位的優先順序。官方只有 “Members with a profile photo on LinkedIn receive up to 2X more profile views.” |
| U1 | platforms.md 3.2 | 「……這只是舊版建議，並非現行系統的硬性字數限制」 | 無法判定 | 104 常見問題「履歷刊登／修改」（/faq/resume）、「主動應徵」（/faq/apply）、「履歷開關／隱私設定」（/faq/resume-privacy） | 常見問題沒有提到自傳欄位的字數上限。要確認系統實際上限只能進履歷編輯頁，必須登入，依規定不嘗試登入。（前半句「過去有平台文章建議新鮮人自傳約八百到一千字、分三段」則確認仍正確，見 F25。） |
| U2 | interview-prep.md 三 | 「Indeed 的面試準備指南指出，面試官問這題不是要你把履歷再念一次，而是想藉此初步判斷你的資格是否切合這個職缺……」 | 無法判定 | indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself | 不管用 curl、WebFetch 還是一般瀏覽器，indeed.com 對本查核環境都回 HTTP 403，讀不到原文。這不是登入牆，是對方拒絕連線 |
| U3 | interview-prep.md 六 | 「Indeed 提到，面試官出這類題目，常是想看你在不熟悉的狀況下能不能想辦法解決問題」 | 無法判定 | indeed.com/career-advice/interviewing/how-to-answer-question-you-dont-know | 同 U2，HTTP 403 |
| U4 | interview-prep.md 六 | 「Indeed 對職場求助時機的建議是，先自己試過、列出已經嘗試的解法，再去找對的人，並讓對方知道這件事的急迫程度」 | 無法判定 | indeed.com/career-advice/career-development/how-to-ask-for-help-at-work | 同 U2，HTTP 403 |
| U5 | interview-prep.md 七 | 「迴避直接報數字時可以說『期望待遇不低於某個數字』或『跟我資歷相近的人大概能拿多少』……也不要謊報前公司薪水，因為許多公司核薪會要求提供薪資證明」 | 無法判定 | 104職場力「談薪水 9 招」（blog.104.com.tw/salary-talk-guide/）、「人資教你薪資談判 6 大重點」（blog.104.com.tw/how-to-negotiate-salary/）；Yourator「期望薪資怎麼回答」（yourator.co/articles/269） | 兩篇 104 文章裡找不到這三種說法（同一段的「先做功課了解市場平均薪資」「避免說依公司規定」「最後再談薪資」都找得到，見 F42）。原句寫的是「104 等平台」，另一個來源 Yourator 停在安全驗證頁，讀不到內容，所以沒辦法確認這幾句出自哪個平台 |

## 仍正確（逐條依據）

不在修改範圍內，附上關鍵原文方便下次查核比對。

| # | 頁面 | 事實 | 官方依據（原文摘錄） | 出處 |
|---|---|---|---|---|
| F1 | platforms.md 一（表格） | LinkedIn 的語氣可以用第一人稱 | “That also means using the first-person” | <https://www.linkedin.com/business/talent/blog/product-tips/linkedin-profile-summaries-that-we-love-and-how-to-boost-your-own> |
| F2 | platforms.md 一（表格） | LinkedIn 欄位名稱：Headline、About、Experience、Skills、Featured | 說明中心各篇標題與內文都用這些名稱，例如 “Edit the About section on your profile”、“Manage your profile Experience section”、“The Featured section allows you to showcase samples of your work” | a553140、a593695、a550399 |
| F3 | platforms.md 一（表格） | Cake 欄位名稱：Profile、Resume、Portfolio | “Go to Profile > Featured Portfolio .”、“click your profile picture in the top-right corner and select " My Resumes "” | <https://help.cake.me/en/articles/11532155-how-to-feature-resumes-or-portfolios-on-your-profile> |
| F4 | platforms.md 一（表格）／三 | 104 欄位名稱：希望職稱／職類、工作經歷、專案成就、自傳 | 「1.希望職稱／職類（企業搜尋關鍵欄位）」「4.工作經歷」「6.專案成就 / 自訂內容」「7.自傳」 | <https://blog.104.com.tw/104-resume-conferences/> |
| F5 | platforms.md 2.1 | LinkedIn 官方部落格把 Headline 形容為個人的廣告或使命陳述 | “That profile headline is your own personal ad. That’s why you should treat it like a mission statement” | <https://www.linkedin.com/business/talent/blog/product-tips/recruiters-with-eye-catching-linkedin-profile-headlines> |
| F6 | platforms.md 2.1 | Headline 不需要只是複製現職職稱 | “There’s no rule that says the description at the top of your profile page has to be just a job title.” | <https://www.linkedin.com/business/sales/blog/profile-best-practices/17-steps-to-a-better-linkedin-profile-in-2017> |
| F7 | platforms.md 2.2 | About 欄位有 2,600 字元可用 | “It’s an open-ended space (sort of; 2,600 characters max)” | <https://www.linkedin.com/business/talent/blog/product-tips/linkedin-profile-summaries-that-we-love-and-how-to-boost-your-own> |
| F8 | platforms.md 2.2 | LinkedIn 官方建議 About 用一到兩段或條列呈現 | “Ideally, you should limit the text to one or two paragraphs while filling this section. You can use bullet points if you’re not comfortable with writing paragraphs.” | <https://www.linkedin.com/help/linkedin/answer/a554351/how-do-i-create-a-good-linkedin-profile-?lang=en> |
| F9 | platforms.md 2.3、toolbox.md 1.2 | 組織關聯必須真實；正式實習可列入；客戶、產品使用者等非任職關係不能寫成經歷 | “Associations with organizations in the Experience section of your profile must be accurately labeled and must reflect professional experience with the named organization, such as employment, contract work, official internship or volunteer experience, board service, among others. Informal associations or non-professional experience with organizations shouldn't be included, such as a customer or user of an organization's products or services.” | <https://www.linkedin.com/help/linkedin/answer/a593695/manage-your-experience-section?lang=en> |
| F10 | platforms.md 2.4 | Skills 官方上限 100 項 | “You can add a maximum of 100 skills to your profile.” | <https://www.linkedin.com/help/linkedin/answer/a568137/display-order-of-skills?lang=en> |
| F11 | platforms.md 2.4 | Skills 可以自己排序 | “You can only reorder the Education and Skills sections on your profile.” | 同 F10 |
| F12 | platforms.md 2.4 | Featured 可以放貼文、文章、外部連結、圖片、文件、簡報、影片 | “LinkedIn posts that you’ve created or re-shared. / Articles that you’ve authored and published on LinkedIn. / Links to external websites, for example your personal blog or portfolio. / Media that you can upload, for example your images, documents, presentations, and videos.” | <https://www.linkedin.com/help/linkedin/answer/a550399/feature-samples-of-your-work-on-your-linkedin-profile> |
| F13 | platforms.md 2.4 | Featured 是適合放能力證據的位置 | “This is a great way to provide evidence of your skills and experience.” | 同 F12 |
| F14 | platforms.md 二 | LinkedIn 可以呈現推薦、作品等履歷以外的內容 | “Recommendations - You can request professional recommendations from your peers.”、“Projects - Showcase the projects you've worked on” | <https://www.linkedin.com/help/linkedin/answer/a564064/your-linkedin-profile-overview?lang=en> |
| F15 | platforms.md 三、toolbox.md 1.3 | 希望職稱／職類影響企業搜尋與配對，不宜寫「不拘」或混列不相關職類 | 「履歷表『求職條件 – 希望職稱/職類』這2個欄位，是對應企業搜尋條件最重要的欄位」「不可太多元，讓企業覺得你三心二意」「不可寫『不拘、正職』這種不明確的職稱」 | <https://blog.104.com.tw/104-resume-conferences/> |
| F16 | platforms.md 三 | 開放的履歷會被配對給求才公司，企業也可以主動搜尋 | 「系統會依據您履歷表所設定的條件，將您的履歷表配對給符合條件的求才公司，且求才公司也可透過104網站上的求才專區搜尋您的履歷表。」 | <https://www.104.com.tw/faq/resume> |
| F17 | platforms.md 3.1 | 可以填多筆工作經歷，應優先挑相關、近期或能展現優勢的經歷 | 「工作經驗可以寫20個，要如何挑適合的填寫？」「優先挑選能表現自己優勢的幾個工作」「填寫距您目前最近的幾個工作經驗」 | <https://www.104.com.tw/faq/resume> |
| F18 | platforms.md 3.1、toolbox.md 1.3 | 重要專案寫進「專案成就」，不要只放附件 | 「把作品附件精華寫在『專案成就』，避免企業快速篩選沒看到」 | <https://blog.104.com.tw/104-resume-conferences/> |
| F19 | platforms.md 3.2、toolbox.md 1.3 | 自傳不建議從家庭背景寫起 | 「不需要從家裡多少人這種和工作無關的內容介紹起」 | <https://blog.104.com.tw/104-resume-conferences/> |
| F20 | platforms.md 3.3 | 只能同時開放一份履歷 | 「目前一位求職者僅能開放一份履歷給企業查看。」 | <https://www.104.com.tw/faq/resume> |
| F21 | platforms.md 3.3 | 履歷關閉時仍可以主動應徵，只是企業搜尋不到 | 「無論您的履歷表為開放、部份開放或關閉的狀態，都可以對公司送出主動應徵履歷資料」「唯獨履歷關閉狀態，公司無法主動查詢到您的履歷表。」 | <https://www.104.com.tw/faq/apply> |
| F22 | platforms.md 3.3 | 投遞時建立「履歷快照」，之後修改不會回寫；可以依公司客製 | 「應徵後，無法更改履歷快照內容」「您可以針對應徵不同的公司或職務，撰寫與投遞不同的履歷內容」 | <https://www.104.com.tw/faq/apply> |
| F23 | platforms.md 3.3、cover-letter.md 一 | 投遞時可以另外附上自我推薦信 | 「請依序依畫面引導，完成應徵前的自我推薦信填寫，再送出即可。」 | <https://www.104.com.tw/faq/apply> |
| F24 | platforms.md 3.3 | 下載只提供 PDF；沒有完整英文履歷，只有英文自傳欄；建議另做檔案上傳附件 | 「目前僅提供下載PDF檔功能」「目前104人力銀行未提供完整的英文履歷表供求職者使用，僅有在自傳欄位中放置英文自傳欄位。」「再將此檔案上傳於您的履歷附件中」 | <https://www.104.com.tw/faq/resume> |
| F25 | platforms.md 3.2 | 過去有平台文章建議新鮮人自傳約八百到一千字、分三段 | 「自傳的字數不用太多，800~1000字即可，內容分三段」（2020.04.20 文章） | <https://blog.104.com.tw/how-to-write-a-resume-autobiography-3-steps-suggest-for-you/> |
| F26 | platforms.md 四 | Cake 可以從空白或現成模板建立履歷 | “Choose to create a blank resume , or a resume template .” | <https://help.cake.me/en/articles/11532127-how-to-create-a-new-resume> |
| F27 | platforms.md 四 | 個人檔案完成度達一定比例時，可以直接從個人檔案產生履歷 | “When your profile reaches 75% completion , click “ Export Resume " and click “Create from profile” .” | 同 F26 |
| F28 | platforms.md 四 | 作品集支援圖片、影片、文字、連結分享 | “create and format your portfolio easily, with images, videos, texts, and etc.”、“Share Your Work with Links” | <https://www.cake.me/online-portfolio> |
| F29 | platforms.md 四 | 作品集採響應式版面 | “Yes, Cake Online Portfolio supports responsive web design (RWD).” | 同 F28 |
| F30 | platforms.md 四 | 作品集可以跟履歷互相連結 | “Cake provides three ways to link your resume with your portfolio.” | <https://help.cake.me/en/articles/11532189-how-to-link-my-portfolio-to-resume-on-cake> |
| F31 | platforms.md 四、toolbox.md 1.3 | 個人檔案可以精選有限數量的作品集與履歷（本站沒寫數字，請讀者以平台介面為準） | “Select up to 2 portfolios to feature on your profile.”、“Select up to 2 resumes to feature on your profile.” | <https://help.cake.me/en/articles/11532155-how-to-feature-resumes-or-portfolios-on-your-profile> |
| F32 | platforms.md 四 | 作品集要先發布、履歷要設為公開，才能被精選 | “Note: Portfolios must be published before they can be displayed in the Featured Portfolio section.”、“Note: Resumes must be set to public before they can be displayed in the Featured Resume section.” | 同 F31 |
| F33 | platforms.md 四 | 可以上傳 PDF 當作對外分享的履歷 | “Select Upload PDF .” | 同 F31 |
| F34 | platforms.md 四 | Cake AI 履歷健檢分析格式、關鍵字、可讀性，跟職缺比對並給分 | 頁面標題「Cake AI 履歷健檢：掌握履歷評分，搭配 AI 優化您的履歷！」；功能區塊標題「格式」「關鍵字」「可讀性」；「Cake AI 將您的履歷與職缺描述進行比對後，條列出清晰的修改建議」 | <https://www.cake.me/ai-resume-checker?locale=zh-TW> |
| F35 | platforms.md 四 | 查無官方保證健檢必然能通過所有企業的 ATS | 官方頁面只寫「不只幫助您通過應徵者追蹤系統（ATS）篩選」「提升您實際獲得面試的機會」，是協助性質的說法，找不到保證通過所有 ATS 的字句；說明中心 “Explanations on Resume Styles and Suggestions” 也只說 “provides suggestions … for your reference” | 同 F34；<https://help.cake.me/en/articles/11957595-explanations-on-resume-styles-and-suggestions-in-cake-ai-s-ats-resume-checker> |
| F36 | resume-writing.md 五 | 104 等台灣平台可能提供照片欄位 | 「2.個人照（面試機會差3倍）」 | <https://blog.104.com.tw/104-resume-conferences/> |
| F37 | interview-prep.md 三 | 104職場力一分鐘版分成三段：個人資訊、重要經歷與優勢能力、表達願景 | 「一分鐘自我介紹的內容 1 總括自己的個人資訊 … 2 個人重要經歷、業績＋重要優勢能力（與職位相關的） … 3 表達願景」 | <https://blog.104.com.tw/three-principles-of-self-introduction/> |
| F38 | interview-prep.md 三 | 三分鐘版再細分成五段 | 「三分鐘自我介紹的內容 1 總括自己的個人資訊 … 5 表達願景」 | 同 F37 |
| F39 | interview-prep.md 三 | Cake 給的是個人資訊、應徵優勢、職涯展望三步驟 | 「會先根據個人資訊、應徵優勢、職涯展望等 3 步驟，先建立自我介紹內容架構」 | <https://www.cake.me/resources/interview-guide/introduce-yourself-in-an-interview?locale=zh-TW> |
| F40 | interview-prep.md 三 | Cake 建議先讀 JD 抓關鍵字，找出職缺看重的特質再對照自己 | 「研究過 JD 後抓出職缺關鍵字，找出該職缺注重的特質並對照自身性格」 | 同 F39 |
| F41 | interview-prep.md 三 | Cake 列出家庭背景、政治、信仰不適合在自我介紹裡提 | 「像是家庭背景、政治、信仰等議題，都不適合在面試的自我介紹中提及」 | 同 F39 |
| F42 | interview-prep.md 七 | 104 實務文章建議先了解市場平均薪資、避免說「依公司規定」、最後再談薪資 | 「做足事前功課，掌握市場平均薪資行情狀況」「只敢說『依公司規定』，最後總是『依規定低薪』？」「先聊自己能為公司創造的價值，最後再談薪水」 | <https://blog.104.com.tw/salary-talk-guide/> |


## 沒有納入查核的內容

- 寫作建議、觀點與經驗談，例如「避免寫 Seeking new opportunities」「目標關鍵字同時出現在三處」「外商與獵頭職缺比較常標示待遇區間」「三平台語氣差異」。
- 非平台來源的說法，例如 Yale、Harvard、UC Berkeley 等大學職涯中心的建議。
- toolbox.md 第四節延伸閱讀清單的標題與網址。它們是來源入口，不是本站對平台功能的描述。查核途中順便打開的 LinkedIn、104、Cake 官方連結都還開得到。

## 備註

- LinkedIn 說明中心頁面顯示的「Last updated」從 7 個月前到 3 年前都有，內容跟本站一致。About 2,600 字元這個數字目前只在 LinkedIn 官方部落格（2024-04-30 文章）找到，說明中心沒有寫。
- Cake 說明中心的「How to Feature Resumes or Portfolios」顯示 “Updated this week”，精選上限目前是作品集、履歷各 2 份。本站原文刻意不寫數字，交給讀者看介面，所以不算過時，也不需要改。
- 建議人工補查：N1–N4 的四句沒有官方依據，作者可以考慮補上出處，或改成不歸給 LinkedIn 官方的寫法。這屬於改觀點與敘述，不在本次「只修已過時事實」的範圍內，所以沒動。U2–U5 可以在能連上 indeed.com 與 yourator.co 的環境再查一次。
