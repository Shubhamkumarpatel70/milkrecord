import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CustomerPortal({ onLogout, customerName }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    axios.get(`/api/customer-portal/records?month=${month}`)
      .then(response => { if (active) setData(response.data); })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Records could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month]);

  const money = value => `₹${Number(value || 0).toFixed(2)}`;
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <section className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Milk Record · Customer</p><h1 className="mt-1 text-xl font-bold text-slate-900">Namaste, {data?.customer?.name || customerName || 'Customer'}</h1><p className="text-sm text-slate-500">Your personal milk statement</p></div>
          <button onClick={onLogout} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Logout</button>
        </header>
        <div className="rounded-2xl bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Select month</label>
          <input type="month" value={month} onChange={event => setMonth(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800" />
        </div>
        {loading ? <div className="rounded-2xl bg-white p-8 text-center text-slate-500">Loading your records…</div> : error ? <div role="alert" className="rounded-2xl bg-rose-50 p-5 text-rose-700">{error}</div> : <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[['Milk quantity', `${Number(data?.summary?.totalQuantityKg || 0).toFixed(2)} kg`], ['Total bill', money(data?.summary?.totalAmount)], ['Paid', money(data?.summary?.totalPaid)], ['Pending', money(data?.summary?.remainingAmount)]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-lg font-bold text-slate-900">{value}</p></div>)}
          </div>
          <section className="overflow-hidden rounded-2xl bg-white">
            <div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Milk entries</h2></div>
            {!data?.records?.length ? <p className="p-8 text-center text-sm text-slate-500">No milk entries found for this month.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Shift</th><th className="p-3">Quantity</th><th className="p-3">Amount</th><th className="p-3">Paid</th></tr></thead><tbody>{data.records.map(record => <tr key={record._id} className="border-t border-slate-100"><td className="p-3">{new Date(record.createdAt).toLocaleDateString('en-IN')}</td><td className="p-3 capitalize">{record.shift || '—'}</td><td className="p-3">{Number(record.quantityKg || 0).toFixed(2)} kg</td><td className="p-3">{money(record.amount)}</td><td className="p-3">{money(record.paidAmount)}</td></tr>)}</tbody></table></div>}
          </section>
        </>}
        <p className="text-center text-xs text-slate-400">This statement shows records saved by your milk supplier.</p>
      </section>
    </main>
  );
}
