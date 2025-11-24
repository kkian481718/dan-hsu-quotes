// Firebase 配置
// 請在 Firebase Console 中取得您的配置資訊
// 參考 FIREBASE_SETUP.md 了解如何設定

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

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 取得 Database 參考
const database = firebase.database();
const quotesRef = database.ref("quotes");

console.log("✅ Firebase 初始化成功！");
