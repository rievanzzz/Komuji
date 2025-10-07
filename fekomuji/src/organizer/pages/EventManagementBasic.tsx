import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';

interface Event {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  lokasi: string;
  kuota: number;
  terdaftar?: number;
  is_published?: boolean;
}

const EventManagementBasic: React.FC = () => {
  console.log('EventManagementBasic rendering...');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      setLoading(true);
      setError(null);
      
      // Simulate API call with mock data
      setTimeout(() => {
        const mockEvents: Event[] = [
          {
            id: 1,
            judul: "Workshop React Advanced",
            deskripsi: "Workshop mendalam tentang React.js untuk developer berpengalaman",
            is_published: true,
            terdaftar: 45,
            kuota: 50,
            tanggal_mulai: "2024-02-15",
            lokasi: "Auditorium Utama"
          },
          {
            id: 2,
            judul: "Seminar Digital Marketing",
            deskripsi: "Strategi pemasaran digital terkini untuk bisnis modern",
            is_published: false,
            terdaftar: 0,
            kuota: 100,
            tanggal_mulai: "2024-02-20",
            lokasi: "Ruang Seminar A"
          }
        ];
        setEvents(mockEvents);
        setLoading(false);
        console.log('Mock events loaded:', mockEvents);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (is_published?: boolean) => {
    const isPublished = is_published === true;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {isPublished ? 'Aktif' : 'Draft'}
      </span>
    );
  };

  console.log('Rendering EventManagementBasic, events:', events, 'loading:', loading, 'error:', error);

  return (
    <OrganizerLayout title="Event Management">
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                <p className="text-gray-600 mt-2">Create, manage, and track your events</p>
              </div>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FiPlus className="w-5 h-5" />
                Create Event
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{events.filter(e => e.is_published).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{events.reduce((sum, e) => sum + (e.terdaftar || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Events</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchEvents}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : events.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {events.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.judul}</h3>
                          {getStatusBadge(event.is_published)}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{event.deskripsi}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(event.tanggal_mulai)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{event.lokasi}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            <span>{event.terdaftar || 0}/{event.kuota} peserta</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Acara"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Acara"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada acara</h3>
                <p className="text-gray-500 mb-6">Mulai dengan membuat acara pertama Anda</p>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Buat Acara Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default EventManagementBasic;
