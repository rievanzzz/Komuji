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
      const eventsResponse = await fetch('http://localhost:8000/api/organizer/events', {
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
            <h1 className="text-3xl font-bold" style={{ color: '#004aad' }}>{getGreeting()}, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Kelola acara Anda dengan mudah dan pantau progress secara real-time</p>
          </div>
          <button
            onClick={() => window.location.href = '/organizer/finance'}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}
          >
            <FiDollarSign className="w-5 h-5" />
            Kelola Keuangan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border-2" style={{ borderColor: '#004aad' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Acara</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#004aad' }}>{stats.totalEvents}</p>
              <p className="text-gray-500 text-xs mt-1">Semua event</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#004aad20' }}>
              <FiCalendar className="w-6 h-6" style={{ color: '#004aad' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2" style={{ borderColor: '#5eed9c' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Peserta</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#5eed9c' }}>{stats.totalParticipants}</p>
              <p className="text-gray-500 text-xs mt-1">Terdaftar</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5eed9c20' }}>
              <FiUsers className="w-6 h-6" style={{ color: '#5eed9c' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#004aad' }}>{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-gray-500 text-xs mt-1">Revenue</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
              <FiDollarSign className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Acara Aktif</p>
              <p className="text-3xl font-bold mt-2 text-gray-900">{stats.activeEvents}</p>
              <p className="text-gray-500 text-xs mt-1">Berlangsung</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
              <FiActivity className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Event Published</h3>
            <FiCalendar className="w-5 h-5" style={{ color: '#004aad' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#004aad' }}>{stats.publishedEvents}</p>
          <p className="text-xs text-gray-500 mt-2">Event yang sudah dipublikasi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Event Draft</h3>
            <FiEdit className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.draftEvents}</p>
          <p className="text-xs text-gray-500 mt-2">Event yang belum dipublikasi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending Approval</h3>
            <FiClock className="w-5 h-5" style={{ color: '#5eed9c' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#5eed9c' }}>{stats.pendingApprovals}</p>
          <p className="text-xs text-gray-500 mt-2">Peserta menunggu persetujuan</p>
        </div>
      </div>

      {/* Event Terpopuler */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: '#004aad' }}>Event Terpopuler</h3>
          <FiTrendingUp className="w-5 h-5" style={{ color: '#5eed9c' }} />
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
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {event.judul}
                    </span>
                    <span className="text-sm font-semibold ml-4" style={{ color: '#004aad' }}>
                      {event.terdaftar || 0}/{event.kuota}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: 'linear-gradient(90deg, #004aad 0%, #5eed9c 100%)'
                      }}
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

      {/* Recent Events */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: '#004aad' }}>Event Terbaru</h3>
          <button
            onClick={() => window.location.href = '/organizer/events-card'}
            className="text-sm font-medium hover:opacity-70 transition-all"
            style={{ color: '#5eed9c' }}
          >
            Lihat Semua →
          </button>
        </div>
        <div className="space-y-3">
          {stats.recentEvents.slice(0, 5).map((event) => {
            const percentage = ((event.terdaftar || 0) / (event.kuota || 1)) * 100;
            const getStatusColor = () => {
              if (!event.is_published) return 'bg-gray-100 text-gray-700';
              if (percentage >= 90) return 'bg-red-100 text-red-700';
              if (percentage >= 70) return 'bg-yellow-100 text-yellow-700';
              return 'text-green-700';
            };

            return (
              <div key={event.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all border border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}>
                      <FiCalendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{event.judul}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />
                          {event.lokasi}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUsers className="w-3 h-3" />
                          {event.terdaftar || 0}/{event.kuota}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`} style={getStatusColor().includes('text-green') ? { backgroundColor: '#5eed9c20', color: '#5eed9c' } : {}}>
                    {!event.is_published ? 'Draft' : percentage >= 90 ? 'Penuh' : percentage >= 70 ? 'Hampir Penuh' : 'Tersedia'}
                  </span>
                </div>
              </div>
            );
          })}
          {stats.recentEvents.length === 0 && (
            <div className="text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada event</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Statistik Peserta per Bulan */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: '#004aad' }}>Peserta per Bulan</h3>
            <FiTrendingUp className="w-5 h-5" style={{ color: '#5eed9c' }} />
          </div>
          <div className="space-y-4">
            {[
              { month: 'Jan', count: 45, max: 100 },
              { month: 'Feb', count: 78, max: 100 },
              { month: 'Mar', count: 62, max: 100 },
              { month: 'Apr', count: 95, max: 100 },
              { month: 'Mei', count: 88, max: 100 },
              { month: 'Jun', count: stats.thisMonthParticipants || 0, max: 100 }
            ].map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 w-10">{data.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${(data.count / data.max) * 100}%`,
                      background: 'linear-gradient(90deg, #004aad 0%, #5eed9c 100%)'
                    }}
                  >
                    <span className="text-xs font-bold text-white">{data.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: '#004aad' }}>Status Event</h3>
            <FiActivity className="w-5 h-5" style={{ color: '#5eed9c' }} />
          </div>
          <div className="space-y-6">
            {/* Published Events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Published</span>
                <span className="text-sm font-bold" style={{ color: '#004aad' }}>{stats.publishedEvents}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalEvents > 0 ? (stats.publishedEvents / stats.totalEvents) * 100 : 0}%`,
                    backgroundColor: '#004aad'
                  }}
                ></div>
              </div>
            </div>

            {/* Draft Events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Draft</span>
                <span className="text-sm font-bold text-gray-600">{stats.draftEvents}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalEvents > 0 ? (stats.draftEvents / stats.totalEvents) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Active Events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Aktif</span>
                <span className="text-sm font-bold" style={{ color: '#5eed9c' }}>{stats.activeEvents}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.totalEvents > 0 ? (stats.activeEvents / stats.totalEvents) * 100 : 0}%`,
                    backgroundColor: '#5eed9c'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#004aad20' }}>
              <FiUsers className="w-6 h-6" style={{ color: '#004aad' }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rata-rata Peserta</p>
              <p className="text-2xl font-bold" style={{ color: '#004aad' }}>{stats.avgParticipantsPerEvent}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Per event yang dipublikasi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#5eed9c20' }}>
              <FiDollarSign className="w-6 h-6" style={{ color: '#5eed9c' }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendapatan Bulan Ini</p>
              <p className="text-2xl font-bold" style={{ color: '#5eed9c' }}>{formatCurrency(stats.thisMonthRevenue)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Total revenue bulan ini</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
              <FiClock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Menunggu persetujuan</p>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: '#004aad' }}>Pendaftaran Terbaru</h3>
          <FiUserCheck className="w-5 h-5" style={{ color: '#5eed9c' }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Peserta</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Event</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentRegistrations.slice(0, 5).map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}>
                        {reg.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reg.user.name}</p>
                        <p className="text-xs text-gray-500">{reg.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{reg.event.judul}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reg.status === 'approved' ? 'text-white' :
                      reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`} style={reg.status === 'approved' ? { backgroundColor: '#5eed9c' } : {}}>
                      {reg.status === 'approved' ? 'Disetujui' : reg.status === 'rejected' ? 'Ditolak' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentRegistrations.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pendaftaran</p>
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default Dashboard;
