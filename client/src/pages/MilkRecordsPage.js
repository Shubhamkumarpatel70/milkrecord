import React, { useState } from 'react';
import { Milk, Calendar, Sun, Moon, Plus, Edit } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function MilkRecordsPage({
  records = [],
  selectedMonth = new Date().toISOString().slice(0, 7),
  onMonthChange,
  onOpenAddRecord,
  onOpenEditRecord,
  onOpenCalendar
}) {
  const [shiftFilter, setShiftFilter] = useState('all'); // 'all' | 'morning' | 'evening'

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daily Milk Records</h1>
            <p className="text-xs text-slate-500">Track Morning & Evening milk collection, rates, and customer delivery logs.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange && onMonthChange(e.target.value)}
            className="px-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
          />

          <button
            onClick={onOpenAddRecord}
            className="btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Shift Filter Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Shift Filter:</span>
          <button
            onClick={() => setShiftFilter('all')}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
              shiftFilter === 'all' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700'
            }`}
          >
            All Shifts
          </button>
          <button
            onClick={() => setShiftFilter('morning')}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors flex items-center gap-1 ${
              shiftFilter === 'morning' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning Shift</span>
          </button>
          <button
            onClick={() => setShiftFilter('evening')}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors flex items-center gap-1 ${
              shiftFilter === 'evening' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening Shift</span>
          </button>
        </div>

        <button
          onClick={onOpenCalendar}
          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          <Calendar className="w-4 h-4" />
          <span>Interactive Month Calendar</span>
        </button>
      </div>

      {/* Main Records List / Table */}
      {records.length === 0 ? (
        <EmptyState
          type="records"
          title="No Milk Entries Found"
          onAction={onOpenAddRecord}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Shift</th>
                  <th className="p-4">Quantity (Kg)</th>
                  <th className="p-4">Amount (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {records.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      {rec.createdAt ? rec.createdAt.slice(0, 10) : rec.date || 'Today'}
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {rec.customerName || rec.customer || 'Unknown'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.shift === 'evening'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {rec.shift === 'evening' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                        <span className="capitalize">{rec.shift || 'Morning'}</span>
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-slate-100">
                      {rec.quantityKg || rec.quantity || 0} Kg
                    </td>
                    <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{rec.amount || 0}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {rec.status === 'paid' ? 'Paid ✓' : 'Unpaid ○'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onOpenEditRecord && onOpenEditRecord(rec)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
