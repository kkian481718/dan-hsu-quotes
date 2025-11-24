# Dan Hsu Quotes Project

這個專案是一個簡單的網頁應用程式，允許用戶提交「Dan Hsu 經典語錄」及其投稿者姓名，並在網頁上顯示所有過去的投稿語錄。該應用程式使用 JSON 檔案來儲存語錄資料，並透過 JavaScript 進行讀取和寫入操作。

## 專案結構

```
dan-hsu-quotes
├── index.html        # 網頁的主入口文件
├── css
│   └── style.css     # 網頁的樣式設定
├── js
│   ├── app.js        # 處理用戶輸入和顯示語錄的主要邏輯
│   └── storage.js    # 負責與 quotes.json 進行資料的讀取和寫入
├── data
│   └── quotes.json   # 儲存所有語錄和投稿者姓名的 JSON 檔案
└── README.md         # 專案的說明和使用指南
```

## 使用指南

### 設定步驟

1. **克隆專案**：

   ```bash
   git clone https://github.com/yourusername/dan-hsu-quotes.git
   ```

2. **修改 GitHub 設定**：
   打開 `js/app.js`，修改以下變數為您的 GitHub 資訊：

   ```javascript
   const GITHUB_OWNER = "YOUR_GITHUB_USERNAME"; // 您的 GitHub 使用者名稱
   const GITHUB_REPO = "dan-hsu-quotes"; // 您的 repo 名稱
   ```

3. **建立 Issue Label**：
   在您的 GitHub repo 中建立一個名為 `quote` 的 label：

   - 進入 Issues > Labels > New label
   - Name: `quote`
   - Description: Dan Hsu 語錄
   - Color: 隨意選擇

4. **部署到 GitHub Pages**：
   - 進入 repo Settings > Pages
   - Source 選擇 main branch
   - 儲存後即可訪問網站

### 使用方式

1. **瀏覽語錄**：
   打開網站即可看到所有語錄（包含 `data/quotes.json` 和 GitHub Issues 中的語錄）

2. **提交新語錄**：

   - 填寫語錄內容和投稿者姓名
   - 點擊「提交語錄」按鈕
   - 系統會開啟 GitHub Issue 頁面
   - 確認內容後提交 Issue
   - 語錄會自動顯示在網站上

3. **管理語錄**：
   - 所有語錄以 GitHub Issues 形式儲存
   - 可以在 Issues 頁面管理、編輯或關閉語錄
   - 預設語錄保存在 `data/quotes.json` 中

## 技術細節

- **HTML**：使用基本的 HTML 結構來建立輸入框和顯示區域。
- **CSS**：使用 CSS 來美化網頁的外觀。
- **JavaScript**：使用 JavaScript 來處理用戶輸入、更新顯示區域以及與 JSON 檔案進行資料的讀取和寫入。

## 貢獻

歡迎任何形式的貢獻！如果您有任何建議或改進，請隨時提出問題或提交拉取請求。

## 授權

此專案使用 MIT 授權。詳細資訊請參閱 LICENSE 檔案。
