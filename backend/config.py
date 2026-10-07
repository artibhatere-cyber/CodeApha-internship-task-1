import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration settings."""
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "127.0.0.1")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    
    # Allowed CORS Origins (comma-separated or wildcard for dev)
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Input validation settings
    MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", 5000))
    
    # Translation Provider Configuration
    # Supported: 'auto', 'google', 'mymemory', 'google_cloud', 'deepl'
    TRANSLATION_PROVIDER = os.getenv("TRANSLATION_PROVIDER", "auto")
    
    # Optional API Keys for commercial providers
    TRANSLATION_API_KEY = os.getenv("TRANSLATION_API_KEY", "")
    GOOGLE_PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID", "")
    DEEPL_API_KEY = os.getenv("DEEPL_API_KEY", "")
