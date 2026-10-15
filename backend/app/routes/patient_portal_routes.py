"""
patient_portal_routes.py
Routes for authenticated patient users to manage their own clinical intake.
"""
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models import (
    User, Patient, Symptom, MedicalHistory,
    Medication, Allergy, Appointment, LabReport
)
from ..auth import get_current_user

router = APIRouter(prefix="/patient-portal", tags=["Patient Portal"])


def _require_patient_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Patient account required")
    return current_user


def _get_my_patient(db: Session, user: User) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return patient


# ── View My Full Record ──────────────────────────────────────────────────────
@router.get("/my-profile")
def get_my_profile(
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    latest_symptom = p.symptoms[-1] if p.symptoms else None
    history = p.medical_history

    return {
        "id": p.id,
        "mrn": p.mrn,
        "name": p.name,
        "age": p.age,
        "sex": p.sex,
        "date_of_birth": p.date_of_birth,
        "blood_group": p.blood_group,
        "contact": p.contact,
        "email": p.email,
        "address": p.address,
        "emergency_contact": p.emergency_contact,
        "intake_status": p.intake_status,
        "registered_at": p.registered_at.isoformat() if p.registered_at else None,
        "current_symptoms": {
            "main_symptom": latest_symptom.main_symptom,
            "duration": latest_symptom.duration,
            "severity": latest_symptom.severity,
            "associated_symptoms": latest_symptom.associated_symptoms,
            "onset": latest_symptom.onset,
            "observations": latest_symptom.observations,
        } if latest_symptom else None,
        "medical_history": {
            "previous_diseases": history.previous_diseases,
            "previous_surgeries": history.previous_surgeries,
            "chronic_conditions": history.chronic_conditions,
            "family_history": history.family_history,
            "previous_relevant_episodes": history.previous_relevant_episodes,
        } if history else None,
        "medications": [
            {"id": m.id, "name": m.name, "dose": m.dose, "frequency": m.frequency, "duration": m.duration}
            for m in p.medications if m.is_current
        ],
        "allergies": [
            {"id": a.id, "allergen": a.allergen, "reaction": a.reaction, "severity": a.severity}
            for a in p.allergies
        ],
        "appointments": [
            {
                "id": ap.id,
                "date": ap.appointment_date,
                "time": ap.appointment_time,
                "complaint": ap.complaint,
                "status": ap.status,
                "priority": ap.priority,
                "doctor_name": ap.doctor.full_name if ap.doctor else None,
                "doctor_specialty": ap.doctor.specialty if ap.doctor else None,
            }
            for ap in p.appointments
        ],
        "doctors": [
            {"id": doctor.id, "name": doctor.full_name, "specialty": doctor.specialty}
            for doctor in {appointment.doctor for appointment in p.appointments if appointment.doctor}
        ],
    }


# ── Submit / Update Symptoms ─────────────────────────────────────────────────
class SymptomPayload(BaseModel):
    main_symptom: str
    duration: str
    severity: str = "Moderate"
    associated_symptoms: Optional[str] = None
    onset: Optional[str] = "Gradual"
    observations: Optional[str] = None


@router.post("/submit-symptoms")
def submit_symptoms(
    payload: SymptomPayload,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    symptom = Symptom(
        patient_id=p.id,
        main_symptom=payload.main_symptom,
        duration=payload.duration,
        severity=payload.severity,
        associated_symptoms=payload.associated_symptoms,
        onset=payload.onset or "Gradual",
        observations=payload.observations,
    )
    db.add(symptom)
    # Mark patient as ready for doctor review
    p.intake_status = "submitted"
    db.commit()
    return {"message": "Symptoms submitted successfully", "intake_status": p.intake_status}


# ── Update Medical History ───────────────────────────────────────────────────
class MedicalHistoryPayload(BaseModel):
    previous_diseases: Optional[str] = "None"
    previous_surgeries: Optional[str] = "None"
    chronic_conditions: Optional[str] = "None"
    family_history: Optional[str] = "No known significant family history"
    previous_relevant_episodes: Optional[str] = "None"


@router.post("/update-history")
def update_medical_history(
    payload: MedicalHistoryPayload,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    history = p.medical_history
    if history:
        history.previous_diseases = payload.previous_diseases or "None"
        history.previous_surgeries = payload.previous_surgeries or "None"
        history.chronic_conditions = payload.chronic_conditions or "None"
        history.family_history = payload.family_history or "No known significant family history"
        history.previous_relevant_episodes = payload.previous_relevant_episodes or "None"
    else:
        history = MedicalHistory(
            patient_id=p.id,
            previous_diseases=payload.previous_diseases or "None",
            previous_surgeries=payload.previous_surgeries or "None",
            chronic_conditions=payload.chronic_conditions or "None",
            family_history=payload.family_history or "No known significant family history",
            previous_relevant_episodes=payload.previous_relevant_episodes or "None",
        )
        db.add(history)
    db.commit()
    return {"message": "Medical history updated"}


# ── Add Medication ───────────────────────────────────────────────────────────
class MedicationPayload(BaseModel):
    name: str
    dose: str
    frequency: str
    duration: Optional[str] = "Ongoing"


@router.post("/add-medication")
def add_medication(
    payload: MedicationPayload,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    med = Medication(
        patient_id=p.id,
        name=payload.name,
        dose=payload.dose,
        frequency=payload.frequency,
        duration=payload.duration or "Ongoing",
        is_current=True,
        started_at=datetime.date.today().isoformat(),
    )
    db.add(med)
    db.commit()
    return {"message": "Medication added", "medication_id": med.id}


@router.delete("/remove-medication/{med_id}")
def remove_medication(
    med_id: int,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == p.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    med.is_current = False
    db.commit()
    return {"message": "Medication removed"}


# ── Add Allergy ──────────────────────────────────────────────────────────────
class AllergyPayload(BaseModel):
    allergen: str
    reaction: str
    severity: Optional[str] = "Moderate"


@router.post("/add-allergy")
def add_allergy(
    payload: AllergyPayload,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    allergy = Allergy(
        patient_id=p.id,
        allergen=payload.allergen,
        reaction=payload.reaction,
        severity=payload.severity or "Moderate",
    )
    db.add(allergy)
    db.commit()
    return {"message": "Allergy recorded", "allergy_id": allergy.id}


@router.delete("/remove-allergy/{allergy_id}")
def remove_allergy(
    allergy_id: int,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    allergy = db.query(Allergy).filter(Allergy.id == allergy_id, Allergy.patient_id == p.id).first()
    if not allergy:
        raise HTTPException(status_code=404, detail="Allergy not found")
    db.delete(allergy)
    db.commit()
    return {"message": "Allergy removed"}


# ── Book Appointment ─────────────────────────────────────────────────────────
class AppointmentPayload(BaseModel):
    appointment_date: str
    appointment_time: str
    complaint: str


@router.post("/book-appointment")
def book_appointment(
    payload: AppointmentPayload,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    appt = Appointment(
        patient_id=p.id,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        complaint=payload.complaint,
        status="waiting",
        priority="Routine",
    )
    db.add(appt)
    p.intake_status = "in_queue"
    db.commit()
    return {"message": "Appointment booked", "appointment_id": appt.id}


# ── Update Personal Info ─────────────────────────────────────────────────────
class PersonalInfoPayload(BaseModel):
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    contact: Optional[str] = None
    blood_group: Optional[str] = None


@router.put("/update-personal-info")
def update_personal_info(
    payload: PersonalInfoPayload,
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    if payload.address is not None:
        p.address = payload.address
    if payload.emergency_contact is not None:
        p.emergency_contact = payload.emergency_contact
    if payload.contact is not None:
        p.contact = payload.contact
    if payload.blood_group is not None:
        p.blood_group = payload.blood_group
    db.commit()
    return {"message": "Personal information updated"}


# ── View Doctor's Approved Plan ──────────────────────────────────────────────
@router.get("/my-consultations")
def get_my_consultations(
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    p = _get_my_patient(db, current_user)
    results = []
    for c in sorted(p.consultations, key=lambda x: x.created_at, reverse=True):
        review = c.doctor_review
        results.append({
            "id": c.id,
            "visit_date": c.visit_date,
            "chief_complaint": c.chief_complaint,
            "diagnosis": c.diagnosis,
            "treatment_plan": c.treatment_plan,
            "doctor_review_status": review.status if review else "Awaiting Review",
            "doctor_advice": review.doctor_clinical_advice if review else None,
            "approved_by": review.doctor_signature_name if review else None,
        })
    return results


@router.get("/my-reports")
def get_my_reports(
    current_user: User = Depends(_require_patient_user),
    db: Session = Depends(get_db),
):
    patient = _get_my_patient(db, current_user)
    reports = db.query(LabReport).filter(LabReport.patient_id == patient.id).order_by(LabReport.uploaded_at.desc()).all()
    return [
        {
            "id": report.id,
            "title": report.title,
            "report_type": report.report_type,
            "file_name": report.file_name,
            "uploaded_at": report.uploaded_at.isoformat() if report.uploaded_at else None,
            "summary_findings": report.summary_findings,
            "results": [
                {"test_name": result.test_name, "value": result.value, "unit": result.unit, "reference_range": result.reference_range, "flag": result.flag}
                for result in report.results
            ],
        }
        for report in reports
    ]
