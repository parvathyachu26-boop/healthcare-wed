import React, { useMemo, useState } from 'react';
import { PatientListItem } from '../../types';
import { ArrowRight, Search } from 'lucide-react';

interface PatientQueueProps { patients: PatientListItem[]; onSelectPatient: (patientId: number) => void; selectedPatientId?: number; }
const badge: Record<string, string> = { Urgent: 'border-red-200 bg-red-50 text-red-800', High: 'border-orange-200 bg-orange-50 text-orange-800', Routine: 'border-slate-200 bg-slate-100 text-slate-700' };

export const PatientQueue: React.FC<PatientQueueProps> = ({ patients, onSelectPatient, selectedPatientId }) => {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('All');
  const filtered = useMemo(() => patients.filter(patient => {
    const query = search.trim().toLowerCase();
    const matchesText = !query || patient.name.toLowerCase().includes(query) || patient.mrn.toLowerCase().includes(query) || (patient.active_appointment?.complaint || '').toLowerCase().includes(query);
    return matchesText && (priority === 'All' || patient.priority_level === priority);
  }), [patients, search, priority]);

  return <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-end sm:justify-between sm:px-6"><div><h1 className="text-xl font-semibold text-slate-900">Patients</h1><p className="mt-1 text-sm text-slate-500">Search and open a patient record.</p></div><div className="flex flex-wrap gap-2"><label className="relative"><span className="sr-only">Search patients</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:w-56" /></label><label className="sr-only" htmlFor="priority-filter">Filter by priority</label><select id="priority-filter" value={priority} onChange={e => setPriority(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><option>All</option><option>Urgent</option><option>High</option><option>Routine</option></select></div></header>
    {filtered.length === 0 ? <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-800">No matching patients</p><p className="mt-1 text-sm text-slate-500">Try a different name or priority.</p></div> : <div className="divide-y divide-slate-100">{filtered.map(patient => { const apt = patient.active_appointment; const level = patient.priority_level || 'Routine'; return <article key={patient.id} className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${selectedPatientId === patient.id ? 'bg-blue-50/50' : ''}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{patient.name}</h2><span className="text-sm text-slate-500">{patient.age} · {patient.sex}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${badge[level] || badge.Routine}`}>{level.toUpperCase()}</span></div><p className="mt-1 truncate text-sm text-slate-700">{apt?.complaint || 'No visit details available'}</p><p className="mt-1 text-xs text-slate-500">Waiting {apt?.waiting_time_minutes ?? 0} min · Patient ID {patient.mrn}</p></div><button onClick={() => onSelectPatient(patient.id)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 sm:self-center">Open Patient <ArrowRight className="h-4 w-4" /></button></article>; })}</div>}
  </section>;
};
