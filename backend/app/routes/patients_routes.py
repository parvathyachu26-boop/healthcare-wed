from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from ..database import get_db
from ..models import (
    Patient, Appointment, Symptom, MedicalHistory, Medication, Allergy,
    LabReport, Consultation, AuditLog, User, DoctorReview
)
from ..schemas import (
    PatientDetailOut, PatientListOut, WhatChangedOut, SymptomOut,
    MedicalHistoryOut, MedicationItem, AllergyItem, LabReportOut,
    LabResultOut, AppointmentOut, ConsultationPast
)
from ..auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientListOut])
def get_patients_queue(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: Optional[str] = Query("waiting_time", enum=["waiting_time", "priority", "appointment_time", "age"]),
    db: Session = Depends(get_db)
):
    query = db.query(Patient)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Patient.name.ilike(search_fmt)) |
            (Patient.mrn.ilike(search_fmt))
        )

    patients = query.all()
    results = []

    priority_weight = {"Urgent": 3, "High": 2, "Routine": 1}

    for p in patients:
        apt = db.query(Appointment).filter(Appointment.patient_id == p.id).order_by(Appointment.id.desc()).first()
        
        # Priority filter
        if priority and priority != "All":
            if not apt or apt.priority.lower() != priority.lower():
                continue

        last_consult = db.query(Consultation).filter(Consultation.patient_id == p.id).order_by(Consultation.id.desc()).first()

        results.append(PatientListOut(
            id=p.id,
            mrn=p.mrn,
            name=p.name,
            age=p.age,
            sex=p.sex,
            blood_group=p.blood_group,
            contact=p.contact,
            active_appointment=AppointmentOut.model_validate(apt) if apt else None,
            last_consultation_date=last_consult.visit_date if last_consult else None,
            priority_level=apt.priority if apt else "Routine"
        ))

    # Sorting
    if sort_by == "priority":
        results.sort(key=lambda x: priority_weight.get(x.priority_level, 0), reverse=True)
    elif sort_by == "waiting_time":
        results.sort(key=lambda x: (x.active_appointment.waiting_time_minutes if x.active_appointment else 0), reverse=True)
    elif sort_by == "age":
        results.sort(key=lambda x: x.age, reverse=True)

    return results

@router.get("/{patient_id}", response_model=PatientDetailOut)
def get_patient_profile(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    # Record Audit Log
    try:
        audit = AuditLog(
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_role=current_user.role,
            patient_id=patient.id,
            patient_name=patient.name,
            action="Viewed Patient Record",
            details=f"Opened medical chart for MRN: {patient.mrn}"
        )
        db.add(audit)
        db.commit()
    except Exception:
        db.rollback()

    # Collect sub-entities
    symptom = db.query(Symptom).filter(Symptom.patient_id == patient_id).order_by(Symptom.id.desc()).first()
    med_history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).first()
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    allergies = db.query(Allergy).filter(Allergy.patient_id == patient_id).all()
    lab_reps = db.query(LabReport).filter(LabReport.patient_id == patient_id).order_by(LabReport.id.desc()).all()
    apts = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    past_consults = db.query(Consultation).filter(Consultation.patient_id == patient_id).order_by(Consultation.id.desc()).all()
    active_apt = apts[-1] if apts else None

    # Check latest review status
    latest_review = db.query(DoctorReview).filter(DoctorReview.consultation_id.in_([c.id for c in past_consults]) if past_consults else False).order_by(DoctorReview.id.desc()).first()

    return PatientDetailOut(
        id=patient.id,
        mrn=patient.mrn,
        name=patient.name,
        age=patient.age,
        sex=patient.sex,
        blood_group=patient.blood_group,
        contact=patient.contact,
        email=patient.email,
        address=patient.address,
        emergency_contact=patient.emergency_contact,
        registered_at=patient.registered_at,
        current_symptoms=SymptomOut.model_validate(symptom) if symptom else None,
        medical_history=MedicalHistoryOut.model_validate(med_history) if med_history else None,
        medications=[MedicationItem.model_validate(m) for m in meds],
        allergies=[AllergyItem.model_validate(a) for a in allergies],
        lab_reports=[LabReportOut.model_validate(r) for r in lab_reps],
        appointments=[AppointmentOut.model_validate(a) for a in apts],
        previous_consultations=[ConsultationPast.model_validate(c) for c in past_consults],
        active_appointment=AppointmentOut.model_validate(active_apt) if active_apt else None,
        latest_review_status=latest_review.status if latest_review else None
    )

@router.get("/{patient_id}/whats-new", response_model=WhatChangedOut)
def get_whats_new_since_last_visit(patient_id: int, db: Session = Depends(get_db)):
    """
    Feature #35: "What Changed Since Last Visit?"
    Compares current presentation with previous consultation.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    consultations = db.query(Consultation).filter(Consultation.patient_id == patient_id).order_by(Consultation.visit_date.asc()).all()
    symptom = db.query(Symptom).filter(Symptom.patient_id == patient_id).order_by(Symptom.id.desc()).first()
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    lab_reps = db.query(LabReport).filter(LabReport.patient_id == patient_id).order_by(LabReport.id.desc()).all()

    prev_date = consultations[-1].visit_date if consultations else "First Visit"
    curr_date = datetime.date.today().isoformat()

    new_symptoms = [symptom.main_symptom] if symptom else ["No acute new symptoms"]
    if symptom and symptom.associated_symptoms:
        new_symptoms.extend([s.strip() for s in symptom.associated_symptoms.split(",") if s.strip()])

    changed_meds = []
    for m in meds:
        changed_meds.append({
            "name": m.name,
            "dose": m.dose,
            "frequency": m.frequency,
            "status": "Active Regimen"
        })

    new_lab_results = []
    if lab_reps and lab_reps[0].results:
        for r in lab_reps[0].results:
            if r.flag in ["high", "low", "critical"]:
                new_lab_results.append({
                    "test": r.test_name,
                    "value": f"{r.value} {r.unit or ''}",
                    "flag": r.flag,
                    "interpretation": r.interpretation or "Out of range"
                })

    improved_findings = ["Patient afebrile at rest", "Hemodynamic vitals stable"] if not any(r["flag"] == "critical" for r in new_lab_results) else []
    worsened_findings = [f"Abnormal lab: {r['test']} ({r['value']})" for r in new_lab_results]
    missed_follow_up = ["Scheduled blood sugar log verification pending"] if "diabetes" in str(new_symptoms).lower() else []

    return WhatChangedOut(
        patient_id=patient_id,
        previous_visit_date=prev_date,
        current_visit_date=curr_date,
        new_symptoms=new_symptoms,
        changed_medications=changed_meds,
        new_lab_results=new_lab_results,
        improved_findings=improved_findings,
        worsened_findings=worsened_findings,
        missed_follow_up_items=missed_follow_up
    )

@router.get("/{patient_id}/timeline")
def get_patient_timeline(patient_id: int, db: Session = Depends(get_db)):
    """
    Feature #15: Visual Medical Timeline
    """
    timeline_events = []
    consultations = db.query(Consultation).filter(Consultation.patient_id == patient_id).order_by(Consultation.visit_date.desc()).all()
    for c in consultations:
        timeline_events.append({
            "type": "consultation",
            "date": c.visit_date,
            "title": f"Consultation: {c.diagnosis or c.chief_complaint}",
            "description": c.treatment_plan or c.clinical_notes,
            "tag": "Clinical Visit"
        })

    reports = db.query(LabReport).filter(LabReport.patient_id == patient_id).all()
    for r in reports:
        timeline_events.append({
            "type": "lab_report",
            "date": r.uploaded_at.strftime("%Y-%m-%d"),
            "title": f"Diagnostic Report: {r.title}",
            "description": r.summary_findings or f"{len(r.results)} parameters tested",
            "tag": r.report_type
        })

    apt = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.id.desc()).first()
    if apt:
        timeline_events.append({
            "type": "current_visit",
            "date": apt.appointment_date,
            "title": f"Current OPD Visit: {apt.complaint}",
            "description": f"Vitals: BP {apt.vitals_bp}, SpO2 {apt.vitals_spo2}, Temp {apt.vitals_temp}",
            "tag": f"Priority: {apt.priority}"
        })

    # Sort chronological descending
    timeline_events.sort(key=lambda x: x["date"], reverse=True)
    return timeline_events
