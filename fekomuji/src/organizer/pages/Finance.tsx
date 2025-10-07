import React, { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiDollarSign, FiCreditCard, FiCalendar, FiFilter } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface Transaction {
  id: string;
  event_name: string;
  participant_name: string;
  ticket_type: string;
  amount: number;
  fee: number;
  net_amount: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transaction_date: string;
  reference_id: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFinanceData();
  }, [dateFilter]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/finance?period=${dateFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setRevenueData(data.revenue_data || []);
      } else {
        // Mock data for development
        setTransactions([
          {
            id: '1',
            event_name: 'Tech Conference 2024',
            participant_name: 'John Doe',
            ticket_type: 'Early Bird',
            amount: 150000,
            fee: 7500,
            net_amount: 142500,
            payment_method: 'Credit Card',
            status: 'completed',
            transaction_date: '2024-01-15T10:30:00Z',
            reference_id: 'TXN001234567'
          },
          {
            id: '2',
            event_name: 'Tech Conference 2024',
            participant_name: 'Jane Smith',
            ticket_type: 'Regular',
            amount: 200000,
            fee: 10000,
            net_amount: 190000,
            payment_method: 'Bank Transfer',
            status: 'completed',
            transaction_date: '2024-01-14T14:20:00Z',
            reference_id: 'TXN001234568'
          },
          {
            id: '3',
            event_name: 'Workshop Design',
            participant_name: 'Bob Wilson',
            ticket_type: 'Standard',
            amount: 75000,
            fee: 3750,
            net_amount: 71250,
            payment_method: 'E-Wallet',
            status: 'pending',
            transaction_date: '2024-01-13T09:15:00Z',
            reference_id: 'TXN001234569'
          }
        ]);

        setRevenueData([
          { date: '2024-01-08', revenue: 425000, transactions: 3 },
          { date: '2024-01-09', revenue: 600000, transactions: 4 },
          { date: '2024-01-10', revenue: 350000, transactions: 2 },
          { date: '2024-01-11', revenue: 800000, transactions: 5 },
          { date: '2024-01-12', revenue: 275000, transactions: 2 },
          { date: '2024-01-13', revenue: 950000, transactions: 6 },
          { date: '2024-01-14', revenue: 1200000, transactions: 8 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // TODO: Implement report export
    console.log('Exporting financial report...');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (statusFilter === 'all') return true;
    return transaction.status === statusFilter;
  });

  // Calculate summary statistics
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.net_amount, 0);
  
  const totalFees = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.fee, 0);
  
  const totalTransactions = transactions.filter(t => t.status === 'completed').length;
  
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <OrganizerLayout title="Finance">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Finance">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600">Track revenue, transactions, and financial reports</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload size={20} />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiDollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Fees</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalFees)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiCreditCard className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiTrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(pendingAmount)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiCalendar className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2">
          {revenueData.map((data, index) => {
            const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
            const height = (data.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2">
                  <div
                    className="bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600 w-full max-w-12"
                    style={{ height: `${height}%` }}
                    title={`${formatPrice(data.revenue)} - ${data.transactions} transactions`}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 text-center">
                  {new Date(data.date).toLocaleDateString('id-ID', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter size={16} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Transaction</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Event</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Fee</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Net Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Payment Method</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.participant_name}</p>
                      <p className="text-sm text-gray-600">{transaction.ticket_type}</p>
                      <p className="text-xs text-gray-500 font-mono">{transaction.reference_id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{transaction.event_name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-900">{formatPrice(transaction.amount)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-red-600">-{formatPrice(transaction.fee)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-green-600">{formatPrice(transaction.net_amount)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{transaction.payment_method}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">{formatDate(transaction.transaction_date)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FiDollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">No transactions match your current filters.</p>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};

export default Finance;
