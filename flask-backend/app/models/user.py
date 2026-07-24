from datetime import datetime, timezone
from ..extensions import db, bcrypt


class User(db.Model):
    """
    Why store password_hash and never the plaintext?
    bcrypt is intentionally slow — its cost factor makes brute-force
    computationally prohibitive even if the hash DB is stolen.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(254), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("admin", "member"), nullable=False, default="member")
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    assigned_leads = db.relationship("Lead", foreign_keys="Lead.assigned_to_id", backref="assignee", lazy="dynamic")
    created_leads = db.relationship("Lead", foreign_keys="Lead.created_by_id", backref="creator", lazy="dynamic")
    notes = db.relationship("Note", backref="author", lazy="dynamic")
    activities = db.relationship("ActivityLog", backref="actor", lazy="dynamic")

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }
