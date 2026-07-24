from datetime import datetime, timezone
from ..extensions import db

LEAD_STATUSES = ("New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost")


class Lead(db.Model):
    __tablename__ = "leads"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(254), nullable=False)
    phone = db.Column(db.String(30))
    company = db.Column(db.String(100))
    source = db.Column(db.String(80), default="Website")
    message = db.Column(db.Text)
    status = db.Column(
        db.Enum(*LEAD_STATUSES, name="lead_status_enum"),
        nullable=False,
        default="New",
        index=True,
    )

    # FK to User — nullable so public captures don't require auth
    assigned_to_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    notes = db.relationship("Note", backref="lead", lazy="dynamic", cascade="all, delete-orphan")
    activities = db.relationship("ActivityLog", backref="lead", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_relations: bool = False) -> dict:
        d = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "source": self.source,
            "message": self.message,
            "status": self.status,
            "assigned_to": self.assignee.to_dict() if self.assignee else None,
            "created_by": self.creator.to_dict() if self.creator else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        return d
