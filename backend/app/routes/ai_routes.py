from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
from typing import Dict, Any

from ..database import get_db
from ..models import (
    Patient, Appointment, Symptom, MedicalHistory, Medication, Allergy,
    LabReport, Consultation, AIAssessment, DoctorReview, Prescription,
    AuditLog, User, Doctor
)
from ..schemas import (
    AIAssessmentOut, DoctorReviewSubmit, DoctorReviewOut,
    AIChatRequest, AIChatResponse, NoteSummarizeRequest, NoteSummarizeResponse
)
from ..services.clinical_reasoning import clinical_reasoning
from ..auth import get_current_user, require_doctor

router = APIRouter(prefix="/ai", tags=["AI Clinical Assistant"])

@router.get("/assess/{patient_id}", response_model=AIAssessmentOut)
async def generate_patient_ai_assessment(
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
    allergies = db.query(Allergy).filter(Allergy.patient_id == patient_id).all()
    apt = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.id.desc()).first()
    reports = db.query(LabReport).filter(LabReport.patient_id == patient_id).order_by(LabReport.id.desc()).all()

    # Collect lab results
    lab_results_list = []
    for r in reports:
        for res in r.results:
            lab_results_list.append({
                "test_name": res.test_name,
                "value": res.value,
                "unit": res.unit,
                "flag": res.flag
            })

    patient_payload = {
        "name": patient.name,
        "age": patient.age,
        "sex": patient.sex,
        "main_symptom": symptom.main_symptom if symptom else "General checkup",
        "duration": symptom.duration if symptom else "N/A",
        "severity": symptom.severity if symptom else "Moderate",
        "associated_symptoms": symptom.associated_symptoms if symptom else "",
        "chronic_conditions": history.chronic_conditions if history else "None",
        "medications": [{"name": m.name} for m in meds],
        "allergies": [{"allergen": a.allergen} for a in allergies],
        "vitals": {
            "bp": apt.vitals_bp if apt else "120/80",
            "spo2": apt.vitals_spo2 if apt else "98%",
            "temp": apt.vitals_temp if apt else "98.6°F",
            "hr": apt.vitals_hr if apt else "72 bpm"
        },
        "lab_results": lab_results_list
    }

    # Generate assessment
    assessment_dict = await clinical_reasoning.generate_clinical_assessment(patient_payload)

    # Save to database
    ai_record = AIAssessment(
        patient_id=patient.id,
        clinical_summary=assessment_dict["clinical_summary"],
        possible_conditions=assessment_dict["possible_conditions"],
        red_flags=assessment_dict["red_flags"],
        recommended_investigations=assessment_dict["recommended_investigations"],
        management_suggestions=assessment_dict["management_suggestions"],
        reasoning_evidence=assessment_dict["reasoning_evidence"],
        suggested_risk_score=assessment_dict["suggested_risk_score"],
        is_emergency=assessment_dict["is_emergency"],
        guidelines_referenced=assessment_dict["guidelines_referenced"]
    )
    db.add(ai_record)
    db.commit()
    db.refresh(ai_record)

    # Record Audit Log
    try:
        audit = AuditLog(
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_role=current_user.role,
            patient_id=patient.id,
            patient_name=patient.name,
            action="Generated AI Assessment",
            details=f"Clinical AI Assistant generated 6-section preliminary plan for {patient.name}"
        )
        db.add(audit)
        db.commit()
    except Exception:
        db.rollback()

    return AIAssessmentOut(
        id=ai_record.id,
        patient_id=patient.id,
        clinical_summary=ai_record.clinical_summary,
        possible_conditions=ai_record.possible_conditions,
        red_flags=ai_record.red_flags,
        recommended_investigations=ai_record.recommended_investigations,
        management_suggestions=ai_record.management_suggestions,
        reasoning_evidence=ai_record.reasoning_evidence,
        suggested_risk_score=ai_record.suggested_risk_score,
        is_emergency=ai_record.is_emergency,
        guidelines_referenced=ai_record.guidelines_referenced,
        created_at=ai_record.created_at
    )

@router.get("/30s-summary/{patient_id}")
def get_30_second_summary(patient_id: int, db: Session = Depends(get_db)):
    """
    Feature #13: "Generate 30-Second Patient Summary"
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    symptom = db.query(Symptom).filter(Symptom.patient_id == patient_id).order_by(Symptom.id.desc()).first()
    history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).first()
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    allergies = db.query(Allergy).filter(Allergy.patient_id == patient_id).all()

    payload = {
        "name": patient.name,
        "age": patient.age,
        "sex": patient.sex,
        "main_symptom": symptom.main_symptom if symptom else "General review",
        "duration": symptom.duration if symptom else "N/A",
        "chronic_conditions": history.chronic_conditions if history else "None",
        "medications": [{"name": m.name} for m in meds],
        "allergies": [{"allergen": a.allergen} for a in allergies]
    }
    summary_text = clinical_reasoning.generate_30_second_summary(payload)
    return {"patient_id": patient_id, "patient_name": patient.name, "summary": summary_text}

@router.post("/chat", response_model=AIChatResponse)
def clinical_ai_chat(request: AIChatRequest, db: Session = Depends(get_db)):
    """
    Feature #12: Patient-grounded conversational assistant
    """
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    symptom = db.query(Symptom).filter(Symptom.patient_id == request.patient_id).order_by(Symptom.id.desc()).first()
    history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == request.patient_id).first()
    meds = db.query(Medication).filter(Medication.patient_id == request.patient_id).all()
    apt = db.query(Appointment).filter(Appointment.patient_id == request.patient_id).order_by(Appointment.id.desc()).first()

    payload = {
        "name": patient.name,
        "age": patient.age,
        "sex": patient.sex,
        "main_symptom": symptom.main_symptom if symptom else "General visit",
        "duration": symptom.duration if symptom else "N/A",
        "chronic_conditions": history.chronic_conditions if history else "None",
        "medications": [{"name": m.name} for m in meds],
        "allergies": [],
        "vitals": {
            "bp": apt.vitals_bp if apt else "120/80",
            "spo2": apt.vitals_spo2 if apt else "98%",
            "temp": apt.vitals_temp if apt else "98.6°F"
        }
    }
    res = clinical_reasoning.chat_response(payload, request.message)
    return AIChatResponse(reply=res["reply"], evidence_citations=res["evidence_citations"])

@router.post("/summarize-notes", response_model=NoteSummarizeResponse)
def summarize_clinical_notes(req: NoteSummarizeRequest, db: Session = Depends(get_db)):
    """
    Feature #16: AI-assisted note summarization
    """
    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    symptom = db.query(Symptom).filter(Symptom.patient_id == req.patient_id).first() if patient else None
    payload = {"main_symptom": symptom.main_symptom if symptom else "General presentation"}
    res = clinical_reasoning.summarize_clinical_notes(req.raw_notes, payload)
    return NoteSummarizeResponse(
        structured_summary=res["structured_summary"],
        extracted_symptoms=res["extracted_symptoms"],
        suggested_actions=res["suggested_actions"]
    )

@router.post("/approve-plan", response_model=DoctorReviewOut)
def doctor_approve_plan(
    submission: DoctorReviewSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """
    Feature #10: DOCTOR APPROVAL SYSTEM
    Doctor verifies, modifies, or rejects the AI preliminary plan.
    Enforces that AI recommendations require physician authorization.
    """
    patient = db.query(Patient).filter(Patient.id == submission.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    doctor_id = doctor.id if doctor else 1

    # Find or create consultation record
    consultation = None
    if submission.consultation_id:
        consultation = db.query(Consultation).filter(Consultation.id == submission.consultation_id).first()
    
    if not consultation:
        apt = db.query(Appointment).filter(Appointment.patient_id == submission.patient_id).order_by(Appointment.id.desc()).first()
        consultation = Consultation(
            patient_id=patient.id,
            doctor_id=doctor_id,
            visit_date=datetime.date.today().isoformat(),
            chief_complaint=apt.complaint if apt else "Consultation",
            diagnosis=submission.final_doctor_diagnosis,
            clinical_notes=submission.doctor_notes or "",
            treatment_plan=submission.doctor_clinical_advice,
            status="in_progress" if submission.status == "Rejected" else "completed"
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)

        # Mark appointment as reviewed
        if apt and submission.status != "Rejected":
            apt.status = "reviewed"
            db.commit()

    # Find latest AI assessment
    latest_ai = db.query(AIAssessment).filter(AIAssessment.patient_id == patient.id).order_by(AIAssessment.id.desc()).first()
    original_ai_diag = (latest_ai.possible_conditions[0]["condition"]) if (latest_ai and latest_ai.possible_conditions) else "Differential Consideration"

    now = datetime.datetime.now()
    review = DoctorReview(
        ai_assessment_id=latest_ai.id if latest_ai else None,
        consultation_id=consultation.id,
        doctor_id=doctor_id,
        status="Doctor Verified" if submission.status in ["Doctor Verified", "Approve"] else submission.status,
        original_ai_diagnosis=original_ai_diag,
        final_doctor_diagnosis=submission.final_doctor_diagnosis,
        modified_tests=submission.modified_tests,
        modified_medications=submission.modified_medications,
        doctor_clinical_advice=submission.doctor_clinical_advice,
        doctor_notes=submission.doctor_notes,
        review_date=now.strftime("%d %b %Y"),
        review_time=now.strftime("%I:%M %p"),
        doctor_signature_name=current_user.full_name,
        reviewed_at=now
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Automatically create/update Prescription
    if submission.status != "Rejected":
        prescription = Prescription(
            consultation_id=consultation.id,
            patient_id=patient.id,
            doctor_id=doctor_id,
            medications_json=submission.modified_medications,
            investigations_ordered=submission.modified_tests,
            advice=submission.doctor_clinical_advice,
            follow_up_date=submission.follow_up_date or (now + datetime.timedelta(days=7)).strftime("%Y-%m-%d"),
            is_signed=True
        )
        db.add(prescription)
        db.commit()

    # Record Audit Log
    action_label = "Approved Clinical Plan" if "Doctor Verified" in review.status else ("Rejected AI Recommendation" if review.status == "Rejected" else "Modified AI Recommendation")
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        patient_id=patient.id,
        patient_name=patient.name,
        action=action_label,
        details=f"Physician final decision: '{submission.final_doctor_diagnosis}'. Tests ordered: {len(submission.modified_tests)}, Meds: {len(submission.modified_medications)}"
    )
    db.add(audit)
    db.commit()

    return DoctorReviewOut.model_validate(review)

@router.get("/comparison/{patient_id}")
def get_ai_vs_doctor_comparison(patient_id: int, db: Session = Depends(get_db)):
    """
    Feature #11: AI VS DOCTOR COMPARISON
    Visual side-by-side comparison of what AI suggested and what Doctor approved.
    """
    latest_ai = db.query(AIAssessment).filter(AIAssessment.patient_id == patient_id).order_by(AIAssessment.id.desc()).first()
    review = db.query(DoctorReview).join(Consultation).filter(Consultation.patient_id == patient_id).order_by(DoctorReview.id.desc()).first()

    if not latest_ai and not review:
        return {"has_comparison": False, "message": "No AI assessment or doctor review recorded yet"}

    ai_data = {
        "suggested_diagnosis": (latest_ai.possible_conditions[0]["condition"]) if (latest_ai and latest_ai.possible_conditions) else "Not generated",
        "recommended_tests": [t["test"] for t in latest_ai.recommended_investigations] if latest_ai else [],
        "management_suggestions": latest_ai.management_suggestions if latest_ai else [],
        "suggested_priority": latest_ai.suggested_risk_score if latest_ai else "Routine"
    }

    doctor_data = {
        "status": review.status if review else "Awaiting Doctor Review",
        "final_diagnosis": review.final_doctor_diagnosis if review else "Pending Doctor Review",
        "approved_tests": review.modified_tests if review else [],
        "approved_medications": review.modified_medications if review else [],
        "doctor_advice": review.doctor_clinical_advice if review else "",
        "approved_by": review.doctor_signature_name if review else None,
        "reviewed_at": f"{review.review_date} • {review.review_time}" if (review and review.review_date) else None
    }

    return {
        "has_comparison": True,
        "patient_id": patient_id,
        "ai_suggestion": ai_data,
        "doctor_decision": doctor_data
    }
