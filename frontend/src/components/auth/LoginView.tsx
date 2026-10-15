import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface LoginViewProps { onLoginSuccess?: () => void; onBack?: () => void; }
type Mode = 'login' | 'register';

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', license_number: '', specialization: '', hospital_name: '', password: '', confirm_password: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { login(await api.login(identifier.trim(), password)); onLoginSuccess?.(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign in failed. Check your email and password.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (form.password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (form.password !== form.confirm_password) { setError('The passwords do not match.'); return; }
    if (!acceptedTerms) { setError('Please agree to the terms and privacy policy to continue.'); return; }
    setLoading(true);
    try {
      login(await api.doctorRegister({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim(), license_number: form.license_number.trim(), specialization: form.specialization.trim(), hospital_name: form.hospital_name.trim(), password: form.password }));
      onLoginSuccess?.();
    } catch (err) { setError(err instanceof Error ? err.message : 'Account creation failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const field = (label: string, name: keyof typeof form, type = 'text', required = true) => <label className="block text-sm font-medium text-slate-700">{label}<input className={`${inputClass} mt-1.5`} type={type} required={required} value={form[name]} onChange={event => update(name, event.target.value)} autoComplete={name === 'password' ? 'new-password' : undefined} /></label>;

  return <main className="min-h-screen bg-[#f7f9fb] text-slate-900 px-5 py-8 sm:py-12">
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 rounded"><ArrowLeft className="w-4 h-4" />Change account type</button>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-9 shadow-sm">
        <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 grid place-items-center"><Stethoscope className="w-5 h-5" /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">MediAssist AI · Doctor</p><h1 className="text-2xl font-bold tracking-tight">{mode === 'register' ? 'Create your doctor account' : 'Doctor Sign In'}</h1></div></div>
        <p className="mt-2 text-sm text-slate-600">{mode === 'register' ? 'Set up your secure clinical workspace.' : 'Sign in to your secure clinical workspace.'}</p>
        <div className="mt-6 flex gap-5 border-b border-slate-200 text-sm"><button onClick={() => { setMode('login'); setError(''); }} className={`pb-3 ${mode === 'login' ? 'border-b-2 border-blue-700 font-semibold text-blue-800' : 'text-slate-500'}`}>Sign In</button><button onClick={() => { setMode('register'); setError(''); }} className={`pb-3 ${mode === 'register' ? 'border-b-2 border-blue-700 font-semibold text-blue-800' : 'text-slate-500'}`}>Create Account</button></div>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {mode === 'login' ? <form onSubmit={handleLogin} className="mt-5 space-y-4 max-w-md">
          <label className="block text-sm font-medium text-slate-700">Email Address<input className={`${inputClass} mt-1.5`} type="email" required value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="email" /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input className={`${inputClass} mt-1.5`} type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
          <div className="flex items-center justify-between"><button type="button" onClick={() => setError('Password reset is not configured yet. Please contact your system administrator.')} className="text-sm text-blue-700 hover:underline">Forgot password?</button></div>
          <button disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">{loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing in…</span> : 'Sign In'}</button>
          <p className="text-sm text-slate-600">New to MediAssist? <button type="button" onClick={() => setMode('register')} className="font-semibold text-blue-700 hover:underline">Create a doctor account</button></p>
        </form> : <form onSubmit={handleRegister} className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{field('Full Name', 'full_name')}{field('Email Address', 'email', 'email')}{field('Phone Number', 'phone', 'tel')}{field('Medical Registration / License Number', 'license_number')}{field('Specialization', 'specialization')}{field('Hospital / Clinic Name', 'hospital_name')}</div>
          <div className="grid sm:grid-cols-2 gap-4">{field('Password', 'password', 'password')}{field('Confirm Password', 'confirm_password', 'password')}</div>
          <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 accent-blue-700" /><span>I agree to the terms and privacy policy.</span></label>
          <button disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">{loading ? 'Creating account…' : 'Create Doctor Account'}</button>
          <p className="text-sm text-slate-600">Already have an account? <button type="button" onClick={() => setMode('login')} className="font-semibold text-blue-700 hover:underline">Sign in</button></p>
        </form>}
      </section>
      <p className="mt-4 text-center text-xs text-slate-500">AI recommendations are decision support and require doctor review.</p>
    </div>
  </main>;
};
