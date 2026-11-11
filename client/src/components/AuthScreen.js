import React, { useState } from 'react';
import axios from 'axios';

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mpin, setMpin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(mobile)) return setError('10-digit mobile number enter karein.');
    if (!/^[0-9]{5}$/.test(mpin)) return setError('MPIN exactly 5 digits ka hona chahiye.');
    if (mode === 'register' && name.trim().length < 2) return setError('Apna valid naam enter karein.');
    setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(endpoint, { name: name.trim(), mobile, mpin });
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
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`rounded-lg py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-sky-700 shadow' : 'text-slate-500'}`}>Login</button>
          <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`rounded-lg py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white text-sky-700 shadow' : 'text-slate-500'}`}>Create account</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && <div><label className="mb-1 block text-sm font-medium text-slate-700">Full name</label><input autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="Your name" /></div>}
          <div><label className="mb-1 block text-sm font-medium text-slate-700">Mobile number</label><input inputMode="numeric" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500" placeholder="10-digit mobile number" /></div>
          <div><label className="mb-1 block text-sm font-medium text-slate-700">5-digit MPIN</label><input type="password" inputMode="numeric" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={mpin} onChange={e => setMpin(e.target.value.replace(/\D/g, '').slice(0, 5))} required className="w-full rounded-xl border border-slate-300 px-4 py-3 tracking-[0.4em] outline-none focus:border-sky-500" placeholder="•••••" /></div>
          {error && <div role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button disabled={busy} className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Login securely' : 'Create account'}</button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">Your MPIN is stored securely as a one-way hash. Never share it with anyone.</p>
      </div>
    </div>
  );
}
