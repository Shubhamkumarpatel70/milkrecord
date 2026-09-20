import React, { useState } from 'react';
import { HelpCircle, ArrowRight, X, CheckCircle } from 'lucide-react';

export default function GuidedTour({ isOpen, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to Milk Record SaaS!',
      description: 'Let us show you around key features so you can manage your dairy collection efficiently.',
      target: 'dashboard'
    },
    {
      title: 'Customer Directory',
      description: 'Add and organize all your dairy customers. View customer phone numbers, balances, and timelines.',
      target: 'customers'
    },
    {
      title: 'Daily Milk Entries',
      description: 'Record morning and evening milk quantities (Kg). View entries in calendar or table layout with paid/unpaid status.',
      target: 'records'
    },
    {
      title: 'Payments & UPI QR',
      description: 'Generate instant payment QR codes for full or custom partial payments. Print digital settlement receipts.',
      target: 'payments'
    },
    {
      title: 'Analytics & Reports',
      description: 'View interactive monthly collection graphs, revenue trends, and export formatted reports to Excel or PDF.',
      target: 'analytics'
    },
    {
      title: 'Settings & Thermal Printer',
      description: 'Configure business info, dark/light theme, Hindi/English language, and thermal receipt printer settings.',
      target: 'settings'
    }
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      if (onNavigate && tourSteps[nextIndex].target) {
        onNavigate(tourSteps[nextIndex].target);
      }
    } else {
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step counter */}
        <div className="flex items-center gap-2 mb-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Step {currentStep + 1} of {tourSteps.length}</span>
        </div>

        <h4 className="text-base font-bold text-white mb-1.5">{step.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            {currentStep === tourSteps.length - 1 ? <CheckCircle className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </div>
  );
}
