import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiDownload, FiFilter, FiSearch, FiEye } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface Transaction {
  id: string;
  event_id: string;
  event_title: string;
  organizer_name: string;
  participant_name: string;
  amount: number;
  commission: number;
  net_amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
}

interface RevenueStats {
  total_revenue: number;
  total_commission: number;
  monthly_revenue: number;
  monthly_commission: number;
  growth_percentage: number;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<RevenueStats>({
    total_revenue: 0,
    total_commission: 0,
    monthly_revenue: 0,
    monthly_commission: 0,
    growth_percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(5);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchCommissionRate();
  }, [dateRange]);

  const fetchCommissionRate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        const rate = parseFloat(s.platform_fee_percentage ?? s.commission_rate ?? 5);
        if (!Number.isNaN(rate)) setCommissionRate(rate);
      }
    } catch {}
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Use real transactions endpoint
      const response = await fetch(`http://localhost:8000/api/admin/transactions?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const payload = data.data || data; // paginator or direct
        const rows = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        const mapped: Transaction[] = rows.map((t: any) => ({
          id: String(t.id),
          event_id: String(t.event?.id || ''),
          event_title: t.event?.judul || (t.type === 'premium_subscription' ? 'Premium Upgrade' : '-'),
          organizer_name: t.panitia?.name || '-',
          participant_name: t.user?.name || '-',
          amount: Number(t.gross_amount) || 0,
          commission: Number(t.platform_fee) || 0,
          net_amount: Number(t.net_amount) || 0,
          status: t.status === 'paid' ? 'completed' : (t.status || 'pending'),
          payment_method: t.payment_method || '-',
          created_at: t.created_at
        }));
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use real revenue dashboard
      const response = await fetch(`http://localhost:8000/api/admin/revenue-dashboard?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const res = await response.json();
        const s = res.data?.summary || {};
        setStats({
          total_revenue: s.total_revenue || 0,
          total_commission: s.monthly_revenue ? s.monthly_revenue : (s.total_revenue ? s.total_revenue * (commissionRate/100) : 0),
          monthly_revenue: s.monthly_revenue || 0,
          monthly_commission: s.monthly_revenue ? s.monthly_revenue * (commissionRate/100) : 0,
          growth_percentage: 0
        });
      } else {
        // Mock stats untuk development
        setStats({
          total_revenue: 15750000,
          total_commission: 787500,
          monthly_revenue: 5250000,
          monthly_commission: 262500,
          growth_percentage: 12.5
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status === filter;
    const matchesSearch = transaction.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.participant_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaksi & Keuangan</h1>
            <p className="text-gray-600">Kelola transaksi dan monitor pemasukan platform</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
              <option value="365">1 Tahun Terakhir</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiDownload className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_revenue)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_commission)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiCreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.monthly_revenue)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{stats.growth_percentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sistem Komisi Platform</h3>
              <p className="text-gray-600 mt-1">
                Platform mengambil komisi {commissionRate}% dari setiap transaksi event yang berhasil
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Komisi Rate</p>
              <p className="text-2xl font-bold text-blue-600">{commissionRate}%</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event & Peserta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komisi ({commissionRate}%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data transaksi
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.event_title}</div>
                          <div className="text-sm text-gray-500">{transaction.participant_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.organizer_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(transaction.commission)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(transaction.net_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {showModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Transaksi</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Event</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.event_title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organizer</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.organizer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peserta</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.participant_name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Komisi Platform (5%)</label>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedTransaction.commission)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">Net Amount (ke Organizer)</label>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedTransaction.net_amount)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.payment_method}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedTransaction.created_at)}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export { Transactions };
