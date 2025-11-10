import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiSearch, FiX, FiLogIn, FiChevronDown, FiDownload, FiAward } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { generateToken, generateQRData } from '../utils/tokenGenerator';
import { generateQRCode } from '../utils/qrGenerator';

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
  token?: string; // 10 digit token for check-in
  qr_data?: string; // QR code image data URL
  attendance_status?: 'not_attended' | 'attended';
  check_in_time?: string;
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
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [certificateFilter, setCertificateFilter] = useState<'all' | 'with_certificate' | 'without_certificate'>('all');
  const [selectedTicket, setSelectedTicket] = useState<EventRegistration | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

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

  // Generate token and QR code for ticket
  const generateTicketData = async (registration: EventRegistration) => {
    try {
      // Generate token if not exists
      const token = registration.token || generateToken();

      // Generate QR data
      const qrData = generateQRData(token, registration.event_id, registration.user_id);

      // Generate QR code image
      const qrImage = await generateQRCode(qrData, 200);

      setQrCodeImage(qrImage);

      // Update registration with token (in real app, this would be saved to backend)
      const updatedRegistration = {
        ...registration,
        token,
        qr_data: qrImage
      };

      setSelectedTicket(updatedRegistration);

    } catch (error) {
      console.error('Error generating ticket data:', error);
      setQrCodeImage('');
    }
  };

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

  // Format date function to handle problematic date strings
  const formatDate = (dateString: string) => {
    try {
      // Handle various date formats
      let date: Date;
      
      // If it's a timestamp with many zeros, clean it up
      if (dateString && dateString.includes('00000000')) {
        // Extract the main date part before the excessive zeros
        const cleanDateString = dateString.split('00000000')[0];
        date = new Date(cleanDateString);
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Tanggal tidak valid';
      }
      
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Tanggal tidak valid';
    }
  };


  // Helper function to get event status
  const getEventStatus = (event: any) => {
    if (!event.tanggal_mulai) return 'unknown';

    const now = new Date();
    const eventStartDate = new Date(event.tanggal_mulai);
    const eventEndDate = event.tanggal_selesai ? new Date(event.tanggal_selesai) : eventStartDate;

    // Add time if available
    if (event.waktu_mulai) {
      const [hours, minutes] = event.waktu_mulai.split(':');
      eventStartDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    if (event.waktu_selesai) {
      const [hours, minutes] = event.waktu_selesai.split(':');
      eventEndDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // If no end time, assume event lasts 2 hours
      eventEndDate.setTime(eventStartDate.getTime() + (2 * 60 * 60 * 1000));
    }

    if (now < eventStartDate) {
      return 'upcoming'; // Event belum dimulai
    } else if (now >= eventStartDate && now <= eventEndDate) {
      return 'ongoing'; // Event sedang berlangsung
    } else {
      return 'finished'; // Event sudah selesai
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.event.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.event.lokasi?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by event status
    const eventStatus = getEventStatus(reg.event);

    const matchesTab = activeTab === 'upcoming'
      ? (eventStatus === 'upcoming' || eventStatus === 'ongoing')
      : eventStatus === 'finished';

    // Filter by certificate availability
    const matchesCertificate = certificateFilter === 'all' || 
      (certificateFilter === 'with_certificate' && reg.certificate) ||
      (certificateFilter === 'without_certificate' && !reg.certificate);

    return matchesSearch && matchesTab && matchesCertificate;
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
    ctx.fillText(`Tanggal: ${formatDate(registration.event.tanggal_mulai)}`, 50, 200);
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

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
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

              {/* Certificate Filter */}
              <div className="relative">
                <select
                  value={certificateFilter}
                  onChange={(e) => setCertificateFilter(e.target.value as any)}
                  className={`appearance-none bg-white border rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200 min-w-[180px] ${
                    certificateFilter !== 'all' 
                      ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium' 
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="all">Semua Event</option>
                  <option value="with_certificate">Event Bersertifikat</option>
                  <option value="without_certificate">Tanpa Sertifikat</option>
                </select>
                <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
                  certificateFilter !== 'all' ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>

              {/* Reset Filter Button */}
              {(certificateFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setCertificateFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors whitespace-nowrap"
                >
                  Reset Filter
                </button>
              )}
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

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${getStatusColor(registration.payment_status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                          {getStatusText(registration.payment_status)}
                        </div>

                        {/* Event Status Badge */}
                        {(() => {
                          const eventStatus = getEventStatus(registration.event);
                          const statusConfig = {
                            upcoming: { text: 'Mendatang', color: 'bg-blue-100 text-blue-700' },
                            ongoing: { text: 'Berlangsung', color: 'bg-green-100 text-green-700' },
                            finished: { text: 'Selesai', color: 'bg-gray-100 text-gray-700' },
                            unknown: { text: 'TBA', color: 'bg-gray-100 text-gray-500' }
                          };
                          const config = statusConfig[eventStatus as keyof typeof statusConfig] || statusConfig.unknown;

                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                              {config.text}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="mb-1">Tanggal Acara</div>
                        <div className="text-gray-900">
                          {registration.event.tanggal_mulai ? formatDate(registration.event.tanggal_mulai) : 'Tanggal tidak tersedia'} {registration.event.waktu_mulai || '00:00'} - {registration.event.waktu_selesai || '00:00'} WIB
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

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={async () => {
                            setShowTicketModal(true);
                            await generateTicketData(registration);
                          }}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                          Lihat E-Tiket
                        </button>

                        {/* Download Certificate Button */}
                        {(() => {
                          const eventStatus = getEventStatus(registration.event);
                          const hasAttended = registration.attendance?.is_verified || registration.attendance?.waktu_hadir;
                          const eventFinished = eventStatus === 'finished';
                          const canDownloadCertificate = registration.certificate && hasAttended && eventFinished;
                          
                          if (canDownloadCertificate) {
                            return (
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `http://localhost:8000${registration.certificate!.file_path}`;
                                  link.download = `sertifikat-${registration.certificate!.nomor_sertifikat}.pdf`;
                                  link.click();
                                }}
                                className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors border border-yellow-100 flex items-center gap-2"
                              >
                                <FiDownload className="w-4 h-4" />
                                Download Sertifikat
                              </button>
                            );
                          } else if (registration.certificate && !hasAttended) {
                            return (
                              <div className="px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm font-medium border border-gray-100 flex items-center gap-2">
                                <FiAward className="w-4 h-4" />
                                Sertifikat (Perlu Absen)
                              </div>
                            );
                          } else if (registration.certificate && hasAttended && !eventFinished) {
                            return (
                              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2">
                                <FiAward className="w-4 h-4" />
                                Sertifikat (Tunggu Event Selesai)
                              </div>
                            );
                          }
                          return null;
                        })()}


                        {/* Check-in Button for Today's Events */}
                        {(() => {
                          const eventStatus = getEventStatus(registration.event);
                          const today = new Date().toDateString();
                          const eventDate = new Date(registration.event.tanggal_mulai).toDateString();
                          const isToday = today === eventDate;

                          if (isToday && (eventStatus === 'upcoming' || eventStatus === 'ongoing')) {
                            return (
                              <button
                                onClick={() => navigate(`/events/${registration.event_id}/checkin`)}
                                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-100 flex items-center gap-2"
                              >
                                <FiLogIn className="w-4 h-4" />
                                Check-in
                              </button>
                            );
                          }
                          return null;
                        })()}
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
                <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden mb-3 border border-gray-200">
                  {qrCodeImage ? (
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <div className="text-white text-xs font-medium">QR CODE</div>
                    </div>
                  )}
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
                      {selectedTicket.event.tanggal_mulai ? formatDate(selectedTicket.event.tanggal_mulai) : 'N/A'}
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
                  <div className="text-sm text-gray-500 mb-1">Token Check-in</div>
                  <div className="text-lg font-bold text-green-600 font-mono tracking-wider">
                    {selectedTicket.token || 'Generating...'}
                  </div>
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
