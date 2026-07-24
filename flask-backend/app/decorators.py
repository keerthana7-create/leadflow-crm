"""
decorators.py — Route-level RBAC enforcement.

Interview answer: "Why decorators and not middleware?"
  Flask middleware (before_request) runs for EVERY route. Role checks
  are per-route concerns — some routes are public, some admin-only, some
  for any authenticated user. Decorators express intent clearly at the
  route definition and compose naturally with @jwt_required().
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from .extensions import db


def _get_current_user():
    from .models.user import User
    identity = get_jwt_identity()
    if not identity:
        return None
    return db.session.get(User, int(identity))


def admin_required(fn):
    """Restrict endpoint to users with role == 'admin'."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = _get_current_user()
        if not user or user.role != "admin":
            return jsonify({"success": False, "message": "Admin privileges required"}), 403
        return fn(*args, **kwargs)
    return wrapper


def member_or_admin_required(fn):
    """Allow any authenticated user (admin or member)."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = _get_current_user()
        if not user or not user.is_active:
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper
