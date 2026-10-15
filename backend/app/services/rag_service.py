from typing import List, Dict, Any

CLINICAL_KNOWLEDGE_BASE = [
    {
        "id": "guideline-resp-01",
        "guideline": "NICE NG138 - Pneumonia in adults: diagnosis and management",
        "condition": "Respiratory / Community-Acquired Pneumonia & Bronchitis",
        "keywords": ["cough", "fever", "sputum", "wbc", "crepitations", "shortness of breath", "dyspnea", "chest"],
        "content": (
            "For patients presenting with persistent productive cough, fever (>38°C), and tachypnea, "
            "assess CRB65 score. Elevated WBC (>12,000/µL) and CRP warrants chest radiography to rule out consolidation. "
            "Antibiotic therapy should only be commenced if bacterial etiology is confirmed or strongly suspected. "
            "Supportive hydration, paracetamol for pyrexia, and pulse oximetry monitoring are standard."
        ),
        "red_flags": [
            "Resting SpO2 < 92%",
            "Respiratory rate > 30 breaths/min",
            "Systolic BP < 90 mmHg",
            "New onset confusion or cyanosis"
        ],
        "suggested_tests": ["Complete Blood Count (CBC)", "C-Reactive Protein (CRP)", "Chest X-Ray (PA view)", "Sputum Culture"],
        "management_considerations": ["Supportive hydration & rest", "Antipyretic therapy (Paracetamol)", "Review in 48-72 hours or immediately if SpO2 drops"]
    },
    {
        "id": "guideline-endo-02",
        "guideline": "ADA Standards of Care 2026 - Glycemic Targets & Microvascular Complications",
        "condition": "Type 2 Diabetes Mellitus & Metabolic Monitoring",
        "keywords": ["diabetes", "glucose", "hba1c", "polyuria", "polydipsia", "neuropathy", "metformin", "sugar"],
        "content": (
            "Target HbA1c for non-pregnant adults is generally < 7.0% without significant hypoglycemia. "
            "Annual screening for nephropathy (urine albumin-to-creatinine ratio) and retinopathy is indicated. "
            "First-line pharmacotherapy typically centers on Metformin combined with lifestyle interventions. "
            "Renal function (eGFR) and liver profile must be periodically reassessed."
        ),
        "red_flags": [
            "Random blood glucose > 300 mg/dL with ketonuria",
            "Severe hypoglycemia (< 54 mg/dL)",
            "Kussmaul breathing or suspected DKA / HHS"
        ],
        "suggested_tests": ["Fasting Blood Sugar & Postprandial", "HbA1c Glycated Hemoglobin", "Urine Microalbumin/Creatinine Ratio", "Serum Creatinine / eGFR"],
        "management_considerations": ["Dietary glycemic control", "Daily foot inspection", "Medication titration under physician review"]
    },
    {
        "id": "guideline-cardio-03",
        "guideline": "ACC/AHA 2025 Guideline for the Prevention and Management of Hypertension",
        "condition": "Essential Hypertension & Cardiovascular Risk",
        "keywords": ["hypertension", "blood pressure", "headache", "dizziness", "chest pain", "edema", "bp"],
        "content": (
            "Stage 2 Hypertension defined as SBP ≥ 140 or DBP ≥ 90 mmHg. Confirm with ambulatory or repeated seated measurements. "
            "Assess for target organ damage including ECG for left ventricular hypertrophy and basic metabolic panel. "
            "Sodium restriction (< 2,000 mg/day) and DASH dietary pattern recommended alongside pharmacotherapy."
        ),
        "red_flags": [
            "Blood pressure > 180/120 mmHg with acute target organ symptoms (headache, vision changes, chest pain)",
            "Suspected hypertensive crisis / emergency"
        ],
        "suggested_tests": ["12-Lead Electrocardiogram (ECG)", "Serum Electrolytes & Creatinine", "Lipid Profile Panel", "Urinalysis for Proteinuria"],
        "management_considerations": ["DASH diet & sodium restriction", "Home BP log twice daily", "Review antihypertensive compliance"]
    },
    {
        "id": "guideline-neuro-04",
        "guideline": "AHS / EFNS Consensus Guidelines on Primary Headache Disorders",
        "condition": "Migraine with/without Aura & Tension-type Headache",
        "keywords": ["headache", "migraine", "photophobia", "nausea", "throbbing", "aura", "unilateral"],
        "content": (
            "Recurrent unilateral throbbing headache lasting 4-72 hours, exacerbated by physical activity and associated with nausea, "
            "photophobia, or phonophobia is consistent with migraine. Red flags (SNOOP criteria) must be excluded to rule out secondary causes."
        ),
        "red_flags": [
            "Sudden thunderclap onset ('worst headache of life')",
            "Focal neurological deficits",
            "Headache with fever and neck stiffness (meningism)"
        ],
        "suggested_tests": ["Fundoscopy examination", "Non-contrast Brain MRI/CT if red flags present"],
        "management_considerations": ["Quiet dark room rest", "Early acute therapy at pain onset", "Hydration and trigger avoidance (sleep, caffeine)"]
    },
    {
        "id": "guideline-gastro-05",
        "guideline": "ACG Clinical Guideline: Management of Dyspepsia and Peptic Ulcer Disease",
        "condition": "Dyspepsia, GERD, and Acute Gastritis",
        "keywords": ["gastritis", "epigastric", "heartburn", "acid", "reflux", "vomiting", "stomach pain", "nausea"],
        "content": (
            "Upper abdominal pain, early satiety, or retrosternal burning. Evaluate for H. pylori infection in high-prevalence settings. "
            "Avoid NSAIDs and trigger foods. Short course of proton pump inhibitor (PPI) or H2RA is frequently considered."
        ),
        "red_flags": [
            "Hematemesis (coffee ground emesis) or melena",
            "Unexplained weight loss > 10%",
            "Progressive dysphagia or recurrent vomiting"
        ],
        "suggested_tests": ["H. pylori Stool Antigen Test", "Complete Blood Count for Anemia", "Upper GI Endoscopy if alarm symptoms present"],
        "management_considerations": ["Small frequent non-spicy meals", "Elevation of bed head for GERD", "Discontinuation of offending NSAIDs"]
    },
    {
        "id": "guideline-uro-06",
        "guideline": "EAU Guidelines on Urological Infections",
        "condition": "Uncomplicated Urinary Tract Infection (Cystitis)",
        "keywords": ["dysuria", "urinary", "frequency", "burning urination", "hematuria", "flank pain", "fever"],
        "content": (
            "Acute dysuria, urinary frequency, and suprapubic discomfort in non-pregnant females strongly suggests uncomplicated cystitis. "
            "Fever, rigors, or flank pain suggest upper tract involvement (acute pyelonephritis)."
        ),
        "red_flags": [
            "High fever with flank tenderness (Costovertebral angle)",
            "Hemodynamic instability / Urosepsis signs",
            "Urinary retention"
        ],
        "suggested_tests": ["Urinalysis (Dipstick for Nitrites & Leukocyte Esterase)", "Urine Microscopy and Culture Sensitivity"],
        "management_considerations": ["Copious oral hydration (2-3 L/day)", "Urinary alkalizers if indicated", "Empiric antibiotic therapy based on local antibiogram"]
    }
]

class ClinicalRAGService:
    """
    RAG Architecture retrieval module for trusted clinical guidelines.
    Prioritizes accredited medical standards (NICE, CDC, WHO, AHA, ADA)
    over unverified content.
    """

    def retrieve_relevant_guidelines(self, query_text: str, top_k: int = 2) -> List[Dict[str, Any]]:
        query_lower = query_text.lower()
        scored_guidelines = []

        for item in CLINICAL_KNOWLEDGE_BASE:
            score = 0
            # Keyword matching
            for kw in item["keywords"]:
                if kw in query_lower:
                    score += 2
            
            # Substring matching in content
            words = query_lower.split()
            for word in words:
                if len(word) > 3 and word in item["content"].lower():
                    score += 1

            if score > 0:
                scored_guidelines.append((score, item))

        # Sort by relevance score
        scored_guidelines.sort(key=lambda x: x[0], reverse=True)
        top_results = [item for score, item in scored_guidelines[:top_k]]
        
        # If no specific match found, return the top respiratory / general internal guideline
        if not top_results:
            top_results = [CLINICAL_KNOWLEDGE_BASE[0]]
            
        return top_results

rag_service = ClinicalRAGService()
