"""
seed.py — Database seeding script for development & demo deployment.

Populates initial Admin and Member accounts, along with sample leads,
notes, and activity logs.

Usage:
  python seed.py
"""
import os
from app import create_app, db
from app.models.user import User
from app.models.lead import Lead
from app.models.note import Note
from app.models.activity_log import ActivityLog
from app.services.activity_service import ActivityService

app = create_app(os.environ.get("FLASK_ENV", "development"))

def seed():
    with app.app_context():
        print("🌱 Resetting and seeding database...")
        db.drop_all()
        db.create_all()

        # Admin user
        admin = User(name="Admin User", email="admin@leadflow.com", role="admin")
        admin.set_password("password123")
        db.session.add(admin)

        # Member users (Sales Reps)
        member1 = User(name="John SalesRep", email="john@leadflow.com", role="member")
        member1.set_password("password123")
        db.session.add(member1)

        member2 = User(name="Sarah Closer", email="sarah@leadflow.com", role="member")
        member2.set_password("password123")
        db.session.add(member2)

        db.session.commit()
        print("✅ Created default users: admin@leadflow.com, john@leadflow.com, sarah@leadflow.com (password: password123)")

        # Sample Leads
        lead1 = Lead(
            name="Acme Corp Lead",
            email="procurement@acmecorp.com",
            phone="+1 (555) 019-2831",
            company="Acme Corp",
            source="Website",
            message="Looking for enterprise CRM solution for 50 sales reps.",
            status="Proposal Sent",
            assigned_to_id=member1.id,
            created_by_id=admin.id,
        )
        lead2 = Lead(
            name="Starlight Tech Inbound",
            email="cto@starlight.io",
            phone="+1 (555) 982-1122",
            company="Starlight Tech",
            source="Website",
            message="Interested in custom RBAC and API integration features.",
            status="Qualified",
            assigned_to_id=member2.id,
            created_by_id=admin.id,
        )
        lead3 = Lead(
            name="Globex Prospect",
            email="info@globex.com",
            phone="+1 (555) 443-8821",
            company="Globex Corp",
            source="Website",
            message="Requesting product demo.",
            status="New",
            assigned_to_id=None,
            created_by_id=None,
        )

        db.session.add_all([lead1, lead2, lead3])
        db.session.commit()

        # Add notes & activity logs
        note1 = Note(lead_id=lead1.id, author_id=member1.id, body="Sent customized proposal PDF via email. Awaiting response.")
        db.session.add(note1)

        ActivityService.log(lead1.id, 'Status updated to "Proposal Sent"', actor_id=member1.id)
        ActivityService.log(lead1.id, f"Lead assigned to {member1.name}", actor_id=admin.id)
        ActivityService.log(lead2.id, 'Status updated to "Qualified"', actor_id=member2.id)

        db.session.commit()
        print("🚀 Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
