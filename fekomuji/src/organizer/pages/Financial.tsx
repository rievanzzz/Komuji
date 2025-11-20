import React, { useState, useEffect } from 'react';
import { FiDownload, FiDollarSign, FiTrendingUp, FiCalendar, FiCreditCard, FiCheck, FiClock, FiX, FiAlertCircle } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface EventRevenue {
  id: number;
  judul: string;
  tanggal_mulai: string;
  total_peserta: number;
  total_pendapatan: number;
  komisi_admin: number;
  pendapatan_bersih: number;
  status_withdrawal: 'available' | 'pending' | 'completed';
}

interface WithdrawalRequest {
  id: number;
  event_id: number;
  event_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface MonthlyData {
  month: string;
  year: number;
  total_events: number;
  total_revenue: number;
  total_commission: number;
  net_revenue: number;
}

const Financial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'withdrawal'>('revenue');
  const [eventRevenues, setEventRevenues] = useState<EventRevenue[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRevenue | null>(null);
  const [bankInfo, setBankInfo] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch event revenues
      const revenueResponse = await fetch('http://localhost:8000/api/organizer/financial/revenues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setEventRevenues(revenueData.data || []);
      } else {
        // Mock data untuk testing
        const mockRevenues: EventRevenue[] = [
          {
            id: 1,
            judul: 'Workshop React Advanced',
            tanggal_mulai: '2025-01-15',
            total_peserta: 50,
            total_pendapatan: 5000000,
            komisi_admin: 500000,
            pendapatan_bersih: 4500000,
            status_withdrawal: 'available'
          },
          {
            id: 2,
            judul: 'Seminar AI & Machine Learning',
            tanggal_mulai: '2025-01-20',
            total_peserta: 100,
            total_pendapatan: 10000000,
            komisi_admin: 1000000,
            pendapatan_bersih: 9000000,
            status_withdrawal: 'available'
          },
          {
            id: 3,
            judul: 'Bootcamp Web Development',
            tanggal_mulai: '2025-02-05',
            total_peserta: 30,
            total_pendapatan: 15000000,
            komisi_admin: 1500000,
            pendapatan_bersih: 13500000,
            status_withdrawal: 'pending'
          }
        ];
        setEventRevenues(mockRevenues);
      }

      // Fetch withdrawal requests
      const withdrawalResponse = await fetch('http://localhost:8000/api/organizer/financial/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (withdrawalResponse.ok) {
        const withdrawalData = await withdrawalResponse.json();
        setWithdrawalRequests(withdrawalData.data || []);
      }

      // Fetch monthly data
      const monthlyResponse = await fetch('http://localhost:8000/api/organizer/financial/monthly', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (monthlyResponse.ok) {
        const monthlyDataRes = await monthlyResponse.json();
        setMonthlyData(monthlyDataRes.data || []);
      } else {
        // Generate monthly data dari eventRevenues jika API belum ada
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const currentYear = new Date().getFullYear();
        const generatedMonthly = months.map((month, index) => ({
          month: month,
          year: currentYear,
          total_events: 0,
          total_revenue: 0,
          total_commission: 0,
          net_revenue: 0
        }));
        setMonthlyData(generatedMonthly);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Generate default monthly data
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const currentYear = new Date().getFullYear();
      const generatedMonthly = months.map((month, index) => ({
        month: month,
        year: currentYear,
        total_events: 0,
        total_revenue: 0,
        total_commission: 0,
        net_revenue: 0
      }));
      setMonthlyData(generatedMonthly);
    } finally {
      setLoading(false);
    }
  };

  const handleExportEvent = async (eventId: number, eventName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/financial/export/event/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        exportToCSV(data.data, `Laporan_${eventName.replace(/\s+/g, '_')}`);
      } else {
        // Jika API belum ada, gunakan data dari eventRevenues
        const event = eventRevenues.find(e => e.id === eventId);
        if (event) {
          const csvData = [{
            event_name: event.judul,
            date: event.tanggal_mulai,
            participants: event.total_peserta,
            total_revenue: event.total_pendapatan,
            commission: event.komisi_admin,
            net_revenue: event.pendapatan_bersih
          }];
          exportToCSV(csvData, `Laporan_${eventName.replace(/\s+/g, '_')}`);
        }
      }
    } catch (error) {
      console.error('Error exporting event data:', error);
      // Fallback: export dari data yang ada
      const event = eventRevenues.find(e => e.id === eventId);
      if (event) {
        const csvData = [{
          event_name: event.judul,
          date: event.tanggal_mulai,
          participants: event.total_peserta,
          total_revenue: event.total_pendapatan,
          commission: event.komisi_admin,
          net_revenue: event.pendapatan_bersih
        }];
        exportToCSV(csvData, `Laporan_${eventName.replace(/\s+/g, '_')}`);
      } else {
        alert('Gagal export data event');
      }
    }
  };

  const handleExportMonth = async (month: string, year: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/organizer/financial/export/month/${year}/${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        exportToCSV(data.data, `Laporan_Bulanan_${month}_${year}`);
      } else {
        // Fallback: filter event berdasarkan bulan
        const monthDate = new Date(year, parseInt(month) - 1);
        const filteredEvents = eventRevenues.filter(event => {
          const eventDate = new Date(event.tanggal_mulai);
          return eventDate.getMonth() === monthDate.getMonth() &&
                 eventDate.getFullYear() === monthDate.getFullYear();
        });

        if (filteredEvents.length > 0) {
          const csvData = filteredEvents.map(event => ({
            event_name: event.judul,
            date: event.tanggal_mulai,
            participants: event.total_peserta,
            total_revenue: event.total_pendapatan,
            commission: event.komisi_admin,
            net_revenue: event.pendapatan_bersih
          }));
          exportToCSV(csvData, `Laporan_Bulanan_${month}_${year}`);
        } else {
          alert('Tidak ada data untuk bulan ini');
        }
      }
    } catch (error) {
      console.error('Error exporting monthly data:', error);
      // Fallback
      const monthDate = new Date(year, parseInt(month) - 1);
      const filteredEvents = eventRevenues.filter(event => {
        const eventDate = new Date(event.tanggal_mulai);
        return eventDate.getMonth() === monthDate.getMonth() &&
               eventDate.getFullYear() === monthDate.getFullYear();
      });

      if (filteredEvents.length > 0) {
        const csvData = filteredEvents.map(event => ({
          event_name: event.judul,
          date: event.tanggal_mulai,
          participants: event.total_peserta,
          total_revenue: event.total_pendapatan,
          commission: event.komisi_admin,
          net_revenue: event.pendapatan_bersih
        }));
        exportToCSV(csvData, `Laporan_Bulanan_${month}_${year}`);
      } else {
        alert('Gagal export data bulanan');
      }
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    // Buat CSV dengan format yang rapi
    const csvRows = [];

    // Header dengan format yang jelas
    csvRows.push([
      'No',
      'Nama Event',
      'Tanggal',
      'Jumlah Peserta',
      'Total Pendapatan (Rp)',
      'Komisi Admin 10% (Rp)',
      'Pendapatan Bersih (Rp)'
    ].join(','));

    // Data rows
    data.forEach((item, index) => {
      const row = [
        index + 1,
        `"${item.event_name}"`,
        `"${new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}"`,
        item.participants,
        item.total_revenue.toLocaleString('id-ID'),
        item.commission.toLocaleString('id-ID'),
        item.net_revenue.toLocaleString('id-ID')
      ];
      csvRows.push(row.join(','));
    });

    // Tambahkan total di baris terakhir
    const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalCommission = data.reduce((sum, item) => sum + item.commission, 0);
    const totalNet = data.reduce((sum, item) => sum + item.net_revenue, 0);
    const totalParticipants = data.reduce((sum, item) => sum + item.participants, 0);

    csvRows.push(''); // Baris kosong
    csvRows.push([
      '',
      '"TOTAL"',
      '',
      totalParticipants,
      totalRevenue.toLocaleString('id-ID'),
      totalCommission.toLocaleString('id-ID'),
      totalNet.toLocaleString('id-ID')
    ].join(','));

    // Convert to CSV string
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Export berhasil! File: ${filename}.csv`);
  };

  const handleRequestWithdrawal = async () => {
    if (!selectedEvent) return;

    if (!bankInfo.bank_name || !bankInfo.account_number || !bankInfo.account_name) {
      alert('Mohon lengkapi informasi bank');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/organizer/financial/withdrawal/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          amount: selectedEvent.pendapatan_bersih,
          bank_name: bankInfo.bank_name,
          account_number: bankInfo.account_number,
          account_name: bankInfo.account_name
        })
      });

      if (response.ok) {
        alert('Permintaan penarikan berhasil diajukan!');
        setShowWithdrawalModal(false);
        setBankInfo({ bank_name: '', account_number: '', account_name: '' });
        fetchFinancialData();
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal mengajukan penarikan');
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      alert('Gagal mengajukan penarikan');
    }
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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <OrganizerLayout title="Keuangan">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </OrganizerLayout>
    );
  }

  const totalAvailable = eventRevenues
    .filter(e => e.status_withdrawal === 'available')
    .reduce((sum, e) => sum + e.pendapatan_bersih, 0);

  const totalPending = withdrawalRequests
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <OrganizerLayout title="Keuangan">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border-2 shadow-sm" style={{ borderColor: '#004aad' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Saldo Tersedia</h3>
            <FiDollarSign className="w-6 h-6" style={{ color: '#004aad' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#004aad' }}>{formatCurrency(totalAvailable)}</p>
          <p className="text-xs text-gray-500 mt-2">Dapat ditarik</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 shadow-sm" style={{ borderColor: '#5eed9c' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Dalam Proses</h3>
            <FiClock className="w-6 h-6" style={{ color: '#5eed9c' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#5eed9c' }}>{formatCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-2">Menunggu persetujuan</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Event</h3>
            <FiCalendar className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{eventRevenues.length}</p>
          <p className="text-xs text-gray-500 mt-2">Event dengan pendapatan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-6 py-4 font-medium transition-all relative ${
                activeTab === 'revenue' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'revenue' && (
                <div className="absolute inset-0 rounded-t-xl" style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}></div>
              )}
              <span className="relative flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5" />
                Pendapatan Event
              </span>
            </button>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className={`px-6 py-4 font-medium transition-all relative ${
                activeTab === 'withdrawal' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'withdrawal' && (
                <div className="absolute inset-0 rounded-t-xl" style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}></div>
              )}
              <span className="relative flex items-center gap-2">
                <FiCreditCard className="w-5 h-5" />
                Riwayat Penarikan
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* Export Monthly */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Export Data Bulanan</h3>
                    <p className="text-sm text-gray-600">Download laporan keuangan per bulan</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Pilih Bulan</option>
                      {monthlyData.map((m) => (
                        <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                          {m.month} {m.year}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (selectedMonth) {
                          const [year, month] = selectedMonth.split('-');
                          handleExportMonth(month, parseInt(year));
                        }
                      }}
                      disabled={!selectedMonth}
                      className="flex items-center gap-2 px-6 py-2 text-white rounded-xl font-medium transition-all disabled:opacity-50 hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}
                    >
                      <FiDownload className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Revenue Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Event</th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                      <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Peserta</th>
                      <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Komisi</th>
                      <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Bersih</th>
                      <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eventRevenues.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{event.judul}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(event.tanggal_mulai)}
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-medium text-gray-900">
                          {event.total_peserta}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">
                          {formatCurrency(event.total_pendapatan)}
                        </td>
                        <td className="py-4 px-4 text-right text-sm text-red-600">
                          -{formatCurrency(event.komisi_admin)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold" style={{ color: '#5eed9c' }}>
                          {formatCurrency(event.pendapatan_bersih)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {event.status_withdrawal === 'available' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#5eed9c' }}>
                              Tersedia
                            </span>
                          )}
                          {event.status_withdrawal === 'pending' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                          )}
                          {event.status_withdrawal === 'completed' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Selesai
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleExportEvent(event.id, event.judul)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Export Data"
                            >
                              <FiDownload className="w-4 h-4" style={{ color: '#004aad' }} />
                            </button>
                            {event.status_withdrawal === 'available' && (
                              <button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowWithdrawalModal(true);
                                }}
                                className="px-3 py-1 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-all"
                                style={{ backgroundColor: '#004aad' }}
                              >
                                Tarik
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {eventRevenues.length === 0 && (
                  <div className="text-center py-12">
                    <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data pendapatan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'withdrawal' && (
            <div className="space-y-4">
              {withdrawalRequests.map((withdrawal) => (
                <div key={withdrawal.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{withdrawal.event_name}</h3>
                        {withdrawal.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {withdrawal.status === 'approved' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1" style={{ backgroundColor: '#5eed9c' }}>
                            <FiCheck className="w-3 h-3" />
                            Disetujui
                          </span>
                        )}
                        {withdrawal.status === 'rejected' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <FiX className="w-3 h-3" />
                            Ditolak
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Jumlah Penarikan</p>
                          <p className="font-bold text-xl" style={{ color: '#004aad' }}>{formatCurrency(withdrawal.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Tanggal Pengajuan</p>
                          <p className="font-medium text-gray-900">{formatDate(withdrawal.requested_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Bank</p>
                          <p className="font-medium text-gray-900">{withdrawal.bank_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Nomor Rekening</p>
                          <p className="font-medium text-gray-900">{withdrawal.account_number}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 mb-1">Atas Nama</p>
                          <p className="font-medium text-gray-900">{withdrawal.account_name}</p>
                        </div>
                        {withdrawal.processed_at && (
                          <div className="col-span-2">
                            <p className="text-gray-600 mb-1">Diproses Pada</p>
                            <p className="font-medium text-gray-900">{formatDate(withdrawal.processed_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {withdrawalRequests.length === 0 && (
                <div className="text-center py-12">
                  <FiCreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada riwayat penarikan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#004aad' }}>Ajukan Penarikan</h3>
              <button
                onClick={() => {
                  setShowWithdrawalModal(false);
                  setBankInfo({ bank_name: '', account_number: '', account_name: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-1">Event</p>
              <p className="font-semibold text-gray-900 mb-3">{selectedEvent.judul}</p>
              <p className="text-sm text-gray-600 mb-1">Jumlah yang akan ditarik</p>
              <p className="text-2xl font-bold" style={{ color: '#5eed9c' }}>{formatCurrency(selectedEvent.pendapatan_bersih)}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Nama Bank</label>
                <input
                  type="text"
                  value={bankInfo.bank_name}
                  onChange={(e) => setBankInfo({ ...bankInfo, bank_name: e.target.value })}
                  placeholder="Contoh: BCA, Mandiri, BNI"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Nomor Rekening</label>
                <input
                  type="text"
                  value={bankInfo.account_number}
                  onChange={(e) => setBankInfo({ ...bankInfo, account_number: e.target.value })}
                  placeholder="Masukkan nomor rekening"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Atas Nama</label>
                <input
                  type="text"
                  value={bankInfo.account_name}
                  onChange={(e) => setBankInfo({ ...bankInfo, account_name: e.target.value })}
                  placeholder="Nama pemilik rekening"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    Pastikan informasi bank yang Anda masukkan sudah benar. Proses penarikan akan diverifikasi oleh admin dalam 1-3 hari kerja.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawalModal(false);
                  setBankInfo({ bank_name: '', account_number: '', account_name: '' });
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleRequestWithdrawal}
                className="flex-1 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}
              >
                Ajukan Penarikan
              </button>
            </div>
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default Financial;
