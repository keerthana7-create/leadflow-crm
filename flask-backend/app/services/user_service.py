from ..extensions import db
from ..models.user import User


class UserService:

    @staticmethod
    def list_users() -> list:
        users = User.query.order_by(User.created_at.desc()).all()
        return [u.to_dict() for u in users]

    @staticmethod
    def create(data: dict) -> dict:
        if User.query.filter_by(email=data["email"]).first():
            raise ValueError(f"Email '{data['email']}' is already registered")

        user = User(
            name=data["name"],
            email=data["email"],
            role=data.get("role", "member"),
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return user.to_dict()

    @staticmethod
    def update(user_id: int, data: dict) -> dict:
        user = db.session.get(User, user_id)
        if not user:
            raise LookupError("User not found")

        if "name" in data:
            user.name = data["name"]
        if "email" in data:
            user.email = data["email"]
        if "role" in data:
            user.role = data["role"]
        if "is_active" in data:
            user.is_active = data["is_active"]
        if "password" in data:
            user.set_password(data["password"])

        db.session.commit()
        return user.to_dict()

    @staticmethod
    def delete(user_id: int) -> None:
        user = db.session.get(User, user_id)
        if not user:
            raise LookupError("User not found")
        db.session.delete(user)
        db.session.commit()
