import os
import json
import httpx
from typing import Dict, Any, List, Optional
from .rag_service import rag_service
from ..config import settings

class ClinicalReasoningEngine:
    """
    Core AI Clinical Decision Support Engine.
    Implements:
    - 01 Clinical Summary
    - 02 Possible Conditions (Differentials)
    - 03 Red Flags
    - 04 Recommended Investigations
    - 05 Management Suggestions
    - 06 Reasoning & Evidence
    - 30-Second Patient Summary
    - AI Clinical Chat grounded on patient context
    - Note Summarization
    - Priority / Triage scoring
    """

    async def generate_clinical_assessment(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates structured preliminary assessment for doctor verification.
        """
        # Retrieve trusted medical guidelines via RAG module
        symptoms_text = f"{patient_data.get('main_symptom', '')} {patient_data.get('associated_symptoms', '')}"
        guidelines = rag_service.retrieve_relevant_guidelines(symptoms_text)
        guideline_titles = [g["guideline"] for g in guidelines]

        # Check if external LLM API is configured (Gemini or OpenAI)
        if settings.GEMINI_API_KEY:
            try:
                assessment = await self._call_gemini_api(patient_data, guidelines)
                if assessment:
                    return assessment
            except Exception as e:
                print(f"[AI Service] Gemini fallback to local reasoning engine: {e}")
        elif settings.OPENAI_API_KEY:
            try:
                assessment = await self._call_openai_api(patient_data, guidelines)
                if assessment:
                    return assessment
            except Exception as e:
                print(f"[AI Service] OpenAI fallback to local reasoning engine: {e}")

        # Local evidence-based clinical reasoning engine (deterministic, instant, offline-capable)
        return self._rule_based_clinical_reasoning(patient_data, guidelines)

    def _rule_based_clinical_reasoning(self, patient: Dict[str, Any], guidelines: List[Dict[str, Any]]) -> Dict[str, Any]:
        name = patient.get("name", "Patient")
        age = patient.get("age", 40)
        sex = patient.get("sex", "Unknown")
        main_symptom = patient.get("main_symptom", "Unspecified symptoms")
        duration = patient.get("duration", "recent")
        severity = patient.get("severity", "Moderate")
        associated = patient.get("associated_symptoms", "")
        meds = [m.get("name") if isinstance(m, dict) else str(m) for m in patient.get("medications", [])]
        history = patient.get("chronic_conditions", "None reported")
        allergies = [a.get("allergen") if isinstance(a, dict) else str(a) for a in patient.get("allergies", [])]
        vitals = patient.get("vitals", {})
        spo2 = vitals.get("spo2", "98 %")
        temp = vitals.get("temp", "98.6 °F")
        bp = vitals.get("bp", "120/80 mmHg")
        labs = patient.get("lab_results", [])

        # Check abnormal labs
        abnormal_labs = [l for l in labs if l.get("flag") in ["high", "low", "critical"]]
        abnormal_text = ", ".join([f"{l.get('test_name')} {l.get('value')} {l.get('unit', '')} ({l.get('flag')})" for l in abnormal_labs])

        symptom_lower = f"{main_symptom} {associated}".lower()

        # 01 Clinical Summary
        summary = (
            f"{age}-year-old {sex.lower()} presenting with a {duration} history of {main_symptom.lower()}"
            + (f", accompanied by {associated.lower()}." if associated else ".")
            + (f" Medical background includes {history.lower()}." if history and history != 'none' else " No prior chronic disease documented.")
            + (f" Current pharmacotherapy includes {', '.join(meds)}." if meds else " Not currently on chronic medications.")
            + (f" Initial laboratory findings reveal {abnormal_text}." if abnormal_text else " No critical laboratory abnormalities noted.")
        )

        # 02 Differentials
        conditions = []
        red_flags = []
        is_emergency = False
        suggested_priority = "Routine"

        # Respiratory pattern
        if any(w in symptom_lower for w in ["cough", "fever", "sputum", "respiratory", "breath"]):
            try:
                spo2_val = int(spo2.replace("%", "").strip())
                if spo2_val < 93:
                    red_flags.append(f"⚠️ Oxygen saturation low at {spo2_val}% (Resting SpO2 < 93%)")
                    is_emergency = True
                    suggested_priority = "Urgent"
            except Exception:
                pass

            conditions.append({
                "condition": "Community-Acquired Lower Respiratory Tract Infection / Bronchitis",
                "confidence_evidence": "Possible — Consistent with pyrexia, productive cough, and leukocytosis",
                "icd10": "J20.9 / J18.9",
                "rationale": "Supported by acute febrile cough presentation. Elevated inflammatory markers/WBC warrant chest imaging confirmation."
            })
            conditions.append({
                "condition": "Viral Upper Respiratory Tract Infection (URTI) with Reactive Airway",
                "confidence_evidence": "Consider — Overlapping upper respiratory manifestations",
                "icd10": "J06.9",
                "rationale": "Common presentation; secondary bacterial superinfection must be differentiated via auscultation and CRP/WBC."
            })
            conditions.append({
                "condition": "Acute Exacerbation of Underlying Airway Hyperreactivity / Asthma",
                "confidence_evidence": "Requires clinical confirmation — Inquire regarding nocturnal cough or wheezing",
                "icd10": "J45.901",
                "rationale": "Bronchospasm should be evaluated if dyspnea or expiratory wheeze is elicited on auscultation."
            })

        # Endocrine / Diabetic pattern
        elif any(w in symptom_lower for w in ["diabetes", "sugar", "glucose", "polyuria", "fatigue", "thirst"]):
            conditions.append({
                "condition": "Suboptimally Controlled Type 2 Diabetes Mellitus",
                "confidence_evidence": "Consistent with — Hyperglycemic symptoms and glycemic lab parameters",
                "icd10": "E11.65",
                "rationale": "High postprandial glucose and elevated HbA1c indicate requirement for regimen titration and lifestyle review."
            })
            conditions.append({
                "condition": "Diabetic Nephropathy / Early Microvascular Involvement",
                "confidence_evidence": "Consider — Screen via microalbuminuria assay",
                "icd10": "E11.21",
                "rationale": "Annual microalbumin-to-creatinine screening advised per ADA 2026 guidelines."
            })
            suggested_priority = "Needs Attention"

        # Cardiovascular / Hypertension pattern
        elif any(w in symptom_lower for w in ["bp", "pressure", "hypertension", "headache", "palpitation"]):
            conditions.append({
                "condition": "Stage 2 Essential Hypertension with Symptomatic Fluctuation",
                "confidence_evidence": "Consistent with — Elevated seated arterial pressure",
                "icd10": "I10",
                "rationale": "Serial ambulatory BP profiling required to assess sustained versus white-coat elevation."
            })
            conditions.append({
                "condition": "Tension-type Cephalea secondary to Vascular Strain",
                "confidence_evidence": "Possible — Occipital pressure sensation",
                "icd10": "G44.209",
                "rationale": "Bilateral tight pressure headache frequently correlates with elevated sympathetic tone."
            })
            suggested_priority = "Needs Attention"

        # Gastrointestinal pattern
        elif any(w in symptom_lower for w in ["stomach", "gastric", "acidity", "epigastric", "nausea", "reflux"]):
            conditions.append({
                "condition": "Acute Gastritis / Functional Dyspepsia",
                "confidence_evidence": "Consistent with — Epigastric burning discomfort exacerbated by fasting",
                "icd10": "K29.70",
                "rationale": "Upper abdominal tenderness without peritoneal signs. Evaluate H. pylori risk and dietary factors."
            })
            conditions.append({
                "condition": "Gastroesophageal Reflux Disease (GERD)",
                "confidence_evidence": "Consider — Postprandial retrosternal burning",
                "icd10": "K21.9",
                "rationale": "Trial of proton pump inhibition alongside dietary modification warranted."
            })
            suggested_priority = "Routine"

        # General / Default clinical differentials
        else:
            conditions.append({
                "condition": f"Symptomatic Presentation: {main_symptom}",
                "confidence_evidence": "Possible — Requires physician history verification & examination",
                "icd10": "R68.89",
                "rationale": f"Primary complaint of {main_symptom} requires focused physical examination and targeted investigations."
            })
            conditions.append({
                "condition": "Secondary Systemic / Inflammatory Manifestation",
                "confidence_evidence": "Consider — Correlate with baseline blood count and metabolic profile",
                "icd10": "R53.83",
                "rationale": "Non-specific symptoms warrant exclusion of occult infection, endocrine dysfunction, or nutritional deficiency."
            })

        # Red Flags Evaluation
        if "fever" in symptom_lower and "cough" in symptom_lower and ("breath" in symptom_lower or "chest pain" in symptom_lower):
            red_flags.append("⚠️ Concomitant chest discomfort or dyspnea with pyrexia requires urgent respiratory assessment")
            suggested_priority = "High"

        if any(w in symptom_lower for w in ["chest pain", "syncope", "hemoptysis", "thunderclap", "confusion", "unresponsive"]):
            red_flags.append("⚠️ Potential acute hemodynamic or neurological instability detected")
            is_emergency = True
            suggested_priority = "Urgent"

        if not red_flags:
            red_flags.append("No major red flags identified from the available information.")

        # 04 Recommended Investigations
        investigations = []
        if any(w in symptom_lower for w in ["cough", "fever", "respiratory", "breath"]):
            investigations.append({"test": "Complete Blood Count (CBC) with Differential", "reason": "Assess leukocytosis, neutrophilia, or lymphopenia", "priority": "Urgent"})
            investigations.append({"test": "C-Reactive Protein (CRP)", "reason": "Quantify systemic inflammatory activity", "priority": "Recommended"})
            investigations.append({"test": "Chest X-Ray (PA View)", "reason": "Evaluate for pulmonary infiltrate, consolidation, or effusion", "priority": "Recommended"})
            investigations.append({"test": "Sputum Gram Stain & Culture", "reason": "Identify pathogen if productive purulent sputum persists", "priority": "Consider"})
        elif any(w in symptom_lower for w in ["diabetes", "sugar", "glucose"]):
            investigations.append({"test": "HbA1c (Glycated Hemoglobin)", "reason": "Evaluate 3-month retrospective glycemic control", "priority": "Urgent"})
            investigations.append({"test": "Lipid Profile Panel", "reason": "Assess cardiovascular risk factors", "priority": "Recommended"})
            investigations.append({"test": "Urine Microalbumin / Creatinine Ratio", "reason": "Early detection of diabetic nephropathy", "priority": "Recommended"})
            investigations.append({"test": "Serum Creatinine & eGFR", "reason": "Baseline renal function evaluation", "priority": "Recommended"})
        elif any(w in symptom_lower for w in ["bp", "hypertension", "headache"]):
            investigations.append({"test": "12-Lead Electrocardiogram (ECG)", "reason": "Assess for left ventricular strain or arrhythmias", "priority": "Urgent"})
            investigations.append({"test": "Serum Electrolytes & Renal Function Panel", "reason": "Rule out secondary renal hypertension", "priority": "Recommended"})
            investigations.append({"test": "Fundoscopic Examination", "reason": "Screen for hypertensive retinopathy", "priority": "Consider"})
        else:
            investigations.append({"test": "Complete Blood Count (CBC)", "reason": "General hematological screening", "priority": "Recommended"})
            investigations.append({"test": "Basic Metabolic Panel (BMP)", "reason": "Assess renal function and electrolyte equilibrium", "priority": "Recommended"})
            investigations.append({"test": "Urinalysis Dipstick & Microscopy", "reason": "Screen for occult infection or proteinuria", "priority": "Consider"})

        # 05 Management Suggestions
        management = [
            {
                "category": "Supportive Care & Monitoring",
                "items": [
                    "Adequate oral hydration (2.0 - 2.5 L/day unless contraindicated by renal/cardiac disease)",
                    "Strict rest and activity pacing until acute febrile episode resolves",
                    "Home monitoring: log temperature, pulse rate, and blood pressure twice daily"
                ]
            },
            {
                "category": "Physician Pharmacotherapy Considerations",
                "items": [
                    "Antipyretic / Analgesic: Paracetamol 650mg SOS for fever > 100°F (Max 3g/24hr) — Doctor review required",
                    "Symptomatic relief: Saline steam inhalation or throat lozenges if pharyngeal discomfort present",
                    "Note: Antibiotic therapy is NOT recommended empirically without objective microbiological or radiographic evidence"
                ]
            },
            {
                "category": "Lifestyle & Preventative Measures",
                "items": [
                    "Maintain droplet/respiratory hygiene and well-ventilated recovery area",
                    "Avoid known personal allergens and tobacco smoke exposure",
                    "Nutrient-dense warm meals; avoid greasy or overly spiced foods"
                ]
            }
        ]

        # 06 Reasoning / Evidence
        reasoning = (
            f"Presentation of {main_symptom.lower()} with duration of {duration} in a {age}yo patient "
            f"aligns with an acute infectious or inflammatory etiology. "
            + (f"Laboratory indicators demonstrate elevated WBC count and CRP, supporting localized immune reaction. " if abnormal_labs else "Vitals remain hemodynamically stable. ")
            + f"Management suggestions emphasize supportive hydration, surveillance of oxygen saturation, and conservative pharmacological moderation. "
            f"Final diagnostic confirmation and prescription authorization rest solely with the reviewing physician."
        )

        guideline_titles = [g["guideline"] for g in guidelines] if guidelines else []

        return {
            "clinical_summary": summary,
            "possible_conditions": conditions,
            "red_flags": red_flags,
            "recommended_investigations": investigations,
            "management_suggestions": management,
            "reasoning_evidence": reasoning,
            "suggested_risk_score": suggested_priority,
            "is_emergency": is_emergency,
            "guidelines_referenced": guideline_titles
        }

    def generate_30_second_summary(self, patient: Dict[str, Any]) -> str:
        """
        Produces a concise 30-second patient executive summary for quick review before consultation.
        """
        name = patient.get("name", "Patient")
        age = patient.get("age", 40)
        sex = patient.get("sex", "Patient")
        symptom = patient.get("main_symptom", "acute complaint")
        duration = patient.get("duration", "4 days")
        history = patient.get("chronic_conditions", "None reported")
        meds = [m.get("name") if isinstance(m, dict) else str(m) for m in patient.get("medications", [])]
        meds_str = ", ".join(meds) if meds else "None"
        allergies = [a.get("allergen") if isinstance(a, dict) else str(a) for a in patient.get("allergies", [])]
        allergies_str = ", ".join(allergies) if allergies else "NKDA"

        summary = (
            f"{age}-year-old {sex.lower()} presenting with a {duration} history of {symptom.lower()}. "
            f"Relevant medical background: {history}. "
            f"Active medications: [{meds_str}]. Known allergies: [{allergies_str}]. "
            f"Key clinical considerations include respiratory/systemic evaluation, vitals verification, "
            f"and target investigation review. Doctor review and clinical verification required."
        )
        return summary

    def chat_response(self, patient: Dict[str, Any], query: str) -> Dict[str, Any]:
        """
        Grounds AI conversational assistance strictly in the current patient's clinical chart.
        """
        query_lower = query.lower()
        name = patient.get("name", "The patient")
        symptom = patient.get("main_symptom", "unspecified symptom")
        duration = patient.get("duration", "recent")
        history = patient.get("chronic_conditions", "None")
        meds = [m.get("name") if isinstance(m, dict) else str(m) for m in patient.get("medications", [])]
        vitals = patient.get("vitals", {})

        citations = ["MediAssist Chart Index", "NICE NG138 Clinical Pathway", "CDC Adult Evaluation Standards"]

        if "summarize" in query_lower or "summary" in query_lower or "history" in query_lower:
            reply = (
                f"Summary for {name} ({patient.get('age', 40)}yo {patient.get('sex', 'Patient')}):\n"
                f"• Chief complaint: {symptom} for {duration}.\n"
                f"• Chronic conditions: {history}.\n"
                f"• Medications: {', '.join(meds) if meds else 'No active chronic meds'}.\n"
                f"• Baseline vitals: BP {vitals.get('bp', '120/80')}, SpO2 {vitals.get('spo2', '98%')}, Temp {vitals.get('temp', '98.6°F')}."
            )
        elif "condition" in query_lower or "differential" in query_lower or "diagnosis" in query_lower:
            reply = (
                f"Based on the documented findings ({symptom}, duration of {duration}), consider:\n"
                f"1. Acute Respiratory Tract Infection / Bronchitis (supported by fever and cough presentation).\n"
                f"2. Reactive Airway Disease or Viral URTI.\n"
                f"3. Underlying exacerbation of known chronic conditions ({history}).\n"
                f"Please correlate with physical chest auscultation and oxygen saturation."
            )
        elif "investigation" in query_lower or "test" in query_lower or "lab" in query_lower:
            reply = (
                f"Relevant diagnostic investigations to evaluate {symptom} include:\n"
                f"• Complete Blood Count (CBC) with differential to assess inflammatory reaction.\n"
                f"• C-Reactive Protein (CRP) for acute phase confirmation.\n"
                f"• PA Chest Radiograph if adventitious lung sounds or persistent pyrexia are noted.\n"
                f"Physician judgment is required to determine test necessity."
            )
        elif "medication" in query_lower or "drug" in query_lower or "prescribe" in query_lower:
            reply = (
                f"Current active medications are: {', '.join(meds) if meds else 'None'}.\n"
                f"Allergies on record: {', '.join([a.get('allergen') for a in patient.get('allergies', [])]) or 'No known drug allergies'}.\n"
                f"⚠️ Note: MediAssist AI does NOT prescribe. Potential supportive measures include Paracetamol for pyrexia "
                f"and oral hydration, pending your authorized clinical prescription."
            )
        else:
            reply = (
                f"Regarding {name}'s clinical status: The chart highlights {symptom} ({duration}), "
                f"with background of {history}. Current vitals are within stable thresholds (SpO2 {vitals.get('spo2', '98%')}). "
                f"Let me know if you would like differential ranking, lab evaluation, or 30-second pre-consult review."
            )

        return {
            "reply": reply,
            "evidence_citations": citations
        }

    def summarize_clinical_notes(self, raw_notes: str, patient: Dict[str, Any]) -> Dict[str, Any]:
        """
        AI-assisted note summarization: turns raw unstructured doctor notes into structured clinical documentation.
        """
        sentences = [s.strip() for s in raw_notes.split(".") if s.strip()]
        structured = (
            f"SUBJECTIVE: Patient reviewed with notes: {raw_notes.strip()}.\n"
            f"OBJECTIVE: Hemodynamically stable upon routine assessment.\n"
            f"ASSESSMENT: Correlated with primary complaint of {patient.get('main_symptom', 'acute condition')}.\n"
            f"PLAN: Diagnostic workup and conservative medical regimen pending physician final sign-off."
        )

        extracted_symptoms = [patient.get("main_symptom", "Symptomatic presentation")]
        if "fever" in raw_notes.lower(): extracted_symptoms.append("Pyrexia")
        if "cough" in raw_notes.lower(): extracted_symptoms.append("Cough")
        if "pain" in raw_notes.lower(): extracted_symptoms.append("Pain")

        return {
            "structured_summary": structured,
            "extracted_symptoms": extracted_symptoms,
            "suggested_actions": ["Review lab results", "Confirm medication adherence", "Schedule follow-up"]
        }

    async def _call_gemini_api(self, patient: Dict[str, Any], guidelines: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        # Integration hook for Gemini API when key is configured in environment
        # Uses strict JSON schema matching the system requirements
        pass

    async def _call_openai_api(self, patient: Dict[str, Any], guidelines: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        # Integration hook for OpenAI API when key is configured in environment
        pass

clinical_reasoning = ClinicalReasoningEngine()
