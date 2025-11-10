import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCheckCircle, FiUsers, FiArrowRight } from 'react-icons/fi';

const TestMultipleRegistration: React.FC = () => {
  const [step, setStep] = useState(1);
  const [registrations, setRegistrations] = useState<any[]>([]);

  const simulateRegistration = (email: string, name: string) => {
    const newReg = {
      id: Date.now(),
      email,
      name,
      token: Math.random().toString(36).substring(2, 12).toUpperCase(),
      timestamp: new Date().toLocaleTimeString()
    };
    setRegistrations(prev => [...prev, newReg]);
    return newReg;
  };

  const testStep1 = () => {
    const reg1 = simulateRegistration('teman1@example.com', 'Teman Pertama');
    console.log('📧 Email 1 sent to:', reg1.email);
    console.log('🎫 Token 1:', reg1.token);
    setStep(2);
  };

  const testStep2 = () => {
    const reg2 = simulateRegistration('teman2@example.com', 'Teman Kedua');
    console.log('📧 Email 2 sent to:', reg2.email);
    console.log('🎫 Token 2:', reg2.token);
    setStep(3);
  };

  const testStep3 = () => {
    const reg3 = simulateRegistration('keluarga@example.com', 'Anggota Keluarga');
    console.log('📧 Email 3 sent to:', reg3.email);
    console.log('🎫 Token 3:', reg3.token);
    setStep(4);
  };

  const resetTest = () => {
    setRegistrations([]);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Test Multiple Registration</h1>
          <p className="text-gray-600">Simulasi 1 akun daftar multiple kali dengan email berbeda</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Steps */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Test Steps</h2>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                  step >= 1 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Registrasi Pertama</div>
                    <div className="text-sm text-gray-600">Email: teman1@example.com</div>
                  </div>
                  {step === 1 && (
                    <button
                      onClick={testStep1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Daftar
                    </button>
                  )}
                </div>

                {/* Step 2 */}
                <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                  step >= 2 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > 2 ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Registrasi Kedua</div>
                    <div className="text-sm text-gray-600">Email: teman2@example.com</div>
                  </div>
                  {step === 2 && (
                    <button
                      onClick={testStep2}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Daftar Lagi
                    </button>
                  )}
                </div>

                {/* Step 3 */}
                <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                  step >= 3 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > 3 ? 'bg-green-500 text-white' : step === 3 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > 3 ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Registrasi Ketiga</div>
                    <div className="text-sm text-gray-600">Email: keluarga@example.com</div>
                  </div>
                  {step === 3 && (
                    <button
                      onClick={testStep3}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Daftar Lagi
                    </button>
                  )}
                </div>
              </div>

              {step === 4 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-center">
                    <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Test Completed!</h3>
                    <p className="text-green-700 text-sm mb-4">
                      Berhasil! 1 akun bisa daftar {registrations.length} kali dengan email berbeda
                    </p>
                    <button
                      onClick={resetTest}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Reset Test
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Real Test Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 Real Test Instructions</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>1.</strong> Login dengan 1 akun (misal: user@test.com)</p>
                <p><strong>2.</strong> Buka halaman event detail</p>
                <p><strong>3.</strong> Klik "Register Free" - isi dengan email: teman1@example.com</p>
                <p><strong>4.</strong> Kembali ke event detail, klik "Register Free" lagi</p>
                <p><strong>5.</strong> Isi dengan email: teman2@example.com</p>
                <p><strong>6.</strong> Cek browser console untuk melihat 2 email berbeda</p>
              </div>
            </motion.div>
          </div>

          {/* Registration Results */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Registration Results</h2>
              
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No registrations yet...</p>
                  <p className="text-sm">Start the test to see results</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg, index) => (
                    <motion.div
                      key={reg.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-green-900">{reg.name}</div>
                          <div className="text-sm text-green-700">{reg.email}</div>
                        </div>
                      </div>
                      <div className="ml-11 space-y-1">
                        <div className="text-xs text-green-600">
                          <strong>Token:</strong> <code className="bg-green-100 px-1 rounded">{reg.token}</code>
                        </div>
                        <div className="text-xs text-green-600">
                          <strong>Time:</strong> {reg.timestamp}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {registrations.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Summary:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Total Registrations: <strong>{registrations.length}</strong></li>
                      <li>• Unique Emails: <strong>{new Set(registrations.map(r => r.email)).size}</strong></li>
                      <li>• Unique Tokens: <strong>{new Set(registrations.map(r => r.token)).size}</strong></li>
                      <li>• Same User Account: <strong>1</strong></li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center space-x-4"
        >
          <a
            href="/events/1"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Real Registration
            <FiArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/test-scenario"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Test Scenario
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default TestMultipleRegistration;
