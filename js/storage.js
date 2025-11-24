// storage.js
// 此檔案保留供未來擴充使用

// 如果需要使用 localStorage 作為備用方案
function getLocalQuotes() {
  const stored = localStorage.getItem("userQuotes");
  return stored ? JSON.parse(stored) : [];
}

function saveLocalQuote(quoteObj) {
  const quotes = getLocalQuotes();
  quotes.push(quoteObj);
  localStorage.setItem("userQuotes", JSON.stringify(quotes));
}
