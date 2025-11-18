import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiUsers, FiCalendar, FiMapPin, FiClock, FiDollarSign, FiEye, FiEyeOff, FiDownload, FiSettings } from 'react-icons/fi';
import OrganizerLayout from '../components/OrganizerLayout';
import { EventModal } from '../components';

interface EventDetailData {
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
  full_flyer_path?: string;
  full_template_path?: string;
  category?: any;
  registrations_count?: number;
  approved_registrations_count?: number;
  pending_registrations_count?: number;
}

const OrganizerEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const eventData = result.data || result;
        setEvent(eventData);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch event details' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching event detail:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = () => {
    setShowEditModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus acara ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Event berhasil dihapus');
        navigate('/organizer/events');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus acara' }));
        alert(errorData.message || 'Gagal menghapus acara');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Terjadi kesalahan saat menghapus acara');
    }
  };

  const handleTogglePublish = async () => {
    if (!event) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('is_published', event.is_published ? '0' : '1');

      const response = await fetch(`http://localhost:8000/api/events/${id}`, {
        method: 'POST', // Laravel expects POST with _method: PUT
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log('Toggle publish response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Toggle publish result:', result);

        setEvent(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
        alert(event.is_published ? 'Event berhasil di-unpublish' : 'Event berhasil dipublikasi');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Gagal mengubah status publikasi' }));
        alert(errorData.message || 'Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Terjadi kesalahan saat mengubah status publikasi');
    }
  };

  const handleSaveEvent = async () => {
    await fetchEventDetail();
    setShowEditModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Get HH:MM from HH:MM:SS
  };

  if (loading) {
    return (
      <OrganizerLayout title="Detail Acara">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail acara...</p>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  if (error || !event) {
    return (
      <OrganizerLayout title="Detail Acara">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Event</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchEventDetail}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/organizer/events')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Detail Acara">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/organizer/events')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{event.judul}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created {event.created_at ? new Date(event.created_at).toLocaleDateString('id-ID') : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePublish}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    event.is_published
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {event.is_published ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  {event.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={handleEditEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Image */}
              {event.full_flyer_path && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Poster Acara</h3>
                  <img
                    src={event.full_flyer_path}
                    alt={event.judul}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">{event.deskripsi}</p>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Acara</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Mulai</p>
                      <p className="font-medium text-gray-900">{formatDate(event.tanggal_mulai)}</p>
                    </div>
                  </div>

                  {event.tanggal_selesai && (
                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Selesai</p>
                        <p className="font-medium text-gray-900">{formatDate(event.tanggal_selesai)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Waktu</p>
                      <p className="font-medium text-gray-900">
                        {formatTime(event.waktu_mulai)} - {formatTime(event.waktu_selesai)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">{event.lokasi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiDollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Harga Tiket</p>
                      <p className="font-medium text-gray-900">
                        {event.harga_tiket ? `Rp ${event.harga_tiket.toLocaleString('id-ID')}` : 'Gratis'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiSettings className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tipe Persetujuan</p>
                      <p className="font-medium text-gray-900 capitalize">{event.approval_type || 'Auto'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Peserta</span>
                    </div>
                    <span className="font-semibold text-gray-900">{event.terdaftar || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Kuota</span>
                    </div>
                    <span className="font-semibold text-gray-900">{event.kuota}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Sisa Kuota</span>
                    </div>
                    <span className="font-semibold text-gray-900">{event.kuota - (event.terdaftar || 0)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress Pendaftaran</span>
                      <span>{Math.round(((event.terdaftar || 0) / event.kuota) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(((event.terdaftar || 0) / event.kuota) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/organizer/participants?event=${event.id}`)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiUsers className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Kelola Peserta</p>
                      <p className="text-sm text-gray-500">Lihat dan kelola pendaftaran</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate(`/organizer/events/${event.id}/attendance`)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiClock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Kelola Absensi</p>
                      <p className="text-sm text-gray-500">Scan QR atau verifikasi token</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate(`/organizer/events/${event.id}/certificates`)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiDownload className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Terbitkan Sertifikat</p>
                      <p className="text-sm text-gray-500">Issue per peserta (override nama / tolak)</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate(`/organizer/events/${event.id}/certificates/settings`)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiSettings className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Pengaturan Sertifikat</p>
                      <p className="text-sm text-gray-500">Pilih template, tanda tangan, dan posisi</p>
                    </div>
                  </button>

                  <button
                    onClick={() => window.open(`/events/${event.id}`, '_blank')}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiEye className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Preview Public</p>
                      <p className="text-sm text-gray-500">Lihat tampilan publik</p>
                    </div>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiDownload className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Export Data</p>
                      <p className="text-sm text-gray-500">Download laporan peserta</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EventModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEvent}
          editingEvent={event}
        />
      )}
    </OrganizerLayout>
  );
};

export default OrganizerEventDetail;
