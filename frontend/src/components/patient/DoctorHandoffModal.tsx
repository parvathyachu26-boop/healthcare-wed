import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { HandoffData } from '../../types';
import { 
  HeartHandshake, 
  X, 
  Copy, 
  Check, 
  RefreshCw,
  FileCheck,
  Stethoscope
} from 'lucide-react';

interface DoctorHandoffModalProps {
  patientId: number;
  onClose: () => void;
}

export const DoctorHandoffModal: React.FC<DoctorHandoffModalProps> = ({ patientId, onClose }) => {
  const [handoff, setHandoff] = useState<HandoffData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDoctorHandoff(patientId);
        setHandoff(res);
      } catch (err) {
        console.error("Failed to generate handoff:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  const handleCopy = () => {
    if (!handoff) return;
    const text = `
=== DOCTOR CLINICAL HANDOFF NOTE ===
Patient: ${handoff.patient_name} (${handoff.age_sex}, MRN: ${handoff.patient_mrn})
Timestamp: ${handoff.handoff_timestamp}
Attending Physician: ${handoff.generated_by}

CURRENT CHIEF CONCERN:
${handoff.current_concern}

VITAL SIGNS:
${handoff.vital_signs_summary}

RELEVANT HISTORY & COMORBIDITIES:
${handoff.relevant_history}

ACTIVE MEDICATIONS:
${handoff.current_medications.join(', ')}

RECENT INVESTIGATIONS:
${handoff.recent_investigations.join('\n')}

AI PRELIMINARY ASSESSMENT SUMMARY:
${handoff.ai_assessment_summary}

ATTENDING PHYSICIAN NOTES:
${handoff.attending_physician_notes}

KEY ACTION ITEMS FOR INCOMING PHYSICIAN:
${handoff.key_action_items.map(a => `• ${a}`).join('\n')}
====================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Doctor-to-Doctor Clinical Handoff Note
              </h3>
              <p className="text-xs text-slate-500">
                Standardized SBAR clinical transfer summary for seamless shift changes or referrals
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            Compiling structured clinical handoff note...
          </div>
        ) : !handoff ? (
          <div className="text-center py-6 text-xs text-slate-500">Could not compile handoff.</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{handoff.patient_name}</span> ({handoff.age_sex})
                <p className="text-[11px] text-slate-500 font-mono">MRN: {handoff.patient_mrn}</p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>Handed over by: <strong className="text-slate-800">{handoff.generated_by}</strong></span>
                <p className="text-[10px] text-slate-400">{handoff.handoff_timestamp}</p>
              </div>
            </div>

            {/* Concern & Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Concern</span>
                <p className="font-semibold text-slate-800">{handoff.current_concern}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Vitals</span>
                <p className="font-semibold text-slate-800">{handoff.vital_signs_summary}</p>
              </div>
            </div>

            {/* AI Assessment & Physician Notes */}
            <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-800 uppercase block">
                Synthesized Clinical Assessment
              </span>
              <p className="text-slate-700 leading-relaxed">{handoff.ai_assessment_summary}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Attending Physician Impressions
              </span>
              <p className="text-slate-700 leading-relaxed italic">{handoff.attending_physician_notes}</p>
            </div>

            {/* Key action items */}
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5">
              <span className="text-[10px] font-bold text-amber-900 uppercase block">
                Recommended Action Items for Receiving Physician
              </span>
              <ul className="list-disc list-inside space-y-1 text-amber-950 font-medium">
                {handoff.key_action_items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">Compliant with Hospital Handover Protocols</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Handoff Note'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
