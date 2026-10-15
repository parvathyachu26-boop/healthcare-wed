import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    # role: 'doctor', 'receptionist', 'admin', 'patient'
    role = Column(String(30), nullable=False)
    department = Column(String(100), default="General Medicine")
    license_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")
    patient_record = relationship("Patient", back_populates="user_account", uselist=False, foreign_keys="Patient.user_id")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(100), nullable=False)
    specialty = Column(String(100), default="Internal Medicine")
    qualification = Column(String(100), default="MD, MBBS")
    room_number = Column(String(20), default="OPD-102")
    contact = Column(String(50), default="+1 (555) 234-5678")
    hospital_name = Column(String(150), default="")

    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    consultations = relationship("Consultation", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)  # linked patient portal account
    mrn = Column(String(30), unique=True, index=True, nullable=False)  # e.g. MED-84920
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String(20), nullable=False)  # Male, Female, Other
    blood_group = Column(String(10), default="O+")
    contact = Column(String(30), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(String(255), default="")
    emergency_contact = Column(String(100), default="")
    date_of_birth = Column(String(20), nullable=True)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    # intake_status: 'pending' (patient submitted), 'reviewed', 'in_queue'
    intake_status = Column(String(30), default="pending")

    # Relationships
    user_account = relationship("User", back_populates="patient_record", foreign_keys=[user_id])
    appointments = relationship("Appointment", back_populates="patient")
    symptoms = relationship("Symptom", back_populates="patient")
    medical_history = relationship("MedicalHistory", back_populates="patient", uselist=False)
    medications = relationship("Medication", back_populates="patient")
    allergies = relationship("Allergy", back_populates="patient")
    lab_reports = relationship("LabReport", back_populates="patient")
    consultations = relationship("Consultation", back_populates="patient")
    followups = relationship("Followup", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    appointment_date = Column(String(30), default=lambda: datetime.date.today().isoformat())
    appointment_time = Column(String(20), default="09:30 AM")
    complaint = Column(String(255), nullable=False)
    status = Column(String(30), default="waiting")  # 'waiting', 'in_consultation', 'reviewed', 'cancelled'
    priority = Column(String(20), default="Routine")  # 'Urgent', 'High', 'Routine'
    waiting_time_minutes = Column(Integer, default=15)
    vitals_bp = Column(String(20), default="120/80 mmHg")
    vitals_hr = Column(String(20), default="74 bpm")
    vitals_temp = Column(String(20), default="98.6 °F")
    vitals_spo2 = Column(String(20), default="98 %")
    vitals_weight = Column(String(20), default="70 kg")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    main_symptom = Column(String(200), nullable=False)
    duration = Column(String(100), nullable=False)
    severity = Column(String(50), default="Moderate")  # Mild, Moderate, Severe, Critical
    associated_symptoms = Column(Text, nullable=True)
    onset = Column(String(100), default="Gradual")
    observations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="symptoms")
    consultation = relationship("Consultation", back_populates="symptoms")


class MedicalHistory(Base):
    __tablename__ = "medical_history"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), unique=True, nullable=False)
    previous_diseases = Column(Text, default="None")
    previous_surgeries = Column(Text, default="None")
    chronic_conditions = Column(Text, default="None")
    family_history = Column(Text, default="No known significant family history")
    previous_relevant_episodes = Column(Text, default="None")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="medical_history")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String(100), nullable=False)
    dose = Column(String(50), nullable=False)
    frequency = Column(String(50), nullable=False)  # e.g. "Once daily", "Twice daily with meals"
    duration = Column(String(50), default="Ongoing")
    is_current = Column(Boolean, default=True)
    started_at = Column(String(50), default="2026-01-15")

    patient = relationship("Patient", back_populates="medications")


class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    allergen = Column(String(100), nullable=False)  # e.g. "Penicillin", "Sulfa drugs", "Peanuts"
    reaction = Column(String(200), nullable=False)  # e.g. "Skin rash, Urticaria", "Anaphylaxis"
    severity = Column(String(30), default="Moderate")  # Mild, Moderate, Severe

    patient = relationship("Patient", back_populates="allergies")


class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String(150), nullable=False)
    report_type = Column(String(50), default="Blood Test")  # Blood, X-Ray, Scan, Urinalysis, ECG
    file_name = Column(String(150), default="report.pdf")
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_status = Column(String(30), default="Processed")  # Pending, Processed, Error
    summary_findings = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="lab_reports")
    results = relationship("LabResult", back_populates="report", cascade="all, delete-orphan")


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("lab_reports.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    test_name = Column(String(100), nullable=False)
    value = Column(String(50), nullable=False)
    unit = Column(String(30), nullable=True)
    reference_range = Column(String(50), nullable=True)
    flag = Column(String(20), default="normal")  # 'normal', 'high', 'low', 'critical'
    interpretation = Column(String(255), nullable=True)

    report = relationship("LabReport", back_populates="results")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    visit_date = Column(String(30), default=lambda: datetime.date.today().isoformat())
    visit_type = Column(String(50), default="Routine OPD")
    chief_complaint = Column(String(255), nullable=False)
    clinical_notes = Column(Text, default="")
    ai_note_summary = Column(Text, nullable=True)
    diagnosis = Column(String(255), default="Pending Evaluation")
    treatment_plan = Column(Text, default="")
    status = Column(String(30), default="completed")  # in_progress, completed, referred
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="consultations")
    doctor = relationship("Doctor", back_populates="consultations")
    symptoms = relationship("Symptom", back_populates="consultation")
    ai_assessment = relationship("AIAssessment", back_populates="consultation", uselist=False)
    doctor_review = relationship("DoctorReview", back_populates="consultation", uselist=False)
    prescription = relationship("Prescription", back_populates="consultation", uselist=False)


class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    clinical_summary = Column(Text, nullable=False)
    possible_conditions = Column(JSON, nullable=False)  # [{condition, confidence_evidence, icd10, rationale}]
    red_flags = Column(JSON, nullable=False)  # [str] or ["No major red flags identified..."]
    recommended_investigations = Column(JSON, nullable=False)  # [{test, reason, priority}]
    management_suggestions = Column(JSON, nullable=False)  # [{category, items: [str]}]
    reasoning_evidence = Column(Text, nullable=False)
    suggested_risk_score = Column(String(20), default="Routine")  # Low, Medium, High, Urgent
    is_emergency = Column(Boolean, default=False)
    guidelines_referenced = Column(JSON, default=list)  # ["NICE NG138", "GOLD 2026", "AHA/ACC 2025"]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="ai_assessment")
    doctor_reviews = relationship("DoctorReview", back_populates="ai_assessment")


class DoctorReview(Base):
    __tablename__ = "doctor_reviews"

    id = Column(Integer, primary_key=True, index=True)
    ai_assessment_id = Column(Integer, ForeignKey("ai_assessments.id"), nullable=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    status = Column(String(50), default="Awaiting Doctor Review")  # "Awaiting Doctor Review", "Doctor Verified", "Modified", "Rejected"
    
    # Differential & Decision comparison
    original_ai_diagnosis = Column(String(255), nullable=True)
    final_doctor_diagnosis = Column(String(255), nullable=True)
    modified_tests = Column(JSON, default=list)
    modified_medications = Column(JSON, default=list)
    doctor_clinical_advice = Column(Text, default="")
    doctor_notes = Column(Text, default="")
    
    review_date = Column(String(30), nullable=True)
    review_time = Column(String(30), nullable=True)
    doctor_signature_name = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    consultation = relationship("Consultation", back_populates="doctor_review")
    ai_assessment = relationship("AIAssessment", back_populates="doctor_reviews")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    medications_json = Column(JSON, nullable=False)  # [{name, dose, frequency, duration, instructions}]
    investigations_ordered = Column(JSON, default=list)  # [str]
    advice = Column(Text, nullable=True)
    dietary_instructions = Column(Text, nullable=True)
    follow_up_date = Column(String(30), nullable=True)
    is_signed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="prescription")


class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    due_date = Column(String(30), nullable=False)
    reason = Column(String(255), nullable=False)
    status = Column(String(30), default="pending")  # pending, completed, missed, rescheduled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="followups")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100), nullable=False)
    user_role = Column(String(50), nullable=False)
    patient_id = Column(Integer, nullable=True)
    patient_name = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)  # "Viewed Patient Record", "Generated AI Assessment", "Modified AI Recommendation", "Approved Clinical Plan", etc.
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
