import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal


def generate_reference(db: Session, prefix: str, model, field: str = "reference") -> str:
    last = db.query(model).order_by(getattr(model, field).desc()).first()
    if last:
        last_num = int(getattr(last, field).split("-")[1])
        return f"{prefix}-{str(last_num + 1).zfill(5)}"
    return f"{prefix}-00001"
