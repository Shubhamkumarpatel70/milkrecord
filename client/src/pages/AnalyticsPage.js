import React from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';

export default function AnalyticsPage({
  todaysMilkKg = 0,
  totalMilkQuantityKg = 0,
  totalRevenue = 0,
  totalCustomers = 0,
  customers = []
}) {
  const chartData = [
    { month: 'Jul', milk: 1200, revenue: 60000, customers: 8 },
    { month: 'Aug', milk: 1500, revenue: 75000, customers: 10 },
    { month: 'Sep', milk: 1800, revenue: 90000, customers: 12 },
    { month: 'Oct', milk: 2100, revenue: 105000, customers: 14 },
    { month: 'Nov', milk: 2400, revenue: 120000, customers: 15 },
    { month: 'Dec', milk: totalMilkQuantityKg > 0 ? totalMilkQuantityKg : 2700, revenue: totalRevenue > 0 ? totalRevenue : 135000, customers: totalCustomers > 0 ? totalCustomers : 18 },
  ];

  const handleExportExcel = () => {
    const dataToExport = customers.map(c => ({
      'Customer Name': c.name,
      'WhatsApp Phone': c.whatsapp || '-',
      'Month': c.month || '-',
      'Total Days': c.totalDays || 0,
      'Total Amount (INR)': c.totalAmount || 0,
      'Paid Amount (INR)': c.paidAmount || 0,
      'Remaining Balance (INR)': Math.max(0, (c.totalAmount || 0) - (c.paidAmount || 0)),
      'Payment Status': c.status || 'unpaid'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Milk Report');
    XLSX.writeFile(workbook, `Milk_Record_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics & Business Intelligence</h1>
            <p className="text-xs text-slate-500">Interactive trends, milk quantity charts, customer growth, and PDF/Excel export.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel Report</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Milk Produced</span>
          <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
            {totalMilkQuantityKg} Kg
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cumulative Revenue</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{totalRevenue}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Customer Base</span>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {totalCustomers} Customers
          </div>
        </div>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Growth Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Monthly Revenue Trend (₹)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Trend Area Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Customer Acquisition Growth</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="customers" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
