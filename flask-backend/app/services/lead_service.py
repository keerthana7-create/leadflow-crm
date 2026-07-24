"""
services/lead_service.py — All lead business logic.

Routes are HTTP adapters; this is where the actual work happens.
Testable without Flask context (just needs db.session and models).
"""
from ..extensions import db
from ..models.lead import Lead, LEAD_STATUSES
from ..models.user import User
from ..models.note import Note
from .activity_service import ActivityService


class LeadService:

    @staticmethod
    def list_leads(user_id: int, page: int = 1, limit: int = 20,
                   status: str = None, assigned_to: int = None) -> dict:
        user = db.session.get(User, user_id)
        query = Lead.query

        # Members see ONLY their assigned leads — enforced in service, not UI
        if user.role == "member":
            query = query.filter(Lead.assigned_to_id == user_id)
        elif assigned_to:
            query = query.filter(Lead.assigned_to_id == assigned_to)

        if status:
            if status not in LEAD_STATUSES:
                raise ValueError(f"Invalid status '{status}'")
            query = query.filter(Lead.status == status)

        query = query.order_by(Lead.created_at.desc())
        paginated = query.paginate(page=page, per_page=limit, error_out=False)

        return {
            "data": [l.to_dict() for l in paginated.items],
            "pagination": {
                "total": paginated.total,
                "page": paginated.page,
                "limit": paginated.per_page,
                "pages": paginated.pages,
            },
        }

    @staticmethod
    def get_by_id(lead_id: int, requesting_user_id: int) -> Lead:
        lead = db.session.get(Lead, lead_id)
        if not lead:
            raise LookupError("Lead not found")

        user = db.session.get(User, requesting_user_id)
        if user.role == "member" and lead.assigned_to_id != requesting_user_id:
            raise PermissionError("Access denied to this lead")

        return lead

    @staticmethod
    def create(data: dict, created_by: int = None) -> dict:
        lead = Lead(
            name=data["name"],
            email=data["email"],
            phone=data.get("phone"),
            company=data.get("company"),
            source=data.get("source", "Website"),
            message=data.get("message"),
            created_by_id=created_by,
            status="New",
        )
        db.session.add(lead)
        db.session.flush()  # flush to get lead.id before activity log

        ActivityService.log(
            lead_id=lead.id,
            action="Lead created",
            actor_id=created_by,
            extra_data={"source": lead.source},
        )
        db.session.commit()
        return lead.to_dict()

    @staticmethod
    def update(lead_id: int, data: dict, requesting_user_id: int) -> dict:
        user = db.session.get(User, requesting_user_id)
        lead = db.session.get(Lead, lead_id)
        if not lead:
            raise LookupError("Lead not found")

        if user.role == "member" and lead.assigned_to_id != requesting_user_id:
            raise PermissionError("Access denied")

        changes = []
        allowed = ["name", "email", "phone", "company", "source", "message", "status"]

        for field in allowed:
            if field in data and data[field] != getattr(lead, field):
                old_val = getattr(lead, field)
                setattr(lead, field, data[field])
                changes.append(f"{field}: '{old_val}' → '{data[field]}'")

        if changes:
            ActivityService.log(
                lead_id=lead.id,
                action=f"Lead updated: {'; '.join(changes)}",
                actor_id=requesting_user_id,
            )

        db.session.commit()
        return lead.to_dict()

    @staticmethod
    def assign(lead_id: int, assignee_id: int, actor_id: int) -> dict:
        lead = db.session.get(Lead, lead_id)
        if not lead:
            raise LookupError("Lead not found")

        assignee = db.session.get(User, assignee_id)
        if not assignee:
            raise LookupError("Assignee user not found")

        old_assignee = lead.assignee.name if lead.assignee else "Unassigned"
        lead.assigned_to_id = assignee_id

        ActivityService.log(
            lead_id=lead.id,
            action=f"Lead assigned to {assignee.name} (was: {old_assignee})",
            actor_id=actor_id,
            extra_data={"assignee_id": assignee_id},
        )
        db.session.commit()
        return lead.to_dict()

    @staticmethod
    def delete(lead_id: int) -> None:
        lead = db.session.get(Lead, lead_id)
        if not lead:
            raise LookupError("Lead not found")
        db.session.delete(lead)
        db.session.commit()

    @staticmethod
    def add_note(lead_id: int, body: str, author_id: int) -> dict:
        lead = db.session.get(Lead, lead_id)
        if not lead:
            raise LookupError("Lead not found")

        user = db.session.get(User, author_id)
        note = Note(lead_id=lead_id, author_id=author_id, body=body)
        db.session.add(note)
        db.session.flush()

        ActivityService.log(
            lead_id=lead_id,
            action=f"Note added by {user.name}",
            actor_id=author_id,
        )
        db.session.commit()
        return note.to_dict()

    @staticmethod
    def get_notes(lead_id: int) -> list:
        notes = Note.query.filter_by(lead_id=lead_id).order_by(Note.created_at.desc()).all()
        return [n.to_dict() for n in notes]
