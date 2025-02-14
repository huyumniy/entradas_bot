const TwoCaptcha = require("@2captcha/captcha-solver")
const solver = new TwoCaptcha.Solver("ab8431ca9bda62c92650bc4040ba1754");

// Listen for a request from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("received in background.js", sender.tab.url, request.content);
  if (request.action === "resolve-captcha") {
    
    // Ensure request includes required fields
    if (!request.content) {
      sendResponse({ error: "Content is missing" });
      return;
    }

    solver
      .recaptcha({
        pageurl: sender.tab.url,
        googlekey: request.content,
      })
      .then((res) => {
        console.log(res);
        sendResponse({ transcription: res.data });
      })
      .catch((err) => {
        console.log(err);
        sendResponse({ error: "Transcription failed" });
      });

    return true; // Keeps the message channel open for the async response
  }
});
