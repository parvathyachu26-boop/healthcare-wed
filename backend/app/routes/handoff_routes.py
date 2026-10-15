from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime

from ..database import get_db
from ..models import Patient, Symptom, MedicalHistory, Medication, Appointment, LabReport, AIAssessment, Consultation, User
from ..schemas import DoctorHandoffOut
from ..auth import get_current_user

router = APIRouter(prefix="/handoff", tags=["Doctor Clinical Handoff"])

@router.get("/{patient_id}", response_model=DoctorHandoffOut)
def generate_doctor_handoff_summary(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    symptom = db.query(Symptom).filter(Symptom.patient_id == patient_id).order_by(Symptom.id.desc()).first()
    history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).first()
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    apt = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.id.desc()).first()
    reports = db.query(LabReport).filter(LabReport.patient_id == patient_id).order_by(LabReport.id.desc()).all()
    latest_ai = db.query(AIAssessment).filter(AIAssessment.patient_id == patient_id).order_by(AIAssessment.id.desc()).first()
    consultation = db.query(Consultation).filter(Consultation.patient_id == patient_id).order_by(Consultation.id.desc()).first()

    now_str = datetime.datetime.now().strftime("%d %b %Y • %I:%M %p")

    vitals_str = (
        f"BP: {apt.vitals_bp if apt else '120/80'}, HR: {apt.vitals_hr if apt else '72 bpm'}, "
        f"Temp: {apt.vitals_temp if apt else '98.6°F'}, SpO2: {apt.vitals_spo2 if apt else '98%'}"
    )

    med_list = [f"{m.name} ({m.dose}, {m.frequency})" for m in meds] if meds else ["No active chronic medications"]
    
    investigations_list = []
    if reports:
        for r in reports[:2]:
            investigations_list.append(f"{r.title} ({r.uploaded_at.strftime('%b %d')}): {r.summary_findings or 'Processed'}")
    if not investigations_list:
        investigations_list = ["No recent lab documents uploaded today"]

    ai_sum = (
        latest_ai.clinical_summary if latest_ai 
        else f"Patient presented with {symptom.main_symptom if symptom else 'acute complaint'}. Preliminary differential consideration under physician evaluation."
    )

    action_items = [
        "Review primary vitals and verify auscultation/physical signs",
        "Confirm response to initial symptomatic therapy",
        "Finalize outpatient vs observation disposition",
        "Sign off pending prescription orders"
    ]

    return DoctorHandoffOut(
        patient_name=patient.name,
        patient_mrn=patient.mrn,
        age_sex=f"{patient.age} / {patient.sex}",
        handoff_timestamp=now_str,
        generated_by=current_user.full_name,
        current_concern=symptom.main_symptom if symptom else (apt.complaint if apt else "Consultation review"),
        vital_signs_summary=vitals_str,
        relevant_history=history.chronic_conditions if history else "Unremarkable",
        current_medications=med_list,
        recent_investigations=investigations_list,
        ai_assessment_summary=ai_sum,
        attending_physician_notes=consultation.clinical_notes if consultation and consultation.clinical_notes else "Patient evaluated in OPD. Vital signs stable. Handed over for continued continuity of care.",
        key_action_items=action_items
    )
