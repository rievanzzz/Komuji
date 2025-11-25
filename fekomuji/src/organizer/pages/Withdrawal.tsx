import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiClock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  masked_account_number: string;
  account_holder_name: string;
  is_verified: boolean;
  is_primary: boolean;
}

interface WithdrawalHistory {
  id: number;
  withdrawal_code: string;
  amount: string;
  admin_fee: string;
  net_amount: string;
  status: string;
  status_badge: {
    text: string;
    color: string;
  };
  bank_account: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
  };
  notes?: string;
  admin_notes?: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
}

interface WithdrawalSummary {
  current_balance: number;
  available_balance: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  total_requests: number;
  ticket_sales_revenue: number;
  platform_fee_deducted: number;
  withdrawal_settings: {
    minimum_amount: number;
    admin_fee: number;
    processing_time: string;
  };
}

const Withdrawal: React.FC = () => {
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    bank_account_id: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchWithdrawalSummary();
    fetchBankAccounts();
    fetchWithdrawalHistory();
  }, []);

  const fetchWithdrawalSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizer/withdrawal-summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.status === 'success') {
        setSummary(result.data);
      } else {
        // Mock data untuk demo
        setSummary({
          current_balance: 750000,
          available_balance: 750000,
          total_withdrawn: 250000,
          pending_withdrawals: 100000,
          total_requests: 5,
          ticket_sales_revenue: 1000000,
          platform_fee_deducted: 50000,
          withdrawal_settings: {
            minimum_amount: 50000,
            admin_fee: 2500,
            processing_time: '1-3 hari kerja'
          }
        });
      }
    } catch (err) {
      console.error('Error fetching withdrawal summary:', err);
      // Mock data untuk demo
      setSummary({
        current_balance: 750000,
        available_balance: 750000,
        total_withdrawn: 250000,
        pending_withdrawals: 100000,
        total_requests: 5,
        ticket_sales_revenue: 1000000,
        platform_fee_deducted: 50000,
        withdrawal_settings: {
          minimum_amount: 50000,
          admin_fee: 2500,
          processing_time: '1-3 hari kerja'
        }
      });
    }
  };

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
        setBankAccounts(result.data.bank_accounts.filter((acc: BankAccount) => acc.is_verified));
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizer/withdrawals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.status === 'success') {
        setWithdrawalHistory(result.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizer/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bank_account_id: parseInt(formData.bank_account_id),
          amount: parseFloat(formData.amount),
          notes: formData.notes
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(`Permintaan withdrawal berhasil dibuat dengan kode: ${result.data.withdrawal_code}`);
        setShowRequestForm(false);
        setFormData({
          bank_account_id: '',
          amount: '',
          notes: ''
        });
        fetchWithdrawalSummary();
        fetchWithdrawalHistory();
      } else {
        setError(result.message || 'Gagal membuat permintaan withdrawal');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  if (!summary) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal</h1>
          <p className="text-gray-600">Tarik saldo ke rekening bank</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          disabled={bankAccounts.length === 0 || summary.current_balance < summary.withdrawal_settings.minimum_amount}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title={summary.current_balance < summary.withdrawal_settings.minimum_amount ? `Saldo minimum ${formatCurrency(summary.withdrawal_settings.minimum_amount)} untuk withdrawal` : ''}
        >
          <FiDollarSign size={16} />
          Request Withdrawal
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

      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pendapatan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Penjualan Tiket</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.ticket_sales_revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Biaya Platform</p>
            <p className="text-xl font-bold text-red-600">-{formatCurrency(summary.platform_fee_deducted)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Saldo Bersih</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.current_balance)}</p>
            <p className="text-xs text-gray-500 mt-1">Maksimal yang bisa ditarik</p>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FiDollarSign className="text-blue-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-900">Saldo Tersedia</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.current_balance)}</p>
          <p className="text-xs text-gray-500 mt-1">Dari hasil penjualan tiket</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FiCheck className="text-green-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-900">Total Ditarik</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_withdrawn)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <FiClock className="text-yellow-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-900">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.pending_withdrawals)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FiAlertCircle className="text-purple-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-900">Total Request</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{summary.total_requests}</p>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
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
              <h2 className="text-xl font-semibold">Request Withdrawal</h2>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rekening Tujuan
                </label>
                <select
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({...formData, bank_account_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Pilih Rekening</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} - {account.masked_account_number} ({account.account_holder_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Withdrawal
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder={`Minimal ${formatCurrency(summary.withdrawal_settings.minimum_amount)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  min={summary.withdrawal_settings.minimum_amount}
                  max={summary.current_balance}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min: {formatCurrency(summary.withdrawal_settings.minimum_amount)}</span>
                  <span>Max: {formatCurrency(summary.current_balance)}</span>
                </div>
              </div>

              {/* Fee Information */}
              {formData.amount && parseFloat(formData.amount) >= summary.withdrawal_settings.minimum_amount && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Jumlah Withdrawal:</span>
                    <span>{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Biaya Admin:</span>
                    <span>-{formatCurrency(summary.withdrawal_settings.admin_fee)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Yang Diterima:</span>
                    <span className="text-green-600">
                      {formatCurrency(parseFloat(formData.amount) - summary.withdrawal_settings.admin_fee)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Catatan untuk admin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              {/* Processing Time Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Waktu Proses:</strong> {summary.withdrawal_settings.processing_time}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  ⚠️ Saldo hanya dari hasil penjualan tiket event Anda
                </p>
              </div>

              {/* Balance Validation Warning */}
              {parseFloat(formData.amount) > summary.current_balance && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Jumlah melebihi saldo tersedia!</strong>
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Saldo maksimal yang bisa ditarik: {formatCurrency(summary.current_balance)}
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Withdrawal History */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Withdrawal</h2>

        {withdrawalHistory.length === 0 ? (
          <div className="text-center py-8">
            <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat withdrawal</h3>
            <p className="text-gray-600">Riwayat withdrawal Anda akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawalHistory.map((withdrawal) => (
              <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{withdrawal.withdrawal_code}</h4>
                    <p className="text-sm text-gray-600">{withdrawal.requested_at}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status_badge.color)}`}>
                    {withdrawal.status_badge.text}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Bank Tujuan:</p>
                    <p className="font-medium">{withdrawal.bank_account.bank_name}</p>
                    <p className="text-sm text-gray-600">{withdrawal.bank_account.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jumlah:</p>
                    <p className="font-medium">{withdrawal.amount}</p>
                    <p className="text-sm text-gray-600">Diterima: {withdrawal.net_amount}</p>
                  </div>
                </div>

                {withdrawal.notes && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Catatan:</p>
                    <p className="text-sm">{withdrawal.notes}</p>
                  </div>
                )}

                {withdrawal.admin_notes && (
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-600">Catatan Admin:</p>
                    <p className="text-sm">{withdrawal.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      {bankAccounts.length === 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertCircle className="text-yellow-600" size={20} />
            <h4 className="font-medium text-yellow-900">Rekening Bank Diperlukan</h4>
          </div>
          <p className="text-sm text-yellow-800 mb-3">
            Anda perlu menambahkan dan memverifikasi rekening bank terlebih dahulu sebelum dapat melakukan withdrawal.
          </p>
          <button
            onClick={() => window.location.href = '/organizer/bank-accounts'}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
          >
            Tambah Rekening Bank
          </button>
        </div>
      )}
    </div>
  );
};

export default Withdrawal;
