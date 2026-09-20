import React, { useState } from 'react';
import { CreditCard, QrCode, Printer, Send } from 'lucide-react';

export default function PaymentsPage({
  totalReceive = 0,
  totalPending = 0,
  customers = [],
  onOpenPaymentQR,
  onMarkPayment,
  upiId = ''
}) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const formatCurrency = (val) => `₹ ${val || 0}`;

  const handlePrintReceipt = (cust) => {
    setSelectedReceipt(cust);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleSendReminder = (cust) => {
    const remaining = Math.max(0, (cust.totalAmount || 0) - (cust.paidAmount || 0));
    const phone = cust.whatsapp || '';
    const text = encodeURIComponent(`Hello ${cust.name}, this is a friendly reminder regarding your pending milk record balance of ₹${remaining}. Kindly settle your payment via UPI QR or cash. Thank you!`);
    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-8 w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">Payment Settlements & UPI QR</h1>
            <p className="text-xs text-slate-500">Track paid amounts, customer dues, UPI QR collections, and print digital receipts.</p>
          </div>
        </div>

        <button
          onClick={onOpenPaymentQR}
          className="btn-primary text-xs py-2.5 px-4 sm:px-5 flex items-center justify-center gap-2 shadow-md min-h-[44px] w-full sm:w-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Generate UPI Payment QR</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Paid Received</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalReceive)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Successfully settled across accounts</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Outstanding Dues</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalPending)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Pending collection from customers</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">UPI Receiver VPA</span>
          <div className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 font-mono truncate">
            {upiId || 'Not Configured'}
          </div>
          <span className="text-[11px] text-sky-600 font-semibold mt-1 block">Default UPI ID for QR scans</span>
        </div>

      </div>

      {/* Customer Settlement Content */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Customer Payment Dues</h3>
          <span className="text-xs text-slate-400">{customers.length} Customers</span>
        </div>

        {/* Mobile View (< 640px) */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
          {customers.map((c, i) => {
            const total = c.totalAmount || 0;
            const paid = c.paidAmount || 0;
            const remaining = Math.max(0, total - paid);
            const isPaid = c.status === 'paid' || remaining === 0;

            return (
              <div key={c._id || i} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{c.name}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {isPaid ? 'Fully Paid ✓' : 'Pending Dues'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{total}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Paid</span>
                    <span className="font-bold text-emerald-600">₹{paid}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Due</span>
                    <span className={`font-bold ${remaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{remaining}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onMarkPayment && onMarkPayment(c)}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1 min-h-[38px]"
                  >
                    Settle Payment
                  </button>
                  <button
                    onClick={() => handleSendReminder(c)}
                    className="p-2 rounded-xl bg-emerald-100 text-emerald-700 min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Send WhatsApp Reminder"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handlePrintReceipt(c)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Print Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Remaining Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {customers.map((c, i) => {
                const total = c.totalAmount || 0;
                const paid = c.paidAmount || 0;
                const remaining = Math.max(0, total - paid);
                const isPaid = c.status === 'paid' || remaining === 0;

                return (
                  <tr key={c._id || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">₹{total}</td>
                    <td className="p-4 font-bold text-emerald-600">₹{paid}</td>
                    <td className={`p-4 font-bold ${remaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      ₹{remaining}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isPaid ? 'Fully Paid ✓' : 'Partial / Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onMarkPayment && onMarkPayment(c)}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold"
                      >
                        Settle Payment
                      </button>
                      <button
                        onClick={() => handleSendReminder(c)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors inline-block"
                        title="Send WhatsApp Reminder"
                      >
                        <Send className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors inline-block"
                        title="Print Digital Receipt"
                      >
                        <Printer className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Hidden Template */}
      {selectedReceipt && (
        <div className="hidden print:block p-8 font-sans text-black">
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold uppercase">Milk Record Dairy Receipt</h1>
            <p className="text-sm text-gray-600">Powered by ASKC TECHNOLOGIES</p>
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div><strong>Customer Name:</strong> {selectedReceipt.name}</div>
            <div><strong>Month:</strong> {selectedReceipt.month || 'Current Month'}</div>
            <div><strong>Total Amount:</strong> ₹{selectedReceipt.totalAmount}</div>
            <div><strong>Paid Amount:</strong> ₹{selectedReceipt.paidAmount || 0}</div>
            <div><strong>Remaining Dues:</strong> ₹{Math.max(0, (selectedReceipt.totalAmount || 0) - (selectedReceipt.paidAmount || 0))}</div>
            <div><strong>Payment Date:</strong> {new Date().toLocaleDateString()}</div>
          </div>

          <div className="border-t pt-4 text-center text-xs text-gray-500">
            Thank you for your business! © {new Date().getFullYear()} Milk Record
          </div>
        </div>
      )}

    </div>
  );
}
