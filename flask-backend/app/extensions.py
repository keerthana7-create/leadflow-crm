"""
extensions.py — Singleton extension instances.

Why separate from app factory?
  Circular import prevention: models import db, blueprints import db,
  but neither should import the app object. Defining extensions here
  breaks the cycle: app/__init__.py imports extensions AND blueprints,
  extensions knows nothing about them.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()
