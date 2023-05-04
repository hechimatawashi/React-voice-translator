import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FiMic, FiPlay } from 'react-icons/fi';
import './App.css';

const App = () => {
  const [translatedText, setTranslatedText] = useState('');
  const [translationDirection, setTranslationDirection] = useState('EN');
  const [isRecording, setIsRecording] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();

  const apiKey =  process.env.REACT_APP_DEEPL_API_KEY;

  const translateText = async (text) => {
    const params = new URLSearchParams();
    params.append('auth_key', apiKey);
    params.append('text', text);
    params.append('target_lang', translationDirection);

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(r => r.json());

    console.log(response)
    const translated = response.translations[0].text;
    return translated;
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = translationDirection === 'EN' ? 'en-US' : 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    setIsRecording(true);
    resetTranscript();
    setTranslatedText('');
    SpeechRecognition.startListening({
      continuous: true,
      language: translationDirection === 'EN' ? 'ja-JP' : 'en-US',
    });
  };

  const stopListening = async () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
    const translated = await translateText(transcript);
    setTranslatedText(translated);
  };

  const handleTranslationDirectionChange = (e) => {
    setTranslationDirection(e.target.value);
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="app-container">
      <label htmlFor="translation-direction">Translation direction: </label>
      <select id="translation-direction" value={translationDirection} onChange={handleTranslationDirectionChange}>
        <option value="EN">Japanese to English</option>
        <option value="JA">English to Japanese</option>
      </select>
      <button className={`mic-button${isRecording ? ' listening' : ''}`} onClick={handleButtonClick}>
        <FiMic size="1.5em" />
      </button>
      <p>認識した音声: {transcript}</p>
      <p className='translated-text'>翻訳結果: {translatedText}</p>
      <button className="play-button" onClick={() => speak(translatedText)}>
        <FiPlay size="1.5em" />
      </button>
    </div>
  );
};

export default App;
