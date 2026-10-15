import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/auth/LandingPage';
import { PatientAuthPage } from './components/auth/PatientAuthPage';
import { PatientPortalDashboard } from './components/patient/PatientPortalDashboard';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { DoctorDashboard } from './components/dashboard/DoctorDashboard';
import { PatientQueue } from './components/queue/PatientQueue';
import { PatientProfile } from './components/patient/PatientProfile';
import { FollowupTracker } from './components/followup/FollowupTracker';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { LoginView } from './components/auth/LoginView';
import { DemoTourModal } from './components/demo/DemoTourModal';
import { api } from './services/api';
import { PatientListItem } from './types';
import { Activity } from 'lucide-react';

type AppScreen =
  | 'landing'
  | 'patient-auth'
  | 'doctor-auth'
  | 'patient-portal'
  | 'doctor-portal';

const AppointmentsView: React.FC<{ patients: PatientListItem[]; onSelectPatient: (id: number) => void }> = ({ patients, onSelectPatient }) => (
  <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6"><h1 className="text-xl font-semibold text-slate-900">Appointments</h1><p className="mt-1 text-sm text-slate-500">Today’s scheduled visits and current status.</p></div>
    {patients.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-500">No upcoming appointments.</p> : <div className="divide-y divide-slate-100">{patients.map(patient => <div key={patient.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"><div><p className="font-medium text-slate-900">{patient.name}</p><p className="mt-1 text-sm text-slate-600">{patient.active_appointment?.appointment_time || 'Time not set'} · {patient.active_appointment?.complaint || 'Appointment'}</p></div><button onClick={() => onSelectPatient(patient.id)} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Open Patient</button></div>)}</div>}
  </section>
);

// ── Doctor / Staff Workspace ──────────────────────────────────────────────────
const DoctorWorkspace: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [showDemoTour, setShowDemoTour] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'overview' | 'audit'>('overview');
  const [profileInitialTab, setProfileInitialTab] = useState<'ai-assistant' | 'labs'>('ai-assistant');
  const { user } = useAuth();

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const queue = await api.getPatientsQueue();
      setPatients(user?.is_demo ? queue.slice(0, 3) : queue);
    }
    catch (err) { console.error('Failed to fetch patients:', err); }
    finally { setLoadingPatients(false); }
  };

  const handleSelectPatient = (patientId: number) => {
    setProfileInitialTab('ai-assistant');
    setSelectedPatientId(patientId);
    setCurrentTab('patient-profile');
  };

  const handleOpenPatientReports = (patientId: number) => {
    setProfileInitialTab('labs');
    setSelectedPatientId(patientId);
    setCurrentTab('patient-profile');
  };

  const handleJumpToDemoStep = (stepNumber: number) => {
    if (stepNumber === 1) setCurrentTab('dashboard');
    else { setSelectedPatientId(patients[0]?.id || 1); setCurrentTab('patient-profile'); }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onStartDemoTour={() => setShowDemoTour(true)} />
        <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          selectedPatientName={selectedPatient?.name}
          selectedPatientMrn={selectedPatient?.mrn}
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DoctorDashboard
              patients={patients}
              loading={loadingPatients}
              onSelectPatient={handleSelectPatient}
              onNavigateToQueue={() => setCurrentTab('patients')}
              onNavigateToFollowups={() => setCurrentTab('followups')}
            />
          )}
          {currentTab === 'patients' && (
            <PatientQueue patients={patients} onSelectPatient={handleSelectPatient} selectedPatientId={selectedPatientId} />
          )}
          {currentTab === 'appointments' && <AppointmentsView patients={patients} onSelectPatient={handleSelectPatient} />}
          {currentTab === 'patient-profile' && (
            <PatientProfile patientId={selectedPatientId} initialTab={profileInitialTab} onBackToQueue={() => setCurrentTab(profileInitialTab === 'labs' ? 'reports' : 'patients')} />
          )}
          {currentTab === 'reports' && (
            <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="border-b border-slate-200 px-5 py-4 sm:px-6"><h1 className="text-xl font-semibold text-slate-900">Reports</h1><p className="mt-1 text-sm text-slate-500">Choose a patient to review their reports and results.</p></header>{patients.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-500">No reports available.</p> : <div className="divide-y divide-slate-100">{patients.map(patient => <div key={patient.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"><div><p className="font-medium text-slate-900">{patient.name}</p><p className="mt-1 text-sm text-slate-500">{patient.mrn} · {patient.active_appointment?.complaint || 'Current visit'}</p></div><button onClick={() => handleOpenPatientReports(patient.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open Reports</button></div>)}</div>}</section>
          )}
          {currentTab === 'followups' && <FollowupTracker onSelectPatient={handleSelectPatient} />}
          {['settings', 'analytics', 'audit'].includes(currentTab) && <section className="mx-auto max-w-5xl space-y-4"><header><h1 className="text-xl font-semibold text-slate-900">Settings & workspace details</h1><p className="mt-1 text-sm text-slate-500">Secondary information for your clinical workspace.</p></header><div className="flex gap-2"><button onClick={() => setSettingsTab('overview')} className={`rounded-lg px-3 py-2 text-sm font-medium ${settingsTab === 'overview' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>Analytics</button><button onClick={() => setSettingsTab('audit')} className={`rounded-lg px-3 py-2 text-sm font-medium ${settingsTab === 'audit' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>Audit history</button></div>{settingsTab === 'overview' ? <AnalyticsView /> : <AuditTrailView />}</section>}
        </main>
      </div>
      <DemoTourModal isOpen={showDemoTour} onClose={() => setShowDemoTour(false)} onJumpToStep={handleJumpToDemoStep} />
    </div>
  );
};

// ── Main App Router ───────────────────────────────────────────────────────────
const MainApp: React.FC = () => {
  const { user, loading: authLoading, demoLogin } = useAuth();
  const [screen, setScreen] = useState<AppScreen>('landing');

  // Once auth resolves, figure out which screen to show
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setScreen('landing');
    } else if (user.role === 'patient') {
      setScreen('patient-portal');
    } else {
      setScreen('doctor-portal');
    }
  }, [user, authLoading]);

  // Loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Activity className="w-8 h-8 text-teal-400 animate-pulse mx-auto" />
          <p className="text-slate-400 text-sm font-semibold tracking-wide">MediAssist AI — Loading...</p>
        </div>
      </div>
    );
  }

  // ── Landing page (not logged in) ────────────────────────────────────────────
  if (!user) {
    if (screen === 'patient-auth') {
      return (
        <PatientAuthPage
          onBack={() => setScreen('landing')}
          onSuccess={() => setScreen('patient-portal')}
        />
      );
    }
    if (screen === 'doctor-auth') {
      return (
        <LoginView
          onBack={() => setScreen('landing')}
          onLoginSuccess={() => setScreen('doctor-portal')}
        />
      );
    }
    // Default: show landing
    return (
      <LandingPage
        onSelectPortal={(portal) => {
          if (portal === 'patient') setScreen('patient-auth');
          else setScreen('doctor-auth');
        }}
        onSelectDemo={(role) => demoLogin(role)}
      />
    );
  }

  // ── Authenticated: Patient Portal ────────────────────────────────────────────
  if (user.role === 'patient') {
    return <PatientPortalDashboard />;
  }

  // ── Authenticated: Doctor / Staff / Admin Workspace ──────────────────────────
  return <DoctorWorkspace />;
};

export const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
