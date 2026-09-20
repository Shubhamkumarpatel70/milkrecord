import React, { useState } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, CreditCard, RefreshCw } from 'lucide-react';

export default function NotificationCenter({ isOpen, onClose, notifications = [], onClearAll, onMarkAsRead }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const sampleNotifications = notifications.length > 0 ? notifications : [
    {
      id: '1',
      title: 'Pending Payment Reminder',
      message: 'Ramesh Kumar has ₹1,200 pending for January milk delivery.',
      type: 'payment',
      time: '10 mins ago',
      read: false
    },
    {
      id: '2',
      title: 'Daily Milk Collection Update',
      message: 'Today\'s total milk collection reached 84.5 Kg across 14 customers.',
      type: 'collection',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      title: 'Sync Completed',
      message: 'All local milk records synced successfully with cloud server.',
      type: 'sync',
      time: '2 hours ago',
      read: true
    },
    {
      id: '4',
      title: 'System Update v2.4',
      message: 'New digital UPI payment receipts and thermal printer support enabled.',
      type: 'system',
      time: 'Yesterday',
      read: true
    }
  ];

  const filteredNotifications = sampleNotifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'payment') return n.type === 'payment';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Notification Center</h3>
                <p className="text-xs text-slate-500">Stay updated on payments & records</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-4 pt-3 pb-2 gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
            {['all', 'unread', 'payment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="ml-auto text-xs text-slate-500 hover:text-red-500 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications in this tab</p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onMarkAsRead && onMarkAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    item.read
                      ? 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-75'
                      : 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.type === 'payment' && (
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === 'collection' && (
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === 'sync' && (
                        <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === 'system' && (
                        <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
            <span className="text-[11px] text-slate-400">Notifications auto-expire after 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
