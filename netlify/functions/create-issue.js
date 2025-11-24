// Netlify Serverless Function
// 這個檔案會自動部署為 API endpoint: /.netlify/functions/create-issue

exports.handler = async (event, context) => {
  // 只允許 POST 請求
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { quote, author } = JSON.parse(event.body);

    // 驗證輸入
    if (!quote || !author) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "請提供完整的語錄內容和姓名" }),
      };
    }

    // 準備 Issue 資料
    const issueTitle = `語錄：${quote.substring(0, 50)}${
      quote.length > 50 ? "..." : ""
    }`;
    const issueBody = `**語錄內容：** ${quote}\n\n**投稿者：** ${author}\n\n---\n*此語錄由網頁表單自動提交*`;

    // 使用 GitHub API 創建 Issue
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: [process.env.ISSUE_LABEL || "quote"],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `GitHub API 錯誤: ${response.status} - ${errorData.message}`
      );
    }

    const issue = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 允許跨域請求
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: true,
        issueUrl: issue.html_url,
        message: "語錄已成功提交！",
      }),
    };
  } catch (error) {
    console.error("Error creating issue:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message || "提交失敗，請稍後再試",
      }),
    };
  }
};
