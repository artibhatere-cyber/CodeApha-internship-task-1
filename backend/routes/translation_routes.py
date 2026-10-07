import logging
from flask import Blueprint, request, jsonify
from config import Config
from services.translation_service import translation_service, TranslationError

logger = logging.getLogger("LinguaBridge.Routes")

translation_bp = Blueprint("translation", __name__, url_prefix="/api")


def count_words(text: str) -> int:
    """Helper to count words in a string."""
    if not text:
        return 0
    return len(text.split())


@translation_bp.route("/languages", methods=["GET"])
def get_languages():
    """
    GET /api/languages
    Returns list of all supported source and target languages.
    """
    try:
        languages = translation_service.get_supported_languages()
        return jsonify({
            "success": True,
            "languages": languages,
            "total": len(languages)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching languages: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Failed to retrieve supported languages list."
        }), 500


@translation_bp.route("/translate", methods=["POST"])
def translate():
    """
    POST /api/translate
    Translates input text from source_language to target_language.
    
    Expected JSON Payload:
    {
        "text": "Hello world",
        "source_language": "en",  // or "auto"
        "target_language": "hi"
    }
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Content-Type must be application/json."
        }), 400

    data = request.get_json()
    if not data:
        return jsonify({
            "success": False,
            "error": "Request body cannot be empty."
        }), 400

    text = data.get("text", "")
    source_language = data.get("source_language", "auto")
    target_language = data.get("target_language", "en")

    # 1. Validate text presence
    if not isinstance(text, str) or not text.strip():
        return jsonify({
            "success": False,
            "error": "Please enter some text to translate."
        }), 400

    trimmed_text = text.strip()

    # 2. Validate maximum length
    if len(trimmed_text) > Config.MAX_TEXT_LENGTH:
        return jsonify({
            "success": False,
            "error": f"Text exceeds maximum permitted limit of {Config.MAX_TEXT_LENGTH} characters."
        }), 413

    # 3. Validate languages
    if not source_language or not isinstance(source_language, str):
        return jsonify({
            "success": False,
            "error": "Source language must be provided."
        }), 400

    if not target_language or not isinstance(target_language, str):
        return jsonify({
            "success": False,
            "error": "Target language must be provided."
        }), 400

    try:
        result = translation_service.translate(
            text=trimmed_text,
            source_language=source_language.strip(),
            target_language=target_language.strip()
        )

        translated_text = result["translated_text"]

        return jsonify({
            "success": True,
            "translated_text": translated_text,
            "source_language": result["source_language"],
            "target_language": result["target_language"],
            "detected_language": result.get("detected_language", source_language),
            "stats": {
                "source_chars": len(trimmed_text),
                "source_words": count_words(trimmed_text),
                "translated_chars": len(translated_text),
                "translated_words": count_words(translated_text)
            },
            "provider": result.get("provider", "neural_engine")
        }), 200

    except TranslationError as te:
        logger.warning(f"Translation logic error: {te}")
        return jsonify({
            "success": False,
            "error": str(te)
        }), 400

    except Exception as e:
        logger.error(f"Unexpected error during translation: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Translation service is temporarily unavailable. Please try again."
        }), 503


@translation_bp.route("/health", methods=["GET"])
def health_check():
    """
    GET /api/health
    Service health check endpoint.
    """
    return jsonify({
        "status": "healthy",
        "service": "LinguaBridge AI Translation API",
        "version": "1.0.0",
        "task": "CodeAlpha Artificial Intelligence Internship Task 1",
        "provider_configured": Config.TRANSLATION_PROVIDER
    }), 200
