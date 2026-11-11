import React, { useEffect, useState } from 'react';
import { Settings, Store, Milk, QrCode, ExternalLink, Save, Check, CircleHelp, MessageCircle, BookOpen, ShieldCheck } from 'lucide-react';

export default function SettingsPage({ businessProfile = {}, upiId = '', onSaveConfiguration }) {
  const [shopName, setShopName] = useState(businessProfile.shopName || '');
  const [milkRate, setMilkRate] = useState(String(businessProfile.milkRate ?? 50));
  const [quantityUnit, setQuantityUnit] = useState(businessProfile.quantityUnit || 'kg');
  const [currentUpiId, setCurrentUpiId] = useState(upiId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setShopName(businessProfile.shopName || '');
    setMilkRate(String(businessProfile.milkRate ?? 50));
    setQuantityUnit(businessProfile.quantityUnit || 'kg');
    setCurrentUpiId(upiId || '');
  }, [businessProfile.shopName, businessProfile.milkRate, businessProfile.quantityUnit, upiId]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    const rate = Number(milkRate);
    if (shopName.trim().length < 2) return setError('Shop/brand name kam se kam 2 characters ka hona chahiye.');
    if (!Number.isFinite(rate) || rate < 0) return setError('Valid milk rate enter karein.');
    setSaving(true);
    try {
      await onSaveConfiguration({ shopName: shopName.trim(), milkRate: rate, quantityUnit, upiId: currentUpiId.trim() });
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Configuration save nahi hui. Dobara try karein.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 pb-10 animate-fade-in">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-50 p-3 text-sky-700"><Settings className="h-6 w-6"/></div>
          <div><p className="text-xs font-bold uppercase tracking-widest text-sky-700">Workspace preferences</p><h1 className="text-2xl font-bold text-slate-900">Dairy Settings</h1><p className="mt-1 text-sm text-slate-500">Apne dairy business ka naam, milk rate aur quantity unit manage karein.</p></div>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2"><Store className="h-5 w-5 text-sky-600"/><h2 className="font-bold text-slate-900">Business profile</h2></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Shop / Brand Name</label><input required minLength="2" maxLength="100" value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="e.g. Shree Krishna Dairy" className="input-field min-h-12"/></div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2"><Milk className="h-5 w-5 text-emerald-600"/><h2 className="font-bold text-slate-900">Milk rate & quantity</h2></div>
          <p className="text-sm text-slate-500">Yeh default rate sirf aapke dairy account par apply hoga. Har supplier apna alag rate aur unit set kar sakta hai.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Default Milk Rate (₹ / {quantityUnit === 'kg' ? 'Kg' : 'Liter'})</label><div className="relative"><span className="absolute left-3 top-3 text-slate-500">₹</span><input type="number" min="0" max="100000" step="0.01" required value={milkRate} onChange={e=>setMilkRate(e.target.value)} className="input-field min-h-12 pl-8" placeholder="50.00"/></div></div>
            <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity Type</label><div className="grid grid-cols-2 gap-2">{[{value:'kg',label:'Kilogram (Kg)'},{value:'liter',label:'Liter (L)' }].map(option=><button key={option.value} type="button" onClick={()=>setQuantityUnit(option.value)} className={'min-h-12 rounded-xl border px-3 text-sm font-semibold '+(quantityUnit===option.value?'border-sky-500 bg-sky-50 text-sky-700':'border-slate-200 bg-white text-slate-600')}>{option.label}</button>)}</div></div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Example calculation</p><p className="mt-1 text-lg font-bold text-emerald-900">2 {quantityUnit === 'kg' ? 'Kg' : 'Liter'} × ₹{(Number(milkRate)||0).toFixed(2)} = ₹{((Number(milkRate)||0)*2).toFixed(2)}</p></div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2"><QrCode className="h-5 w-5 text-amber-600"/><h2 className="font-bold text-slate-900">UPI payment details <span className="font-normal text-slate-400">(optional)</span></h2></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">UPI ID / VPA</label><input value={currentUpiId} onChange={e=>setCurrentUpiId(e.target.value)} maxLength={100} placeholder="yourname@upi" className="input-field min-h-12"/><p className="mt-1 text-xs text-slate-500">Customer payment QR banane ke liye use hoga.</p></div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2"><CircleHelp className="h-5 w-5 text-indigo-600"/><h2 className="font-bold text-slate-900">Need help?</h2></div>
          <p className="mt-2 text-sm text-slate-500">Milk Record use karne mein help chahiye? Product tour dekhein ya ASKC Technologies support se contact karein.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href="https://askctechnologies.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 hover:border-sky-300 hover:bg-sky-50"><BookOpen className="h-5 w-5 text-sky-600"/><span><strong className="block text-sm text-slate-800">Help & product info</strong><small className="text-xs text-slate-500">Guides and product updates</small></span><ExternalLink className="ml-auto h-4 w-4 text-slate-400"/></a>
            <a href="https://wa.me/?text=Hello%20ASKC%20Technologies%2C%20I%20need%20help%20with%20Milk%20Record." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 hover:border-emerald-300 hover:bg-emerald-50"><MessageCircle className="h-5 w-5 text-emerald-600"/><span><strong className="block text-sm text-slate-800">Contact support</strong><small className="text-xs text-slate-500">Open WhatsApp support message</small></span><ExternalLink className="ml-auto h-4 w-4 text-slate-400"/></a>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 shrink-0"/>Your business configuration is saved to your signed-in dairy account.</p>
        </section>

        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold shadow-md disabled:opacity-60 sm:w-auto"><Save className="h-4 w-4"/>{saving?'Saving configuration…':'Save All Configuration'}</button>
      </form>

      {showSuccess && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="save-success-title"><div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl animate-fade-in"><div className="success-check mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-10 w-10 success-check-icon"/></div><h2 id="save-success-title" className="text-xl font-bold text-slate-900">Configuration Saved!</h2><p className="mt-2 text-sm text-slate-500">Aapki dairy settings successfully update ho gayi hain.</p><button type="button" onClick={()=>setShowSuccess(false)} className="btn-primary mt-6 min-h-11 w-full">Done</button></div></div>}
    </div>
  );
}
