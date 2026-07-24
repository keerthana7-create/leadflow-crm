from flask import Blueprint, request, jsonify
from ..decorators import admin_required
from ..services.user_service import UserService

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.get("")
@admin_required
def list_users():
    """GET /api/users — Admin only. Returns all users."""
    return jsonify({"success": True, "data": UserService.list_users()}), 200


@users_bp.post("")
@admin_required
def create_user():
    """
    POST /api/users — Admin only
    Body: { name*, email*, password*, role? }
    Status: 201 | 400 | 403 | 409
    """
    data = request.get_json(silent=True) or {}
    if not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"success": False, "message": "name, email, and password required"}), 400

    try:
        user = UserService.create(data)
        return jsonify({"success": True, "data": user}), 201
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 409


@users_bp.put("/<int:user_id>")
@admin_required
def update_user(user_id):
    """PUT /api/users/:id — Admin only. Update name, email, role, is_active."""
    data = request.get_json(silent=True) or {}
    try:
        user = UserService.update(user_id, data)
        return jsonify({"success": True, "data": user}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404


@users_bp.delete("/<int:user_id>")
@admin_required
def delete_user(user_id):
    """DELETE /api/users/:id — Admin only."""
    try:
        UserService.delete(user_id)
        return jsonify({"success": True, "message": "User deleted"}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404
