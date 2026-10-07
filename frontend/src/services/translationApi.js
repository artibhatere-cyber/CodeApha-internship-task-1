/**
 * Translation API Service Layer
 * Communicates with the Flask REST backend API endpoints.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const translationApi = {
  /**
   * Fetch the list of supported languages from the backend.
   */
  async getSupportedLanguages() {
    try {
      const response = await fetch(`${BASE_URL}/languages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.languages || [];
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      throw err;
    }
  },

  /**
   * Translate text using the backend translation service.
   * @param {string} text - Text to translate
   * @param {string} sourceLanguage - Source language code or 'auto'
   * @param {string} targetLanguage - Target language code
   */
  async translate(text, sourceLanguage = 'auto', targetLanguage = 'en') {
    try {
      const response = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Translation request failed (HTTP ${response.status})`);
      }

      return data;
    } catch (err) {
      console.error('Translation API error:', err);
      // Give meaningful error if network request failed completely
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Could not connect to translation server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  /**
   * Check backend health status.
   */
  async checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  }
};
