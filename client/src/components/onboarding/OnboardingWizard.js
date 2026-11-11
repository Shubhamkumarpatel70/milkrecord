import React, { useState } from 'react';
import { Store, Milk, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ businessName: '', defaultRatePerKg: '50', quantityUnit: 'kg', upiId: '' });
  if (!isOpen) return null;

  const handleNext = async () => {
    setError('');
    if (step === 1 && formData.businessName.trim().length < 2) return setError('Shop / brand name enter karein (minimum 2 characters).');
    if (step === 2) {
      const rate = Number(formData.defaultRatePerKg);
      if (!Number.isFinite(rate) || rate < 0) return setError('Valid milk rate enter karein.');
      setSaving(true);
      try {
        const saved = await onComplete?.({ ...formData, businessName: formData.businessName.trim(), defaultRatePerKg: rate });
        if (saved === false) return;
        if (onClose) onClose();
      } catch (err) {
        setError(err.message || 'Setup save nahi hua. Dobara try karein.');
      } finally { setSaving(false); }
      return;
    }
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest text-sky-700">Welcome to Milk Record</span><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">Step {step} of 2</span></div>
          <div className="mt-4 flex gap-2">{[1,2].map(i=><div key={i} className={'h-1.5 flex-1 rounded-full '+(i<=step?'bg-sky-600':'bg-slate-200')}/>)}</div>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          {step===1 ? <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Store className="h-7 w-7"/></div>
            <div><h2 className="text-2xl font-bold text-slate-900">Enter your shop / brand name</h2><p className="mt-2 text-sm text-slate-500">Yahi naam aapke dairy workspace aur business profile mein show hoga.</p></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Shop / Brand Name</label><input autoFocus required minLength="2" maxLength="100" value={formData.businessName} onChange={e=>setFormData({...formData,businessName:e.target.value})} placeholder="e.g. Shree Krishna Dairy" className="input-field min-h-12"/></div>
          </> : <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Milk className="h-7 w-7"/></div>
            <div><h2 className="text-2xl font-bold text-slate-900">Set your milk rate</h2><p className="mt-2 text-sm text-slate-500">Aapka set kiya hua rate aapke dairy account ki har new milk entry mein auto calculate hoga.</p></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity Type</label><div className="grid grid-cols-2 gap-3">{[{value:'kg',label:'Kilogram (Kg)'},{value:'liter',label:'Liter (L)'}].map(x=><button key={x.value} type="button" onClick={()=>setFormData({...formData,quantityUnit:x.value})} className={'min-h-12 rounded-xl border px-3 font-semibold '+(formData.quantityUnit===x.value?'border-sky-500 bg-sky-50 text-sky-700':'border-slate-200 text-slate-600')}>{x.label}</button>)}</div></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Default Milk Rate (₹ / {formData.quantityUnit==='kg'?'Kg':'Liter'})</label><input autoFocus type="number" min="0" max="100000" step="0.01" required value={formData.defaultRatePerKg} onChange={e=>setFormData({...formData,defaultRatePerKg:e.target.value})} className="input-field min-h-12" placeholder="50.00"/></div>
            <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-semibold text-emerald-700">Preview</p><p className="mt-1 text-lg font-bold text-emerald-900">2 {formData.quantityUnit==='kg'?'Kg':'Liter'} × ₹{(Number(formData.defaultRatePerKg)||0).toFixed(2)} = ₹{(2*(Number(formData.defaultRatePerKg)||0)).toFixed(2)}</p></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">UPI ID <span className="font-normal text-slate-400">(optional)</span></label><input value={formData.upiId} onChange={e=>setFormData({...formData,upiId:e.target.value})} placeholder="yourname@upi" className="input-field min-h-11"/></div>
          </>}
          {error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
          {step===2?<button type="button" disabled={saving} onClick={()=>{setError('');setStep(1);}} className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/>Back</button>:<span/>}
          <button type="button" disabled={saving} onClick={handleNext} className="btn-primary flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold disabled:opacity-60">{saving?'Saving…':step===1?'Next':'Complete Setup'}{step===2?<CheckCircle2 className="h-4 w-4"/>:<ArrowRight className="h-4 w-4"/>}</button>
        </div>
      </div>
    </div>
  );
}
