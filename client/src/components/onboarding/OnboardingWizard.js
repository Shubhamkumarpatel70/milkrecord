import React, { useState } from 'react';
import { Store, DollarSign, QrCode, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    defaultRatePerKg: '50',
    upiId: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      if (onComplete) onComplete(formData);
      if (onClose) onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Step Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs">
              {step}/4
            </span>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Dairy Setup Wizard</h3>
              <p className="text-[11px] text-slate-500">Configure your business details</p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-sky-500'
                    : i < step
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Steps Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">Step 1: Dairy & Owner Details</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your dairy farm or milk collection center name.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dairy / Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Krishna Dairy Farm"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Patel"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">Step 2: Default Milk Rate</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set your standard milk rate per Kg or Liter. You can customize this per entry or customer anytime.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Rate (₹ / Kg)</label>
                <input
                  type="number"
                  name="defaultRatePerKg"
                  value={formData.defaultRatePerKg}
                  onChange={handleChange}
                  placeholder="50"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">Step 3: UPI Payment Setup</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your UPI ID (Google Pay / PhonePe / Paytm) so customers can scan QR codes to pay you directly.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">UPI ID (VPA)</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210@paytm"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Setup Ready!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Your Milk Record SaaS profile is configured. You can now add customers, record daily entries, and track payments!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-1.5 ml-auto"
          >
            <span>{step === 4 ? 'Complete Setup' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
