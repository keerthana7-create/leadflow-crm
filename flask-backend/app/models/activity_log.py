from datetime import datetime, timezone
from ..extensions import db


class ActivityLog(db.Model):
    """
    Auto-populated audit trail.
    Every status change, assignment, note addition, and lead creation
    generates an ActivityLog row. Never written by the route handlers
    directly — ActivityService.log() is called from LeadService methods.
    This ensures the log is always consistent regardless of how the
    business operation is triggered.
    """
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey("leads.id"), nullable=False, index=True)
    action = db.Column(db.String(500), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    extra_data = db.Column(db.JSON, default=dict)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "lead_id": self.lead_id,
            "action": self.action,
            "actor": self.actor.to_dict() if self.actor else None,
            "timestamp": self.timestamp.isoformat(),
            "extra_data": self.extra_data or {},
        }
