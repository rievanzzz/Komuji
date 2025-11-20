import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiSearch, FiX, FiLogIn, FiChevronDown, FiDownload, FiAward, FiUser, FiMapPin, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    has_certificate?: boolean;
  };
  ticket_category?: {
    id: number;
    nama_kategori: string;
    harga: number;
  };
  attendance?: {
    id: number;
    registration_id: number;
    status?: 'pending' | 'checked_in' | 'checked_out';
    check_in_time?: string;
    check_out_time?: string;
    token?: string;
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
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [imageLoadStates, setImageLoadStates] = useState<{[key: number]: boolean}>({});

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

  // Prepare QR using backend QR or generate from token
  const generateTicketData = async (registration: EventRegistration) => {
    setQrLoading(true);
    try {
      // Use backend-generated QR if available, otherwise use external service with token
      let qrUrl = registration.qr_code;

      if (!qrUrl) {
        const token = registration.attendance?.token || registration.kode_pendaftaran;
        qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(token)}`;
      }

      // Add a small delay to show loading
      await new Promise(resolve => setTimeout(resolve, 300));

      setQrCodeImage(qrUrl);
      setSelectedTicket(registration);
    } catch (error) {
      console.error('Error preparing QR:', error);
      // Always provide fallback
      const fallbackToken = registration.attendance?.token || registration.kode_pendaftaran;
      setQrCodeImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fallbackToken)}`);
      setSelectedTicket(registration);
    } finally {
      setQrLoading(false);
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

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200';
      case 'failed':
      case 'rejected':
        return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200';
      default:
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200';
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
      (certificateFilter === 'with_certificate' && !!reg.event?.has_certificate) ||
      (certificateFilter === 'without_certificate' && !reg.event?.has_certificate);

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
        <div className="pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-6">
            {/* Skeleton Header */}
            <div className="mb-8">
              <div className="h-9 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
            </div>

            {/* Skeleton Tabs */}
            <div className="flex gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
            </div>

            {/* Skeleton Search */}
            <div className="mb-8">
              <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse"></div>
            </div>

            {/* Skeleton Cards */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-4">
                    {/* Skeleton Image */}
                    <div className="w-24 h-16 bg-gray-200 rounded-lg animate-pulse"></div>

                    {/* Skeleton Content */}
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>

                    {/* Skeleton Button */}
                    <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiket Event Saya</h1>
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
                  className={`appearance-none bg-white border-2 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[200px] ${
                    certificateFilter !== 'all'
                      ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
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
                  className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300"
                >
                  {/* Registration Code */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                      {registration.kode_pendaftaran}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Event Image - Fixed Loading */}
                    <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {!imageLoadStates[registration.id] && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                          <span className="text-gray-400 text-2xl font-bold">
                            {registration.event.judul?.charAt(0) || 'E'}
                          </span>
                        </div>
                      )}
                      {(registration.event.image || registration.event.flyer_path) ? (
                        <img
                          src={
                            registration.event.image ||
                            (registration.event.flyer_path ? `http://localhost:8000/storage/${registration.event.flyer_path}` : null) ||
                            '/images/default-event.jpg'
                          }
                          alt={registration.event.judul}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoadStates[registration.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => {
                            setImageLoadStates(prev => ({...prev, [registration.id]: true}));
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw4NyA2MEw4MSA1NEw4NyA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                            setImageLoadStates(prev => ({...prev, [registration.id]: true}));
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {registration.event.judul?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {registration.event.judul}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadgeClass(registration.payment_status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
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
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          Lihat E-Tiket
                        </button>

                        {/* Download Certificate / Labels */}
                        {(() => {
                          const isCertEvent = !!registration.event?.has_certificate;
                          const hasAttended = (
                            registration.attendance?.status === 'checked_in' ||
                            registration.attendance?.status === 'checked_out' ||
                            !!registration.attendance?.check_in_time
                          );
                          const canDownloadCertificate = !!registration.certificate?.file_path;

                          if (canDownloadCertificate) {
                            return (
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `http://localhost:8000/storage/${registration.certificate!.file_path}`;
                                  link.download = `sertifikat-${registration.certificate!.nomor_sertifikat}.pdf`;
                                  link.click();
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm font-semibold hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-green-200 flex items-center gap-2 shadow-sm"
                              >
                                <FiDownload className="w-4 h-4" />
                                Download Sertifikat
                              </button>
                            );
                          }

                          if (isCertEvent && !hasAttended) {
                            return (
                              <div className="px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm font-medium border border-gray-100 flex items-center gap-2">
                                <FiAward className="w-4 h-4" />
                                Sertifikat (Perlu Absen)
                              </div>
                            );
                          }

                          if (isCertEvent && hasAttended && !canDownloadCertificate) {
                            return (
                              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2">
                                <FiAward className="w-4 h-4" />
                                Sertifikat (Menunggu Penerbitan)
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
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-sm"
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
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl mx-4"
          >
            {/* Header - Clean */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">E-Tiket</h3>
                <p className="text-sm text-blue-100">Tiket Digital Anda</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100 mb-1">Ticket ID</p>
                <p className="text-sm font-bold">{selectedTicket.kode_pendaftaran}</p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-white hover:text-blue-100 p-1 ml-2"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Event Title */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.event.judul}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar size={14} />
                  <span>{selectedTicket.event.tanggal_mulai ? formatDate(selectedTicket.event.tanggal_mulai) : 'N/A'}</span>
                  <span className="text-gray-400">•</span>
                  <FiMapPin size={14} />
                  <span>{selectedTicket.event.lokasi}</span>
                </div>
              </div>

              {/* Informasi Peserta */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Informasi Peserta</h4>
                <div className="flex items-start gap-3 mb-3">
                  <FiUser className="text-gray-500 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">{selectedTicket.nama_peserta || 'N/A'}</p>
                    <p className="text-xs text-gray-600">{selectedTicket.email_peserta || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid - Clean 3 Column */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kategori Tiket</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTicket.ticket_category?.nama_kategori || 'regular'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Harga</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedTicket.total_harga || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <FiCheck size={12} /> Valid
                  </span>
                </div>
              </div>

              {/* QR Code & Token - Side by Side */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  {qrLoading ? (
                    <div className="w-24 h-24 bg-gray-100 border-2 border-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-xs text-gray-400 text-center">Loading<br/>QR...</div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-white border-2 border-gray-200 rounded-lg p-2">
                      <img
                        src={qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedTicket.attendance?.token || selectedTicket.kode_pendaftaran)}`}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                        loading="eager"
                      />
                    </div>
                  )}
                  <p className="text-xs text-center text-gray-500 mt-2">QR Code</p>
                </div>

                {/* Token */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-2">Token Check-in</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider mb-2">
                    {selectedTicket.attendance?.token || '- - - -'}
                  </p>
                  <p className="text-xs text-gray-500">Tunjukkan QR code atau ID tiket saat check-in</p>
                </div>
              </div>

              {/* Petunjuk Check-in */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Petunjuk Check-in</h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Tunjukkan QR code atau ID tiket saat check-in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Datang 15-30 menit sebelum acara dimulai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Bawa identitas diri yang valid</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Simpan e-tiket ini hingga acara selesai</span>
                  </li>
                </ul>
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
