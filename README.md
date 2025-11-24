# 💬 Dan Hsu 經典語錄

一個收集並分享 Dan Hsu 精彩語錄的互動式網站。

## 🌐 線上體驗

**GitHub Pages:** https://kkian481718.github.io/dan-hsu-quotes/

## ✨ 功能特色

- 📝 **即時投稿** - 使用者可以即時提交新的語錄
- 🔄 **即時更新** - 使用 Firebase Realtime Database，新語錄立即顯示
- 🌓 **深色模式** - 支援淺色/深色主題切換
- 📱 **響應式設計** - 完美適配各種裝置尺寸
- 🎨 **優雅動畫** - 流暢的互動體驗

## 🚀 技術架構

- **前端：** 純 HTML、CSS、JavaScript
- **資料庫：** Firebase Realtime Database
- **部署：** GitHub Pages
- **特色：**
  - ✅ 無需後端伺服器
  - ✅ 完全免費
  - ✅ 即時資料同步
  - ✅ 簡單易用的 API

## 📦 快速開始

### 1. Clone 專案

```bash
git clone https://github.com/kkian481718/dan-hsu-quotes.git
cd dan-hsu-quotes
```

### 2. 設定 Firebase

請參考 [FIREBASE_SETUP.md](FIREBASE_SETUP.md) 完成 Firebase 設定。

簡要步驟：

1. 建立 Firebase 專案
2. 建立 Realtime Database
3. 複製 Firebase 配置到 `js/firebase-config.js`

### 3. 本地測試

使用任何靜態檔案伺服器：

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

然後開啟瀏覽器訪問 `http://localhost:8000`

### 4. 部署到 GitHub Pages

```bash
git add .
git commit -m "更新 Firebase 配置"
git push origin main
```

前往 GitHub Repository → Settings → Pages，選擇 `main` 分支，點擊 Save。

## 📁 專案結構

```
dan-hsu-quotes/
├── index.html              # 主頁面
├── css/
│   └── style.css          # 樣式檔案
├── js/
│   ├── firebase-config.js # Firebase 配置（需自行設定）
│   ├── app.js             # 主要應用邏輯
│   └── storage.js         # 儲存管理
├── data/
│   └── quotes.json        # 預設語錄資料
├── FIREBASE_SETUP.md      # Firebase 設定教學
└── README.md              # 專案說明
```

## 🔒 安全性

### Firebase API Key 可以公開嗎？

**✅ 是的！** Firebase 的 API Key 設計上可以在前端程式碼中使用。

安全性由以下機制保障：

- **Firebase Security Rules** - 控制資料的讀寫權限
- **網域限制** - 在 Firebase Console 中設定允許的網域
- **App Check**（可選）- 防止濫用

詳細說明請參考 [FIREBASE_SETUP.md](FIREBASE_SETUP.md)。

## 🆚 為什麼改用 Firebase？

原本使用 GitHub Issues 作為資料庫，但有以下限制：

| 比較項目       | GitHub Issues ❌       | Firebase ✅                  |
| -------------- | ---------------------- | ---------------------------- |
| **即時性**     | 需要重新載入           | 即時同步                     |
| **部署平台**   | 需要 Netlify Functions | GitHub Pages 即可            |
| **API 保護**   | 需要後端隱藏 Token     | 前端直接使用（透過規則保護） |
| **回應速度**   | 較慢                   | 非常快                       |
| **設定複雜度** | 需要環境變數           | 只需配置檔案                 |

## 📊 Firebase 免費額度

Firebase 免費方案（Spark Plan）提供：

- ✅ 同時連線數：100
- ✅ 資料傳輸量：10 GB/月
- ✅ 儲存空間：1 GB

對於語錄網站來說，免費方案綽綽有餘！

## 🛠️ 開發指南

### 新增功能

1. Fork 這個專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 開啟 Pull Request

### 程式碼風格

- 使用 2 空格縮排
- 變數命名使用 camelCase
- 函式命名使用動詞開頭（例如：`loadQuotes`, `submitForm`）

## 📝 資料結構

Firebase 中的語錄資料結構：

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

## 🤝 貢獻

歡迎任何形式的貢獻！如果您有任何建議或改進，請：

1. 開啟 [Issue](https://github.com/kkian481718/dan-hsu-quotes/issues) 討論
2. 或直接提交 [Pull Request](https://github.com/kkian481718/dan-hsu-quotes/pulls)

## 📄 授權

此專案使用 MIT 授權。詳細資訊請參閱 [LICENSE](LICENSE) 檔案。

## 📚 相關資源

- [Firebase 官方文件](https://firebase.google.com/docs)
- [Realtime Database 指南](https://firebase.google.com/docs/database)
- [GitHub Pages 文件](https://docs.github.com/en/pages)

---

Made with ❤️ by [kkian481718](https://github.com/kkian481718)
