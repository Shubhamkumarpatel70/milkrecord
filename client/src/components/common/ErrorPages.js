import React from 'react';
import { ShieldAlert, AlertOctagon, FileQuestion, ServerCrash, Wrench, WifiOff, RefreshCw, Home } from 'lucide-react';

export default function ErrorPages({ code = '404', onRetry, onGoHome }) {
  const errorMap = {
    '401': {
      icon: ShieldAlert,
      color: 'from-amber-500 to-orange-600',
      title: '401 - Session Expired',
      description: 'Your login session has expired or you are unauthorized to view this page. Please sign in again.'
    },
    '403': {
      icon: AlertOctagon,
      color: 'from-red-500 to-rose-600',
      title: '403 - Access Forbidden',
      description: 'You do not have administrative permission to access this resource or manage system settings.'
    },
    '404': {
      icon: FileQuestion,
      color: 'from-sky-500 to-indigo-600',
      title: '404 - Page Not Found',
      description: 'The milk record page or customer record you are looking for does not exist or has been moved.'
    },
    '500': {
      icon: ServerCrash,
      color: 'from-purple-500 to-indigo-600',
      title: '500 - Server Error',
      description: 'Something went wrong on our backend servers. Please refresh or try again in a few moments.'
    },
    '503': {
      icon: Wrench,
      color: 'from-teal-500 to-emerald-600',
      title: '503 - Under Scheduled Maintenance',
      description: 'Milk Record SaaS is undergoing routine cloud database optimization. We will be back online shortly.'
    },
    'offline': {
      icon: WifiOff,
      color: 'from-amber-500 to-red-600',
      title: 'Offline Mode Active',
      description: 'No internet connection detected. Your local edits are safely queued and will sync automatically when reconnected.'
    },
    'sync_failed': {
      icon: RefreshCw,
      color: 'from-rose-500 to-red-700',
      title: 'Cloud Synchronization Failed',
      description: 'We encountered an error uploading your local milk records to the backend database.'
    }
  };

  const err = errorMap[code] || errorMap['404'];
  const Icon = err.icon;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        
        <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr ${err.color} text-white flex items-center justify-center shadow-lg`}>
          <Icon className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {err.title}
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {err.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full sm:w-auto btn-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
