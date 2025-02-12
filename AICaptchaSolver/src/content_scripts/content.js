function checkForCaptcha() {
    let frame = document.querySelector('iframe[title="reCAPTCHA"][width="304"][height="78"]')
    console.log(frame)
    frame.onload = function() {
        const iframeDocument = frame.contentDocument || frame.contentWindow.document;

        // Now you can manipulate the iframe's document
        console.log(iframeDocument); // This will log the document of the iframe
    };
}

checkForCaptcha()


// fetch(audioSrc)
//   .then(response => response.blob())
//   .then(blob => {
//     const audioFile = new File([blob], 'audio.mp3', { type: blob.type });
//     console.log(audioFile);
//     // You now have the audio file ready for uploading to a speech-to-text service
//   })
//   .catch(error => console.error('Error downloading audio file:', error));
