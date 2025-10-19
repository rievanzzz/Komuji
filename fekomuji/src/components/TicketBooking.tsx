import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiMail, FiCalendar, FiCreditCard, FiCheck, FiX, FiShoppingCart, FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import TicketInvoice from './TicketInvoice';

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

interface TicketBookingProps {
  eventId: number;
  eventTitle: string;
  onClose: () => void;
  onSuccess: (registrationData: any) => void;
}

const TicketBooking: React.FC<TicketBookingProps> = ({ eventId, eventTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'categories' | 'participant' | 'payment' | 'success'>('categories');
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (step === 'participant' || step === 'payment') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, onClose]);

  // Fetch ticket categories
  useEffect(() => {
    const fetchTicketCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/events/${eventId}/ticket-categories`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch ticket categories');
        }
        
        const data = await response.json();
        setTicketCategories(data);
      } catch (err) {
        console.error('Error fetching ticket categories:', err);
        // Fallback data for development
        setTicketCategories([
          {
            id: 1,
            nama_kategori: 'Regular',
            deskripsi: 'Tiket reguler dengan akses penuh ke event',
            harga: 0,
            kuota: 100,
            terjual: 25,
            is_active: true
          },
          {
            id: 2,
            nama_kategori: 'VIP',
            deskripsi: 'Tiket VIP dengan benefit tambahan dan tempat duduk premium',
            harga: 150000,
            kuota: 50,
            terjual: 10,
            is_active: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketCategories();
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

  const handleParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participantData.nama_peserta || !participantData.tanggal_lahir || !participantData.email_peserta) {
      setError('Semua field harus diisi');
      return;
    }

    if (selectedCategory?.harga === 0) {
      // Free ticket - proceed directly to registration
      handleRegistration();
    } else {
      // Paid ticket - go to payment step
      setStep('payment');
    }
  };

  const handleRegistration = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const registrationData = {
        ticket_category_id: selectedCategory?.id,
        nama_peserta: participantData.nama_peserta,
        jenis_kelamin: participantData.jenis_kelamin,
        tanggal_lahir: participantData.tanggal_lahir,
        email_peserta: participantData.email_peserta,
        payment_method: selectedCategory?.harga === 0 ? null : paymentMethod
      };

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

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setRegistrationResult(data);
      setStep('success');
      onSuccess(data);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      setError('Pilih metode pembayaran');
      return;
    }
    
    // For now, show temporary message for paid tickets
    alert('Sistem pembayaran belum tersedia. Fitur ini akan segera hadir!');
  };

  if (loading && ticketCategories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header with Progress */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Beli Tiket Event</h2>
              <p className="text-blue-100 text-sm">{eventTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              step === 'categories' ? 'text-white' : 'text-blue-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'categories' ? 'bg-white text-blue-600' : 'bg-blue-500'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Pilih Kategori</span>
            </div>
            <div className="flex-1 h-0.5 bg-blue-400"></div>
            <div className={`flex items-center space-x-2 ${
              step === 'participant' ? 'text-white' : 'text-blue-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'participant' ? 'bg-white text-blue-600' : 'bg-blue-500'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Data Pembeli</span>
            </div>
            <div className="flex-1 h-0.5 bg-blue-400"></div>
            <div className={`flex items-center space-x-2 ${
              step === 'payment' ? 'text-white' : 'text-blue-200'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'payment' ? 'bg-white text-blue-600' : 'bg-blue-500'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Pembayaran</span>
            </div>
          </div>
          
          {/* Timer */}
          {(step === 'participant' || step === 'payment') && (
            <div className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FiClock size={16} />
              <span className="text-sm font-medium">
                ⏰ Waktu pengisian data: {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <FiInfo className="text-red-400 mr-2" size={16} />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Category Selection */}
            {step === 'categories' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Kategori Tiket</h3>
                  <p className="text-gray-600">Pilih kategori tiket yang sesuai dengan kebutuhan Anda</p>
                </div>
                
                <div className="grid gap-4">
                  {ticketCategories.map((category) => {
                    const isAvailable = category.is_active && category.terjual < category.kuota;
                    const remaining = category.kuota - category.terjual;
                    
                    return (
                      <div
                        key={category.id}
                        className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                          isAvailable
                            ? 'border-gray-200 hover:border-blue-400 hover:shadow-lg bg-white'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            handleCategorySelect(category);
                          }
                        }}
                      >
                        {/* Category Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-gray-900">{category.nama_kategori}</h4>
                              {category.harga === 0 && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  GRATIS
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{category.deskripsi}</p>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600">
                              {category.harga === 0 ? 'Rp 0' : `Rp ${category.harga.toLocaleString('id-ID')}`}
                            </div>
                            {!isAvailable && (
                              <div className="text-red-500 text-sm font-medium mt-1">Tidak Tersedia</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Availability Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Ketersediaan</span>
                            <span className="text-sm font-medium text-gray-900">
                              {remaining} dari {category.kuota} tiket
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                remaining > category.kuota * 0.5 ? 'bg-green-500' :
                                remaining > category.kuota * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(remaining / category.kuota) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        {isAvailable && (
                          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                            <FiShoppingCart size={16} />
                            Pilih Kategori Ini
                          </button>
                        )}
                        
                        {/* Sold Out Overlay */}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-gray-900/10 rounded-2xl flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Participant Data */}
            {step === 'participant' && selectedCategory && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Detail Pembeli</h3>
                  <p className="text-gray-600">Lengkapi data diri untuk pembelian tiket</p>
                </div>

                <form onSubmit={handleParticipantSubmit} className="space-y-6">
                  {/* Buyer Information */}
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiUser className="text-blue-600" />
                      Informasi Pembeli
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          value={participantData.nama_peserta}
                          onChange={(e) => setParticipantData({ ...participantData, nama_peserta: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={participantData.email_peserta}
                          onChange={(e) => setParticipantData({ ...participantData, email_peserta: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Email untuk menerima e-ticket"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          📧 E-Tiket akan dikirim ke email ini
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jenis Kelamin *
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center bg-white px-4 py-3 rounded-xl border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              value="L"
                              checked={participantData.jenis_kelamin === 'L'}
                              onChange={(e) => setParticipantData({ ...participantData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                              className="mr-3 text-blue-600"
                            />
                            <span className="text-sm font-medium">Laki-laki</span>
                          </label>
                          <label className="flex items-center bg-white px-4 py-3 rounded-xl border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              value="P"
                              checked={participantData.jenis_kelamin === 'P'}
                              onChange={(e) => setParticipantData({ ...participantData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                              className="mr-3 text-blue-600"
                            />
                            <span className="text-sm font-medium">Perempuan</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiCalendar className="inline mr-1" />
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          value={participantData.tanggal_lahir}
                          onChange={(e) => setParticipantData({ ...participantData, tanggal_lahir: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setStep('categories')}
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      <FiArrowLeft size={16} />
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          {selectedCategory.harga === 0 ? (
                            <>
                              <FiCheck size={16} />
                              Daftar Gratis
                            </>
                          ) : (
                            <>
                              <FiArrowRight size={16} />
                              Lanjut ke Pembayaran
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && selectedCategory && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Metode Pembayaran</h3>
                  <p className="text-gray-600">Pilih metode pembayaran yang Anda inginkan</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiCreditCard className="text-blue-600" />
                    Ringkasan Pembayaran
                  </h4>
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Kategori Tiket:</span>
                      <span className="font-medium">{selectedCategory.nama_kategori}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-medium">Rp {selectedCategory.harga.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">Rp {selectedCategory.harga.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Metode Pembayaran
                  </label>
                  <div className="space-y-3">
                    {['Bank Transfer', 'E-Wallet (GoPay, OVO, DANA)', 'Virtual Account', 'Credit Card'].map((method) => (
                      <label key={method} className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all">
                        <input
                          type="radio"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{method}</span>
                          <p className="text-sm text-gray-500 mt-1">
                            {method === 'Bank Transfer' && 'Transfer manual ke rekening bank'}
                            {method === 'E-Wallet (GoPay, OVO, DANA)' && 'Pembayaran melalui dompet digital'}
                            {method === 'Virtual Account' && 'Bayar melalui ATM atau mobile banking'}
                            {method === 'Credit Card' && 'Pembayaran dengan kartu kredit/debit'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('participant')}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    <FiArrowLeft size={16} />
                    Kembali
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={!paymentMethod}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    <FiCreditCard size={16} />
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="text-green-600" size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {selectedCategory?.harga === 0 
                    ? 'E-ticket telah dikirim ke email Anda. Silakan cek inbox atau folder spam.'
                    : 'Invoice telah dibuat. Silakan lakukan pembayaran dalam 30 menit untuk mengaktifkan tiket Anda.'
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FiMail size={16} />
                    {selectedCategory?.harga === 0 ? 'Lihat E-Ticket' : 'Lihat Invoice'}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Order Summary */}
          {(step === 'participant' || step === 'payment' || step === 'success') && selectedCategory && (
            <div className="w-80 bg-gray-50 p-6 border-l border-gray-200">
              <div className="sticky top-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h4>
                
                {/* Event Info */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <h5 className="font-medium text-gray-900 mb-2">{eventTitle}</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      <span>26 Oktober 2025</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock size={14} />
                      <span>09:00 - 17:00</span>
                    </div>
                  </div>
                </div>
                
                {/* Ticket Details */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h6 className="font-medium text-gray-900">{selectedCategory.nama_kategori}</h6>
                      <p className="text-sm text-gray-600">{selectedCategory.deskripsi}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Jumlah Tiket</span>
                      <span className="font-medium">1 Tiket</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Harga Satuan</span>
                      <span className="font-medium">
                        {selectedCategory.harga === 0 ? 'Gratis' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Total */}
                <div className="bg-blue-600 text-white rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold">
                      {selectedCategory.harga === 0 ? 'Rp 0' : `Rp ${selectedCategory.harga.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  {selectedCategory.harga === 0 && (
                    <p className="text-blue-100 text-sm mt-1">🎉 Event ini gratis!</p>
                  )}
                </div>
                
                {/* Security Notice */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiInfo className="text-yellow-600 mt-0.5" size={14} />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium mb-1">Catatan Penting:</p>
                      <ul className="space-y-0.5">
                        <li>• Tiket tidak dapat dipindahtangankan</li>
                        <li>• Simpan e-ticket dengan baik</li>
                        <li>• Tunjukkan QR code saat check-in</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && registrationResult && (
        <TicketInvoice
          registrationData={registrationResult.data}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

export default TicketBooking;
