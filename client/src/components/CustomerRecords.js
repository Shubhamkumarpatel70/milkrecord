import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerRecords = ({ customer, onLogout }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth, customer]);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/customers/${customer._id}/records?month=${selectedMonth}`);
      setRecords(response.data);
    } catch (error) {
      setError('Failed to load records. Please try again.');
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to build a calendar grid for the month
  const renderCalendar = (days) => {
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
  };

  // Helper to format month as 'Month YYYY'
  const formatMonth = (ym) => {
    const [year, month] = ym.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
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

  const totalAmount = records?.summary?.totalAmount || 0;
  const totalPaid = records?.summary?.totalPaid || 0;
  const remainingAmount = totalAmount - totalPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {customer.name}!</h1>
              <p className="text-gray-600">Your milk records and payment status</p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
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
            <button
              onClick={fetchRecords}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Records Display */}
        {error ? (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button
                onClick={fetchRecords}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : records ? (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Milk Records - {formatMonth(selectedMonth)}
            </h3>
            
            {records.summary.totalDays === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">
                  No records found for {formatMonth(selectedMonth)}
                </div>
                <div className="text-sm text-gray-400">
                  Contact your milk supplier if you believe this is incorrect
                </div>
              </div>
            ) : (
              <>
                {renderCalendar(records.days)}
                <div className="flex justify-between items-center mt-4 px-2">
                  <div className="text-lg font-semibold text-gray-700">
                    Total Days: <span className="text-blue-700">{records.summary.totalDays}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-700">
                    Total Amount: <span className="text-green-700">₹{records.summary.totalAmount}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 text-center">
                  <span className="inline-block mr-4">✓ = Paid</span>
                  <span className="inline-block mr-4">○ = Unpaid</span>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerRecords;
