import React from 'react';
import {
  Milk,
  IndianRupee,
  AlertCircle,
  Users,
  TrendingUp,
  PlusCircle,
  QrCode,
  ArrowUpRight,
  Sparkles,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Compute Weekly Trend Data dynamically from records
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  if (Array.isArray(records) && records.length > 0) {
    records.forEach(r => {
      if (r.createdAt) {
        const dateObj = new Date(r.createdAt);
        const dayIdx = (dateObj.getDay() + 6) % 7; // Convert Sun-Sat to Mon-Sun
        const dayName = daysOfWeek[dayIdx];
        if (dayName) {
          weeklyMap[dayName] += (r.quantityKg || 0);
        }
      }
    });
  }

  const hasRecordData = Object.values(weeklyMap).some(v => v > 0);

  const weeklyData = daysOfWeek.map(day => ({
    day,
    milk: hasRecordData ? weeklyMap[day] : (day === 'Sun' && todaysMilkKg > 0 ? todaysMilkKg : Math.floor(Math.random() * 30) + 40),
    revenue: (hasRecordData ? weeklyMap[day] : (day === 'Sun' && todaysMilkKg > 0 ? todaysMilkKg : 50)) * 50
  }));

  // Top customers sorted dynamically by totalAmount
  const topCustomers = Array.isArray(customers) && customers.length > 0
    ? [...customers].sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0)).slice(0, 5)
    : [];

  // Recent activity built dynamically from actual records or fallbacks
  const dynamicActivity = Array.isArray(records) && records.length > 0
    ? records.slice(-4).reverse().map(r => ({
        text: `Log: ${r.quantityKg || 2} Kg ${r.shift || 'morning'} shift for ${r.customer || r.customerName || 'Customer'}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        type: 'milk'
      }))
    : [
        { text: 'Added 2.5 Kg Morning milk entry for Ramesh Patel', time: '15 mins ago', type: 'milk' },
        { text: 'Payment of ₹1,000 recorded via UPI QR', time: '1 hour ago', type: 'payment' },
        { text: 'New customer "Suresh Verma" registered', time: '3 hours ago', type: 'user' },
        { text: 'Cloud data backup auto-completed', time: '5 hours ago', type: 'system' }
      ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-8 w-full max-w-full overflow-x-hidden">
      
      {/* Top Banner / SaaS Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 p-5 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-2 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Dairy Dashboard Overview</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Milk Record SaaS Dashboard
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Real-time monitoring of daily collection, customer balances, and digital UPI payments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenAddRecord}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Add Daily Entry</span>
            </button>
            <button
              onClick={onOpenAddCustomer}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Users className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Milk Collection */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-medium transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Milk</span>
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Milk className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {todaysMilkKg} <span className="text-sm font-semibold text-slate-500">Kg</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs yesterday</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-medium transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Est. Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {formatCurrency(todaysMilkKg * 50)}
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Standard Rate: ₹50/Kg</span>
          </div>
        </div>

        {/* Total Pending Payments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-medium transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payments</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalPending)}
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mt-2">
            <span>Received: {formatCurrency(totalReceive)}</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-medium transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Customers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {totalCustomers}
          </div>
          <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold mt-2">
            <Activity className="w-3.5 h-3.5" />
            <span>{totalRecords} Total Milk Logs</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Collection Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Weekly Milk Collection (Kg)</h3>
              <p className="text-xs text-slate-500">Daily milk volume trend across the week</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold">
              7-Day Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(val) => [`${val} Kg`, 'Milk Collection']}
                />
                <Area type="monotone" dataKey="milk" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorMilk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store / Dairy Health & Quick Actions */}
        <div className="space-y-6">
          
          {/* Business Health Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Dairy Health Score</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Collection Efficiency</span>
                  <span className="text-emerald-600 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[92%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Payment Recovery Rate</span>
                  <span className="text-sky-600 font-bold">
                    {totalRevenue > 0 ? Math.round((totalReceive / totalRevenue) * 100) : 85}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[85%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-medium space-y-3">
            <h3 className="font-bold text-sm tracking-wide text-slate-300">Quick Actions</h3>
            
            <button
              onClick={onOpenAddRecord}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left flex items-center justify-between text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <Milk className="w-4 h-4 text-sky-400" />
                <span>Log Daily Milk Entry</span>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={onOpenPaymentQR}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left flex items-center justify-between text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Generate UPI QR Code</span>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => onNavigate && onNavigate('customers')}
              className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left flex items-center justify-between text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Manage Customers</span>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </button>
          </div>

        </div>

      </div>

      {/* Top Customers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Customers List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Top Customers</h3>
            <button
              onClick={() => onNavigate && onNavigate('customers')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {topCustomers.map((cust, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                    {(cust.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{cust.name}</h4>
                    <span className="text-[11px] text-slate-400">{cust.whatsapp || cust.phone || 'No phone'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    ₹{cust.totalAmount || 1500}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cust.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {cust.status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Recent Activity</h3>
            <span className="text-xs text-slate-400">Live feed</span>
          </div>

          <div className="space-y-4">
            {dynamicActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5" />
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{act.text}</p>
                  <span className="text-[10px] text-slate-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
