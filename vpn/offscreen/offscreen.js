(()=>{"use strict";var e={72297:(e,n)=>{Object.defineProperty(n,"__esModule",{value:!0}),n.VerifyConnectionMessages=void 0,function(e){e.abortProxyConnection="VerifyConnection.AbortProxyConnection",e.verifyProxyConnectionResponse="VerifyConnection.VerifyProxyConnectionResponse",e.verifyProxyConnection="VerifyConnection.VerifyProxyConnection"}(n.VerifyConnectionMessages||(n.VerifyConnectionMessages={}))}},n={};function o(r){var t=n[r];if(void 0!==t)return t.exports;var i=n[r]={exports:{}};return e[r](i,i.exports,o),i.exports}(()=>{const e=o(72297);let n;const r=(e,o)=>{n=new Worker("worker.js"),n.postMessage(e),n.onmessage=e=>{n.terminate(),n=void 0,o(e.data)}},t=e=>{n.postMessage(e)};chrome.runtime.onMessage.addListener(((n,o,i)=>{const s={[e.VerifyConnectionMessages.abortProxyConnection]:t,[e.VerifyConnectionMessages.verifyProxyConnection]:r};if(s[n.type])return s[n.type](n,i),!0}))})()})();