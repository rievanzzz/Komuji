import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';

const TestScenario: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testMultipleRegistration = () => {
    addResult('🧪 TESTING: Multiple Registration dengan 1 Akun');
    addResult('✅ EXPECTED: 1 akun bisa daftar multiple kali dengan email berbeda');
    addResult('📝 CARA TEST:');
    addResult('   1. Login dengan 1 akun (misal: user@test.com)');
    addResult('   2. Daftar event dengan email: teman1@test.com');
    addResult('   3. Daftar event lagi dengan email: teman2@test.com');
    addResult('   4. Cek console untuk 2 email berbeda');
    addResult('   5. Kedua registrasi harus berhasil');
  };

  const testEmailFlow = () => {
    addResult('🧪 TESTING: Email Flow');
    addResult('✅ EXPECTED: Email dikirim ke email yang diisi saat registrasi');
    addResult('📝 CARA TEST:');
    addResult('   1. Daftar event dengan email: test@example.com');
    addResult('   2. Cek browser console untuk email content');
    addResult('   3. Email harus berisi: token, QR code, event details');
    addResult('   4. Recipient email harus: test@example.com');
  };

  const testCheckInFlow = () => {
    addResult('🧪 TESTING: Check-in Flow');
    addResult('✅ EXPECTED: Check-in berdasarkan token, bukan user login');
    addResult('📝 CARA TEST:');
    addResult('   1. Ambil token dari email registrasi');
    addResult('   2. Buka /events/1/checkin');
    addResult('   3. Input token dari email');
    addResult('   4. Harus berhasil check-in');
    addResult('   5. Token berbeda harus bisa check-in terpisah');
  };

  const testAttendanceTracking = () => {
    addResult('🧪 TESTING: Attendance Tracking');
    addResult('✅ EXPECTED: Setiap token check-in tercatat terpisah');
    addResult('📝 CARA TEST:');
    addResult('   1. Registrasi 2x dengan email berbeda');
    addResult('   2. Dapat 2 token berbeda');
    addResult('   3. Check-in dengan token pertama');
    addResult('   4. Check-in dengan token kedua');
    addResult('   5. Kedua attendance harus tercatat terpisah');
  };

  const runAllTests = () => {
    setTestResults([]);
    addResult('🚀 STARTING COMPREHENSIVE TEST...');
    addResult('');
    
    setTimeout(() => testMultipleRegistration(), 500);
    setTimeout(() => addResult(''), 1000);
    setTimeout(() => testEmailFlow(), 1500);
    setTimeout(() => addResult(''), 2000);
    setTimeout(() => testCheckInFlow(), 2500);
    setTimeout(() => addResult(''), 3000);
    setTimeout(() => testAttendanceTracking(), 3500);
    setTimeout(() => {
      addResult('');
      addResult('🎯 TEST COMPLETED!');
      addResult('📊 SUMMARY: Semua flow sudah siap untuk testing');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Test Scenario Lengkap</h1>
          <p className="text-gray-600">Test semua flow dari registrasi sampai check-in</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Test Scenarios</h2>
              
              <div className="space-y-3">
                <button
                  onClick={testMultipleRegistration}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <FiUsers className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Multiple Registration</div>
                    <div className="text-sm text-blue-700">1 akun daftar untuk beberapa orang</div>
                  </div>
                </button>

                <button
                  onClick={testEmailFlow}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                >
                  <FiMail className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">Email Flow</div>
                    <div className="text-sm text-green-700">Email dikirim ke alamat yang diisi</div>
                  </div>
                </button>

                <button
                  onClick={testCheckInFlow}
                  className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                >
                  <FiCheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900">Check-in Flow</div>
                    <div className="text-sm text-purple-700">Check-in berdasarkan token</div>
                  </div>
                </button>

                <button
                  onClick={testAttendanceTracking}
                  className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
                >
                  <FiClock className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-900">Attendance Tracking</div>
                    <div className="text-sm text-orange-700">Tracking kehadiran per token</div>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={runAllTests}
                  className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  🚀 Run All Tests
                </button>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Quick Test Links</h3>
              <div className="space-y-2">
                <a
                  href="/events/1/book"
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Registration
                </a>
                <a
                  href="/events/1/checkin"
                  className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Test Check-in
                </a>
                <a
                  href="/history/events"
                  className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Test Event History
                </a>
                <a
                  href="/test-features"
                  className="block w-full text-center bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Test Features
                </a>
              </div>
            </motion.div>
          </div>

          {/* Test Results */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Test Results</h2>
              
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    Click a test scenario to see results...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`text-sm font-mono ${
                          result.includes('🧪') ? 'text-yellow-400' :
                          result.includes('✅') ? 'text-green-400' :
                          result.includes('📝') ? 'text-blue-400' :
                          result.includes('🎯') ? 'text-purple-400' :
                          result.includes('📊') ? 'text-cyan-400' :
                          'text-gray-300'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {testResults.length > 0 && (
                <button
                  onClick={() => setTestResults([])}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Results
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Expected Behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-green-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Expected Behavior</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">Registration:</h4>
              <ul className="space-y-1">
                <li>• 1 akun bisa daftar multiple kali</li>
                <li>• Email dikirim ke alamat yang diisi</li>
                <li>• Setiap registrasi dapat token unik</li>
                <li>• QR code berisi token dan event data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Check-in:</h4>
              <ul className="space-y-1">
                <li>• Check-in berdasarkan token, bukan user</li>
                <li>• Setiap token bisa check-in terpisah</li>
                <li>• Attendance tracking per registrasi</li>
                <li>• Success notification setelah check-in</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestScenario;
