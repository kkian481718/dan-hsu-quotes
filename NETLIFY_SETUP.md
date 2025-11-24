# Netlify 部署設定指南

## 為什麼使用 Netlify？

由於 GitHub Pages 是純靜態網站，無法安全地儲存 GitHub Token。使用 Netlify 的 Serverless Functions 可以：

- ✅ 安全地在後端處理 API 請求
- ✅ Token 儲存在環境變數中，不會暴露
- ✅ 使用者可以直接在網頁上提交語錄
- ✅ 免費且易於設定

## 部署步驟

### 1. 註冊 Netlify 帳號

前往 [Netlify](https://www.netlify.com/) 註冊免費帳號

### 2. 連接 GitHub Repository

1. 登入 Netlify Dashboard
2. 點擊 "Add new site" → "Import an existing project"
3. 選擇 "Deploy with GitHub"
4. 授權並選擇 `dan-hsu-quotes` repository

### 3. 設定建置選項

- **Build command**: 留空（純靜態網站）
- **Publish directory**: `.` (根目錄)
- **Functions directory**: `netlify/functions` (已自動偵測)

### 4. 建立 GitHub Personal Access Token

1. 前往 [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. 點擊 "Generate new token (classic)"
3. 設定:
   - Note: `Netlify Quote Submission`
   - Expiration: 選擇有效期限
   - 勾選 `repo` 權限
4. 點擊 "Generate token"
5. **複製 token（只會顯示一次！）**

### 5. 在 Netlify 設定環境變數

在 Netlify Site Settings → Environment Variables 中新增:

```
GITHUB_TOKEN=你的_GitHub_Token
GITHUB_OWNER=kkian481718
GITHUB_REPO=dan-hsu-quotes
ISSUE_LABEL=quote
```

### 6. 部署網站

點擊 "Deploy site"，Netlify 會自動建置和部署

### 7. 測試功能

在 Netlify 提供的網址上測試語錄提交功能

## 本地測試（選用）

安裝 Netlify CLI:

```bash
npm install -g netlify-cli
```

在專案目錄執行:

```bash
netlify dev
```

在 `.env` 檔案中設定環境變數（不要提交到 Git！）

## 注意事項

⚠️ **重要:**

- GitHub Token 只能在 Netlify 環境變數中設定，**絕對不要**寫在程式碼裡
- Token 需要 `repo` 權限（或至少 `public_repo` 如果是公開 repo）
- 建議設定 token 過期時間並定期更新

## 從 GitHub Pages 遷移

如果你想保留 GitHub Pages，也可以：

1. 在 Netlify 部署並使用 Netlify 網址
2. 或在 GitHub Pages 使用自訂網域指向 Netlify

## 故障排除

### Function 404 錯誤

- 確認 `netlify.toml` 檔案在根目錄
- 確認 function 檔案在 `netlify/functions/` 目錄下

### GitHub API 錯誤

- 檢查環境變數是否正確設定
- 確認 GitHub Token 有足夠的權限
- 確認 repository 名稱和 owner 正確
