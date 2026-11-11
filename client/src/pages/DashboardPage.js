import React, { useMemo } from 'react';
import {
  Milk, IndianRupee, AlertCircle, Users, TrendingUp, PlusCircle,
  QrCode, ArrowUpRight, Activity, CalendarDays, UserPlus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const currency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(Number(value) || 0);

const localDateKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function StatCard({ label, value, detail, icon: Icon, tone = 'sky' }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
  };
  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white break-words">{value}</p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </section>
  );
}

function EmptyState({ title, detail }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

export default function DashboardPage({
  todaysMilkKg = 0,
  totalMilkQuantityKg = 0,
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
  const recoveryRate = totalRevenue > 0
    ? Math.min(100, Math.round((totalReceive / totalRevenue) * 100))
    : 0;

  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: localDateKey(date),
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        milk: 0
      };
    });
    const totals = new Map(days.map(day => [day.key, 0]));
    (Array.isArray(records) ? records : []).forEach(record => {
      const key = localDateKey(record.createdAt);
      if (totals.has(key)) totals.set(key, totals.get(key) + (Number(record.quantityKg) || 0));
    });
    return days.map(day => ({ ...day, milk: Number(totals.get(day.key).toFixed(2)) }));
  }, [records]);

  const hasWeeklyData = weeklyData.some(day => day.milk > 0);
  const topCustomers = useMemo(() => (
    (Array.isArray(customers) ? customers : [])
      .slice()
      .sort((a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0))
      .slice(0, 5)
  ), [customers]);

  const recentRecords = useMemo(() => (
    (Array.isArray(records) ? records : [])
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  ), [records]);

  const actions = [
    { label: 'Add milk entry', description: 'Record today’s collection', icon: Milk, onClick: onOpenAddRecord, tone: 'sky' },
    { label: 'Add customer', description: 'Create a customer profile', icon: UserPlus, onClick: onOpenAddCustomer, tone: 'violet' },
    { label: 'Payment QR', description: 'Generate a UPI payment QR', icon: QrCode, onClick: onOpenPaymentQR, tone: 'emerald' }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-7 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 sm:px-8 sm:py-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-sky-100">
              <Activity className="h-3.5 w-3.5" /> DAIRY OVERVIEW
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Your dairy, at a glance.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Track milk collection, customer balances and payments from one simple dashboard.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[190px]">
            <button onClick={onOpenAddRecord} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950">
              <PlusCircle className="h-4 w-4" /> Add milk entry
            </button>
            <button onClick={onOpenAddCustomer} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white">
              <Users className="h-4 w-4" /> Add customer
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Business summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <StatCard label="Today's collection" value={`${Number(todaysMilkKg || 0).toLocaleString('en-IN')} kg`} detail="Milk recorded today" icon={Milk} tone="sky" />
        <StatCard label="Total milk recorded" value={`${Number(totalMilkQuantityKg || 0).toLocaleString('en-IN')} kg`} detail={`${totalRecords} entries recorded`} icon={TrendingUp} tone="emerald" />
        <StatCard label="Total revenue" value={currency(totalRevenue)} detail={`Received ${currency(totalReceive)}`} icon={IndianRupee} tone="violet" />
        <StatCard label="Pending payments" value={currency(totalPending)} detail="Amount yet to be collected" icon={AlertCircle} tone="rose" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Milk collection trend</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Actual entries from the last seven days</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-950/50 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <CalendarDays className="h-3.5 w-3.5" /> Last 7 days
            </span>
          </div>
          {hasWeeklyData ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="milkCollectionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.dateLabel || label}
                    formatter={(value) => [`${value} kg`, 'Collection']}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="milk" stroke="#0284c7" strokeWidth={2.5} fill="url(#milkCollectionFill)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No collection data for this week" detail="Milk entries will appear here as soon as you add them." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment overview</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Collection against recorded revenue</p>
          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{recoveryRate}%</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Received</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${recoveryRate}%` }} />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Received</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{currency(totalReceive)}</strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400">Pending</span>
                <strong className="text-rose-600 dark:text-rose-400">{currency(totalPending)}</strong>
              </div>
            </div>
            <button onClick={() => onNavigate && onNavigate('payments')} className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
              View payments <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Top customers</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ranked by recorded total amount</p>
            </div>
            <button onClick={() => onNavigate && onNavigate('customers')} className="text-xs font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300">View all <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button>
          </div>
          {topCustomers.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {topCustomers.map((customer, index) => {
                const paid = Number(customer.paidAmount) || 0;
                const total = Number(customer.totalAmount) || 0;
                const isPaid = total > 0 && paid >= total;
                return (
                  <div key={customer._id || customer.whatsapp || `${customer.name}-${index}`} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-200">{(customer.name || 'C').charAt(0).toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{customer.name || 'Customer'}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{customer.whatsapp || customer.phone || 'No phone number'}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{currency(total)}</p>
                      <span className={`text-[10px] font-semibold ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{isPaid ? 'Paid' : 'Balance due'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No customers yet" detail="Add your first customer to see customer summaries here." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick actions</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Common tasks, one tap away</p>
          <div className="mt-4 space-y-2">
            {actions.map(({ label, description, icon: Icon, onClick, tone }) => (
              <button key={label} onClick={onClick} className="group flex min-h-[62px] w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-left transition hover:border-sky-300 hover:bg-sky-50/70 dark:hover:border-sky-800 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-sky-500">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone === 'sky' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-600" />
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200"><Users className="h-4 w-4 text-sky-600" /> Customer base</div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalCustomers}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Customers in your account</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent milk entries</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest saved records</p>
          </div>
          <button onClick={() => onNavigate && onNavigate('records')} className="text-xs font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300">All records <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button>
        </div>
        {recentRecords.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Shift</th>
                  <th className="pb-3 pr-4 text-right font-medium">Quantity</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentRecords.map((record, index) => (
                  <tr key={record._id || index} className="text-slate-700 dark:text-slate-200">
                    <td className="py-3 pr-4 font-medium">{record.customer || record.customerName || 'Customer'}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="py-3 pr-4 capitalize text-slate-500 dark:text-slate-400">{record.shift || '—'}</td>
                    <td className="py-3 pr-4 text-right font-medium">{Number(record.quantityKg) || 0} kg</td>
                    <td className="py-3 text-right font-semibold">{currency(record.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No milk entries yet" detail="Your latest milk records will show here after you save an entry." />
        )}
      </section>
    </div>
  );
}
