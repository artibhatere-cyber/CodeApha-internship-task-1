import logging
import urllib.parse
import requests
from typing import Dict, Any, List, Optional
from config import Config

logger = logging.getLogger("LinguaBridge.TranslationService")
logger.setLevel(logging.INFO)

# Comprehensive list of supported languages with international codes, display names, and native scripts
SUPPORTED_LANGUAGES: List[Dict[str, str]] = [
    {"code": "en", "name": "English", "nativeName": "English"},
    {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी"},
    {"code": "te", "name": "Telugu", "nativeName": "తెలుగు"},
    {"code": "ta", "name": "Tamil", "nativeName": "தமிழ்"},
    {"code": "kn", "name": "Kannada", "nativeName": "ಕನ್ನಡ"},
    {"code": "ml", "name": "Malayalam", "nativeName": "മലയാളം"},
    {"code": "mr", "name": "Marathi", "nativeName": "मराठी"},
    {"code": "bn", "name": "Bengali", "nativeName": "বাংলা"},
    {"code": "gu", "name": "Gujarati", "nativeName": "ગુજરાતી"},
    {"code": "pa", "name": "Punjabi", "nativeName": "ਪੰਜਾਬੀ"},
    {"code": "ur", "name": "Urdu", "nativeName": "اردو"},
    {"code": "es", "name": "Spanish", "nativeName": "Español"},
    {"code": "fr", "name": "French", "nativeName": "Français"},
    {"code": "de", "name": "German", "nativeName": "Deutsch"},
    {"code": "it", "name": "Italian", "nativeName": "Italiano"},
    {"code": "pt", "name": "Portuguese", "nativeName": "Português"},
    {"code": "ru", "name": "Russian", "nativeName": "Русский"},
    {"code": "ja", "name": "Japanese", "nativeName": "日本語"},
    {"code": "ko", "name": "Korean", "nativeName": "한국어"},
    {"code": "zh-CN", "name": "Chinese (Simplified)", "nativeName": "简体中文"},
    {"code": "zh-TW", "name": "Chinese (Traditional)", "nativeName": "繁體中文"},
    {"code": "ar", "name": "Arabic", "nativeName": "العربية"},
    {"code": "tr", "name": "Turkish", "nativeName": "Türkçe"},
    {"code": "nl", "name": "Dutch", "nativeName": "Nederlands"},
    {"code": "pl", "name": "Polish", "nativeName": "Polski"},
    {"code": "sv", "name": "Swedish", "nativeName": "Svenska"},
    {"code": "id", "name": "Indonesian", "nativeName": "Bahasa Indonesia"},
    {"code": "vi", "name": "Vietnamese", "nativeName": "Tiếng Việt"},
    {"code": "th", "name": "Thai", "nativeName": "ไทย"},
    {"code": "el", "name": "Greek", "nativeName": "Ελληνικά"},
    {"code": "cs", "name": "Czech", "nativeName": "Čeština"},
    {"code": "ro", "name": "Romanian", "nativeName": "Română"},
    {"code": "fa", "name": "Persian", "nativeName": "فارسی"},
    {"code": "ne", "name": "Nepali", "nativeName": "नेपाली"},
    {"code": "sw", "name": "Swahili", "nativeName": "Kiswahili"}
]

LANGUAGE_MAP: Dict[str, str] = {lang["code"].lower(): lang["name"] for lang in SUPPORTED_LANGUAGES}


class TranslationError(Exception):
    """Base exception for translation service failures."""
    pass


class TranslationService:
    """
    Dedicated translation service abstraction supporting multiple providers:
    - Official Google Cloud Translation API (when TRANSLATION_API_KEY is configured)
    - High-performance Google Translate neural service layer
    - Deep-Translator MyMemory / Google fallback
    """

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "LinguaBridgeAI/1.0 (Language Translation Service; Client=Web)"
        })

    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Return the list of supported languages."""
        return SUPPORTED_LANGUAGES

    def is_valid_language(self, code: str, allow_auto: bool = False) -> bool:
        """Validate whether a language code is supported."""
        if not code or not isinstance(code, str):
            return False
        normalized = code.strip().lower()
        if allow_auto and normalized == "auto":
            return True
        return normalized in LANGUAGE_MAP or any(l["code"].lower() == normalized for l in SUPPORTED_LANGUAGES)

    def _split_into_chunks(self, text: str, max_chunk_size: int = 1500) -> List[str]:
        """
        Split long text into natural chunks (by paragraphs or sentences) 
        to ensure translation quality without exceeding endpoint payload limits.
        """
        if len(text) <= max_chunk_size:
            return [text]

        chunks = []
        paragraphs = text.split("\n")
        current_chunk = []
        current_length = 0

        for para in paragraphs:
            # If paragraph itself is huge, break into sentences
            if len(para) > max_chunk_size:
                sentences = para.replace(". ", ".\n").replace("? ", "?\n").replace("! ", "!\n").split("\n")
                for sentence in sentences:
                    if current_length + len(sentence) + 1 > max_chunk_size and current_chunk:
                        chunks.append("\n".join(current_chunk))
                        current_chunk = [sentence]
                        current_length = len(sentence)
                    else:
                        current_chunk.append(sentence)
                        current_length += len(sentence) + 1
            else:
                if current_length + len(para) + 1 > max_chunk_size and current_chunk:
                    chunks.append("\n".join(current_chunk))
                    current_chunk = [para]
                    current_length = len(para)
                else:
                    current_chunk.append(para)
                    current_length += len(para) + 1

        if current_chunk:
            chunks.append("\n".join(current_chunk))

        return [c for c in chunks if c.strip()]

    def _translate_with_google_cloud_api(self, text: str, source: str, target: str) -> Optional[str]:
        """
        Translate using official Google Cloud Translation REST API v2
        Requires TRANSLATION_API_KEY in .env.
        """
        api_key = Config.TRANSLATION_API_KEY
        if not api_key:
            return None

        url = "https://translation.googleapis.com/language/translate/v2"
        params = {"key": api_key}
        payload = {
            "q": text,
            "target": target,
            "format": "text"
        }
        if source != "auto":
            payload["source"] = source

        response = self.session.post(url, params=params, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        translations = data.get("data", {}).get("translations", [])
        if translations:
            return translations[0].get("translatedText")
        return None

    def _translate_with_neural_engine(self, chunk: str, source: str, target: str) -> Dict[str, Any]:
        """
        Translate a single text chunk using standard neural translation gateway.
        Returns translated text and detected source language.
        """
        encoded_query = urllib.parse.quote(chunk)
        url = (
            f"https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl={source}&tl={target}&dt=t&dt=bd&dj=1&q={encoded_query}"
        )

        response = self.session.get(url, timeout=8)
        if response.status_code != 200:
            # Fallback to non-dj format
            fallback_url = (
                f"https://translate.googleapis.com/translate_a/single"
                f"?client=gtx&sl={source}&tl={target}&dt=t&q={encoded_query}"
            )
            fallback_res = self.session.get(fallback_url, timeout=8)
            fallback_res.raise_for_status()
            data = fallback_res.json()
            # Parsed structure: [[["translated", "source", ...]], ...]
            translated_pieces = [item[0] for item in data[0] if item and len(item) > 0 and item[0]]
            detected_lang = data[2] if len(data) > 2 and isinstance(data[2], str) else source
            return {
                "translated_text": "".join(translated_pieces),
                "detected_language": detected_lang
            }

        data = response.json()
        sentences = data.get("sentences", [])
        translated_pieces = [s.get("trans", "") for s in sentences if "trans" in s]
        detected_lang = data.get("src", source)

        return {
            "translated_text": "".join(translated_pieces),
            "detected_language": detected_lang
        }

    def _translate_with_deep_translator(self, chunk: str, source: str, target: str) -> str:
        """Fallback translation via deep-translator package."""
        from deep_translator import GoogleTranslator
        src = "auto" if source == "auto" else source.lower()
        tgt = target.lower()
        # map zh-CN to chinese (simplified) if needed
        if tgt == "zh-cn":
            tgt = "zh-CN"
        elif tgt == "zh-tw":
            tgt = "zh-TW"
        
        translator = GoogleTranslator(source=src, target=tgt)
        return translator.translate(chunk)

    def translate(self, text: str, source_language: str = "auto", target_language: str = "en") -> Dict[str, Any]:
        """
        Main translation entrypoint.
        
        Args:
            text: Text to translate.
            source_language: Source language code (e.g. 'en', 'hi', 'auto').
            target_language: Target language code (e.g. 'es', 'te', 'hi').
            
        Returns:
            Dict containing translated_text, source_language, target_language, detected_language.
        """
        clean_text = text.strip() if text else ""
        if not clean_text:
            raise TranslationError("Text cannot be empty.")

        src = source_language.strip() if source_language else "auto"
        tgt = target_language.strip() if target_language else "en"

        # Validate language support
        if not self.is_valid_language(src, allow_auto=True):
            raise TranslationError(f"Unsupported source language: '{src}'.")
        if not self.is_valid_language(tgt, allow_auto=False):
            raise TranslationError(f"Unsupported target language: '{tgt}'.")

        # If source and target are explicitly the same and not auto
        if src.lower() == tgt.lower() and src.lower() != "auto":
            return {
                "translated_text": clean_text,
                "source_language": src,
                "target_language": tgt,
                "detected_language": src,
                "is_identical": True
            }

        # 1. Try Google Cloud API if key is provided
        if Config.TRANSLATION_API_KEY:
            try:
                logger.info("Attempting translation via Google Cloud Translation API...")
                cloud_result = self._translate_with_google_cloud_api(clean_text, src, tgt)
                if cloud_result:
                    return {
                        "translated_text": cloud_result,
                        "source_language": src,
                        "target_language": tgt,
                        "detected_language": src if src != "auto" else "detected",
                        "provider": "google_cloud"
                    }
            except Exception as e:
                logger.warning(f"Google Cloud API call failed: {e}. Falling back to neural engine.")

        # 2. Translate with neural gateway (handles chunking seamlessly)
        chunks = self._split_into_chunks(clean_text, max_chunk_size=1500)
        translated_chunks: List[str] = []
        final_detected_lang = src

        for chunk in chunks:
            try:
                res = self._translate_with_neural_engine(chunk, src, tgt)
                translated_chunks.append(res["translated_text"])
                if res.get("detected_language"):
                    final_detected_lang = res["detected_language"]
            except Exception as e:
                logger.warning(f"Neural engine attempt failed on chunk: {e}. Retrying with deep-translator fallback.")
                try:
                    dt_translated = self._translate_with_deep_translator(chunk, src, tgt)
                    translated_chunks.append(dt_translated)
                except Exception as fallback_err:
                    logger.error(f"Fallback translation failed: {fallback_err}")
                    raise TranslationError("Translation service is temporarily unavailable. Please try again.")

        full_translation = "\n".join(translated_chunks)
        
        return {
            "translated_text": full_translation,
            "source_language": src,
            "target_language": tgt,
            "detected_language": final_detected_lang,
            "provider": "neural_translation_engine"
        }


# Singleton instance for dependency injection across routes
translation_service = TranslationService()
