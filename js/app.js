// app.js
// 使用 Firebase Realtime Database 儲存語錄

document.addEventListener("DOMContentLoaded", () => {
  const quoteInput = document.getElementById("quoteInput");
  const authorInput = document.getElementById("authorInput");
  const submitButton = document.getElementById("submitQuote");
  const quoteForm = document.getElementById("quoteForm");
  const quotesList = document.getElementById("quotesList");
  const themeToggle = document.getElementById("themeToggle");
  const loadingState = document.getElementById("loadingState");
  const emptyState = document.getElementById("emptyState");
  const charCount = document.getElementById("charCount");

  // 初始化
  initTheme();
  loadAllQuotes();
  setupEventListeners();
  checkCooldown();

  // 設置事件監聽器
  function setupEventListeners() {
    // 主題切換
    themeToggle.addEventListener("click", toggleTheme);

    // 字數統計
    quoteInput.addEventListener("input", updateCharCount);

    // 表單提交
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSubmit();
    });

    // 篩選按鈕
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        applyFilter(filter);
      });
    });

    // 輸入框動畫效果
    const inputs = document.querySelectorAll(".input-field");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });
      input.addEventListener("blur", () => {
        input.parentElement.classList.remove("focused");
      });
    });
  }

  // 主題切換功能
  function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    }
  }

  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // 添加過渡動畫
    themeToggle.style.animation = "none";
    setTimeout(() => {
      themeToggle.style.animation = "";
    }, 10);
  }

  // 字數統計
  function updateCharCount() {
    const length = quoteInput.value.length;
    const maxLength = 500;
    charCount.textContent = `${length} / ${maxLength}`;

    if (length > maxLength) {
      charCount.style.color = "#e53e3e";
      quoteInput.value = quoteInput.value.substring(0, maxLength);
    } else if (length > maxLength * 0.9) {
      charCount.style.color = "#dd6b20";
    } else {
      charCount.style.color = "var(--text-muted)";
    }
  }

  // 表單提交處理
  function handleSubmit() {
    // 檢查冷卻時間
    const lastSubmitTime = localStorage.getItem("lastSubmitTime");
    const now = Date.now();
    const cooldownPeriod = 60000; // 60 秒

    if (lastSubmitTime) {
      const timePassed = now - parseInt(lastSubmitTime);
      if (timePassed < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timePassed) / 1000);
        showToast("⏰", `請稍後再試，還需等待 ${remainingTime} 秒`, "warning");
        return;
      }
    }

    const quote = quoteInput.value.trim();
    const author = authorInput.value.trim();

    if (!quote || !author) {
      showToast("⚠️", "請填寫完整的語錄內容和姓名", "warning");
      return;
    }

    submitButton.classList.add("loading");
    submitQuoteToFirebase(quote, author);
  }

  function submitQuoteToFirebase(quote, author) {
    showToast("⏳", "正在提交語錄...", "info");

    // 建立新的語錄物件
    const newQuote = {
      quote: quote,
      author: author,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      createdAt: new Date().toISOString(),
    };

    // 推送到 Firebase
    quotesRef
      .push(newQuote)
      .then(() => {
        showToast("🎉", "語錄已成功提交！", "success");
        quoteInput.value = "";
        authorInput.value = "";
        updateCharCount();
        submitButton.classList.remove("loading");

        // 記錄提交時間並啟動冷卻計時器
        localStorage.setItem("lastSubmitTime", Date.now().toString());
        startCooldown();

        // 不需要重新載入，Firebase 的即時監聽器會自動更新
      })
      .catch((error) => {
        console.error("提交失敗:", error);
        showToast("❌", "提交失敗，請稍後再試", "error");
        submitButton.classList.remove("loading");
      });
  }

  function loadAllQuotes() {
    // 顯示載入狀態
    loadingState.style.display = "block";
    emptyState.style.display = "none";
    quotesList.style.display = "none";

    // 設定 Firebase 即時監聽器
    quotesRef.orderByChild("timestamp").on(
      "value",
      (snapshot) => {
        const firebaseQuotes = [];
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          firebaseQuotes.push({
            id: childSnapshot.key,
            quote: data.quote,
            author: data.author,
            timestamp: data.timestamp || 0,
          });
        });

        // 顯示 Firebase 的語錄（最新的在前面）
        const allQuotes = firebaseQuotes.reverse();
        window.allQuotesData = allQuotes;
        displayQuotes(allQuotes);
      },
      (error) => {
        console.error("Error loading quotes:", error);
        loadingState.style.display = "none";
        showToast("❌", "載入語錄時發生錯誤", "error");
        displayQuotes([]);
      }
    );
  }

  function displayQuotes(quotes) {
    loadingState.style.display = "none";

    if (quotes.length === 0) {
      emptyState.style.display = "block";
      quotesList.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    quotesList.style.display = "flex";
    quotesList.innerHTML = "";

    quotes.forEach((q, index) => {
      const li = document.createElement("li");
      li.style.animationDelay = `${index * 0.1}s`;
      li.innerHTML = `
        <span class="quote-text">${q.quote}</span>
        <span class="quote-author">${q.author}</span>
      `;
      quotesList.appendChild(li);
    });
  }

  // 篩選功能
  function applyFilter(filter) {
    const quotes = window.allQuotesData || [];

    if (filter === "all") {
      displayQuotes(quotes);
    } else if (filter === "recent") {
      // 只顯示最新的 5 條
      displayQuotes(quotes.slice(-5).reverse());
    }
  }

  // 通知提示功能
  function showToast(icon, message, type = "info") {
    const toast = document.getElementById("toast");
    const toastIcon = toast.querySelector(".toast-icon");
    const toastMessage = toast.querySelector(".toast-message");

    toastIcon.textContent = icon;
    toastMessage.textContent = message;

    // 移除之前的類型類
    toast.classList.remove("success", "error", "warning", "info");
    toast.classList.add(type);

    // 顯示通知
    toast.classList.add("show");

    // 3 秒後自動隱藏
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // 冷卻時間管理
  let cooldownInterval = null;

  function checkCooldown() {
    const lastSubmitTime = localStorage.getItem("lastSubmitTime");
    if (!lastSubmitTime) return;

    const now = Date.now();
    const cooldownPeriod = 60000; // 60 秒
    const timePassed = now - parseInt(lastSubmitTime);

    if (timePassed < cooldownPeriod) {
      startCooldown(cooldownPeriod - timePassed);
    }
  }

  function startCooldown(remainingTime = 60000) {
    submitButton.classList.add("cooldown");
    submitButton.disabled = true;

    const progressFill = submitButton.querySelector(".progress-fill");
    const progressText = submitButton.querySelector(".progress-text");
    const startTime = Date.now();
    const endTime = startTime + remainingTime;

    // 清除之前的計時器
    if (cooldownInterval) {
      clearInterval(cooldownInterval);
    }

    function updateProgress() {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = (elapsed / remainingTime) * 100;
      const remainingSeconds = Math.ceil((endTime - now) / 1000);

      if (progress >= 100) {
        progressFill.style.width = "100%";
        progressText.textContent = "可以提交了！";

        setTimeout(() => {
          submitButton.classList.remove("cooldown");
          submitButton.disabled = false;
          clearInterval(cooldownInterval);
          cooldownInterval = null;
        }, 500);
      } else {
        progressFill.style.width = progress + "%";
        progressText.textContent = `請等待 ${remainingSeconds} 秒`;
      }
    }

    updateProgress();
    cooldownInterval = setInterval(updateProgress, 100);
  }
});
