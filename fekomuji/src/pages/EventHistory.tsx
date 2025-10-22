import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiCheckCircle, FiXCircle, FiAlertCircle, FiDownload, FiSearch, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface EventRegistration {
  id: number;
  user_id: number;
  event_id: number;
  ticket_category_id: number;
  nama_peserta: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  email_peserta: string;
  kode_pendaftaran: string;
  payment_status: 'paid' | 'pending' | 'failed';
  payment_method?: string;
  total_harga: number;
  created_at: string;
  updated_at: string;
  event: {
    id: number;
    judul: string;
    deskripsi: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    flyer_path?: string;
    image?: string;
    kuota: number;
    terdaftar: number;
  };
  ticket_category?: {
    id: number;
    nama_kategori: string;
    harga: number;
  };
}

const EventHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<EventRegistration | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEventHistory();
    }
  }, [isAuthenticated]);

  const fetchEventHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data || []);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setRegistrations([]);
      } else {
        // API error, show empty state
        console.log('API error:', response.status);
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching event history:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiAlertCircle className="w-4 h-4" />;
      case 'failed': return <FiXCircle className="w-4 h-4" />;
      default: return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payment Success';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesFilter = filter === 'all' || reg.payment_status === filter;
    const matchesSearch = reg.event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.event.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by time (upcoming vs past)
    const eventDate = new Date(reg.event.tanggal_mulai);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const matchesTab = activeTab === 'upcoming' 
      ? eventDate >= today 
      : eventDate < today;
    
    return matchesFilter && matchesSearch && matchesTab;
  });


  const downloadTicket = async (registration: EventRegistration) => {
    // Generate QR code and create downloadable ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1000;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, 120);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TIKET EVENT', canvas.width / 2, 50);
    ctx.fillText(registration.event.judul, canvas.width / 2, 90);

    // Event details
    ctx.fillStyle = '#374151';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Tanggal: ${new Date(registration.event.tanggal_mulai).toLocaleDateString('id-ID')}`, 50, 200);
    ctx.fillText(`Waktu: ${registration.event.waktu_mulai} - ${registration.event.waktu_selesai}`, 50, 240);
    ctx.fillText(`Lokasi: ${registration.event.lokasi}`, 50, 280);
    ctx.fillText(`Kode Pendaftaran: ${registration.kode_pendaftaran}`, 50, 320);

    // QR Code placeholder (would need actual QR generation library)
    ctx.strokeStyle = '#d1d5db';
    ctx.strokeRect(300, 400, 200, 200);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 400, 510);

    // Download
    const link = document.createElement('a');
    link.download = `tiket-${registration.kode_pendaftaran}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat riwayat event Anda.</p>
            <a
              href="/signin"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Sekarang
            </a>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat event...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiket</h1>
            <p className="text-gray-600">Kelola tiket dan riwayat event Anda</p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex gap-8 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'upcoming' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Event Mendatang
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'past' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Event Berlalu
              </button>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama event"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Transaction' },
                { key: 'approved', label: 'Disetujui' },
                { key: 'pending', label: 'Menunggu' },
                { key: 'rejected', label: 'Ditolak' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Event List */}
          {filteredRegistrations.length > 0 ? (
            <div className="space-y-4">
              {filteredRegistrations.map((registration, index) => (
                <motion.div
                  key={registration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 4) }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    {/* Event Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={registration.event.flyer_path || '/images/default-event.jpg'}
                        alt={registration.event.judul}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw4NyA2MEw4MSA1NEw4NyA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                    </div>

                    {/* Event Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {registration.event.judul}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(registration.event.tanggal_mulai).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {registration.event.lokasi}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Kode: {registration.kode_pendaftaran}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.payment_status)}`}>
                        {getStatusIcon(registration.payment_status)}
                        {getStatusText(registration.payment_status)}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTicket(registration);
                            setShowTicketModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Lihat E-Tiket
                        </button>
                        
                        {registration.payment_status === 'paid' && (
                          <button 
                            onClick={() => downloadTicket(registration)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            <FiDownload className="w-4 h-4 inline mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-16"
            >
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Tiket</h3>
              <p className="text-gray-500 mb-6">Anda belum memiliki tiket event apapun</p>
              <a
                href="/events"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Jelajahi Event
              </a>
            </motion.div>
          )}
        </div>
      </div>

      <PublicFooter />

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">E-Tiket</h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-32 h-32 bg-gray-900 mx-auto rounded-lg flex items-center justify-center mb-4">
                <div className="text-white text-xs">QR CODE</div>
              </div>
              <p className="text-sm text-gray-600">Scan QR code untuk absensi</p>
            </div>

            <div className="space-y-4">
              {/* Event Image & Title */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Event</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedTicket.event.flyer_path ? `http://localhost:8000${selectedTicket.event.flyer_path}` : '/images/default-event.svg'}
                      alt={selectedTicket.event.judul}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-event.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{selectedTicket.event.judul}</div>
                    <div className="text-sm text-gray-600">{selectedTicket.event.lokasi}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Tanggal</label>
                  <div className="font-medium text-gray-900">
                    {new Date(selectedTicket.event.tanggal_mulai).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Waktu</label>
                  <div className="font-medium text-gray-900">
                    {selectedTicket.event.waktu_mulai} - {selectedTicket.event.waktu_selesai}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Lokasi</label>
                <div className="font-medium text-gray-900">{selectedTicket.event.lokasi}</div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Kode Tiket</label>
                <div className="font-mono text-lg font-bold text-blue-600">{selectedTicket.kode_pendaftaran}</div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Status Pembayaran</label>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.payment_status)}`}>
                  {getStatusIcon(selectedTicket.payment_status)}
                  {getStatusText(selectedTicket.payment_status)}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => downloadTicket(selectedTicket)}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Download Tiket
              </button>
              {selectedTicket.payment_status === 'paid' && (
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Lihat E-Ticket
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventHistory;
