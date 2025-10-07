import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiCalendar, FiUsers, FiMapPin, FiImage, FiTrendingUp, FiGrid, FiList } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';
import { EventModal } from '../components';

// Debug logging
console.log('EventManagement component loading...');

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

const EventManagement: React.FC = () => {
  console.log('EventManagement component rendering...');
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'exists' : 'not found');
      
      const response = await fetch('http://localhost:8000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Events data received:', data);
        setEvents(data);
      } else {
        console.log('API failed, using mock data');
        // Mock data for development
        const mockEvents = [
          {
            id: 1,
            judul: "Workshop React Advanced",
            deskripsi: "Workshop mendalam tentang React.js untuk developer berpengalaman",
            is_published: true,
            terdaftar: 45,
            kuota: 50,
            harga_tiket: 0,
            approval_type: 'auto' as const,
            tanggal_mulai: "2024-02-15",
            tanggal_selesai: "2024-02-15",
            waktu_mulai: "09:00",
            waktu_selesai: "17:00",
            lokasi: "Auditorium Utama"
          },
          {
            id: 2,
            judul: "Seminar Digital Marketing",
            deskripsi: "Strategi pemasaran digital terkini untuk bisnis modern",
            is_published: false,
            terdaftar: 0,
            kuota: 100,
            harga_tiket: 50000,
            approval_type: 'manual' as const,
            tanggal_mulai: "2024-02-20",
            tanggal_selesai: "2024-02-20",
            waktu_mulai: "13:00",
            waktu_selesai: "16:00",
            lokasi: "Ruang Seminar A"
          }
        ];
        setEvents(mockEvents);
        console.log('Mock events set:', mockEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
      // Still set mock data on error
      setEvents([
        {
          id: 1,
          judul: "Workshop React Advanced",
          deskripsi: "Workshop mendalam tentang React.js untuk developer berpengalaman",
          is_published: true,
          terdaftar: 45,
          kuota: 50,
          harga_tiket: 0,
          approval_type: 'auto' as const,
          tanggal_mulai: "2024-02-15",
          tanggal_selesai: "2024-02-15",
          waktu_mulai: "09:00",
          waktu_selesai: "17:00",
          lokasi: "Auditorium Utama"
        }
      ]);
    } finally {
      setLoading(false);
      console.log('Fetch events completed');
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowCreateModal(true);
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
        fetchEvents();
      } else {
        alert('Gagal menghapus acara');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Terjadi kesalahan saat menghapus acara');
    }
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/organizer/events/${eventId}`);
  };

  const handleSaveEvent = async (eventData: any) => {
    console.log('handleSaveEvent called with:', eventData);
    try {
      // Refresh the events list
      await fetchEvents();
      // Close modal
      setShowCreateModal(false);
      setEditingEvent(null);
      console.log('Event saved successfully, modal closed');
    } catch (error) {
      console.error('Error in handleSaveEvent:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && event.is_published) ||
                         (statusFilter === 'draft' && !event.is_published);
    return matchesSearch && matchesStatus;
  });

  console.log('Rendering EventManagement, events:', events, 'loading:', loading, 'error:', error);
  
  // Error state
  if (error && events.length === 0) {
    return (
      <OrganizerLayout title="Kelola Acara">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Events</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Kelola Acara">
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                <p className="text-gray-600 mt-2">Create, manage, and track your events</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleCreateEvent}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Events</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{events.filter(e => !e.is_published).length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <FiImage className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="lg:w-64">
                <div className="relative">
                  <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Active</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
          ) : filteredEvents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada acara</h3>
              <p className="text-gray-500 mb-6">Mulai dengan membuat acara pertama Anda</p>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Buat Acara Baru
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showCreateModal && (
        <EventModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          editingEvent={editingEvent}
        />
      )}
    </OrganizerLayout>
  );
};

export default EventManagement;
