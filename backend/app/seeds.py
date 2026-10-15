import datetime
from sqlalchemy.orm import Session
from .models import (
    User, Doctor, Patient, Appointment, Symptom, MedicalHistory,
    Medication, Allergy, LabReport, LabResult, Consultation,
    AIAssessment, DoctorReview, Prescription, Followup, AuditLog
)
from .auth import hash_password

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).first():
        return

    print("Seeding database with realistic fictional clinical demo data...")

    # 1. Users & Doctors
    # Doctor 1: Dr. Arun Patel
    dr_patel_user = User(
        username="dr.patel",
        email="arun.patel@mediassist.health",
        hashed_password=hash_password("doctor123"),
        full_name="Dr. Arun Patel",
        role="doctor",
        department="Internal Medicine & Pulmonology",
        license_number="MED-LIC-84920",
        is_active=True
    )
    # Doctor 2: Dr. Sarah Jenkins
    dr_jenkins_user = User(
        username="dr.jenkins",
        email="sarah.jenkins@mediassist.health",
        hashed_password=hash_password("doctor123"),
        full_name="Dr. Sarah Jenkins",
        role="doctor",
        department="General Medicine",
        license_number="MED-LIC-77219",
        is_active=True
    )
    # Receptionist: Elena Vance
    receptionist_user = User(
        username="receptionist",
        email="elena.vance@mediassist.health",
        hashed_password=hash_password("staff123"),
        full_name="Elena Vance",
        role="receptionist",
        department="Front Desk & Registration",
        is_active=True
    )
    # Admin: Hospital Administrator
    admin_user = User(
        username="admin",
        email="admin@mediassist.health",
        hashed_password=hash_password("admin123"),
        full_name="Hospital Administrator",
        role="admin",
        department="Clinical Informatics",
        is_active=True
    )

    # Patient user: Akhil Menon (for demo patient portal login)
    patient_akhil_user = User(
        username="patient.akhil",
        email="akhil.menon.fictional@example.com",
        hashed_password=hash_password("patient123"),
        full_name="Akhil Menon",
        role="patient",
        department="Patient Portal",
        is_active=True
    )

    db.add_all([dr_patel_user, dr_jenkins_user, receptionist_user, admin_user, patient_akhil_user])
    db.commit()

    # Doctor profiles
    doctor_patel = Doctor(
        user_id=dr_patel_user.id,
        full_name="Dr. Arun Patel",
        specialty="Internal Medicine & Pulmonology",
        qualification="MD, MBBS, FCCP",
        room_number="OPD-Suite 102",
        contact="+1 (555) 234-5678"
    )
    doctor_jenkins = Doctor(
        user_id=dr_jenkins_user.id,
        full_name="Dr. Sarah Jenkins",
        specialty="General Medicine",
        qualification="MD, MBBS",
        room_number="OPD-Suite 104",
        contact="+1 (555) 456-7890"
    )
    db.add_all([doctor_patel, doctor_jenkins])
    db.commit()

    # 2. 10 Fictional Patients
    patients_data = [
        {
            "mrn": "MED-2026-001",
            "name": "Akhil Menon",
            "age": 42,
            "sex": "Male",
            "blood_group": "B+",
            "contact": "+1 (555) 019-4821",
            "email": "akhil.menon.fictional@example.com",
            "address": "422 Willow Creek Way, Springfield",
            "emergency_contact": "Sunita Menon (Spouse) - +1 (555) 019-4822",
            "symptom": {
                "main_symptom": "Persistent cough and fever",
                "duration": "4 days",
                "severity": "High",
                "associated_symptoms": "Chills, productive yellowish sputum, mild retrosternal chest tightness, generalized malaise",
                "onset": "Acute onset 4 days ago after viral exposure",
                "observations": "Febrile to touch, mild tachypnea on talking, productive cough noted."
            },
            "history": {
                "previous_diseases": "Mild intermittent childhood asthma",
                "previous_surgeries": "Appendectomy (2018)",
                "chronic_conditions": "Childhood asthma (infrequent inhaler use)",
                "family_history": "Father has hypertension, Mother has Type 2 diabetes",
                "previous_relevant_episodes": "Similar acute bronchitis episode in winter 2024 treated with supportive bronchodilators"
            },
            "medications": [
                {"name": "Salbutamol Inhaler 100mcg", "dose": "2 puffs", "frequency": "As needed (SOS)", "duration": "PRN", "is_current": True}
            ],
            "allergies": [
                {"allergen": "Penicillin", "reaction": "Cutaneous erythematous rash and pruritus", "severity": "Moderate"}
            ],
            "appointment": {
                "complaint": "Persistent cough and fever (4 days)",
                "priority": "High",
                "waiting_time_minutes": 18,
                "vitals_bp": "128/84 mmHg",
                "vitals_hr": "88 bpm",
                "vitals_temp": "101.4 °F",
                "vitals_spo2": "96 %",
                "vitals_weight": "74 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Comprehensive Blood Profile & Inflammatory Panel",
                    "report_type": "Blood Test",
                    "file_name": "CBC_Akhil_Menon_Oct2026.pdf",
                    "summary_findings": "Leukocytosis with neutrophilic predominance (WBC 13,200 /µL) and mild anemia (Hb 10.2 g/dL). Elevated CRP.",
                    "results": [
                        {"test_name": "Hemoglobin", "value": "10.2", "unit": "g/dL", "reference_range": "12.0 - 16.5 g/dL", "flag": "low", "interpretation": "Below reference range"},
                        {"test_name": "WBC (Total Leukocyte Count)", "value": "13200", "unit": "/µL", "reference_range": "4000 - 11000 /µL", "flag": "high", "interpretation": "Above reference range (Leukocytosis)"},
                        {"test_name": "Neutrophils", "value": "78", "unit": "%", "reference_range": "40 - 70 %", "flag": "high", "interpretation": "Neutrophilia suggestive of inflammatory/infectious state"},
                        {"test_name": "Platelets", "value": "240000", "unit": "/µL", "reference_range": "150000 - 450000 /µL", "flag": "normal", "interpretation": "Normal"},
                        {"test_name": "C-Reactive Protein (CRP)", "value": "34.5", "unit": "mg/L", "reference_range": "0.0 - 5.0 mg/L", "flag": "high", "interpretation": "Elevated acute phase reactant"}
                    ]
                }
            ],
            "past_consults": [
                {
                    "visit_date": "2026-06-12",
                    "visit_type": "Outpatient Follow-up",
                    "chief_complaint": "Seasonal pollen-induced wheezing",
                    "diagnosis": "Mild allergic airway exacerbation",
                    "treatment_plan": "Short course Salbutamol inhaler PRN + Cetirizine 10mg nightly for 7 days.",
                    "clinical_notes": "Bilateral mild expiratory wheezing, clear heart sounds. SpO2 98%. Advised allergen avoidance."
                }
            ],
            "followup": {
                "due_date": "2026-10-14",
                "reason": "7-day review of respiratory symptoms and fever resolution",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-002",
            "name": "Maria Rodriguez",
            "age": 58,
            "sex": "Female",
            "blood_group": "O+",
            "contact": "+1 (555) 018-9122",
            "email": "maria.rodriguez.fictional@example.com",
            "address": "128 Citrus Grove, Springfield",
            "emergency_contact": "Carlos Rodriguez (Son) - +1 (555) 018-9125",
            "symptom": {
                "main_symptom": "Type 2 Diabetes glycemic check & generalized fatigue",
                "duration": "3 weeks",
                "severity": "Moderate",
                "associated_symptoms": "Polydipsia, nocturia (2-3 times/night), mild bilateral foot numbness",
                "onset": "Insidious onset over last month",
                "observations": "Alert, oriented, BMI 29.4 kg/m². Mild peripheral sensory blunting on monofilament."
            },
            "history": {
                "previous_diseases": "Type 2 Diabetes Mellitus diagnosed 6 years ago, Dyslipidemia",
                "previous_surgeries": "Cholecystectomy (2015)",
                "chronic_conditions": "Type 2 Diabetes Mellitus, Hypercholesterolemia",
                "family_history": "Strong maternal history of diabetic nephropathy",
                "previous_relevant_episodes": "HbA1c was 7.4% six months ago"
            },
            "medications": [
                {"name": "Metformin HCl", "dose": "500 mg", "frequency": "Twice daily with meals", "duration": "Chronic", "is_current": True},
                {"name": "Atorvastatin", "dose": "20 mg", "frequency": "Once daily at bedtime", "duration": "Chronic", "is_current": True}
            ],
            "allergies": [
                {"allergen": "Sulfa drugs", "reaction": "Angioedema & hives", "severity": "Severe"}
            ],
            "appointment": {
                "complaint": "Type 2 Diabetes review, elevated home glucometer logs",
                "priority": "High",
                "waiting_time_minutes": 25,
                "vitals_bp": "136/86 mmHg",
                "vitals_hr": "76 bpm",
                "vitals_temp": "98.4 °F",
                "vitals_spo2": "98 %",
                "vitals_weight": "79 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Metabolic & Glycemic Profile Panel",
                    "report_type": "Blood Test",
                    "file_name": "Metabolic_Maria_Rodriguez_Oct2026.pdf",
                    "summary_findings": "Elevated HbA1c at 8.6% indicating suboptimal glycemic control over past 90 days. Normal renal function.",
                    "results": [
                        {"test_name": "Fasting Blood Sugar", "value": "164", "unit": "mg/dL", "reference_range": "70 - 100 mg/dL", "flag": "high", "interpretation": "Elevated fasting hyperglycemia"},
                        {"test_name": "HbA1c", "value": "8.6", "unit": "%", "reference_range": "4.0 - 5.7 %", "flag": "high", "interpretation": "Above target range (Poor glycemic control)"},
                        {"test_name": "Serum Creatinine", "value": "0.9", "unit": "mg/dL", "reference_range": "0.6 - 1.2 mg/dL", "flag": "normal", "interpretation": "Normal renal filtration"},
                        {"test_name": "Total Cholesterol", "value": "210", "unit": "mg/dL", "reference_range": "120 - 200 mg/dL", "flag": "high", "interpretation": "Mild hypercholesterolemia"}
                    ]
                }
            ],
            "past_consults": [
                {
                    "visit_date": "2026-04-18",
                    "visit_type": "Routine Chronic Care",
                    "chief_complaint": "Regular 6-month diabetic review",
                    "diagnosis": "Type 2 DM moderately controlled",
                    "treatment_plan": "Continue Metformin 500mg BID, emphasize dietary carbohydrate reduction.",
                    "clinical_notes": "Fundus examination normal. Advised strict adherence to foot hygiene."
                }
            ],
            "followup": {
                "due_date": "2026-10-21",
                "reason": "Assess response to Metformin dosage adjustment and fasting sugar logs",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-003",
            "name": "Robert Chang",
            "age": 63,
            "sex": "Male",
            "blood_group": "A+",
            "contact": "+1 (555) 017-3819",
            "email": "robert.chang.fictional@example.com",
            "address": "88 Pinecrest Ridge, Springfield",
            "emergency_contact": "Linda Chang (Daughter) - +1 (555) 017-3820",
            "symptom": {
                "main_symptom": "Elevated blood pressure with occipital throbbing headache",
                "duration": "2 days",
                "severity": "Moderate",
                "associated_symptoms": "Neck stiffness, mild lightheadedness, episodic visual floaters",
                "onset": "Noticed on home monitor yesterday morning",
                "observations": "Seated BP elevated at 152/94 mmHg, bilaterally verified."
            },
            "history": {
                "previous_diseases": "Primary Hypertension (10 years)",
                "previous_surgeries": "None",
                "chronic_conditions": "Hypertension, Mild Osteoarthritis",
                "family_history": "Paternal stroke at age 68",
                "previous_relevant_episodes": "Previous hypertensive urgency 2 years ago"
            },
            "medications": [
                {"name": "Amlodipine", "dose": "5 mg", "frequency": "Once daily morning", "duration": "Chronic", "is_current": True}
            ],
            "allergies": [],
            "appointment": {
                "complaint": "Elevated blood pressure (152/94) & dull occipital headache",
                "priority": "High",
                "waiting_time_minutes": 14,
                "vitals_bp": "152/94 mmHg",
                "vitals_hr": "78 bpm",
                "vitals_temp": "98.2 °F",
                "vitals_spo2": "97 %",
                "vitals_weight": "82 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Renal & Electrolyte Profile",
                    "report_type": "Blood Test",
                    "file_name": "Renal_Robert_Chang_Oct2026.pdf",
                    "summary_findings": "Normal creatinine and electrolytes. No target organ biochemical damage.",
                    "results": [
                        {"test_name": "Serum Creatinine", "value": "1.0", "unit": "mg/dL", "reference_range": "0.6 - 1.2 mg/dL", "flag": "normal", "interpretation": "Normal"},
                        {"test_name": "Serum Sodium", "value": "139", "unit": "mEq/L", "reference_range": "135 - 145 mEq/L", "flag": "normal", "interpretation": "Normal"},
                        {"test_name": "Serum Potassium", "value": "4.2", "unit": "mEq/L", "reference_range": "3.5 - 5.0 mEq/L", "flag": "normal", "interpretation": "Normal"}
                    ]
                }
            ],
            "past_consults": [
                {
                    "visit_date": "2026-05-10",
                    "visit_type": "Routine OPD",
                    "chief_complaint": "BP medication refill",
                    "diagnosis": "Essential Hypertension Controlled",
                    "treatment_plan": "Refill Amlodipine 5mg. Advised sodium restriction.",
                    "clinical_notes": "BP 130/82 mmHg. Patient compliant with medication."
                }
            ],
            "followup": {
                "due_date": "2026-10-15",
                "reason": "BP recheck after potential regimen escalation (Telmisartan addition)",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-004",
            "name": "Priya Sharma",
            "age": 29,
            "sex": "Female",
            "blood_group": "AB+",
            "contact": "+1 (555) 016-2910",
            "email": "priya.sharma.fictional@example.com",
            "address": "304 Elm Terrace, Apt 4B, Springfield",
            "emergency_contact": "Vikram Sharma (Brother) - +1 (555) 016-2911",
            "symptom": {
                "main_symptom": "Severe unilateral throbbing headache with photophobia",
                "duration": "18 hours",
                "severity": "High",
                "associated_symptoms": "Nausea, sensitivity to sound, visual zigzag lines (scintillating scotoma) prior to pain onset",
                "onset": "Acute onset following high-stress work project",
                "observations": "Patient wearing sunglasses in room, visibly in moderate pain, no focal neurological deficits."
            },
            "history": {
                "previous_diseases": "Migraine with aura since adolescence",
                "previous_surgeries": "None",
                "chronic_conditions": "Episodic Migraine",
                "family_history": "Mother suffers from severe migraines",
                "previous_relevant_episodes": "Similar attack 3 months ago relieved by Zolmitriptan"
            },
            "medications": [
                {"name": "Naproxen Sodium", "dose": "500 mg", "frequency": "PRN at headache onset", "duration": "PRN", "is_current": True}
            ],
            "allergies": [
                {"allergen": "Aspirin", "reaction": "Gastric irritation & bronchospasm", "severity": "Moderate"}
            ],
            "appointment": {
                "complaint": "Unilateral throbbing headache, photophobia, nausea (18h)",
                "priority": "High",
                "waiting_time_minutes": 10,
                "vitals_bp": "118/76 mmHg",
                "vitals_hr": "82 bpm",
                "vitals_temp": "98.6 °F",
                "vitals_spo2": "99 %",
                "vitals_weight": "58 kg",
                "status": "waiting"
            },
            "labs": [],
            "past_consults": [
                {
                    "visit_date": "2026-07-22",
                    "visit_type": "Neurology Outpatient",
                    "chief_complaint": "Recurrent migraine attacks (3 per month)",
                    "diagnosis": "Episodic Migraine with Visual Aura",
                    "treatment_plan": "Prescribed Triptan abortive therapy, sleep hygiene coaching.",
                    "clinical_notes": "Fundoscopy normal. No SNOOP red flags."
                }
            ],
            "followup": {
                "due_date": "2026-10-18",
                "reason": "Evaluate prophylactic therapy (Propranolol / Topiramate) if frequency persists",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-005",
            "name": "David Miller",
            "age": 37,
            "sex": "Male",
            "blood_group": "O-",
            "contact": "+1 (555) 015-8291",
            "email": "david.miller.fictional@example.com",
            "address": "510 Maple Crest Ave, Springfield",
            "emergency_contact": "Sarah Miller (Spouse) - +1 (555) 015-8292",
            "symptom": {
                "main_symptom": "Epigastric burning discomfort and postprandial acidity",
                "duration": "10 days",
                "severity": "Moderate",
                "associated_symptoms": "Sour eructation, early fullness, nausea without emesis",
                "onset": "Gradual worsening after heavy coffee intake and irregular meals",
                "observations": "Tenderness on deep palpation in epigastrium, non-distended, bowel sounds active."
            },
            "history": {
                "previous_diseases": "Mild GERD (2023)",
                "previous_surgeries": "None",
                "chronic_conditions": "None",
                "family_history": "Father had peptic ulcer disease",
                "previous_relevant_episodes": "Dyspepsia episodes after NSAID use for sprains"
            },
            "medications": [
                {"name": "Antacid Chewable Tablets", "dose": "2 tablets", "frequency": "PRN after meals", "duration": "PRN", "is_current": True}
            ],
            "allergies": [],
            "appointment": {
                "complaint": "Epigastric burning discomfort & acid reflux (10 days)",
                "priority": "Routine",
                "waiting_time_minutes": 32,
                "vitals_bp": "122/80 mmHg",
                "vitals_hr": "72 bpm",
                "vitals_temp": "98.4 °F",
                "vitals_spo2": "98 %",
                "vitals_weight": "77 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Complete Blood Count & H. pylori Serology",
                    "report_type": "Blood Test",
                    "file_name": "CBC_David_Miller_Oct2026.pdf",
                    "summary_findings": "Normal blood count, no occult anemia detected.",
                    "results": [
                        {"test_name": "Hemoglobin", "value": "15.1", "unit": "g/dL", "reference_range": "13.0 - 17.5 g/dL", "flag": "normal", "interpretation": "Normal"},
                        {"test_name": "WBC", "value": "6800", "unit": "/µL", "reference_range": "4000 - 11000 /µL", "flag": "normal", "interpretation": "Normal"}
                    ]
                }
            ],
            "past_consults": [],
            "followup": {
                "due_date": "2026-10-25",
                "reason": "14-day review on PPI (Pantoprazole 40mg)",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-006",
            "name": "Sarah Jenkins (Patient)",
            "age": 34,
            "sex": "Female",
            "blood_group": "B-",
            "contact": "+1 (555) 014-9912",
            "email": "sarah.j.patient.fictional@example.com",
            "address": "902 Cedar Lane, Springfield",
            "emergency_contact": "Michael Jenkins (Spouse) - +1 (555) 014-9913",
            "symptom": {
                "main_symptom": "Acute dysuria, urinary frequency and burning",
                "duration": "2 days",
                "severity": "Moderate",
                "associated_symptoms": "Suprapubic discomfort, feeling of incomplete bladder voiding, low-grade fever feeling",
                "onset": "Sudden onset 48 hours ago",
                "observations": "Mild suprapubic tenderness on palpation, no costovertebral angle tenderness, afebrile."
            },
            "history": {
                "previous_diseases": "Recurrent uncomplicated cystitis (2023)",
                "previous_surgeries": "None",
                "chronic_conditions": "None",
                "family_history": "Unremarkable",
                "previous_relevant_episodes": "Previous UTI resolved with Nitrofurantoin"
            },
            "medications": [],
            "allergies": [
                {"allergen": "Ciprofloxacin", "reaction": "Tendon pain & nausea", "severity": "Moderate"}
            ],
            "appointment": {
                "complaint": "Acute dysuria, frequency, and suprapubic pain (2 days)",
                "priority": "High",
                "waiting_time_minutes": 8,
                "vitals_bp": "116/74 mmHg",
                "vitals_hr": "80 bpm",
                "vitals_temp": "99.1 °F",
                "vitals_spo2": "99 %",
                "vitals_weight": "62 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Urinalysis Dipstick & Microscopic Analysis",
                    "report_type": "Urinalysis",
                    "file_name": "Urine_Sarah_Jenkins_Oct2026.pdf",
                    "summary_findings": "Leukocyte esterase positive, Nitrites positive, Pyuria noted (WBC 25-30/HPF). Consistent with acute cystitis.",
                    "results": [
                        {"test_name": "Urine Leukocyte Esterase", "value": "Positive (++)", "unit": "-", "reference_range": "Negative", "flag": "high", "interpretation": "Abnormal pyuria"},
                        {"test_name": "Urine Nitrites", "value": "Positive (+)", "unit": "-", "reference_range": "Negative", "flag": "high", "interpretation": "Indicates presence of Gram-negative bacteriuria"},
                        {"test_name": "Urine RBC", "value": "4-6", "unit": "/HPF", "reference_range": "0 - 3 /HPF", "flag": "high", "interpretation": "Microscopic hematuria"}
                    ]
                }
            ],
            "past_consults": [],
            "followup": {
                "due_date": "2026-10-12",
                "reason": "Urine culture verification & symptom resolution check",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-007",
            "name": "Lucas Silva",
            "age": 24,
            "sex": "Male",
            "blood_group": "A-",
            "contact": "+1 (555) 013-4421",
            "email": "lucas.silva.fictional@example.com",
            "address": "67 University Boulevard, Springfield",
            "emergency_contact": "Camila Silva (Mother) - +1 (555) 013-4422",
            "symptom": {
                "main_symptom": "Pruritic erythematous rash and eczema flare on forearms",
                "duration": "1 week",
                "severity": "Mild",
                "associated_symptoms": "Intense itching at night, dry flaking skin patches, excoriation marks",
                "onset": "Subacute following usage of new laundry detergent",
                "observations": "Well-demarcated erythematous papules and plaques across bilateral flexor surfaces of forearms."
            },
            "history": {
                "previous_diseases": "Atopic dermatitis and allergic rhinitis since childhood",
                "previous_surgeries": "None",
                "chronic_conditions": "Atopic Eczema",
                "family_history": "Atopy in both parents",
                "previous_relevant_episodes": "Seasonal eczema flares in autumn"
            },
            "medications": [
                {"name": "Cetirizine 10mg", "dose": "1 tablet", "frequency": "Once daily as needed", "duration": "PRN", "is_current": True}
            ],
            "allergies": [
                {"allergen": "Nickel & Synthetic Fragrances", "reaction": "Contact dermatitis", "severity": "Mild"}
            ],
            "appointment": {
                "complaint": "Itchy red rash across bilateral forearms (1 week)",
                "priority": "Routine",
                "waiting_time_minutes": 40,
                "vitals_bp": "118/78 mmHg",
                "vitals_hr": "70 bpm",
                "vitals_temp": "98.6 °F",
                "vitals_spo2": "99 %",
                "vitals_weight": "68 kg",
                "status": "waiting"
            },
            "labs": [],
            "past_consults": [],
            "followup": {
                "due_date": "2026-10-28",
                "reason": "Topical corticosteroid response check",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-008",
            "name": "Amina Yusuf",
            "age": 22,
            "sex": "Female",
            "blood_group": "O+",
            "contact": "+1 (555) 012-7788",
            "email": "amina.yusuf.fictional@example.com",
            "address": "14 Kensington Court, Springfield",
            "emergency_contact": "Fatima Yusuf (Sister) - +1 (555) 012-7789",
            "symptom": {
                "main_symptom": "High grade fever, severe retro-orbital headache, body aches",
                "duration": "3 days",
                "severity": "Critical",
                "associated_symptoms": "Profound joint and muscular pains ('break-bone'), anorexia, nausea, petechial rash on shins",
                "onset": "Abrupt sudden fever spike to 102.8°F 3 days ago",
                "observations": "Flushed facies, toxic look, faint petechiae over lower extremities. Capillary refill < 2s."
            },
            "history": {
                "previous_diseases": "None",
                "previous_surgeries": "None",
                "chronic_conditions": "None",
                "family_history": "Non-contributory",
                "previous_relevant_episodes": "Recent travel to endemic arboviral tropical zone 10 days ago"
            },
            "medications": [],
            "allergies": [],
            "appointment": {
                "complaint": "High fever (102.8°F), retro-orbital eye pain, petechiae on shins",
                "priority": "Urgent",
                "waiting_time_minutes": 5,
                "vitals_bp": "106/70 mmHg",
                "vitals_hr": "104 bpm",
                "vitals_temp": "102.8 °F",
                "vitals_spo2": "97 %",
                "vitals_weight": "54 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Emergency Febrile & Thrombocytopenia Workup",
                    "report_type": "Blood Test",
                    "file_name": "Febrile_Amina_Yusuf_Oct2026.pdf",
                    "summary_findings": "Marked thrombocytopenia (Platelets 78,000 /µL) and leukopenia. Dengue NS1 antigen positive.",
                    "results": [
                        {"test_name": "Platelets", "value": "78000", "unit": "/µL", "reference_range": "150000 - 450000 /µL", "flag": "critical", "interpretation": "Critical Thrombocytopenia requiring serial monitoring"},
                        {"test_name": "WBC", "value": "3100", "unit": "/µL", "reference_range": "4000 - 11000 /µL", "flag": "low", "interpretation": "Leukopenia typical in viral infection"},
                        {"test_name": "Hemoglobin", "value": "13.8", "unit": "g/dL", "reference_range": "12.0 - 16.0 g/dL", "flag": "normal", "interpretation": "Watch hematocrit for hemoconcentration"},
                        {"test_name": "Dengue NS1 Antigen", "value": "Reactive / Positive", "unit": "-", "reference_range": "Non-Reactive", "flag": "critical", "interpretation": "Acute Dengue Virus Infection confirmed"}
                    ]
                }
            ],
            "past_consults": [],
            "followup": {
                "due_date": "2026-10-08",
                "reason": "Mandatory 24-hour platelet & hematocrit monitoring in Day Care Unit",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-009",
            "name": "Thomas Wright",
            "age": 46,
            "sex": "Male",
            "blood_group": "B+",
            "contact": "+1 (555) 011-6632",
            "email": "thomas.wright.fictional@example.com",
            "address": "77 Westwood Meadows, Springfield",
            "emergency_contact": "Diane Wright (Spouse) - +1 (555) 011-6633",
            "symptom": {
                "main_symptom": "Exertional shortness of breath and nighttime wheezing",
                "duration": "2 weeks",
                "severity": "Moderate",
                "associated_symptoms": "Dry paroxysmal cough waking patient at 3 AM, chest tightness on climbing stairs",
                "onset": "Gradual progression with onset of autumn cold weather",
                "observations": "Prolonged expiratory phase, bilateral scattered musical wheezing on forced expiration."
            },
            "history": {
                "previous_diseases": "Bronchial Asthma diagnosed 15 years ago, Allergic Rhinitis",
                "previous_surgeries": "None",
                "chronic_conditions": "Moderate Persistent Asthma",
                "family_history": "Paternal asthma and allergic eczema",
                "previous_relevant_episodes": "ER visit in 2022 for asthma attack requiring nebulization"
            },
            "medications": [
                {"name": "Budesonide / Formoterol DPI", "dose": "200/6 mcg", "frequency": "1 inhalation twice daily", "duration": "Chronic", "is_current": True},
                {"name": "Montelukast", "dose": "10 mg", "frequency": "Once daily at night", "duration": "Chronic", "is_current": True}
            ],
            "allergies": [
                {"allergen": "Dust mites & Cat dander", "reaction": "Acute bronchospasm", "severity": "Severe"}
            ],
            "appointment": {
                "complaint": "Nighttime wheezing, nocturnal cough & exertional dyspnea (2 wks)",
                "priority": "High",
                "waiting_time_minutes": 22,
                "vitals_bp": "124/82 mmHg",
                "vitals_hr": "84 bpm",
                "vitals_temp": "98.4 °F",
                "vitals_spo2": "95 %",
                "vitals_weight": "80 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Spirometry & Eosinophil Count",
                    "report_type": "Pulmonary Function",
                    "file_name": "PFT_Thomas_Wright_Oct2026.pdf",
                    "summary_findings": "FEV1 68% predicted with 15% post-bronchodilator reversibility confirming reversible obstructive airway defect.",
                    "results": [
                        {"test_name": "FEV1 / FVC Ratio", "value": "64", "unit": "%", "reference_range": "75 - 85 %", "flag": "low", "interpretation": "Obstructive ventilatory impairment"},
                        {"test_name": "Absolute Eosinophil Count (AEC)", "value": "540", "unit": "/µL", "reference_range": "20 - 400 /µL", "flag": "high", "interpretation": "Peripheral eosinophilia suggestive of atopic airway drive"}
                    ]
                }
            ],
            "past_consults": [
                {
                    "visit_date": "2026-03-05",
                    "visit_type": "Pulmonology Follow-up",
                    "chief_complaint": "Asthma control test check",
                    "diagnosis": "Bronchial Asthma Controlled",
                    "treatment_plan": "Continue current inhaler therapy. Peak flow diary recommended.",
                    "clinical_notes": "Well controlled ACT score 22/25. Clear chest."
                }
            ],
            "followup": {
                "due_date": "2026-10-22",
                "reason": "Check inhaler adherence and peak flow diary after stepping up therapy",
                "status": "pending"
            }
        },
        {
            "mrn": "MED-2026-010",
            "name": "Eleanor Vance (Patient)",
            "age": 51,
            "sex": "Female",
            "blood_group": "A+",
            "contact": "+1 (555) 010-5544",
            "email": "eleanor.vance.fictional@example.com",
            "address": "15 Heritage Boulevard, Springfield",
            "emergency_contact": "James Vance (Spouse) - +1 (555) 010-5545",
            "symptom": {
                "main_symptom": "Annual executive health review & general wellness check",
                "duration": "Routine",
                "severity": "Mild",
                "associated_symptoms": "No acute complaints; reports slight stress-related insomnia",
                "onset": "Scheduled preventive visit",
                "observations": "Well-nourished, energetic, cardiovascular and respiratory examinations normal."
            },
            "history": {
                "previous_diseases": "None",
                "previous_surgeries": "None",
                "chronic_conditions": "None",
                "family_history": "Mother had breast cancer at age 62; Father had mild CAD",
                "previous_relevant_episodes": "Regular routine checkups every 12 months"
            },
            "medications": [
                {"name": "Vitamin D3 1000 IU", "dose": "1 capsule", "frequency": "Once daily", "duration": "Dietary supplement", "is_current": True}
            ],
            "allergies": [],
            "appointment": {
                "complaint": "Annual routine health assessment & screening review",
                "priority": "Routine",
                "waiting_time_minutes": 15,
                "vitals_bp": "118/76 mmHg",
                "vitals_hr": "68 bpm",
                "vitals_temp": "98.6 °F",
                "vitals_spo2": "99 %",
                "vitals_weight": "63 kg",
                "status": "waiting"
            },
            "labs": [
                {
                    "title": "Annual Executive Health Laboratory Panel",
                    "report_type": "Blood Test",
                    "file_name": "Executive_Eleanor_Vance_Oct2026.pdf",
                    "summary_findings": "Fasting lipids within optimal range. Normal renal and hepatic panels.",
                    "results": [
                        {"test_name": "Total Cholesterol", "value": "178", "unit": "mg/dL", "reference_range": "120 - 200 mg/dL", "flag": "normal", "interpretation": "Optimal"},
                        {"test_name": "Fasting Blood Sugar", "value": "88", "unit": "mg/dL", "reference_range": "70 - 100 mg/dL", "flag": "normal", "interpretation": "Normal fasting glucose"},
                        {"test_name": "Hemoglobin", "value": "13.6", "unit": "g/dL", "reference_range": "12.0 - 16.0 g/dL", "flag": "normal", "interpretation": "Normal"},
                        {"test_name": "Serum Creatinine", "value": "0.8", "unit": "mg/dL", "reference_range": "0.6 - 1.2 mg/dL", "flag": "normal", "interpretation": "Normal"}
                    ]
                }
            ],
            "past_consults": [],
            "followup": {
                "due_date": "2027-10-07",
                "reason": "Annual preventive screening and mammography follow-up",
                "status": "pending"
            }
        }
    ]

    for pdata in patients_data:
        patient_uid = patient_akhil_user.id if pdata["mrn"] == "MED-2026-001" else None
        patient = Patient(
            user_id=patient_uid,
            mrn=pdata["mrn"],
            name=pdata["name"],
            age=pdata["age"],
            sex=pdata["sex"],
            blood_group=pdata["blood_group"],
            contact=pdata["contact"],
            email=pdata["email"],
            address=pdata["address"],
            emergency_contact=pdata["emergency_contact"],
            intake_status="submitted" if pdata["mrn"] == "MED-2026-001" else "reviewed"
        )
        db.add(patient)
        db.commit()

        # Symptoms
        sdata = pdata["symptom"]
        symptom = Symptom(
            patient_id=patient.id,
            main_symptom=sdata["main_symptom"],
            duration=sdata["duration"],
            severity=sdata["severity"],
            associated_symptoms=sdata["associated_symptoms"],
            onset=sdata["onset"],
            observations=sdata["observations"]
        )
        db.add(symptom)

        # Medical History
        hdata = pdata["history"]
        history = MedicalHistory(
            patient_id=patient.id,
            previous_diseases=hdata["previous_diseases"],
            previous_surgeries=hdata["previous_surgeries"],
            chronic_conditions=hdata["chronic_conditions"],
            family_history=hdata["family_history"],
            previous_relevant_episodes=hdata["previous_relevant_episodes"]
        )
        db.add(history)

        # Medications
        for m in pdata.get("medications", []):
            med = Medication(
                patient_id=patient.id,
                name=m["name"],
                dose=m["dose"],
                frequency=m["frequency"],
                duration=m["duration"],
                is_current=m["is_current"]
            )
            db.add(med)

        # Allergies
        for a in pdata.get("allergies", []):
            alg = Allergy(
                patient_id=patient.id,
                allergen=a["allergen"],
                reaction=a["reaction"],
                severity=a["severity"]
            )
            db.add(alg)

        # Appointment
        apt_data = pdata["appointment"]
        appointment = Appointment(
            patient_id=patient.id,
            doctor_id=doctor_patel.id,
            complaint=apt_data["complaint"],
            priority=apt_data["priority"],
            waiting_time_minutes=apt_data["waiting_time_minutes"],
            vitals_bp=apt_data["vitals_bp"],
            vitals_hr=apt_data["vitals_hr"],
            vitals_temp=apt_data["vitals_temp"],
            vitals_spo2=apt_data["vitals_spo2"],
            vitals_weight=apt_data["vitals_weight"],
            status=apt_data["status"]
        )
        db.add(appointment)

        # Lab Reports & Results
        for rdata in pdata.get("labs", []):
            lab_rep = LabReport(
                patient_id=patient.id,
                title=rdata["title"],
                report_type=rdata["report_type"],
                file_name=rdata["file_name"],
                summary_findings=rdata["summary_findings"],
                processed_status="Processed"
            )
            db.add(lab_rep)
            db.commit()

            for res in rdata.get("results", []):
                lab_res = LabResult(
                    report_id=lab_rep.id,
                    patient_id=patient.id,
                    test_name=res["test_name"],
                    value=res["value"],
                    unit=res["unit"],
                    reference_range=res["reference_range"],
                    flag=res["flag"],
                    interpretation=res["interpretation"]
                )
                db.add(lab_res)

        # Past consultations
        for cdata in pdata.get("past_consults", []):
            past_consult = Consultation(
                patient_id=patient.id,
                doctor_id=doctor_patel.id,
                visit_date=cdata["visit_date"],
                visit_type=cdata["visit_type"],
                chief_complaint=cdata["chief_complaint"],
                diagnosis=cdata["diagnosis"],
                treatment_plan=cdata["treatment_plan"],
                clinical_notes=cdata["clinical_notes"],
                status="completed"
            )
            db.add(past_consult)

        # Followups
        if "followup" in pdata:
            fdata = pdata["followup"]
            flw = Followup(
                patient_id=patient.id,
                doctor_id=doctor_patel.id,
                due_date=fdata["due_date"],
                reason=fdata["reason"],
                status=fdata["status"]
            )
            db.add(flw)

        db.commit()

    # Pre-seed sample audit logs
    audit_samples = [
        AuditLog(
            user_id=dr_patel_user.id,
            user_name="Dr. Arun Patel",
            user_role="doctor",
            patient_id=1,
            patient_name="Akhil Menon",
            action="Viewed Patient Record",
            details="Opened clinical chart and reviewed lab report CBC_Akhil_Menon_Oct2026.pdf"
        ),
        AuditLog(
            user_id=dr_patel_user.id,
            user_name="Dr. Arun Patel",
            user_role="doctor",
            patient_id=1,
            patient_name="Akhil Menon",
            action="Generated AI Assessment",
            details="Requested Clinical AI Assistant differential analysis and red flags evaluation"
        ),
        AuditLog(
            user_id=receptionist_user.id,
            user_name="Elena Vance",
            user_role="receptionist",
            patient_id=8,
            patient_name="Amina Yusuf",
            action="Patient Registration & Triage",
            details="Registered emergency triage with priority URGENT (temp 102.8°F)"
        )
    ]
    db.add_all(audit_samples)
    db.commit()

    print("Demo dataset seeded successfully! (10 realistic fictional patients with clinical charts)")
