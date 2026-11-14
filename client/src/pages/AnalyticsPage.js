import React, { useMemo } from 'react';
import { BarChart3, Download, Printer, Droplets, IndianRupee, Users, CalendarDays, Activity, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

const partsInIndia = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return { year: parts.find(p => p.type === 'year')?.value, month: parts.find(p => p.type === 'month')?.value, day: parts.find(p => p.type === 'day')?.value };
};
const monthOf = value => { const p = partsInIndia(value); return p ? p.year + '-' + p.month : ''; };
const number = value => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const money = value => '₹' + number(value);
const shortDate = value => { const p = partsInIndia(value); return p ? new Date(p.year + '-' + p.month + '-' + p.day + 'T12:00:00+05:30').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' }) : '—'; };

function Metric({ icon: Icon, label, value, note, color = 'sky' }) {
  const styles = { sky: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-95040 dark:text-emerald-300', emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', violet: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300', amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' };
  return <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 break-words text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>{note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>}</div><span className={'shrink-0 rounded-xl p-2.5 ' + (styles[color] || styles.sky)}><Icon className="h-5 w-5" /></span></div></div>;
}

export default function AnalyticsPage({ totalMilkQuantityKg = 0, totalRevenue = 0, totalCustomers = 0, customers = [], records = [], selectedMonth = '', onMonthChange }) {
  const monthKey = selectedMonth || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).format(new Date());
  const monthTitle = new Date(monthKey + '-15T12:00:00+05:30').toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const monthlyRecords = useMemo(() => (Array.isArray(records) ? records : []).filter(r => monthOf(r.date || r.createdAt) === monthKey), [records, monthKey]);
  const summary = useMemo(() => {
    const groups = new Map();
    monthlyRecords.forEach((r, i) => {
      const key = r.customerId || r.customer || r.customerName || 'record-' + i;
      const item = groups.get(key) || { key, name: r.customerName || r.customer || 'Customer', kg: 0, liter: 0, amount: 0, entries: 0 };
      const qty = Number(r.quantityKg ?? r.quantity ?? 0);
      if (r.quantityUnit === 'liter') item.liter += qty; else item.kg += qty;
      item.amount += Number(r.amount || 0); item.entries += 1; groups.set(key, item);
    });
    const list = Array.from(groups.values()).sort((a, b) => b.amount - a.amount);
    return { kg: list.reduce((s, c) => s + c.kg, 0), liter: list.reduce((s, c) => s + c.liter, 0), earnings: monthlyRecords.reduce((s, r) => s + Number(r.amount || 0), 0), customers: list };
  }, [monthlyRecords]);
  const daily = useMemo(() => {
    const map = new Map();
    monthlyRecords.forEach(r => {
      const value = r.date || r.createdAt; const p = partsInIndia(value); if (!p) return;
      const key = p.year + '-' + p.month + '-' + p.day;
      const item = map.get(key) || { date: key, label: shortDate(value), kg: 0, liter: 0, amount: 0 };
      const qty = Number(r.quantityKg ?? r.quantity ?? 0);
      if (r.quantityUnit === 'liter') item.liter += qty; else item.kg += qty;
      item.amount += Number(r.amount || 0); map.set(key, item);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [monthlyRecords]);

  const exportExcel = () => {
    const customerRows = summary.customers.map(c => ({ 'Customer Name': c.name, 'Report Month': monthKey, 'Milk (Kg)': Number(c.kg.toFixed(2)), 'Milk (Liter)': Number(c.liter.toFixed(2)), 'Entries': c.entries, 'Amount (INR)': Number(c.amount.toFixed(2)) }));
    const dailyRows = daily.map(d => ({ Date: d.date, 'Milk (Kg)': Number(d.kg.toFixed(2)), 'Milk (Liter)': Number(d.liter.toFixed(2)), 'Amount (INR)': Number(d.amount.toFixed(2)) }));
    if (!customerRows.length && !dailyRows.length) { window.alert('There is no saved data for this month to export.'); return; }
    const wb = XLSX.utils.book_new();
    if (customerRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customerRows), 'Customer Report');
    if (dailyRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyRows), 'Daily Summary');
    XLSX.writeFile(wb, 'Milk_Record_Report_' + monthKey + '.xlsx');
  };

  return <div className="w-full max-w-full min-w-0 space-y-5 sm:space-y-6 pb-8 animate-fade-in">
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-7 text-white shadow-lg">
      <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-emerald-40010 blur-2xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3"><div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15"><BarChart3 className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Business overview</p><h1 className="mt-1 text-2xl sm:text-3xl font-extrabold">Reports &amp; Analytics</h1><p className="mt-2 max-w-xl text-sm text-slate-300">Track milk sales, customer activity and recorded earnings from your saved entries.</p></div></div>
        <div className="flex flex-col sm:flex-row gap-2"><button onClick={exportExcel} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-400"><FileSpreadsheet className="h-4 w-4" />Export Excel</button><button onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15"><Printer className="h-4 w-4" />Print report</button></div>
      </div>
    </header>

    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div className="flex items-center gap-3"><span className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300"><CalendarDays className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900 dark:text-white">Monthly performance</h2><p className="text-xs text-slate-500 dark:text-slate-400">Selected period: {monthTitle}</p></div></div><label className="w-full sm:w-56"><span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Choose report month</span><input type="month" value={monthKey} onChange={e => onMonthChange && onMonthChange(e.target.value)} className="w-full min-h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500" /></label></div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"><Metric icon={Droplets} label="Milk sold · Kg" value={number(summary.kg) + ' Kg'} note={number(summary.liter) + ' Liter recorded separately'} color="sky" /><Metric icon={IndianRupee} label="Recorded earnings" value={money(summary.earnings)} note={monthlyRecords.length + ' saved milk entries'} color="emerald" /><Metric icon={Users} label="Customers served" value={summary.customers.length} note="Unique customers with entries" color="violet" /></div>
    </section>

    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-teal-500" /><h2 className="font-bold text-slate-900 dark:text-white">Daily sales trend</h2></div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Saved daily quantity and recorded amount for {monthTitle}.</p></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{daily.length} active days</span></div>
      {daily.length ? <div className="h-72 w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={daily} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" /><YAxis yAxisId="qty" tickLine={false} axisLine={false} fontSize={11} stroke="#0ea5e9" /><YAxis yAxisId="amount" orientation="right" tickLine={false} axisLine={false} fontSize={11} stroke="#10b981" /><Tooltip formatter={(v, name) => [name.includes('₹') ? money(v) : number(v), name]} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar yAxisId="qty" dataKey="kg" name="Milk (Kg)" fill="#0ea5e9" radius={[5,5,0,0]} /><Bar yAxisId="qty" dataKey="liter" name="Milk (Liter)" fill="#8b5cf6" radius={[5,5,0,0]} /><Bar yAxisId="amount" dataKey="amount" name="Recorded amount (₹)" fill="#10b981" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div> : <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 py-12 text-center"><Activity className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">No entries for {monthTitle}</p><p className="mt-1 text-xs text-slate-500">Saved milk records will appear here automatically.</p></div>}
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-700 p-4 sm:p-5"><div><h2 className="font-bold text-slate-900 dark:text-white">Customer-wise monthly report</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Quantity and amount grouped from saved entries.</p></div><span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">{summary.customers.length} customers</span></div>
      {summary.customers.length ? <><div className="hidden md:block overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3 text-right">Kg</th><th className="px-4 py-3 text-right">Liter</th><th className="px-4 py-3 text-right">Entries</th><th className="px-5 py-3 text-right">Monthly amount</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{summary.customers.map(c => <tr key={c.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30"><td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">{c.name}</td><td className="px-4 py-4 text-right tabular-nums">{number(c.kg)}</td><td className="px-4 py-4 text-right tabular-nums">{number(c.liter)}</td><td className="px-4 py-4 text-right text-slate-500">{c.entries}</td><td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">{money(c.amount)}</td></tr>)}</tbody></table></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 md:hidden">{summary.customers.map(c => <article key={c.key} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-slate-900 dark:text-white">{c.name}</h3><p className="mt-1 text-xs text-slate-500">{c.entries} milk entries</p></div><p className="shrink-0 font-extrabold text-slate-900 dark:text-white">{money(c.amount)}</p></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-emerald-50 dark:bg-emerald-95040 p-2.5"><p className="text-[11px] text-emerald-700 dark:text-emerald-300">Milk (Kg)</p><p className="mt-1 font-bold text-slate-800 dark:text-white">{number(c.kg)}</p></div><div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 p-2.5"><p className="text-[11px] text-teal-700 dark:text-teal-300">Milk (Liter)</p><p className="mt-1 font-bold text-slate-800 dark:text-white">{number(c.liter)}</p></div></div></article>)}</div></> : <div className="py-12 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">No customer sales for this month</p><p className="mt-1 text-xs text-slate-500">This report will populate when milk entries are saved.</p></div>}
    </section>

    <section><div className="mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-slate-500" /><h2 className="font-bold text-slate-900 dark:text-white">Overall account snapshot</h2><span className="text-xs text-slate-500">(all-time totals)</span></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Metric icon={Droplets} label="Total milk recorded" value={number(totalMilkQuantityKg) + ' Kg'} note="All-time quantity supplied" color="sky" /><Metric icon={IndianRupee} label="Total recorded amount" value={money(totalRevenue)} note="All-time recorded revenue" color="emerald" /><Metric icon={Users} label="Total customers" value={number(totalCustomers || customers.length)} note="Customer accounts" color="violet" /></div></section>
    <p className="px-1 text-[11px] text-slate-500 dark:text-slate-400">Reports use the saved records and customer data available to this dashboard. No sample or estimated business figures are added.</p>
  </div>;
}
