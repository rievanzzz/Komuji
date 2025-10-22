import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiClock, FiUser, FiMail, FiCheckCircle, FiXCircle, FiDownload } from 'react-icons/fi';
// QRCode will be added later when package is available
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface Registration {
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
    kuota?: number;
    terdaftar?: number;
  };
  ticket_category?: {
    id: number;
    nama_kategori: string;
    harga: number;
  };
}

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [transaction, setTransaction] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchTransactionDetail();
    }
  }, [isAuthenticated, id]);

  const fetchTransactionDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan');
        setLoading(false);
        return;
      }

      // First get all registrations, then find the specific one
      const response = await fetch('http://localhost:8000/api/my-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const registrations = data.data || data || [];
        const foundTransaction = registrations.find((reg: Registration) => reg.id.toString() === id);
        
        if (foundTransaction) {
          setTransaction(foundTransaction);
        } else {
          setError('Transaksi tidak ditemukan');
        }
      } else {
        setError('Gagal memuat detail transaksi');
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Function to determine effective status for display
  const getEffectiveStatus = (transaction: Registration) => {
    console.log('Transaction data:', {
      total_harga: transaction.total_harga,
      status: transaction.status,
      payment_status: transaction.payment_status
    });
    
    // For free tickets (total_harga = 0), automatically consider as paid/success
    if (transaction.total_harga === 0) {
      return 'paid'; // Free tickets are automatically successful
    }
    
    // For paid tickets, use payment_status
    return transaction.payment_status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200'; // For free tickets
      case 'free': return 'text-green-600 bg-green-50 border-green-200'; // For free status
      case 'success': return 'text-green-600 bg-green-50 border-green-200'; // Alternative success status
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'; // Alternative completed status
      case null: return 'text-green-600 bg-green-50 border-green-200'; // For free tickets that might be null
      case '': return 'text-green-600 bg-green-50 border-green-200'; // For free tickets that might be empty
      default: return 'text-green-600 bg-green-50 border-green-200'; // Default to green for any unknown status
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'failed': return <FiXCircle className="w-4 h-4" />;
      case 'approved': return <FiCheckCircle className="w-4 h-4" />; // For free tickets
      case 'free': return <FiCheckCircle className="w-4 h-4" />; // For free status
      case 'success': return <FiCheckCircle className="w-4 h-4" />; // Alternative success status
      case 'completed': return <FiCheckCircle className="w-4 h-4" />; // Alternative completed status
      case null: return <FiCheckCircle className="w-4 h-4" />; // For free tickets that might be null
      case '': return <FiCheckCircle className="w-4 h-4" />; // For free tickets that might be empty
      default: return <FiCheckCircle className="w-4 h-4" />; // Default to check circle for any unknown status
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payment Success';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'approved': return 'Payment Success'; // For free tickets
      case 'free': return 'Payment Success'; // For free status
      case 'success': return 'Payment Success'; // Alternative success status
      case 'completed': return 'Payment Success'; // Alternative completed status
      case null: return 'Payment Success'; // For free tickets that might be null
      case '': return 'Payment Success'; // For free tickets that might be empty
      default: return 'Payment Success'; // Default to success for any unknown status
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat detail transaksi.</p>
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
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail transaksi...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaksi Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">{error || 'Detail transaksi tidak dapat dimuat.'}</p>
            <button
              onClick={() => navigate('/transaksi')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Transaksi
            </button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/transaksi')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md"
            >
              <FiArrowLeft className="w-4 h-4" />
              Kembali ke Transaksi
            </button>
          </div>

          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Detail Transaksi</h1>
                <p className="text-gray-600">
                  Invoice: <span className="font-mono text-blue-600">yp-{transaction.invoice_number || transaction.kode_pendaftaran}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(getEffectiveStatus(transaction))}`}>
                  {getStatusIcon(getEffectiveStatus(transaction))}
                  {getStatusText(getEffectiveStatus(transaction))}
                </div>
                {/* E-Tiket Button - Always show */}
                <button 
                  onClick={() => navigate(`/transaksi/${transaction.id}/eticket`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  E-Tiket
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Event Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Event</h2>
                
                <div className="mb-6">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img
                      src={
                        transaction.event.image || 
                        (transaction.event.flyer_path ? `http://localhost:8000/storage/${transaction.event.flyer_path}` : null) ||
                        '/images/default-event.jpg'
                      }
                      alt={transaction.event.judul}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEw5MyA1NEw4NyA2MEw4MSA1NEw4NyA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {transaction.event.judul}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <FiCalendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {formatDate(transaction.event.tanggal_mulai)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <FiClock className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {transaction.event.waktu_mulai} - {transaction.event.waktu_selesai} WIB
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <FiMapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">
                        {transaction.event.lokasi}
                      </span>
                    </div>
                  </div>

                  {/* Event Description */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Deskripsi Event</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {transaction.event.deskripsi || 'Deskripsi event akan segera tersedia.'}
                    </p>
                  </div>

                </div>

                <button 
                  onClick={() => navigate(`/events/${transaction.event.id}`)}
                  className="w-full py-2.5 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                >
                  Lihat Detail Event
                </button>
              </div>
            </div>

            {/* Right Column - Transaction Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Transaksi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Nomor Invoice</div>
                      <div className="font-mono text-gray-900">
                        yp-{transaction.invoice_number || transaction.kode_pendaftaran}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Tanggal Transaksi</div>
                      <div className="text-gray-900">
                        {formatDate(transaction.created_at)}, {formatTime(transaction.created_at)} WIB
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Metode Pembayaran</div>
                      <div className="text-gray-900">
                        {transaction.payment_method || 'Gratis'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Kategori Tiket</div>
                      <div className="text-gray-900">
                        {transaction.ticket_category?.nama_kategori || 'Regular'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Jumlah Tiket</div>
                      <div className="text-gray-900">1 Tiket</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Total Pembayaran</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(transaction.total_harga)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participant Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Peserta</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FiUser className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Nama Lengkap</div>
                        <div className="text-gray-900 font-medium">
                          {transaction.nama_peserta}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <FiMail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Email</div>
                        <div className="text-gray-900">
                          {transaction.email_peserta}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          E-Tiket akan dikirim ke email ini
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Jenis Kelamin</div>
                      <div className="text-gray-900">
                        {transaction.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Tanggal Lahir</div>
                      <div className="text-gray-900">
                        {formatDate(transaction.tanggal_lahir)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default TransactionDetail;
