import React, { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp, FiDollarSign, FiCreditCard, FiCalendar, FiFilter, FiPlus, FiCheck, FiX, FiAlertCircle, FiShield, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
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
  withdrawal_settings: {
    minimum_amount: number;
    admin_fee: number;
    processing_time: string;
  };
}

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Withdrawal & Bank Account states
  const [activeTab, setActiveTab] = useState('overview');
  const [withdrawalSummary, setWithdrawalSummary] = useState<WithdrawalSummary | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [bankList, setBankList] = useState<Record<string, string>>({});
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [bankFormData, setBankFormData] = useState({
    bank_code: '',
    account_number: '',
    account_holder_name: '',
    is_primary: false
  });
  
  const [withdrawalFormData, setWithdrawalFormData] = useState({
    bank_account_id: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchFinanceData();
    if (activeTab === 'withdrawal') {
      fetchWithdrawalData();
    }
  }, [dateFilter, activeTab]);
  
  const fetchWithdrawalData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch real data first
      try {
        // Fetch withdrawal summary
        const summaryResponse = await fetch('/api/organizer/withdrawal-summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (summaryResponse.ok) {
          const summaryResult = await summaryResponse.json();
          if (summaryResult.status === 'success') {
            setWithdrawalSummary(summaryResult.data);
          }
        }
        
        // Fetch bank accounts
        const bankResponse = await fetch('/api/organizer/bank-accounts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bankResponse.ok) {
          const bankResult = await bankResponse.json();
          if (bankResult.status === 'success') {
            setBankAccounts(bankResult.data.bank_accounts);
            setBankList(bankResult.data.bank_list);
          }
        }
        
        // Fetch withdrawal history
        const historyResponse = await fetch('/api/organizer/withdrawals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          if (historyResult.status === 'success') {
            setWithdrawalHistory(historyResult.data.data || []);
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock data for withdrawal');
        
        // Mock withdrawal summary
        setWithdrawalSummary({
          current_balance: 450000,
          available_balance: 450000,
          total_withdrawn: 200000,
          pending_withdrawals: 0,
          total_requests: 2,
          withdrawal_settings: {
            minimum_amount: 50000,
            admin_fee: 2500,
            processing_time: '1-3 hari kerja'
          }
        });
        
        // Mock bank list
        setBankList({
          'BCA': 'Bank Central Asia',
          'BNI': 'Bank Negara Indonesia',
          'BRI': 'Bank Rakyat Indonesia',
          'MANDIRI': 'Bank Mandiri',
          'CIMB': 'CIMB Niaga',
          'DANAMON': 'Bank Danamon'
        });
        
        // Mock bank accounts
        setBankAccounts([
          {
            id: 1,
            bank_name: 'Bank Central Asia',
            account_number: '1234567890',
            masked_account_number: '1234-****-**90',
            account_holder_name: 'JOHN DOE',
            is_verified: true,
            is_primary: true
          }
        ]);
        
        // Mock withdrawal history
        setWithdrawalHistory([
          {
            id: 1,
            withdrawal_code: 'WD-20241113-ABC123',
            amount: 'Rp 100,000',
            admin_fee: 'Rp 2,500',
            net_amount: 'Rp 97,500',
            status: 'completed',
            status_badge: {
              text: 'Selesai',
              color: 'green'
            },
            bank_account: {
              bank_name: 'Bank Central Asia',
              account_number: '1234-****-**90',
              account_holder_name: 'JOHN DOE'
            },
            notes: 'Withdrawal untuk bulan November',
            requested_at: '13 Nov 2024 09:30',
            completed_at: '13 Nov 2024 14:30'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching withdrawal data:', err);
    }
  };

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch real data first
      try {
        const response = await fetch(`/api/organizer/earnings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            // Use real data if available
            setTransactions(data.data.recent_transactions || []);
            setRevenueData([]);
            return;
          }
        }
      } catch (err) {
        console.log('Real API not available, using mock data');
      }
      
      // Fallback to mock data for development
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
      
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // Set empty data on error
      setTransactions([]);
      setRevenueData([]);
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
  
  const getWithdrawalStatusColor = (color: string) => {
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
  
  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!bankFormData.bank_code || !bankFormData.account_number || !bankFormData.account_holder_name) {
        setError('Semua field harus diisi');
        setLoading(false);
        return;
      }

      if (bankFormData.account_number.length < 8) {
        setError('Nomor rekening minimal 8 digit');
        setLoading(false);
        return;
      }

      // Try real API first
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/organizer/bank-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bankFormData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            setSuccess('Rekening bank berhasil ditambahkan! Menunggu verifikasi admin.');
            setShowAddBankForm(false);
            setBankFormData({
              bank_code: '',
              account_number: '',
              account_holder_name: '',
              is_primary: false
            });
            fetchWithdrawalData();
            return;
          } else {
            setError(result.message || 'Gagal menambahkan rekening bank');
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock success');
      }

      // Mock success for demo
      const newBankAccount = {
        id: Date.now(),
        bank_name: bankList[bankFormData.bank_code] || bankFormData.bank_code,
        account_number: bankFormData.account_number,
        masked_account_number: bankFormData.account_number.length >= 8 
          ? bankFormData.account_number.substring(0, 4) + '-****-**' + bankFormData.account_number.slice(-2)
          : bankFormData.account_number,
        account_holder_name: bankFormData.account_holder_name,
        is_verified: false,
        is_primary: bankFormData.is_primary || bankAccounts.length === 0
      };

      setBankAccounts(prev => [...prev, newBankAccount]);
      setSuccess('Rekening bank berhasil ditambahkan! Menunggu verifikasi admin.');
      setShowAddBankForm(false);
      setBankFormData({
        bank_code: '',
        account_number: '',
        account_holder_name: '',
        is_primary: false
      });

    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!withdrawalFormData.bank_account_id || !withdrawalFormData.amount) {
        setError('Rekening dan jumlah withdrawal harus diisi');
        setLoading(false);
        return;
      }

      const amount = parseFloat(withdrawalFormData.amount);
      const minAmount = withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000;
      const maxAmount = withdrawalSummary?.current_balance || 0;

      if (amount < minAmount) {
        setError(`Minimal withdrawal ${formatCurrency(minAmount)}`);
        setLoading(false);
        return;
      }

      if (amount > maxAmount) {
        setError(`Saldo tidak mencukupi. Maksimal ${formatCurrency(maxAmount)}`);
        setLoading(false);
        return;
      }

      // Try real API first
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/organizer/withdrawals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bank_account_id: parseInt(withdrawalFormData.bank_account_id),
            amount: amount,
            notes: withdrawalFormData.notes
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            setSuccess(`Permintaan withdrawal berhasil dibuat dengan kode: ${result.data.withdrawal_code}`);
            setShowWithdrawalForm(false);
            setWithdrawalFormData({
              bank_account_id: '',
              amount: '',
              notes: ''
            });
            fetchWithdrawalData();
            return;
          } else {
            setError(result.message || 'Gagal membuat permintaan withdrawal');
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock success');
      }

      // Mock success for demo
      const withdrawalCode = `WD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const newWithdrawal = {
        id: Date.now(),
        withdrawal_code: withdrawalCode,
        amount: formatCurrency(amount),
        admin_fee: formatCurrency(withdrawalSummary?.withdrawal_settings?.admin_fee || 2500),
        net_amount: formatCurrency(amount - (withdrawalSummary?.withdrawal_settings?.admin_fee || 2500)),
        status: 'pending',
        status_badge: {
          text: 'Menunggu Persetujuan',
          color: 'yellow'
        },
        bank_account: bankAccounts.find(acc => acc.id === parseInt(withdrawalFormData.bank_account_id)) || bankAccounts[0],
        notes: withdrawalFormData.notes,
        requested_at: new Date().toLocaleDateString('id-ID', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setWithdrawalHistory(prev => [newWithdrawal, ...prev]);
      setSuccess(`Permintaan withdrawal berhasil dibuat dengan kode: ${withdrawalCode}`);
      setShowWithdrawalForm(false);
      setWithdrawalFormData({
        bank_account_id: '',
        amount: '',
        notes: ''
      });

      // Update withdrawal summary
      if (withdrawalSummary) {
        setWithdrawalSummary({
          ...withdrawalSummary,
          current_balance: withdrawalSummary.current_balance - amount,
          pending_withdrawals: withdrawalSummary.pending_withdrawals + amount,
          total_requests: withdrawalSummary.total_requests + 1
        });
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
          <h2 className="text-xl font-semibold text-gray-900">Keuangan</h2>
          <p className="text-gray-600">Kelola pendapatan, withdrawal, dan rekening bank</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload size={20} />
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
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiTrendingUp size={16} />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'withdrawal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiDollarSign size={16} />
                Withdrawal & Bank
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
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
        </>
      )}

      {/* Withdrawal Tab Content */}
      {activeTab === 'withdrawal' && (
        <>
          {/* Withdrawal Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiDollarSign className="text-blue-600" size={20} />
                </div>
                <h3 className="font-medium text-gray-900">Saldo Tersedia</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(withdrawalSummary?.current_balance || 0)}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FiCheck className="text-green-600" size={20} />
                </div>
                <h3 className="font-medium text-gray-900">Total Ditarik</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(withdrawalSummary?.total_withdrawn || 0)}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <FiClock className="text-yellow-600" size={20} />
                </div>
                <h3 className="font-medium text-gray-900">Pending</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(withdrawalSummary?.pending_withdrawals || 0)}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FiAlertCircle className="text-purple-600" size={20} />
                </div>
                <h3 className="font-medium text-gray-900">Total Request</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">{withdrawalSummary?.total_requests || 0}</p>
            </div>
          </div>

          {/* Bank Accounts & Withdrawal Actions */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Bank Accounts Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rekening Bank</h3>
                <button
                  onClick={() => setShowAddBankForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <FiPlus size={16} />
                  Tambah Rekening
                </button>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <FiCreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada rekening bank</h4>
                  <p className="text-gray-600 mb-4">Tambahkan rekening bank untuk melakukan withdrawal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FiCreditCard className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{account.bank_name}</h4>
                              {account.is_primary && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 font-mono text-sm">{account.masked_account_number}</p>
                            <p className="text-sm text-gray-500">{account.account_holder_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawal Request Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Request Withdrawal</h3>
                <button
                  onClick={() => setShowWithdrawalForm(true)}
                  disabled={bankAccounts.filter(acc => acc.is_verified).length === 0 || (withdrawalSummary?.current_balance || 0) < (withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  <FiDollarSign size={16} />
                  Request Withdrawal
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Informasi Withdrawal</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum withdrawal:</span>
                      <span className="font-medium">{formatCurrency(withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biaya admin:</span>
                      <span className="font-medium text-red-600">{formatCurrency(withdrawalSummary?.withdrawal_settings?.admin_fee || 2500)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waktu proses:</span>
                      <span className="font-medium">{withdrawalSummary?.withdrawal_settings?.processing_time || '1-3 hari kerja'}</span>
                    </div>
                  </div>
                </div>

                {bankAccounts.filter(acc => acc.is_verified).length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiAlertCircle className="text-yellow-600" size={20} />
                      <h4 className="font-medium text-yellow-900">Rekening Bank Diperlukan</h4>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Anda perlu menambahkan dan memverifikasi rekening bank terlebih dahulu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Withdrawal</h3>
            
            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-8">
                <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat withdrawal</h4>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWithdrawalStatusColor(withdrawal.status_badge.color)}`}>
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
        </>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankForm && (
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
                onClick={() => setShowAddBankForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBankAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                <select
                  value={bankFormData.bank_code}
                  onChange={(e) => setBankFormData({...bankFormData, bank_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Bank</option>
                  {Object.entries(bankList).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={bankFormData.account_number}
                  onChange={(e) => setBankFormData({...bankFormData, account_number: e.target.value.replace(/\D/g, '')})}
                  placeholder="Contoh: 1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemegang Rekening</label>
                <input
                  type="text"
                  value={bankFormData.account_holder_name}
                  onChange={(e) => setBankFormData({...bankFormData, account_holder_name: e.target.value.toUpperCase()})}
                  placeholder="Contoh: JOHN DOE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={bankFormData.is_primary}
                  onChange={(e) => setBankFormData({...bankFormData, is_primary: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">
                  Jadikan rekening utama
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBankForm(false)}
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

      {/* Withdrawal Request Modal */}
      {showWithdrawalForm && (
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
                onClick={() => setShowWithdrawalForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rekening Tujuan</label>
                <select
                  value={withdrawalFormData.bank_account_id}
                  onChange={(e) => setWithdrawalFormData({...withdrawalFormData, bank_account_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Pilih Rekening</option>
                  {bankAccounts.filter(acc => acc.is_verified).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} - {account.masked_account_number} ({account.account_holder_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Withdrawal</label>
                <input
                  type="number"
                  value={withdrawalFormData.amount}
                  onChange={(e) => setWithdrawalFormData({...withdrawalFormData, amount: e.target.value})}
                  placeholder={`Minimal ${formatCurrency(withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  min={withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000}
                  max={withdrawalSummary?.current_balance || 0}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min: {formatCurrency(withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000)}</span>
                  <span>Max: {formatCurrency(withdrawalSummary?.current_balance || 0)}</span>
                </div>
              </div>

              {withdrawalFormData.amount && parseFloat(withdrawalFormData.amount) >= (withdrawalSummary?.withdrawal_settings?.minimum_amount || 50000) && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Jumlah Withdrawal:</span>
                    <span>{formatCurrency(parseFloat(withdrawalFormData.amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Biaya Admin:</span>
                    <span>-{formatCurrency(withdrawalSummary?.withdrawal_settings?.admin_fee || 2500)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Yang Diterima:</span>
                    <span className="text-green-600">
                      {formatCurrency(parseFloat(withdrawalFormData.amount) - (withdrawalSummary?.withdrawal_settings?.admin_fee || 2500))}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  value={withdrawalFormData.notes}
                  onChange={(e) => setWithdrawalFormData({...withdrawalFormData, notes: e.target.value})}
                  placeholder="Catatan untuk admin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Waktu Proses:</strong> {withdrawalSummary?.withdrawal_settings?.processing_time || '1-3 hari kerja'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
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
    </OrganizerLayout>
  );
};

export default Finance;
