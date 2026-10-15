from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    full_name: str
    role: str
    department: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    department: str
    license_number: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# --- Patient & Vitals Schemas ---
class AllergyItem(BaseModel):
    id: Optional[int] = None
    allergen: str
    reaction: str
    severity: str = "Moderate"

    class Config:
        from_attributes = True

class MedicationItem(BaseModel):
    id: Optional[int] = None
    name: str
    dose: str
    frequency: str
    duration: str = "Ongoing"
    is_current: bool = True
    started_at: Optional[str] = None

    class Config:
        from_attributes = True

class MedicalHistoryOut(BaseModel):
    id: Optional[int] = None
    previous_diseases: str
    previous_surgeries: str
    chronic_conditions: str
    family_history: str
    previous_relevant_episodes: str

    class Config:
        from_attributes = True

class SymptomOut(BaseModel):
    id: Optional[int] = None
    main_symptom: str
    duration: str
    severity: str
    associated_symptoms: Optional[str] = None
    onset: Optional[str] = "Gradual"
    observations: Optional[str] = None

    class Config:
        from_attributes = True

class LabResultOut(BaseModel):
    id: Optional[int] = None
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: str = "normal"  # normal, high, low, critical
    interpretation: Optional[str] = None

    class Config:
        from_attributes = True

class LabReportOut(BaseModel):
    id: int
    title: str
    report_type: str
    file_name: str
    uploaded_at: datetime
    processed_status: str
    summary_findings: Optional[str] = None
    results: List[LabResultOut] = []

    class Config:
        from_attributes = True

class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    appointment_date: str
    appointment_time: str
    complaint: str
    status: str
    priority: str
    waiting_time_minutes: int
    vitals_bp: str
    vitals_hr: str
    vitals_temp: str
    vitals_spo2: str
    vitals_weight: str

    class Config:
        from_attributes = True

class PatientListOut(BaseModel):
    id: int
    mrn: str
    name: str
    age: int
    sex: str
    blood_group: str
    contact: str
    active_appointment: Optional[AppointmentOut] = None
    last_consultation_date: Optional[str] = None
    priority_level: str = "Routine"

    class Config:
        from_attributes = True

class ConsultationPast(BaseModel):
    id: int
    visit_date: str
    visit_type: str
    chief_complaint: str
    diagnosis: str
    treatment_plan: str
    clinical_notes: str
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True

class PatientDetailOut(BaseModel):
    id: int
    mrn: str
    name: str
    age: int
    sex: str
    blood_group: str
    contact: str
    email: Optional[str] = None
    address: str
    emergency_contact: str
    registered_at: datetime
    
    current_symptoms: Optional[SymptomOut] = None
    medical_history: Optional[MedicalHistoryOut] = None
    medications: List[MedicationItem] = []
    allergies: List[AllergyItem] = []
    lab_reports: List[LabReportOut] = []
    appointments: List[AppointmentOut] = []
    previous_consultations: List[ConsultationPast] = []
    
    active_appointment: Optional[AppointmentOut] = None
    latest_review_status: Optional[str] = None

    class Config:
        from_attributes = True

# --- AI Assessment Schemas ---
class PossibleConditionItem(BaseModel):
    condition: str
    confidence_evidence: str  # e.g., "Possible - Supported by high fever & elevated WBC"
    icd10: Optional[str] = None
    rationale: str

class InvestigationItem(BaseModel):
    test: str
    reason: str
    priority: str = "Recommended"  # Urgent, Recommended, Consider

class ManagementCategory(BaseModel):
    category: str  # Supportive Care, Monitoring, Medication Considerations, Lifestyle
    items: List[str]

class AIAssessmentOut(BaseModel):
    id: Optional[int] = None
    patient_id: int
    consultation_id: Optional[int] = None
    clinical_summary: str
    possible_conditions: List[PossibleConditionItem]
    red_flags: List[str]
    recommended_investigations: List[InvestigationItem]
    management_suggestions: List[ManagementCategory]
    reasoning_evidence: str
    suggested_risk_score: str  # Low, Medium, High, Urgent
    is_emergency: bool = False
    guidelines_referenced: List[str] = []
    created_at: Optional[datetime] = None

# --- Doctor Review & Approval Schemas ---
class DoctorReviewSubmit(BaseModel):
    consultation_id: Optional[int] = None
    patient_id: int
    status: str  # "Doctor Verified", "Modified", "Rejected"
    final_doctor_diagnosis: str
    modified_tests: List[str]
    modified_medications: List[Dict[str, Any]]
    doctor_clinical_advice: str
    doctor_notes: Optional[str] = ""
    follow_up_date: Optional[str] = None

class DoctorReviewOut(BaseModel):
    id: int
    ai_assessment_id: Optional[int] = None
    consultation_id: int
    doctor_id: int
    status: str
    original_ai_diagnosis: Optional[str] = None
    final_doctor_diagnosis: Optional[str] = None
    modified_tests: List[str] = []
    modified_medications: List[Dict[str, Any]] = []
    doctor_clinical_advice: Optional[str] = None
    doctor_notes: Optional[str] = None
    review_date: Optional[str] = None
    review_time: Optional[str] = None
    doctor_signature_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- What Changed (Comparative) ---
class WhatChangedOut(BaseModel):
    patient_id: int
    previous_visit_date: Optional[str] = None
    current_visit_date: str
    new_symptoms: List[str]
    changed_medications: List[Dict[str, str]]
    new_lab_results: List[Dict[str, str]]
    improved_findings: List[str]
    worsened_findings: List[str]
    missed_follow_up_items: List[str]

# --- Doctor Handoff ---
class DoctorHandoffOut(BaseModel):
    patient_name: str
    patient_mrn: str
    age_sex: str
    handoff_timestamp: str
    generated_by: str
    current_concern: str
    vital_signs_summary: str
    relevant_history: str
    current_medications: List[str]
    recent_investigations: List[str]
    ai_assessment_summary: str
    attending_physician_notes: str
    key_action_items: List[str]

# --- AI Chat Schemas ---
class AIChatRequest(BaseModel):
    patient_id: int
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class AIChatResponse(BaseModel):
    reply: str
    evidence_citations: List[str] = []

# --- Note Summarization ---
class NoteSummarizeRequest(BaseModel):
    raw_notes: str
    patient_id: int

class NoteSummarizeResponse(BaseModel):
    structured_summary: str
    extracted_symptoms: List[str]
    suggested_actions: List[str]

# --- Prescription / Consultation Summary ---
class PrescriptionOut(BaseModel):
    id: int
    consultation_id: int
    patient_id: int
    patient_name: str
    patient_age_sex: str
    patient_mrn: str
    doctor_name: str
    doctor_qualification: str
    doctor_department: str
    date: str
    diagnosis: str
    vitals: Dict[str, str]
    medications: List[Dict[str, Any]]
    investigations_ordered: List[str]
    advice: str
    dietary_instructions: Optional[str] = None
    follow_up_date: Optional[str] = None
    is_signed: bool = True
