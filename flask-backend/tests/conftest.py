import pytest
from app import create_app, db
from app.models.user import User
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    """Create application instance configured for testing with in-memory SQLite."""
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client for issuing HTTP requests."""
    return app.test_client()


@pytest.fixture
def admin_user(app):
    """Fixture providing an Admin user."""
    admin = User(name="Admin Test", email="admin@test.com", role="admin")
    admin.set_password("adminpass")
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture
def member_user(app):
    """Fixture providing a Member user."""
    member = User(name="Member Test", email="member@test.com", role="member")
    member.set_password("memberpass")
    db.session.add(member)
    db.session.commit()
    return member


@pytest.fixture
def other_member_user(app):
    """Fixture providing a second Member user."""
    member = User(name="Other Member", email="other@test.com", role="member")
    member.set_password("otherpass")
    db.session.add(member)
    db.session.commit()
    return member


@pytest.fixture
def admin_headers(admin_user):
    """HTTP headers with valid Admin JWT token."""
    token = create_access_token(identity=str(admin_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def member_headers(member_user):
    """HTTP headers with valid Member JWT token."""
    token = create_access_token(identity=str(member_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_member_headers(other_member_user):
    """HTTP headers with second Member JWT token."""
    token = create_access_token(identity=str(other_member_user.id))
    return {"Authorization": f"Bearer {token}"}
