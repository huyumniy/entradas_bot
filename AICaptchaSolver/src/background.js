import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: "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",
});

async function main(file) {
    // Create a transcription job
    const transcription = await groq.audio.transcriptions.create({
      file: file, // Required path to audio file - replace with your audio file!
      model: "distil-whisper-large-v3-en", // Required model to use for transcription
      response_format: "json", // Optional
      language: "en", // Optional
    });
    console.log('govnina')
    // Log the transcribed text
    console.log(transcription.text);
}