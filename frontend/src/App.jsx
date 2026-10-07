import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TranslationBox from './components/TranslationBox';
import TranslationHistory from './components/TranslationHistory';
import AboutSection from './components/AboutSection';
import TechStack from './components/TechStack';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { translationApi } from './services/translationApi';

const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('linguabridge_theme') || 'dark';
  });

  // Languages list state
  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);

  // Translation workspace state
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('hi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Translation history state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('linguabridge_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('linguabridge_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch supported languages on mount
  useEffect(() => {
    let isMounted = true;
    translationApi
      .getSupportedLanguages()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLanguages(data);
        }
      })
      .catch((err) => {
        console.warn('Using default languages fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save translation to localStorage history
  const saveToHistory = (item) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        sourceLanguage: item.sourceLanguage,
        targetLanguage: item.targetLanguage,
        sourceText: item.sourceText,
        translatedText: item.translatedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setHistory((prev) => {
        // Prevent immediate duplicates
        if (prev.length > 0 && prev[0].sourceText === item.sourceText && prev[0].targetLanguage === item.targetLanguage) {
          return prev;
        }
        const updated = [newEntry, ...prev.slice(0, 19)]; // Keep latest 20
        localStorage.setItem('linguabridge_history', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error('Failed to save to history:', e);
    }
  };

  // Load an item from history back into workspace
  const handleLoadHistoryItem = (item) => {
    setSourceLang(item.sourceLanguage);
    setTargetLang(item.targetLanguage);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    addToast('Loaded item from history into translator.', 'info');

    // Scroll to translator
    const el = document.getElementById('translator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Delete single item from history
  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem('linguabridge_history', JSON.stringify(updated));
      return updated;
    });
    addToast('Item removed from history.', 'info');
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('linguabridge_history');
    addToast('Translation history cleared.', 'info');
  };

  // Core Translate Function
  const handleTranslate = async () => {
    const trimmed = sourceText.trim();

    if (!trimmed) {
      addToast('Please enter some text to translate.', 'warning');
      return;
    }

    if (trimmed.length > 5000) {
      addToast('Text exceeds the 5,000 character limit. Please shorten your input.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await translationApi.translate(
        trimmed,
        sourceLang,
        targetLang
      );

      if (response && response.success) {
        setTranslatedText(response.translated_text);
        if (response.detected_language) {
          setDetectedLang(response.detected_language);
        }

        saveToHistory({
          sourceLanguage: response.detected_language || sourceLang,
          targetLanguage: targetLang,
          sourceText: trimmed,
          translatedText: response.translated_text
        });
      } else {
        throw new Error(response.error || 'Translation failed.');
      }
    } catch (err) {
      console.error('Translation error:', err);
      addToast(
        err.message || 'Translation service is temporarily unavailable. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Top Navigation */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Translation Workspace */}
        <TranslationBox
          languages={languages}
          onTranslate={handleTranslate}
          isLoading={isLoading}
          addToast={addToast}
          sourceLang={sourceLang}
          setSourceLang={setSourceLang}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          sourceText={sourceText}
          setSourceText={setSourceText}
          translatedText={translatedText}
          setTranslatedText={setTranslatedText}
          detectedLang={detectedLang}
        />

        {/* Recent History */}
        <TranslationHistory
          history={history}
          onLoadItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
          onDeleteItem={handleDeleteHistoryItem}
          addToast={addToast}
          languages={languages}
        />

        {/* About Section */}
        <AboutSection />

        {/* Tech Stack Cards */}
        <TechStack />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
