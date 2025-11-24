// reactions.js
// 處理語錄的按讚(愛心)和按怒功能

// 處理愛心按讚
function handleLike(btn, quotesRef, showToast) {
  const quoteId = btn.dataset.quoteId;
  if (!quoteId) return;

  // 防止重複點擊
  if (btn.classList.contains("animating")) return;
  btn.classList.add("animating");

  // 取得當前讚數
  const quoteRef = quotesRef.child(quoteId);
  quoteRef.transaction(
    (quote) => {
      if (quote) {
        // 增加計數
        quote.likes = (quote.likes || 0) + 1;
      }
      return quote;
    },
    (error, committed, snapshot) => {
      btn.classList.remove("animating");

      if (error) {
        console.error("按讚失敗:", error);
        showToast("❌", "操作失敗,請稍後再試", "error");
      } else if (committed) {
        showToast("❤️", "已按讚", "success");
        // 觸發愛心動畫
        btn.classList.add("liked");
        setTimeout(() => {
          btn.classList.remove("liked");
        }, 600);
      }
    }
  );
}

// 處理怒氣按鈕
function handleDislike(btn, quotesRef, showToast) {
  const quoteId = btn.dataset.quoteId;
  if (!quoteId) return;

  // 防止重複點擊
  if (btn.classList.contains("animating")) return;
  btn.classList.add("animating");

  // 取得當前怒數
  const quoteRef = quotesRef.child(quoteId);
  quoteRef.transaction(
    (quote) => {
      if (quote) {
        // 增加計數
        quote.dislikes = (quote.dislikes || 0) + 1;
      }
      return quote;
    },
    (error, committed, snapshot) => {
      btn.classList.remove("animating");

      if (error) {
        console.error("按怒失敗:", error);
        showToast("❌", "操作失敗,請稍後再試", "error");
      } else if (committed) {
        showToast("😠", "怒！！！！！", "error");
        // 觸發怒氣動畫
        btn.classList.add("disliked");
        setTimeout(() => {
          btn.classList.remove("disliked");
        }, 600);
      }
    }
  );
}
