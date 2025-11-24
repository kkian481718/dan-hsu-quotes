# Firebase 設定教學

本專案使用 Firebase Realtime Database 來儲存語錄資料。請依照以下步驟完成設定。

## 📋 設定步驟

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱（例如：`dan-hsu-quotes`）
4. 選擇是否啟用 Google Analytics（可選）
5. 點擊「建立專案」

### 2. 建立 Realtime Database

1. 在 Firebase Console 左側選單中，點擊「Realtime Database」
2. 點擊「建立資料庫」
3. 選擇資料庫位置（建議選擇 `asia-southeast1`）
4. 選擇安全性規則模式：
   - **測試模式**（開發時使用，30 天後需更新規則）
   - **鎖定模式**（稍後會設定自訂規則）

### 3. 設定安全性規則

為了保護資料庫，請設定以下規則：

```json
{
  "rules": {
    "quotes": {
      ".read": true,
      ".write": true,
      "$quoteId": {
        ".validate": "newData.hasChildren(['quote', 'author', 'timestamp'])",
        "quote": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 500"
        },
        "author": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
        },
        "timestamp": {
          ".validate": "newData.isNumber()"
        },
        "createdAt": {
          ".validate": "newData.isString()"
        }
      }
    }
  }
}
```

**規則說明：**

- ✅ 任何人都可以讀取語錄（`.read: true`）
- ✅ 任何人都可以新增語錄（`.write: true`）
- ✅ 語錄內容限制 500 字元以內
- ✅ 作者名稱限制 100 字元以內
- ✅ 必須包含時間戳記

> **注意：** 這個設定允許任何人新增語錄。如果需要更嚴格的控制（例如只允許特定使用者），請參考下方的進階設定。

### 4. 取得 Firebase 配置

1. 在 Firebase Console 中，點擊專案設定（齒輪圖示）
2. 選擇「您的應用程式」區域
3. 點擊「Web」圖示 (`</>`）
4. 輸入應用程式暱稱（例如：`dan-hsu-quotes-web`）
5. 不需要勾選「設定 Firebase Hosting」
6. 點擊「註冊應用程式」
7. 複製 `firebaseConfig` 物件

### 5. 更新配置檔案

開啟 `js/firebase-config.js`，將您的 Firebase 配置資訊填入：

```javascript
const firebaseConfig = {
  apiKey: "AIza...", // 您的 API Key
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

## 🔒 安全性說明

### Firebase API Key 可以公開嗎？

**✅ 是的，Firebase 的 API Key 設計上可以公開。**

Firebase 的安全性**不依賴於隱藏 API Key**，而是透過：

1. **Firebase Security Rules** - 控制誰可以讀寫資料
2. **Domain 限制** - 在 Firebase Console 中限制允許的網域
3. **App Check**（可選）- 防止濫用和機器人

### 設定網域限制

1. 前往 Firebase Console → 專案設定
2. 點擊「已授權的網域」
3. 新增您的 GitHub Pages 網域：
   ```
   kkian481718.github.io
   ```

## 🚀 部署到 GitHub Pages

完成 Firebase 設定後，您可以將專案部署到 GitHub Pages：

### 選項 1：使用 GitHub 網頁界面

1. 前往您的 GitHub Repository
2. 點擊「Settings」
3. 在左側選單中選擇「Pages」
4. 在「Source」下拉選單中選擇「main」分支
5. 點擊「Save」
6. 等待幾分鐘後，網站將在 `https://kkian481718.github.io/dan-hsu-quotes/` 上線

### 選項 2：使用 Git 指令

```bash
git add .
git commit -m "改用 Firebase Realtime Database"
git push origin main
```

然後按照選項 1 的步驟啟用 GitHub Pages。

## 🧪 本地測試

在部署前，建議先在本地測試：

```bash
# 使用 Python 啟動本地伺服器
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

然後在瀏覽器開啟 `http://localhost:8000`

## 📊 監控使用量

Firebase 免費方案的限制：

- **同時連線數：** 100
- **資料傳輸量：** 10 GB/月
- **儲存空間：** 1 GB

若超過限制，可升級到付費方案（Blaze Plan），但對於語錄網站來說，免費方案通常已足夠。

前往 Firebase Console → Realtime Database → 使用情況，可查看目前的使用狀況。

## 🔧 進階設定（可選）

### 限制寫入頻率（防止濫用）

如果擔心有人惡意大量提交，可以使用 Firebase Security Rules 限制頻率：

```json
{
  "rules": {
    "quotes": {
      ".read": true,
      ".write": "!data.exists() || data.child('timestamp').val() < (now - 60000)"
    }
  }
}
```

這會限制同一使用者在 1 分鐘內只能提交一次。

### 使用 Firebase Authentication（最嚴格控制）

如果想要完全控制誰可以新增語錄，可以啟用 Firebase Authentication：

1. 在 Firebase Console 中啟用「Authentication」
2. 選擇登入方式（例如：Email/Password 或 Google）
3. 更新安全性規則：

```json
{
  "rules": {
    "quotes": {
      ".read": true,
      ".write": "auth != null" // 只有登入使用者可以寫入
    }
  }
}
```

## 📝 資料結構

Firebase 中的資料結構如下：

```json
{
  "quotes": {
    "-NxAbCd1234": {
      "quote": "這是一句精彩的語錄",
      "author": "Dan Hsu",
      "timestamp": 1700000000000,
      "createdAt": "2024-11-25T12:00:00.000Z"
    }
  }
}
```

## ❓ 常見問題

### Q: 為什麼改用 Firebase 而不是 GitHub Issues？

A:

- ✅ **即時性更好** - Firebase 支援即時同步，新語錄立即顯示
- ✅ **更簡單** - 不需要 Netlify Functions，可直接部署到 GitHub Pages
- ✅ **更快速** - 不需要等待 GitHub API 回應
- ✅ **免費且穩定** - Firebase 免費方案對小型專案綽綽有餘

### Q: Firebase 的 API Key 真的可以公開嗎？

A: 是的！Firebase 的文件明確說明 API Key 可以在前端程式碼中使用。安全性由 Firebase Security Rules 和網域限制來保障，而不是靠隱藏 API Key。

### Q: 還需要 Netlify 嗎？

A: 不需要！改用 Firebase 後，可以直接部署到 GitHub Pages，完全免費且不需要設定環境變數。

## 📚 參考資源

- [Firebase 官方文件](https://firebase.google.com/docs)
- [Realtime Database 安全性規則](https://firebase.google.com/docs/database/security)
- [GitHub Pages 文件](https://docs.github.com/en/pages)
