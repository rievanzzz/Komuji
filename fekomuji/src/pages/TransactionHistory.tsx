import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface Transaction {
  id: number;
  user_id: number;
  event_id: number;
  registration_id: number;
  amount: number;
  payment_method: 'FREE' | 'BANK_TRANSFER' | 'E_WALLET' | 'CREDIT_CARD';
  payment_status: 'paid' | 'pending' | 'failed' | 'cancelled';
  transaction_code: string;
  payment_proof?: string;
  created_at: string;
  updated_at: string;
  event: {
    id: number;
    judul: string;
    deskripsi: string;
    tanggal_mulai: string;
    lokasi: string;
    flyer_path?: string;
  };
  registration: {
    id: number;
    kode_pendaftaran: string;
    status: 'approved' | 'pending' | 'rejected';
  };
}

const TransactionHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactionHistory();
    }
  }, [isAuthenticated]);

  const fetchTransactionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/user/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setTransactions([]);
      } else {
        // API error, show empty state
        console.log('API error:', response.status);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'failed': return <FiXCircle className="w-4 h-4" />;
      case 'cancelled': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Berhasil';
      case 'pending': return 'Menunggu';
      case 'failed': return 'Gagal';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Unknown';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'FREE': return 'Gratis';
      case 'BANK_TRANSFER': return 'Transfer Bank';
      case 'E_WALLET': return 'E-Wallet';
      case 'CREDIT_CARD': return 'Kartu Kredit';
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.payment_status === filter;
    const matchesSearch = transaction.event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.transaction_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat riwayat transaksi Anda.</p>
            <a
              href="/signin"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Sekarang
            </a>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat transaksi...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaksi</h1>
            <p className="text-gray-600">Kelola riwayat transaksi dan pembayaran Anda</p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama event"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Transaction' },
                { key: 'paid', label: 'Berhasil' },
                { key: 'pending', label: 'Menunggu' },
                { key: 'failed', label: 'Gagal' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Transaction List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 3) }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    {/* Event Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={transaction.event.flyer_path || '/images/default-event.jpg'}
                        alt={transaction.event.judul}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw4NyA2MEw4MSA1NEw4NyA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {transaction.event.judul}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiCreditCard className="w-4 h-4" />
                          {getPaymentMethodText(transaction.payment_method)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Kode: {transaction.transaction_code}
                      </div>
                    </div>

                    {/* Amount and Status */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.payment_status)}`}>
                          {getStatusIcon(transaction.payment_status)}
                          {getStatusText(transaction.payment_status)}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <FiCreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Transaksi</h3>
              <p className="text-gray-500 mb-6">Anda belum melakukan transaksi apapun</p>
              <a
                href="/events"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Jelajahi Event
              </a>
            </motion.div>
          )}
        </div>
      </div>

      <PublicFooter />

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detail Transaksi</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Image & Title */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Event</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedTransaction.event.flyer_path ? `http://localhost:8000${selectedTransaction.event.flyer_path}` : '/images/default-event.svg'}
                      alt={selectedTransaction.event.judul}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-event.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{selectedTransaction.event.judul}</div>
                    <div className="text-sm text-gray-600">{selectedTransaction.event.lokasi}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Kode Transaksi</label>
                <div className="font-mono text-lg font-bold text-blue-600">{selectedTransaction.transaction_code}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Jumlah</label>
                  <div className="font-bold text-gray-900 text-lg">
                    {formatCurrency(selectedTransaction.amount)}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.payment_status)}`}>
                    {getStatusIcon(selectedTransaction.payment_status)}
                    {getStatusText(selectedTransaction.payment_status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Metode Pembayaran</label>
                <div className="font-medium text-gray-900">{getPaymentMethodText(selectedTransaction.payment_method)}</div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Tanggal Transaksi</label>
                <div className="font-medium text-gray-900">
                  {new Date(selectedTransaction.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Kode Registrasi</label>
                <div className="font-mono text-gray-900">{selectedTransaction.registration.kode_pendaftaran}</div>
              </div>

              {selectedTransaction.payment_proof && (
                <div>
                  <label className="text-sm text-gray-500">Bukti Pembayaran</label>
                  <div className="mt-2">
                    <img 
                      src={`http://localhost:8000${selectedTransaction.payment_proof}`}
                      alt="Bukti Pembayaran"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw4NyA2MEw4MSA1NEw4NyA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedTransaction.payment_status === 'paid' && (
                <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Download Invoice
                </button>
              )}
              {selectedTransaction.payment_status === 'pending' && (
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Bayar Sekarang
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
