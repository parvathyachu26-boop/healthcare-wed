import React, { useState } from 'react';
import { Activity, ArrowRight, HeartPulse, Stethoscope, UserRound, X } from 'lucide-react';

interface LandingPageProps {
  onSelectPortal: (portal: 'patient' | 'doctor') => void;
  onSelectDemo: (portal: 'patient' | 'doctor') => Promise<void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPortal, onSelectDemo }) => {
  const [showDemoChoices, setShowDemoChoices] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [startingDemo, setStartingDemo] = useState(false);
  const startDemo = async (portal: 'patient' | 'doctor') => {
    setStartingDemo(true); setDemoError('');
    try { await onSelectDemo(portal); }
    catch { setDemoError('The demo could not start. Check that the MediAssist service is running, then try again.'); setStartingDemo(false); }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-slate-900 flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-blue-700 text-white grid place-items-center"><Activity className="w-5 h-5" /></span>
          <span className="text-lg font-bold tracking-tight">MediAssist <span className="text-blue-700">AI</span></span>
        </div>
        <span className="hidden sm:block text-sm text-slate-500">AI prepares. Doctors decide.</span>
      </header>

      <section className="flex-1 w-full max-w-4xl mx-auto px-6 py-14 sm:py-20 flex flex-col justify-center">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold text-blue-700 mb-3">A clearer way to coordinate care</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome to MediAssist AI</h1>
          <p className="mt-3 text-lg text-slate-600">How would you like to continue?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => onSelectPortal('doctor')} className="group text-left rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition">
            <span className="w-12 h-12 grid place-items-center rounded-xl bg-blue-50 text-blue-700"><Stethoscope className="w-6 h-6" /></span>
            <span className="mt-6 flex items-center justify-between"><span className="text-xl font-semibold">I’m a Doctor</span><ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-700" /></span>
            <span className="block mt-2 text-sm text-slate-600">Review your patient queue and clinical summaries.</span>
          </button>
          <button onClick={() => onSelectPortal('patient')} className="group text-left rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:border-teal-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition">
            <span className="w-12 h-12 grid place-items-center rounded-xl bg-teal-50 text-teal-700"><UserRound className="w-6 h-6" /></span>
            <span className="mt-6 flex items-center justify-between"><span className="text-xl font-semibold">I’m a Patient</span><ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-700" /></span>
            <span className="block mt-2 text-sm text-slate-600">Manage your health details, reports, and care.</span>
          </button>
        </div>

        <div className="mt-8">
          <button onClick={() => setShowDemoChoices(true)} className="text-sm font-medium text-slate-600 hover:text-blue-700 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">Try Demo</button>
          <span className="ml-3 text-xs text-slate-500">Explore with fictional sample records</span>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl px-6 py-5 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2"><HeartPulse className="w-4 h-4 text-teal-700" /> Clinical decision support with the doctor in control.</footer>

      {showDemoChoices && <div className="fixed inset-0 z-50 bg-slate-900/30 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="demo-title">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
          <div className="flex items-start justify-between"><div><span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Demo environment</span><h2 id="demo-title" className="mt-1 text-xl font-semibold">Choose a demo</h2><p className="mt-1 text-sm text-slate-600">All demo information is fictional.</p></div><button aria-label="Close" onClick={() => setShowDemoChoices(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button></div>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <button disabled={startingDemo} onClick={() => void startDemo('doctor')} className="rounded-xl border border-slate-200 p-4 text-left hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60"><Stethoscope className="w-5 h-5 text-blue-700" /><span className="block mt-3 font-semibold">Doctor Demo</span><span className="block mt-1 text-xs text-slate-600">Review three sample patients</span></button>
            <button disabled={startingDemo} onClick={() => void startDemo('patient')} className="rounded-xl border border-slate-200 p-4 text-left hover:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-60"><UserRound className="w-5 h-5 text-teal-700" /><span className="block mt-3 font-semibold">Patient Demo</span><span className="block mt-1 text-xs text-slate-600">Explore the patient portal</span></button>
          </div>
          {startingDemo && !demoError && <p className="mt-4 text-sm text-slate-500" role="status">Starting the demo…</p>}
          {demoError && <p className="mt-4 text-sm text-red-700" role="alert">{demoError}</p>}
        </div>
      </div>}
    </main>
  );
};
