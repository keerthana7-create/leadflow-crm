import os
from app import create_app, db
from app.models import User, Lead, Note, ActivityLog

app = create_app(os.environ.get("FLASK_ENV", "development"))

@app.shell_context_processor
def make_shell_context():
    """CLI helper: typing `flask shell` automatically imports models & db."""
    return {"db": db, "User": User, "Lead": Lead, "Note": Note, "ActivityLog": ActivityLog}

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5001))
    print(f"🚀 Flask Lead Management Server starting on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=app.config["DEBUG"])
