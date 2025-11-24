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
  initUserReactions(); // 初始化使用者反應記錄
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

    // 愛心按讚功能(使用事件委託)
    quotesList.addEventListener("click", (e) => {
      const likeBtn = e.target.closest(".like-btn");
      if (likeBtn) {
        handleLike(likeBtn);
      }

      const dislikeBtn = e.target.closest(".dislike-btn");
      if (dislikeBtn) {
        handleDislike(dislikeBtn);
      }
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

  // 初始化使用者反應記錄
  function initUserReactions() {
    if (!localStorage.getItem("userReactions")) {
      localStorage.setItem(
        "userReactions",
        JSON.stringify({
          likes: [],
          dislikes: [],
        })
      );
    }
  }

  // 取得使用者反應記錄
  function getUserReactions() {
    return JSON.parse(
      localStorage.getItem("userReactions") || '{"likes":[],"dislikes":[]}'
    );
  }

  // 儲存使用者反應
  function saveUserReaction(quoteId, type) {
    const reactions = getUserReactions();
    if (type === "like" && !reactions.likes.includes(quoteId)) {
      reactions.likes.push(quoteId);
    } else if (type === "dislike" && !reactions.dislikes.includes(quoteId)) {
      reactions.dislikes.push(quoteId);
    }
    localStorage.setItem("userReactions", JSON.stringify(reactions));
  }

  // 移除使用者反應
  function removeUserReaction(quoteId, type) {
    const reactions = getUserReactions();
    if (type === "like") {
      reactions.likes = reactions.likes.filter((id) => id !== quoteId);
    } else if (type === "dislike") {
      reactions.dislikes = reactions.dislikes.filter((id) => id !== quoteId);
    }
    localStorage.setItem("userReactions", JSON.stringify(reactions));
  }

  // 檢查使用者是否已按過反應
  function hasUserReacted(quoteId, type) {
    const reactions = getUserReactions();
    return type === "like"
      ? reactions.likes.includes(quoteId)
      : reactions.dislikes.includes(quoteId);
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
  async function handleSubmit() {
    const quote = quoteInput.value.trim();
    const author = authorInput.value.trim();

    if (!quote || !author) {
      showToast("⚠️", "請填寫完整的語錄內容和姓名", "warning");
      return;
    }

    submitButton.classList.add("loading");

    // reCAPTCHA v3 驗證
    try {
      const token = await executeRecaptcha();
      submitQuoteToFirebase(quote, author, token);
    } catch (error) {
      console.error("reCAPTCHA 驗證失敗:", error);
      showToast("❌", "安全驗證失敗，請重新整理頁面後再試", "error");
      submitButton.classList.remove("loading");
    }
  }

  // 獲取用戶IP位址
  async function getUserIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("無法獲取IP:", error);
      return "unknown";
    }
  }

  // 執行 reCAPTCHA v3 驗證
  function executeRecaptcha() {
    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === "undefined" || !window.RECAPTCHA_SITE_KEY) {
        console.warn("reCAPTCHA 未正確載入，跳過驗證");
        resolve(null);
        return;
      }

      grecaptcha.ready(() => {
        grecaptcha
          .execute(window.RECAPTCHA_SITE_KEY, { action: "submit_quote" })
          .then((token) => {
            console.log("✅ reCAPTCHA token 獲取成功");
            resolve(token);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  async function submitQuoteToFirebase(quote, author, recaptchaToken) {
    showToast("⏳", "正在提交語錄...", "info");

    // 獲取用戶IP
    const userIP = await getUserIP();

    // 建立新的語錄物件
    const newQuote = {
      quote: quote,
      author: author,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      createdAt: new Date().toISOString(),
      recaptchaToken: recaptchaToken || null, // 包含 reCAPTCHA token(選用)
      likes: 0, // 初始讚數為 0
      dislikes: 0, // 初始怒數為 0
      submitterIP: userIP, // 記錄發文者IP
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
            likes: data.likes || 0,
            dislikes: data.dislikes || 0,
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

  // 時間格式化函數
  function formatTimestamp(timestamp) {
    if (!timestamp) return "未知時間";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // 相對時間顯示
    if (diffMins < 1) return "剛剛";
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    if (diffDays < 7) return `${diffDays} 天前`;

    // 絕對時間顯示
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}`;
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
      const timeString = formatTimestamp(q.timestamp);

      // 檢查使用者是否已按過反應
      const userLiked = hasUserReacted(q.id, "like");
      const userDisliked = hasUserReacted(q.id, "dislike");

      li.innerHTML = `
        <span class="quote-text">${q.quote}</span>
        <div class="quote-footer">
          <div class="quote-info">
            <span class="quote-author">${q.author}</span>
            <span class="quote-time" title="${new Date(
              q.timestamp
            ).toLocaleString("zh-TW")}">📅 ${timeString}</span>
          </div>
          <div class="reaction-buttons">
            <button class="like-btn ${
              userLiked ? "user-reacted" : ""
            }" data-quote-id="${q.id}" aria-label="${
        userLiked ? "收回愛心" : "按讚"
      }">
              <span class="heart-icon">❤️</span>
              <span class="like-count">${q.likes || 0}</span>
            </button>
            <button class="dislike-btn ${
              userDisliked ? "user-reacted" : ""
            }" data-quote-id="${q.id}" aria-label="${
        userDisliked ? "收回怒" : "按怒"
      }">
              <span class="angry-icon">😡</span>
              <span class="dislike-count">${q.dislikes || 0}</span>
            </button>
          </div>
        </div>
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

  // 處理愛心按讚
  function handleLike(btn) {
    const quoteId = btn.dataset.quoteId;
    if (!quoteId) return;

    // 防止重複點擊
    if (btn.classList.contains("animating")) return;
    btn.classList.add("animating");

    // 檢查使用者是否已按過愛心
    const hasLiked = hasUserReacted(quoteId, "like");

    // 取得當前讚數
    const quoteRef = quotesRef.child(quoteId);
    quoteRef.transaction(
      (quote) => {
        if (quote) {
          if (hasLiked) {
            // 收回愛心：減少計數
            quote.likes = Math.max((quote.likes || 0) - 1, 0);
          } else {
            // 新增愛心：增加計數
            quote.likes = (quote.likes || 0) + 1;
          }
        }
        return quote;
      },
      (error, committed, snapshot) => {
        btn.classList.remove("animating");

        if (error) {
          console.error("按讚失敗:", error);
          showToast("❌", "操作失敗，請稍後再試", "error");
        } else if (committed) {
          if (hasLiked) {
            // 收回愛心
            removeUserReaction(quoteId, "like");
            btn.classList.remove("user-reacted");
            btn.setAttribute("aria-label", "按讚");
            showToast("💔", "已收回愛心", "info");
          } else {
            // 新增愛心
            saveUserReaction(quoteId, "like");
            btn.classList.add("user-reacted");
            btn.setAttribute("aria-label", "收回愛心");
            // 觸發愛心動畫
            btn.classList.add("liked");
            setTimeout(() => {
              btn.classList.remove("liked");
            }, 600);
          }
        }
      }
    );
  }

  // 處理怒氣按鈕
  function handleDislike(btn) {
    const quoteId = btn.dataset.quoteId;
    if (!quoteId) return;

    // 防止重複點擊
    if (btn.classList.contains("animating")) return;
    btn.classList.add("animating");

    // 檢查使用者是否已按過怒
    const hasDisliked = hasUserReacted(quoteId, "dislike");

    // 取得當前怒數
    const quoteRef = quotesRef.child(quoteId);
    quoteRef.transaction(
      (quote) => {
        if (quote) {
          if (hasDisliked) {
            // 收回怒：減少計數
            quote.dislikes = Math.max((quote.dislikes || 0) - 1, 0);
          } else {
            // 新增怒：增加計數
            quote.dislikes = (quote.dislikes || 0) + 1;
          }
        }
        return quote;
      },
      (error, committed, snapshot) => {
        btn.classList.remove("animating");

        if (error) {
          console.error("按怒失敗:", error);
          showToast("❌", "操作失敗，請稍後再試", "error");
        } else if (committed) {
          if (hasDisliked) {
            // 收回怒
            removeUserReaction(quoteId, "dislike");
            btn.classList.remove("user-reacted");
            btn.setAttribute("aria-label", "按怒");
            showToast("😌", "已收回怒氣", "info");
          } else {
            // 新增怒
            saveUserReaction(quoteId, "dislike");
            btn.classList.add("user-reacted");
            btn.setAttribute("aria-label", "收回怒");
            // 觸發怒氣動畫
            btn.classList.add("disliked");
            setTimeout(() => {
              btn.classList.remove("disliked");
            }, 600);
          }
        }
      }
    );
  }
});
