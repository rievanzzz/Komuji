import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiCreditCard, FiShield } from 'react-icons/fi';

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  masked_account_number: string;
  account_holder_name: string;
  is_verified: boolean;
  is_primary: boolean;
}

const BankAccounts: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankList, setBankList] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bank_code: '',
    account_number: '',
    account_holder_name: '',
    is_primary: false
  });

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizer/bank-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.status === 'success') {
        setBankAccounts(result.data.bank_accounts);
        setBankList(result.data.bank_list);
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizer/bank-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setSuccess('Rekening bank berhasil ditambahkan! Menunggu verifikasi admin.');
        setShowAddForm(false);
        setFormData({
          bank_code: '',
          account_number: '',
          account_holder_name: '',
          is_primary: false
        });
        fetchBankAccounts();
      } else {
        setError(result.message || 'Gagal menambahkan rekening bank');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatAccountNumber = (number: string) => {
    // Format: 1234-5678-9012
    return number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekening Bank</h1>
          <p className="text-gray-600">Kelola rekening bank untuk withdrawal</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus size={16} />
          Tambah Rekening
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4"
        >
          {success}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tambah Rekening Bank</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank
                </label>
                <select
                  value={formData.bank_code}
                  onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Bank</option>
                  {Object.entries(bankList).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value.replace(/\D/g, '')})}
                  placeholder="Contoh: 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan nomor rekening tanpa spasi atau tanda baca</p>
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemegang Rekening
                </label>
                <input
                  type="text"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({...formData, account_holder_name: e.target.value.toUpperCase()})}
                  placeholder="Contoh: JOHN DOE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nama harus sesuai dengan yang tertera di rekening bank</p>
              </div>

              {/* Primary Account */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({...formData, is_primary: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">
                  Jadikan rekening utama
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-12">
            <FiCreditCard className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada rekening bank</h3>
            <p className="text-gray-600 mb-4">Tambahkan rekening bank untuk melakukan withdrawal</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tambah Rekening Pertama
            </button>
          </div>
        ) : (
          bankAccounts.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FiCreditCard className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{account.bank_name}</h3>
                      {account.is_primary && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 font-mono">{account.masked_account_number}</p>
                    <p className="text-sm text-gray-500">{account.account_holder_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {account.is_verified ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <FiCheck size={16} />
                      <span className="text-sm">Terverifikasi</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <FiShield size={16} />
                      <span className="text-sm">Menunggu Verifikasi</span>
                    </div>
                  )}
                </div>
              </div>

              {!account.is_verified && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Menunggu verifikasi admin.</strong> Rekening ini belum bisa digunakan untuk withdrawal. 
                    Admin akan memverifikasi dalam 1x24 jam.
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">Informasi Penting:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Rekening bank harus atas nama yang sama dengan akun panitia</li>
          <li>• Admin akan memverifikasi rekening dalam 1x24 jam</li>
          <li>• Hanya rekening yang terverifikasi yang bisa digunakan untuk withdrawal</li>
          <li>• Anda bisa menambahkan maksimal 3 rekening bank</li>
        </ul>
      </div>
    </div>
  );
};

export default BankAccounts;
