import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiCalendar, FiDollarSign, FiSearch, FiBell, FiMoreVertical, FiClock, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import OrganizerLayout from '../components/OrganizerLayout';

interface Event {
  id: number;
  judul: string;
  status: string;
  terdaftar: number;
  kuota: number;
  tanggal_mulai: string;
}

interface Registration {
  id: number;
  user: {
    name: string;
    email: string;
  };
  event: {
    judul: string;
  };
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  activeEvents: number;
  recentEvents: Event[];
  recentRegistrations: Registration[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    activeEvents: 0,
    recentEvents: [],
    recentRegistrations: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch events
      const eventsResponse = await fetch('http://localhost:8000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Fetch registrations
      const registrationsResponse = await fetch('http://localhost:8000/api/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (eventsResponse.ok && registrationsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const registrationsData = await registrationsResponse.json();
        
        // Calculate stats from real data
        const totalParticipants = registrationsData.length;
        const activeEvents = eventsData.filter((event: any) => event.status === 'published').length;
        
        setStats({
          totalEvents: eventsData.length,
          totalParticipants,
          totalRevenue: totalParticipants * 50000, // Assuming average ticket price
          activeEvents,
          recentEvents: eventsData.slice(0, 3),
          recentRegistrations: registrationsData.slice(0, 5)
        });
      } else {
        // Mock data for development
        setStats({
          totalEvents: 12,
          totalParticipants: 1247,
          totalRevenue: 25600000,
          activeEvents: 5,
          recentEvents: [
            {
              id: 1,
              judul: "Workshop React Advanced",
              status: "published",
              terdaftar: 45,
              kuota: 50,
              tanggal_mulai: "2024-01-20T09:00:00Z"
            },
            {
              id: 2,
              judul: "Seminar Digital Marketing",
              status: "published",
              terdaftar: 78,
              kuota: 100,
              tanggal_mulai: "2024-01-22T14:00:00Z"
            }
          ],
          recentRegistrations: [
            {
              id: 1,
              user: { name: "Ahmad Rizki", email: "ahmad@example.com" },
              event: { judul: "Workshop React Advanced" },
              created_at: "2024-01-15T10:30:00Z",
              status: "approved"
            },
            {
              id: 2,
              user: { name: "Sari Dewi", email: "sari@example.com" },
              event: { judul: "Seminar Digital Marketing" },
              created_at: "2024-01-15T09:15:00Z",
              status: "approved"
            },
            {
              id: 3,
              user: { name: "Budi Santoso", email: "budi@example.com" },
              event: { judul: "Training UI/UX Design" },
              created_at: "2024-01-14T16:45:00Z",
              status: "pending"
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data on error
      setStats({
        totalEvents: 12,
        totalParticipants: 1247,
        totalRevenue: 25600000,
        activeEvents: 5,
        recentEvents: [],
        recentRegistrations: []
      });
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
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (loading) {
    return (
      <OrganizerLayout title="Dashboard">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Kelola acara Anda dengan mudah dan pantau progress secara real-time
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari acara..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Acara</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+12%</span>
                  <span className="text-gray-500 text-sm ml-1">dari bulan lalu</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Peserta</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalParticipants.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+8%</span>
                  <span className="text-gray-500 text-sm ml-1">dari bulan lalu</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+15%</span>
                  <span className="text-gray-500 text-sm ml-1">dari bulan lalu</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acara Aktif</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeEvents}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+3</span>
                  <span className="text-gray-500 text-sm ml-1">acara baru</span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Progress Mingguan</h3>
              <p className="text-blue-100 mb-4">
                Anda telah menyelesaikan 6 acara minggu ini!
              </p>
              <div className="flex space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm font-medium">Event Management</span>
                  </div>
                  <p className="text-xs text-blue-100">12 lessons | 84%</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium">Participant Management</span>
                  </div>
                  <p className="text-xs text-blue-100">8 lessons | 92%</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm font-medium">Finance Tracking</span>
                  </div>
                  <p className="text-xs text-blue-100">15 lessons | 76%</p>
                </div>
              </div>
            </div>
            <button className="ml-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-2 transition-colors">
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Acara Terbaru</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  Lihat Semua
                  <FiChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentEvents.length > 0 ? (
                  stats.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiCalendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{event.judul}</h4>
                          <p className="text-sm text-gray-500">
                            {event.terdaftar}/{event.kuota} peserta • {formatDate(event.tanggal_mulai)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status === 'published' ? 'Aktif' : 'Draft'}
                        </span>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <FiMoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada acara terbaru</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Pendaftaran Terbaru</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Lihat Semua
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentRegistrations.length > 0 ? (
                  stats.recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {registration.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {registration.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {registration.event.judul}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(registration.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        registration.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registration.status === 'approved' ? 'Disetujui' : 'Pending'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada pendaftaran</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Buat Acara</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Kelola Peserta</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Laporan Keuangan</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Analitik</span>
            </button>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default Dashboard;
