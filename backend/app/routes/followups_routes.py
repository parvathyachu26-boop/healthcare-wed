from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Followup, Patient

router = APIRouter(prefix="/followups", tags=["Follow-up Tracking"])

@router.get("")
def get_followups_list(db: Session = Depends(get_db)):
    followups = db.query(Followup).join(Patient).order_by(Followup.due_date.asc()).all()
    results = []
    for f in followups:
        results.append({
            "id": f.id,
            "patient_id": f.patient_id,
            "patient_name": f.patient.name,
            "patient_mrn": f.patient.mrn,
            "patient_contact": f.patient.contact,
            "due_date": f.due_date,
            "reason": f.reason,
            "status": f.status,
            "notes": f.notes
        })
    return results

@router.put("/{followup_id}/complete")
def complete_followup(followup_id: int, db: Session = Depends(get_db)):
    f = db.query(Followup).filter(Followup.id == followup_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Followup not found")
    f.status = "completed"
    db.commit()
    return {"message": "Follow-up marked as completed", "id": followup_id}
