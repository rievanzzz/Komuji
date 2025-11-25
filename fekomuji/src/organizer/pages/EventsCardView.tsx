import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiMapPin, FiEdit, FiTrash2, FiPlus, FiEye, FiClock, FiDownload, FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from '../components/OrganizerLayout';
import { EventModal } from '../components';

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

const EventsCardView: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Fetch ALL events without pagination limit
      const response = await fetch('http://localhost:8000/api/organizer/events?per_page=999999', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = (eventId: number) => {
    // Navigate ke halaman kelola peserta untuk event ini
    navigate(`/organizer/events/${eventId}/participants`);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

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
        alert('Event berhasil dihapus!');
      } else {
        alert('Gagal menghapus event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Terjadi kesalahan saat menghapus event');
    }
  };

  const handleSaveEvent = () => {
    fetchEvents();
    setShowCreateModal(false);
    setEditingEvent(null);
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


  const getStatusColor = (event: Event) => {
    if (!event.is_published) return 'bg-gray-100 text-gray-700';

    const fillRate = ((event.terdaftar || 0) / event.kuota) * 100;
    if (fillRate >= 90) return 'bg-red-100 text-red-700';
    if (fillRate >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (event: Event) => {
    if (!event.is_published) return 'Draft';

    const fillRate = ((event.terdaftar || 0) / event.kuota) * 100;
    if (fillRate >= 90) return 'Hampir Penuh';
    if (fillRate >= 70) return 'Terisi Baik';
    return 'Tersedia';
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'published' && event.is_published) ||
                         (statusFilter === 'draft' && !event.is_published);

    // Filter berdasarkan tanggal
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const eventDate = new Date(event.tanggal_mulai);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'upcoming') {
        matchesDate = eventDate >= today;
      } else if (dateFilter === 'past') {
        matchesDate = eventDate < today;
      } else if (dateFilter === 'thisMonth') {
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        matchesDate = eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
      } else if (dateFilter === 'nextMonth') {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1);
        matchesDate = eventDate >= nextMonth && eventDate < monthAfter;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExportAllEvents = () => {
    if (filteredEvents.length === 0) {
      alert('Tidak ada event untuk di-export');
      return;
    }

    // Buat CSV dengan format yang rapi
    const csvRows = [];

    // Header
    csvRows.push([
      'No',
      'Judul Event',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Waktu Mulai',
      'Waktu Selesai',
      'Lokasi',
      'Kuota',
      'Terdaftar',
      'Sisa Kuota',
      'Persentase Terisi (%)',
      'Status',
      'Kategori ID'
    ].join(','));

    // Data rows
    filteredEvents.forEach((event, index) => {
      const status = event.is_published ? 'Published' : 'Draft';
      const tanggalMulai = new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const tanggalSelesai = event.tanggal_selesai
        ? new Date(event.tanggal_selesai).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        : '-';
      const terdaftar = event.terdaftar || 0;
      const sisaKuota = event.kuota - terdaftar;
      const persentase = ((terdaftar / event.kuota) * 100).toFixed(1);

      const row = [
        index + 1,
        `"${event.judul}"`,
        `"${tanggalMulai}"`,
        `"${tanggalSelesai}"`,
        event.waktu_mulai,
        event.waktu_selesai,
        `"${event.lokasi}"`,
        event.kuota,
        terdaftar,
        sisaKuota,
        persentase,
        status,
        event.kategori_id || '-'
      ];
      csvRows.push(row.join(','));
    });

    // Tambahkan summary
    const totalKuota = filteredEvents.reduce((sum, e) => sum + e.kuota, 0);
    const totalTerdaftar = filteredEvents.reduce((sum, e) => sum + (e.terdaftar || 0), 0);
    const totalSisa = totalKuota - totalTerdaftar;
    const avgPersentase = ((totalTerdaftar / totalKuota) * 100).toFixed(1);

    csvRows.push(''); // Baris kosong
    csvRows.push([
      '',
      `"TOTAL (${filteredEvents.length} Event)"`,
      '',
      '',
      '',
      '',
      '',
      totalKuota,
      totalTerdaftar,
      totalSisa,
      avgPersentase,
      '',
      ''
    ].join(','));

    // Convert to CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const currentDate = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `Semua_Event_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Berhasil export ${filteredEvents.length} event!\nFile: Semua_Event_${currentDate}.csv`);
  };

  return (
    <OrganizerLayout title="Kelola Event">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#004aad' }}>Kelola Event</h1>
            <p className="text-gray-600 mt-1">Klik card untuk kelola peserta dan tiket event</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAllEvents}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}
            >
              <FiDownload className="w-5 h-5" />
              Export Semua Event
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#004aad' }}
            >
              <FiPlus className="w-5 h-5" />
              Buat Event Baru
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari event berdasarkan judul, lokasi, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="lg:w-56">
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="published">Aktif</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="lg:w-56">
            <div className="relative">
              <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 focus:bg-white transition-all"
              >
                <option value="all">Semua Tanggal</option>
                <option value="upcoming">Akan Datang</option>
                <option value="past">Sudah Lewat</option>
                <option value="thisMonth">Bulan Ini</option>
                <option value="nextMonth">Bulan Depan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border-2" style={{ borderColor: '#004aad' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Event</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#004aad' }}>{events.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#004aad20' }}>
              <FiCalendar className="w-6 h-6" style={{ color: '#004aad' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2" style={{ borderColor: '#5eed9c' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Event Aktif</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#5eed9c' }}>{events.filter(e => e.is_published).length}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5eed9c20' }}>
              <FiEye className="w-6 h-6" style={{ color: '#5eed9c' }} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Peserta</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#004aad' }}>
                {events.reduce((sum, e) => sum + (e.terdaftar || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
              <FiUsers className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Event Draft</p>
              <p className="text-3xl font-bold mt-2 text-gray-600">{events.filter(e => !e.is_published).length}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
              <FiClock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-gray-200">
              <div className="h-48 bg-gray-300 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const fillPercentage = ((event.terdaftar || 0) / event.kuota) * 100;
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
                onClick={() => handleViewParticipants(event.id)}
              >
                {/* Event Image/Flyer */}
                <div className="relative h-56 overflow-hidden">
                  {event.flyer_path ? (
                    <img
                      src={`http://localhost:8000/storage/${event.flyer_path}`}
                      alt={event.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004aad 0%, #5eed9c 100%)' }}>
                      <FiCalendar className="w-16 h-16 text-white opacity-70" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${getStatusColor(event)}`}>
                      {getStatusText(event)}
                    </span>
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity">
                    {event.judul}
                  </h3>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#004aad15' }}>
                        <FiCalendar className="w-4 h-4" style={{ color: '#004aad' }} />
                      </div>
                      <span className="font-medium">{formatDate(event.tanggal_mulai)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#5eed9c15' }}>
                        <FiClock className="w-4 h-4" style={{ color: '#5eed9c' }} />
                      </div>
                      <span>{event.waktu_mulai} - {event.waktu_selesai}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-gray-100">
                        <FiMapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="line-clamp-1">{event.lokasi}</span>
                    </div>
                  </div>

                  {/* Participants Progress */}
                  <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <FiUsers className="w-4 h-4" />
                        Peserta
                      </span>
                      <span className="font-bold" style={{ color: '#004aad' }}>
                        {event.terdaftar || 0} / {event.kuota}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(fillPercentage, 100)}%`,
                          background: fillPercentage >= 80 ? '#5eed9c' : 'linear-gradient(90deg, #004aad 0%, #5eed9c 100%)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewParticipants(event.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-sm"
                      style={{ backgroundColor: '#004aad' }}
                    >
                      <FiUsers className="w-4 h-4" />
                      Kelola
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                      title="Edit Event"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                      title="Hapus Event"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && events.length === 0 && (
            <div className="col-span-full text-center py-16">
              <FiCalendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Event</h3>
              <p className="text-gray-500 mb-6">Mulai buat event pertama Anda sekarang!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Buat Event Baru
              </button>
            </div>
          )}
          {filteredEvents.length === 0 && events.length > 0 && (
            <div className="col-span-full text-center py-16">
              <FiSearch className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Event yang Sesuai</h3>
              <p className="text-gray-500 mb-6">Coba ubah filter atau kata kunci pencarian Anda</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-colors"
                style={{ backgroundColor: '#004aad' }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

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

export default EventsCardView;
