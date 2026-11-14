import React, { useState } from 'react';
import Logo from '../CustomLogo';
import { Bell, Menu, Settings, LogOut, ChevronDown, Milk, Sparkles } from 'lucide-react';

const viewLabels = {
  dashboard: 'Dashboard', customers: 'Customers', records: 'Milk records',
  payments: 'Payments', analytics: 'Reports & analytics', settings: 'Settings', admin: 'Admin'
};

export default function Navbar({
  currentView, onNavigate, user, userRole, onOpenNotifications,
  syncStatus = null, onOpenSettings, onLogout, onToggleSidebar
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = user?.name || user?.username || 'Account';
  const initials = displayName.trim().charAt(0).toUpperCase() || 'U';
  const openSettings = () => { setProfileOpen(false); onOpenSettings?.(); };
  const logout = () => { setProfileOpen(false); onLogout?.(); };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100 bg-white/95 shadow-sm shadow-emerald-950/[0.03] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onToggleSidebar} aria-label="Open navigation menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => onNavigate('dashboard')} aria-label="Milk Record home"
            className="flex min-w-0 items-center gap-2.5 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-700/20">
              <Logo className="h-6 w-6 text-white" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-base">Milk Record</span>
              <span className="hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400 sm:flex"><Sparkles className="h-3 w-3" /> Dairy management</span>
            </span>
          </button>
        </div>

        <div className="hidden min-w-0 flex-1 px-6 md:block">
          <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-full bg-emerald-50/80 px-4 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Milk className="h-4 w-4" /> <span className="truncate">{viewLabels[currentView] || 'Milk Record'}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {syncStatus && <span className="mr-1 flex h-8 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400"
            title={syncStatus === 'syncing' ? 'Syncing data' : syncStatus === 'offline' ? 'You are offline' : 'All changes synced'}>
            <span className={`h-2 w-2 rounded-full ${syncStatus === 'syncing' ? 'animate-pulse bg-amber-500' : syncStatus === 'offline' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="hidden lg:inline">{syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'offline' ? 'Offline' : 'Synced'}</span>
          </span>}
          <button type="button" onClick={onOpenNotifications} aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300">
            <Bell className="h-5 w-5" />
          </button>
          {user && <div className="relative ml-1 border-l border-slate-200 pl-2 dark:border-slate-800">
            <button type="button" onClick={() => setProfileOpen(open => !open)} aria-haspopup="menu" aria-expanded={profileOpen}
              className="flex h-10 items-center gap-2 rounded-xl px-1.5 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:hover:bg-emerald-950/40 sm:px-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-sm font-extrabold text-white">{initials}</span>
              <span className="hidden max-w-[112px] text-left sm:block"><span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{displayName}</span><span className="block text-[10px] capitalize text-slate-500 dark:text-slate-400">{userRole || 'User'}</span></span>
              <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && <>
              <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close account menu" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-800"><p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{displayName}</p><p className="text-[11px] capitalize text-slate-500 dark:text-slate-400">{userRole || 'User'} account</p></div>
                {onOpenSettings && <button type="button" onClick={openSettings} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-emerald-950/40"><Settings className="h-4 w-4 text-emerald-600" /> Settings</button>}
                {onLogout && <button type="button" onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"><LogOut className="h-4 w-4" /> Sign out</button>}
              </div>
            </>}
          </div>}
        </div>
      </div>
    </header>
  );
}
