// iframe_inject.js

// Listen for a message from the parent page requesting the iframe content.
window.addEventListener('message', (event) => {
  console.log("receive message",document)
    if (event.data === 'getIframeContent') {
      // Respond with the iframe's content.
      window.parent.postMessage(
        { type: 'FROM_IFRAME_SCRIPT', content: document.body },
        '*'
      );
    }
  });
  