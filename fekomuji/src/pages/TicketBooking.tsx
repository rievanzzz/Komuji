import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiUser, FiMail, FiCalendar, FiCreditCard, FiCheck, FiArrowLeft, FiArrowRight, FiInfo, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';

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
  flyer_path?: string; // Field utama untuk gambar event
}

const TicketBookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState<'categories' | 'participant' | 'payment' | 'success'>('categories');
  const [registrationResult, setRegistrationResult] = useState<any>(null);
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
          setEvent(eventData);
        }
        
        // Fetch ticket categories
        const categoriesResponse = await fetch(`http://localhost:8000/api/events/${eventId}/ticket-categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setTicketCategories(categoriesData);
        } else {
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
    setSelectedCategory(category);
    setStep('participant');
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

      // Data sesuai dengan struktur database Registration model
      const registrationData = {
        ticket_category_id: selectedCategory?.id,
        nama_peserta: participantData.nama_peserta,
        jenis_kelamin: participantData.jenis_kelamin,
        tanggal_lahir: participantData.tanggal_lahir,
        email_peserta: participantData.email_peserta,
        total_harga: selectedCategory?.harga || 0,
        payment_status: selectedCategory?.harga === 0 ? 'paid' : 'pending', // Gratis langsung paid
        payment_method: selectedCategory?.harga === 0 ? 'free' : paymentMethod
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

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal');
      }

      // Simpan hasil registrasi untuk ditampilkan di invoice
      setRegistrationResult(data);
      setStep('success');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal. Silakan coba lagi.');
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
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft size={20} />
              <span>Kembali ke Detail Event</span>
            </button>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Beli Tiket</h1>
                  <p className="text-gray-600 mt-1">{event?.judul}</p>
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
                  <div className="flex items-center">
                    <FiInfo className="text-red-500 mr-2" size={16} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Step 1: Category Selection */}
              {step === 'categories' && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Kategori Tiket</h2>
                  
                  <div className="space-y-3">
                    {ticketCategories.map((category) => {
                      const isAvailable = category.is_active && category.terjual < category.kuota;
                      
                      return (
                        <div
                          key={category.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            isAvailable
                              ? 'border-gray-200 hover:border-blue-300'
                              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
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
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              This ticket is personal and can be exchanged for an FDC.
                            </span>
                            <div className="flex items-center gap-3">
                              <button 
                                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                −
                              </button>
                              <span className="w-8 text-center">1</span>
                              <button 
                                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Participant Data */}
              {step === 'participant' && selectedCategory && (
                <div className="space-y-6">
                  {/* Detail Pembeli Section */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Detail Pembeli</h2>
                      <button className="text-blue-600 text-sm hover:underline">Ubah Data</button>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-medium text-gray-900">{user?.name || 'Arievan 123'}</div>
                      <div className="text-sm text-gray-600">{user?.email || 'arievan920@gmail.com'}</div>
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        E-Tiket akan dikirim ke email ini
                      </div>
                    </div>
                  </div>

                  {/* Pengunjung Section */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded text-sm flex items-center justify-center font-medium">1</span>
                        <h3 className="text-lg font-semibold text-gray-900">Pengunjung 1</h3>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" defaultChecked />
                        Sama dengan detail pembeli
                      </label>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Kategori Tiket</div>
                      <div className="font-medium text-gray-900">{selectedCategory.nama_kategori}</div>
                    </div>

                    <form onSubmit={handleParticipantSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={participantData.nama_peserta}
                          onChange={(e) => setParticipantData({ ...participantData, nama_peserta: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={participantData.email_peserta}
                          onChange={(e) => setParticipantData({ ...participantData, email_peserta: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Masukkan email"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          value={participantData.tanggal_lahir}
                          onChange={(e) => setParticipantData({ ...participantData, tanggal_lahir: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jenis Kelamin
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="L"
                              checked={participantData.jenis_kelamin === 'L'}
                              onChange={(e) => setParticipantData({ ...participantData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                              className="mr-2 text-blue-600"
                            />
                            <span className="flex items-center gap-1">
                              <span className="text-blue-500">♂</span>
                              Laki - Laki
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="P"
                              checked={participantData.jenis_kelamin === 'P'}
                              onChange={(e) => setParticipantData({ ...participantData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                              className="mr-2 text-blue-600"
                            />
                            <span className="flex items-center gap-1">
                              <span className="text-pink-500">♀</span>
                              Perempuan
                            </span>
                          </label>
                        </div>
                      </div>

                    </form>
                  </div>
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
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  {/* Header Success */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedCategory?.harga === 0 ? 'Pendaftaran Berhasil!' : 'Invoice Dibuat!'}
                    </h2>
                    <p className="text-gray-600">
                      {selectedCategory?.harga === 0 
                        ? 'E-ticket Anda telah berhasil dibuat'
                        : 'Silakan lakukan pembayaran untuk mengaktifkan tiket'
                      }
                    </p>
                  </div>

                  {/* Invoice/Ticket Details */}
                  <div className="border rounded-lg p-6 mb-6">
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
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 {event?.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : 'TBA'}</p>
                        <p>🕐 {event?.waktu_mulai} - {event?.waktu_selesai}</p>
                        <p>📍 {event?.lokasi}</p>
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

                    {/* QR Code */}
                    <div className="text-center py-6 border-t">
                      <p className="text-sm text-gray-600 mb-4">QR Code untuk Check-in</p>
                      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="w-32 h-32 bg-gray-900 flex items-center justify-center text-white text-xs">
                          QR CODE
                          <br />
                          {registrationResult.data?.kode_pendaftaran?.slice(-6) || '123456'}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Tunjukkan QR code ini saat check-in di lokasi event
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      📄 Cetak {selectedCategory?.harga === 0 ? 'E-Ticket' : 'Invoice'}
                    </button>
                    <button
                      onClick={() => navigate(`/events/${eventId}`)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Kembali ke Event
                    </button>
                  </div>
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
                    {event?.flyer_path ? (
                      <img 
                        src={`http://localhost:8000${event.flyer_path}`}
                        alt={event.judul || 'Event'}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        onError={(e) => {
                          console.log('Image failed to load:', event.flyer_path);
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
                        event?.flyer_path ? 'hidden' : 'flex'
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
                
                {/* Ticket Details */}
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">1 Tiket Dipesan</span>
                    <button className="text-blue-600 text-sm hover:underline font-medium">Lihat Detail</button>
                  </div>
                  
                  {selectedCategory && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {selectedCategory.nama_kategori}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {selectedCategory.deskripsi}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">1x tiket</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedCategory.harga === 0 ? 'Gratis' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
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
    </div>
  );
};

export default TicketBookingPage;
