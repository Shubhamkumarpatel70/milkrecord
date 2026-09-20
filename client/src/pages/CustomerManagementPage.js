import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  Send,
  CreditCard
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function CustomerManagementPage({
  customers = [],
  onAddCustomer,
  onViewCustomer,
  onShareCustomer,
  onMarkPayment,
  isAuthenticated
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter customers based on search & status
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.whatsapp?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customer Management</h1>
              <p className="text-xs text-slate-500">Manage dairy customers, track unpaid dues, and share WhatsApp reports.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onAddCustomer}
          className="btn-primary text-xs py-3 px-5 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Toolbar: Search, Filter, View Mode Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or WhatsApp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'paid', 'unpaid'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-400'}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-400'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Content Rendering */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          type="customers"
          title={searchTerm ? 'No Customers Match Search' : 'No Customers Added Yet'}
          onAction={onAddCustomer}
        />
      ) : viewMode === 'grid' ? (
        
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((cust, idx) => {
            const pending = Math.max(0, (cust.totalAmount || 0) - (cust.paidAmount || 0));
            const isPaid = cust.status === 'paid' || pending === 0;

            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-medium transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-emerald-500 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                        {(cust.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-sky-600 transition-colors">
                          {cust.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {cust.whatsapp ? `+91 ${cust.whatsapp}` : 'No Phone'}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {isPaid ? 'Paid ✓' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 mb-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Days</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{cust.totalDays || 0} Days</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Bill</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">₹{cust.totalAmount || 0}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200/60 dark:border-slate-800 pt-2 flex justify-between">
                      <span className="text-slate-400 text-[10px] font-bold">Pending Dues</span>
                      <span className={`font-extrabold ${pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{pending}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => onViewCustomer && onViewCustomer(cust.userId, cust.month, cust.name)}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Calendar</span>
                  </button>

                  <button
                    onClick={() => onMarkPayment && onMarkPayment(cust)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isPaid ? 'Paid' : 'Settle'}</span>
                  </button>

                  {onShareCustomer && (
                    <button
                      onClick={() => onShareCustomer(cust.userId, cust.name)}
                      className="p-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      title="Share via WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* Table View */
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Month</th>
                  <th className="p-4">Days</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Pending Dues</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredCustomers.map((c, i) => {
                  const pending = Math.max(0, (c.totalAmount || 0) - (c.paidAmount || 0));
                  const isPaid = c.status === 'paid' || pending === 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                      <td className="p-4 text-slate-500">{c.whatsapp || '-'}</td>
                      <td className="p-4 text-slate-500">{c.month || '-'}</td>
                      <td className="p-4 text-slate-800 dark:text-slate-200">{c.totalDays || 0}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100">₹{c.totalAmount || 0}</td>
                      <td className={`p-4 font-bold ${pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{pending}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => onViewCustomer && onViewCustomer(c.userId, c.month, c.name)}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onMarkPayment && onMarkPayment(c)}
                          className={`px-3 py-1.5 rounded-lg font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                        >
                          {isPaid ? 'Paid' : 'Pay'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
