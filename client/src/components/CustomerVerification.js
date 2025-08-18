import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerVerification = ({ customerId, onVerificationSuccess, onBack }) => {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {
    // Fetch customer info to show name
    const fetchCustomerInfo = async () => {
      try {
        const response = await axios.get(`/api/customers/${customerId}`);
        setCustomerInfo(response.data);
      } catch (error) {
        console.error('Error fetching customer info:', error);
      }
    };
    fetchCustomerInfo();
  }, [customerId]);

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`/api/customers/${customerId}/verify`, {
        whatsapp: whatsapp
      });

      if (response.data.success) {
        onVerificationSuccess(response.data.customer);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed. Please check your WhatsApp number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h2>
          {customerInfo && (
            <p className="text-gray-600 mb-4">
              Welcome, <span className="font-semibold text-blue-600">{customerInfo.name}</span>!
            </p>
          )}
          <p className="text-sm text-gray-500">
            Please enter your WhatsApp number to access your milk records
          </p>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter your WhatsApp number"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 10-digit WhatsApp number registered with your milk supplier
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify & View Records'
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">How it works</h4>
              <p className="text-xs text-blue-700">
                Enter the same WhatsApp number that your milk supplier uses to contact you. 
                This ensures only you can access your personal milk records and payment status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerVerification;
