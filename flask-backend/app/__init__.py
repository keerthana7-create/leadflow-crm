"""
app/__init__.py — Application factory.

Why factory pattern?
  create_app() lets you instantiate the app with different configs:
  create_app("testing") in tests, create_app("production") in prod.
  A module-level `app = Flask(__name__)` bakes in one config forever.
"""
import os
from flask import Flask
from .extensions import db, migrate, jwt, bcrypt, cors
from .config import config_map


def create_app(config_name: str = None) -> Flask:
    config_name = config_name or os.environ.get("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    # Initialize extensions with this app instance
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints
    from .blueprints.auth import auth_bp
    from .blueprints.leads import leads_bp
    from .blueprints.users import users_bp
    from .blueprints.notes import notes_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(leads_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(notes_bp)

    # Health check — useful for Render/Railway deployment health pings
    @app.get("/api/health")
    def health():
        return {"status": "ok", "env": config_name}

    return app
