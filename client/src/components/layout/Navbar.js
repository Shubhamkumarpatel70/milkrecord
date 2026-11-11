import React, { useState } from 'react';
import Logo from '../CustomLogo';

const viewLabels = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  records: 'Milk records',
  payments: 'Payments',
  analytics: 'Analytics',
  settings: 'Settings',
  admin: 'Admin'
};

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 6l12 12M18 6L6 18" />,
    bell: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 21h4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" strokeWidth="1.8" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.5 14.2A8.5 8.5 0 019.8 3.5 8.5 8.5 0 1020.5 14.2z" />,
    settings: <><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 00-1.76.36l-.06.06h-3.4l-.02-.08a1.7 1.7 0 00-1.2-1.2l-.08-.02-2.94 1.7-.06-.06a1.7 1.7 0 00-1.88-.34l-.08.02-1.7-2.94.06-.06A1.7 1.7 0 015.2 15l-.02-.08v-3.4l.08-.02a1.7 1.7 0 001.2-1.2l.02-.08-1.7-2.94.06-.06a1.7 1.7 0 00.34-1.88l-.02-.08 2.94-1.7.06.06a1.7 1.7 0 001.88.34l.08-.02h3.4l.02.08a1.7 1.7 0 001.2 1.2l.08.02 2.94-1.7.06.06a1.7 1.7 0 001.88.34l.08-.02 1.7 2.94-.06.06A1.7 1.7 0 0018.8 9l.02.08v3.4l-.08.02a1.7 1.7 0 00-1.2 1.2l-.02.08z" /></>,
    logout: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 17l5-5-5-5m5 5H3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6" /></>
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{paths[name]}</svg>;
}

export default function Navbar({
  currentView,
  onNavigate,
  user,
  userRole,
  isDarkMode,
  onToggleDarkMode,
  unreadNotifications = 0,
  onOpenNotifications,
  syncStatus = null,
  onOpenSettings,
  onLogout,
  onToggleSidebar
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = user?.name || user?.username || 'Account';
  const initials = displayName.trim().charAt(0).toUpperCase() || 'U';

  const openSettings = () => {
    setProfileOpen(false);
    if (onOpenSettings) onOpenSettings();
  };

  const logout = () => {
    setProfileOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Icon name="menu" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex min-w-0 items-center gap-2.5 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Milk Record home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-sm">
              <Logo className="h-6 w-6 text-white" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-base">Milk Record</span>
              <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 sm:block">DAIRY MANAGEMENT</span>
            </span>
          </button>
        </div>

        <div className="hidden min-w-0 flex-1 px-6 md:block">
          <div className="mx-auto max-w-xs truncate text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            {viewLabels[currentView] || 'Milk Record'}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span
            className="mr-1 flex h-8 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400"
            title={syncStatus === 'syncing' ? 'Syncing data' : syncStatus === 'offline' ? 'You are offline' : 'All changes synced'}
            aria-label={syncStatus === 'syncing' ? 'Syncing data' : syncStatus === 'offline' ? 'Offline' : 'Synced'}
          >
            <span className={`h-2 w-2 rounded-full ${syncStatus === 'syncing' ? 'animate-pulse bg-amber-500' : syncStatus === 'offline' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="hidden lg:inline">{syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'offline' ? 'Offline' : 'Synced'}</span>
          </span>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-300 dark:hover:bg-slate-800"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={isDarkMode ? 'sun' : 'moon'} />
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Notifications"
            aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : 'Notifications'}
          >
            <Icon name="bell" />
            {unreadNotifications > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500 dark:border-slate-950" />
            )}
          </button>

          {user && (
            <div className="relative ml-1 border-l border-slate-200 pl-2 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProfileOpen(open => !open)}
                className="flex h-10 items-center gap-2 rounded-xl px-1.5 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:hover:bg-slate-800 sm:px-2"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Open account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white">{initials}</span>
                <span className="hidden max-w-[112px] text-left sm:block">
                  <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{displayName}</span>
                  <span className="block text-[10px] capitalize text-slate-500 dark:text-slate-400">{userRole || 'User'}</span>
                </span>
                <svg className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
              </button>

              {profileOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close account menu" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
                      <p className="text-[11px] capitalize text-slate-500 dark:text-slate-400">{userRole || 'User'} account</p>
                    </div>
                    {onOpenSettings && (
                      <button type="button" onClick={openSettings} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                        <Icon name="settings" className="h-4 w-4" /> Settings
                      </button>
                    )}
                    {onLogout && (
                      <button type="button" onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30">
                        <Icon name="logout" className="h-4 w-4" /> Sign out
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
