import React, { useState, useEffect } from "react";
import axios from "axios";
import { SettingsProvider } from './contexts/SettingsContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import SyncStatusBanner from './components/common/SyncStatusBanner';
import NotificationCenter from './components/common/NotificationCenter';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import GuidedTour from './components/common/GuidedTour';
import SkeletonLoaders from './components/common/SkeletonLoaders';

// Pages
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import MilkRecordsPage from './pages/MilkRecordsPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Existing Admin & Auth Components
import AdminDashboard from './components/AdminDashboard';
import AuthScreen from './components/AuthScreen';

// Configure Axios base URL with fallback
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
const productionURL = process.env.REACT_APP_API_URL || 'https://milkrecord-backend.onrender.com';
axios.defaults.baseURL = isDevelopment ? 'http://localhost:5000' : productionURL;

export function MainAppContent() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'customers' | 'records' | 'payments' | 'analytics' | 'settings' | 'admin' | 'login'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Authentication & User State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [user, setUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Modals & Panels
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPaymentQRModal, setShowPaymentQRModal] = useState(false);
  const [showPaymentSettleModal, setShowPaymentSettleModal] = useState(null);

  // Data States
  const [loading, setLoading] = useState(true);
  const [todaysMilkKg, setTodaysMilkKg] = useState(0);
  const [totalMilkQuantityKg, setTotalMilkQuantityKg] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalReceive, setTotalReceive] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Forms
  const [recordForm, setRecordForm] = useState({
    customer: '',
    quantityKg: '',
    amount: '',
    shift: 'morning',
    whatsapp: '',
    date: new Date().toISOString().slice(0, 10)
  });
  const [customerForm, setCustomerForm] = useState({ name: '', whatsapp: '' });
  const [upiId, setUpiId] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrAmount, setQrAmount] = useState('');

  // Initial Theme & Authentication Check
  useEffect(() => {
    // Check Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Check Auth
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    if (token && userId) {
      setIsAuthenticated(true);
      setUserRole(storedRole || 'user');
      setUser({ _id: userId, name: userName || 'Dairy Owner', role: storedRole || 'user' });
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      setIsDemoMode(false);
      setUser(null);
    }

    // Check First-Time Onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    setLoading(false);
  }, []);

  // Attach the signed session to every API request. Never send a client-selected owner identity as authority.
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    const responseInterceptor = axios.interceptors.response.use(response => response, error => {
      if (error.response?.status === 401 && localStorage.getItem('authToken')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.reload();
      }
      return Promise.reject(error);
    });
    return () => { axios.interceptors.request.eject(interceptor); axios.interceptors.response.eject(responseInterceptor); };
  }, []);

  // Sync Theme
  const handleToggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    const themeStr = nextMode ? 'dark' : 'light';
    localStorage.setItem('theme', themeStr);
    document.documentElement.setAttribute('data-theme', themeStr);
  };

  // Fetch Dashboard Stats & Customer Records
  const refreshData = async () => {
    const userId = localStorage.getItem('userId') || 'demo';

    if (!isAuthenticated) {
      setTodaysMilkKg(0); setTotalMilkQuantityKg(0); setTotalRevenue(0);
      setTotalReceive(0); setTotalPending(0); setTotalCustomers(0); setTotalRecords(0);
      setCustomers([]); setRecords([]);
      return;
    }

    try {
      // Fetch Customer Summaries
      const resSummaries = await axios.get('/api/milk-records');
      if (Array.isArray(resSummaries.data)) {
        setCustomers(resSummaries.data);
        const revenue = resSummaries.data.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const receive = resSummaries.data.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
        setTotalRevenue(revenue);
        setTotalReceive(receive);
        setTotalPending(Math.max(0, revenue - receive));
      }

      // Fetch Customer Count
      const resCustomers = await axios.get('/api/customers');
      if (Array.isArray(resCustomers.data)) {
        setTotalCustomers(resCustomers.data.length);
      }

      // Fetch Today's Milk
      const resToday = await axios.get('/api/milk-records/today');
      if (resToday.data) {
        setTodaysMilkKg(resToday.data.totalQuantityKg || 0);
      }

      // Fetch Total Milk
      const resTotal = await axios.get('/api/milk-records/total');
      if (resTotal.data) {
        setTotalMilkQuantityKg(resTotal.data.totalQuantityKg || 0);
        setTotalRecords(resTotal.data.recordCount || 0);
      }

      // Fetch Detailed Month Records
      const resDetails = await axios.get(`/api/milk-records/details?month=${selectedMonth}`);
      if (resDetails.data && Array.isArray(resDetails.data.records)) {
        setRecords(resDetails.data.records);
      }

      // Fetch Payment Option UPI
      const resUpi = await axios.get('/api/auth/payment-option/me');
      if (resUpi.data && resUpi.data.paymentOptions) {
        setUpiId(resUpi.data.paymentOptions.upiId || '');
      }

    } catch (err) {
      console.error('Failed to fetch dairy records:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated, isDemoMode, selectedMonth]);

  // Record Entry Submission
  const handleSaveRecord = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId') || 'demo';
      if (isAuthenticated) {
        await axios.post('/api/milk-records', {
          customer: recordForm.customer,
          quantityKg: recordForm.quantityKg,
          amount: recordForm.amount || recordForm.quantityKg * 50,
          whatsapp: recordForm.whatsapp,
          createdAt: recordForm.date
        });
      }
      setShowAddRecordModal(false);
      setRecordForm({ customer: '', quantityKg: '', amount: '', shift: 'morning', whatsapp: '', date: new Date().toISOString().slice(0, 10) });
      refreshData();
      alert('Milk record saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save record.');
    }
  };

  // Customer Submission
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId') || 'demo';
      if (isAuthenticated) {
        await axios.post('/api/customers', {
          ...customerForm,
        });
      }
      setShowAddCustomerModal(false);
      setCustomerForm({ name: '', whatsapp: '' });
      refreshData();
      alert('Customer added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer.');
    }
  };

  // Generate Payment QR Code
  const handleGenerateQR = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'demo';
      if (isAuthenticated) {
        const res = await axios.post('/api/auth/generate-payment-qr', {
          amount: qrAmount || 1000
        });
        setQrCodeData(res.data);
      } else {
        setQrCodeData({
          qrCodeDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=demo@upi',
          amount: qrAmount || 1000,
          upiId: upiId || 'demo@upi',
          userName: 'Demo Dairy'
        });
      }
    } catch (err) {
      alert('Failed to generate payment QR code.');
    }
  };

  const handleSaveUpiId = async (nextUpiId) => {
    try {
      await axios.post('/api/auth/payment-option', { upiId: nextUpiId });
      setUpiId(nextUpiId);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'UPI settings could not be saved.');
      throw err;
    }
  };

  const handleLogout = () => {
    ['authToken', 'userId', 'userRole', 'userName'].forEach(key => localStorage.removeItem(key));
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setUser(null);
    setUserRole('user');
    setCurrentView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <SkeletonLoaders type="card" />
      </div>
    );
  }

  if (!isAuthenticated || !localStorage.getItem('authToken')) {
    return <AuthScreen onAuthenticated={(signedInUser) => { setUser(signedInUser); setUserRole(signedInUser.role); setIsAuthenticated(true); setIsDemoMode(false); }} />;
  }

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`Are you sure you want to remove customer ${customerName}?`)) return;
    try {
      if (isAuthenticated && customerId) {
        await axios.delete(`/api/customers/${customerId}`);
      }
      setCustomers(prev => prev.filter(c => c._id !== customerId));
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      
      {/* Top Offline / Sync Status Bar */}
      <SyncStatusBanner
        isOffline={!navigator.onLine}
        isSyncing={false}
      />

      {/* Primary SaaS Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        userRole={userRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        unreadNotifications={2}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSettings={() => setCurrentView('settings')}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Body Content Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onStartTour={() => setShowTour(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 lg:ml-64 p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {currentView === 'dashboard' && (
            <DashboardPage
              todaysMilkKg={todaysMilkKg}
              totalMilkQuantityKg={totalMilkQuantityKg}
              totalRevenue={totalRevenue}
              totalReceive={totalReceive}
              totalPending={totalPending}
              totalCustomers={totalCustomers}
              totalRecords={totalRecords}
              customers={customers}
              records={records}
              onOpenAddRecord={() => setShowAddRecordModal(true)}
              onOpenAddCustomer={() => setShowAddCustomerModal(true)}
              onOpenPaymentQR={() => setShowPaymentQRModal(true)}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'customers' && (
            <CustomerManagementPage
              customers={customers}
              records={records}
              onAddCustomer={() => setShowAddCustomerModal(true)}
              onViewCustomer={(u, m, n) => {
                setSelectedMonth(m || selectedMonth);
                setCurrentView('records');
              }}
              onShareCustomer={(u, n, whatsapp) => {
                const phone = whatsapp || '';
                const text = encodeURIComponent(`Hello ${n}, view your latest milk record details on Milk Record SaaS!`);
                const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
                window.open(url, '_blank');
              }}
              onMarkPayment={(cust) => setShowPaymentSettleModal(cust)}
              onDeleteCustomer={handleDeleteCustomer}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentView === 'records' && (
            <MilkRecordsPage
              records={records}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onOpenAddRecord={() => setShowAddRecordModal(true)}
              onOpenEditRecord={() => alert('Record editing is not available yet. Your existing record has not been changed.')}
              onOpenCalendar={() => setCurrentView('customers')}
            />
          )}

          {currentView === 'payments' && (
            <PaymentsPage
              totalReceive={totalReceive}
              totalPending={totalPending}
              customers={customers}
              upiId={upiId}
              onOpenPaymentQR={() => setShowPaymentQRModal(true)}
              onMarkPayment={(cust) => setShowPaymentSettleModal(cust)}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsPage
              todaysMilkKg={todaysMilkKg}
              totalMilkQuantityKg={totalMilkQuantityKg}
              totalRevenue={totalRevenue}
              totalCustomers={totalCustomers}
              customers={customers}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
              upiId={upiId}
              onSaveUpiId={handleSaveUpiId}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboard onLogout={handleLogout} />
          )}
        </main>

      </div>

      {/* Add Record Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Log Daily Milk Entry</h3>
            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={recordForm.customer}
                  onChange={e => setRecordForm({ ...recordForm, customer: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Ramesh Patel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={recordForm.quantityKg}
                    onChange={e => setRecordForm({ ...recordForm, quantityKg: e.target.value })}
                    className="input-field"
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Shift</label>
                  <select
                    value={recordForm.shift}
                    onChange={e => setRecordForm({ ...recordForm, shift: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="morning">Morning Shift</option>
                    <option value="evening">Evening Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={recordForm.amount || (recordForm.quantityKg ? recordForm.quantityKg * 50 : '')}
                  onChange={e => setRecordForm({ ...recordForm, amount: e.target.value })}
                  className="input-field"
                  placeholder="Auto calculated at ₹50/Kg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5"
                >
                  Save Milk Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Add New Dairy Customer</h3>
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Suresh Verma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={customerForm.whatsapp}
                  onChange={e => setCustomerForm({ ...customerForm, whatsapp: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment QR Modal */}
      {showPaymentQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">UPI Payment QR Generator</h3>
            <p className="text-xs text-slate-500 mb-4">Generate instant QR code for customers to scan and pay via Google Pay / PhonePe / Paytm.</p>

            {!qrCodeData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-left">Custom Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={qrAmount}
                    onChange={e => setQrAmount(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 1500"
                  />
                </div>
                <button
                  onClick={handleGenerateQR}
                  className="w-full btn-primary text-xs py-3"
                >
                  Generate QR Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={qrCodeData.qrCodeDataUrl}
                  alt="UPI Payment QR"
                  className="w-48 h-48 mx-auto rounded-2xl p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Amount: ₹{qrCodeData.amount}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  UPI ID: {qrCodeData.upiId}
                </div>
                <button
                  onClick={() => setQrCodeData(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Back
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowPaymentQRModal(false);
                setQrCodeData(null);
              }}
              className="mt-4 text-xs text-slate-400 hover:underline"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {showPaymentSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Mark Payment Settle</h3>
            <p className="text-xs text-slate-500 mb-4">Customer: <strong className="text-sky-600">{showPaymentSettleModal.name}</strong></p>
            <div className="space-y-3 text-xs mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
              <div className="flex justify-between"><span>Total Amount:</span><span className="font-bold">₹{showPaymentSettleModal.totalAmount || 0}</span></div>
              <div className="flex justify-between"><span>Paid Amount:</span><span className="font-bold text-emerald-600">₹{showPaymentSettleModal.paidAmount || 0}</span></div>
              <div className="flex justify-between border-t pt-2"><span>Remaining Dues:</span><span className="font-bold text-rose-600">₹{Math.max(0, (showPaymentSettleModal.totalAmount || 0) - (showPaymentSettleModal.paidAmount || 0))}</span></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPaymentSettleModal(null)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
              <button
                onClick={async () => {
                  if (isAuthenticated && showPaymentSettleModal._id) {
                    try {
                      await axios.put('/api/milk-records/status', {
                        recordId: showPaymentSettleModal._id,
                        userId: localStorage.getItem('userId'),
                        status: 'paid',
                        paidAmount: showPaymentSettleModal.totalAmount
                      });
                    } catch (err) {}
                  }
                  setShowPaymentSettleModal(null);
                  refreshData();
                  alert(`Payment marked as settled for ${showPaymentSettleModal.name}!`);
                }}
                className="btn-primary text-xs py-2 px-5"
              >
                Confirm Full Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Onboarding Setup Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(data) => {
          localStorage.setItem('hasSeenOnboarding', 'true');
          if (data.upiId) setUpiId(data.upiId);
        }}
      />

      {/* Guided Tour */}
      <GuidedTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigate={setCurrentView}
      />

      {/* Global SaaS Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <MainAppContent />
    </SettingsProvider>
  );
}
