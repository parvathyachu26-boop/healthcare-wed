import React from 'react';
import { LayoutDashboard, Users, CalendarDays, FileText, CalendarClock, Settings2 } from 'lucide-react';

export type NavItem = 'dashboard' | 'patients' | 'patient-profile' | 'appointments' | 'reports' | 'followups' | 'analytics' | 'audit' | 'settings';
interface SidebarProps { currentTab: NavItem; onSelectTab: (tab: NavItem) => void; selectedPatientName?: string; selectedPatientMrn?: string; }

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'followups', label: 'Follow-ups', icon: CalendarClock },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, selectedPatientName, selectedPatientMrn }) => {
  const isSettingsTab = ['settings', 'analytics', 'audit'].includes(currentTab);
  return <aside className="w-full shrink-0 border-b border-slate-200 bg-white lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-60 lg:border-b-0 lg:border-r">
    <div className="p-3 lg:p-4">
      <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:block">Workspace</p>
      <nav aria-label="Doctor navigation" className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = id === 'settings' ? isSettingsTab : id === 'patients' ? currentTab === 'patients' || currentTab === 'patient-profile' : currentTab === id;
          return <button key={id} onClick={() => onSelectTab(id)} aria-current={active ? 'page' : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:w-full ${active ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="h-4 w-4" /><span>{label}</span></button>;
        })}
      </nav>
      {selectedPatientName && <div className="mt-5 hidden rounded-xl border border-slate-200 bg-slate-50 p-3 lg:block"><p className="text-[11px] text-slate-500">Current patient</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{selectedPatientName}</p><p className="text-xs text-slate-500">{selectedPatientMrn}</p><button onClick={() => onSelectTab('patient-profile')} className="mt-2 text-xs font-semibold text-blue-700 hover:underline">Open patient</button></div>}
      <div className="mt-6 hidden rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 lg:block">AI-generated information is for clinical review. The doctor retains final decision authority.</div>
    </div>
  </aside>;
};
