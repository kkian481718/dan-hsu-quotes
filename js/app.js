// app.js
// GitHub Repository 資訊 - 請修改為您的 repo
const GITHUB_OWNER = "kkian481718"; // 例如: 'john-doe'
const GITHUB_REPO = "dan-hsu-quotes"; // 您的 repo 名稱
const ISSUE_LABEL = "quote"; // 用來標記語錄的 label

document.addEventListener("DOMContentLoaded", () => {
  const quoteInput = document.getElementById("quoteInput");
  const authorInput = document.getElementById("authorInput");
  const submitButton = document.getElementById("submitQuote");
  const quotesList = document.getElementById("quotesList");

  // Load existing quotes on page load
  loadAllQuotes();

  submitButton.addEventListener("click", () => {
    const quote = quoteInput.value.trim();
    const author = authorInput.value.trim();

    if (quote && author) {
      submitQuoteAsIssue(quote, author);
    } else {
      alert("請填寫語錄和投稿者姓名");
    }
  });

  function submitQuoteAsIssue(quote, author) {
    const issueTitle = `語錄：${quote.substring(0, 50)}${
      quote.length > 50 ? "..." : ""
    }`;
    const issueBody = `**語錄內容：** ${quote}\n\n**投稿者：** ${author}\n\n---\n*此語錄由網頁表單自動提交*`;

    // 顯示 GitHub Issue 創建連結
    const issueUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(
      issueTitle
    )}&body=${encodeURIComponent(issueBody)}&labels=${ISSUE_LABEL}`;

    alert("將開啟 GitHub 頁面讓您提交語錄（需要 GitHub 帳號）");
    window.open(issueUrl, "_blank");

    quoteInput.value = "";
    authorInput.value = "";
  }

  function loadAllQuotes() {
    // 載入 JSON 檔案中的預設語錄
    fetch("data/quotes.json")
      .then((response) => response.json())
      .then((data) => {
        const jsonQuotes = data.quotes || [];
        // 載入 GitHub Issues 中的語錄
        return loadGitHubIssues()
          .then((issueQuotes) => {
            const allQuotes = [...jsonQuotes, ...issueQuotes];
            displayQuotes(allQuotes);
          })
          .catch(() => {
            // 如果無法載入 Issues，只顯示 JSON 中的語錄
            displayQuotes(jsonQuotes);
          });
      })
      .catch((error) => {
        console.error("Error loading quotes:", error);
        quotesList.innerHTML = "<li>載入語錄時發生錯誤</li>";
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
    quotesList.innerHTML = "";

    if (quotes.length === 0) {
      quotesList.innerHTML = "<li>目前還沒有語錄</li>";
      return;
    }

    quotes.forEach((q) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="quote-text">"${q.quote}"</span> <span class="quote-author">- ${q.author}</span>`;
      quotesList.appendChild(li);
    });
  }
});
