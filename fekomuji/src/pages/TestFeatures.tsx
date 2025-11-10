import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';
import { generateToken, generateQRData } from '../utils/tokenGenerator';
import { generateQRCode } from '../utils/qrGenerator';
import { sendRegistrationEmail, type RegistrationEmailData } from '../utils/emailService';

const TestFeatures: React.FC = () => {
  const [emailResult, setEmailResult] = useState<string>('');
  const [tokenResult, setTokenResult] = useState<string>('');
  const [qrResult, setQrResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEmailSystem = async () => {
    setLoading(true);
    setEmailResult('Sending test email...');
    
    try {
      // Generate test data
      const token = generateToken();
      const qrData = generateQRData(token, 1, 1);
      const qrImage = await generateQRCode(qrData, 200);
      
      const testEmailData: RegistrationEmailData = {
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        eventTitle: 'Test Event - Webinar React',
        eventDate: '25 Oktober 2025',
        eventTime: '14:00 - 16:00',
        eventLocation: 'Online via Zoom',
        token: token,
        qrCodeImage: qrImage,
        registrationCode: 'REG-TEST-001'
      };
      
      const success = await sendRegistrationEmail(testEmailData);
      
      if (success) {
        setEmailResult('✅ Email sent successfully! Check console for email content.');
      } else {
        setEmailResult('❌ Email failed to send. Check console for details.');
      }
      
    } catch (error) {
      setEmailResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTokenGeneration = () => {
    const token = generateToken();
    setTokenResult(`Generated Token: ${token}`);
  };

  const testQRGeneration = async () => {
    try {
      const token = generateToken();
      const qrData = generateQRData(token, 1, 1);
      const qrImage = await generateQRCode(qrData, 200);
      setQrResult(qrImage);
    } catch (error) {
      console.error('QR Generation error:', error);
    }
  };

  const testCheckInFlow = () => {
    // Simulate check-in process
    console.log('🔍 Testing Check-in Flow:');
    console.log('1. User navigates to /events/1/checkin');
    console.log('2. User inputs token or uploads QR');
    console.log('3. System validates token');
    console.log('4. Check-in success/failure response');
    
    alert('Check-in flow test logged to console. Open DevTools to see details.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Test Features</h1>
          <p className="text-gray-600">Test email system, token generation, QR codes, and check-in flow</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiMail className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Email System</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Test email sending with registration confirmation template
            </p>
            <button
              onClick={testEmailSystem}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Test Email System'}
            </button>
            {emailResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{emailResult}</p>
              </div>
            )}
          </motion.div>

          {/* Token Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiUser className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Token Generation</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Generate 10-digit alphanumeric token for check-in
            </p>
            <button
              onClick={testTokenGeneration}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Generate Token
            </button>
            {tokenResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono text-gray-700">{tokenResult}</p>
              </div>
            )}
          </motion.div>

          {/* QR Code Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiCheckCircle className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">QR Code Generation</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Generate QR code containing token and event data
            </p>
            <button
              onClick={testQRGeneration}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Generate QR Code
            </button>
            {qrResult && (
              <div className="mt-4 text-center">
                <img src={qrResult} alt="Generated QR Code" className="mx-auto border rounded-lg" />
                <p className="text-xs text-gray-500 mt-2">QR Code generated successfully</p>
              </div>
            )}
          </motion.div>

          {/* Check-in Flow Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <FiClock className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Check-in Flow</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Test the complete check-in process flow
            </p>
            <button
              onClick={testCheckInFlow}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Test Check-in Flow
            </button>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Testing Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Email Test:</strong> Check browser console for email content (since backend may not be configured)</p>
            <p><strong>Token Test:</strong> Generates a random 10-digit token for check-in</p>
            <p><strong>QR Test:</strong> Creates a visual QR code containing token data</p>
            <p><strong>Check-in Test:</strong> Navigate to <code className="bg-blue-100 px-1 rounded">/events/1/checkin</code> to test the check-in page</p>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center space-x-4"
        >
          <a
            href="/events/1/checkin"
            className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Test Check-in Page
          </a>
          <a
            href="/history/events"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Test Event History
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default TestFeatures;
