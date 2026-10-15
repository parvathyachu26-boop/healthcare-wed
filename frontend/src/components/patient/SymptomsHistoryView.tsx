import React from 'react';
import { PatientDetail } from '../../types';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  Pill, 
  History, 
  HeartHandshake, 
  ShieldAlert, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface SymptomsHistoryViewProps {
  patient: PatientDetail;
}

export const SymptomsHistoryView: React.FC<SymptomsHistoryViewProps> = ({ patient }) => {
  const symptom = patient.current_symptoms;
  const history = patient.medical_history;

  return (
    <div className="space-y-6">
      {/* 1. Current Symptoms Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-base text-slate-900">Current Presentation & Symptoms</h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
            Onset: {symptom?.onset || 'Gradual'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Main Symptom</span>
            <p className="font-bold text-slate-900 text-sm">{symptom?.main_symptom || 'Unspecified'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Duration</span>
            <p className="font-bold text-slate-900 text-sm">{symptom?.duration || 'Recent'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Severity</span>
            <p className="font-bold text-teal-700 text-sm">{symptom?.severity || 'Moderate'}</p>
          </div>
        </div>

        {symptom?.associated_symptoms && (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
              Associated Symptoms & Details
            </span>
            <p className="text-slate-700 leading-relaxed">{symptom.associated_symptoms}</p>
          </div>
        )}

        {symptom?.observations && (
          <div className="p-3.5 rounded-xl bg-teal-50/30 border border-teal-100 text-xs space-y-1">
            <span className="text-teal-800 font-bold uppercase tracking-wider text-[10px] block">
              Physical Observations at Intake
            </span>
            <p className="text-teal-900 leading-relaxed">{symptom.observations}</p>
          </div>
        )}
      </div>

      {/* 2. Medical History & Chronic Conditions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-base text-slate-900">Medical Background & History</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Previous Diseases</span>
            <p className="font-semibold text-slate-800">{history?.previous_diseases || 'None'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Surgical History</span>
            <p className="font-semibold text-slate-800">{history?.previous_surgeries || 'None'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Chronic Conditions</span>
            <p className="font-semibold text-slate-800">{history?.chronic_conditions || 'None'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Family History</span>
            <p className="font-semibold text-slate-800">{history?.family_history || 'Unremarkable'}</p>
          </div>
        </div>

        {history?.previous_relevant_episodes && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
              Previous Relevant Episodes
            </span>
            <p className="text-slate-700">{history.previous_relevant_episodes}</p>
          </div>
        )}
      </div>

      {/* 3. Current Medications & Allergies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <Pill className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Current Medications</h3>
            </div>
            <span className="text-[11px] text-slate-400">{patient.medications.length} on file</span>
          </div>

          {patient.medications.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No active chronic medications on record.</p>
          ) : (
            <div className="space-y-2">
              {patient.medications.map((med, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{med.name}</span>
                    <p className="text-slate-500 text-[11px]">{med.dose} • {med.frequency}</p>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded border border-teal-200/60">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-sm text-slate-900">Allergies & Contraindications</h3>
            </div>
            <span className="text-[11px] text-slate-400">{patient.allergies.length} recorded</span>
          </div>

          {patient.allergies.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center text-xs text-emerald-800">
              No known drug allergies (NKDA) reported by patient.
            </div>
          ) : (
            <div className="space-y-2">
              {patient.allergies.map((alg, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-red-50/40 border border-red-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-red-900">{alg.allergen}</span>
                    <p className="text-red-700/80 text-[11px]">{alg.reaction}</p>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase">
                    {alg.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Previous Consultations Chronological Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Calendar className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-base text-slate-900">Previous Consultations History</h3>
        </div>

        {patient.previous_consultations.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">First visit to this clinical service.</p>
        ) : (
          <div className="space-y-3">
            {patient.previous_consultations.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{c.visit_date}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-slate-600">{c.visit_type}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Past Visit #{c.id}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Diagnosis:</span>{' '}
                  <span className="font-bold text-teal-800">{c.diagnosis}</span>
                </div>
                <p className="text-slate-600">
                  <strong className="text-slate-700 font-semibold">Treatment & Plan:</strong> {c.treatment_plan}
                </p>
                {c.clinical_notes && (
                  <p className="text-slate-500 text-[11px] italic bg-white p-2 rounded-lg border border-slate-100">
                    "{c.clinical_notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
