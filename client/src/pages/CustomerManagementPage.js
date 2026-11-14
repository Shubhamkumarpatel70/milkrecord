import React, { useMemo, useState } from 'react';
import {
  Users, Search, Plus, Grid, List, Eye, Send, CreditCard, ReceiptText,
  X, Trash2, Pencil, Wallet, CheckCircle2, AlertCircle, ArrowUpDown,
  Phone, CalendarDays, Milk, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const money = value => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const getPending = customer => Math.max(
  0,
  Number(customer.totalAmount || 0) - Number(customer.paidAmount || 0)
);

const getCustomerStatus = customer => getPending(customer) <= 0 ? 'paid' : 'pending';

export default function CustomerManagementPage({
  customers = [],
  records = [],
  onAddCustomer,
  onViewCustomer,
  onShareCustomer,
  onMarkPayment,
  onDeleteCustomer,
  onEditCustomer,
  onDeletePaymentTransaction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [transactionCustomer, setTransactionCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', whatsapp: '' });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState('');

  const formatDate = value => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  const customerStats = useMemo(() => {
    const total = customers.length;
    const pending = customers.filter(customer => getPending(customer) > 0);
    const paid = total - pending.length;
    const outstanding = customers.reduce((sum, customer) => sum + getPending(customer), 0);
    const received = customers.reduce((sum, customer) => sum + Number(customer.paidAmount || 0), 0);
    return { total, paid, pending: pending.length, outstanding, received };
  }, [customers]);

  const recordsByCustomer = useMemo(() => {
    const map = new Map();
    records.forEach(record => {
      const customerId = String(record.customerId?._id || record.customerId || '');
      const customerName = typeof record.customer === 'object'
        ? record.customer?.name
        : (record.customerName || record.customer);
      const key = customerId ? `id:${customerId}` : (customerName ? `name:${String(customerName).trim().toLowerCase()}` : '');
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(record);
    });
    return map;
  }, [records]);

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const result = customers.filter(customer => {
      const matchesSearch = !query ||
        String(customer.name || '').toLowerCase().includes(query) ||
        String(customer.whatsapp || '').replace(/\\D/g, '').includes(query.replace(/\\D/g, '')) ||
        String(customer._id || '').toLowerCase().includes(query);
      const status = getCustomerStatus(customer);
      return matchesSearch && (filterStatus === 'all' || status === filterStatus);
    });

    return result.sort((a, b) => {
      if (sortBy === 'pending') return getPending(b) - getPending(a);
      if (sortBy === 'recent') return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [customers, searchTerm, filterStatus, sortBy]);

  const getMilkSummary = customer => {
    const id = String(customer._id || '');
    const byId = id ? recordsByCustomer.get(`id:${id}`) : null;
    const byName = recordsByCustomer.get(`name:${String(customer.name || '').trim().toLowerCase()}`);
    const entries = byId || byName || [];
    return entries.reduce((total, record) => {
      const quantity = Number(record.quantityKg ?? record.quantity ?? 0);
      if (!Number.isFinite(quantity)) return total;
      if (String(record.quantityUnit || 'kg').toLowerCase().startsWith('lit')) total.liter += quantity;
      else total.kg += quantity;
      return total;
    }, { kg: 0, liter: 0 });
  };

  const openEditCustomer = customer => {
    setEditingCustomer(customer);
    setEditForm({ name: customer.name || '', whatsapp: customer.whatsapp || '' });
    setEditError('');
  };

  const submitCustomerEdit = async event => {
    event.preventDefault();
    const name = editForm.name.trim();
    const whatsapp = editForm.whatsapp.replace(/\\D/g, '');
    if (!name) return setEditError('Customer name is required.');
    if (!/^[6-9][0-9]{9}$/.test(whatsapp)) return setEditError('Enter a valid 10-digit Indian mobile number.');
    if (!onEditCustomer || !editingCustomer?._id) return setEditError('Customer update is unavailable. Please refresh and try again.');
    setEditSaving(true);
    setEditError('');
    try {
      await onEditCustomer(editingCustomer._id, { name, whatsapp });
      setEditingCustomer(null);
    } catch (error) {
      setEditError(error.response?.data?.message || error.message || 'Customer could not be updated.');
    } finally {
      setEditSaving(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setSortBy('name');
  };

  const CustomerActions = ({ customer, compact = false }) => (
    <div className={compact ? 'flex items-center gap-1.5 flex-wrap' : 'grid grid-cols-2 gap-2'}>
      {onViewCustomer && (
        <button type="button" onClick={() => onViewCustomer(customer)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Eye className="h-4 w-4" /> View
        </button>
      )}
      {onMarkPayment && (
        <button type="button" onClick={() => onMarkPayment(customer)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CreditCard className="h-4 w-4" /> Receive
        </button>
      )}
      {onShareCustomer && (
        <button type="button" onClick={() => onShareCustomer(customer.userId, customer.name, customer.whatsapp)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Send className="h-4 w-4" /> WhatsApp
        </button>
      )}
      <button type="button" onClick={() => setTransactionCustomer(customer)}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-teal-200 px-3 text-xs font-semibold text-teal-700 hover:bg-teal-50 dark:border-teal-900 dark:text-teal-300 dark:hover:bg-teal-950/40">
        <ReceiptText className="h-4 w-4" /> Ledger
      </button>
      {onEditCustomer && (
        <button type="button" onClick={() => openEditCustomer(customer)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-200 px-3 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40">
          <Pencil className="h-4 w-4" /> Edit
        </button>
      )}
      {onDeleteCustomer && (
        <button type="button" onClick={() => onDeleteCustomer(customer._id, customer.name)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      )}
    </div>
  );

  return (
    <main className="w-full max-w-full space-y-5 overflow-x-hidden pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-700 to-teal-800 p-5 text-white shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-emerald-300/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
              <Users className="h-4 w-4" /> Customer directory
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Customers</h1>
            <p className="mt-1 max-w-xl text-sm text-emerald-100">Manage customer details, milk records and payment dues from one place.</p>
          </div>
          <button type="button" onClick={onAddCustomer}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-emerald-700 shadow-md transition hover:bg-emerald-50 sm:w-auto">
            <Plus className="h-4 w-4" /> Add customer
          </button>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-emerald-100">Total customers</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{customerStats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-emerald-100">Fully paid</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{customerStats.paid}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-emerald-100">Payment pending</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{customerStats.pending}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-emerald-100">Outstanding amount</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">₹{money(customerStats.outstanding)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search name, mobile number or customer ID..."
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-950" />
          </div>
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'all', label: 'All', count: customerStats.total },
              { id: 'pending', label: 'Pending', count: customerStats.pending },
              { id: 'paid', label: 'Paid', count: customerStats.paid }
            ].map(item => (
              <button key={item.id} type="button" onClick={() => setFilterStatus(item.id)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${filterStatus === item.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
                {item.label}<span className={`rounded-md px-1.5 py-0.5 text-[10px] ${filterStatus === item.id ? 'bg-white/20' : 'bg-white/70 dark:bg-slate-800'}`}>{item.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Showing <strong className="text-slate-800 dark:text-slate-100">{filteredCustomers.length}</strong> of {customers.length} customers</span>
            {(searchTerm || filterStatus !== 'all') && <button type="button" onClick={resetFilters} className="ml-1 inline-flex items-center gap-1 font-bold text-emerald-600"><RotateCcw className="h-3 w-3" /> Reset</button>}
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="customer-sort">Sort customers</label>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 dark:border-slate-700">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select id="customer-sort" value={sortBy} onChange={event => setSortBy(event.target.value)}
                className="min-h-9 bg-transparent text-xs font-semibold text-slate-600 outline-none dark:text-slate-300">
                <option value="name">Name A–Z</option>
                <option value="pending">Highest due</option>
                <option value="recent">Recently updated</option>
              </select>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
              <button type="button" aria-label="Grid view" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}
                className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}><Grid className="h-4 w-4" /></button>
              <button type="button" aria-label="List view" aria-pressed={viewMode === 'table'} onClick={() => setViewMode('table')}
                className={`rounded-md p-2 ${viewMode === 'table' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}><List className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>

      {filteredCustomers.length === 0 ? (
        searchTerm || filterStatus !== 'all' ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-800 dark:text-slate-100">No matching customers</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search or clear the selected filters.</p>
            <button type="button" onClick={resetFilters} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Clear filters</button>
          </div>
        ) : <EmptyState type="customers" title="No Customers Added Yet" onAction={onAddCustomer} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {filteredCustomers.map(customer => {
            const pending = getPending(customer);
            const paid = pending <= 0;
            const milk = getMilkSummary(customer);
            const milkLabel = [milk.kg > 0 ? `${Number(milk.kg.toFixed(2))} kg` : '', milk.liter > 0 ? `${Number(milk.liter.toFixed(2))} L` : ''].filter(Boolean).join(' · ') || '0 kg';
            const paidPercent = Number(customer.totalAmount || 0) > 0
              ? Math.min(100, Math.round(Number(customer.paidAmount || 0) / Number(customer.totalAmount) * 100))
              : 100;
            return (
              <article key={customer._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-extrabold text-white shadow-sm">{(customer.name || 'C').charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{customer.name || 'Unnamed customer'}</h2>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Phone className="h-3 w-3" />{customer.whatsapp ? `+91 ${customer.whatsapp}` : 'No mobile number'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${paid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                      {paid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}{paid ? 'Paid' : 'Due pending'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/70">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total bill</p>
                      <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">₹{money(customer.totalAmount)}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${pending > 0 ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Balance due</p>
                      <p className={`mt-1 text-base font-extrabold ${pending > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>₹{money(pending)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Received</p>
                      <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">₹{money(customer.paidAmount)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Milk supplied</p>
                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-300"><Milk className="h-3.5 w-3.5" />{milkLabel}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>Payment progress</span><span>{paidPercent}% received</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className={`h-full rounded-full ${paid ? 'bg-emerald-500' : 'bg-emerald-500'}`} style={{ width: `${paidPercent}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{customer.month || 'Current billing period'}</span>
                    <span>{customer.totalDays || 0} billing days</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/30">
                  <CustomerActions customer={customer} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-900/70">
                <tr>
                  <th className="px-4 py-3">Customer</th><th className="px-4 py-3">Mobile</th><th className="px-4 py-3">Bill</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Pending</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredCustomers.map(customer => {
                  const pending = getPending(customer);
                  const paid = pending <= 0;
                  return (
                    <tr key={customer._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{customer.name}</td>
                      <td className="px-4 py-3 text-slate-500">{customer.whatsapp || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">₹{money(customer.totalAmount)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-300">₹{money(customer.paidAmount)}</td>
                      <td className={`px-4 py-3 font-bold ${pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{money(pending)}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{paid ? 'Paid' : 'Pending'}</span></td>
                      <td className="px-4 py-3"><div className="flex justify-end"><CustomerActions customer={customer} compact /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !editSaving) setEditingCustomer(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="edit-customer-title" className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
              <div><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Customer details</p><h2 id="edit-customer-title" className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Edit customer</h2><p className="mt-1 text-xs text-slate-500">Update name and mobile number.</p></div>
              <button type="button" disabled={editSaving} onClick={() => setEditingCustomer(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800" aria-label="Close edit form"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submitCustomerEdit} className="space-y-4 p-5">
              <div><label htmlFor="edit-customer-name" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Customer name</label><input id="edit-customer-name" autoFocus required maxLength={100} value={editForm.name} onChange={event => setEditForm(current => ({ ...current, name: event.target.value }))} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Enter customer name" /></div>
              <div><label htmlFor="edit-customer-mobile" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Mobile / WhatsApp number</label><div className="flex"><span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800">+91</span><input id="edit-customer-mobile" type="tel" inputMode="numeric" autoComplete="tel-national" required maxLength={15} value={editForm.whatsapp} onChange={event => setEditForm(current => ({ ...current, whatsapp: event.target.value.replace(/[^0-9+\s()-]/g, '') }))} className="min-h-11 min-w-0 flex-1 rounded-r-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="10-digit mobile number" /></div><p className="mt-1 text-[11px] text-slate-400">Enter a valid 10-digit Indian mobile number.</p></div>
              {editError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{editError}</div>}
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"><button type="button" disabled={editSaving} onClick={() => setEditingCustomer(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button><button type="submit" disabled={editSaving} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60">{editSaving ? 'Saving…' : 'Save changes'}</button></div>
            </form>
          </section>
        </div>
      )}

      {transactionCustomer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) setTransactionCustomer(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="customer-ledger-title" className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
              <div><h2 id="customer-ledger-title" className="text-lg font-extrabold text-slate-900 dark:text-white">Payment ledger</h2><p className="mt-1 text-xs text-slate-500">{transactionCustomer.name} · Payment history</p></div>
              <button type="button" onClick={() => setTransactionCustomer(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800" aria-label="Close ledger"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/30"><p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Total received</p><p className="mt-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-300">₹{money((transactionCustomer.paymentTransactions || []).reduce((sum, tx) => sum + Number(tx.amount || 0), 0))}</p></div>
                <div className="rounded-2xl bg-rose-50 p-3 dark:bg-rose-950/30"><p className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300">Transactions</p><p className="mt-1 text-xl font-extrabold text-rose-700 dark:text-rose-300">{transactionCustomer.paymentTransactions?.length || 0}</p></div>
              </div>
              {(transactionCustomer.paymentTransactions || []).length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">No dated payment transactions found.<p className="mt-1 text-xs">Payments recorded before transaction history was enabled cannot be reconstructed individually.</p></div>
              ) : [...transactionCustomer.paymentTransactions].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map((tx, index) => (
                <div key={tx._id || index} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{formatDate(tx.paymentDate)}</p>
                    <p className="mt-1 break-words text-xs text-slate-500">{tx.remark || 'No remark'}</p>
                    {tx.billingMonth && <p className="mt-1 text-[10px] font-semibold text-slate-400">Applied to {tx.billingMonth}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{money(tx.amount)}</p>
                    <button
                      type="button"
                      disabled={!tx._id || deletingTransactionId === String(tx._id) || !onDeletePaymentTransaction}
                      onClick={async () => {
                        if (!tx._id) return;
                        const confirmed = window.confirm(`Delete payment of ₹${money(tx.amount)} dated ${formatDate(tx.paymentDate)} for ${transactionCustomer.name}? The received amount will be reversed from the milk records.`);
                        if (!confirmed) return;
                        setDeletingTransactionId(String(tx._id));
                        try {
                          await onDeletePaymentTransaction(transactionCustomer._id, tx._id);
                          setTransactionCustomer(previous => previous ? {
                            ...previous,
                            paymentTransactions: (previous.paymentTransactions || []).filter(item => String(item._id) !== String(tx._id))
                          } : previous);
                        } catch (error) {
                          window.alert(error.response?.data?.message || error.message || 'Payment transaction could not be deleted.');
                        } finally {
                          setDeletingTransactionId('');
                        }
                      }}
                      className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-rose-200 px-2.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {deletingTransactionId === String(tx._id) ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-4 dark:border-slate-800"><button type="button" onClick={() => setTransactionCustomer(null)} className="min-h-11 w-full rounded-xl bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">Close ledger</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
