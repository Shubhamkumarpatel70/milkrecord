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
    if (!/^[0-9]{10}$/.test(mobile)) return setError('10-digit mobile number enter karein.');
    if (mode !== 'customer' && !/^[0-9]{5}$/.test(mpin)) return setError('MPIN exactly 5 digits ka hona chahiye.');
    if (mode === 'register' && name.trim().length < 2) return setError('Apna valid naam enter karein.');
    setBusy(true);
    try {
      const endpoint = mode === 'customer' ? '/api/auth/customer-login' : (mode === 'login' ? '/api/auth/login' : '/api/auth/register');
      const response = await axios.post(endpoint, mode === 'customer' ? { mobile } : { name: name.trim(), mobile, mpin });
      const data = response.data;
      if (!data.token || !data.userId) throw new Error('Server response mein session token nahi mila.');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.userRole || 'user');
      localStorage.setItem('userName', data.userName || name.trim());
      onAuthenticated({ _id: data.userId, name: data.userName || name.trim(), role: data.userRole || 'user' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sign in nahi ho paya. Dobara try karein.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-2xl font-black text-white">M</div>
          <h1 className="text-2xl font-bold text-slate-900">Milk Record</h1>
          <p className="mt-1 text-sm text-slate-500">Your dairy business, neatly managed</p>
        </div>
        <div className="mb-6 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`rounded-lg py-2 text-xs font-semibold ${mode === 'login' ? 'bg-white text-sky-700 shadow' : 'text-slate-500'}`}>Owner Login</button>
          <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`rounded-lg py-2 text-xs font-semibold ${mode === 'register' ? 'bg-white text-sky-700 shadow' : 'text-slate-500'}`}>Register</button>
          <button type="button" onClick={() => { setMode('customer'); setError(''); }} className={`rounded-lg py-2 text-xs font-semibold ${mode === 'customer' ? 'bg-white text-sky-700 shadow' : 'text-slate-500'}`}>Customer</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && <div><label className="mb-1 block text-sm font-medium text-slate-700">Full name</label><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Your name" /></div>}
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Mobile number</label><input inputMode="numeric" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="10-digit mobile number" /></div>
          {mode !== 'customer' && <div><label className="mb-1 block text-sm font-medium text-slate-700">5-digit MPIN</label><div className="relative flex max-w-xs gap-2" onClick={e => e.currentTarget.querySelector('input')?.focus()}>
            {Array.from({length:5}, (_, index) => <div key={index} className="flex h-12 w-11 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-xl font-bold text-slate-800">{mpin[index] ? '•' : '·'}</div>)}
            <input aria-label="5-digit MPIN" type="password" inputMode="numeric" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={mpin} onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 5))} required className="absolute inset-0 h-full w-full cursor-text opacity-0" />
          </div></div>}
          {mode === 'customer' && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Mobile-number-only access is enabled temporarily. Anyone who knows this number may be able to view its records. OTP verification is recommended before public launch.</p>}
          {error && <div role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button disabled={busy} className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'customer' ? 'View my milk records' : mode === 'login' ? 'Login securely' : 'Create account'}</button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">{mode === 'customer' ? 'Use the mobile number registered with your milk supplier.' : 'Your MPIN is stored securely as a one-way hash. Never share it with anyone.'}</p>
      </div>
    </div>
  );
}
