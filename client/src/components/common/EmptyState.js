import React from 'react';
import { Users, Milk, CreditCard, BarChart3, PlusCircle } from 'lucide-react';

export default function EmptyState({
  type = 'customers', // 'customers' | 'records' | 'payments' | 'analytics' | 'generic'
  title,
  description,
  actionLabel,
  onAction
}) {
  const configs = {
    customers: {
      icon: Users,
      color: 'from-sky-500 to-indigo-600',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50',
      title: title || 'No Customers Added Yet',
      description: description || 'Start building your dairy customer list. Add customer profiles with phone/WhatsApp numbers to send milk entries and auto payment receipts.',
      actionLabel: actionLabel || 'Add First Customer'
    },
    records: {
      icon: Milk,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
      title: title || 'No Daily Milk Entries Found',
      description: description || 'No milk collection records found for the selected month or date range. Add morning/evening milk quantities to track daily delivery.',
      actionLabel: actionLabel || 'Add Daily Entry'
    },
    payments: {
      icon: CreditCard,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
      title: title || 'No Payment Transactions Recorded',
      description: description || 'All customer dues are up to date or no payment transactions have been logged. Mark entries as paid or generate UPI payment QR codes.',
      actionLabel: actionLabel || 'Record Payment'
    },
    analytics: {
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50',
      title: title || 'Insufficient Data for Reports',
      description: description || 'Log daily milk entries for at least a week to generate interactive collection graphs, revenue trends, and customer growth reports.',
      actionLabel: actionLabel || 'Add Milk Record'
    },
    generic: {
      icon: PlusCircle,
      color: 'from-slate-500 to-slate-700',
      bgColor: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700',
      title: title || 'No Data Found',
      description: description || 'There are currently no items to display here.',
      actionLabel: actionLabel || 'Get Started'
    }
  };

  const config = configs[type] || configs.generic;
  const Icon = config.icon;

  return (
    <div className={`p-8 sm:p-12 rounded-3xl border text-center max-w-lg mx-auto my-6 ${config.bgColor} transition-all duration-300`}>
      {/* Animated Icon Avatar */}
      <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-tr ${config.color} text-white flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {config.title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
        {config.description}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center gap-2 text-sm font-semibold py-3 px-6 shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{config.actionLabel}</span>
        </button>
      )}
    </div>
  );
}
