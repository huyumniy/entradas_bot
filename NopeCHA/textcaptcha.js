(async()=>{function t(t){try{if(t?.textcaptcha_image_selector&&t?.textcaptcha_input_selector){if(function(t){try{if(t?.textcaptcha_image_selector)return!!document.querySelector(t.textcaptcha_image_selector)}catch(t){}}(t)){var e,a=t;try{if(a?.textcaptcha_input_selector)return!!(!(e=document.querySelector(a.textcaptcha_input_selector))||e.value?void 0:1)}catch(t){}return!!void 0}return}}catch(t){}}async function i(t){async function e(t){var a,e=document.querySelector(t);if(e instanceof HTMLCanvasElement)return{image_data:[Image.encode_canvas($canvas)]};let n;if(e instanceof HTMLImageElement)n=e;else{var{is_url:e,data:c}=function(t){let e=t.style.backgroundImage,a=!0;return e&&((t=e.trim().match(/(?!^)".*?"/g))&&0!==t.length||(e=null),(e=t[0].replaceAll('"',"")).startsWith("data:"))&&(a=!1,e=e.split(";base64,")[1]),{is_url:a,data:e}}(e);if(!e)return{image_data:[c]};n=(a=c,await new Promise(t=>{const e=new Image;e.onload=()=>t(e),e.src=a}))}if(!n)throw Error("failed to get image element for "+t);try{return{image_data:[Image.encode_image(n)]}}catch(t){if(t instanceof DOMException&&n.src.startsWith("http"))return{image_urls:[n.src]}}return null}try{return await e(t)}catch(t){return null}}let s=null;async function e(t){var e=await async function(t){if(t=await i(t.textcaptcha_image_selector)){var e=JSON.stringify(t);if(s!==e)return s=e,t}}(t);if(e){var a="textcaptcha",{start:e,data:n}=(e.type=a,e.settings=t,await NopeCHA.post(e));if(n&&(await NopeCHA.delay({settings:t,start:e,type:a}),n)&&0<n.length){var c=document.querySelector(t.textcaptcha_input_selector);if(c&&!c.value){c.click(),c.focus(),await Time.sleep(500),c.value=n[0];for(const r of n[0])c.dispatchEvent(new KeyboardEvent("keydown",{key:r})),await Time.sleep(50),c.dispatchEvent(new KeyboardEvent("keypress",{key:r})),await Time.sleep(50),c.dispatchEvent(new KeyboardEvent("keyup",{key:r})),await Time.sleep(50)}}}}for(;;){await Time.sleep(1e3);var a,n=await BG.exec("Settings.get");n&&n.enabled&&n.textcaptcha_auto_solve&&(a=await Location.hostname(),n.disabled_hosts.includes(a)||t(n)&&await e(n))}})();