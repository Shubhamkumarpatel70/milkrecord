import React, { useState } from 'react';
import { WifiOff, RefreshCw, Download, AlertCircle, X } from 'lucide-react';

export default function SyncStatusBanner({
  syncQueue = [],
  isSyncing = false,
  isOffline = false,
  updateAvailable = false,
  installPromptEvent = null,
  onInstallApp,
  onDismissUpdate
}) {
  const [dismissedInstall, setDismissedInstall] = useState(false);

  if (isOffline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>You are currently offline. Changes will be saved locally and auto-synced when back online.</span>
        </div>
      </div>
    );
  }

  if (isSyncing && syncQueue.length > 0) {
    const currentItem = syncQueue[0] || 'Records';
    return (
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
          <span>Syncing with Cloud: Uploading {currentItem}... ({syncQueue.length} remaining)</span>
        </div>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <AlertCircle className="w-4 h-4" />
          <span>A new version of Milk Record SaaS is available.</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-3 px-2 py-0.5 rounded bg-white text-emerald-800 font-bold hover:bg-emerald-100 transition-colors"
          >
            Refresh Now
          </button>
        </div>
        {onDismissUpdate && (
          <button onClick={onDismissUpdate} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (installPromptEvent && !dismissedInstall) {
    return (
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 animate-pulse" />
          <span>Install Milk Record SaaS App on your phone or desktop for fast offline access.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onInstallApp}
            className="px-3 py-1 bg-white text-sky-700 rounded-lg font-bold hover:bg-sky-50 transition-colors shadow-xs"
          >
            Install App
          </button>
          <button
            onClick={() => setDismissedInstall(true)}
            className="p-1 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
