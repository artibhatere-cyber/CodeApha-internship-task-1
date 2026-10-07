import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.translation_routes import translation_bp

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("LinguaBridge.App")


def create_app() -> Flask:
    """Application factory to construct and configure the Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend connectivity
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )

    # Register API blueprints
    app.register_blueprint(translation_bp)

    # Global HTTP error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "The requested API endpoint was not found on this server."
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": "HTTP method not allowed for this route."
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal Server Error: {error}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "An internal server error occurred. Please try again later."
        }), 500

    @app.route("/")
    def index():
        return jsonify({
            "name": "LinguaBridge AI Backend API",
            "description": "Intelligent Language Translation Service for CodeAlpha AI Internship Task 1",
            "status": "online",
            "endpoints": [
                "GET  /api/health",
                "GET  /api/languages",
                "POST /api/translate"
            ]
        }), 200

    return app


app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting LinguaBridge AI server on http://{Config.HOST}:{Config.PORT}")
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
