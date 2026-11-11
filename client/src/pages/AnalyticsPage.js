import React, { useMemo } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export default function AnalyticsPage({
  totalMilkQuantityKg = 0,
  totalRevenue = 0,
  totalCustomers = 0,
  customers = [],
  records = []
}) {
  const dailyData = useMemo(() => {
    const grouped = new Map();
    records.forEach((record) => {
      const dateValue = record.createdAt || record.date;
      if (!dateValue) return;
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const current = grouped.get(key) || {
        date: key,
        label: formatDate(date),
        milk: 0,
        revenue: 0
      };
      current.milk += Number(record.quantityKg || record.quantity || 0);
      current.revenue += Number(record.amount || 0);
      grouped.set(key, current);
    });
    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  const handleExportExcel = () => {
    const rows = customers.map((customer) => ({
      'Customer Name': customer.name || '',
      'WhatsApp Phone': customer.whatsapp || '',
      'Report Month': customer.month || '',
      'Recorded Days': Number(customer.totalDays || 0),
      'Total Amount (INR)': Number(customer.totalAmount || 0),
      'Paid Amount (INR)': Number(customer.paidAmount || 0),
      'Remaining Balance (INR)': Math.max(0, Number(customer.totalAmount || 0) - Number(customer.paidAmount || 0)),
      'Payment Status': customer.status || 'unpaid'
    }));

    if (!rows.length) {
      window.alert('There is no customer data to export yet.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Report');
    XLSX.writeFile(workbook, `Milk_Record_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-8 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">Business Analytics</h1>
            <p className="text-xs text-slate-500">Figures and charts are calculated from saved milk records and customer data.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={handleExportExcel} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 min-h-[44px]">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2 min-h-[44px] shrink-0">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Milk Produced</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400">{Number(totalMilkQuantityKg || 0).toLocaleString('en-IN')} Kg</div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Recorded Amount</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{Number(totalRevenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Customers</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">{Number(totalCustomers || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Daily Milk & Amount</h3>
          <p className="text-xs text-slate-500 mt-1">Only saved records currently loaded for the selected month are shown.</p>
        </div>
        {dailyData.length ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="milk" stroke="#0ea5e9" fontSize={11} />
                <YAxis yAxisId="revenue" orientation="right" stroke="#10b981" fontSize={11} />
                <Tooltip />
                <Bar yAxisId="milk" dataKey="milk" name="Milk (Kg)" fill="#0ea5e9" radius={[5, 5, 0, 0]} />
                <Bar yAxisId="revenue" dataKey="revenue" name="Recorded Amount (₹)" fill="#10b981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-500">No milk records are available for this month yet. Add a real milk entry to see analytics here.</div>
        )}
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Customer Report</h3>
          <span className="text-xs text-slate-400">{customers.length} customers</span>
        </div>
        {customers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-bold">
                <tr><th className="p-3">Customer</th><th className="p-3">Days</th><th className="p-3">Amount</th><th className="p-3">Paid</th><th className="p-3">Due</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{customer.name}</td>
                    <td className="p-3">{Number(customer.totalDays || 0)}</td>
                    <td className="p-3">₹{Number(customer.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-emerald-600">₹{Number(customer.paidAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-rose-600">₹{Math.max(0, Number(customer.totalAmount || 0) - Number(customer.paidAmount || 0)).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">No customers found. Add a customer to build this report.</div>
        )}
      </section>
    </div>
  );
}
