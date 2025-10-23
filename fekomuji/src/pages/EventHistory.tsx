import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiCheckCircle, FiXCircle, FiAlertCircle, FiSearch, FiX, FiEye } from 'react-icons/fi';
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
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'paid' | 'pending' | 'failed' | 'approved';
  payment_method?: string;
  total_harga: number;
  invoice_number?: string;
  qr_code?: string;
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
  };
  ticket_category?: {
    id: number;
    nama_kategori: string;
    harga: number;
  };
  attendance?: {
    id: number;
    registration_id: number;
    waktu_hadir?: string;
    is_verified: boolean;
  };
  certificate?: {
    id: number;
    registration_id: number;
    nomor_sertifikat: string;
    file_path: string;
  };
}

const EventHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<EventRegistration | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEventHistory();
    }
  }, [isAuthenticated]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTicketModal) {
        setShowTicketModal(false);
      }
    };

    if (showTicketModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showTicketModal]);

  const fetchEventHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not authenticated');
        setRegistrations([]);
        setLoading(false);
        return;
      }

      console.log('Fetching event history with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:8000/api/my-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        
        const registrationsData = data.data || data || [];
        console.log('Registrations found:', registrationsData.length);
        console.log('Registration data:', registrationsData);
        
        setRegistrations(registrationsData);
      } else if (response.status === 401) {
        console.log('Token expired or invalid');
        localStorage.removeItem('token');
        setRegistrations([]);
      } else {
        console.log('API error:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching event history:', error);
      
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-green-600'; // Default to success for free tickets
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiAlertCircle className="w-4 h-4" />;
      case 'failed': return <FiXCircle className="w-4 h-4" />;
      case 'rejected': return <FiXCircle className="w-4 h-4" />;
      default: return <FiCheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'paid': return 'Payment Success';
      case 'approved': return 'Payment Success';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'rejected': return 'Failed';
      default: return 'Payment Success'; // Default for free tickets
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.event.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.event.lokasi?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by time (upcoming vs past)
    if (!reg.event.tanggal_mulai) {
      return matchesSearch; // If no date, show in all tabs
    }
    
    const eventDate = new Date(reg.event.tanggal_mulai);
    if (isNaN(eventDate.getTime())) {
      return matchesSearch; // If invalid date, show in all tabs
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const matchesTab = activeTab === 'upcoming' 
      ? eventDate >= today 
      : eventDate < today;
    
    return matchesSearch && matchesTab;
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
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-900">Tiket</h1>
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
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama event"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200 bg-white"
              />
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
                  transition={{ delay: 0.1 * (index + 3) }}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-all duration-200"
                >
                  {/* Registration Code */}
                  <div className="text-xs text-gray-400 mb-3 font-mono">
                    {registration.kode_pendaftaran}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Event Image */}
                    <div className="w-24 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      {(registration.event.image || registration.event.flyer_path) ? (
                        <img
                          src={
                            registration.event.image || 
                            (registration.event.flyer_path ? `http://localhost:8000/storage/${registration.event.flyer_path}` : null) ||
                            '/images/default-event.jpg'
                          }
                          alt={registration.event.judul}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw4NyA2MEw4MSA1NEw4NyA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {registration.event.judul?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {registration.event.judul}
                      </h3>
                      
                      <div className={`inline-flex items-center gap-1.5 text-sm font-medium mb-2 ${getStatusColor(registration.payment_status)}`}>
                        <div className="w-2 h-2 rounded-full bg-current"></div>
                        {getStatusText(registration.payment_status)}
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="mb-1">Tanggal Acara</div>
                        <div className="text-gray-900">
                          {registration.event.tanggal_mulai ? new Date(registration.event.tanggal_mulai).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'TBA'}, {registration.event.waktu_mulai || '00:00'} - {registration.event.waktu_selesai || '00:00'} WIB
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Jumlah</div>
                        <div className="text-lg font-semibold text-gray-900">
                          1 Tiket
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedTicket(registration);
                          setShowTicketModal(true);
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        Lihat E-Tiket
                      </button>
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
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {activeTab === 'upcoming' ? 'Belum Ada Event Mendatang' : 'Belum Ada Event yang Telah Berlalu'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'upcoming' 
                  ? 'Anda belum terdaftar di event mendatang apapun' 
                  : 'Anda belum pernah mengikuti event sebelumnya'
                }
              </p>
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

      {/* E-Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4 pt-20"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTicketModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl mx-auto my-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">E-Ticket</h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* QR Code Section */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-gray-900 mx-auto rounded-lg flex items-center justify-center mb-3">
                  <div className="text-white text-xs font-medium">QR CODE</div>
                </div>
                <p className="text-sm text-gray-600">Scan QR code untuk absensi</p>
              </div>

              {/* Event Section */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Event</div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {selectedTicket.event.judul?.charAt(0) || 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{selectedTicket.event.judul}</div>
                    <div className="text-xs text-gray-600 truncate">{selectedTicket.event.lokasi}</div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tanggal</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedTicket.event.tanggal_mulai ? new Date(selectedTicket.event.tanggal_mulai).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'TBA'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Waktu</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedTicket.event.waktu_mulai || '00:00'} - {selectedTicket.event.waktu_selesai || '00:00'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Lokasi</div>
                  <div className="text-sm font-medium text-gray-900">{selectedTicket.event.lokasi}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Kode Tiket</div>
                  <div className="text-sm font-bold text-blue-600">{selectedTicket.kode_pendaftaran}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Status Pembayaran</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Unknown</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => downloadTicket(selectedTicket)}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                >
                  Download Tiket
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventHistory;
