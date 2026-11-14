import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Milk, CalendarDays, RefreshCw, LogOut, Wallet, CheckCircle2, Clock3, Droplets, ReceiptText, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

const money = value => '₹' + Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quantity = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function CustomerPortal({ onLogout, customerName }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    axios.get(`/api/customer-portal/records?month=${month}`)
      .then(response => { if (active) setData(response.data); })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Your milk statement could not be loaded. Please try again.'); })
      .finally(() => { if (active) { setLoading(false); setRefreshing(false); } });
    return () => { active = false; };
  }, [month, refreshKey]);

  const refresh = () => { setRefreshing(true); setRefreshKey(value => value + 1); };
  const customer = data?.customer?.name || customerName || 'Customer';
  const summary = data?.summary || {};
  const records = Array.isArray(data?.records) ? data.records : [];
  const pending = Math.max(0, Number(summary.remainingAmount || 0));
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8f5] text-slate-800">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800" />
      <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 text-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur"><Milk className="h-6 w-6"/></div>
            <div className="min-w-0"><p className="truncate text-sm font-extrabold tracking-wide">Milk Record</p><p className="text-[11px] text-emerald-100/75">Customer portal</p></div>
          </div>
          <button onClick={onLogout} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20"><LogOut className="h-4 w-4"/> <span className="hidden sm:inline">Logout</span></button>
        </header>

        <section className="mt-8 flex flex-col justify-between gap-4 text-white sm:mt-10 sm:flex-row sm:items-end">
          <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-100"><Sparkles className="h-3.5 w-3.5"/> Your dairy summary</div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Namaste, {customer}!</h1><p className="mt-1 text-sm text-emerald-100/80">Your milk deliveries and payment statement, all in one place.</p></div>
          <div className="flex items-center gap-2 text-xs text-emerald-100/80"><ShieldCheck className="h-4 w-4"/> Private customer statement</div>
        </section>

        <section className="mt-7 rounded-3xl border border-white/70 bg-white p-4 shadow-[0_18px_50px_-28px_rgba(6,78,59,.35)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Statement period</p><h2 className="mt-1 text-lg font-bold text-slate-900">{monthLabel}</h2><p className="text-xs text-slate-500">Choose a month to view your records</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:flex-none"><CalendarDays className="h-4 w-4 text-emerald-700"/><input aria-label="Select month" type="month" value={month} onChange={event => setMonth(event.target.value)} className="min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none"/></label>
              <button onClick={refresh} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}/>Refresh</button>
            </div>
          </div>
        </section>

        {loading ? <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(item => <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-white"/>)}<div className="h-64 animate-pulse rounded-2xl bg-white sm:col-span-2 lg:col-span-4"/></section> :
          error ? <section role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-white p-6"><p className="font-bold text-rose-800">Unable to load statement</p><p className="mt-1 text-sm text-slate-600">{error}</p><button onClick={refresh} className="mt-4 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white">Try again</button></section> : <>
            <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Milk quantity</span><span className="rounded-xl bg-sky-50 p-2 text-sky-700"><Droplets className="h-4 w-4"/></span></div><p className="mt-3 text-xl font-extrabold text-slate-900">{quantity(summary.totalQuantityKg)} <span className="text-sm font-semibold text-slate-500">kg</span></p><p className="mt-1 text-[11px] text-slate-400">Total delivered</p></div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Total bill</span><span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><ReceiptText className="h-4 w-4"/></span></div><p className="mt-3 text-xl font-extrabold text-slate-900">{money(summary.totalAmount)}</p><p className="mt-1 text-[11px] text-slate-400">For selected month</p></div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Amount paid</span><span className="rounded-xl bg-green-50 p-2 text-green-700"><CheckCircle2 className="h-4 w-4"/></span></div><p className="mt-3 text-xl font-extrabold text-green-700">{money(summary.totalPaid)}</p><p className="mt-1 text-[11px] text-slate-400">Payment received</p></div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Pending amount</span><span className="rounded-xl bg-amber-50 p-2 text-amber-700"><Clock3 className="h-4 w-4"/></span></div><p className="mt-3 text-xl font-extrabold text-amber-700">{money(pending)}</p><p className="mt-1 text-[11px] text-slate-400">Remaining balance</p></div>
            </section>

            <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Milk delivery history</h2><p className="mt-0.5 text-xs text-slate-500">{records.length} {records.length === 1 ? 'entry' : 'entries'} · {monthLabel}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Updated statement</span></div>
              {records.length === 0 ? <div className="px-5 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Milk className="h-7 w-7"/></div><h3 className="mt-4 font-bold text-slate-800">No milk entries yet</h3><p className="mt-1 text-sm text-slate-500">There are no records for {monthLabel}. Try another month or contact your milk supplier.</p></div> :
                <>
                  <div className="hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3 font-bold">Date</th><th className="px-5 py-3 font-bold">Shift</th><th className="px-5 py-3 font-bold">Quantity</th><th className="px-5 py-3 font-bold">Bill amount</th><th className="px-5 py-3 font-bold">Paid</th><th className="px-5 py-3 font-bold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map(record => { const due = Math.max(0, Number(record.amount || 0) - Number(record.paidAmount || 0)); return <tr key={record._id} className="transition hover:bg-emerald-50/40"><td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{new Date(record.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td><td className="px-5 py-4 capitalize text-slate-600">{record.shift || '—'}</td><td className="px-5 py-4 font-semibold text-slate-800">{quantity(record.quantityKg)} {record.quantityUnit === 'liter' ? 'L' : 'kg'}</td><td className="px-5 py-4 font-semibold text-slate-800">{money(record.amount)}</td><td className="px-5 py-4 text-green-700">{money(record.paidAmount)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${due <= 0 ? 'bg-green-50 text-green-700' : Number(record.paidAmount || 0) > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{due <= 0 ? 'Paid' : Number(record.paidAmount || 0) > 0 ? 'Part paid' : 'Pending'}</span></td></tr>; })}</tbody></table></div>
                  <div className="divide-y divide-slate-100 sm:hidden">{records.map(record => { const due = Math.max(0, Number(record.amount || 0) - Number(record.paidAmount || 0)); return <article key={record._id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-800">{new Date(record.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p><p className="mt-1 text-xs capitalize text-slate-500">{record.shift || 'Shift not specified'} · {quantity(record.quantityKg)} {record.quantityUnit === 'liter' ? 'L' : 'kg'}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${due <= 0 ? 'bg-green-50 text-green-700' : Number(record.paidAmount || 0) > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{due <= 0 ? 'Paid' : Number(record.paidAmount || 0) > 0 ? 'Part paid' : 'Pending'}</span></div><div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3"><div><p className="text-[10px] text-slate-500">Bill</p><p className="mt-1 text-sm font-bold">{money(record.amount)}</p></div><div><p className="text-[10px] text-slate-500">Paid</p><p className="mt-1 text-sm font-bold text-green-700">{money(record.paidAmount)}</p></div><div><p className="text-[10px] text-slate-500">Due</p><p className="mt-1 text-sm font-bold text-amber-700">{money(due)}</p></div></div></article>; })}</div>
                </>}
            </section>
          </>}
        <footer className="mt-6 flex flex-col items-center justify-center gap-1 text-center text-xs text-slate-400"><div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5"/> Your personal milk statement</div><p>Records are provided by your milk supplier. Contact them if anything looks incorrect.</p><p className="mt-1 font-semibold text-emerald-800">Powered by Milk Record</p></footer>
      </div>
    </main>
  );
}
