import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PatientListItem } from '../../types';
import { AlertTriangle, ArrowRight, CalendarDays, Clock3, Users } from 'lucide-react';

interface DoctorDashboardProps { patients: PatientListItem[]; loading?: boolean; onSelectPatient: (patientId: number) => void; onNavigateToQueue: () => void; onNavigateToFollowups: () => void; }

const priorityStyle: Record<string, string> = { Urgent: 'bg-red-50 text-red-800 border-red-200', High: 'bg-orange-50 text-orange-800 border-orange-200', Routine: 'bg-slate-100 text-slate-700 border-slate-200' };

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ patients, loading = false, onSelectPatient, onNavigateToQueue, onNavigateToFollowups }) => {
  const { user } = useAuth();
  const waitingCount = patients.filter(p => p.active_appointment?.status === 'waiting').length;
  const urgentCount = patients.filter(p => p.priority_level === 'Urgent').length;
  const cards = [
    { label: "Today's Patients", value: patients.length, icon: Users, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Waiting', value: waitingCount, icon: Clock3, tone: 'text-orange-700 bg-orange-50' },
    { label: 'Urgent', value: urgentCount, icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
  ];
  return <div className="mx-auto max-w-5xl space-y-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Clinic open <span className="ml-1 inline-block h-2 w-2 rounded-full bg-emerald-500" /></p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Good morning, {user?.full_name || 'Doctor'}</h1><p className="mt-1 text-sm text-slate-600">Here’s your patient queue for today.</p></div><button onClick={onNavigateToFollowups} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><CalendarDays className="h-4 w-4" />View follow-ups</button></header>
    <section aria-label="Today's clinic summary" className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-600">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</p></div>)}</section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-slate-900">Today’s Patients</h2><p className="mt-0.5 text-sm text-slate-500">Prioritized for a quick review.</p></div><button onClick={onNavigateToQueue} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">View all <ArrowRight className="h-4 w-4" /></button></div>
      {patients.length === 0 ? <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-800">{loading ? 'Loading today’s queue…' : 'You’re all caught up.'}</p>{!loading && <p className="mt-1 text-sm text-slate-500">No patients are waiting right now.</p>}</div> : <div className="divide-y divide-slate-100">{patients.slice(0, 6).map(patient => { const priority = patient.priority_level || 'Routine'; const apt = patient.active_appointment; return <article key={patient.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{patient.name}</h3><span className="text-sm text-slate-500">{patient.age} · {patient.sex}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${priorityStyle[priority] || priorityStyle.Routine}`}>{priority.toUpperCase()}</span></div><p className="mt-1 truncate text-sm text-slate-700">{apt?.complaint || 'Visit details available'}</p><p className="mt-1 text-xs text-slate-500">Waiting {apt?.waiting_time_minutes ?? 0} min</p></div><button onClick={() => onSelectPatient(patient.id)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:self-center">Open Patient <ArrowRight className="h-4 w-4" /></button></article>; })}</div>}
    </section>
  </div>;
};
