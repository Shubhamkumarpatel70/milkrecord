import React, { useState } from 'react';
import { Milk, Calendar, Sun, Moon, Plus, Search, Edit } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function MilkRecordsPage({
  records = [],
  selectedMonth = new Date().toISOString().slice(0, 7),
  onMonthChange,
  onOpenAddRecord,
  onOpenEditRecord,
  onOpenCalendar,
  selectedCustomer = null,
  onClearCustomerView
}) {
  const [shiftFilter, setShiftFilter] = useState('all'); // 'all' | 'morning' | 'evening'
  const [searchTerm, setSearchTerm] = useState('');

  // Restrict customer view by the record's customer name first.
  // Older records and some API responses may carry a non-customer value in
  // customerId; trusting that field alone can incorrectly hide/mix records.
  // Customer names are unique per owner (enforced by the API), so the
  // normalized name is the reliable cross-version match. Use ID only when
  // the record has no customer name at all.
  const normalizeCustomerName = value => String(value || '').trim().toLocaleLowerCase();
  const selectedCustomerName = normalizeCustomerName(selectedCustomer?.name);
  const selectedCustomerId = String(selectedCustomer?._id || '');
  const customerRecords = selectedCustomer
    ? records.filter(record => {
        const recordName = normalizeCustomerName(record.customerName || record.customer?.name || record.customer);
        if (recordName && selectedCustomerName) return recordName === selectedCustomerName;
        const recordCustomerId = String(record.customerId?._id || record.customerId || '');
        return Boolean(selectedCustomerId && recordCustomerId === selectedCustomerId);
      })
    : records;

  // Filter records based on shift & search term
  const filteredRecords = customerRecords.filter(r => {
    const custName = r.customerName || r.customer || '';
    const dateStr = r.createdAt ? r.createdAt.slice(0, 10) : (r.date || '');
    const matchesSearch = custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dateStr.includes(searchTerm);
    const matchesShift = shiftFilter === 'all' || (r.shift || 'morning').toLowerCase() === shiftFilter;
    return matchesSearch && matchesShift;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-8 w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{selectedCustomer ? `${selectedCustomer.name}'s Milk Records` : 'Daily Milk Records'}</h1>
            <p className="text-xs text-slate-500">{selectedCustomer ? 'Date-wise milk quantity and amount for this customer.' : 'Track Morning & Evening milk collection, rates, and customer delivery logs.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {selectedCustomer && <button onClick={onClearCustomerView} className="btn-secondary text-xs px-3 py-2 min-h-[44px]">All Records</button>}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange && onMonthChange(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 min-h-[44px]"
          />

          <button
            onClick={onOpenAddRecord}
            className="btn-primary text-xs py-2.5 px-4 sm:px-5 flex items-center justify-center gap-1.5 shadow-md min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Shift Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by customer or date..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 min-h-[40px]"
          />
        </div>

        {/* Shift Filter Toolbar */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <span className="text-slate-400 font-semibold mr-1 shrink-0">Shift:</span>
          <button
            onClick={() => setShiftFilter('all')}
            className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors shrink-0 ${
              shiftFilter === 'all' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Shifts
          </button>
          <button
            onClick={() => setShiftFilter('morning')}
            className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors flex items-center gap-1 shrink-0 ${
              shiftFilter === 'morning' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning</span>
          </button>
          <button
            onClick={() => setShiftFilter('evening')}
            className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors flex items-center gap-1 shrink-0 ${
              shiftFilter === 'evening' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening</span>
          </button>
        </div>

        {onOpenCalendar && (
          <button
            onClick={onOpenCalendar}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 self-end md:self-auto shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Calendar View</span>
          </button>
        )}
      </div>

      {selectedCustomer && (
        <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 sm:p-5 shadow-soft">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Date-wise Summary</h2>
          {(() => {
            const byDate = filteredRecords.reduce((map, record) => {
              const date = record.createdAt ? record.createdAt.slice(0, 10) : (record.date || '');
              if (!date) return map;
              if (!map[date]) map[date] = { kg: 0, liter: 0, amount: 0, entries: 0 };
              const quantity = Number(record.quantityKg || record.quantity || 0);
              if (record.quantityUnit === 'liter') map[date].liter += quantity; else map[date].kg += quantity;
              map[date].amount += Number(record.amount || 0);
              map[date].entries += 1;
              return map;
            }, {});
            const days = Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a));
            return days.length ? <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50"><tr><th className="p-3">Date</th><th className="p-3">Quantity</th><th className="p-3">Entries</th><th className="p-3">Amount</th></tr></thead><tbody>{days.map(([date, day]) => <tr key={date} className="border-t border-slate-100 dark:border-slate-700"><td className="p-3 font-semibold">{date}</td><td className="p-3">{day.kg ? day.kg.toFixed(2) + ' kg' : ''}{day.kg && day.liter ? ' + ' : ''}{day.liter ? day.liter.toFixed(2) + ' L' : ''}</td><td className="p-3">{day.entries}</td><td className="p-3 font-bold text-emerald-600">₹{day.amount.toFixed(2)}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">No entries found for this customer in the selected month.</p>;
          })()}
        </section>
      )}

      {/* Main Records Content: Responsive Mobile Cards & Desktop Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          type="records"
          title={searchTerm ? "No Records Match Filter" : "No Milk Entries Found"}
          onAction={onOpenAddRecord}
        />
      ) : (
        <div className="space-y-4">
          
          {/* Mobile Card List (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredRecords.map((rec, i) => {
              const custName = rec.customerName || rec.customer || 'Unknown';
              const dateStr = rec.createdAt ? rec.createdAt.slice(0, 10) : (rec.date || 'Today');
              const isPaid = rec.status === 'paid';

              return (
                <div
                  key={rec._id || i}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{dateStr}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.shift === 'evening'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {rec.shift === 'evening' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                      <span className="capitalize">{rec.shift || 'Morning'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{custName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isPaid ? 'Paid ✓' : 'Unpaid ○'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Quantity</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{rec.quantityKg || rec.quantity || 0} {rec.quantityUnit === 'liter' ? 'Liter' : 'Kg'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Amount</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{rec.amount || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Data Table (>= 640px) */}
          <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Shift</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Amount (₹)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {filteredRecords.map((rec, i) => (
                    <tr key={rec._id || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
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
                        {rec.quantityKg || rec.quantity || 0} {rec.quantityUnit === 'liter' ? 'Liter' : 'Kg'}
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

        </div>
      )}

    </div>
  );
}
