const TwoCaptcha = require("../dist/index.js");
const solver = new TwoCaptcha.Solver("ab8431ca9bda62c92650bc4040ba1754");

// Listen for a request from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "resolve-captcha") {
    console.log("received in background.js");
    // Ensure request includes required fields
    if (!request.content) {
      sendResponse({ error: "Content is missing" });
      return;
    }

    solver
      .recaptcha({
        pageurl: "https://2captcha.com/demo/recaptcha-v2",
        googlekey: request.content,
      })
      .then((res) => {
        console.log(res);
        return res.code;
      })
      .catch((err) => {
        console.log(err);
      });

    return true; // Keeps the message channel open for the async response
  }
});
