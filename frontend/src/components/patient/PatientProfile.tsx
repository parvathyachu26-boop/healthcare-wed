import React, { useState, useEffect } from 'react';
import { PatientDetail } from '../../types';
import { api } from '../../services/api';
import { ClinicalAIAssistant } from './ClinicalAIAssistant';
import { SymptomsHistoryView } from './SymptomsHistoryView';
import { LabReportsView } from './LabReportsView';
import { PatientTimelineView } from './PatientTimelineView';
import { DoctorNotesView } from './DoctorNotesView';
import { PrescriptionPrintView } from './PrescriptionPrintView';
import { WhatsNewModal } from './WhatsNewModal';
import { DoctorHandoffModal } from './DoctorHandoffModal';
import { ThirtySecondSummaryModal } from './ThirtySecondSummaryModal';
import { 
  Sparkles, 
  User, 
  FileText, 
  History, 
  FileEdit, 
  Printer, 
  Zap, 
  HeartHandshake, 
  Clock, 
  Phone, 
  Droplet, 
  ShieldCheck, 
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';

interface PatientProfileProps {
  patientId: number;
  onBackToQueue: () => void;
  initialTab?: 'ai-assistant' | 'symptoms-history' | 'labs' | 'timeline' | 'doctor-notes' | 'prescription';
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onBackToQueue, initialTab = 'ai-assistant' }) => {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<
    'ai-assistant' | 'symptoms-history' | 'labs' | 'timeline' | 'doctor-notes' | 'prescription'
  >(initialTab);

  // Modals
  const [showWhatsNew, setShowWhatsNew] = useState<boolean>(false);
  const [showHandoff, setShowHandoff] = useState<boolean>(false);
  const [show30sSummary, setShow30sSummary] = useState<boolean>(false);

  // Doctor Override for Priority Score (Feature #14)
  const [overriddenPriority, setOverriddenPriority] = useState<string | null>(null);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  useEffect(() => { setActiveSubTab(initialTab); }, [patientId, initialTab]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const data = await api.getPatientDetail(patientId);
      setPatient(data);
      setOverriddenPriority(data.active_appointment?.priority || 'Routine');
    } catch (err) {
      console.error("Failed to load patient:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-soft">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-700">Loading Patient Electronic Medical Record...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-soft">
        <p className="text-sm text-slate-600">Patient record not found.</p>
        <button onClick={onBackToQueue} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Return to Queue
        </button>
      </div>
    );
  }

  const priorityLevel = overriddenPriority || patient.active_appointment?.priority || 'Routine';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition-all hover:bg-slate-50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Patient Queue</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>OPD Consultation</span>
          <span>/</span>
          <span className="font-mono text-slate-700 font-semibold">{patient.mrn}</span>
        </div>
      </div>

      {/* PATIENT HEADER (Section 7 & 14) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Demographics */}
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {patient.name}
                </h1>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono font-semibold">
                  MRN: {patient.mrn}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {patient.age} yrs • {patient.sex}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Droplet className="w-3.5 h-3.5 text-red-500" />
                  <span>Blood Group: <strong className="text-slate-800">{patient.blood_group}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact: {patient.contact}</span>
                </span>
                <span>•</span>
                <span>
                  Last Visit: <strong className="text-slate-700">{patient.previous_consultations[0]?.visit_date || 'None'}</strong>
                </span>
              </div>
            </div>
          </div>

          <details className="text-sm text-slate-600">
            <summary className="cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-50">More record tools</summary>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => setShow30sSummary(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">30-second summary</button>
              <button onClick={() => setShowHandoff(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Doctor handoff</button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>Priority suggestion: <strong className="text-slate-800">{priorityLevel}</strong></span>
              <label htmlFor="priority-override" className="sr-only">Set doctor priority override</label>
              <select id="priority-override" value={overriddenPriority || ''} onChange={e => setOverriddenPriority(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-medium focus-visible:ring-2 focus-visible:ring-blue-600"><option value="Urgent">Urgent</option><option value="High">High</option><option value="Routine">Routine</option></select>
            </div>
          </details>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Current Visit</h2><p className="mt-2 text-sm text-slate-700">{patient.current_symptoms?.main_symptom || patient.active_appointment?.complaint || 'No current visit information recorded.'}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600"><span>Duration: {patient.current_symptoms?.duration || '—'}</span><span>Severity: {patient.current_symptoms?.severity || '—'}</span><span>Blood pressure: {patient.active_appointment?.vitals_bp || '—'}</span><span>Temperature: {patient.active_appointment?.vitals_temp || '—'}</span><span>Heart rate: {patient.active_appointment?.vitals_hr || '—'}</span><span>Oxygen: {patient.active_appointment?.vitals_spo2 || '—'}</span></div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Medical History</h2><p className="mt-2 text-sm text-slate-700">{patient.medical_history?.previous_diseases || patient.medical_history?.chronic_conditions || 'No previous conditions recorded.'}</p><p className="mt-2 text-xs text-slate-600">Allergies: {patient.allergies.map(item => item.allergen).join(', ') || 'None recorded'}</p><p className="mt-1 text-xs text-slate-600">Medications: {patient.medications.map(item => item.name).join(', ') || 'None recorded'}</p><p className="mt-1 text-xs text-slate-600">{patient.previous_consultations.length} previous visits</p></section>
      </div>

      <button onClick={() => setShowWhatsNew(true)} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-600"><span><span className="block text-sm font-semibold text-slate-900">Since Last Visit</span><span className="mt-1 block text-xs text-slate-600">Review new symptoms, improvements, and reports.</span></span><span className="text-sm font-semibold text-blue-700">View Changes →</span></button>

      <ClinicalAIAssistant patient={patient} onRefreshPatient={loadPatient} />

      <details open={activeSubTab !== 'ai-assistant'} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">More patient information and documents</summary>
        <div className="mt-4 flex border-b border-slate-200 overflow-x-auto gap-1">
        {[
          { id: 'ai-assistant', label: 'Clinical AI Assistant', icon: Sparkles, highlight: true },
          { id: 'symptoms-history', label: 'Symptoms & History', icon: User },
          { id: 'labs', label: `Labs & OCR (${patient.lab_reports.length})`, icon: FileText },
          { id: 'timeline', label: 'Medical Timeline', icon: Clock },
          { id: 'doctor-notes', label: 'Doctor Notes', icon: FileEdit },
          { id: 'prescription', label: 'Prescription & Plan', icon: Printer },
        ].filter(tab => tab.id !== 'ai-assistant').map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        </div>

      {/* ACTIVE SUB-TAB CONTENT */}
      <div className="pt-4">
        {activeSubTab === 'symptoms-history' && (
          <SymptomsHistoryView patient={patient} />
        )}
        {activeSubTab === 'labs' && (
          <LabReportsView patient={patient} onRefresh={loadPatient} />
        )}
        {activeSubTab === 'timeline' && (
          <PatientTimelineView patientId={patient.id} />
        )}
        {activeSubTab === 'doctor-notes' && (
          <DoctorNotesView patient={patient} />
        )}
        {activeSubTab === 'prescription' && (
          <PrescriptionPrintView patient={patient} />
        )}
      </div>
      </details>

      {/* MODALS */}
      {showWhatsNew && (
        <WhatsNewModal patientId={patient.id} onClose={() => setShowWhatsNew(false)} />
      )}
      {showHandoff && (
        <DoctorHandoffModal patientId={patient.id} onClose={() => setShowHandoff(false)} />
      )}
      {show30sSummary && (
        <ThirtySecondSummaryModal
          patientId={patient.id}
          patientName={patient.name}
          onClose={() => setShow30sSummary(false)}
        />
      )}
    </div>
  );
};
