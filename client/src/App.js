import React, { useState } from "react";
import axios from "axios";
import AdminDashboard from './components/AdminDashboard';
import InstallPrompt from './components/InstallPrompt';
import Logo from './components/CustomLogo';
import Settings from './components/Settings';
import SettingsButton from './components/SettingsButton';
import WelcomeSplash from './components/WelcomeSplash';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { translations } from './translations/translations';

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper to build a calendar grid for the month
function renderCalendar(days) {
  if (!days || days.length === 0) return null;
  const firstDay = new Date(days[0].date);
  const startDay = firstDay.getDay(); // 0=Sun, 1=Mon...
  const weeks = [];
  let week = Array(startDay).fill(null);
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length > 0) weeks.push(week);
  return (
    <table className="w-full mb-4 text-center">
      <thead>
        <tr className="bg-blue-100">
          <th className="py-1">Sun</th>
          <th className="py-1">Mon</th>
          <th className="py-1">Tue</th>
          <th className="py-1">Wed</th>
          <th className="py-1">Thu</th>
          <th className="py-1">Fri</th>
          <th className="py-1">Sat</th>
        </tr>
      </thead>
      <tbody>
        {weeks.map((w, i) => (
          <tr key={i}>
            {w.map((d, j) => d ? (
              <td key={j} className={
                'p-1 rounded-lg ' +
                (d.record ? 
                  (d.record.status === 'paid' ? 'bg-green-200 text-green-800 font-semibold' : 'bg-yellow-200 text-yellow-800 font-semibold') 
                  : 'bg-red-100 text-red-700')
              }>
                <div className="text-xs font-bold">{d.date.slice(-2)}</div>
                <div className="text-xs">{d.record ? `${d.record.quantityKg || 0}kg` : '-'}</div>
                <div className="text-xs">{d.record ? `₹${d.record.amount}` : '-'}</div>
                {d.record && (
                  <div className="text-xs font-bold">
                    {d.record.status === 'paid' ? '✓' : '○'}
                  </div>
                )}
              </td>
            ) : <td key={j}></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomersPage({ authData }) {
  // Add CSS animations for notifications
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [summaries, setSummaries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [viewDetails, setViewDetails] = React.useState(null); // { userId, month, name }
  const [details, setDetails] = React.useState(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(null);
  const [paymentModal, setPaymentModal] = React.useState({ open: false, record: null });
  const [paymentType, setPaymentType] = React.useState('total');
  const [customAmount, setCustomAmount] = React.useState('');
  const [totalReceive, setTotalReceive] = React.useState(0);
  const [totalPending, setTotalPending] = React.useState(0);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  // Check authentication on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // If authData is provided from parent window, use it
        if (authData && authData.userId) {
          localStorage.setItem('userId', authData.userId);
          localStorage.setItem('userRole', authData.userRole);
          localStorage.setItem('userName', authData.userName);
          setIsAuthenticated(true);
        } else {
          // Check localStorage for existing auth
          const userId = localStorage.getItem('userId');
          const userRole = localStorage.getItem('userRole');
          
          if (userId && userRole) {
            // Verify the user is still valid by making a simple API call
            try {
              await axios.get(`/api/milk-records/total?userId=${userId}`);
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Auth verification failed:', error);
              // Clear invalid auth data
              localStorage.removeItem('userId');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userName');
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [authData]);

  React.useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      const userId = localStorage.getItem('userId');
      axios.get(`/api/milk-records?userId=${userId}`).then(res => {
        setSummaries(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isAuthenticated, isCheckingAuth]);

  const handleView = async (userId, month, name) => {
    setViewDetails({ userId, month, name });
    setSelectedMonth(month);
    fetchDetails(userId, month, name);
  };

  const fetchDetails = async (userId, month, customerName = null) => {
    setLoadingDetails(true);
    setDetails(null);
    try {
      console.log('Fetching details for userId:', userId, 'month:', month, 'customer:', customerName);
      const url = customerName 
        ? `/api/milk-records/details?userId=${userId}&month=${month}&customerName=${encodeURIComponent(customerName)}`
        : `/api/milk-records/details?userId=${userId}&month=${month}`;
      const res = await axios.get(url);
      console.log('Details response:', res.data);
      setDetails(res.data);
    } catch (error) {
      console.error('Error fetching details:', error);
      setDetails(null);
    }
    setLoadingDetails(false);
  };

  const closeModal = () => {
    setViewDetails(null);
    setDetails(null);
    setSelectedMonth(null);
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (viewDetails) fetchDetails(viewDetails.userId, newMonth, viewDetails.name);
  };

  // Helper to format month as 'Month YYYY'
  function formatMonth(ym) {
    const [year, month] = ym.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }



  // Share customer functionality
  const handleShareCustomer = async (customerId) => {
    const shareUrl = `${window.location.protocol}//${window.location.hostname}:3000/customer/${customerId}`;
    
    // Create a share modal instead of relying on clipboard
    const shareModal = document.createElement('div');
    shareModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    shareModal.innerHTML = `
        <div style="
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #1F2937; font-size: 18px; font-weight: 600;">Share Customer Records</h3>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6B7280;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
            
            <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                Share this link with your customer so they can view their milk records and payment status.
            </p>
            
            <div style="
                background: #F3F4F6;
                border: 1px solid #D1D5DB;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                font-family: monospace;
                font-size: 14px;
                word-break: break-all;
                color: #374151;
            ">${shareUrl}</div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="
                    navigator.clipboard.writeText('${shareUrl}').then(() => {
                        this.textContent = 'Copied!';
                        this.style.background = '#10B981';
                        setTimeout(() => {
                            this.textContent = 'Copy Link';
                            this.style.background = '#3B82F6';
                        }, 2000);
                    }).catch(() => {
                        this.textContent = 'Failed';
                        this.style.background = '#EF4444';
                        setTimeout(() => {
                            this.textContent = 'Copy Link';
                            this.style.background = '#3B82F6';
                        }, 2000);
                    });
                " style="
                    background: #3B82F6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.2s;
                ">Copy Link</button>
                
                <button onclick="
                    window.open('https://wa.me/?text=Hi! You can view your milk records here: ${encodeURIComponent(shareUrl)}', '_blank');
                " style="
                    background: #25D366;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Share on WhatsApp
                </button>
                
                <button onclick="
                    window.open('mailto:?subject=Milk Records&body=Hi! You can view your milk records here: ${encodeURIComponent(shareUrl)}', '_blank');
                " style="
                    background: #EA4335;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Share via Email
                </button>
            </div>
            
            <div style="
                background: #FEF3C7;
                border: 1px solid #F59E0B;
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
            ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <svg width="16" height="16" fill="#F59E0B" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span style="font-weight: 600; color: #92400E; font-size: 14px;">Important</span>
                </div>
                <p style="margin: 0; color: #92400E; font-size: 12px;">
                    Customers will need to enter their WhatsApp number as the password to access their records.
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.remove();
        }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 mt-10 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-3">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 0a4 4 0 01-8 0m8 0v3a4 4 0 01-8 0V7m8 0a4 4 0 00-8 0" /></svg>
            </span>
            <h2 className="text-3xl font-extrabold text-blue-700">My Customers</h2>
          </div>
          <button
            onClick={() => window.saveCurrentView('home')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-4">No customer records found.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow text-gray-800">
              <thead className="bg-blue-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 border-b font-bold text-lg">Name</th>
                  <th className="px-6 py-3 border-b font-bold text-lg">WhatsApp</th>
                  <th className="px-6 py-3 border-b font-bold text-lg">Month</th>
                  <th className="px-6 py-3 border-b font-bold text-lg">Total Days</th>
                  <th className="px-6 py-3 border-b font-bold text-lg">Total Amount</th>
                  <th className="px-6 py-3 border-b font-bold text-lg">Remaining</th>
                  <th className="px-6 py-3 border-b font-bold text-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-blue-50 hover:bg-blue-100"}>
                    <td className="px-6 py-3 border-b text-center font-semibold">{s.name}</td>
                    <td className="px-6 py-3 border-b text-center">{s.whatsapp || '-'}</td>
                    <td className="px-6 py-3 border-b text-center">{formatMonth(s.month)}</td>
                    <td className="px-6 py-3 border-b text-center">{s.totalDays}</td>
                    <td className="px-6 py-3 border-b text-center">₹ {s.totalAmount}</td>
                    <td className="px-6 py-3 border-b text-center">₹ {Math.max(0, s.totalAmount - (s.paidAmount || 0))}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleView(s.userId, s.month, s.name)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setPaymentModal({ open: true, record: s });
                          setPaymentType('total');
                          setCustomAmount('');
                        }}
                        className={`ml-2 px-3 py-1 rounded font-semibold shadow transition text-sm ${s.status === 'paid' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                      >
                        {s.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </button>
                      <button
                        onClick={() => handleShareCustomer(s.userId)}
                        className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        Share
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={closeModal}>&times;</button>
            <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">{viewDetails.name} - {selectedMonth}</h3>
            <div className="flex justify-center mb-4 gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="border rounded px-2 py-1 text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ minWidth: 120 }}
              />
              <button
                onClick={() => fetchDetails(viewDetails.userId, selectedMonth, viewDetails.name)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                Refresh
              </button>
            </div>
            {loadingDetails ? (
              <div className="text-center py-4">Loading...</div>
            ) : details ? (
              <>
                {details.totalDays === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">No records found for {formatMonth(selectedMonth)}</div>
                    <div className="text-sm text-gray-400">Add daily entries to see the calendar view</div>
                  </div>
                ) : (
              <>
                {renderCalendar(details.days)}
                <div className="flex justify-between items-center mt-4 px-2">
                  <div className="text-lg font-semibold text-gray-700">Total Days: <span className="text-blue-700">{details.totalDays}</span></div>
                  <div className="text-lg font-semibold text-gray-700">Total Amount: <span className="text-green-700">₹ {details.totalAmount}</span></div>
                </div>
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      <span className="inline-block mr-4">✓ = Paid</span>
                      <span className="inline-block mr-4">○ = Unpaid</span>
                    </div>
                    {details.records && details.records.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</div>
                        <div className="text-xs text-gray-600">
                          <div>Total Records: {details.records.length}</div>
                          <div>Total Days: {details.totalDays}</div>
                          <div>Total Amount: ₹{details.totalAmount}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-red-600">Failed to load details.</div>
            )}
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {paymentModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setPaymentModal({ open: false, record: null })}>&times;</button>
            <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">Mark as Paid</h3>
            <div className="mb-4 text-center">
              <div className="text-lg font-semibold">Customer: <span className="text-blue-700">{paymentModal.record.name}</span></div>
              <div className="text-lg">Month: <span className="text-blue-700">{formatMonth(paymentModal.record.month)}</span></div>
              <div className="text-lg">Total Amount: <span className="text-green-700">₹ {paymentModal.record.totalAmount}</span></div>
              <div className="text-lg">Paid Amount: <span className="text-blue-700">₹ {paymentModal.record.paidAmount || 0}</span></div>
              <div className="text-lg">Remaining: <span className="text-red-700">₹ {Math.max(0, paymentModal.record.totalAmount - (paymentModal.record.paidAmount || 0))}</span></div>
              
              {/* Payment Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Payment Progress</span>
                  <span>{Math.round(((paymentModal.record.paidAmount || 0) / paymentModal.record.totalAmount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, ((paymentModal.record.paidAmount || 0) / paymentModal.record.totalAmount) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mb-4 flex flex-col items-center">
              <label className="font-semibold mb-2">Payment Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="paymentType" value="total" checked={paymentType === 'total'} onChange={() => setPaymentType('total')} />
                  Total Amount
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="paymentType" value="custom" checked={paymentType === 'custom'} onChange={() => setPaymentType('custom')} />
                  Custom Amount
                </label>
              </div>
            </div>
            {paymentType === 'custom' && (
              <div className="mb-4">
                <label className="block font-semibold mb-1">Amount Paid</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  min="0"
                  max={Math.max(0, paymentModal.record.totalAmount - (paymentModal.record.paidAmount || 0))}
                  placeholder="Enter amount paid"
                />
                <div className="mt-2 text-sm text-gray-700">
                  <div>Amount to pay: <span className="font-bold text-blue-600">₹{customAmount || 0}</span></div>
                  <div>Remaining after payment: <span className="font-bold text-red-600">₹ {Math.max(0, paymentModal.record.totalAmount - (paymentModal.record.paidAmount || 0) - (parseFloat(customAmount) || 0))}</span></div>
                  <div className="mt-1 text-xs text-gray-500">
                    Payment will be distributed across records from oldest to newest
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                onClick={() => setPaymentModal({ open: false, record: null })}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white transition font-semibold ${isProcessingPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={async () => {
                  if (isProcessingPayment) return;
                  setIsProcessingPayment(true);
                  
                  try {
                  // Fetch all milk records for this customer/month
                  const { userId, month, name } = paymentModal.record;
                    console.log('Processing payment for userId:', userId, 'month:', month, 'customer:', name);
                  const detailsRes = await axios.get(`/api/milk-records/details?userId=${userId}&month=${month}&customerName=${encodeURIComponent(name)}`);
                    const dayRecords = detailsRes.data.days.filter(d => d.record).map(d => d.record);
                    console.log('Found day records to update:', dayRecords.length, dayRecords);
                    
                    // Get all individual records for payment updates
                    const allRecords = [];
                    dayRecords.forEach(dayRecord => {
                      if (dayRecord.dayRecords && Array.isArray(dayRecord.dayRecords)) {
                        // If dayRecords is an array, add all records
                        allRecords.push(...dayRecord.dayRecords);
                      } else if (dayRecord._id) {
                        // If it's a single record, add it directly
                        allRecords.push(dayRecord);
                      }
                    });
                    
                    // If no records found in dayRecords, use the raw records from details
                    if (allRecords.length === 0 && detailsRes.data.records) {
                      allRecords.push(...detailsRes.data.records);
                    }
                    
                    console.log('All individual records to update:', allRecords.length, allRecords);
                    
                    if (paymentType === 'total') {
                      // Mark all records as fully paid
                      for (const rec of allRecords) {
                        console.log('Updating record:', rec._id, 'to paid with amount:', rec.amount);
                        await axios.put('/api/milk-records/status', {
                          recordId: rec._id,
                          status: 'paid',
                          paidAmount: rec.amount
                        });
                      }
                    } else {
                      // Enhanced partial payment logic
                      let additionalPaidAmount = parseFloat(customAmount) || 0;
                      let remaining = additionalPaidAmount;
                      let updatedRecords = 0;
                      let totalApplied = 0;
                      
                      // Sort records by date to pay oldest first
                      allRecords.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                      
                      console.log(`Processing partial payment of ₹${additionalPaidAmount} across ${allRecords.length} records`);
                      
                      for (const rec of allRecords) {
                        const currentPaid = rec.paidAmount || 0;
                        const stillOwed = rec.amount - currentPaid;
                        
                        if (stillOwed > 0 && remaining > 0) {
                          let toPay = Math.min(stillOwed, remaining);
                          const newPaidAmount = currentPaid + toPay;
                          
                          console.log(`Record ${rec._id}: Current paid: ₹${currentPaid}, Still owed: ₹${stillOwed}, Applying: ₹${toPay}, New total: ₹${newPaidAmount}`);
                          
                          await axios.put('/api/milk-records/status', {
                            recordId: rec._id,
                            status: newPaidAmount >= rec.amount ? 'paid' : 'unpaid',
                            paidAmount: newPaidAmount
                          });
                          
                          remaining -= toPay;
                          totalApplied += toPay;
                          updatedRecords++;
                          
                          if (remaining <= 0) {
                            console.log(`Payment fully distributed. Applied ₹${totalApplied} to ${updatedRecords} records.`);
                            break;
                          }
                        }
                      }
                      
                      console.log(`Payment distribution complete. Applied ₹${totalApplied} to ${updatedRecords} records. Remaining: ₹${remaining}`);
                    }
                    
                  setPaymentModal({ open: false, record: null });
                    setPaymentType('total');
                    setCustomAmount('');
                    
                    // Show success message with better UX
                    let successMessage = '';
                    if (paymentType === 'total') {
                      successMessage = `Payment updated successfully! All records for ${paymentModal.record.name} in ${formatMonth(paymentModal.record.month)} are now marked as paid.`;
                    } else {
                      const paidAmount = parseFloat(customAmount) || 0;
                      const totalAmount = paymentModal.record.totalAmount;
                      const previousPaid = paymentModal.record.paidAmount || 0;
                      const newTotalPaid = previousPaid + paidAmount;
                      const remaining = Math.max(0, totalAmount - newTotalPaid);
                      
                      successMessage = `Payment applied successfully! ₹${paidAmount} has been added to ${paymentModal.record.name}'s account for ${formatMonth(paymentModal.record.month)}. Total paid: ₹${newTotalPaid}/${totalAmount} (₹${remaining} remaining)`;
                    }
                    
                    // Create a custom success notification
                    const notification = document.createElement('div');
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #10B981;
                        color: white;
                        padding: 16px 24px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 10000;
                        max-width: 400px;
                        font-weight: 500;
                        animation: slideIn 0.3s ease-out;
                    `;
                    notification.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span>${successMessage}</span>
                        </div>
                    `;
                    document.body.appendChild(notification);
                    
                    // Remove notification after 5 seconds
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.style.animation = 'slideOut 0.3s ease-in';
                            setTimeout(() => notification.remove(), 300);
                        }
                    }, 5000);
                    
                  // Refresh summaries and dashboard
                    const refreshData = async () => {
                      try {
                        const userId = localStorage.getItem('userId');
                        const res = await axios.get(`/api/milk-records?userId=${userId}`);
                        setSummaries(res.data);
                        let receive = 0, pending = 0;
                        res.data.forEach(s => {
                          receive += s.paidAmount || 0;
                          pending += (s.totalAmount - (s.paidAmount || 0));
                        });
                        setTotalReceive(receive);
                        setTotalPending(pending);
                        
                        // Also refresh the main dashboard if it exists
                        if (window.refreshDashboardStats) {
                          window.refreshDashboardStats().catch(console.error);
                        }
                        
                        // Refresh customer list in main dashboard
                        if (window.refreshCustomerList) {
                          window.refreshCustomerList().catch(console.error);
                        }
                        
                        // Refresh calendar view if it's open
                        if (viewDetails && viewDetails.userId === paymentModal.record.userId && viewDetails.month === paymentModal.record.month) {
                          await fetchDetails(viewDetails.userId, viewDetails.month, viewDetails.name);
                        }
                      } catch (error) {
                        console.error('Failed to refresh data:', error);
                      }
                    };
                    
                    await refreshData();
                  } catch (error) {
                    console.error('Payment update failed:', error);
                    
                    // Create error notification
                    const errorNotification = document.createElement('div');
                    errorNotification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #EF4444;
                        color: white;
                        padding: 16px 24px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 10000;
                        max-width: 400px;
                        font-weight: 500;
                        animation: slideIn 0.3s ease-out;
                    `;
                    errorNotification.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                            <span>Failed to update payment. Please try again.</span>
                        </div>
                    `;
                    document.body.appendChild(errorNotification);
                    
                    setTimeout(() => {
                        if (errorNotification.parentNode) {
                            errorNotification.style.animation = 'slideOut 0.3s ease-in';
                            setTimeout(() => errorNotification.remove(), 300);
                        }
                    }, 5000);
                  } finally {
                    setIsProcessingPayment(false);
                  }
                }}
              >
                {isProcessingPayment ? 'Processing...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Customer Dashboard Component
function CustomerDashboard({ customerId, onLogout, onOpenSettings }) {
  const [customerData, setCustomerData] = React.useState(null);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [calendarData, setCalendarData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  // Payment states
  const [qrCodeData, setQrCodeData] = React.useState(null);
  const [paymentMsg, setPaymentMsg] = React.useState('');
  const [isGeneratingQR, setIsGeneratingQR] = React.useState(false);

  React.useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  React.useEffect(() => {
    if (customerData) {
      fetchCalendarData();
    }
  }, [selectedMonth, customerData]);

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(`/api/customers/${customerId}`);
      setCustomerData(response.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      // For customer dashboard, we need to find records by customer name and user ID
      // First get the customer data to get the name and user ID
      const customerResponse = await axios.get(`/api/customers/${customerId}`);
      const customerName = customerResponse.data.name;
      const userId = customerResponse.data.user;
      
      // Then get the milk records for this customer using both customer name and user ID
      const response = await axios.get(`/api/milk-records/details?customerName=${encodeURIComponent(customerName)}&userId=${userId}&month=${selectedMonth}`);
      setCalendarData(response.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  // Payment functions
  const handlePayNow = async () => {
    setPaymentMsg('');
    setIsGeneratingQR(true);
    try {
      const customerResponse = await axios.get(`/api/customers/${customerId}`);
      const userId = customerResponse.data.user;
      
      const res = await axios.post('/api/auth/generate-payment-qr', {
        userId: userId,
        amount: remainingAmount
      });
      setQrCodeData(res.data);
    } catch (err) {
      setPaymentMsg(err.response?.data?.message || 'Failed to generate payment QR.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your records...</p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Customer Not Found</h2>
          <p className="text-gray-600 mb-4">The customer record could not be found.</p>
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={onLogout}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = calendarData?.totalAmount || 0;
  const totalPaid = calendarData?.days?.reduce((sum, day) => sum + (day.record?.paidAmount || 0), 0) || 0;
  const remainingAmount = totalAmount - totalPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome, {customerData.name}!</h1>
              <p className="text-gray-600 dark:text-gray-400">View your milk records and payment status</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Settings Button */}
              <button 
                onClick={onOpenSettings}
                className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Settings"
              >
                <svg 
                  className="w-6 h-6 text-gray-600 dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-blue-600">₹{totalAmount}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Amount Paid</h3>
            <p className="text-3xl font-bold text-green-600">₹{totalPaid}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h3>
            <p className="text-3xl font-bold text-red-600">₹{remainingAmount}</p>
          </div>
        </div>

        {/* Pay Now Button */}
        {remainingAmount > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Make Payment</h3>
              <button
                onClick={handlePayNow}
                disabled={isGeneratingQR}
                className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center justify-center mx-auto ${
                  isGeneratingQR 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isGeneratingQR ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay Now (₹{remainingAmount})
                  </>
                )}
              </button>
              {paymentMsg && (
                <div className="mt-4 p-3 rounded-lg text-center bg-red-100 text-red-700 text-sm">
                  {paymentMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Month Selector */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-lg font-semibold text-gray-700">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Calendar View */}
        {calendarData && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Milk Records - {selectedMonth}</h3>
            {renderCalendar(calendarData.days)}
          </div>
        )}



        {/* QR Code Display Modal */}
        {qrCodeData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Payment QR Code</h2>
                <button onClick={() => setQrCodeData(null)} className="text-gray-500 hover:text-gray-700 text-xl">
                  ×
                </button>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <img 
                    src={qrCodeData.qrCodeDataUrl} 
                    alt="Payment QR Code" 
                    className="mx-auto w-64 h-64"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800">Amount: ₹{qrCodeData.amount}</p>
                  <p className="text-sm text-gray-600">UPI ID: {qrCodeData.upiId}</p>
                  <p className="text-sm text-gray-600">Pay to: {qrCodeData.userName}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Scan this QR code with any UPI app to make the payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserDashboard({ onLogout, onNavigate, onOpenSettings }) {
  const [userName, setUserName] = React.useState('User');
  const [showModal, setShowModal] = React.useState(false);
  const [showAddCustomer, setShowAddCustomer] = React.useState(false);
  const [form, setForm] = React.useState({ customer: '', quantityKg: '', amount: '', whatsapp: '', date: new Date().toISOString().slice(0, 10) });
  const [message, setMessage] = React.useState("");
  const [customers, setCustomers] = React.useState([]);
  const [totalCustomers, setTotalCustomers] = React.useState(0);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [todaysMilkKg, setTodaysMilkKg] = React.useState(0);
  const [totalMilkQuantityKg, setTotalMilkQuantityKg] = React.useState(0);
  const [newCustomer, setNewCustomer] = React.useState({ name: '', whatsapp: '' });
  const [addCustomerMsg, setAddCustomerMsg] = React.useState('');
  // Add state for totalReceive and totalPending
  const [totalReceive, setTotalReceive] = React.useState(0);
  const [totalPending, setTotalPending] = React.useState(0);
  
  // Payment option states
  const [showPaymentOptionModal, setShowPaymentOptionModal] = React.useState(false);
  const [showPaymentQRModal, setShowPaymentQRModal] = React.useState(false);
  const [paymentOption, setPaymentOption] = React.useState({ upiId: '', hasPaymentOption: false });
  const [upiId, setUpiId] = React.useState('');
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [qrCodeData, setQrCodeData] = React.useState(null);
  const [paymentOptionMsg, setPaymentOptionMsg] = React.useState('');

  // Helper function to refresh dashboard stats
  const refreshDashboardStats = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`/api/milk-records?userId=${userId}`);
      setTotalRevenue(res.data.reduce((sum, s) => sum + s.totalAmount, 0));
      setTotalRecords(res.data.reduce((sum, s) => sum + s.totalDays, 0));
      // Calculate totalReceive and totalPending
      let receive = 0, pending = 0;
      res.data.forEach(s => {
        receive += s.paidAmount || 0;
        pending += (s.totalAmount - (s.paidAmount || 0));
      });
      setTotalReceive(receive);
      setTotalPending(pending);
      
      // Fetch today's total milk quantity using the efficient endpoint
      try {
        const userId = localStorage.getItem('userId');
        const todayRes = await axios.get(`/api/milk-records/today?userId=${userId}`);
        setTodaysMilkKg(todayRes.data.totalQuantityKg || 0);
        console.log(`Today's milk quantity: ${todayRes.data.totalQuantityKg}kg from ${todayRes.data.recordCount} records`);
      } catch (error) {
        console.error('Failed to fetch today\'s milk data:', error);
        setTodaysMilkKg(0);
      }
      
      // Fetch total milk quantity (all-time)
      try {
        const userId = localStorage.getItem('userId');
        const totalRes = await axios.get(`/api/milk-records/total?userId=${userId}`);
        setTotalMilkQuantityKg(totalRes.data.totalQuantityKg || 0);
        console.log(`Total milk quantity (all-time): ${totalRes.data.totalQuantityKg}kg from ${totalRes.data.recordCount} records`);
      } catch (error) {
        console.error('Failed to fetch total milk data:', error);
        setTotalMilkQuantityKg(0);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard stats:', error);
    }
  };

  // Helper function to refresh customer list
  const refreshCustomerList = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log('UserDashboard: Fetching customers for userId:', userId);
      const res = await axios.get(`/api/customers?userId=${userId}`);
      console.log('UserDashboard: Customers response:', res.data);
      console.log('UserDashboard: Setting totalCustomers to:', res.data.length);
      setCustomers(res.data);
      setTotalCustomers(res.data.length);
    } catch (error) {
      console.error('Failed to refresh customer list:', error);
    }
  };

  // Expose the functions globally for use in CustomersPage
  React.useEffect(() => {
    window.refreshDashboardStats = refreshDashboardStats;
    window.refreshCustomerList = refreshCustomerList;
    return () => {
      delete window.refreshDashboardStats;
      delete window.refreshCustomerList;
    };
  }, []);

  React.useEffect(() => {
    // Fetch user name from backend after login
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Get user name from localStorage or set default
      const storedUserName = localStorage.getItem('userName');
      if (storedUserName) {
        setUserName(storedUserName);
      }
    }
    // Fetch customers and stats
    refreshCustomerList().catch(console.error);
    refreshDashboardStats().catch(console.error);
    
    // Fetch today's total milk quantity using the efficient endpoint
    const fetchTodaysMilk = async () => {
      try {
        const todayRes = await axios.get(`/api/milk-records/today?userId=${userId}`);
        setTodaysMilkKg(todayRes.data.totalQuantityKg || 0);
        console.log(`Today's milk quantity: ${todayRes.data.totalQuantityKg}kg from ${todayRes.data.recordCount} records`);
      } catch (error) {
        console.error('Failed to fetch today\'s milk data:', error);
        setTodaysMilkKg(0);
      }
    };
    
    // Fetch total milk quantity (all-time)
    const fetchTotalMilk = async () => {
      try {
        const totalRes = await axios.get(`/api/milk-records/total?userId=${userId}`);
        setTotalMilkQuantityKg(totalRes.data.totalQuantityKg || 0);
        console.log(`Total milk quantity (all-time): ${totalRes.data.totalQuantityKg}kg from ${totalRes.data.recordCount} records`);
      } catch (error) {
        console.error('Failed to fetch total milk data:', error);
        setTotalMilkQuantityKg(0);
      }
    };
    
    fetchTodaysMilk();
    fetchTotalMilk();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setMessage('User ID not found. Please log in again.');
        return;
      }
      const res = await axios.post('/api/milk-records', {
        customer: form.customer,
        quantityKg: form.quantityKg,
        amount: form.amount,
        whatsapp: form.whatsapp,
        user: userId,
        createdAt: form.date
      });
      
      // Show success message
      setMessage(res.data.message || 'Record saved successfully!');
      setShowModal(false);
      setForm({ customer: '', quantityKg: '', amount: '', whatsapp: '', date: new Date().toISOString().slice(0, 10) });
      
      // Auto-refresh dashboard stats
      await refreshDashboardStats();
      
      // Refresh customer list
      axios.get(`/api/customers?userId=${userId}`).then(res => {
        setCustomers(res.data);
        setTotalCustomers(res.data.length);
      });
      
      // Show success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10B981;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          max-width: 400px;
          font-weight: 500;
          animation: slideIn 0.3s ease-out;
      `;
      notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Record saved successfully! Dashboard updated.</span>
          </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
          if (notification.parentNode) {
              notification.style.animation = 'slideOut 0.3s ease-in';
              setTimeout(() => notification.remove(), 300);
          }
      }, 5000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save record.');
    }
  };

  // Add new customer logic
  const handleAddCustomerChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setAddCustomerMsg('');
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.post('/api/customers', {
        ...newCustomer,
        userId: userId
      });
      setAddCustomerMsg(res.data.message || 'Customer added!');
      setNewCustomer({ name: '', whatsapp: '' });
      // Refresh customer list
      axios.get(`/api/customers?userId=${userId}`).then(res => {
        setCustomers(res.data);
        setTotalCustomers(res.data.length);
      });
    } catch (err) {
      setAddCustomerMsg(err.response?.data?.message || 'Failed to add customer.');
    }
  };

  const handleOpenCustomers = () => {
    window.open(window.location.origin + '?view=customers', '_blank');
  };

  // Payment option functions
  const fetchPaymentOption = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`/api/auth/payment-option/${userId}`);
      setPaymentOption(res.data.paymentOptions);
    } catch (error) {
      console.error('Failed to fetch payment option:', error);
    }
  };

  const handleAddPaymentOption = async (e) => {
    e.preventDefault();
    setPaymentOptionMsg('');
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.post('/api/auth/payment-option', {
        userId: userId,
        upiId: upiId
      });
      setPaymentOptionMsg(res.data.message);
      setUpiId('');
      setShowPaymentOptionModal(false);
      await fetchPaymentOption();
    } catch (err) {
      setPaymentOptionMsg(err.response?.data?.message || 'Failed to add payment option.');
    }
  };

  const handleShowPaymentOption = () => {
    setShowPaymentQRModal(true);
  };

  const handleGeneratePaymentQR = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.post('/api/auth/generate-payment-qr', {
        userId: userId,
        amount: paymentAmount
      });
      setQrCodeData(res.data);
      setShowPaymentQRModal(false);
    } catch (err) {
      setPaymentOptionMsg(err.response?.data?.message || 'Failed to generate payment QR.');
    }
  };

  // Fetch payment option on component mount
  React.useEffect(() => {
    fetchPaymentOption();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative">
      {/* Settings Button for User Dashboard */}
      <div className="absolute top-4 right-4 z-10">
        <SettingsButton onClick={onOpenSettings} />
      </div>
      {/* Dashboard Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center mb-8">
        <h2 className="text-4xl font-extrabold text-green-600 dark:text-green-400 mb-2 text-center">User Dashboard</h2>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Welcome, <span className="font-semibold text-blue-700">{userName}</span>! Here you can manage your milk records.
        </p>
        <div className="grid grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-blue-600">{todaysMilkKg}</span>
            <span className="text-gray-600">Today's Milk (Kg)</span>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-purple-600">{totalMilkQuantityKg}</span>
            <span className="text-gray-600">Total Milk (Kg)</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-green-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-green-600">₹ {totalRevenue}</span>
            <span className="text-gray-600">Total Revenue</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-orange-600">₹ {totalReceive}</span>
            <span className="text-gray-600">Total Received</span>
        </div>
          </div>
        <div className="grid grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-red-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-red-600">₹ {totalPending}</span>
            <span className="text-gray-600">Total Pending</span>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-indigo-600">{totalCustomers}</span>
            <span className="text-gray-600">Total Customers</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 mb-8 w-full">
          <div className="bg-yellow-50 rounded-xl p-6 flex flex-col items-center shadow w-full">
            <span className="text-3xl font-bold text-yellow-600">{totalRecords}</span>
            <span className="text-gray-600">Total Records</span>
          </div>
        </div>
        <div className="flex justify-center">
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-lg font-semibold transition" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      
      {/* Action Buttons Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Quick Actions</h3>
        <div className="space-y-4">
          <button
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center"
            onClick={handleOpenCustomers}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 0a4 4 0 01-8 0m8 0v3a4 4 0 01-8 0V7m8 0a4 4 0 00-8 0" />
            </svg>
            My Customers
          </button>
          <button
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center"
            onClick={() => setShowAddCustomer(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Customer
          </button>
          <button
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center"
            onClick={() => setShowModal(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Add Daily Entry
          </button>
          
          {/* Payment Option Button - Show only if not added */}
          {!paymentOption.hasPaymentOption && (
            <button
              className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center"
              onClick={() => setShowPaymentOptionModal(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Add Payment Option
            </button>
          )}
          
          {/* My Payment Option Button - Show only if added */}
          {paymentOption.hasPaymentOption && (
            <button
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center"
              onClick={handleShowPaymentOption}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
              </svg>
              My Payment Option
            </button>
          )}
        </div>
      </div>
      
      {/* Add New Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setShowAddCustomer(false)}>&times;</button>
            <h3 className="text-xl font-bold text-purple-700 mb-6 text-center">Add New Customer</h3>
            <form className="space-y-4" onSubmit={handleAddCustomer}>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleAddCustomerChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={newCustomer.whatsapp}
                  onChange={handleAddCustomerChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter WhatsApp number (optional)"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                  onClick={() => setShowAddCustomer(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
            {addCustomerMsg && (
              <div className="mt-4 p-2 rounded text-center bg-green-100 text-green-700">{addCustomerMsg}</div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Daily Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Daily Entry</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Customer</label>
                <select
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Milk Quantity (Kg)</label>
                <input
                  type="number"
                  name="quantityKg"
                  value={form.quantityKg}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter quantity in kilograms"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the milk quantity in kilograms</p>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Show message if any */}
      {message && (
        <div className="mb-4 p-2 rounded text-center bg-green-100 text-green-700 w-full max-w-xl mt-4">
          {message}
        </div>
      )}

      {/* Payment Option Modal */}
      {showPaymentOptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Payment Option</h2>
              <button onClick={() => setShowPaymentOptionModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleAddPaymentOption} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Enter UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Enter UPI ID where you receive payment (e.g., username@bank)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the UPI ID where you receive payment for milk</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentOptionModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Add Payment Option
                </button>
              </div>
            </form>
            {paymentOptionMsg && (
              <div className="mt-4 p-2 rounded text-center bg-green-100 text-green-700">{paymentOptionMsg}</div>
            )}
          </div>
        </div>
      )}

      {/* Payment Option Details Modal */}
      {showPaymentQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Payment Option</h2>
              <button onClick={() => setShowPaymentQRModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Payment Option Details */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Your UPI ID</h3>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600 text-center">{paymentOption.upiId}</p>
                </div>
                <p className="text-sm text-blue-600 mt-2 text-center">This is your UPI ID for receiving payments</p>
              </div>

              {/* Generate QR Code Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate QR Code</h3>
                <form onSubmit={handleGeneratePaymentQR} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Enter Amount</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="Enter amount to generate QR code"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentQRModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Generate QR Code
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {paymentOptionMsg && (
              <div className="mt-4 p-2 rounded text-center bg-red-100 text-red-700">{paymentOptionMsg}</div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Display Modal */}
      {qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Payment QR Code</h2>
              <button onClick={() => { setQrCodeData(null); setShowPaymentQRModal(false); }} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <img 
                  src={qrCodeData.qrCodeDataUrl} 
                  alt="Payment QR Code" 
                  className="mx-auto w-64 h-64"
                />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">Amount: ₹{qrCodeData.amount}</p>
                <p className="text-sm text-gray-600">UPI ID: {qrCodeData.upiId}</p>
                <p className="text-sm text-gray-600">Pay to: {qrCodeData.userName}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Scan this QR code with any UPI app to make the payment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function AppContent() {
  const { language } = useSettings();
  const t = translations[language];
  
  // Welcome splash screen state
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only on first visit (not on refresh)
    return !localStorage.getItem('hasVisitedBefore');
  });
  
  // Register service worker for PWA functionality
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const [view, setView] = React.useState('login');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [userName, setUserName] = React.useState('');
  const [customerView, setCustomerView] = React.useState(false);
  const [customerData, setCustomerData] = React.useState(null);
  const [sharedCustomerId, setSharedCustomerId] = React.useState(null);
  const [registerData, setRegisterData] = useState({ name: "", mobile: "", mpin: "" });
  const [loginData, setLoginData] = useState({ mobile: "", mpin: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null); // 'user' | 'admin' | null
  const [customers, setCustomers] = useState([]);

  // Check authentication status on app load
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for URL parameters
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'customers') {
          setView('customers');
          setIsInitializing(false);
          return;
        }
        if (params.get('view') === 'login') {
          setView('login');
          setIsInitializing(false);
          return;
        }
        // Check if this is a customer sharing URL
        const path = window.location.pathname;
        const customerMatch = path.match(/\/customer\/([a-zA-Z0-9]+)/);
        
        if (customerMatch) {
          const customerId = customerMatch[1];
          setSharedCustomerId(customerId);
          setView('customer-login');
          setIsInitializing(false);
          return;
        }
        
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        const lastView = localStorage.getItem('lastView');
        
        if (userId && userRole) {
          // Verify the user is still valid by making a request
          try {
            // Just check if we can make a request - use a simple endpoint
            await axios.get('/api/milk-records/total?userId=' + userId);
            // If request succeeds, user is authenticated
            setDashboard(userRole);
            setMessage(`Welcome back, ${userName || 'User'}!`);
          } catch (error) {
            console.error('Auth verification failed:', error);
            // If request fails, clear invalid auth data
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('lastView');
            setDashboard(null);
          }
        } else if (lastView && lastView !== 'home') {
          // Restore last view if user was not authenticated
          setView(lastView);
        } else {
          // If no last view or last view is home, show login page
          setView('login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch customers on mount and after adding a customer
  // Removed - UserDashboard handles its own customer data

  // Save current view to localStorage
  const saveCurrentView = (newView) => {
    localStorage.setItem('lastView', newView);
    setView(newView);
  };

  // Make saveCurrentView available globally
  React.useEffect(() => {
    window.saveCurrentView = saveCurrentView;
    return () => {
      delete window.saveCurrentView;
    };
  }, []);

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    console.log('Login form change:', e.target.name, e.target.value);
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/register", registerData);
      setMessage(res.data.message || "Registration successful!");
      setView("login");
      setRegisterData({ name: "", mobile: "", mpin: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt started...');
    console.log('Login data:', loginData);
    
    setLoading(true);
    setMessage("");
    
    try {
      console.log('Making API request to /api/auth/login...');
      const res = await axios.post("/api/auth/login", loginData);
      console.log('Login response:', res.data);
      
      setMessage("Login successful! Welcome, " + res.data.userName);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userRole', res.data.userRole);
      localStorage.setItem('userName', res.data.userName);
      
      console.log('User role:', res.data.userRole);
      
      if (res.data.userRole === "admin") {
        console.log('Setting dashboard to admin');
        setDashboard("admin");
      } else {
        console.log('Setting dashboard to user');
        setDashboard("user");
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setMessage(err.response?.data?.message || "Login failed.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    setDashboard(null);
    setView("home");
    setMessage("");
    setLoginData({ mobile: "", mpin: "" });
  };

  // Customer login functionality
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("/api/auth/customer-login", {
        whatsapp: loginData.mpin
      });
      
      if (response.data.success) {
        setCustomerData(response.data.customer);
        setCustomerView(true);
        setMessage("Login successful!");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  // Handle customer logout
  const handleCustomerLogout = () => {
    setCustomerView(false);
    setCustomerData(null);
    setSharedCustomerId(null);
    setView('login');
  };

  // Share customer functionality
  const handleShareCustomer = async (customerId) => {
    const shareUrl = `${window.location.protocol}//${window.location.hostname}:3000/customer/${customerId}`;
    
    // Create a share modal instead of relying on clipboard
    const shareModal = document.createElement('div');
    shareModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    shareModal.innerHTML = `
        <div style="
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #1F2937; font-size: 18px; font-weight: 600;">Share Customer Records</h3>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6B7280;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
            </div>
            
            <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                Share this link with your customer so they can view their milk records and payment status.
            </p>
            
            <div style="
                background: #F3F4F6;
                border: 1px solid #D1D5DB;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                font-family: monospace;
                font-size: 14px;
                word-break: break-all;
                color: #374151;
            ">${shareUrl}</div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="
                    navigator.clipboard.writeText('${shareUrl}').then(() => {
                        this.textContent = 'Copied!';
                        this.style.background = '#10B981';
                        setTimeout(() => {
                            this.textContent = 'Copy Link';
                            this.style.background = '#3B82F6';
                        }, 2000);
                    }).catch(() => {
                        this.textContent = 'Failed';
                        this.style.background = '#EF4444';
                        setTimeout(() => {
                            this.textContent = 'Copy Link';
                            this.style.background = '#3B82F6';
                        }, 2000);
                    });
                " style="
                    background: #3B82F6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.2s;
                ">Copy Link</button>
                
                <button onclick="
                    window.open('https://wa.me/?text=Hi! You can view your milk records here: ${encodeURIComponent(shareUrl)}', '_blank');
                " style="
                    background: #25D366;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Share on WhatsApp
                </button>
                
                <button onclick="
                    window.open('mailto:?subject=Milk Records&body=Hi! You can view your milk records here: ${encodeURIComponent(shareUrl)}', '_blank');
                " style="
                    background: #EA4335;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                ">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Share via Email
                </button>
            </div>
            
            <div style="
                background: #FEF3C7;
                border: 1px solid #F59E0B;
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
            ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <svg width="16" height="16" fill="#F59E0B" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span style="font-weight: 600; color: #92400E; font-size: 14px;">Important</span>
                </div>
                <p style="margin: 0; color: #92400E; font-size: 12px;">
                    Customers will need to enter their WhatsApp number as the password to access their records.
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.remove();
        }
    });
  };

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  // Make handleShareCustomer available globally
  window.handleShareCustomer = handleShareCustomer;

  // Show welcome splash screen
  if (showSplash) {
    return <WelcomeSplash onComplete={handleSplashComplete} />;
  }

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login required message if not authenticated and not already on login page
  if (!isAuthenticated && view !== 'login' && view !== 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative">
          {/* Settings Button for Auth Required Page */}
          <div className="absolute top-4 right-4">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{t.authenticationRequired}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.pleaseLogin}</p>
          <div className="space-y-3">
            <button 
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => {
                // Clear any stored view and set the view to login
                localStorage.removeItem('lastView');
                setView('login');
                setIsAuthenticated(false);
              }}
            >
              {t.goToLogin}
            </button>
            <button 
              className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              onClick={() => window.close()}
            >
              {t.closeWindow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show customer dashboard if customer is logged in
  if (customerView && customerData) {
    return <CustomerDashboard customerId={customerData._id} onLogout={handleCustomerLogout} onOpenSettings={() => setSettingsOpen(true)} />;
  }

  // Show customer login if shared customer ID is present
  if (sharedCustomerId && !customerView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
          {/* Settings Button for Customer Login */}
          <div className="absolute top-4 right-4">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
          </div>
          <div className="text-center mb-6">
            <div className="mb-4">
              <Logo size="large" className="justify-center" />
            </div>
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{t.customerLogin}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t.customerLoginDescription}</p>
          </div>
          
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">{t.whatsappNumber}</label>
              <input
                type="text"
                name="mpin"
                value={loginData.mpin}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t.enterWhatsapp}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? t.loggingIn : t.viewMyRecords}
            </button>
          </form>
          
          {message && (
            <div className="mt-4 p-3 rounded text-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {message}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setSharedCustomerId(null);
                setView('login');
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
            >
              {t.backToMainLogin}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dashboard === "user") {
    return <UserDashboard onLogout={handleLogout} onNavigate={saveCurrentView} onOpenSettings={() => setSettingsOpen(true)} />;
  }
  if (dashboard === "admin") {
    return <AdminDashboard onLogout={handleLogout} onOpenSettings={() => setSettingsOpen(true)} />;
  }

  // Home page improvements:
  if (view === "home") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 mt-10 border border-gray-100 dark:border-gray-700 flex flex-col items-center relative">
          {/* Settings Button for Home Page */}
          <div className="absolute top-4 right-4">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
          </div>
          <div className="mb-6">
            <Logo size="xlarge" className="justify-center" />
          </div>
          <h1 className="text-4xl font-extrabold text-green-700 dark:text-green-400 mb-4 text-center">{t.welcomeTitle}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-xl">
            {t.welcomeDescription}
          </p>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center mb-8">
            <button
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg shadow transition"
              onClick={() => saveCurrentView('login')}
            >
              {t.login}
            </button>
            <button
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg shadow transition"
              onClick={() => saveCurrentView('register')}
            >
              {t.register}
            </button>
          </div>
          <div className="w-full flex flex-col items-center">
            <ul className="text-left list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 mb-2">
              {t.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (view === "customers") {
    return <CustomersPage authData={{ userId: localStorage.getItem('userId'), userName: localStorage.getItem('userName') }} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10">
        {/* Header with Logo and Settings */}
        <div className="flex justify-between items-center mb-8">
          <Logo size="large" className="justify-center" />
          <SettingsButton onClick={() => setSettingsOpen(true)} />
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-center mb-8">
          <button
            className={`px-4 py-2 font-semibold rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none ${view === "home" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            onClick={() => { saveCurrentView("home"); setMessage(""); }}
          >
            {t.home}
          </button>
          <button
            className={`px-4 py-2 font-semibold border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none ${view === "login" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            onClick={() => { saveCurrentView("login"); setMessage(""); }}
          >
            {t.login}
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-r-lg border-t border-b border-r border-gray-300 dark:border-gray-600 focus:outline-none ${view === "register" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            onClick={() => { saveCurrentView("register"); setMessage(""); }}
          >
            {t.register}
          </button>
        </div>
        {/* Message */}
        {message && (
          <div className={`mb-4 p-2 rounded text-center ${message.includes("success") || message.includes("Welcome") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
        {/* Views */}
        {view === "home" && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2">{t.welcomeTitle}</h1>
            <p className="text-gray-700 dark:text-gray-300">{t.welcomeDescription}</p>
            <ul className="text-left list-disc list-inside text-gray-600 dark:text-gray-400 mt-4">
              {t.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => saveCurrentView("login")}
              >
                {t.login}
              </button>
              <button
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                onClick={() => saveCurrentView("register")}
              >
                {t.register}
              </button>
            </div>
          </div>
        )}
        {view === "login" && (
          <form className="space-y-6" onSubmit={handleLogin} autoComplete="off">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">{t.login}</h2>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t.mobileNumber}</label>
              <input
                type="tel"
                name="mobile"
                value={loginData.mobile}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t.enterMobile}
                pattern="[0-9]{10}"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t.mpin}</label>
              <input
                type="password"
                name="mpin"
                value={loginData.mpin}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t.enterMpin}
                pattern="[0-9]{5}"
                maxLength={5}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-lg font-semibold"
              disabled={loading}
            >
              {loading ? t.loggingIn : t.login}
            </button>
          </form>
        )}
        {view === "register" && (
          <form className="space-y-6" onSubmit={handleRegister} autoComplete="off">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">{t.register}</h2>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t.name}</label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t.enterName}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t.mobileNumber}</label>
              <input
                type="tel"
                name="mobile"
                value={registerData.mobile}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t.enterMobile}
                pattern="[0-9]{10}"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold">{t.mpin}</label>
              <input
                type="password"
                name="mpin"
                value={registerData.mpin}
                onChange={handleRegisterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t.createMpin}
                pattern="[0-9]{5}"
                maxLength={5}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-lg font-semibold"
              disabled={loading}
            >
              {loading ? t.registering : t.register}
            </button>
          </form>
        )}
        {view === "customers" && (
          <CustomersPage authData={{
            userId: localStorage.getItem('userId'),
            userRole: localStorage.getItem('userRole'),
            userName: localStorage.getItem('userName')
          }} />
        )}
      </div>
      <InstallPrompt />
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
