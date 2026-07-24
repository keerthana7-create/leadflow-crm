from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..decorators import admin_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    """
    POST /api/auth/login
    Body: { email, password }
    Returns: { access_token, user }
    Status: 200 | 400 | 401
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"success": False, "message": "Account is deactivated"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"success": True, "access_token": token, "user": user.to_dict()}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    """
    GET /api/auth/me
    Returns: { user }
    Status: 200 | 401
    """
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    return jsonify({"success": True, "user": user.to_dict()}), 200


@auth_bp.post("/register")
@admin_required
def register():
    """
    POST /api/auth/register  (Admin only — not a public signup)
    Body: { name, email, password, role? }
    Returns: { user }
    Status: 201 | 400 | 403 | 409
    """
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role", "member")

    if not all([name, email, password]):
        return jsonify({"success": False, "message": "name, email, and password are required"}), 400

    if role not in ("admin", "member"):
        return jsonify({"success": False, "message": "role must be 'admin' or 'member'"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already registered"}), 409

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True, "user": user.to_dict()}), 201
