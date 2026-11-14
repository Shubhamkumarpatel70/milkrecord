import React from 'react';
import {
  LayoutDashboard, Users, Milk, CreditCard, BarChart3, Settings,
  HelpCircle, X, ChevronRight, Droplets, Sparkles
} from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, isOpen, onClose, onStartTour }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Today at a glance', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', hint: 'Your milk customers', icon: Users },
    { id: 'records', label: 'Milk Records', hint: 'Daily delivery log', icon: Milk },
    { id: 'payments', label: 'Payments', hint: 'Collections & dues', icon: CreditCard },
    { id: 'analytics', label: 'Reports & Analytics', hint: 'Business performance', icon: BarChart3 },
    { id: 'settings', label: 'Settings', hint: 'Dairy preferences', icon: Settings }
  ];
  const navigate = id => { onNavigate(id); onClose?.(); };

  return <>
    {isOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden" />}
    <aside className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[272px] flex-col border-r border-emerald-100 bg-[#fbfefc] shadow-[8px_0_30px_rgba(16,80,50,0.04)] transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex items-center justify-between border-b border-emerald-100/80 px-5 py-4 dark:border-slate-800 lg:hidden">
        <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">Dairy menu</span>
        <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-xl p-2 text-slate-500 hover:bg-emerald-50 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
      </div>
      <div className="mx-4 mt-5 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-600 p-4 text-white shadow-lg shadow-emerald-900/10">
        <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><Droplets className="h-5 w-5" /></span><span><span className="block text-sm font-extrabold">Your Dairy</span><span className="block text-[10px] font-medium text-emerald-50/80">Milk management workspace</span></span></div>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-50/90"><Sparkles className="h-3 w-3" /> Simple • Fresh • Organised</div>
      </div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        {navItems.map(({ id, label, hint, icon: Icon }) => {
          const active = currentView === id || (currentView === 'home' && id === 'dashboard');
          return <button key={id} type="button" onClick={() => navigate(id)} aria-current={active ? 'page' : undefined}
            className={`group relative flex min-h-[54px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${active ? 'bg-emerald-100/80 text-emerald-900 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-900' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'}`}>
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-400 ring-1 ring-slate-200 group-hover:text-emerald-700 dark:bg-slate-900 dark:ring-slate-700'}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.9} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-extrabold">{label}</span><span className={`mt-0.5 block truncate text-[10px] ${active ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-slate-400'}`}>{hint}</span></span>
            {active && <ChevronRight className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />}
          </button>;
        })}
      </nav>
      <div className="border-t border-emerald-100 p-4 dark:border-slate-800">
        <button type="button" onClick={() => { onStartTour?.(); onClose?.(); }}
          className="flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><HelpCircle className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">Need help?</span><span className="mt-0.5 block text-[11px] text-slate-500">Take a quick product tour</span></span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
        <p className="mt-3 text-center text-[10px] font-medium text-slate-400">Made for everyday dairy operations</p>
      </div>
    </aside>
  </>;
}
