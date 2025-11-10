import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiX, FiRefreshCw } from 'react-icons/fi';

const DebugRegistration: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async (email: string) => {
    setLoading(true);
    setDebugInfo(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDebugInfo({
          error: true,
          message: 'No auth token found. Please login first.',
          details: 'User not authenticated'
        });
        setLoading(false);
        return;
      }

      const testData = {
        ticket_category_id: 1,
        nama_peserta: 'Test User',
        jenis_kelamin: 'L',
        tanggal_lahir: '1990-01-01',
        email_peserta: email,
        payment_method: 'free'
      };

      console.log('🧪 Testing registration with:', testData);

      const response = await fetch('http://localhost:8000/api/events/1/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();

      setDebugInfo({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data,
        requestData: testData,
        headers: {
          'Content-Type': response.headers.get('content-type'),
          'Authorization': token ? 'Bearer ***' : 'None'
        }
      });

      console.log('🔍 Debug Response:', {
        ok: response.ok,
        status: response.status,
        data: data
      });

    } catch (error) {
      console.error('🚨 Registration test error:', error);
      setDebugInfo({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Network or parsing error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (info: any) => {
    if (info.status === 422) {
      return 'Validation Error - Check form data';
    } else if (info.status === 409) {
      return 'Conflict - Already registered with this email';
    } else if (info.status === 401) {
      return 'Unauthorized - Login required';
    } else if (info.status === 500) {
      return 'Server Error - Backend issue';
    } else if (info.data?.message) {
      return info.data.message;
    }
    return 'Unknown error';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 Debug Registration</h1>
          <p className="text-gray-600">Test registration API dan lihat response detail</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">🧪 Test Cases</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => testRegistration('test1@example.com')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="font-medium text-blue-900">Test Email 1</div>
                    <div className="text-sm text-blue-700">test1@example.com</div>
                  </div>
                  {loading ? <FiRefreshCw className="w-5 h-5 text-blue-600 animate-spin" /> : null}
                </button>

                <button
                  onClick={() => testRegistration('test2@example.com')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="font-medium text-green-900">Test Email 2</div>
                    <div className="text-sm text-green-700">test2@example.com</div>
                  </div>
                  {loading ? <FiRefreshCw className="w-5 h-5 text-green-600 animate-spin" /> : null}
                </button>

                <button
                  onClick={() => testRegistration('pchnc.co@gmail.com')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="font-medium text-orange-900">Same Email (Should Fail)</div>
                    <div className="text-sm text-orange-700">pchnc.co@gmail.com</div>
                  </div>
                  {loading ? <FiRefreshCw className="w-5 h-5 text-orange-600 animate-spin" /> : null}
                </button>

                <button
                  onClick={() => testRegistration('invalid-email')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="font-medium text-red-900">Invalid Email (Should Fail)</div>
                    <div className="text-sm text-red-700">invalid-email</div>
                  </div>
                  {loading ? <FiRefreshCw className="w-5 h-5 text-red-600 animate-spin" /> : null}
                </button>
              </div>
            </motion.div>

            {/* Auth Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Auth Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className={`font-mono ${localStorage.getItem('token') ? 'text-green-600' : 'text-red-600'}`}>
                    {localStorage.getItem('token') ? 'Present' : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Length:</span>
                  <span className="font-mono text-gray-900">
                    {localStorage.getItem('token')?.length || 0} chars
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Debug Results */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Debug Results</h2>
              
              {!debugInfo ? (
                <div className="text-center py-8 text-gray-500">
                  <FiAlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Click a test case to see debug info</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    debugInfo.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {debugInfo.success ? (
                      <FiCheckCircle className="w-5 h-5" />
                    ) : (
                      <FiX className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {debugInfo.success ? 'SUCCESS' : 'FAILED'} - Status {debugInfo.status}
                    </span>
                  </div>

                  {/* Error Message */}
                  {!debugInfo.success && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Error Message:</h4>
                      <p className="text-red-700 text-sm">{getErrorMessage(debugInfo)}</p>
                    </div>
                  )}

                  {/* Response Data */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Response Data:</h4>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(debugInfo.data, null, 2)}
                    </pre>
                  </div>

                  {/* Request Data */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Request Data:</h4>
                    <pre className="text-xs text-blue-700 overflow-x-auto">
                      {JSON.stringify(debugInfo.requestData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {debugInfo && (
                <button
                  onClick={() => setDebugInfo(null)}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Results
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 How to Use</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1.</strong> Make sure you're logged in (check Auth Status)</p>
            <p><strong>2.</strong> Click test cases to see what happens</p>
            <p><strong>3.</strong> Check the debug results for detailed error info</p>
            <p><strong>4.</strong> Use this info to fix the registration form</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DebugRegistration;
