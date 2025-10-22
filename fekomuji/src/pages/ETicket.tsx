import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiShare2, FiCalendar, FiMapPin, FiUser, FiMail, FiCheckCircle } from 'react-icons/fi';
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
  };
  ticket_category?: {
    id: number;
    nama_kategori: string;
    harga: number;
  };
}

const ETicket: React.FC = () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Gratis';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `E-Tiket ${transaction?.event.judul}`,
          text: `E-Tiket untuk event ${transaction?.event.judul}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link E-Tiket berhasil disalin!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat E-Tiket.</p>
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
            <p className="text-gray-600">Memuat E-Tiket...</p>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">E-Tiket Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">{error || 'E-Tiket tidak dapat dimuat.'}</p>
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

  // For free tickets, allow access regardless of payment_status
  if (transaction.total_harga > 0 && transaction.payment_status !== 'paid') {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">E-Tiket Belum Tersedia</h2>
            <p className="text-gray-600 mb-6">E-Tiket hanya tersedia untuk transaksi yang sudah dibayar.</p>
            <button
              onClick={() => navigate(`/transaksi/${transaction.id}`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lihat Detail Transaksi
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
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header Actions - Hide on print */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <button
              onClick={() => navigate(`/transaksi/${transaction.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md"
            >
              <FiArrowLeft className="w-4 h-4" />
              Kembali ke Detail
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-sm border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md"
              >
                <FiShare2 className="w-4 h-4" />
                Bagikan
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
              >
                <FiDownload className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* E-Ticket Card - Simple & Clean */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Simple Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold mb-1">E-Tiket</h1>
                  <p className="text-blue-100">Tiket Digital Anda</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">Ticket ID</div>
                  <div className="font-mono text-lg font-bold">
                    {transaction.kode_pendaftaran}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Content - Simple Layout */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Event & Participant Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {transaction.event.judul}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(transaction.event.tanggal_mulai)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <FiMapPin className="w-4 h-4" />
                      <span>{transaction.event.lokasi}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Informasi Peserta</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{transaction.nama_peserta}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{transaction.email_peserta}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                        <div className="text-xs text-gray-500">QR Code</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Tunjukkan QR code ini saat check-in
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {transaction.kode_pendaftaran}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Kategori Tiket</div>
                    <div className="font-medium text-gray-900">
                      {transaction.ticket_category?.nama_kategori || 'Regular'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Harga</div>
                    <div className="font-medium text-gray-900">
                      {formatCurrency(transaction.total_harga)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <FiCheckCircle className="w-4 h-4" />
                      Valid
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Petunjuk Check-in</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Tunjukkan QR code atau ID tiket saat check-in</li>
                    <li>• Datang 15-30 menit sebelum acara dimulai</li>
                    <li>• Bawa identitas diri yang valid</li>
                    <li>• Simpan e-tiket ini hingga acara selesai</li>
                  </ul>
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

export default ETicket;
