(()=>{function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null==n)return;var r,o,i=[],a=!0,u=!1;try{for(n=n.call(t);!(a=(r=n.next()).done)&&(i.push(r.value),!e||i.length!==e);a=!0);}catch(t){u=!0,o=t}finally{try{a||null==n.return||n.return()}finally{if(u)throw o}}return i}(t,e)||r(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function n(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=r(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var o=0,i=function(){};return{s:i,n:function(){return o>=t.length?{done:!0}:{done:!1,value:t[o++]}},e:function(t){throw t},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,u=!0,s=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return u=t.done,t},e:function(t){s=!0,a=t},f:function(){try{u||null==n.return||n.return()}finally{if(s)throw a}}}}function r(t,e){if(t){if("string"==typeof t)return o(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?o(t,e):void 0}}function o(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}var i,a,u=(i=sessionStorage.getItem("bis_data"),a={adOpt:!!document.querySelector("script[ad-opt-on]"),config:null},null!==i&&(a.config=JSON.parse(i)),a),s=u&&u.config?u.config.config.instagramConfig.TRAFFIC_LISTENER_CONFIG.PARSERS:[],f=u&&u.config?u.config.config.instagramConfig.TRAFFIC_LISTENER_CONFIG.PROPERTIES_FOR_VIDEO_DATA:[],l=u&&u.config?"".concat(u.config.id,"_p"):null,c=(!(!u||!u.adOpt)&&u.adOpt,0);var p,y=function(t,e){return function(){!function(t,e,n){try{var r={posdMessageId:"PANELOS_MESSAGE",posdHash:(Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)).substring(0,22),type:n,from:t,to:t.substring(0,t.length-2),content:e};window.postMessage(r)}catch(t){}}(l,t,e)}},E=function(t,e){var r,o=null,i=n(f);try{for(i.s();!(r=i.n()).done;){var a=r.value,u=a.NAME,s=a.PATH_NAME,l=a.IS_NECESSARY,c=a.DEFAULT_VALUE;if(o||(o={}),"detectionTime"!=u){if(e[s]&&(o[u]=T(t,e[s],c),l&&!o[u]))return null}else o[u]=Date.now()/1e3|0}}catch(t){i.e(t)}finally{i.f()}return o},T=function(n,r,o){for(var i=n,a=0,u=Object.entries(r);a<u.length;a++){var s=e(u[a],2),f=s[0],l=s[1];if("*"===l&&i.length){var c=function(){var t=r.slice(+f+1),n=t.length-1;return{v:i.map((function(r){for(var o=r,i=0,a=Object.entries(t);i<a.length;i++){var u=e(a[i],2),s=u[0],f=u[1];if(o[f]&&(o=o[f]),n===+s&&"string"==typeof o)return o}}))}}();if("object"===t(c))return c.v}if(i[l])i=i[l];else if(!i[l]){i=o;break}}return i},S=function(t,e){if(t&&t.length){var r,o=null,i=n(t);try{for(i.s();!(r=i.n()).done;){var a=r.value,u="";try{if(h(a,e.PATH_CHECK_PROPERTIES))u=(o=E(a,e.PATHS_GET_PROPERTIES)).videoSrc?"INSTAGRAM_VIDEO_DATA":"INSTAGRAM_CAROUSEL_SLIDES_SOURCES";else{if(!e.RULES_TO_GET_FULL_TEXT||!h(a,e.RULES_TO_GET_FULL_TEXT.PATH_CHECK_PROPERTIES))continue;o=E(a,e.RULES_TO_GET_FULL_TEXT.PATHS_GET_PROPERTIES),u="INSTAGRAM_FULL_TEXT_DATA"}o&&setTimeout(y(o,u),0)}catch(t){}}}catch(t){i.e(t)}finally{i.f()}}},_=function(t,e){if(t&&t.length){var r,o=[],i=n(t);try{for(i.s();!(r=i.n()).done;){var a=r.value;if(h(a,e.PATH_CHECK_PROPERTIES)){var u=E(a,e.PATHS_GET_PROPERTIES);u&&(null===u.videoVersions&&delete u.videoVersions,o.push(u))}}}catch(t){i.e(t)}finally{i.f()}o.length&&setTimeout(y(o,"INSTAGRAM_STORY_DATA"),0)}},h=function(t,r){var o,i=!1,a=n(r);try{for(a.s();!(o=a.n()).done;){for(var u=o.value,s=t,f=u.length-1,l=0,c=Object.entries(u);l<c.length;l++){var p=e(c[l],2),y=p[0],E=p[1];if(E in s&&s[E]){if(s=s[E],f===+y){i=!0;break}}else{if("*"===E&&s.length&&s.length>1&&!i&&f===+y){i=!0;break}i=!1}}if(i)break}}catch(t){a.e(t)}finally{a.f()}return i},v={XMLHttpRequest:function(t){function e(e){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}((function(t){var r=function(){for(var e=t.AD_TYPES_WAYS_TO_PROPERTIES,n=t.QUERY,r=0;r<e.length;r++){var o="QUERY_AD_TYPE_"+r,i=e[r];n=n.replace(o,i.QUERY_URL_PATH)}return new RegExp(n)},o=XMLHttpRequest.prototype.open,i=XMLHttpRequest.prototype.setRequestHeader;XMLHttpRequest.prototype.setRequestHeader=function(){var t=arguments[0].toLowerCase(),e=arguments[1];this.requestHeaders||(this.requestHeaders={}),this.requestHeaders[t]=e,i.apply(this,arguments)},XMLHttpRequest.prototype.open=function(){this.requestMethod=arguments[0],o.apply(this,arguments)};var a=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){var o=this.onreadystatechange;return this.onreadystatechange=function(){var i=this,a=r(),u=t.MATCH_HEADERS,s=this.requestHeaders?Object.keys(this.requestHeaders):null,f=!1;if(s&&(f=s.some((function(t){if(u[t]&&u[t].includes(i.requestHeaders[t]))return!0}))),4===this.readyState&&a.test(this.responseURL)){var l,c=n(t.AD_TYPES_WAYS_TO_PROPERTIES);try{var p=function(){var t=l.value,n=i.responseURL.includes(t.QUERY_URL_PATH);if(f||n){var r=i.response.length?JSON.parse(i.response):i.response,o=function t(n,r){for(var o=r,i=function(){var r=e(u[a],2),i=r[0],s=r[1];o&&o[s]&&(o=o[s]),"*"===s&&o.length&&(o=o.map((function(e){return t(n.slice(+i+1),e)})))},a=0,u=Object.entries(n);a<u.length;a++)i();return o}(t.PATH_TO_POSTS,r);"story"===t.AD_TYPE&&i.responseURL.includes(t.QUERY_URL_PATH)&&o.length?o.forEach((function(e){e&&_(e,t)})):"feed"===t.AD_TYPE&&S(o,t)}};for(c.s();!(l=c.n()).done;)p()}catch(t){c.e(t)}finally{c.f()}}if(o)return o.apply(this,arguments)},a.apply(this,arguments)}})),script:function(t){function n(){var e=Array.from(document.querySelectorAll("script")),n=new RegExp(t.REGEXP_FILTER),r=e.filter((function(t){return t.innerHTML.search(n)>-1}));return r.length?r[0]:null}if(c++,"complete"!==document.readyState&&c<15){var r=null;r=setTimeout((function(){r&&clearTimeout(r),v.script(t)}),200)}else{var o,i=(o=n())?JSON.parse(o.innerHTML):null,a=function t(n,r){for(var o=r,i=function(){var r=e(u[a],2),i=r[0],s=r[1];o&&o[s]&&(o=o[s]),"*"===s&&o.length&&(o=o.map((function(e){return t(n.slice(+i+1),e)})))},a=0,u=Object.entries(n);a<u.length;a++)i();return o}(t.PATH_TO_POSTS,i);S(a,t)}}},d=n(s);try{for(d.s();!(p=d.n()).done;){var g=p.value;g.USE&&v[g.TYPE](g)}}catch(t){d.e(t)}finally{d.f()}})();