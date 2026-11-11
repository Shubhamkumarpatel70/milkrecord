import React from 'react';
import {
  LayoutDashboard, Users, Milk, CreditCard, BarChart3, Settings,
  HelpCircle, X, ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, isOpen, onClose, onStartTour }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'records', label: 'Milk Records', icon: Milk },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const navigate = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden" />}
      <aside className={`fixed bottom-0 left-0 top-[60px] z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Menu</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = currentView === id || (currentView === 'home' && id === 'dashboard');
            return (
              <button key={id} type="button" onClick={() => navigate(id)} aria-current={active ? 'page' : undefined}
                className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${active ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'}`}>
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-sky-600 dark:text-sky-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-4 w-4 text-sky-500" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button type="button" onClick={() => { if (onStartTour) onStartTour(); if (onClose) onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:hover:border-sky-900 dark:hover:bg-sky-950/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><HelpCircle className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Need help?</span><span className="mt-0.5 block text-[11px] text-slate-500">Take a quick product tour</span></span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
}
