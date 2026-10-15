export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'doctor' | 'receptionist' | 'admin' | 'patient';
  department: string;
  license_number?: string;
  is_active: boolean;
  is_demo?: boolean;
}

export interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  complaint: string;
  status: 'waiting' | 'in_consultation' | 'reviewed' | 'cancelled';
  priority: 'Urgent' | 'High' | 'Routine';
  waiting_time_minutes: number;
  vitals_bp: string;
  vitals_hr: string;
  vitals_temp: string;
  vitals_spo2: string;
  vitals_weight: string;
}

export interface Symptom {
  id?: number;
  main_symptom: string;
  duration: string;
  severity: string;
  associated_symptoms?: string;
  onset?: string;
  observations?: string;
}

export interface MedicalHistory {
  id?: number;
  previous_diseases: string;
  previous_surgeries: string;
  chronic_conditions: string;
  family_history: string;
  previous_relevant_episodes: string;
}

export interface Medication {
  id?: number;
  name: string;
  dose: string;
  frequency: string;
  duration?: string;
  is_current?: boolean;
}

export interface Allergy {
  id?: number;
  allergen: string;
  reaction: string;
  severity: string;
}

export interface LabResult {
  id?: number;
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
  interpretation?: string;
}

export interface LabReport {
  id: number;
  title: string;
  report_type: string;
  file_name: string;
  uploaded_at: string;
  processed_status: string;
  summary_findings?: string;
  results: LabResult[];
}

export interface PastConsultation {
  id: number;
  visit_date: string;
  visit_type: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  clinical_notes: string;
  doctor_name?: string;
}

export interface PatientListItem {
  id: number;
  mrn: string;
  name: string;
  age: number;
  sex: string;
  blood_group: string;
  contact: string;
  active_appointment?: Appointment;
  last_consultation_date?: string;
  priority_level: 'Urgent' | 'High' | 'Routine';
}

export interface PatientDetail {
  id: number;
  mrn: string;
  name: string;
  age: number;
  sex: string;
  blood_group: string;
  contact: string;
  email?: string;
  address: string;
  emergency_contact: string;
  registered_at: string;
  current_symptoms?: Symptom;
  medical_history?: MedicalHistory;
  medications: Medication[];
  allergies: Allergy[];
  lab_reports: LabReport[];
  appointments: Appointment[];
  previous_consultations: PastConsultation[];
  active_appointment?: Appointment;
  latest_review_status?: string;
}

export interface PossibleCondition {
  condition: string;
  confidence_evidence: string;
  icd10?: string;
  rationale: string;
}

export interface RecommendedInvestigation {
  test: string;
  reason: string;
  priority: string;
}

export interface ManagementCategory {
  category: string;
  items: string[];
}

export interface AIAssessment {
  id?: number;
  patient_id: number;
  consultation_id?: number;
  clinical_summary: string;
  possible_conditions: PossibleCondition[];
  red_flags: string[];
  recommended_investigations: RecommendedInvestigation[];
  management_suggestions: ManagementCategory[];
  reasoning_evidence: string;
  suggested_risk_score: 'Routine' | 'High' | 'Urgent' | 'Low' | 'Needs Attention';
  is_emergency: boolean;
  guidelines_referenced: string[];
  created_at?: string;
}

export interface DoctorReview {
  id?: number;
  ai_assessment_id?: number;
  consultation_id?: number;
  doctor_id?: number;
  status: string;
  original_ai_diagnosis?: string;
  final_doctor_diagnosis?: string;
  modified_tests: string[];
  modified_medications: any[];
  doctor_clinical_advice?: string;
  doctor_notes?: string;
  review_date?: string;
  review_time?: string;
  doctor_signature_name?: string;
  reviewed_at?: string;
}

export interface WhatChanged {
  patient_id: number;
  previous_visit_date?: string;
  current_visit_date: string;
  new_symptoms: string[];
  changed_medications: { name: string; dose: string; frequency: string; status: string }[];
  new_lab_results: { test: string; value: string; flag: string; interpretation: string }[];
  improved_findings: string[];
  worsened_findings: string[];
  missed_follow_up_items: string[];
}

export interface HandoffData {
  patient_name: string;
  patient_mrn: string;
  age_sex: string;
  handoff_timestamp: string;
  generated_by: string;
  current_concern: string;
  vital_signs_summary: string;
  relevant_history: string;
  current_medications: string[];
  recent_investigations: string[];
  ai_assessment_summary: string;
  attending_physician_notes: string;
  key_action_items: string[];
}

export interface Prescription {
  id: number;
  consultation_id: number;
  patient_id: number;
  patient_name: string;
  patient_age_sex: string;
  patient_mrn: string;
  doctor_name: string;
  doctor_qualification: string;
  doctor_department: string;
  date: string;
  diagnosis: string;
  vitals: Record<string, string>;
  medications: any[];
  investigations_ordered: string[];
  advice: string;
  dietary_instructions?: string;
  follow_up_date?: string;
  is_signed: boolean;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_name: string;
  user_role: string;
  patient_id?: number;
  patient_name?: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface FollowupItem {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_mrn: string;
  patient_contact: string;
  due_date: string;
  reason: string;
  status: string;
  notes?: string;
}
