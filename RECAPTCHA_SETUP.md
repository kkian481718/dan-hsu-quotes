# reCAPTCHA v3 設定指南

## 快速設定步驟

### 1. 取得 reCAPTCHA 金鑰

如果你還沒有金鑰，請到 [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) 註冊：

1. 登入你的 Google 帳號
2. 點擊「建立」按鈕
3. 填寫以下資訊：
   - **標籤**：`Dan Hsu Quotes`
   - **reCAPTCHA 類型**：選擇「reCAPTCHA v3」
   - **網域**：
     - `localhost`（用於本地測試）
     - `kkian481718.github.io`（你的 GitHub Pages 網域）
   - 勾選「接受 reCAPTCHA 服務條款」
4. 點擊「提交」
5. 你會獲得：
   - **Site Key**（公開金鑰）- 用於前端
   - **Secret Key**（私密金鑰）- 用於後端驗證（選用）

### 2. 設定 Site Key

#### 步驟 A：修改 `index.html`

在 `<head>` 區域找到這一行：

```html
<!-- reCAPTCHA v3 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY_HERE"></script>
```

**將 `YOUR_SITE_KEY_HERE` 替換為你的 Site Key**

例如：

```html
<script src="https://www.google.com/recaptcha/api.js?render=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"></script>
```

#### 步驟 B：修改 `js/firebase-config.js`

找到這一行：

```javascript
const RECAPTCHA_SITE_KEY = "YOUR_SITE_KEY_HERE";
```

**將 `YOUR_SITE_KEY_HERE` 替換為你的 Site Key**

例如：

```javascript
const RECAPTCHA_SITE_KEY = "6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
```

### 3. 測試設定

1. 在本地啟動開發伺服器：

   ```bash
   python -m http.server 8000
   ```

2. 開啟瀏覽器訪問 `http://localhost:8000`

3. 開啟瀏覽器的開發者工具（F12）

4. 嘗試提交一條語錄

5. 在 Console 中查看是否顯示：

   ```
   ✅ reCAPTCHA token 獲取成功
   ```

6. 在瀏覽器右下角應該會看到 reCAPTCHA v3 的徽章：
   ![reCAPTCHA badge](https://developers.google.com/recaptcha/images/badge.png)

### 4. 部署到 GitHub Pages

設定完成後，將修改推送到 GitHub：

```bash
git add index.html js/firebase-config.js
git commit -m "Add reCAPTCHA v3 protection"
git push origin main
```

GitHub Pages 會自動部署，幾分鐘後即可在線上測試。

## 運作原理

### 前端流程

1. 使用者填寫表單並點擊「提交語錄」
2. `handleSubmit()` 被觸發
3. 呼叫 `executeRecaptcha()` 獲取 token
4. reCAPTCHA v3 **在背景自動執行**（不會顯示驗證碼）
5. Google 評估使用者行為並回傳一個 token
6. token 隨著語錄資料一起提交到 Firebase

### reCAPTCHA v3 特點

- **無感驗證**：不會打斷使用者流程，沒有「我不是機器人」點擊框
- **行為分析**：Google 分析使用者互動模式，給出 0.0-1.0 的分數
- **自動判斷**：分數越高代表越可能是真人，越低代表越可能是機器人

### 安全性說明

**目前實作：僅前端驗證**

- reCAPTCHA token 會附加到 Firebase 資料中
- Firebase Realtime Database Rules 仍然允許公開寫入
- **適合場景**：阻擋簡單的爬蟲/機器人

**進階實作：後端驗證（需要 Cloud Functions）**

如果要完整驗證 reCAPTCHA token，需要：

1. 設定 Firebase Cloud Functions
2. 在後端使用 Secret Key 驗證 token
3. 根據 reCAPTCHA 分數決定是否接受提交

詳見：[Firebase + reCAPTCHA 進階設定](#進階設定-選用)

## 常見問題

### Q1：為什麼看不到 reCAPTCHA 徽章？

**原因：** Site Key 設定錯誤或 script 載入失敗

**解決方法：**

1. 檢查 `index.html` 和 `firebase-config.js` 的 Site Key 是否一致
2. 確認網路連線正常
3. 檢查瀏覽器 Console 是否有錯誤訊息

### Q2：提交時顯示「安全驗證失敗」

**原因：** reCAPTCHA SDK 未正確載入

**解決方法：**

1. 確認 `index.html` 中的 reCAPTCHA script 在 `firebase-config.js` 之前
2. 重新整理頁面
3. 檢查網域是否在 reCAPTCHA Admin Console 中註冊

### Q3：本地測試時 reCAPTCHA 無法運作

**原因：** `localhost` 未加入允許的網域

**解決方法：**

1. 到 [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. 選擇你的站點
3. 在「網域」區域加入 `localhost`
4. 儲存設定

### Q4：如何隱藏 reCAPTCHA 徽章？

如果你想隱藏右下角的徽章，可以在 `css/style.css` 加入：

```css
.grecaptcha-badge {
  visibility: hidden;
}
```

**注意：** 根據 Google 的服務條款，隱藏徽章時你必須在頁面某處顯示：

```
This site is protected by reCAPTCHA and the Google
Privacy Policy and Terms of Service apply.
```

### Q5：reCAPTCHA 會影響使用者體驗嗎？

**不會！** reCAPTCHA v3 是「無感驗證」：

- ✅ 沒有「選出所有交通號誌」的圖片驗證
- ✅ 沒有「我不是機器人」的勾選框
- ✅ 在背景自動完成，使用者無感知
- ✅ 不會增加提交時間（< 500ms）

## 進階設定（選用）

### 後端 Token 驗證

如果要完整阻擋機器人，建議實作後端驗證：

#### 1. 建立 Firebase Cloud Function

```javascript
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

exports.verifyRecaptcha = functions.https.onCall(async (data, context) => {
  const { token, quote, author } = data;
  const secretKey = functions.config().recaptcha.secret;

  // 向 Google 驗證 token
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    {
      params: {
        secret: secretKey,
        response: token,
      },
    }
  );

  const { success, score, action } = response.data;

  // 檢查驗證結果
  if (!success || action !== "submit_quote") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Invalid reCAPTCHA"
    );
  }

  // 檢查分數（0.5 是建議的閾值）
  if (score < 0.5) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Low reCAPTCHA score"
    );
  }

  // 驗證通過，寫入 Database
  const newQuote = {
    quote: quote,
    author: author,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    createdAt: new Date().toISOString(),
    recaptchaScore: score,
  };

  await admin.database().ref("quotes").push(newQuote);

  return { success: true };
});
```

#### 2. 修改前端呼叫方式

```javascript
// app.js 中的 submitQuoteToFirebase
async function submitQuoteToFirebase(quote, author, recaptchaToken) {
  try {
    const verifyRecaptcha = firebase
      .functions()
      .httpsCallable("verifyRecaptcha");
    const result = await verifyRecaptcha({
      token: recaptchaToken,
      quote: quote,
      author: author,
    });

    showToast("🎉", "語錄已成功提交！", "success");
    // ... 清空表單
  } catch (error) {
    console.error("提交失敗:", error);
    showToast("❌", "提交失敗，請稍後再試", "error");
  }
}
```

#### 3. 設定 Secret Key

```bash
firebase functions:config:set recaptcha.secret="你的_SECRET_KEY"
firebase deploy --only functions
```

### Firebase Rules 調整

如果使用 Cloud Functions，可以將 Firebase Rules 改為禁止直接寫入：

```json
{
  "rules": {
    "quotes": {
      ".read": true,
      ".write": false // 禁止直接寫入，只能透過 Cloud Function
    }
  }
}
```

## 監控與分析

### 在 reCAPTCHA Admin Console 查看統計

1. 前往 [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. 選擇你的站點
3. 查看「分析」頁籤

你可以看到：

- 每日請求數量
- 分數分佈圖
- 可疑流量趨勢

### 調整安全等級

根據統計結果，你可以：

- **分數 > 0.7**：非常可能是真人，直接通過
- **分數 0.3-0.7**：可疑，可能需要額外驗證
- **分數 < 0.3**：很可能是機器人，拒絕請求

## 相關資源

- [reCAPTCHA v3 官方文件](https://developers.google.com/recaptcha/docs/v3)
- [Firebase + reCAPTCHA 整合指南](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA 最佳實踐](https://developers.google.com/recaptcha/docs/v3#best_practices)

## 總結

現在你的網站已經受到 reCAPTCHA v3 保護！ 🎉

✅ **已完成：**

- 前端 reCAPTCHA v3 整合
- 自動獲取並附加 token
- 無感使用者體驗

💡 **建議後續：**

- 部署到 GitHub Pages 測試
- 監控 reCAPTCHA Admin Console 的統計資料
- 如果發現大量機器人攻擊，考慮實作後端驗證

如有任何問題，請參考上方的「常見問題」章節或查閱官方文件。
