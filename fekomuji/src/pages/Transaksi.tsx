import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
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

const Transaksi: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setRegistrations([]);
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
        console.log('API Response:', data);
        console.log('Registrations count:', (data.data || data || []).length);

        // Log each registration for debugging
        (data.data || data || []).forEach((reg: Registration, index: number) => {
          console.log(`Registration ${index + 1}:`, {
            id: reg.id,
            event: reg.event?.judul,
            payment_status: reg.payment_status,
            status: reg.status,
            total_harga: reg.total_harga,
            created_at: reg.created_at
          });
        });

        setRegistrations(data.data || data || []);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setRegistrations([]);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine effective status for display
  const getEffectiveStatus = (registration: Registration): string => {
    console.log('Registration data for getEffectiveStatus:', {
      id: registration.id,
      total_harga: registration.total_harga,
      payment_status: registration.payment_status,
      status: registration.status
    });

    // For free tickets (total_harga = 0), automatically consider as paid/success
    if (registration.total_harga === 0) {
      console.log('Free ticket detected, returning paid status');
      return 'paid'; // Free tickets are automatically successful
    }

    // For paid tickets, prioritize payment_status, but fallback to status if needed
    let effectiveStatus = registration.payment_status || registration.status || 'pending';

    // Handle various success status variations
    if (['approved', 'success', 'completed'].includes(effectiveStatus)) {
      effectiveStatus = 'paid';
    }

    console.log('Final effective status:', effectiveStatus);
    return effectiveStatus;
  };

  const getStatusText = (status: string) => {
    console.log('Status received:', status, typeof status);
    switch (status) {
      case 'paid': return 'Payment Success';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'approved': return 'Payment Success'; // For free tickets
      case 'success': return 'Payment Success'; // Alternative success status
      case 'completed': return 'Payment Success'; // Alternative completed status
      case 'free': return 'Payment Success'; // For free status
      case null: return 'Payment Success'; // For free tickets that might be null
      case '': return 'Payment Success'; // For free tickets that might be empty
      default:
        console.log('Unknown status:', status);
        return 'Payment Success'; // Default to success for any unknown status
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

  const formatTime = (dateString: string) => {
    try {
      let date: Date;

      // Handle various date formats
      if (dateString && dateString.includes('00000000')) {
        const cleanDateString = dateString.split('00000000')[0];
        date = new Date(cleanDateString);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return '00:00';
      }

      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error, dateString);
      return '00:00';
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const effectiveStatus = getEffectiveStatus(reg);

    // Debug logging for filter
    console.log('Filtering registration:', {
      id: reg.id,
      event: reg.event.judul,
      payment_status: reg.payment_status,
      status: reg.status,
      effectiveStatus: effectiveStatus,
      total_harga: reg.total_harga,
      currentFilter: filter
    });

    // Filter logic based on effective status
    let matchesFilter = false;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'paid') {
      // Include all successful payment statuses - be more inclusive
      const successStatuses = ['paid', 'approved', 'success', 'completed'];
      matchesFilter = successStatuses.includes(effectiveStatus) ||
                     successStatuses.includes(reg.payment_status) ||
                     successStatuses.includes(reg.status) ||
                     reg.total_harga === 0 || // Free tickets
                     effectiveStatus === 'paid'; // Direct check

      console.log('Paid filter check:', {
        effectiveStatusMatch: successStatuses.includes(effectiveStatus),
        paymentStatusMatch: successStatuses.includes(reg.payment_status),
        statusMatch: successStatuses.includes(reg.status),
        isFreeTicket: reg.total_harga === 0,
        finalMatch: matchesFilter
      });
    } else if (filter === 'pending') {
      matchesFilter = effectiveStatus === 'pending' || reg.payment_status === 'pending';
    } else if (filter === 'failed') {
      matchesFilter = effectiveStatus === 'failed' || reg.payment_status === 'failed';
    }

    const matchesSearch = reg.event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reg.kode_pendaftaran.toLowerCase().includes(searchQuery.toLowerCase());

    const result = matchesFilter && matchesSearch;
    console.log('Filter result:', { matchesFilter, matchesSearch, result });

    return result;
  });

  // Log filter summary
  console.log('Filter Summary:', {
    totalRegistrations: registrations.length,
    filteredCount: filteredRegistrations.length,
    currentFilter: filter,
    searchQuery: searchQuery,
    registrationStatuses: registrations.map(reg => ({
      id: reg.id,
      payment_status: reg.payment_status,
      status: reg.status,
      total_harga: reg.total_harga,
      effectiveStatus: getEffectiveStatus(reg)
    }))
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat transaksi Anda.</p>
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
            <p className="text-gray-600">Memuat transaksi...</p>
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
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
            <p className="text-gray-600">
              {filteredRegistrations.length} dari {registrations.length} transaksi
              {filter !== 'all' && ` • Filter: ${filter === 'paid' ? 'Payment Success' : filter === 'pending' ? 'Pending' : 'Failed'}`}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama event atau kode registrasi"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200 bg-white"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className={`appearance-none bg-white border-2 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[180px] ${
                  filter !== 'all'
                    ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <option value="all">All Transaction</option>
                <option value="paid">Payment Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${
                filter !== 'all' ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>

            {/* Reset Filter Button */}
            {(filter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Transaction List */}
          {filteredRegistrations.length > 0 ? (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300"
                >
                  {/* Invoice Number */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                      INV-{registration.invoice_number || registration.kode_pendaftaran}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Event Image */}
                    <div className="w-24 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
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
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {registration.event.judul}
                      </h3>

                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${
                        getEffectiveStatus(registration) === 'paid' || getEffectiveStatus(registration) === 'approved'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                          : getEffectiveStatus(registration) === 'pending'
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                        {getStatusText(getEffectiveStatus(registration))}
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="mb-1">Tanggal Transaksi</div>
                        <div className="text-gray-900">
                          {formatDate(registration.created_at)}, {formatTime(registration.created_at)} WIB
                        </div>
                      </div>
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Total</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(registration.total_harga)}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/transaksi/${registration.id}`)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum Ada Transaksi</h3>
              <p className="text-gray-500 mb-6">Anda belum melakukan transaksi apapun</p>
              <a
                href="/events"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Jelajahi Event
              </a>
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default Transaksi;
