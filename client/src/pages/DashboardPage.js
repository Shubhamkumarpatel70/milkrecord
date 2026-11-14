import React, { useMemo, useState } from 'react';
import {
  Milk, IndianRupee, AlertCircle, Users, TrendingUp,
  QrCode, ArrowUpRight, UserPlus, Plus, CalendarDays
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(Number(value) || 0);

const indiaMonthKey = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit'
  }).formatToParts(new Date(date));
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  return year && month ? `${year}-${month}` : '';
};

const monthLabel = (key) => {
  if (!/^\\d{4}-\\d{2}$/.test(key)) return key;
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
  }).format(new Date(Date.UTC(year, month - 1, 15, 12)));
};

function SummaryCard({ label, value, note, icon: Icon, tone }) {
  const tones = {
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    purple: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
  };
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </section>
  );
}

function EmptyState({ title, detail }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-4 py-7 text-center">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

export default function DashboardPage({
  todaysMilkKg = 0,
  todaysMilkLiter = 0,
  totalMilkQuantityKg = 0,
  totalMilkQuantityLiter = 0,
  quantityUnit = 'kg',
  totalRevenue = 0,
  totalReceive = 0,
  totalPending = 0,
  totalCustomers = 0,
  totalRecords = 0,
  customers = [],
  records = [],
  onOpenAddRecord,
  onOpenAddCustomer,
  onOpenPaymentQR,
  onNavigate
}) {
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const currentIndiaMonth = indiaMonthKey(today);
  const availableMonths = useMemo(() => {
    const months = new Set([currentIndiaMonth]);
    (Array.isArray(records) ? records : []).forEach(record => {
      const month = indiaMonthKey(record.createdAt);
      if (month) months.add(month);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [records, currentIndiaMonth]);
  const [selectedMonth, setSelectedMonth] = useState(currentIndiaMonth);

  const monthSummary = useMemo(() => {
    const monthRecords = (Array.isArray(records) ? records : []).filter(
      record => indiaMonthKey(record.createdAt) === selectedMonth
    );
    const kg = monthRecords.filter(record => (record.quantityUnit || 'kg') !== 'liter')
      .reduce((sum, record) => sum + (Number(record.quantityKg) || 0), 0);
    const liters = monthRecords.filter(record => record.quantityUnit === 'liter')
      .reduce((sum, record) => sum + (Number(record.quantityKg) || 0), 0);
    const mixed = kg > 0 && liters > 0;
    return {
      quantity: mixed
        ? `${kg.toLocaleString('en-IN', { maximumFractionDigits: 2 })} kg + ${liters.toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`
        : `${(liters || kg).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${liters > 0 ? 'L' : 'kg'}`,
      earnings: monthRecords.reduce((sum, record) => sum + (Number(record.amount) || 0), 0),
      entries: monthRecords.length,
      customers: new Set(monthRecords.map(record => record.customerId || record.customer).filter(Boolean)).size
    };
  }, [records, selectedMonth]);

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(date);
      return {
        key,
        day: date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }),
        dateLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }),
        milk: 0
      };
    });
    const totals = new Map(days.map(day => [day.key, 0]));
    (Array.isArray(records) ? records : []).forEach(record => {
      if ((record.quantityUnit || 'kg') !== quantityUnit) return;
      const key = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date(record.createdAt));
      if (totals.has(key)) totals.set(key, totals.get(key) + (Number(record.quantityKg) || 0));
    });
    return days.map(day => ({ ...day, milk: Number((totals.get(day.key) || 0).toFixed(2)) }));
  }, [records, quantityUnit]);

  const recentRecords = useMemo(() => (
    (Array.isArray(records) ? records : [])
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  ), [records]);

  const recoveryRate = totalRevenue > 0
    ? Math.min(100, Math.round((totalReceive / totalRevenue) * 100))
    : 0;
  const unitLabel = quantityUnit === 'liter' ? 'L' : 'kg';
  const todayQuantity = quantityUnit === 'liter' ? todaysMilkLiter : todaysMilkKg;
  const totalQuantity = quantityUnit === 'liter' ? totalMilkQuantityLiter : totalMilkQuantityKg;

  const quickActions = [
    { label: 'Milk entry', helper: 'Record collection', icon: Plus, action: onOpenAddRecord },
    { label: 'Add customer', helper: 'Create customer', icon: UserPlus, action: onOpenAddCustomer },
    { label: 'Payment QR', helper: 'Receive payment', icon: QrCode, action: onOpenPaymentQR }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 pb-8 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{todayLabel}</p>
        </div>
        <button
          type="button"
          onClick={onOpenAddRecord}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" /> Add milk entry
        </button>
      </header>

      <section aria-label="Business summary" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard label="Today's milk" value={`${Number(todayQuantity).toLocaleString('en-IN')} ${unitLabel}`} note="Collection recorded today" icon={Milk} tone="blue" />
        <SummaryCard label="Customers" value={totalCustomers} note="Registered customers" icon={Users} tone="purple" />
        <SummaryCard label="Received" value={currency(totalReceive)} note={`${recoveryRate}% of total revenue`} icon={IndianRupee} tone="green" />
        <SummaryCard label="Pending" value={currency(totalPending)} note="Payment to be collected" icon={AlertCircle} tone="red" />
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick actions</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your common tasks, in one place</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map(({ label, helper, icon: Icon, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className="flex min-h-[94px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center transition hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-800 dark:hover:bg-slate-700"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">{label}</span>
              <span className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">{helper}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm sm:p-5 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Milk collection</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Last 7 days · {unitLabel}</p>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>
          {weeklyData.some(day => day.milk > 0) ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardMilkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.dateLabel || label}
                    formatter={value => [`${value} ${unitLabel}`, 'Milk']}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="milk" stroke="#0284c7" strokeWidth={2.5} fill="url(#dashboardMilkFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No collection this week" detail="Your milk entries will appear here once recorded." />
          )}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Total milk recorded</span>
            <strong className="text-slate-900 dark:text-white">{Number(totalQuantity).toLocaleString('en-IN')} {unitLabel}</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm sm:p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment summary</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revenue collection status</p>
            </div>
            <IndianRupee className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{recoveryRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Collected</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${recoveryRate}%` }} />
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Total revenue</span>
              <strong className="text-slate-900 dark:text-white">{currency(totalRevenue)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-emerald-600 dark:text-emerald-400">Received</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{currency(totalReceive)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-rose-600 dark:text-rose-400">Pending</span>
              <strong className="text-rose-600 dark:text-rose-400">{currency(totalPending)}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('payments')}
            className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700 dark:border-slate-600 dark:text-slate-200 dark:hover:text-sky-300"
          >
            View payments <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Monthly overview</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Milk sales summary for the selected month</p>
          </div>
          <select
            aria-label="Select report month"
            value={selectedMonth}
            onChange={event => setSelectedMonth(event.target.value)}
            className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white sm:w-52"
          >
            {availableMonths.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}
          </select>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">Milk sold</p>
            <p className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-white sm:text-lg">{monthSummary.quantity}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">Earnings</p>
            <p className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-white sm:text-lg">{currency(monthSummary.earnings)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">Entries</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white sm:text-lg">{monthSummary.entries}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {monthSummary.customers} customers served in {monthLabel(selectedMonth)}.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent milk entries</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your latest 5 records</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('records')}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {recentRecords.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentRecords.map((record, index) => (
              <div key={record._id || index} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{record.customer || record.customerName || 'Customer'}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN') : '—'} · {record.shift || '—'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{Number(record.quantityKg) || 0} {record.quantityUnit === 'liter' ? 'L' : 'kg'}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{currency(record.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No milk entries yet" detail="Add your first milk entry to see recent activity here." />
        )}
      </section>
    </div>
  );
}
