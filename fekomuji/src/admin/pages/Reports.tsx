import React, { useState, useEffect } from 'react';
import { FiBarChart, FiTrendingUp, FiUsers, FiCalendar, FiDownload, FiPieChart } from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';

interface ReportStats {
  total_events: number;
  total_users: number;
  total_organizers: number;
  total_revenue: number;
  monthly_growth: number;
  event_categories: { name: string; count: number; percentage: number }[];
  monthly_data: { month: string; events: number; revenue: number; users: number }[];
  top_organizers: { name: string; events: number; revenue: number }[];
  recent_activities: { type: string; description: string; date: string }[];
}

const Reports: React.FC = () => {
  const [stats, setStats] = useState<ReportStats>({
    total_events: 0,
    total_users: 0,
    total_organizers: 0,
    total_revenue: 0,
    monthly_growth: 0,
    event_categories: [],
    monthly_data: [],
    top_organizers: [],
    recent_activities: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('12');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/reports?type=${reportType}&months=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data untuk development
        setStats({
          total_events: 156,
          total_users: 2847,
          total_organizers: 89,
          total_revenue: 45750000,
          monthly_growth: 18.5,
          event_categories: [
            { name: 'Technology', count: 45, percentage: 28.8 },
            { name: 'Business', count: 32, percentage: 20.5 },
            { name: 'Education', count: 28, percentage: 17.9 },
            { name: 'Entertainment', count: 25, percentage: 16.0 },
            { name: 'Health', count: 15, percentage: 9.6 },
            { name: 'Others', count: 11, percentage: 7.1 }
          ],
          monthly_data: [
            { month: 'Jan', events: 12, revenue: 3200000, users: 145 },
            { month: 'Feb', events: 15, revenue: 4100000, users: 189 },
            { month: 'Mar', events: 18, revenue: 4800000, users: 234 },
            { month: 'Apr', events: 14, revenue: 3900000, users: 198 },
            { month: 'May', events: 22, revenue: 5600000, users: 287 },
            { month: 'Jun', events: 19, revenue: 5100000, users: 256 },
            { month: 'Jul', events: 25, revenue: 6200000, users: 312 },
            { month: 'Aug', events: 21, revenue: 5800000, users: 289 },
            { month: 'Sep', events: 28, revenue: 7100000, users: 345 },
            { month: 'Oct', events: 24, revenue: 6400000, users: 298 },
            { month: 'Nov', events: 18, revenue: 4900000, users: 234 },
            { month: 'Dec', events: 20, revenue: 5200000, users: 267 }
          ],
          top_organizers: [
            { name: 'Tech Events Indonesia', events: 12, revenue: 8500000 },
            { name: 'Business Summit Org', events: 8, revenue: 6200000 },
            { name: 'Education Hub', events: 10, revenue: 4800000 },
            { name: 'Creative Workshop', events: 6, revenue: 3900000 },
            { name: 'Health & Wellness', events: 5, revenue: 2700000 }
          ],
          recent_activities: [
            { type: 'event_created', description: 'New event "AI Workshop 2024" created by Tech Events Indonesia', date: '2024-11-12T10:30:00Z' },
            { type: 'organizer_approved', description: 'New organizer "Digital Marketing Pro" approved', date: '2024-11-12T09:15:00Z' },
            { type: 'payment_completed', description: 'Payment of Rp 500,000 completed for "Business Conference"', date: '2024-11-12T08:45:00Z' },
            { type: 'user_registered', description: '15 new users registered today', date: '2024-11-12T08:00:00Z' },
            { type: 'event_published', description: 'Event "Design Thinking Workshop" published', date: '2024-11-11T16:20:00Z' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event_created':
        return '📅';
      case 'organizer_approved':
        return '✅';
      case 'payment_completed':
        return '💰';
      case 'user_registered':
        return '👥';
      case 'event_published':
        return '🚀';
      default:
        return '📊';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h1>
            <p className="text-gray-600">Monitor performa platform dan analisis data</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Overview</option>
              <option value="revenue">Revenue</option>
              <option value="events">Events</option>
              <option value="users">Users</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3">3 Bulan Terakhir</option>
              <option value="6">6 Bulan Terakhir</option>
              <option value="12">12 Bulan Terakhir</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiDownload className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_events}</p>
                <p className="text-xs text-green-600">+{stats.monthly_growth}% dari bulan lalu</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.3% dari bulan lalu</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiBarChart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Organizers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_organizers}</p>
                <p className="text-xs text-green-600">+8.7% dari bulan lalu</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_revenue)}
                </p>
                <p className="text-xs text-green-600">+15.2% dari bulan lalu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tren Bulanan</h3>
              <FiBarChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.monthly_data.slice(-6).map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-900">{data.events} events</div>
                        <div className="text-sm text-green-600">{formatCurrency(data.revenue)}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(data.events / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{data.users} users</div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Categories */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Kategori Event</h3>
              <FiPieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.event_categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'yellow', 'red', 'gray'][index]}-500`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{category.count}</span>
                    <span className="text-xs text-gray-500">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Organizers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Organizers</h3>
            <div className="space-y-4">
              {stats.top_organizers.map((organizer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{organizer.name}</div>
                      <div className="text-xs text-gray-500">{organizer.events} events</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    {formatCurrency(organizer.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-4">
              {stats.recent_activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-lg">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Revenue</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_revenue * 0.05)}
              </div>
              <div className="text-sm text-gray-600">Komisi Platform (5%)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.total_revenue * 0.95)}
              </div>
              <div className="text-sm text-gray-600">Revenue ke Organizer (95%)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.total_revenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Laporan</h3>
              <p className="text-gray-600 mt-1">
                Download laporan dalam berbagai format untuk analisis lebih lanjut
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Export Excel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Export PDF
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
