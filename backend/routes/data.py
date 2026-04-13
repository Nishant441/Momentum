from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any

from db import get_db
from models import User, UserData
from routes.auth import get_current_user

router = APIRouter(prefix="/data", tags=["data"])



class AssignmentsBody(BaseModel):
    assignments: list[Any]

class StreakBody(BaseModel):
    streak: dict[str, Any]



def _get_or_create_data(db: Session, user_id: str) -> UserData:
    data = db.query(UserData).filter(UserData.user_id == user_id).first()
    if not data:
        data = UserData(user_id=user_id, assignments=[], streak={})
        db.add(data)
        db.commit()
        db.refresh(data)
    return data



@router.get("/assignments")
def get_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _get_or_create_data(db, current_user.id)
    return {"assignments": data.assignments or []}


@router.put("/assignments")
def put_assignments(
    body: AssignmentsBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _get_or_create_data(db, current_user.id)
    data.assignments = body.assignments
    db.commit()
    return {"ok": True}



@router.get("/streak")
def get_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _get_or_create_data(db, current_user.id)
    return {"streak": data.streak or {}}


@router.put("/streak")
def put_streak(
    body: StreakBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _get_or_create_data(db, current_user.id)
    data.streak = body.streak
    db.commit()
    return {"ok": True}
