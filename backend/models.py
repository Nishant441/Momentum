import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from db import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=_now)


class UserData(Base):
    """One row per user — stores assignments + streak as JSON blobs."""
    __tablename__ = "user_data"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    assignments = Column(JSON, default=list, nullable=False)
    streak = Column(JSON, default=dict, nullable=False)
    updated_at = Column(DateTime, default=_now, onupdate=_now)
