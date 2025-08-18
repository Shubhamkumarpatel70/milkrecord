import React, { useState, useEffect } from 'react';

// LocalStorage helper keys
const DISMISS_UNTIL_KEY = 'pwaInstallDismissedUntil';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const dismissedUntil = parseInt(localStorage.getItem(DISMISS_UNTIL_KEY) || '0', 10);
    const snoozed = now < dismissedUntil;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isInstalledIos = typeof window.navigator.standalone !== 'undefined' && window.navigator.standalone;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowFab(true);
      if (!snoozed) setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setShowFab(false);
      setDeferredPrompt(null);
    };

    // iOS Safari doesn't support beforeinstallprompt
    if (!isStandalone && !isInstalledIos && isIos && isSafari && !snoozed) {
      setShowIosGuide(true);
      setShowFab(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback: if beforeinstallprompt never fires (desktop Chrome sometimes after first navigation),
    // show FAB after a short delay when app is not installed and user hasn't snoozed.
    const fallbackTimer = setTimeout(() => {
      const stillNotInstalled = !(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) && !isInstalledIos;
      if (stillNotInstalled && !snoozed) {
        setShowFab(true);
        // Don't force modal open on desktop; leave to user tap
      }
    }, 3000);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const requestInstall = async () => {
    if (!deferredPrompt) {
      // For iOS/Safari show guide modal
      setShowIosGuide(true);
      setShowInstallPrompt(true);
      return;
    }
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome !== 'accepted') {
        // user dismissed, keep FAB visible
      }
    } finally {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = (snoozeMs = ONE_WEEK_MS) => {
    const until = Date.now() + snoozeMs;
    localStorage.setItem(DISMISS_UNTIL_KEY, String(until));
    setShowInstallPrompt(false);
    // Keep FAB if install still possible
    setShowFab(!!deferredPrompt || showIosGuide);
  };

  // Floating Install Button (persistent)
  const FabButton = () => (
    !showFab ? null : (
      <button
        onClick={() => { setShowInstallPrompt(true); }}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
        aria-label="Install App"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-3-3m3 3l3-3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"/></svg>
        <span className="hidden sm:inline">Install App</span>
      </button>
    )
  );

  // Modal Popup
  const Modal = () => (
    !showInstallPrompt ? null : (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => handleDismiss(24*60*60*1000)}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] max-w-md p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-3-3m3 3l3-3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Install Milk Record</h3>
              <p className="text-sm text-gray-600 mt-1">Add this app to your device for faster access and a full-screen experience.</p>
            </div>
          </div>

          {showIosGuide && !deferredPrompt && (
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
              On iPhone/iPad: tap the Share button in Safari and choose <span className="font-semibold">Add to Home Screen</span>.
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => handleDismiss()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Later
            </button>
            <button
              onClick={requestInstall}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      <FabButton />
      <Modal />
    </>
  );
}

export default InstallPrompt;