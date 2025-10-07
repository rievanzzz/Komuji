import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiPlus, FiEdit, FiTrash2, FiEye, FiTrendingUp, FiDollarSign, FiActivity, FiAward, FiClock, FiMapPin, FiBarChart, FiUserCheck, FiAlertCircle, FiStar, FiTarget } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import OrganizerLayout from '../components/OrganizerLayout';
import { EventModal } from '../components';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  kategori_id?: number;
  harga_tiket?: number;
  created_by?: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path?: string;
  sertifikat_template_path?: string;
  is_published?: boolean;
  approval_type?: 'auto' | 'manual';
  kuota: number;
  terdaftar?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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

interface PopularEvent extends Event {
  popularity_score: number;
  registration_rate: number;
  revenue_generated: number;
}

interface RecentActivity {
  id: number;
  type: 'registration' | 'approval' | 'payment' | 'checkin';
  user_name: string;
  event_title: string;
  timestamp: string;
  status?: string;
}

interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  activeEvents: number;
  publishedEvents: number;
  draftEvents: number;
  pendingApprovals: number;
  thisMonthRevenue: number;
  thisMonthParticipants: number;
  avgParticipantsPerEvent: number;
  recentEvents: Event[];
  recentRegistrations: Registration[];
  popularEvents: PopularEvent[];
  recentActivities: RecentActivity[];
  monthlyStats: {
    month: string;
    events: number;
    participants: number;
    revenue: number;
  }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    activeEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    pendingApprovals: 0,
    thisMonthRevenue: 0,
    thisMonthParticipants: 0,
    avgParticipantsPerEvent: 0,
    recentEvents: [],
    recentRegistrations: [],
    popularEvents: [],
    recentActivities: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const handleViewEvent = (eventId: number) => {
    // Navigate to event detail page
    window.location.href = `/organizer/events/${eventId}`;
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus acara ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh data
        fetchDashboardData();
      } else {
        alert('Gagal menghapus acara');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Terjadi kesalahan saat menghapus acara');
    }
  };

  const handleSaveEvent = () => {
    // Refresh dashboard data after saving
    fetchDashboardData();
    setShowCreateModal(false);
    setEditingEvent(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
  };

  useEffect(() => {
    fetchDashboardData();
    // Timer removed to avoid unused variable warning
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch events for organizer
      const eventsResponse = await fetch('http://localhost:8000/api/events?organizer=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Fetch pending registrations for organizer
      const registrationsResponse = await fetch('http://localhost:8000/api/my-events/pending-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const registrationsData = registrationsResponse.ok ? await registrationsResponse.json() : { data: [] };
        
        // Calculate stats from real data
        const events = Array.isArray(eventsData.data) ? eventsData.data : Array.isArray(eventsData) ? eventsData : [];
        const registrations = Array.isArray(registrationsData.data) ? registrationsData.data : Array.isArray(registrationsData) ? registrationsData : [];
        
        const totalParticipants = events.reduce((sum: number, event: any) => sum + (event.terdaftar || 0), 0);
        const activeEvents = events.filter((event: any) => event.is_published === true).length;
        
        // Calculate total revenue from actual event prices
        const totalRevenue = events.reduce((sum: number, event: any) => {
          return sum + ((event.terdaftar || 0) * (event.harga_tiket || 0));
        }, 0);
        
        const publishedEvents = events.filter((e: any) => e.is_published).length;
        const draftEvents = events.length - publishedEvents;
        const avgParticipants = events.length > 0 ? Math.round(totalParticipants / events.length) : 0;
        
        // Create popular events (sorted by registration rate)
        const popularEvents = events
          .map((event: any) => ({
            ...event,
            popularity_score: (event.terdaftar || 0) / event.kuota * 100,
            registration_rate: (event.terdaftar || 0) / event.kuota * 100,
            revenue_generated: (event.harga_tiket || 0) * (event.terdaftar || 0)
          }))
          .sort((a: any, b: any) => b.popularity_score - a.popularity_score)
          .slice(0, 5);

        // Mock recent activities
        const recentActivities = [
          {
            id: 1,
            type: 'registration' as const,
            user_name: 'John Doe',
            event_title: events[0]?.judul || 'Sample Event',
            timestamp: new Date().toISOString(),
            status: 'approved'
          },
          {
            id: 2,
            type: 'approval' as const,
            user_name: 'Jane Smith',
            event_title: events[1]?.judul || 'Another Event',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'pending'
          }
        ];

        // Mock monthly stats
        const monthlyStats = [
          { month: 'Jan', events: 2, participants: 45, revenue: 2250000 },
          { month: 'Feb', events: 3, participants: 78, revenue: 3900000 },
          { month: 'Mar', events: 4, participants: 120, revenue: 6000000 }
        ];

        setStats({
          totalEvents: events.length,
          totalParticipants,
          totalRevenue,
          activeEvents,
          publishedEvents,
          draftEvents,
          pendingApprovals: 5, // Mock data
          thisMonthRevenue: totalRevenue * 0.3, // Mock: 30% of total
          thisMonthParticipants: Math.round(totalParticipants * 0.25), // Mock: 25% of total
          avgParticipantsPerEvent: avgParticipants,
          recentEvents: events.slice(0, 3),
          recentRegistrations: registrations.slice(0, 5),
          popularEvents,
          recentActivities,
          monthlyStats
        });
      } else {
        // Mock data for development
        const mockEvents = [
          {
            id: 1,
            judul: "Workshop React Advanced",
            deskripsi: "Workshop mendalam tentang React.js",
            is_published: true,
            terdaftar: 45,
            kuota: 50,
            harga_tiket: 150000,
            tanggal_mulai: "2024-02-15",
            waktu_mulai: "09:00",
            waktu_selesai: "17:00",
            lokasi: "Auditorium Utama"
          },
          {
            id: 2,
            judul: "Seminar Digital Marketing",
            deskripsi: "Strategi pemasaran digital terkini",
            is_published: true,
            terdaftar: 78,
            kuota: 100,
            harga_tiket: 75000,
            tanggal_mulai: "2024-02-20",
            waktu_mulai: "13:00",
            waktu_selesai: "16:00",
            lokasi: "Ruang Seminar A"
          },
          {
            id: 3,
            judul: "Training UI/UX Design",
            deskripsi: "Pelatihan desain UI/UX untuk pemula",
            is_published: false,
            terdaftar: 23,
            kuota: 30,
            harga_tiket: 200000,
            tanggal_mulai: "2024-02-25",
            waktu_mulai: "10:00",
            waktu_selesai: "15:00",
            lokasi: "Lab Komputer"
          }
        ];
        
        const mockTotalParticipants = mockEvents.reduce((sum, event) => sum + (event.terdaftar || 0), 0);
        const mockTotalRevenue = mockEvents.reduce((sum, event) => sum + ((event.terdaftar || 0) * (event.harga_tiket || 0)), 0);
        const mockPublishedEvents = mockEvents.filter(event => event.is_published).length;
        const mockDraftEvents = mockEvents.length - mockPublishedEvents;
        
        // Mock popular events
        const mockPopularEvents = mockEvents
          .map(event => ({
            ...event,
            popularity_score: (event.terdaftar || 0) / event.kuota * 100,
            registration_rate: (event.terdaftar || 0) / event.kuota * 100,
            revenue_generated: (event.harga_tiket || 0) * (event.terdaftar || 0)
          }))
          .sort((a, b) => b.popularity_score - a.popularity_score);

        setStats({
          totalEvents: mockEvents.length,
          totalParticipants: mockTotalParticipants,
          totalRevenue: mockTotalRevenue,
          activeEvents: mockPublishedEvents,
          publishedEvents: mockPublishedEvents,
          draftEvents: mockDraftEvents,
          pendingApprovals: 8,
          thisMonthRevenue: mockTotalRevenue * 0.4,
          thisMonthParticipants: Math.round(mockTotalParticipants * 0.3),
          avgParticipantsPerEvent: Math.round(mockTotalParticipants / mockEvents.length),
          recentEvents: mockEvents,
          popularEvents: mockPopularEvents,
          recentActivities: [
            {
              id: 1,
              type: 'registration' as const,
              user_name: 'Ahmad Rizki',
              event_title: 'Workshop React Advanced',
              timestamp: new Date().toISOString(),
              status: 'approved'
            },
            {
              id: 2,
              type: 'approval' as const,
              user_name: 'Sari Dewi',
              event_title: 'Seminar Digital Marketing',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              status: 'pending'
            }
          ],
          monthlyStats: [
            { month: 'Jan', events: 2, participants: 45, revenue: 2250000 },
            { month: 'Feb', events: 3, participants: 78, revenue: 3900000 },
            { month: 'Mar', events: 4, participants: 120, revenue: 6000000 }
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

  if (loading) {
    return (
      <OrganizerLayout title="Dashboard">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Kelola acara Anda dengan mudah dan pantau progress secara real-time</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Acara</p>
              <p className="text-3xl font-bold mt-2">{stats.totalEvents}</p>
              <p className="text-blue-100 text-xs mt-1">+2 dari bulan lalu</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Peserta</p>
              <p className="text-3xl font-bold mt-2">{stats.totalParticipants}</p>
              <p className="text-green-100 text-xs mt-1">+15% dari bulan lalu</p>
            </div>
            <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Pendapatan</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-purple-100 text-xs mt-1">+8% dari bulan lalu</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Acara Aktif</p>
              <p className="text-3xl font-bold mt-2">{stats.activeEvents}</p>
              <p className="text-orange-100 text-xs mt-1">Sedang berlangsung</p>
            </div>
            <div className="w-12 h-12 bg-orange-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <FiActivity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pendapatan Bulanan</h3>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {[
              { month: 'Jan', amount: 4200000, percentage: 60 },
              { month: 'Feb', amount: 6800000, percentage: 85 },
              { month: 'Mar', amount: 5500000, percentage: 70 },
              { month: 'Apr', amount: 8200000, percentage: 100 },
              { month: 'Mei', amount: 7100000, percentage: 90 },
              { month: 'Jun', amount: 9500000, percentage: 95 }
            ].map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-8">{data.month}</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Events Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Event Terpopuler</h3>
            <FiUsers className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {stats.recentEvents
              .sort((a, b) => (b.terdaftar || 0) - (a.terdaftar || 0))
              .slice(0, 5)
              .map((event, index) => {
                const percentage = ((event.terdaftar || 0) / (event.kuota || 1)) * 100;
                return (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {event.judul}
                      </span>
                      <span className="text-sm text-gray-600">
                        {event.terdaftar || 0}/{event.kuota}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                          'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            }
            {stats.recentEvents.length === 0 && (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Belum ada data event</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Events & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Most Popular Events */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Event Paling Rame</h3>
            <FiStar className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {stats.popularEvents.slice(0, 5).map((event, index) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
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
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FiUsers className="w-3 h-3" />
                          {event.terdaftar || 0}/{event.kuota}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />
                          {event.lokasi}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {event.registration_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Fill Rate</div>
                </div>
              </div>
            ))}
            {stats.popularEvents.length === 0 && (
              <div className="text-center py-8">
                <FiAward className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Belum ada data popularitas event</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Statistik Detail</h3>
            <FiBarChart className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Published</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.publishedEvents}</div>
                <div className="text-xs text-blue-600">Event aktif</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FiEdit className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Draft</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">{stats.draftEvents}</div>
                <div className="text-xs text-gray-600">Belum publish</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Pending</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                <div className="text-xs text-yellow-600">Perlu approval</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FiTarget className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Rata-rata</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.avgParticipantsPerEvent}</div>
                <div className="text-xs text-green-600">Peserta/event</div>
              </div>
            </div>

            {/* This Month Performance */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Performa Bulan Ini</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pendapatan</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.thisMonthRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peserta Baru</span>
                  <span className="font-semibold text-gray-900">{stats.thisMonthParticipants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tingkat Konversi</span>
                  <span className="font-semibold text-green-600">
                    {stats.totalEvents > 0 ? ((stats.totalParticipants / (stats.totalEvents * 50)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
          <FiClock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {stats.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'approval' ? 'bg-green-100 text-green-600' :
                activity.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {activity.type === 'registration' ? <FiUserCheck className="w-5 h-5" /> :
                 activity.type === 'approval' ? <FiUserCheck className="w-5 h-5" /> :
                 activity.type === 'payment' ? <FiDollarSign className="w-5 h-5" /> :
                 <FiActivity className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user_name}</span>
                  {activity.type === 'registration' && ' mendaftar ke '}
                  {activity.type === 'approval' && ' menunggu approval untuk '}
                  {activity.type === 'payment' && ' melakukan pembayaran untuk '}
                  {activity.type === 'checkin' && ' check-in ke '}
                  <span className="font-medium">{activity.event_title}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
              {activity.status && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.status}
                </span>
              )}
            </div>
          ))}
          {stats.recentActivities.length === 0 && (
            <div className="text-center py-8">
              <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Belum ada aktivitas terbaru</p>
            </div>
          )}
        </div>
      </div>

      {/* Events Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Kelola Acara</h3>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Buat Acara
            </button>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentEvents.length > 0 ? (
                stats.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.judul}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {event.terdaftar}/{event.kuota} peserta
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.tanggal_mulai)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.is_published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {event.is_published ? 'Aktif' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewEvent(event.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Acara"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Acara"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada acara. Buat acara pertama Anda!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-lg border border-gray-200 mt-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pendaftaran Terbaru</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {stats.recentRegistrations.length > 0 ? (
              stats.recentRegistrations.map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {registration.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{registration.user.name}</p>
                      <p className="text-xs text-gray-500">{registration.event.judul}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      registration.status === 'approved' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      {registration.status === 'approved' ? 'Disetujui' : 'Pending'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(registration.created_at)}</p>
                  </div>
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

      {/* Event Modal */}
      <EventModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
      />
    </OrganizerLayout>
  );
};

export default Dashboard;
