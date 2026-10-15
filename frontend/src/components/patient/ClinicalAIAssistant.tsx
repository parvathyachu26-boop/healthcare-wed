import React, { useState, useEffect } from 'react';
import { 
  PatientDetail, 
  AIAssessment, 
  DoctorReview 
} from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Send, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  RefreshCw,
  GitCompare,
  MessageSquare,
  BookOpen,
  Info
} from 'lucide-react';

interface ClinicalAIAssistantProps {
  patient: PatientDetail;
  onRefreshPatient: () => void;
}

export const ClinicalAIAssistant: React.FC<ClinicalAIAssistantProps> = ({
  patient,
  onRefreshPatient
}) => {
  const { user, isDoctor } = useAuth();
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<string>('Awaiting Doctor Review');
  const [doctorReviewData, setDoctorReviewData] = useState<DoctorReview | null>(null);

  // Modify Modal State
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);
  const [editDiagnosis, setEditDiagnosis] = useState<string>('');
  const [editTests, setEditTests] = useState<string[]>([]);
  const [newTestInput, setNewTestInput] = useState<string>('');
  const [editMeds, setEditMeds] = useState<{ name: string; dose: string; frequency: string; duration: string }[]>([]);
  const [editAdvice, setEditAdvice] = useState<string>('');
  const [editFollowUpDate, setEditFollowUpDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  });
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // AI Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'doctor' | 'ai'; text: string; citations?: string[] }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.full_name || 'Doctor'}. I have analyzed ${patient.name}'s chart, vitals, and lab results. You can ask me any clinical questions or request diagnostic reasoning.`,
      citations: ['MediAssist Chart Index']
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // AI vs Doctor Comparison State
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState<boolean>(false);

  // Generate or load AI assessment on patient change
  useEffect(() => {
    fetchOrGenerateAssessment();
  }, [patient.id]);

  const fetchOrGenerateAssessment = async () => {
    setLoading(true);
    try {
      const data = await api.generateAIAssessment(patient.id);
      setAssessment(data);

      // Check if already approved / reviewed
      const comp = await api.getAIComparison(patient.id);
      if (comp.has_comparison && comp.doctor_decision?.status !== 'Awaiting Doctor Review') {
        setReviewStatus(comp.doctor_decision.status);
        setDoctorReviewData(comp.doctor_decision);
        setComparisonData(comp);
      } else {
        setReviewStatus('Awaiting Doctor Review');
        setDoctorReviewData(null);
      }

      // Populate initial edit form
      const topCondition = data.possible_conditions?.[0]?.condition || 'Preliminary Assessment';
      setEditDiagnosis(topCondition);
      setEditTests(data.recommended_investigations?.map((i: any) => i.test) || []);
      setEditMeds([
        { name: 'Paracetamol', dose: '650 mg', frequency: 'TID as needed', duration: '3 days' },
        { name: 'Cetirizine', dose: '10 mg', frequency: 'Once daily at night', duration: '5 days' }
      ]);
      setEditAdvice("Rest, adequate oral hydration (2.5L/day), and monitor oxygen saturation at home.");
    } catch (err) {
      console.error("Failed to generate AI assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  // Doctor Approval
  const handleApprovePlan = async (status: 'Doctor Verified' | 'Modified' | 'Rejected' = 'Doctor Verified') => {
    if (!assessment) return;

    try {
      const payload = {
        patient_id: patient.id,
        status,
        final_doctor_diagnosis: editDiagnosis,
        modified_tests: editTests,
        modified_medications: editMeds,
        doctor_clinical_advice: editAdvice,
        doctor_notes: doctorNotes,
        follow_up_date: editFollowUpDate
      };

      const result = await api.approvePlan(payload);
      setReviewStatus(result.status);
      setDoctorReviewData(result);
      setShowModifyModal(false);

      // Refresh comparison
      const comp = await api.getAIComparison(patient.id);
      setComparisonData(comp);
      onRefreshPatient();
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  // AI Chat send
  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'doctor', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await api.aiChat(patient.id, userMsg);
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: res.reply,
        citations: res.evidence_citations
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: "I encountered a communication interruption. Please re-check the patient's record.",
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-soft">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Synthesizing Clinical Intelligence</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Analyzing vitals, reported symptoms, chronic conditions, and lab values against clinical guidelines...
        </p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-soft">
        <p className="text-sm text-slate-600 mb-3">No preliminary assessment generated yet.</p>
        <button
          onClick={fetchOrGenerateAssessment}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          Run AI Clinical Reasoning
        </button>
      </div>
    );
  }

  const isVerified = reviewStatus === 'Doctor Verified' || reviewStatus === 'Modified';
  const isReviewed = isVerified || reviewStatus === 'Rejected';

  return (
    <div className="space-y-6">
      {/* ⚠️ EMERGENCY SAFETY WARNING IF DETECTED (Section 26) */}
      {assessment.is_emergency && (
        <div className="bg-red-700 text-white rounded-xl p-5 border border-red-800 flex items-start space-x-3.5">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-base tracking-wide uppercase">
              ⚠️ URGENT CLINICAL REVIEW REQUIRED
            </h3>
            <p className="text-xs text-red-50 leading-relaxed">
              Potential emergency indicators identified (e.g. hypoxemia SpO2 &lt; 93%, critical thrombocytopenia, or hemodynamic instability).
              The AI does not independently manage emergencies. Immediate bedside physician assessment and stabilization is advised.
            </p>
          </div>
        </div>
      )}

      {/* AI Preliminary Plan Header & Doctor Review Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Clinical AI
                </h2>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
                  Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-500">
                  AI has reviewed the available patient information.
              </p>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="flex items-center space-x-2">
            {isVerified ? (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <span className="text-xs font-extrabold text-emerald-800 block">
                    ✓ Doctor Verified
                  </span>
                  {doctorReviewData?.doctor_signature_name && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Signed by {doctorReviewData.doctor_signature_name}
                    </span>
                  )}
                </div>
              </div>
            ) : reviewStatus === 'Rejected' ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-800">Plan rejected</div>
            ) : (
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">
                  Awaiting Doctor Review
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Safety Disclaimer Banner (Mandatory Requirement) */}
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-start space-x-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="font-semibold">Clinical Decision Support Prototype Notice:</strong> AI-generated recommendations are suggestions only.
            Please verify the patient's clinical findings and use your independent medical judgment before approving or initiating treatment.
          </p>
        </div>

        {/* Doctor Actions */}
        {!isReviewed && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
            <div className="text-xs text-slate-600"><span className="font-bold text-slate-800">Doctor review required.</span> Verify the suggested plan before taking action.</div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { if (window.confirm('Reject this AI-generated plan?')) void handleApprovePlan('Rejected'); }} className="px-4 py-2 bg-white hover:bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">Reject</button>
              <button
                onClick={() => setShowModifyModal(true)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Modify</span>
              </button>
              <button
                onClick={() => handleApprovePlan('Doctor Verified')}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>Approve Clinical Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI VS DOCTOR COMPARISON (Feature #11) */}
      {showComparison && (
        <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-premium space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">
                AI Suggestion vs Doctor Final Decision
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Transparency & Quality Review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* AI Side */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Preliminary Suggestion</span>
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">
                  Algorithm Baseline
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Primary Differential:</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {assessment.possible_conditions[0]?.condition}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Recommended Tests:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-700">
                  {assessment.recommended_investigations.map((t, idx) => (
                    <li key={idx}>{t.test}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-medium text-[11px]">Suggested Triage Priority:</span>
                <p className="font-semibold text-teal-700 mt-0.5">{assessment.suggested_risk_score}</p>
              </div>
            </div>

            {/* Doctor Side */}
            <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Doctor Approved Decision</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  {isVerified ? 'Doctor Authorized' : 'Pending Verification'}
                </span>
              </div>
              <div>
                <span className="text-teal-700 font-medium text-[11px]">Final Physician Diagnosis:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {doctorReviewData?.final_doctor_diagnosis || editDiagnosis}
                </p>
              </div>
              <div>
                <span className="text-teal-700 font-medium text-[11px]">Approved Diagnostic Tests:</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-800">
                  {(doctorReviewData?.modified_tests || editTests).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-teal-700 font-medium text-[11px]">Approved Advice:</span>
                <p className="text-slate-800 mt-0.5">
                  {doctorReviewData?.doctor_clinical_advice || editAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</h3><p className="mt-2 text-sm leading-relaxed text-slate-800">{assessment.clinical_summary}</p></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Possible considerations</h3><ul className="mt-2 space-y-1 text-sm text-slate-700">{assessment.possible_conditions.slice(0, 2).map((item, index) => <li key={index}>{index + 1}. {item.condition}</li>)}</ul></div><div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended next steps</h3><ul className="mt-2 space-y-1 text-sm text-slate-700">{assessment.recommended_investigations.slice(0, 2).map((item, index) => <li key={index}>• {item.test}</li>)}</ul></div></div>
        <p className="text-xs font-medium text-amber-800">AI-generated — Doctor verification required</p>
        <button onClick={() => setShowFullAnalysis(value => !value)} className="text-sm font-semibold text-blue-700 hover:underline">{showFullAnalysis ? 'Hide detailed analysis' : 'Review AI Analysis'}</button>
      </section>
      {showFullAnalysis && <>
      {/* Structured 6-Section Assessment Display (Sections 01 through 06) */}
      <div className="grid grid-cols-1 gap-5">
        {/* 01 — Clinical Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-2">
          <div className="flex items-center space-x-2 text-teal-700">
            <span className="text-xs font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              01
            </span>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
              Clinical Summary
            </h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed pl-7">
            {assessment.clinical_summary}
          </p>
        </div>

        {/* 02 — Possible Conditions (Differentials) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-teal-700">
              <span className="text-xs font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                02
              </span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                Possible Conditions / Differentials
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Non-dogmatic clinical ranking</span>
          </div>

          <div className="space-y-3 pl-7">
            {assessment.possible_conditions.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">
                      {idx + 1}. {item.condition}
                    </span>
                    {item.icd10 && (
                      <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded">
                        ICD-10: {item.icd10}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold bg-teal-100/70 text-teal-800 px-2 py-0.5 rounded-md">
                    {item.confidence_evidence}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Rationale:</strong> {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 03 — Red Flags */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-2">
          <div className="flex items-center space-x-2 text-teal-700">
            <span className="text-xs font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              03
            </span>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
              Red Flags & Urgent Findings
            </h3>
          </div>
          <div className="pl-7 space-y-1.5">
            {assessment.red_flags.map((flag, idx) => {
              const isWarning = flag.includes('⚠️');
              return (
                <div
                  key={idx}
                  className={`text-xs p-2.5 rounded-xl flex items-center space-x-2 ${
                    isWarning
                      ? 'bg-red-50 text-red-800 border border-red-200 font-semibold'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <span>{flag}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 04 — Recommended Investigations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-teal-700">
              <span className="text-xs font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                04
              </span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                Recommended Investigations
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Doctor orders at discretion</span>
          </div>

          <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assessment.recommended_investigations.map((inv, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{inv.test}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    inv.priority === 'Urgent'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {inv.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{inv.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 05 — Management Suggestions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-teal-700">
              <span className="text-xs font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                05
              </span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                Management Suggestions
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Doctor-review recommendations, NOT automatic Rx</span>
          </div>

          <div className="pl-7 space-y-3">
            {assessment.management_suggestions.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {cat.category}
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {cat.items.map((item, iIdx) => (
                    <li key={iIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 06 — Reasoning / Evidence */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-2">
          <div className="flex items-center space-x-2 text-teal-700">
            <span className="text-xs font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              06
            </span>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">
              Reasoning & Clinical Evidence
            </h3>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-xs text-slate-700 leading-relaxed">
              {assessment.reasoning_evidence}
            </p>
            {assessment.guidelines_referenced?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-500">Referenced Guidelines:</span>
                {assessment.guidelines_referenced.map((g, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-teal-600" />
                    <span>{g}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </>}

      {/* AI CLINICAL CHAT SECTION (Section 12) */}
      <details className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 space-y-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">More: ask Clinical AI and compare the plan</summary>
        <div className="space-y-4 pt-3">
        <button onClick={() => setShowComparison(value => !value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{showComparison ? 'Hide AI vs doctor comparison' : 'View AI vs doctor comparison'}</button>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Interactive AI Clinical Chat
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Strictly grounded on {patient.name}'s chart</span>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400">Quick queries:</span>
          {[
            "Summarize this patient's history",
            "What conditions should I consider?",
            "What additional investigations would confirm this?",
            "Any medication allergy cautions?"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setChatInput(prompt);
              }}
              className="text-[11px] font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div className="bg-slate-50/60 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3 border border-slate-100">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'doctor' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${
                  msg.sender === 'doctor'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center space-x-1">
                    <span>Evidence sources:</span>
                    <span className="font-medium text-teal-700">{msg.citations.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 pl-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>AI is consulting clinical reference guidelines...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question about this patient or diagnostic pathway..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          <button
            onClick={handleSendChat}
            disabled={chatLoading || !chatInput.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
        </div>
      </details>

      {/* DOCTOR MODIFY MODAL */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Doctor Clinical Modification
                </h3>
                <p className="text-xs text-slate-500">
                  Review and customize diagnosis, tests, and prescriptions before signing
                </p>
              </div>
              <button
                onClick={() => setShowModifyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnosis Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Final Physician Diagnosis</label>
              <input
                type="text"
                value={editDiagnosis}
                onChange={(e) => setEditDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Tests ordered */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Diagnostic Tests Ordered</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTests.map((test, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-lg font-medium"
                  >
                    <span>{test}</span>
                    <button
                      onClick={() => setEditTests(editTests.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add test (e.g. Chest CT, Echocardiogram)..."
                  value={newTestInput}
                  onChange={(e) => setNewTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTestInput.trim()) {
                      setEditTests([...editTests, newTestInput.trim()]);
                      setNewTestInput('');
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  onClick={() => {
                    if (newTestInput.trim()) {
                      setEditTests([...editTests, newTestInput.trim()]);
                      setNewTestInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Authorized Medications</label>
                <button
                  onClick={() => setEditMeds([...editMeds, { name: '', dose: '', frequency: '', duration: '' }])}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Drug</span>
                </button>
              </div>
              <div className="space-y-2">
                {editMeds.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => {
                        const copy = [...editMeds];
                        copy[idx].name = e.target.value;
                        setEditMeds(copy);
                      }}
                      className="col-span-4 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. 500mg)"
                      value={med.dose}
                      onChange={(e) => {
                        const copy = [...editMeds];
                        copy[idx].dose = e.target.value;
                        setEditMeds(copy);
                      }}
                      className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (BID)"
                      value={med.frequency}
                      onChange={(e) => {
                        const copy = [...editMeds];
                        copy[idx].frequency = e.target.value;
                        setEditMeds(copy);
                      }}
                      className="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => setEditMeds(editMeds.filter((_, i) => i !== idx))}
                      className="col-span-2 text-slate-400 hover:text-red-500 text-center"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Clinical Advice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Physician Advice & Instructions</label>
              <textarea
                rows={2}
                value={editAdvice}
                onChange={(e) => setEditAdvice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="follow-up-date" className="text-xs font-bold text-slate-700">Follow-up date</label>
              <input id="follow-up-date" type="date" value={editFollowUpDate} onChange={e => setEditFollowUpDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-teal-600" />
            </div>

            {/* Doctor Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Internal Physician Notes</label>
              <textarea
                rows={2}
                placeholder="Private clinical impression, reasoning for modification..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprovePlan('Modified')}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Approve Modified Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
