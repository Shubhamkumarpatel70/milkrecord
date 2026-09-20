import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Printer, Database, User, Shield, ExternalLink, Save, CheckCircle2, QrCode } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function SettingsPage({
  isDarkMode,
  onToggleDarkMode,
  upiId = '',
  onSaveUpiId
}) {
  const { language, setLanguage, defaultMilkRate, setDefaultMilkRate } = useSettings();
  const [businessName, setBusinessName] = useState('Milk Record Dairy');
  const [currentUpiId, setCurrentUpiId] = useState(upiId);
  const [paperSize, setPaperSize] = useState('58mm'); // '58mm' | '80mm' | 'A4'
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (onSaveUpiId) {
      onSaveUpiId(currentUpiId);
    }
    setSavedMsg('Settings saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-8 max-w-4xl mx-auto w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">SaaS Settings & Configuration</h1>
            <p className="text-xs text-slate-500">Manage business preferences, theme mode, printer layout, and database backup.</p>
          </div>
        </div>

        {savedMsg && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4 sm:space-y-6">
        
        {/* Business & Profile */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500" />
            <span>Business Profile & Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dairy / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="input-field min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Milk Rate (₹ / Kg)</label>
              <input
                type="number"
                value={defaultMilkRate}
                onChange={e => setDefaultMilkRate(e.target.value)}
                className="input-field min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* UPI Payment Gateway Configuration */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-500" />
            <span>Digital UPI QR Configuration</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Receiver UPI ID / VPA</label>
            <input
              type="text"
              placeholder="e.g. yourname@upi or mobile@paytm"
              value={currentUpiId}
              onChange={e => setCurrentUpiId(e.target.value)}
              className="input-field font-mono min-h-[44px]"
            />
            <p className="text-[11px] text-slate-400 mt-1">This UPI VPA will be encoded in QR codes generated for instant customer payment scans.</p>
          </div>
        </div>

        {/* Appearance & Language */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <span>Theme & App Language</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Theme Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">App Theme</label>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-100 min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-600" />}
                  <span>{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</span>
                </div>
                <span className="text-[10px] text-sky-500 underline font-bold">Toggle Mode</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="input-field text-xs min-h-[44px]"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Printer Settings */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-500" />
            <span>Thermal & Standard Printer Layout</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Paper Width</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: '58mm', label: '58mm Thermal' },
                { id: '80mm', label: '80mm Thermal' },
                { id: 'A4', label: 'Standard A4' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaperSize(p.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold text-center transition-all min-h-[44px] ${
                    paperSize === p.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Backup & Support */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-500" />
            <span>Data Protection & Support</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Cloud & Local Backup</h4>
              <p className="text-[11px] text-slate-500">Your milk records auto-sync with MongoDB Atlas servers.</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Local database backup file downloaded.')}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 min-h-[38px] w-full sm:w-auto justify-center"
            >
              <Database className="w-4 h-4" />
              <span>Download Backup</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 sm:p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Technology Partner Support</span>
              <span className="text-slate-500">Contact ASKC TECHNOLOGIES for custom enterprise integrations.</span>
            </div>
            <a
              href="https://askctechnologies.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:underline font-bold flex items-center gap-1 shrink-0"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary text-xs py-3 px-6 flex items-center justify-center gap-2 shadow-md min-h-[44px] w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
