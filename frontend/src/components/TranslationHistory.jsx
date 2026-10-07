import React from 'react';
import { FiClock, FiTrash2, FiCopy, FiRotateCcw } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';

export default function TranslationHistory({
  history = [],
  onLoadItem,
  onClearHistory,
  onDeleteItem,
  addToast,
  languages = []
}) {
  const getLanguageName = (code) => {
    if (!code) return '';
    if (code === 'auto') return 'Auto Detect';
    const found = languages.find((l) => l.code.toLowerCase() === code.toLowerCase());
    return found ? found.name : code.toUpperCase();
  };

  const handleCopy = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      addToast('✓ Copied from history!', 'success');
    } catch {
      addToast('Failed to copy text', 'error');
    }
  };

  return (
    <section id="history" className="history-section">
      <div className="content-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <FiClock className="section-title-icon" />
            <span>Recent Translation History</span>
          </h2>

          {history.length > 0 && (
            <button
              id="clear-history-btn"
              className="action-btn"
              onClick={onClearHistory}
              title="Clear all translation history"
            >
              <FiTrash2 />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-history-box">
            <p>No recent translations yet. Your translated items will be automatically stored locally here.</p>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="history-card">
                <div className="history-card-header">
                  <div className="lang-route-badge">
                    <span>{getLanguageName(item.sourceLanguage)}</span>
                    <HiOutlineArrowNarrowRight />
                    <span>{getLanguageName(item.targetLanguage)}</span>
                  </div>
                  <span className="history-timestamp">{item.timestamp}</span>
                </div>

                <div className="history-content">
                  <div className="history-source-text" title={item.sourceText}>
                    {item.sourceText}
                  </div>
                  <div className="history-translated-text" title={item.translatedText}>
                    {item.translatedText}
                  </div>
                </div>

                <div className="history-card-actions">
                  <button
                    className="action-btn"
                    onClick={() => onLoadItem(item)}
                    title="Reuse in translator"
                  >
                    <FiRotateCcw />
                    <span>Reuse</span>
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => handleCopy(item.translatedText)}
                    title="Copy translation"
                  >
                    <FiCopy />
                    <span>Copy</span>
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete item"
                    aria-label="Delete history entry"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
