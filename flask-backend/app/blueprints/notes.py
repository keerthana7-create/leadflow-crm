from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..decorators import member_or_admin_required
from ..services.lead_service import LeadService

notes_bp = Blueprint("notes", __name__, url_prefix="/api/leads")


@notes_bp.get("/<int:lead_id>/notes")
@member_or_admin_required
def get_notes(lead_id):
    """
    GET /api/leads/:id/notes
    Returns: { success, data: [notes] }
    Status: 200 | 401 | 404
    """
    try:
        notes = LeadService.get_notes(lead_id=lead_id)
        return jsonify({"success": True, "data": notes}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404


@notes_bp.post("/<int:lead_id>/notes")
@member_or_admin_required
def add_note(lead_id):
    """
    POST /api/leads/:id/notes
    Body: { body* }
    Returns: { success, data: {note} }
    Status: 201 | 400 | 401 | 404
    """
    user_id = int(get_jwt_identity()) if get_jwt_identity() else None
    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()

    if not body:
        return jsonify({"success": False, "message": "body is required"}), 400

    try:
        note = LeadService.add_note(lead_id=lead_id, body=body, author_id=user_id)
        return jsonify({"success": True, "data": note}), 201
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404
    except Exception as e:
        return jsonify({"success": False, "message": "Server error"}), 500
