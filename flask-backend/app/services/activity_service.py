"""
services/activity_service.py — Central audit trail writer.

Every mutation (create, update, assign, note) calls ActivityService.log().
The service is never bypassed by route handlers — no route touches
ActivityLog directly. This single responsibility means:
  - The audit trail is always consistent
  - It's unit-testable without HTTP
  - Future integrations (webhooks, Slack) are added here, not in routes
"""
from ..extensions import db
from ..models.activity_log import ActivityLog


class ActivityService:

    @staticmethod
    def log(lead_id: int, action: str, actor_id: int = None, extra_data: dict = None):
        """
        Write one audit record. Non-fatal: if logging fails the main
        operation still succeeds (logged to stderr, not re-raised).
        """
        try:
            entry = ActivityLog(
                lead_id=lead_id,
                action=action,
                actor_id=actor_id,
                extra_data=extra_data or {},
            )
            db.session.add(entry)
            # Intentionally no db.session.commit() here —
            # the calling service commits everything atomically.
        except Exception as e:
            import sys
            print(f"[ActivityService] Failed to log: {e}", file=sys.stderr)

    @staticmethod
    def get_for_lead(lead_id: int) -> list:
        logs = (
            ActivityLog.query
            .filter_by(lead_id=lead_id)
            .order_by(ActivityLog.timestamp.desc())
            .all()
        )
        return [log.to_dict() for log in logs]
