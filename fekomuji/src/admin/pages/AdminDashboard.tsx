import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiClock, FiCalendar, FiDollarSign, FiAward, FiBarChart, FiDownload } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface DashboardStats {
  total_panitias: number;
  pending_approvals: number;
  approved_panitias: number;
  rejected_panitias: number;
  total_events: number;
  total_participants: number;
  total_users: number;
  monthly_registrations: Record<string, number>;
  monthly_events: { month: string; events: number; participants: number }[];
  top_events: { id: number; judul: string; terdaftar: number; kuota: number; lokasi: string }[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/panitias/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Add mock data for new fields if not provided by API
        const statsData = {
          ...data.data,
          monthly_events: data.data.monthly_events || [
            { month: 'Jan', events: 5, participants: 120 },
            { month: 'Feb', events: 8, participants: 200 },
            { month: 'Mar', events: 6, participants: 150 },
            { month: 'Apr', events: 10, participants: 280 },
            { month: 'Mei', events: 7, participants: 180 },
            { month: 'Jun', events: 9, participants: 250 }
          ],
          top_events: data.data.top_events || []
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!stats) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Add header
    csvContent += 'Laporan Statistik Platform Komuji\n\n';

    // Add summary stats
    csvContent += 'Ringkasan Statistik\n';
    csvContent += `Total Panitia,${stats.total_panitias}\n`;
    csvContent += `Pending Approval,${stats.pending_approvals}\n`;
    csvContent += `Panitia Approved,${stats.approved_panitias}\n`;
    csvContent += `Total Events,${stats.total_events}\n`;
    csvContent += `Total Participants,${stats.total_participants}\n\n`;

    // Add monthly events data
    csvContent += 'Statistik Bulanan\n';
    csvContent += 'Bulan,Events,Peserta\n';
    if (stats.monthly_events) {
      stats.monthly_events.forEach(data => {
        csvContent += `${data.month},${data.events},${data.participants}\n`;
      });
    }

    csvContent += '\n';

    // Add top events
    csvContent += 'Top 10 Event\n';
    csvContent += 'Ranking,Judul,Peserta,Kuota,Lokasi\n';
    if (stats.top_events) {
      stats.top_events.slice(0, 10).forEach((event, index) => {
        csvContent += `${index + 1},${event.judul},${event.terdaftar},${event.kuota},${event.lokasi}\n`;
      });
    }

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Admin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard Admin">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang, Admin!</h1>
        <p className="text-gray-600">Kelola sistem upgrade panitia dan monitor aktivitas platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Panitia</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_panitias || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pending_approvals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiUserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Panitia Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.approved_panitias || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_events || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/panitia-approval"
              className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-center">
                <FiClock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Review Pending Requests</p>
                  <p className="text-sm text-gray-600">{stats?.pending_approvals || 0} permintaan menunggu</p>
                </div>
              </div>
              <div className="text-yellow-600">→</div>
            </a>

            <a
              href="/admin/panitias"
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <FiUsers className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Kelola Panitia</p>
                  <p className="text-sm text-gray-600">Lihat semua panitia terdaftar</p>
                </div>
              </div>
              <div className="text-blue-600">→</div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrasi Bulanan</h3>
          <div className="space-y-2">
            {stats?.monthly_registrations && Object.entries(stats.monthly_registrations).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month}</span>
                <span className="text-sm font-medium text-gray-900">{count} panitia</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Stats Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Grafik Event & Peserta Bulanan</h3>
            <FiBarChart className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {stats?.monthly_events && stats.monthly_events.length > 0 ? (
              stats.monthly_events.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-blue-600 font-semibold">{data.events} Events</span>
                      <span className="text-green-600 font-semibold">{data.participants} Peserta</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((data.events / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((data.participants / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiBarChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Belum ada data statistik bulanan</p>
              </div>
            )}
          </div>
        </div>

        {/* Top 10 Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Event dengan Peserta Terbanyak</h3>
            <FiAward className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {stats?.top_events && stats.top_events.length > 0 ? (
              stats.top_events.slice(0, 10).map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-blue-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{event.judul}</h4>
                      <p className="text-xs text-gray-500">{event.lokasi}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{event.terdaftar}</div>
                    <div className="text-xs text-gray-500">dari {event.kuota}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiAward className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Belum ada data event</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Export Data ke Excel</h3>
            <p className="text-blue-100">Download laporan lengkap statistik platform</p>
          </div>
          <button
            onClick={() => handleExportToExcel()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors shadow-lg"
          >
            <FiDownload className="w-5 h-5" />
            Export ke Excel
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
