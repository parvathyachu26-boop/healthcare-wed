from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import AuditLog

router = APIRouter(prefix="/audit", tags=["Clinical Audit Trail"])

@router.get("/logs")
def get_audit_trail(
    patient_id: Optional[int] = None,
    action: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if patient_id:
        query = query.filter(AuditLog.patient_id == patient_id)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))

    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user_name,
            "user_role": log.user_role,
            "patient_id": log.patient_id,
            "patient_name": log.patient_name,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.strftime("%d %b %Y • %I:%M %p") if log.timestamp else ""
        }
        for log in logs
    ]
