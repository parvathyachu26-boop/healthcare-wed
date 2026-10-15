import React, { useState } from 'react';
import { ArrowLeft, UserRound, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface PatientAuthPageProps { onBack: () => void; onSuccess: () => void; }
type Mode = 'login' | 'register';
const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600';

export const PatientAuthPage: React.FC<PatientAuthPageProps> = ({ onBack, onSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', date_of_birth: '', sex: 'Female', contact: '', emergency_contact: '', blood_group: '', password: '', confirm_password: '' });
  const update = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try { login(await api.patientLogin(email.trim(), password)); onSuccess(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign in failed. Check your email and password.'); }
    finally { setLoading(false); }
  };
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const birth = new Date(form.date_of_birth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    if (!form.date_of_birth || age < 1 || age > 120) { setError('Enter a valid date of birth.'); return; }
    if (form.password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (form.password !== form.confirm_password) { setError('The passwords do not match.'); return; }
    if (!acceptedTerms) { setError('Please agree to the terms and privacy policy to continue.'); return; }
    setLoading(true);
    try {
      const username = form.email.trim().toLowerCase();
      login(await api.patientRegister({ full_name: form.full_name.trim(), email: username, username, password: form.password, age, sex: form.sex, date_of_birth: form.date_of_birth, contact: form.contact.trim(), blood_group: form.blood_group || undefined, emergency_contact: form.emergency_contact.trim() || undefined }));
      onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'Account creation failed. Please try again.'); }
    finally { setLoading(false); }
  };
  const field = (label: string, name: keyof typeof form, type = 'text', required = true) => <label className="block text-sm font-medium text-slate-700">{label}<input className={`${inputClass} mt-1.5`} type={type} required={required} value={form[name]} onChange={e => update(name, e.target.value)} /></label>;

  return <main className="min-h-screen bg-[#f7f9fb] text-slate-900 px-5 py-8 sm:py-12">
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-600 rounded"><ArrowLeft className="w-4 h-4" />Change account type</button>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-9 shadow-sm">
        <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 grid place-items-center"><UserRound className="w-5 h-5" /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">MediAssist AI · Patient</p><h1 className="text-2xl font-bold tracking-tight">{mode === 'register' ? 'Create your patient account' : 'Patient Sign In'}</h1></div></div>
        <p className="mt-2 text-sm text-slate-600">{mode === 'register' ? 'Manage your health information in one secure place.' : 'Sign in to view and manage your health information.'}</p>
        <div className="mt-6 flex gap-5 border-b border-slate-200 text-sm"><button onClick={() => { setMode('login'); setError(''); }} className={`pb-3 ${mode === 'login' ? 'border-b-2 border-teal-700 font-semibold text-teal-800' : 'text-slate-500'}`}>Sign In</button><button onClick={() => { setMode('register'); setError(''); }} className={`pb-3 ${mode === 'register' ? 'border-b-2 border-teal-700 font-semibold text-teal-800' : 'text-slate-500'}`}>Create Account</button></div>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {mode === 'login' ? <form onSubmit={handleLogin} className="mt-5 space-y-4 max-w-md">
          <label className="block text-sm font-medium text-slate-700">Email Address<input className={`${inputClass} mt-1.5`} type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input className={`${inputClass} mt-1.5`} type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
          <button type="button" onClick={() => setError('Password reset is not configured yet. Please contact your care team.')} className="text-sm text-teal-700 hover:underline">Forgot password?</button>
          <button disabled={loading} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">{loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing in…</span> : 'Sign In'}</button>
          <p className="text-sm text-slate-600">New to MediAssist? <button type="button" onClick={() => setMode('register')} className="font-semibold text-teal-700 hover:underline">Create a patient account</button></p>
        </form> : <form onSubmit={handleRegister} className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{field('Full Name', 'full_name')}{field('Email Address', 'email', 'email')}{field('Date of Birth', 'date_of_birth', 'date')}
            <label className="block text-sm font-medium text-slate-700">Sex<select className={`${inputClass} mt-1.5`} value={form.sex} onChange={e => update('sex', e.target.value)}><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label>
            {field('Phone Number', 'contact', 'tel')}{field('Emergency Contact (optional)', 'emergency_contact', 'tel', false)}
            <label className="block text-sm font-medium text-slate-700">Blood Group (optional)<select className={`${inputClass} mt-1.5`} value={form.blood_group} onChange={e => update('blood_group', e.target.value)}><option value="">Prefer not to say</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group}>{group}</option>)}</select></label>
            {field('Password', 'password', 'password')}{field('Confirm Password', 'confirm_password', 'password')}</div>
          <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 accent-teal-700" /><span>I agree to the terms and privacy policy.</span></label>
          <button disabled={loading} className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">{loading ? 'Creating account…' : 'Create Patient Account'}</button>
          <p className="text-sm text-slate-600">Already have an account? <button type="button" onClick={() => setMode('login')} className="font-semibold text-teal-700 hover:underline">Sign in</button></p>
        </form>}
      </section>
      <p className="mt-4 text-center text-xs text-slate-500">Your Health Assistant provides general information and does not replace professional medical advice.</p>
    </div>
  </main>;
};
