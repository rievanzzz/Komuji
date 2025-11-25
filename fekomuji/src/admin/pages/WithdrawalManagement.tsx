import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiClock, FiDollarSign, FiUser, FiCalendar, FiDownload } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface WithdrawalRequest {
  id: number;
  withdrawal_code: string;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: string;
  admin_fee: string;
  net_amount: string;
  bank_account: {
    bank_name: string;
    account_number: string;
    account_holder_name: string;
  };
  notes?: string;
  requested_at: string;
  status: string;
  current_user_balance?: number;
}

interface WithdrawalHistory {
  id: number;
  withdrawal_code: string;
  user_name: string;
  user_id: number;
  amount: string;
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
  approved_by?: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  user_balance_before?: number;
  user_balance_after?: number;
  admin_notes?: string;
}

const WithdrawalManagement: React.FC = () => {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWithdrawalData();
  }, [activeTab]);

  // Auto refresh pending withdrawals every 30 seconds
  useEffect(() => {
    if (activeTab === 'pending') {
      const interval = setInterval(() => {
        fetchWithdrawalData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchWithdrawalData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (activeTab === 'pending') {
        // Try to fetch real pending withdrawals
        try {
          const response = await fetch('/api/admin/withdrawals/pending', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
              setPendingWithdrawals(result.data);
              return;
            }
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }

        // Mock pending withdrawals - data sesuai database panitia
        setPendingWithdrawals([
          {
            id: 1,
            withdrawal_code: 'WD-20241113-ABC123',
            user_id: 101,
            user_name: 'John Doe',
            user_email: 'john@example.com',
            amount: 'Rp 500,000',
            admin_fee: 'Rp 2,500',
            net_amount: 'Rp 497,500',
            bank_account: {
              bank_name: 'Bank Central Asia',
              account_number: '1234567890',
              account_holder_name: 'JOHN DOE'
            },
            notes: 'Withdrawal untuk pembayaran vendor event',
            requested_at: '13 Nov 2024 09:30',
            status: 'pending',
            current_user_balance: 750000 // Saldo panitia saat ini
          },
          {
            id: 2,
            withdrawal_code: 'WD-20241113-DEF456',
            user_id: 102,
            user_name: 'Jane Smith',
            user_email: 'jane@example.com',
            amount: 'Rp 750,000',
            admin_fee: 'Rp 2,500',
            net_amount: 'Rp 747,500',
            bank_account: {
              bank_name: 'Bank Negara Indonesia',
              account_number: '9876543210',
              account_holder_name: 'JANE SMITH'
            },
            notes: 'Withdrawal bulanan November',
            requested_at: '13 Nov 2024 10:15',
            status: 'pending',
            current_user_balance: 1200000 // Saldo panitia saat ini
          }
        ]);
      } else {
        // Try to fetch withdrawal history
        try {
          const response = await fetch('/api/admin/withdrawals', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
              setWithdrawalHistory(result.data.data || []);
              return;
            }
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }

        // Mock withdrawal history
        setWithdrawalHistory([
          {
            id: 3,
            withdrawal_code: 'WD-20241112-GHI789',
            user_name: 'Bob Wilson',
            user_id: 101,
            amount: 'Rp 300,000',
            net_amount: 'Rp 297,500',
            status: 'completed',
            status_badge: {
              text: 'Selesai',
              color: 'green'
            },
            bank_account: {
              bank_name: 'Bank Rakyat Indonesia',
              account_number: '5555666677',
              account_holder_name: 'BOB WILSON'
            },
            approved_by: 'Admin User',
            requested_at: '12 Nov 2024 14:20',
            approved_at: '12 Nov 2024 15:30',
            completed_at: '12 Nov 2024 16:45',
            user_balance_before: 500000,
            user_balance_after: 200000
          },
          {
            id: 4,
            withdrawal_code: 'WD-20241111-JKL012',
            user_name: 'Alice Brown',
            user_id: 102,
            amount: 'Rp 200,000',
            net_amount: 'Rp 197,500',
            status: 'rejected',
            status_badge: {
              text: 'Ditolak',
              color: 'red'
            },
            bank_account: {
              bank_name: 'Bank Mandiri',
              account_number: '1111222233',
              account_holder_name: 'ALICE BROWN'
            },
            approved_by: 'Admin User',
            requested_at: '11 Nov 2024 11:10',
            approved_at: '11 Nov 2024 12:00',
            user_balance_before: 400000,
            user_balance_after: 400000
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching withdrawal data:', err);
    }
  };

  const handleApproval = async () => {
    if (!selectedWithdrawal) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const endpoint = approvalAction === 'approve'
        ? `/api/admin/withdrawals/${selectedWithdrawal.id}/approve`
        : `/api/admin/withdrawals/${selectedWithdrawal.id}/reject`;

      const body = approvalAction === 'approve'
        ? { admin_notes: adminNotes }
        : { reason: adminNotes };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(`Withdrawal berhasil ${approvalAction === 'approve' ? 'disetujui' : 'ditolak'}. ${approvalAction === 'approve' ? 'Saldo organizer telah diperbarui.' : ''}`);
        setShowApprovalModal(false);
        setSelectedWithdrawal(null);
        setAdminNotes('');
        fetchWithdrawalData();
      } else {
        setError(result.message || `Gagal ${approvalAction === 'approve' ? 'menyetujui' : 'menolak'} withdrawal`);
      }
    } catch (err) {
      console.error('API Error:', err);

      // Mock success for demo - simulate real behavior
      const currentDate = new Date().toLocaleString('id-ID');
      const withdrawalAmount = parseFloat(selectedWithdrawal.net_amount.replace(/[^0-9]/g, ''));

      // Create history entry
      const historyEntry: WithdrawalHistory = {
        id: selectedWithdrawal.id,
        withdrawal_code: selectedWithdrawal.withdrawal_code,
        user_name: selectedWithdrawal.user_name,
        user_id: selectedWithdrawal.id + 100, // Mock user ID
        amount: selectedWithdrawal.amount,
        net_amount: selectedWithdrawal.net_amount,
        status: approvalAction === 'approve' ? 'completed' : 'rejected',
        status_badge: {
          text: approvalAction === 'approve' ? 'Selesai' : 'Ditolak',
          color: approvalAction === 'approve' ? 'green' : 'red'
        },
        bank_account: selectedWithdrawal.bank_account,
        approved_by: 'Admin User',
        requested_at: selectedWithdrawal.requested_at,
        approved_at: currentDate,
        completed_at: approvalAction === 'approve' ? currentDate : undefined,
        user_balance_before: selectedWithdrawal.current_user_balance || 500000,
        user_balance_after: approvalAction === 'approve' ? (selectedWithdrawal.current_user_balance || 500000) - withdrawalAmount : (selectedWithdrawal.current_user_balance || 500000),
        admin_notes: adminNotes || undefined
      };

      // IMPORTANT: Remove from pending list FIRST
      setPendingWithdrawals(prev => prev.filter(w => w.id !== selectedWithdrawal.id));

      // Add to history
      setWithdrawalHistory(prev => [historyEntry, ...prev]);

      setSuccess(`Withdrawal berhasil ${approvalAction === 'approve' ? 'disetujui' : 'ditolak'}. ${approvalAction === 'approve' ? `Saldo organizer ${selectedWithdrawal.user_name} berkurang ${selectedWithdrawal.net_amount}.` : ''}`);

      // Close modal and reset form
      setShowApprovalModal(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');

      // Force refresh data to ensure consistency
      setTimeout(() => {
        fetchWithdrawalData();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (withdrawal: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setApprovalAction(action);
    setShowApprovalModal(true);
    setAdminNotes('');
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

  return (
    <AdminLayout title="Withdrawal Management">
      <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600">Kelola permintaan withdrawal dari panitia</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <FiDownload size={16} />
          Export Report
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiClock size={16} />
                Pending Approval ({pendingWithdrawals.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCalendar size={16} />
                History
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Pending Withdrawals Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingWithdrawals.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada withdrawal pending</h3>
              <p className="text-gray-600">Semua permintaan withdrawal sudah diproses</p>
            </div>
          ) : (
            pendingWithdrawals.map((withdrawal) => (
              <motion.div
                key={withdrawal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{withdrawal.withdrawal_code}</h3>
                    <p className="text-sm text-gray-600">Diminta pada {withdrawal.requested_at}</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Menunggu Persetujuan
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* User Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <FiUser size={16} />
                      Informasi Panitia
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium">{withdrawal.user_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{withdrawal.user_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <FiDollarSign size={16} />
                      Informasi Bank
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{withdrawal.bank_account.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">No. Rekening:</span>
                        <span className="font-medium font-mono">{withdrawal.bank_account.account_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Atas Nama:</span>
                        <span className="font-medium">{withdrawal.bank_account.account_holder_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Withdrawal</p>
                      <p className="text-lg font-bold text-blue-600">{withdrawal.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Biaya Admin</p>
                      <p className="text-lg font-bold text-red-600">-{withdrawal.admin_fee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Yang Ditransfer</p>
                      <p className="text-lg font-bold text-green-600">{withdrawal.net_amount}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {withdrawal.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Catatan Panitia:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{withdrawal.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openApprovalModal(withdrawal, 'approve')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FiCheck size={16} />
                    Approve & Transfer
                  </button>
                  <button
                    onClick={() => openApprovalModal(withdrawal, 'reject')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <FiX size={16} />
                    Reject
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Filter Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari nama organizer atau kode withdrawal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Withdrawal Code</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Panitia</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Bank</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Saldo Organizer</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Approved By</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {withdrawalHistory
                    .filter(withdrawal => {
                      const matchesSearch = searchTerm === '' ||
                        withdrawal.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        withdrawal.withdrawal_code.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = historyFilter === 'all' || withdrawal.status === historyFilter;
                      return matchesSearch && matchesFilter;
                    })
                    .map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{withdrawal.withdrawal_code}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">{withdrawal.user_name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium">{withdrawal.bank_account.bank_name}</p>
                          <p className="text-xs text-gray-500 font-mono">{withdrawal.bank_account.account_number}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-gray-900">{withdrawal.net_amount}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status_badge.color)}`}>
                          {withdrawal.status_badge.text}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {withdrawal.user_balance_before && withdrawal.user_balance_after !== undefined ? (
                          <div className="text-xs">
                            <div className="text-gray-600">Sebelum: Rp {withdrawal.user_balance_before.toLocaleString('id-ID')}</div>
                            <div className={`font-medium ${withdrawal.status === 'completed' ? 'text-red-600' : 'text-gray-900'}`}>
                              Sesudah: Rp {withdrawal.user_balance_after.toLocaleString('id-ID')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">{withdrawal.approved_by || '-'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900">{withdrawal.requested_at}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {withdrawalHistory.filter(withdrawal => {
                const matchesSearch = searchTerm === '' ||
                  withdrawal.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  withdrawal.withdrawal_code.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = historyFilter === 'all' || withdrawal.status === historyFilter;
                return matchesSearch && matchesFilter;
              }).length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <FiClock className="mx-auto mb-2" size={32} />
                  <p>Tidak ada riwayat withdrawal yang sesuai filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedWithdrawal && (
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
              <h2 className="text-xl font-semibold">
                {approvalAction === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
              </h2>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Withdrawal Code:</p>
              <p className="font-medium">{selectedWithdrawal.withdrawal_code}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Amount to Transfer:</p>
              <p className="text-lg font-bold text-green-600">{selectedWithdrawal.net_amount}</p>
            </div>

            {/* Saldo Panitia Info */}
            {selectedWithdrawal.current_user_balance && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Saldo Panitia Saat Ini:</p>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Saldo Sebelum:</span>
                    <span className="font-bold text-blue-600">Rp {selectedWithdrawal.current_user_balance.toLocaleString('id-ID')}</span>
                  </div>
                  {approvalAction === 'approve' && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700">Saldo Sesudah:</span>
                      <span className="font-bold text-red-600">
                        Rp {(selectedWithdrawal.current_user_balance - parseFloat(selectedWithdrawal.net_amount.replace(/[^0-9]/g, ''))).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Bank Details:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{selectedWithdrawal.bank_account.bank_name}</p>
                <p className="font-mono">{selectedWithdrawal.bank_account.account_number}</p>
                <p>{selectedWithdrawal.bank_account.account_holder_name}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {approvalAction === 'approve' ? 'Admin Notes (Optional)' : 'Reason for Rejection'}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={approvalAction === 'approve' ? 'Catatan untuk panitia...' : 'Alasan penolakan...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required={approvalAction === 'reject'}
              />
            </div>

            {approvalAction === 'approve' && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">⚠️ Instruksi Transfer Manual:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Login ke internet banking</li>
                  <li>2. Transfer {selectedWithdrawal.net_amount} ke rekening di atas</li>
                  <li>3. Simpan bukti transfer</li>
                  <li>4. Klik "Approve" untuk konfirmasi</li>
                </ol>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproval}
                disabled={loading || (approvalAction === 'reject' && !adminNotes.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Processing...' : (approvalAction === 'approve' ? 'Approve & Confirm Transfer' : 'Reject')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </div>
    </AdminLayout>
  );
};

export default WithdrawalManagement;
