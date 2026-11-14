import React, { useMemo, useState } from 'react';
import {
  Milk, CalendarDays, Sun, Moon, Plus, Search, Edit2, X,
  IndianRupee, Droplets, ClipboardList, CheckCircle2, Clock3,
  ArrowLeft, Filter, TrendingUp, Trash2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const money = value => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const getRecordDate = record => {
  const raw = record.createdAt || record.date;
  if (!raw) return 'Today';
  return String(raw).slice(0, 10);
};

const getCustomerName = record => {
  const value = record.customerName || record.customer?.name || record.customer;
  return typeof value === 'string' ? value : 'Unknown';
};

const getQuantity = record => Number(record.quantityKg ?? record.quantity ?? 0);

export default function MilkRecordsPage({
  records = [],
  selectedMonth = new Date().toISOString().slice(0, 7),
  onMonthChange,
  onOpenAddRecord,
  onOpenEditRecord,
  onDeleteRecord,
  onOpenCalendar,
  selectedCustomer = null,
  onClearCustomerView
}) {
  const [shiftFilter, setShiftFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const customerRecords = useMemo(() => {
    if (!selectedCustomer) return records;
    const selectedName = String(selectedCustomer.name || '').trim();
    const selectedId = String(selectedCustomer._id || '');
    return records.filter(record => {
      const recordName = String(record.customerName || record.customer?.name ||
        (typeof record.customer === 'string' ? record.customer : '') || '').trim();
      if (recordName && selectedName) return recordName === selectedName;
      const recordId = String(record.customerId?._id || record.customerId || '');
      return Boolean(selectedId && recordId === selectedId);
    });
  }, [records, selectedCustomer]);

  const filteredRecords = useMemo(() => customerRecords.filter(record => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query ||
      getCustomerName(record).toLowerCase().includes(query) ||
      getRecordDate(record).toLowerCase().includes(query);
    const shift = String(record.shift || 'morning').toLowerCase();
    const matchesShift = shiftFilter === 'all' || shift === shiftFilter;
    const paid = record.status === 'paid';
    const matchesPayment = paymentFilter === 'all' ||
      (paymentFilter === 'paid' ? paid : !paid);
    return matchesSearch && matchesShift && matchesPayment;
  }), [customerRecords, searchTerm, shiftFilter, paymentFilter]);

  const stats = useMemo(() => filteredRecords.reduce((total, record) => {
    const quantity = getQuantity(record);
    total.entries += 1;
    total.amount += Number(record.amount || 0);
    if (record.quantityUnit === 'liter') total.liters += quantity;
    else total.kg += quantity;
    if (record.status === 'paid') {
      total.paid += Number(record.amount || 0);
      total.paidCount += 1;
    } else {
      total.pending += Number(record.amount || 0);
      total.pendingCount += 1;
    }
    return total;
  }, { entries: 0, amount: 0, paid: 0, pending: 0, paidCount: 0, pendingCount: 0, kg: 0, liters: 0 }), [filteredRecords]);

  const dateSummary = useMemo(() => {
    const grouped = filteredRecords.reduce((map, record) => {
      const date = getRecordDate(record);
      if (!map[date]) map[date] = { kg: 0, liters: 0, amount: 0, entries: 0 };
      const quantity = getQuantity(record);
      if (record.quantityUnit === 'liter') map[date].liters += quantity;
      else map[date].kg += quantity;
      map[date].amount += Number(record.amount || 0);
      map[date].entries += 1;
      return map;
    }, {});
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredRecords]);

  const clearFilters = () => {
    setSearchTerm('');
    setShiftFilter('all');
    setPaymentFilter('all');
  };

  const StatCard = ({ icon: Icon, label, value, note, tone }) => (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  );

  const ShiftBadge = ({ shift }) => {
    const evening = String(shift || '').toLowerCase() === 'evening';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${evening
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>
        {evening ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        {evening ? 'Evening' : 'Morning'}
      </span>
    );
  };

  const PaymentBadge = ({ paid }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${paid
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'}`}>
      {paid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
      {paid ? 'Paid' : 'Pending'}
    </span>
  );

  return (
    <div className="w-full min-w-0 space-y-5 pb-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-5 text-white shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border-[28px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-44 w-44 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20"><Milk className="h-7 w-7" /></div>
            <div className="min-w-0">
              {selectedCustomer && (
                <button onClick={onClearCustomerView} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-50/90 hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" /> All records
                </button>
              )}
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {selectedCustomer ? `${selectedCustomer.name}'s Milk Records` : 'Milk Records'}
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-emerald-50/90 sm:text-sm">
                {selectedCustomer
                  ? 'Review this customer’s daily quantity, payment status and billing history.'
                  : 'A clear view of daily milk entries, delivery shifts and payment collection.'}
              </p>
            </div>
          </div>
          <div className="relative flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 backdrop-blur-sm">
              <CalendarDays className="h-4 w-4 shrink-0 text-emerald-50" />
              <input
                type="month"
                value={selectedMonth}
                onChange={event => onMonthChange && onMonthChange(event.target.value)}
                aria-label="Select month"
                className="w-full bg-transparent text-sm font-semibold text-white outline-none [color-scheme:dark] sm:w-36"
              />
            </label>
            {onOpenCalendar && (
              <button onClick={onOpenCalendar} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20">
                <CalendarDays className="h-4 w-4" /> Calendar
              </button>
            )}
            <button onClick={onOpenAddRecord} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-emerald-700 shadow-sm transition hover:bg-emerald-50">
              <Plus className="h-4 w-4" /> Add Entry
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total entries" value={stats.entries} note="Entries in current view" tone="bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" />
        <StatCard icon={Droplets} label="Milk quantity" value={`${stats.kg.toFixed(2)} kg · ${stats.liters.toFixed(2)} L`} note="Total recorded quantity" tone="bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300" />
        <StatCard icon={IndianRupee} label="Total amount" value={`₹${money(stats.amount)}`} note={`₹${money(stats.paid)} collected`} tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" />
        <StatCard icon={TrendingUp} label="Pending amount" value={`₹${money(stats.pending)}`} note={`${stats.pendingCount} unpaid entries`} tone="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search customer or date..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><Filter className="h-3.5 w-3.5" /> Shift</span>
            {['all', 'morning', 'evening'].map(value => (
              <button key={value} onClick={() => setShiftFilter(value)} className={`min-h-9 rounded-lg px-3 text-xs font-bold capitalize transition ${shiftFilter === value ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
                {value === 'all' ? 'All shifts' : value}
              </button>
            ))}
            <span className="ml-1 text-xs font-bold text-slate-400">Payment</span>
            {['all', 'paid', 'pending'].map(value => (
              <button key={value} onClick={() => setPaymentFilter(value)} className={`min-h-9 rounded-lg px-3 text-xs font-bold capitalize transition ${paymentFilter === value ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
                {value === 'all' ? 'All' : value}
              </button>
            ))}
            {(searchTerm || shiftFilter !== 'all' || paymentFilter !== 'all') && (
              <button onClick={clearFilters} className="min-h-9 px-2 text-xs font-bold text-rose-600 hover:underline">Reset</button>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400">Showing <strong className="text-slate-800 dark:text-slate-100">{filteredRecords.length}</strong> of {customerRecords.length} entries</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">{stats.paidCount} paid · {stats.pendingCount} pending</span>
        </div>
      </section>

      {selectedCustomer && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Date-wise summary</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Daily quantity and amount for this customer</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{dateSummary.length} days with entries</span>
          </div>
          {dateSummary.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Entries</th><th className="px-4 py-3 text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {dateSummary.map(([date, day]) => (
                    <tr key={date}>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{date}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{day.kg ? `${day.kg.toFixed(2)} kg` : ''}{day.kg && day.liters ? ' + ' : ''}{day.liters ? `${day.liters.toFixed(2)} L` : ''}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{day.entries}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">₹{money(day.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="px-4 py-8 text-center text-sm text-slate-500">No entries found for this customer with the current filters.</p>}
        </section>
      )}

      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <EmptyState type="records" title={searchTerm || shiftFilter !== 'all' || paymentFilter !== 'all' ? 'No matching milk entries' : 'No milk entries found'} onAction={onOpenAddRecord} />
          {(searchTerm || shiftFilter !== 'all' || paymentFilter !== 'all') && <button onClick={clearFilters} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  <tr><th className="px-5 py-4">Date</th>{!selectedCustomer && <th className="px-5 py-4">Customer</th>}<th className="px-5 py-4">Shift</th><th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredRecords.map((record, index) => (
                    <tr key={record._id || index} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{getRecordDate(record)}</td>
                      {!selectedCustomer && <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{getCustomerName(record)}</td>}
                      <td className="px-5 py-4"><ShiftBadge shift={record.shift} /></td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">{getQuantity(record)} {record.quantityUnit === 'liter' ? 'L' : 'kg'}</td>
                      <td className="px-5 py-4 font-extrabold text-emerald-700 dark:text-emerald-400">₹{money(record.amount)}</td>
                      <td className="px-5 py-4"><PaymentBadge paid={record.status === 'paid'} /></td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => onOpenEditRecord && onOpenEditRecord(record)} disabled={!onOpenEditRecord} aria-label="Edit entry" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-sky-950/30"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                          <button onClick={() => onDeleteRecord && onDeleteRecord(record)} disabled={!onDeleteRecord} aria-label="Delete entry" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredRecords.map((record, index) => (
              <article key={record._id || index} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {!selectedCustomer && <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{getCustomerName(record)}</h3>}
                    <p className={`text-xs font-semibold text-slate-500 dark:text-slate-400 ${selectedCustomer ? '' : 'mt-1'}`}>{getRecordDate(record)}</p>
                  </div>
                  <PaymentBadge paid={record.status === 'paid'} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <ShiftBadge shift={record.shift} />
                    <div><p className="text-[10px] font-semibold uppercase text-slate-400">Quantity</p><p className="text-sm font-extrabold text-slate-800 dark:text-white">{getQuantity(record)} {record.quantityUnit === 'liter' ? 'L' : 'kg'}</p></div>
                  </div>
                  <div className="text-right"><p className="text-[10px] font-semibold uppercase text-slate-400">Amount</p><p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">₹{money(record.amount)}</p></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => onOpenEditRecord && onOpenEditRecord(record)} disabled={!onOpenEditRecord} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-sky-950/40"><Edit2 className="h-4 w-4" /> Edit entry</button>
                  <button onClick={() => onDeleteRecord && onDeleteRecord(record)} disabled={!onDeleteRecord} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"><Trash2 className="h-4 w-4" /> Delete</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
