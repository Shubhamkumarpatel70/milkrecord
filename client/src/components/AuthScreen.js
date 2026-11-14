import React, { useState } from 'react';
import axios from 'axios';

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState(() => new URLSearchParams(window.location.search).get('portal') === 'customer' ? 'customer' : 'login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mpin, setMpin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(mobile)) return setError('Please enter a 10-digit mobile number.');
    if (mode !== 'customer' && !/^[0-9]{5}$/.test(mpin)) return setError('MPIN exactly 5 digits ka hona chahiye.');
    if (mode === 'register' && name.trim().length < 2) return setError('Please enter a valid name.');
    setBusy(true);
    try {
      const endpoint = mode === 'customer' ? '/api/auth/customer-login' : (mode === 'login' ? '/api/auth/login' : '/api/auth/register');
      const response = await axios.post(endpoint, mode === 'customer' ? { mobile } : { name: name.trim(), mobile, mpin });
      const data = response.data;
      if (!data.token || !data.userId) throw new Error('The server did not return a session token.');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.userRole || 'user');
      localStorage.setItem('userName', data.userName || name.trim());
      onAuthenticated({ _id: data.userId, name: data.userName || name.trim(), role: data.userRole || 'user' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'We could not sign you in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-[0_24px_80px_-30px_rgba(0,0,0,.55)] sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-600 text-2xl font-black text-white shadow-lg shadow-emerald-900/20">M</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Milk Record</h1>
          <p className="mt-1 text-sm text-slate-500">Your milk records, clearly organised</p>
        </div>
        <div className="mb-6 grid grid-cols-3 rounded-xl bg-emerald-50 p-1">
          <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`rounded-lg py-2.5 text-xs font-semibold transition ${mode === 'login' ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'}`}>Owner Login</button>
          <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`rounded-lg py-2 text-xs font-semibold ${mode === 'register' ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'}`}>Register</button>
          <button type="button" onClick={() => { setMode('customer'); setError(''); }} className={`rounded-lg py-2 text-xs font-semibold ${mode === 'customer' ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'}`}>Customer</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && <div><label className="mb-1 block text-sm font-medium text-slate-700">Full name</label><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100" placeholder="Your name" /></div>}
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Mobile number</label><input inputMode="numeric" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" placeholder="10-digit mobile number" /></div>
          {mode !== 'customer' && <div><label className="mb-1 block text-sm font-medium text-slate-700">5-digit MPIN</label><div className="relative flex max-w-xs gap-2" onClick={e => e.currentTarget.querySelector('input')?.focus()}>
            {Array.from({length:5}, (_, index) => <div key={index} className="flex h-12 w-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-xl font-bold text-slate-800">{mpin[index] ? '•' : '·'}</div>)}
            <input aria-label="5-digit MPIN" type="password" inputMode="numeric" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={mpin} onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 5))} required className="absolute inset-0 h-full w-full cursor-text opacity-0" />
          </div></div>}
          {mode === 'customer' && <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800">Mobile-number-only access is enabled temporarily. Anyone who knows this number may be able to view its records. OTP verification is recommended before public launch.</p>}
          {error && <div role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button disabled={busy} className="w-full rounded-xl bg-emerald-800 py-3.5 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-900 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'customer' ? 'View my milk records' : mode === 'login' ? 'Login securely' : 'Create account'}</button>
        </form>
        {mode === 'customer' && <p className="mt-5 text-center text-xs leading-5 text-slate-500">Use the mobile number registered with your milk supplier.</p>}
      </div>
    </div>
  );
}
