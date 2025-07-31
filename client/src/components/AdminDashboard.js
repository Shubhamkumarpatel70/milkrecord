import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ onLogout, onOpenSettings }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [milkRecords, setMilkRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    totalMilkQuantity: 0
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', mobile: '', mpin: '', upiId: '', isActive: true });
  const [message, setMessage] = useState('');

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await axios.get('/api/admin/users');
      setUsers(usersRes.data);

      // Fetch customers
      const customersRes = await axios.get('/api/admin/customers');
      setCustomers(customersRes.data);

      // Fetch milk records
      const recordsRes = await axios.get('/api/admin/milk-records');
      setMilkRecords(recordsRes.data);

      // Calculate stats
      const totalAmount = recordsRes.data.reduce((sum, record) => sum + (record.amount || 0), 0);
      const totalMilkQuantity = recordsRes.data.reduce((sum, record) => sum + (record.quantityKg || 0), 0);

      setStats({
        totalUsers: usersRes.data.length,
        totalCustomers: customersRes.data.length,
        totalTransactions: recordsRes.data.length,
        totalAmount: totalAmount,
        totalMilkQuantity: totalMilkQuantity
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setMessage('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      mobile: user.mobile,
      mpin: user.mpin || '',
      upiId: user.paymentOptions?.upiId || '',
      isActive: user.isActive !== false
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/admin/users/${selectedUser._id}`, editForm);
      setMessage('User updated successfully!');
      setShowEditUserModal(false);
      fetchAllData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/toggle-status`, {
        isActive: !currentStatus
      });
      setMessage(`User ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
      fetchAllData(); // Refresh data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setMessage('User deleted successfully!');
        fetchAllData(); // Refresh data
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage users, customers, and transactions</p>
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
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 0a4 4 0 01-8 0m8 0v3a4 4 0 01-8 0V7m8 0a4 4 0 00-8 0" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Milk Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMilkQuantity.toFixed(2)} kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Users
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Customers
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Transactions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h4>
                    <div className="space-y-3">
                      {users.slice(0, 5).map(user => (
                        <div key={user._id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.mobile}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h4>
                    <div className="space-y-3">
                      {milkRecords.slice(0, 5).map(record => (
                        <div key={record._id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{record.customer}</p>
                            <p className="text-sm text-gray-600">{new Date(record.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">₹{record.amount}</p>
                            <p className="text-sm text-gray-600">{record.quantityKg} kg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Manage Users</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-600">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.role || 'user'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.mobile}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.paymentOptions?.upiId || 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive !== false)}
                              className={`${
                                user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.isActive !== false ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">All Customers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map(customer => (
                        <tr key={customer._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-600">{customer.name.charAt(0).toUpperCase()}</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.whatsapp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.user?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">All Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {milkRecords.map(record => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.quantityKg} kg</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{record.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.user?.name || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
            {message}
            <button 
              onClick={() => setMessage('')}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
                <button onClick={() => setShowEditUserModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                  ×
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">MPIN</label>
                  <input
                    type="text"
                    value={editForm.mpin}
                    onChange={(e) => setEditForm({...editForm, mpin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={editForm.upiId}
                    onChange={(e) => setEditForm({...editForm, upiId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="username@bank"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    User is active
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditUserModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 