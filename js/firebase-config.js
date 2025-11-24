// Firebase 配置

const firebaseConfig = {
  apiKey: "AIzaSyCv9zuggv7imyJqj_bqkIXetS1pyz42aic",
  authDomain: "dan-hsu-quotes.firebaseapp.com",
  databaseURL:
    "https://dan-hsu-quotes-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dan-hsu-quotes",
  storageBucket: "dan-hsu-quotes.firebasestorage.app",
  messagingSenderId: "386474452724",
  appId: "1:386474452724:web:1a1b3eab2a79d58464a0a1",
  measurementId: "G-MBYVPBC7B0",
};

// reCAPTCHA v3 配置
const RECAPTCHA_SITE_KEY = "6LdNJxcsAAAAAFIHULIlTNOJHNlJGyI7-cAMCSVq";

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 取得 Database 參考
const database = firebase.database();
const quotesRef = database.ref("quotes");

// 將 reCAPTCHA Site Key 暴露給全域（供 app.js 使用）
window.RECAPTCHA_SITE_KEY = RECAPTCHA_SITE_KEY;

console.log("✅ Firebase 初始化成功！");
