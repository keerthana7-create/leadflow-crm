from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..decorators import admin_required, member_or_admin_required
from ..services.lead_service import LeadService
from ..services.activity_service import ActivityService

leads_bp = Blueprint("leads", __name__, url_prefix="/api/leads")


# ─── PUBLIC ENDPOINT ────────────────────────────────────────────────────────

@leads_bp.post("/capture")
def capture_lead():
    """
    POST /api/leads/capture  — PUBLIC, no auth required
    Used by the marketing website contact form.
    Body: { name*, email*, phone?, company?, message? }
    Returns: { success, data: {lead} }
    Status: 201 | 400
    """
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()

    if not name or not email:
        return jsonify({"success": False, "message": "name and email are required"}), 400

    if "@" not in email:
        return jsonify({"success": False, "message": "Invalid email format"}), 400

    try:
        lead = LeadService.create(data={
            "name": name,
            "email": email,
            "phone": data.get("phone"),
            "company": data.get("company"),
            "message": data.get("message"),
            "source": "Website",
        })
        return jsonify({"success": True, "data": lead}), 201
    except Exception as e:
        return jsonify({"success": False, "message": "Server error"}), 500


# ─── AUTHENTICATED ENDPOINTS ─────────────────────────────────────────────────

@leads_bp.get("")
@member_or_admin_required
def list_leads():
    """
    GET /api/leads?page=1&limit=20&status=New&assigned_to=<id>
    Returns: { success, data: [leads], pagination }
    Status: 200 | 400 | 401
    """
    user_id = int(get_jwt_identity()) if get_jwt_identity() else None

    page = max(1, int(request.args.get("page", 1)))
    limit = min(100, max(1, int(request.args.get("limit", 20))))
    status = request.args.get("status")
    assigned_to = request.args.get("assigned_to", type=int)

    try:
        result = LeadService.list_leads(
            user_id=user_id,
            page=page,
            limit=limit,
            status=status,
            assigned_to=assigned_to,
        )
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "message": "Server error"}), 500


@leads_bp.post("")
@member_or_admin_required
def create_lead():
    """
    POST /api/leads
    Body: { name*, email*, phone?, company?, source?, message? }
    Returns: { success, data: {lead} }
    Status: 201 | 400 | 401
    """
    user_id = int(get_jwt_identity()) if get_jwt_identity() else None
    data = request.get_json(silent=True) or {}

    if not data.get("name") or not data.get("email"):
        return jsonify({"success": False, "message": "name and email are required"}), 400

    try:
        lead = LeadService.create(data=data, created_by=user_id)
        return jsonify({"success": True, "data": lead}), 201
    except Exception as e:
        return jsonify({"success": False, "message": "Server error"}), 500


@leads_bp.get("/<int:lead_id>")
@member_or_admin_required
def get_lead(lead_id):
    """
    GET /api/leads/:id
    Returns: { success, data: {lead} }
    Status: 200 | 401 | 403 | 404
    """
    user_id = int(get_jwt_identity()) if get_jwt_identity() else None
    try:
        lead = LeadService.get_by_id(lead_id=lead_id, requesting_user_id=user_id)
        return jsonify({"success": True, "data": lead.to_dict()}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404
    except PermissionError as e:
        return jsonify({"success": False, "message": str(e)}), 403


@leads_bp.put("/<int:lead_id>")
@member_or_admin_required
def update_lead(lead_id):
    """
    PUT /api/leads/:id
    Body: any subset of lead fields (status, name, phone, etc.)
    Member cannot change assigned_to — only admin can via /assign
    Returns: { success, data: {lead} }
    Status: 200 | 400 | 401 | 403 | 404
    """
    user_id = int(get_jwt_identity()) if get_jwt_identity() else None
    data = request.get_json(silent=True) or {}

    # Strip fields a member should never change — belt and suspenders
    data.pop("assigned_to_id", None)
    data.pop("created_by_id", None)

    try:
        lead = LeadService.update(lead_id=lead_id, data=data, requesting_user_id=user_id)
        return jsonify({"success": True, "data": lead}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404
    except PermissionError as e:
        return jsonify({"success": False, "message": str(e)}), 403
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400


@leads_bp.delete("/<int:lead_id>")
@admin_required
def delete_lead(lead_id):
    """
    DELETE /api/leads/:id  — Admin only
    Returns: { success, message }
    Status: 200 | 401 | 403 | 404
    """
    try:
        LeadService.delete(lead_id=lead_id)
        return jsonify({"success": True, "message": "Lead deleted"}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404


@leads_bp.post("/<int:lead_id>/assign")
@admin_required
def assign_lead(lead_id):
    """
    POST /api/leads/:id/assign  — Admin only
    Body: { user_id }
    Returns: { success, data: {lead} }
    Status: 200 | 400 | 401 | 403 | 404
    """
    user_id = int(get_jwt_identity()) if get_jwt_identity() else None
    data = request.get_json(silent=True) or {}
    assignee_id = data.get("user_id")

    if not assignee_id:
        return jsonify({"success": False, "message": "user_id is required"}), 400

    try:
        lead = LeadService.assign(lead_id=lead_id, assignee_id=assignee_id, actor_id=user_id)
        return jsonify({"success": True, "data": lead}), 200
    except LookupError as e:
        return jsonify({"success": False, "message": str(e)}), 404


@leads_bp.get("/<int:lead_id>/activity")
@member_or_admin_required
def get_activity(lead_id):
    """
    GET /api/leads/:id/activity
    Returns: { success, data: [activity_logs] }
    Status: 200 | 401 | 404
    """
    logs = ActivityService.get_for_lead(lead_id=lead_id)
    return jsonify({"success": True, "data": logs}), 200
