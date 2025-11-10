import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiCheck, FiArrowLeft, FiInfo, FiDownload, FiMail, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import Invoice from '../components/Invoice';
import ETicket from '../components/ETicket';
import { EmailService, type EmailTicketData } from '../services/emailService';
import { QRCodeService, type TicketQRData } from '../services/qrCodeService';
import { generateToken, generateQRData } from '../utils/tokenGenerator';
import { generateQRCode } from '../utils/qrGenerator';
import { sendRegistrationEmail, type RegistrationEmailData } from '../utils/emailService';

interface TicketCategory {
  id: number;
  nama_kategori: string;
  deskripsi: string;
  harga: number;
  kuota: number;
  terjual: number;
  is_active: boolean;
}

interface ParticipantData {
  nama_peserta: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  email_peserta: string;
}

interface EventData {
  id: number;
  judul: string;
  tanggal_mulai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path?: string; // relative path in storage
  image?: string; // full URL provided by API
}

const TicketBookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'categories' | 'participant' | 'payment' | 'success'>('categories');
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showETicket, setShowETicket] = useState(false);
  const [ticketQRCode, setTicketQRCode] = useState<string>('');
  const [event, setEvent] = useState<EventData | null>(null);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [participantData, setParticipantData] = useState<ParticipantData>({
    nama_peserta: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    email_peserta: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate QR Code for ticket
  const generateTicketQR = async (registrationData: any) => {
    try {
      const qrData: TicketQRData = {
        ticketId: registrationData.id || registrationData.ticket_id,
        ticketNumber: registrationData.ticket_number || `TKT-${Date.now()}`,
        participantName: participantData.nama_peserta,
        participantEmail: participantData.email_peserta,
        eventTitle: event?.judul || '',
        eventDate: event?.tanggal_mulai || '',
        ticketCategory: selectedCategory?.nama_kategori || '',
        timestamp: new Date().toISOString()
      };

      const qrCode = await QRCodeService.generateTicketQR(qrData);
      setTicketQRCode(qrCode);
      return qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  // Send e-ticket via email with token and QR code
  const sendETicketEmail = async (registrationData: any) => {
    try {
      // Generate token for check-in
      const token = generateToken();

      // Generate QR data
      const qrData = generateQRData(token, parseInt(eventId!), user?.id || 0);

      // Generate QR code image
      const qrCodeImage = await generateQRCode(qrData, 200);

      // Format date
      const eventDate = event?.tanggal_mulai ?
        new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : '';

      const emailData: RegistrationEmailData = {
        recipientEmail: participantData.email_peserta,
        recipientName: participantData.nama_peserta,
        eventTitle: event?.judul || '',
        eventDate: eventDate,
        eventTime: `${event?.waktu_mulai} - ${event?.waktu_selesai}`,
        eventLocation: event?.lokasi || '',
        token: token,
        qrCodeImage: qrCodeImage,
        registrationCode: registrationData.kode_pendaftaran || `REG-${Date.now()}`
      };

      const emailSent = await sendRegistrationEmail(emailData);

      if (emailSent) {
        console.log('✅ Registration email sent successfully');

        // Store token in registration data (in real app, save to backend)
        registrationData.token = token;
        registrationData.qr_data = qrCodeImage;
      } else {
        console.error('❌ Failed to send registration email');
      }

    } catch (error) {
      console.error('Error sending registration email:', error);
    }
  };
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Timer countdown
  useEffect(() => {
    if (step === 'participant' || step === 'payment') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/events/${eventId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, navigate, eventId]);

  // Fetch event and ticket categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch event details
        const eventResponse = await fetch(`http://localhost:8000/api/events/${eventId}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          console.log('Event data loaded:', eventData); // Debug log
          // Normalize image URL
          const normalized = {
            ...eventData,
            image: eventData.image || (eventData.flyer_path ? `http://localhost:8000/storage/${eventData.flyer_path}` : undefined),
          };
          setEvent(normalized);
        }

        // Fetch ticket categories
        const categoriesResponse = await fetch(`http://localhost:8000/api/events/${eventId}/ticket-categories`);
        console.log('Ticket categories response status:', categoriesResponse.status);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('Ticket categories data:', categoriesData);

          // Transform API data to match frontend interface
          const transformedCategories = categoriesData.map((cat: any) => ({
            ...cat,
            harga: parseFloat(cat.harga) // Convert string to number
          }));

          console.log('Transformed categories:', transformedCategories);
          setTicketCategories(transformedCategories);
        } else {
          console.log('Failed to fetch ticket categories, using fallback data');
          // Fallback data
          setTicketCategories([
            {
              id: 1,
              nama_kategori: 'Presale Bandung',
              deskripsi: 'Presale Bandung - 50.000 (free 3 HEPHI PACK)',
              harga: 50000,
              kuota: 100,
              terjual: 25,
              is_active: true
            }
          ]);
          setEvent({
            id: parseInt(eventId || '1'),
            judul: 'Festival 75 Indonesia',
            tanggal_mulai: '2025-10-26',
            waktu_mulai: '09:00',
            waktu_selesai: '17:00',
            lokasi: 'Lapangan PPI Pussenif'
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCategorySelect = (category: TicketCategory) => {
    // Toggle selection: if same category clicked, deselect it
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };


  const handleParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantData.nama_peserta || !participantData.tanggal_lahir || !participantData.email_peserta) {
      setError('Semua field harus diisi');
      return;
    }

    if (selectedCategory?.harga === 0) {
      await handleRegistration();
    } else {
      setStep('payment');
    }
  };

  const handleRegistration = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validasi data participant
      if (!participantData.nama_peserta || !participantData.email_peserta || !participantData.tanggal_lahir) {
        setError('Semua field harus diisi');
        return;
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participantData.email_peserta)) {
        setError('Format email tidak valid');
        return;
      }

      // Data sesuai dengan struktur database Registration model
      const registrationData = {
        ticket_category_id: selectedCategory?.id,
        nama_peserta: participantData.nama_peserta,
        jenis_kelamin: participantData.jenis_kelamin,
        tanggal_lahir: participantData.tanggal_lahir,
        email_peserta: participantData.email_peserta,
        payment_method: selectedCategory?.harga === 0 ? 'free' : (paymentMethod || 'free'),
        // Add unique identifier to allow multiple registrations
        registration_note: `Registered by user for ${participantData.email_peserta} at ${new Date().toISOString()}`
      };

      console.log('Sending registration data:', registrationData);

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        console.log('Registration successful:', data);
        setRegistrationResult(data);

        // Generate QR Code for ticket
        await generateTicketQR(data);

        // Send e-ticket via email
        await sendETicketEmail(data);

        setStep('success');
      } else {
        // Handle specific error cases
        let errorMessage = 'Gagal melakukan pendaftaran. Silakan coba lagi.';

        if (response.status === 422) {
          // Validation errors
          if (data.errors) {
            const firstError = Object.values(data.errors)[0];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (response.status === 409) {
          // Conflict - already registered
          if (data.message && data.message.includes('email')) {
            errorMessage = 'Email ini sudah terdaftar di event ini. Gunakan email berbeda untuk mendaftar lagi.';
          } else {
            errorMessage = 'Anda sudah terdaftar di event ini. Untuk mendaftar lagi dengan email berbeda, silakan logout dan login dengan akun lain, atau hubungi admin.';
          }
        } else if (response.status === 400) {
          // Bad request
          errorMessage = data.message || 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
        } else if (response.status === 401) {
          // Unauthorized
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (response.status === 403) {
          // Forbidden
          errorMessage = 'Anda tidak memiliki akses untuk mendaftar event ini.';
        } else if (response.status >= 500) {
          // Server error
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi dalam beberapa saat.';
        } else if (data.message) {
          errorMessage = data.message;
        }

        console.error('Registration failed:', {
          status: response.status,
          data: data,
          message: errorMessage
        });

        setError(errorMessage);
        return;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Terjadi kesalahan jaringan. Periksa koneksi internet Anda dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Pilih metode pembayaran');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Untuk tiket berbayar, buat registrasi dengan status pending
      await handleRegistration();

      // TODO: Integrate dengan payment gateway
      // Untuk sementara, tampilkan pesan bahwa sistem pembayaran belum tersedia
      alert('Sistem pembayaran belum tersedia. Registrasi Anda telah disimpan dengan status pending.');

    } catch (err) {
      console.error('Payment error:', err);
      setError('Gagal memproses pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md"
              >
                <FiArrowLeft size={18} />
                <span>Kembali ke Detail Event</span>
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Beli Tiket</h1>
                  <p className="text-gray-600 text-lg font-medium">{event?.judul}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {event?.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Tanggal akan diumumkan'} • {event?.lokasi}
                  </p>
                </div>

                {/* Timer */}
                {(step === 'participant' || step === 'payment') && (
                  <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg flex items-center gap-2">
                    <FiClock size={16} />
                    <span className="font-medium">Waktu pengisian data: {formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiInfo className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                    <div className="flex-1">
                      <p className="text-red-700 text-sm">{error}</p>
                      {error.includes('sudah terdaftar') && (
                        <div className="mt-2 text-xs text-red-600">
                          <p><strong>Tips:</strong></p>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            <li>Pastikan menggunakan email yang berbeda</li>
                            <li>Cek apakah email sudah pernah digunakan untuk event ini</li>
                            <li>Hubungi admin jika masih bermasalah</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Category Selection */}
              {step === 'categories' && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Kategori Tiket</h2>

                  {ticketCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Tidak ada kategori tiket tersedia untuk event ini.</p>
                      <p className="text-xs text-gray-400 mt-2">Debug: {JSON.stringify(ticketCategories)}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ticketCategories.map((category) => {
                      const isAvailable = category.is_active && category.terjual < category.kuota;

                      const isSelected = selectedCategory?.id === category.id;

                      return (
                        <div
                          key={category.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            !isAvailable
                              ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => {
                            if (isAvailable) {
                              handleCategorySelect(category);
                            }
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{category.nama_kategori}</h3>
                              </div>
                              <p className="text-gray-600 text-sm">{category.deskripsi}</p>
                            </div>

                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-gray-900">
                                {category.harga === 0 ? 'Gratis' : `Rp ${category.harga.toLocaleString('id-ID')}`}
                              </div>
                            </div>
                          </div>

                          {/* Ticket Info */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Tiket personal, dapat ditukar dengan sertifikat
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Tersedia: {category.kuota - category.terjual} tiket
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Participant Data */}
              {step === 'participant' && selectedCategory && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {/* Header Section */}
                  <div className="mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Data Peserta</h2>
                        <p className="text-gray-600 text-sm">Lengkapi informasi peserta event</p>
                      </div>
                    </div>

                    {/* Selected Ticket Info */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">Tiket {selectedCategory.nama_kategori}</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          {selectedCategory.harga === 0 ? 'Gratis' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleParticipantSubmit} className="space-y-6">
                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nama Lengkap */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={participantData.nama_peserta}
                          onChange={(e) => setParticipantData({ ...participantData, nama_peserta: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Masukkan nama lengkap sesuai identitas"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={participantData.email_peserta}
                          onChange={(e) => setParticipantData({ ...participantData, email_peserta: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="contoh@email.com"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">E-tiket akan dikirim ke email ini</p>
                      </div>

                      {/* Tanggal Lahir */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tanggal Lahir <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={participantData.tanggal_lahir}
                          onChange={(e) => setParticipantData({ ...participantData, tanggal_lahir: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                          required
                        />
                      </div>

                      {/* Jenis Kelamin */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors bg-gray-50 hover:bg-blue-50">
                            <input
                              type="radio"
                              value="L"
                              checked={participantData.jenis_kelamin === 'L'}
                              onChange={(e) => setParticipantData({ ...participantData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                              className="mr-3 text-blue-600"
                            />
                            <span className="font-medium text-gray-700">
                              Laki-laki
                            </span>
                          </label>
                          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-colors bg-gray-50 hover:bg-pink-50">
                            <input
                              type="radio"
                              value="P"
                              checked={participantData.jenis_kelamin === 'P'}
                              onChange={(e) => setParticipantData({ ...participantData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                              className="mr-3 text-pink-600"
                            />
                            <span className="font-medium text-gray-700">
                              Perempuan
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>


                  </form>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 'payment' && selectedCategory && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Metode Pembayaran</h2>

                  <div className="space-y-4 mb-6">
                    {['Bank Transfer', 'E-Wallet (GoPay, OVO, DANA)', 'Virtual Account'].map((method) => (
                      <label key={method} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-4 text-blue-600"
                        />
                        <span className="font-medium">{method}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep('participant')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!paymentMethod}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success - Invoice/E-Ticket */}
              {step === 'success' && registrationResult && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  {/* Clean Success Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedCategory?.harga === 0 ? 'Pendaftaran Berhasil' : 'Invoice Dibuat'}
                    </h2>
                    <p className="text-gray-600">
                      {selectedCategory?.harga === 0
                        ? 'E-ticket telah dikirim ke email Anda'
                        : 'Silakan lakukan pembayaran'
                      }
                    </p>
                  </div>

                  {/* Clean Ticket Details */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {selectedCategory?.harga === 0 ? 'E-Ticket' : 'Invoice'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {registrationResult.data?.kode_pendaftaran || 'REG-' + Date.now()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tanggal</p>
                        <p className="font-medium">{new Date().toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="border-t border-b py-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{event?.judul}</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex items-center gap-2">
                          <FiCalendar size={14} className="text-gray-400" />
                          <span>{event?.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock size={14} className="text-gray-400" />
                          <span>{event?.waktu_mulai} - {event?.waktu_selesai}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin size={14} className="text-gray-400" />
                          <span>{event?.lokasi}</span>
                        </div>
                      </div>
                    </div>

                    {/* Participant Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Nama Peserta</p>
                        <p className="font-medium">{participantData.nama_peserta}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{participantData.email_peserta}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kategori Tiket</p>
                        <p className="font-medium">{selectedCategory?.nama_kategori}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Harga</p>
                        <p className="font-medium text-lg">
                          {selectedCategory?.harga === 0 ? 'Gratis' : `Rp ${selectedCategory?.harga.toLocaleString('id-ID')}`}
                        </p>
                      </div>
                    </div>

                    {/* QR Code - Minimalist */}
                    <div className="text-center py-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">QR Code Check-in</p>

                      <div className="inline-block p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(JSON.stringify({
                            ticketId: registrationResult.data?.id || 'TKT-' + Date.now(),
                            ticketNumber: registrationResult.data?.kode_pendaftaran || 'REG-' + Date.now(),
                            participantName: participantData.nama_peserta,
                            participantEmail: participantData.email_peserta,
                            eventTitle: event?.judul || 'Event',
                            eventDate: event?.tanggal_mulai || new Date().toISOString().split('T')[0],
                            ticketCategory: selectedCategory?.nama_kategori || 'Regular',
                            timestamp: new Date().toISOString()
                          }))}`}
                          alt="QR Code"
                          className="w-40 h-40 rounded-xl shadow-lg"
                          onError={(e) => {
                            // Fallback to placeholder if QR API fails
                            const target = e.target as HTMLImageElement;
                            target.outerHTML = `
                              <div class="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex flex-col items-center justify-center text-white shadow-inner">
                                <div class="text-xs font-bold mb-2">QR CODE</div>
                                <div class="text-2xl font-mono font-bold">${(registrationResult.data?.kode_pendaftaran || '123456').slice(-6)}</div>
                                <div class="text-xs mt-2 opacity-75">SCAN ME</div>
                              </div>
                            `;
                          }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        Tunjukkan QR code ini saat check-in
                      </p>
                    </div>
                  </div>

                  {/* Simple Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowETicket(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <FiDownload size={18} />
                      E-Ticket
                    </button>
                    <button
                      onClick={() => setShowInvoice(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      <FiMail size={18} />
                      Invoice
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(`/events/${eventId}`)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium mt-3"
                  >
                    Kembali ke Event
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar - Order Summary - Always show */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h3>

                {/* Event Image & Info */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    {/* Event Image - Same logic as EventDetail */}
                    {(event?.image || event?.flyer_path) ? (
                      <img
                        src={event.image || `http://localhost:8000/storage/${event.flyer_path}`}
                        alt={event.judul || 'Event'}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        onError={(e) => {
                          console.log('Image failed to load:', event?.image || event?.flyer_path);
                          // Fallback to gradient if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                        (event?.image || event?.flyer_path) ? 'hidden' : 'flex'
                      }`}
                    >
                      {event?.judul?.charAt(0) || 'E'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                        {event?.judul || 'Judul Event Baru'}
                      </h4>
                      <div className="text-xs text-gray-600 mb-1">
                        {event?.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '2 Oktober 2025'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {event?.lokasi || 'Gedung Serba Guna'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Ticket */}
                {selectedCategory && (
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 pr-3">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">{selectedCategory.nama_kategori}</h4>
                          <p className="text-xs text-gray-600 leading-normal">{selectedCategory.deskripsi}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-gray-900">
                            {selectedCategory.harga === 0 ? 'Gratis' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="mb-6 pb-4 border-b border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedCategory ? (selectedCategory.harga === 0 ? 'Rp 0' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`) : 'Rp 0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Biaya Layanan</span>
                    <span className="text-sm font-medium text-gray-900">Rp 0</span>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6 bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedCategory ? (selectedCategory.harga === 0 ? 'Rp 0' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`) : 'Rp 0'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {step === 'categories' && selectedCategory && (
                    <button
                      onClick={() => setStep('participant')}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      {Number(selectedCategory.harga) === 0 ? 'Lanjutkan' : 'Bayar Sekarang'}
                    </button>
                  )}

                  {step === 'participant' && (
                    <button
                      onClick={() => {
                        // Validasi form dulu
                        if (!participantData.nama_peserta || !participantData.email_peserta || !participantData.tanggal_lahir) {
                          setError('Semua field harus diisi');
                          return;
                        }

                        // Debug log untuk memastikan harga tiket
                        console.log('Selected category:', selectedCategory);
                        console.log('Harga tiket:', selectedCategory?.harga);
                        console.log('Is free ticket?', selectedCategory?.harga === 0);

                        // Jika gratis, langsung daftar. Jika berbayar, ke payment
                        const harga = Number(selectedCategory?.harga) || 0;
                        if (harga === 0) {
                          console.log('Processing free ticket registration...');
                          handleRegistration();
                        } else {
                          console.log('Going to payment step...');
                          setStep('payment');
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Memproses...' : Number(selectedCategory?.harga) === 0 ? 'Daftar Gratis' : 'Lanjut ke Pembayaran'}
                    </button>
                  )}

                  {step === 'payment' && (
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Memproses...' : 'Bayar Sekarang'}
                    </button>
                  )}

                  {step !== 'success' && (
                    <button
                      onClick={() => navigate(`/events/${eventId}`)}
                      className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Kembali Ke Detail Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
    {showInvoice && registrationResult && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Invoice</h2>
            <button
              onClick={() => setShowInvoice(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <Invoice
              data={{
                id: registrationResult.data?.id || registrationResult.id,
                eventTitle: event?.judul || '',
                eventDate: event?.tanggal_mulai || '',
                eventTime: `${event?.waktu_mulai} - ${event?.waktu_selesai}`,
                eventLocation: event?.lokasi || '',
                participantName: participantData.nama_peserta,
                participantEmail: participantData.email_peserta,
                ticketCategory: selectedCategory?.nama_kategori || '',
                ticketPrice: selectedCategory?.harga || 0,
                registrationDate: new Date().toISOString(),
                invoiceNumber: `INV-${registrationResult.data?.kode_pendaftaran || Date.now()}`,
                qrCode: ticketQRCode
              }}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      </div>
    )}

    {/* E-Ticket Modal */}
    {showETicket && registrationResult && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">E-Ticket</h2>
            <button
              onClick={() => setShowETicket(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <ETicket
              data={{
                id: registrationResult.data?.id || registrationResult.id,
                ticketNumber: registrationResult.data?.kode_pendaftaran || `TKT-${Date.now()}`,
                eventTitle: event?.judul || '',
                eventDate: event?.tanggal_mulai || '',
                eventTime: `${event?.waktu_mulai} - ${event?.waktu_selesai}`,
                eventLocation: event?.lokasi || '',
                participantName: participantData.nama_peserta,
                participantEmail: participantData.email_peserta,
                ticketCategory: selectedCategory?.nama_kategori || '',
                ticketPrice: selectedCategory?.harga || 0,
                registrationDate: new Date().toISOString(),
                eventImage: event?.image || (event?.flyer_path ? `http://localhost:8000/storage/${event.flyer_path}` : undefined)
              }}
              onShare={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `E-Ticket: ${event?.judul || 'Event'}`,
                    text: `Tiket untuk event ${event?.judul || 'Event'}`,
                    url: window.location.href
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default TicketBookingPage;
