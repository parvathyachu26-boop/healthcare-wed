import React from 'react';
import { Activity, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps { onStartDemoTour: () => void; }

export const Navbar: React.FC<NavbarProps> = ({ onStartDemoTour }) => {
  const { user, logout } = useAuth();
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-white"><Activity className="h-5 w-5" /></span><div><span className="font-bold text-slate-900">MediAssist <span className="text-blue-700">AI</span></span><span className="ml-2 hidden text-xs text-slate-500 sm:inline">Clinical workspace</span></div>
        {user?.is_demo && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-800">DEMO</span>}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user?.is_demo && <span className="hidden text-xs text-slate-500 md:inline">Demo Environment · Fictional records</span>}
        <button onClick={onStartDemoTour} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600">How it works</button>
        <button aria-label="Notifications" className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:inline-flex"><Bell className="h-4 w-4" /></button>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{user?.full_name?.[0] || 'U'}</span><span className="hidden max-w-36 truncate text-sm font-medium text-slate-700 md:inline">{user?.full_name}</span><button onClick={logout} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600"><LogOut className="h-4 w-4" /></button></div>
      </div>
    </div>
  </header>;
};
