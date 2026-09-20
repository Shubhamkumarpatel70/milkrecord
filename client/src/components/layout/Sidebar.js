import React from 'react';
import {
  LayoutDashboard,
  Users,
  Milk,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  onStartTour
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'customers', label: 'Customers', icon: Users, badge: null },
    { id: 'records', label: 'Milk Records', icon: Milk, badge: null },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: 'UPI' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, badge: 'New' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (currentView === 'home' && item.id === 'dashboard');

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 group-hover:scale-110'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Guided Tour Banner / Help Box */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 via-emerald-50 to-sky-50 dark:from-sky-950/30 dark:via-emerald-950/20 dark:to-slate-800 border border-sky-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>SaaS Assistant</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5 leading-relaxed">
              Need help managing records or payment setup? Take the interactive tour.
            </p>
            <button
              onClick={() => {
                if (onStartTour) onStartTour();
                if (onClose) onClose();
              }}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Start Guided Tour</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
