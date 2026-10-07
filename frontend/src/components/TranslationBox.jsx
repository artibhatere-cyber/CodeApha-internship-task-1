import React, { useState, useEffect } from 'react';
import {
  FiCopy,
  FiCheck,
  FiVolume2,
  FiVolumeX,
  FiTrash2,
  FiDownload
} from 'react-icons/fi';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { BsStars } from 'react-icons/bs';
import LanguageSelector from './LanguageSelector';

const SAMPLE_TEXTS = [
  { label: 'Greeting', text: 'Hello, how are you? Welcome to our intelligent translation platform.' },
  { label: 'Technology', text: 'Artificial intelligence is transforming how people communicate across borders.' },
  { label: 'Travel', text: 'Where is the nearest train station and what time does the next train arrive?' },
  { label: 'Hindi Greeting', text: 'नमस्ते! आप कैसे हैं? LinguaBridge AI में आपका स्वागत है।' },
];

export default function TranslationBox({
  languages = [],
  onTranslate,
  isLoading,
  addToast,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  sourceText,
  setSourceText,
  translatedText,
  setTranslatedText,
  detectedLang
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Compute character and word counts
  const sourceCharCount = sourceText.length;
  const sourceWordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;

  const targetCharCount = translatedText.length;
  const targetWordCount = translatedText.trim() ? translatedText.trim().split(/\s+/).length : 0;

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Swap Languages
  const handleSwap = () => {
    if (sourceLang === 'auto') {
      addToast('Cannot swap while Auto Detect is active. Please select a specific source language first.', 'warning');
      return;
    }

    const prevSource = sourceLang;
    const prevTarget = targetLang;
    const prevInput = sourceText;
    const prevOutput = translatedText;

    setSourceLang(prevTarget);
    setTargetLang(prevSource);

    // Also swap content if output exists
    if (prevOutput) {
      setSourceText(prevOutput);
      setTranslatedText(prevInput);
    }

    addToast(`Swapped languages: ${prevTarget.toUpperCase()} ↔ ${prevSource.toUpperCase()}`, 'info');
  };

  // Clear text
  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Copy translated text to clipboard
  const handleCopy = async () => {
    if (!translatedText) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(translatedText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = translatedText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      addToast('✓ Translation copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
      addToast('Could not copy to clipboard. Please copy manually.', 'error');
    }
  };

  // Text-To-Speech using Web Speech API
  const handleTextToSpeech = () => {
    if (!translatedText) return;

    if (!('speechSynthesis' in window)) {
      addToast('Text-to-Speech is not supported in your current browser.', 'warning');
      return;
    }

    // If currently speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any active utterances

      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLang;

      // Try matching best voice for the target language
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase().startsWith(targetLang.toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
      addToast('Could not play speech for this language.', 'warning');
    }
  };

  // Download translated text as .txt file
  const handleDownload = () => {
    if (!translatedText) return;
    try {
      const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `translation_${sourceLang}_to_${targetLang}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Translation downloaded as text file.', 'success');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle Ctrl+Enter shortcut in textarea
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        onTranslate();
      }
    }
  };

  return (
    <section id="translator" className="translator-section">
      <div className="content-wrapper">
        <div className="workspace-card">
          <div className="workspace-grid">
            {/* 1. Left Card: Source Text */}
            <div className="translation-box" id="source-card">
              <div className="box-header">
                <LanguageSelector
                  id="source-language-select"
                  value={sourceLang}
                  onChange={setSourceLang}
                  languages={languages}
                  allowAuto={true}
                  label="Source Language"
                  disabled={isLoading}
                />
                {sourceLang === 'auto' && detectedLang && detectedLang !== 'auto' && (
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    Detected: {detectedLang.toUpperCase()}
                  </span>
                )}
                {sourceText && (
                  <button
                    className="action-btn"
                    onClick={handleClear}
                    title="Clear text"
                    aria-label="Clear source text"
                  >
                    <FiTrash2 />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="box-body">
                <textarea
                  id="source-text-input"
                  className="translation-textarea"
                  placeholder="Enter or paste text here to translate... (Ctrl + Enter to translate)"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={5000}
                  aria-label="Text to translate"
                />
              </div>

              <div className="box-footer">
                <div className="counter-group">
                  <span
                    className="counter-item"
                    style={{
                      color: sourceCharCount > 4500 ? 'var(--warning)' : 'inherit',
                      fontWeight: sourceCharCount > 4500 ? 700 : 'normal',
                    }}
                  >
                    Chars: {sourceCharCount} / 5000
                  </span>
                  <span className="counter-item">Words: {sourceWordCount}</span>
                </div>
              </div>
            </div>

            {/* 2. Center: Swap Button */}
            <div className="swap-column">
              <button
                id="swap-languages-btn"
                className="swap-btn"
                onClick={handleSwap}
                disabled={isLoading}
                title="Swap source and target languages"
                aria-label="Swap source and target languages"
              >
                <HiArrowsRightLeft />
              </button>
            </div>

            {/* 3. Right Card: Translated Result */}
            <div className="translation-box" id="target-card">
              <div className="box-header">
                <LanguageSelector
                  id="target-language-select"
                  value={targetLang}
                  onChange={setTargetLang}
                  languages={languages}
                  allowAuto={false}
                  label="Target Language"
                  disabled={isLoading}
                />
              </div>

              <div className="box-body">
                {isLoading ? (
                  <div className="empty-output-state">
                    <div className="spinner" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-primary)', width: 36, height: 36 }}></div>
                    <span className="empty-title">Translating text...</span>
                    <span className="empty-sub">Connecting to intelligent neural translation engine</span>
                  </div>
                ) : translatedText ? (
                  <div id="translated-text-output" className="translation-output">
                    {translatedText}
                  </div>
                ) : (
                  <div className="empty-output-state">
                    <div className="empty-icon">
                      <BsStars />
                    </div>
                    <span className="empty-title">Your translation will appear here</span>
                    <span className="empty-sub">
                      Select languages, enter your text on the left, and click &ldquo;Translate Text&rdquo;.
                    </span>
                  </div>
                )}
              </div>

              <div className="box-footer">
                <div className="counter-group">
                  <span className="counter-item">Chars: {targetCharCount}</span>
                  <span className="counter-item">Words: {targetWordCount}</span>
                </div>

                <div className="footer-actions">
                  {/* Text To Speech */}
                  <button
                    id="tts-btn"
                    className={`action-btn ${isSpeaking ? 'active' : ''}`}
                    onClick={handleTextToSpeech}
                    disabled={!translatedText || isLoading}
                    title="Listen to translation"
                    aria-label="Listen to translated text aloud"
                  >
                    {isSpeaking ? (
                      <>
                        <div className="audio-wave">
                          <span className="audio-bar"></span>
                          <span className="audio-bar"></span>
                          <span className="audio-bar"></span>
                        </div>
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <FiVolume2 />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    id="copy-translation-btn"
                    className="action-btn"
                    onClick={handleCopy}
                    disabled={!translatedText || isLoading}
                    title="Copy translation to clipboard"
                    aria-label="Copy translation to clipboard"
                  >
                    {copied ? (
                      <>
                        <FiCheck style={{ color: 'var(--success)' }} />
                        <span style={{ color: 'var(--success)' }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FiCopy />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Download Button */}
                  <button
                    id="download-btn"
                    className="action-btn"
                    onClick={handleDownload}
                    disabled={!translatedText || isLoading}
                    title="Download translation text file"
                    aria-label="Download translation as text file"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test Samples */}
          <div className="quick-samples-wrapper">
            <span>Quick test samples:</span>
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="sample-pill"
                onClick={() => setSourceText(sample.text)}
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Large Translate CTA Button */}
          <div className="translate-action-bar">
            <button
              id="translate-submit-btn"
              className="translate-btn"
              onClick={onTranslate}
              disabled={isLoading}
              aria-label="Translate Text"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <BsStars />
                  <span>Translate Text</span>
                </>
              )}
            </button>
          </div>
          <div className="shortcut-hint">
            Tip: Press <span className="key-badge">Ctrl</span> + <span className="key-badge">Enter</span> to translate quickly
          </div>
        </div>
      </div>
    </section>
  );
}
