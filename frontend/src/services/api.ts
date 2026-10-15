const API_BASE = "http://127.0.0.1:8000/api/v1";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("mediassist_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid email or password");
    return res.json();
  },

  async doctorRegister(data: {
    full_name: string; email: string; phone: string; license_number: string;
    specialization: string; hospital_name: string; password: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/doctor/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Doctor registration failed");
    }
    return res.json();
  },

  async demoLogin(role: string) {
    const res = await fetch(`${API_BASE}/auth/demo-login/${role}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to switch demo role");
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  // Patients
  async getPatientsQueue(priority?: string, sortBy: string = "waiting_time", search?: string) {
    const params = new URLSearchParams();
    if (priority && priority !== "All") params.append("priority", priority);
    if (sortBy) params.append("sort_by", sortBy);
    if (search) params.append("search", search);

    const res = await fetch(`${API_BASE}/patients?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load patient queue");
    return res.json();
  },

  async getPatientDetail(patientId: number) {
    const res = await fetch(`${API_BASE}/patients/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load patient profile");
    return res.json();
  },

  async getWhatsNew(patientId: number) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/whats-new`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load What's New comparison");
    return res.json();
  },

  async getPatientTimeline(patientId: number) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/timeline`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load patient timeline");
    return res.json();
  },

  // AI Assistant
  async generateAIAssessment(patientId: number) {
    const res = await fetch(`${API_BASE}/ai/assess/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to generate clinical AI assessment");
    return res.json();
  },

  async get30sSummary(patientId: number) {
    const res = await fetch(`${API_BASE}/ai/30s-summary/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to generate 30s summary");
    return res.json();
  },

  async aiChat(patientId: number, message: string) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ patient_id: patientId, message }),
    });
    if (!res.ok) throw new Error("Failed to send message to AI clinical assistant");
    return res.json();
  },

  async summarizeNotes(patientId: number, rawNotes: string) {
    const res = await fetch(`${API_BASE}/ai/summarize-notes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ patient_id: patientId, raw_notes: rawNotes }),
    });
    if (!res.ok) throw new Error("Failed to summarize notes");
    return res.json();
  },

  async approvePlan(payload: {
    patient_id: number;
    status: string;
    final_doctor_diagnosis: string;
    modified_tests: string[];
    modified_medications: any[];
    doctor_clinical_advice: string;
    doctor_notes?: string;
    follow_up_date?: string;
  }) {
    const res = await fetch(`${API_BASE}/ai/approve-plan`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to submit doctor approval");
    return res.json();
  },

  async getAIComparison(patientId: number) {
    const res = await fetch(`${API_BASE}/ai/comparison/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load AI vs Doctor comparison");
    return res.json();
  },

  // Reports
  async uploadReport(patientId: number, title: string, reportType: string, simulatedText?: string) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("report_type", reportType);
    if (simulatedText) {
      formData.append("simulated_text", simulatedText);
    }

    const token = localStorage.getItem("mediassist_token");
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/reports/upload/${patientId}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to process document upload");
    return res.json();
  },

  // Prescription
  async getPrescription(patientId: number) {
    const res = await fetch(`${API_BASE}/consultations/prescription/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load prescription summary");
    return res.json();
  },

  // Doctor Handoff
  async getDoctorHandoff(patientId: number) {
    const res = await fetch(`${API_BASE}/handoff/${patientId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to generate doctor handoff");
    return res.json();
  },

  // Follow-ups
  async getFollowups() {
    const res = await fetch(`${API_BASE}/followups`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load follow-up schedule");
    return res.json();
  },

  async completeFollowup(followupId: number) {
    const res = await fetch(`${API_BASE}/followups/${followupId}/complete`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to complete follow-up");
    return res.json();
  },

  // Analytics
  async getAnalyticsDashboard() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load analytics dashboard");
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(patientId?: number, action?: string) {
    const params = new URLSearchParams();
    if (patientId) params.append("patient_id", patientId.toString());
    if (action) params.append("action", action);

    const res = await fetch(`${API_BASE}/audit/logs?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load audit logs");
    return res.json();
  },

  // ── Patient Portal ────────────────────────────────────────────────────────
  async patientLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/patient/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid patient credentials");
    }
    return res.json();
  },

  async patientRegister(data: {
    full_name: string; email: string; username: string; password: string;
    age: number; sex: string; contact: string; date_of_birth?: string;
    blood_group?: string; address?: string; emergency_contact?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/patient/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async demoPatientLogin() {
    const res = await fetch(`${API_BASE}/auth/demo-login/patient`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to start the patient demo");
    return res.json();
  },

  async getMyPatientRecord() {
    const res = await fetch(`${API_BASE}/auth/patient/my-record`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load patient record");
    return res.json();
  },

  async getMyPortalProfile() {
    const res = await fetch(`${API_BASE}/patient-portal/my-profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load portal profile");
    return res.json();
  },

  async submitSymptoms(data: {
    main_symptom: string; duration: string; severity: string;
    associated_symptoms?: string; onset?: string; observations?: string;
  }) {
    const res = await fetch(`${API_BASE}/patient-portal/submit-symptoms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit symptoms");
    return res.json();
  },

  async updateMedicalHistory(data: {
    previous_diseases?: string; previous_surgeries?: string;
    chronic_conditions?: string; family_history?: string;
    previous_relevant_episodes?: string;
  }) {
    const res = await fetch(`${API_BASE}/patient-portal/update-history`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update medical history");
    return res.json();
  },

  async addMedication(data: { name: string; dose: string; frequency: string; duration?: string }) {
    const res = await fetch(`${API_BASE}/patient-portal/add-medication`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add medication");
    return res.json();
  },

  async removeMedication(medId: number) {
    const res = await fetch(`${API_BASE}/patient-portal/remove-medication/${medId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to remove medication");
    return res.json();
  },

  async addAllergy(data: { allergen: string; reaction: string; severity?: string }) {
    const res = await fetch(`${API_BASE}/patient-portal/add-allergy`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add allergy");
    return res.json();
  },

  async removeAllergy(allergyId: number) {
    const res = await fetch(`${API_BASE}/patient-portal/remove-allergy/${allergyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to remove allergy");
    return res.json();
  },

  async bookAppointment(data: { appointment_date: string; appointment_time: string; complaint: string }) {
    const res = await fetch(`${API_BASE}/patient-portal/book-appointment`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to book appointment");
    return res.json();
  },

  async updatePersonalInfo(data: { address?: string; emergency_contact?: string; contact?: string; blood_group?: string }) {
    const res = await fetch(`${API_BASE}/patient-portal/update-personal-info`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update personal info");
    return res.json();
  },

  async getMyConsultations() {
    const res = await fetch(`${API_BASE}/patient-portal/my-consultations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load consultations");
    return res.json();
  },

  async getMyReports() {
    const res = await fetch(`${API_BASE}/patient-portal/my-reports`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load your medical reports");
    return res.json();
  },
};

