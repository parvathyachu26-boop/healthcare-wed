import React, { useState, useEffect } from 'react';
import {
  Heart, User, ClipboardList, Pill, AlertTriangle, Calendar, FileText,
  LogOut, CheckCircle, Clock, ChevronRight, Plus, Trash2, Loader2,
  Stethoscope, Activity, ArrowRight, Shield, Bell, X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type PortalTab = 'overview' | 'symptoms' | 'history' | 'medications' | 'allergies' | 'appointments' | 'my-consultations';

const NAV_ITEMS: { tab: PortalTab; icon: React.ElementType; label: string }[] = [
  { tab: 'overview', icon: Activity, label: 'Dashboard' },
  { tab: 'appointments', icon: Calendar, label: 'Appointments' },
  { tab: 'my-consultations', icon: FileText, label: 'Health Documents' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
  submitted: 'bg-teal-500/15 text-teal-800 border-teal-500/30',
  in_queue: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
  reviewed: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Complete your profile',
  submitted: 'Details submitted — awaiting doctor',
  in_queue: 'In queue — appointment booked',
  reviewed: 'Reviewed by doctor',
};

export const PatientPortalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<PortalTab>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getMyPortalProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-800 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm">Loading your health profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-portal min-h-screen bg-[#f7f9fb] text-slate-900 flex flex-col font-sans">
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-700 text-white px-5 py-3.5 rounded-xl shadow-lg text-sm font-semibold animate-slide-in">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-slate-900 font-bold text-sm">MediAssist <span className="text-teal-800">AI</span></span>
            <span className="ml-2 text-xs text-slate-600">Patient Portal</span>
            {user?.is_demo && <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">DEMO · Fictional</span>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {profile && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${STATUS_COLORS[profile.intake_status] || STATUS_COLORS.pending}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {STATUS_LABELS[profile.intake_status] || profile.intake_status}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center text-slate-900 text-xs font-bold">
              {user?.full_name?.[0]?.toUpperCase() || 'P'}
            </div>
            <span className="text-slate-700 text-sm font-medium hidden sm:block">{user?.full_name}</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-600 hover:text-red-800 transition-colors" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col py-3 lg:py-4 overflow-y-auto flex-shrink-0">
          <nav aria-label="Patient navigation" className="flex flex-nowrap gap-1 overflow-x-auto lg:block lg:flex-1 lg:space-y-0.5 px-3">
            {NAV_ITEMS.map(({ tab: t, icon: Icon, label }) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-auto shrink-0 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all lg:w-full ${
                  tab === t
                  ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <details className="mx-3 mt-2 group">
            <summary className="cursor-pointer list-none rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-600">My Health details</summary>
            <div className="mt-1 grid grid-cols-2 gap-1 lg:grid-cols-1">
              {([
                ['symptoms', 'Symptoms'], ['history', 'Medical history'], ['medications', 'Medications'], ['allergies', 'Allergies'],
              ] as [PortalTab, string][]).map(([target, label]) => <button key={target} onClick={() => setTab(target)} className={`rounded-lg px-3 py-2 text-left text-sm ${tab === target ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}
            </div>
          </details>
          {/* MRN display */}
          {profile && (
            <div className="hidden px-4 py-3 mx-3 mt-4 bg-slate-50 rounded-xl border border-slate-200 lg:block">
              <p className="text-slate-600 text-xs mb-1">Patient ID</p>
              <p className="text-slate-700 text-xs font-mono font-bold">{profile.mrn}</p>
            </div>
          )}
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-[#f7f9fb] p-4 sm:p-6">
          {tab === 'overview' && <OverviewTab profile={profile} onNavigate={setTab} />}
          {tab === 'symptoms' && <SymptomsTab profile={profile} onRefresh={loadProfile} onSuccess={showSuccess} />}
          {tab === 'history' && <HistoryTab profile={profile} onRefresh={loadProfile} onSuccess={showSuccess} />}
          {tab === 'medications' && <MedicationsTab profile={profile} onRefresh={loadProfile} onSuccess={showSuccess} />}
          {tab === 'allergies' && <AllergiesTab profile={profile} onRefresh={loadProfile} onSuccess={showSuccess} />}
          {tab === 'appointments' && <AppointmentsTab profile={profile} onRefresh={loadProfile} onSuccess={showSuccess} />}
          {tab === 'my-consultations' && <ConsultationsTab />}
        </main>
      </div>
    </div>
  );
};

// ─── Overview Tab ────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ profile: any; onNavigate: (t: PortalTab) => void }> = ({ profile, onNavigate }) => {
  const nextAppointment = profile?.appointments?.find((appointment: any) => ['waiting', 'in_consultation'].includes(appointment.status));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Hello, {profile?.name?.split(' ')[0] || 'there'}</h1><p className="mt-1 text-sm text-slate-600">Your health information and care, in one place.</p></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Next Appointment</p>{nextAppointment ? <><p className="mt-2 font-semibold text-slate-900">{nextAppointment.doctor_name || 'Doctor to be assigned'}</p>{nextAppointment.doctor_specialty && <p className="text-sm text-slate-600">{nextAppointment.doctor_specialty}</p>}<p className="mt-2 text-sm text-slate-700">{nextAppointment.date} · {nextAppointment.time}</p><p className="mt-1 text-sm text-slate-600">{nextAppointment.complaint || 'Consultation'}</p></> : <><p className="mt-2 font-semibold text-slate-900">No upcoming appointments</p><p className="mt-1 text-sm text-slate-600">Book a visit when you need care.</p></>}</div><Calendar className="h-6 w-6 text-teal-700" /></div><button onClick={() => onNavigate('appointments')} className="mt-4 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">{nextAppointment ? 'View Appointment' : 'Book Appointment'}</button></section>
      <section className="grid gap-4 sm:grid-cols-2"><button onClick={() => onNavigate('history')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-teal-300"><h2 className="font-semibold text-slate-900">My Health</h2><p className="mt-1 text-sm text-slate-600">Symptoms, medical history, medications, and allergies.</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-800">View health details <ArrowRight className="h-4 w-4" /></span></button><button onClick={() => onNavigate('my-consultations')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"><h2 className="font-semibold text-slate-900">Health Documents</h2><p className="mt-1 text-sm text-slate-600">Consultation summaries and your doctor’s care plan.</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-800">View documents <ArrowRight className="h-4 w-4" /></span></button></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">My Doctors</h2>{profile?.doctors?.length ? <div className="mt-3 space-y-3">{profile.doctors.map((doctor: any) => <div key={doctor.id}><p className="text-sm font-medium text-slate-900">{doctor.name}</p><p className="text-sm text-slate-600">{doctor.specialty}</p></div>)}</div> : <p className="mt-1 text-sm text-slate-600">No doctors are connected to your account yet.</p>}</section>
    </div>
  );
};

// ─── Symptoms Tab ────────────────────────────────────────────────────────────
const SymptomsTab: React.FC<{ profile: any; onRefresh: () => void; onSuccess: (m: string) => void }> = ({ profile, onRefresh, onSuccess }) => {
  const existing = profile?.current_symptoms;
  const [form, setForm] = useState({
    main_symptom: existing?.main_symptom || '',
    duration: existing?.duration || '',
    severity: existing?.severity || 'Moderate',
    associated_symptoms: existing?.associated_symptoms || '',
    onset: existing?.onset || 'Gradual',
    observations: existing?.observations || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.main_symptom.trim() || !form.duration.trim()) { setError('Main symptom and duration are required'); return; }
    setSaving(true); setError('');
    try {
      await api.submitSymptoms(form);
      await onRefresh();
      onSuccess('Symptoms submitted successfully!');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Current Symptoms</h2>
        <p className="text-slate-600 text-sm mt-1">Describe what brought you here today. This helps your doctor prepare before the visit.</p>
      </div>

      {existing && (
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-teal-800" />
            <span className="text-teal-800 text-sm font-semibold">Symptoms already submitted</span>
          </div>
          <p className="text-slate-700 text-sm"><strong>Main complaint:</strong> {existing.main_symptom}</p>
          <p className="text-slate-600 text-sm mt-1">You can update them below.</p>
        </div>
      )}

      {error && <ErrorBox msg={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormCard title="Main Complaint">
          <textarea
            value={form.main_symptom}
            onChange={e => setForm(p => ({ ...p, main_symptom: e.target.value }))}
            placeholder="e.g. Persistent fever and cough for the past 4 days..."
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none transition-all"
          />
        </FormCard>

        <div className="grid grid-cols-2 gap-4">
          <FormCard title="Duration">
            <input
              value={form.duration}
              onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
              placeholder="e.g. 4 days, 2 weeks"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all"
            />
          </FormCard>
          <FormCard title="Severity">
            <select
              value={form.severity}
              onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
            >
              {['Mild', 'Moderate', 'Severe', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormCard>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormCard title="Onset">
            <select
              value={form.onset}
              onChange={e => setForm(p => ({ ...p, onset: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-teal-500/50 transition-all"
            >
              {['Sudden', 'Gradual', 'Intermittent'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormCard>
          <FormCard title="Associated Symptoms">
            <input
              value={form.associated_symptoms}
              onChange={e => setForm(p => ({ ...p, associated_symptoms: e.target.value }))}
              placeholder="e.g. Headache, fatigue"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all"
            />
          </FormCard>
        </div>

        <FormCard title="Additional Observations (optional)">
          <textarea
            value={form.observations}
            onChange={e => setForm(p => ({ ...p, observations: e.target.value }))}
            placeholder="Anything else your doctor should know..."
            rows={2}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none transition-all"
          />
        </FormCard>

        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><CheckCircle className="w-4 h-4" />Submit Symptoms</>}
        </button>
      </form>
    </div>
  );
};

// ─── Medical History Tab ─────────────────────────────────────────────────────
const HistoryTab: React.FC<{ profile: any; onRefresh: () => void; onSuccess: (m: string) => void }> = ({ profile, onRefresh, onSuccess }) => {
  const h = profile?.medical_history;
  const [form, setForm] = useState({
    previous_diseases: h?.previous_diseases || '',
    previous_surgeries: h?.previous_surgeries || '',
    chronic_conditions: h?.chronic_conditions || '',
    family_history: h?.family_history || '',
    previous_relevant_episodes: h?.previous_relevant_episodes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.updateMedicalHistory(form);
      await onRefresh();
      onSuccess('Medical history saved!');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Medical History</h2>
        <p className="text-slate-600 text-sm mt-1">Share your health background. Write "None" if not applicable.</p>
      </div>
      {error && <ErrorBox msg={error} />}
      <form onSubmit={handleSave} className="space-y-4">
        {[
          { key: 'previous_diseases', label: 'Previous Diseases / Illnesses', placeholder: 'e.g. Diabetes, Hypertension, Malaria (2019)' },
          { key: 'chronic_conditions', label: 'Chronic Conditions', placeholder: 'e.g. Asthma, Type 2 Diabetes' },
          { key: 'previous_surgeries', label: 'Past Surgeries / Procedures', placeholder: 'e.g. Appendectomy (2018), None' },
          { key: 'family_history', label: 'Family History', placeholder: 'e.g. Father — Hypertension; Mother — Diabetes' },
          { key: 'previous_relevant_episodes', label: 'Previous Relevant Episodes', placeholder: 'e.g. Similar fever 6 months ago, hospitalized for 3 days' },
        ].map(({ key, label, placeholder }) => (
          <FormCard key={key} title={label}>
            <textarea
              value={(form as any)[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              rows={2}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none transition-all"
            />
          </FormCard>
        ))}
        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><CheckCircle className="w-4 h-4" />Save Medical History</>}
        </button>
      </form>
    </div>
  );
};

// ─── Medications Tab ─────────────────────────────────────────────────────────
const MedicationsTab: React.FC<{ profile: any; onRefresh: () => void; onSuccess: (m: string) => void }> = ({ profile, onRefresh, onSuccess }) => {
  const [form, setForm] = useState({ name: '', dose: '', frequency: '', duration: 'Ongoing' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.dose.trim() || !form.frequency.trim()) { setError('Name, dose, and frequency are required'); return; }
    setSaving(true); setError('');
    try {
      await api.addMedication(form);
      await onRefresh();
      setForm({ name: '', dose: '', frequency: '', duration: 'Ongoing' });
      onSuccess('Medication added!');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id: number) => {
    try { await api.removeMedication(id); await onRefresh(); onSuccess('Medication removed'); }
    catch (err) { console.error(err); }
  };

  const meds = profile?.medications || [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Current Medications</h2>
        <p className="text-slate-600 text-sm mt-1">List all medicines you are currently taking, including supplements.</p>
      </div>

      {meds.length > 0 && (
        <div className="space-y-2">
          {meds.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 bg-white border border-white/8 rounded-xl px-4 py-3">
              <Pill className="w-4 h-4 text-blue-800 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm font-semibold">{m.name}</p>
                <p className="text-slate-600 text-xs">{m.dose} · {m.frequency} · {m.duration}</p>
              </div>
              <button onClick={() => handleRemove(m.id)} className="p-1.5 text-slate-600 hover:text-red-800 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorBox msg={error} />}

      <form onSubmit={handleAdd} className="bg-white border border-white/8 rounded-2xl p-5 space-y-3">
        <p className="text-slate-700 text-sm font-semibold">Add a Medication</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Medication name" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all" />
          <input value={form.dose} onChange={e => setForm(p => ({ ...p, dose: e.target.value }))} placeholder="Dose (e.g. 500mg)" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all" />
          <input value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} placeholder="Frequency (e.g. Once daily)" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all" />
          <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="Duration (e.g. Ongoing)" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-slate-900 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Medication
        </button>
      </form>
    </div>
  );
};

// ─── Allergies Tab ───────────────────────────────────────────────────────────
const AllergiesTab: React.FC<{ profile: any; onRefresh: () => void; onSuccess: (m: string) => void }> = ({ profile, onRefresh, onSuccess }) => {
  const [form, setForm] = useState({ allergen: '', reaction: '', severity: 'Moderate' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.allergen.trim() || !form.reaction.trim()) { setError('Allergen and reaction are required'); return; }
    setSaving(true); setError('');
    try {
      await api.addAllergy(form);
      await onRefresh();
      setForm({ allergen: '', reaction: '', severity: 'Moderate' });
      onSuccess('Allergy recorded!');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id: number) => {
    try { await api.removeAllergy(id); await onRefresh(); onSuccess('Allergy removed'); }
    catch (err) { console.error(err); }
  };

  const severityColor: Record<string, string> = {
    Mild: 'text-yellow-400 bg-yellow-500/10',
    Moderate: 'text-orange-400 bg-orange-500/10',
    Severe: 'text-red-800 bg-red-500/10',
  };

  const allergies = profile?.allergies || [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Allergies</h2>
        <p className="text-slate-600 text-sm mt-1">List any known allergies to medications, food, or substances.</p>
      </div>

      {allergies.length > 0 && (
        <div className="space-y-2">
          {allergies.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 bg-white border border-white/8 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-800 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm font-semibold">{a.allergen}</p>
                <p className="text-slate-600 text-xs">{a.reaction}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColor[a.severity] || severityColor.Moderate}`}>{a.severity}</span>
              <button onClick={() => handleRemove(a.id)} className="p-1.5 text-slate-600 hover:text-red-800 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorBox msg={error} />}

      <form onSubmit={handleAdd} className="bg-white border border-white/8 rounded-2xl p-5 space-y-3">
        <p className="text-slate-700 text-sm font-semibold">Add an Allergy</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.allergen} onChange={e => setForm(p => ({ ...p, allergen: e.target.value }))} placeholder="Allergen (e.g. Penicillin)" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all" />
          <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-teal-500/50 transition-all">
            {['Mild', 'Moderate', 'Severe'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <input value={form.reaction} onChange={e => setForm(p => ({ ...p, reaction: e.target.value }))} placeholder="Reaction (e.g. Skin rash, difficulty breathing)" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-all" />
        <button type="submit" disabled={saving} className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Allergy
        </button>
      </form>
    </div>
  );
};

// ─── Appointments Tab ────────────────────────────────────────────────────────
const AppointmentsTab: React.FC<{ profile: any; onRefresh: () => void; onSuccess: (m: string) => void }> = ({ profile, onRefresh, onSuccess }) => {
  const [form, setForm] = useState({ appointment_date: '', appointment_time: '09:00 AM', complaint: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.appointment_date || !form.complaint.trim()) { setError('Date and reason are required'); return; }
    setSaving(true); setError('');
    try {
      await api.bookAppointment(form);
      await onRefresh();
      setForm({ appointment_date: '', appointment_time: '09:00 AM', complaint: '' });
      onSuccess('Appointment booked successfully!');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const appts = profile?.appointments || [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Book an Appointment</h2>
        <p className="text-slate-600 text-sm mt-1">Schedule a visit. Make sure to submit your symptoms first.</p>
      </div>

      {appts.length > 0 && (
        <div className="space-y-2">
          <p className="text-slate-600 text-sm font-semibold">Your Appointments</p>
          {appts.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 bg-white border border-white/8 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-purple-700 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-slate-900 text-sm font-semibold">{a.date} at {a.time}</p>
                <p className="text-slate-600 text-xs">{a.complaint}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === 'waiting' ? 'bg-amber-500/10 text-amber-800' : 'bg-emerald-500/10 text-emerald-800'}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorBox msg={error} />}

      <form onSubmit={handleBook} className="bg-white border border-white/8 rounded-2xl p-5 space-y-4">
        <p className="text-slate-700 text-sm font-semibold">New Appointment</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-600 text-xs mb-1.5 block">Date</label>
            <input type="date" value={form.appointment_date} onChange={e => setForm(p => ({ ...p, appointment_date: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-teal-500/50 transition-all" />
          </div>
          <div>
            <label className="text-slate-600 text-xs mb-1.5 block">Preferred Time</label>
            <select value={form.appointment_time} onChange={e => setForm(p => ({ ...p, appointment_time: e.target.value }))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-teal-500/50 transition-all">
              {['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-slate-600 text-xs mb-1.5 block">Reason for Visit</label>
          <textarea value={form.complaint} onChange={e => setForm(p => ({ ...p, complaint: e.target.value }))} placeholder="Brief description of your concern..." rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none transition-all" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-purple-600 hover:bg-purple-500 text-slate-900 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Booking...</> : <><Calendar className="w-3.5 h-3.5" />Book Appointment</>}
        </button>
      </form>
    </div>
  );
};

// ─── Consultations Tab ───────────────────────────────────────────────────────
const ConsultationsTab: React.FC = () => {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyConsultations(), api.getMyReports()]).then(([consultationData, reportData]) => { setConsultations(consultationData); setReports(reportData); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-teal-800" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Health Documents</h2>
        <p className="text-slate-600 text-sm mt-1">Your lab reports, consultation summaries, and doctor-approved plans.</p>
      </div>

      <section><h3 className="mb-3 text-sm font-semibold text-slate-800">Lab reports</h3>{reports.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No medical reports uploaded yet.</div> : <div className="space-y-3">{reports.map((report: any) => <article key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h4 className="font-semibold text-slate-900">{report.title}</h4><p className="mt-1 text-xs text-slate-500">{report.report_type} · {report.uploaded_at ? new Date(report.uploaded_at).toLocaleDateString() : 'Date unavailable'}</p>{report.summary_findings && <p className="mt-3 text-sm text-slate-700">{report.summary_findings}</p>}{report.results?.length > 0 && <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-700">{report.results.map((result: any, index: number) => <li key={index} className="flex justify-between gap-3"><span>{result.test_name}</span><span className="font-medium">{result.value} {result.unit}</span></li>)}</ul>}</article>)}</div>}</section>

      <section><h3 className="mb-3 text-sm font-semibold text-slate-800">Consultations and prescriptions</h3>{consultations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No consultations yet. Your doctor’s approved plans will appear here.</div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c: any) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{c.chief_complaint}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{c.visit_date}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.doctor_review_status === 'Doctor Verified' ? 'bg-emerald-500/15 text-emerald-800' : 'bg-amber-500/15 text-amber-800'}`}>
                  {c.doctor_review_status}
                </span>
              </div>
              {c.diagnosis && <div className="bg-white rounded-xl px-3 py-2 mb-2"><p className="text-slate-600 text-xs font-medium">Diagnosis</p><p className="text-slate-700 text-sm mt-0.5">{c.diagnosis}</p></div>}
              {c.doctor_advice && <div className="bg-white rounded-xl px-3 py-2 mb-2"><p className="text-slate-600 text-xs font-medium">Doctor's Advice</p><p className="text-slate-700 text-sm mt-0.5">{c.doctor_advice}</p></div>}
              {c.approved_by && <p className="text-slate-600 text-xs mt-2">Approved by {c.approved_by}</p>}
            </div>
          ))}
        </div>
      )}</section>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FormCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <label className="text-slate-600 text-xs font-medium mb-1.5 block">{title}</label>
    {children}
  </div>
);

const ErrorBox: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
    <AlertTriangle className="w-4 h-4 text-red-800 mt-0.5 flex-shrink-0" />
    <p className="text-red-700 text-sm">{msg}</p>
  </div>
);
