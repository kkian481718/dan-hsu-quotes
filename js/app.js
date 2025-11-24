// app.js
// GitHub Repository 資訊 - 請修改為您的 repo
const GITHUB_OWNER = "kkian481718"; // 例如: 'john-doe'
const GITHUB_REPO = "dan-hsu-quotes"; // 您的 repo 名稱
const ISSUE_LABEL = "quote"; // 用來標記語錄的 label

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
    const quote = quoteInput.value.trim();
    const author = authorInput.value.trim();

    if (!quote || !author) {
      showToast("⚠️", "請填寫完整的語錄內容和姓名", "warning");
      return;
    }

    submitButton.classList.add("loading");

    setTimeout(() => {
      submitQuoteAsIssue(quote, author);
      submitButton.classList.remove("loading");
    }, 500);
  }

  async function submitQuoteAsIssue(quote, author) {
    showToast("⏳", "正在提交語錄...", "info");

    try {
      // 使用 Netlify Serverless Function
      // Token 安全地存在 Netlify 環境變數中
      const response = await fetch("/.netlify/functions/create-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote: quote,
          author: author,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast("🎉", "語錄已成功提交！", "success");
        quoteInput.value = "";
        authorInput.value = "";
        updateCharCount();
        // 重新載入語錄列表
        setTimeout(() => loadAllQuotes(), 1500);
      } else {
        throw new Error(data.error || "提交失敗");
      }
    } catch (error) {
      console.error("提交失敗:", error);
      showToast("❌", "提交失敗，請稍後再試", "error");
    }
  }

  function loadAllQuotes() {
    // 顯示載入狀態
    loadingState.style.display = "block";
    emptyState.style.display = "none";
    quotesList.style.display = "none";

    // 載入 JSON 檔案中的預設語錄
    fetch("data/quotes.json")
      .then((response) => response.json())
      .then((data) => {
        const jsonQuotes = data.quotes || [];
        // 載入 GitHub Issues 中的語錄
        return loadGitHubIssues()
          .then((issueQuotes) => {
            const allQuotes = [...jsonQuotes, ...issueQuotes];
            window.allQuotesData = allQuotes; // 儲存所有語錄資料
            displayQuotes(allQuotes);
          })
          .catch(() => {
            // 如果無法載入 Issues，只顯示 JSON 中的語錄
            window.allQuotesData = jsonQuotes;
            displayQuotes(jsonQuotes);
          });
      })
      .catch((error) => {
        console.error("Error loading quotes:", error);
        loadingState.style.display = "none";
        showToast("❌", "載入語錄時發生錯誤", "error");
        displayQuotes([]);
      });
  }

  function loadGitHubIssues() {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=${ISSUE_LABEL}&state=open`;

    return fetch(apiUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch issues");
        return response.json();
      })
      .then((issues) => {
        return issues.map((issue) => {
          // 從 issue body 中解析語錄和作者
          const body = issue.body || "";
          const quoteMatch = body.match(/\*\*語錄內容：\*\*\s*(.+)/);
          const authorMatch = body.match(/\*\*投稿者：\*\*\s*(.+)/);

          return {
            quote: quoteMatch ? quoteMatch[1].trim() : issue.title,
            author: authorMatch ? authorMatch[1].trim() : "Unknown",
          };
        });
      });
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
});
