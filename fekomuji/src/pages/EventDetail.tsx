import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiArrowLeft } from 'react-icons/fi';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { AuthModal } from '../components';
import { useAuth } from '../contexts/AuthContext';
interface EventDetailData {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path?: string;
  harga_tiket?: number;
  kuota: number;
  terdaftar?: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed properties for display
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  price?: string;
  image?: string;
  category?: string;
  organizer?: string;
  capacity?: number;
  registered?: number;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Transform API data to display format
  const transformEventData = (apiEvent: any): EventDetailData => {
    console.log('Raw API Event Data:', apiEvent);
    
    // Validate date
    const eventDate = apiEvent.tanggal_mulai ? new Date(apiEvent.tanggal_mulai) : null;
    const isValidDate = eventDate && !isNaN(eventDate.getTime());
    
    const transformed = {
      ...apiEvent,
      // Computed display properties
      title: apiEvent.judul || 'Event Title',
      description: apiEvent.deskripsi || 'Deskripsi event akan segera tersedia.',
      date: isValidDate ? apiEvent.tanggal_mulai : new Date().toISOString().split('T')[0],
      time: `${apiEvent.waktu_mulai || '00:00'} - ${apiEvent.waktu_selesai || '23:59'}`,
      location: apiEvent.lokasi || 'Lokasi akan diumumkan',
      price: apiEvent.harga_tiket && apiEvent.harga_tiket > 0 
        ? `Rp ${apiEvent.harga_tiket.toLocaleString('id-ID')}` 
        : 'Gratis',
      image: apiEvent.flyer_path 
        ? `http://localhost:8000${apiEvent.flyer_path}` 
        : '/images/default-event.svg',
      category: 'Event',
      organizer: 'Event Organizer',
      capacity: apiEvent.kuota || 0,
      registered: apiEvent.terdaftar || 0
    };
    
    console.log('Transformed event detail:', transformed);
    return transformed;
  };

  // Fetch event detail from API
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching event with ID:', id);
        const response = await fetch(`http://localhost:8000/api/events/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event tidak ditemukan');
          } else if (response.status >= 500) {
            throw new Error('Server error. Silakan coba lagi nanti.');
          } else {
            throw new Error('Gagal memuat data event');
          }
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (!data) {
          throw new Error('Data event tidak valid');
        }
        
        const transformedEvent = transformEventData(data);
        console.log('Transformed event data:', transformedEvent);
        setEvent(transformedEvent);
        
      } catch (err) {
        console.error('Error fetching event:', err);
        
        // Fallback to mock data for development
        const mockEvent = {
          id: parseInt(id || '1'),
          judul: 'Seminar Digital Marketing',
          deskripsi: 'Pelajari strategi digital marketing terbaru untuk mengembangkan bisnis Anda. Event ini akan membahas berbagai teknik dan tools yang dapat membantu meningkatkan visibilitas online bisnis Anda.',
          tanggal_mulai: '2025-01-15',
          tanggal_selesai: '2025-01-15',
          waktu_mulai: '09:00',
          waktu_selesai: '17:00',
          lokasi: 'Ruang Seminar A, Gedung Utama',
          flyer_path: null,
          harga_tiket: 0,
          kuota: 100,
          terdaftar: 25,
          is_published: true
        };
        
        const transformedEvent = transformEventData(mockEvent);
        setEvent(transformedEvent);
        setError('Using fallback data - API not available');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetail();
    } else {
      setError('ID event tidak valid');
      setLoading(false);
    }
  }, [id]);

  const handleRegister = () => {
    if (!isAuthenticated) {
      // Store current page URL for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      setShowAuthModal(true);
      return;
    }
    
    // Check if event is paid
    const isPaidEvent = event?.price && event.price !== 'Free' && event.price !== 'Gratis' && event.price !== '0';
    
    if (isPaidEvent) {
      // Show notification for paid events
      alert('Maaf, sistem pembayaran belum tersedia. Saat ini hanya event gratis yang dapat didaftarkan.');
      return;
    }
    
    // For free events, proceed with registration
    handleFreeEventRegistration();
  };

  const handleFreeEventRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Silakan login terlebih dahulu');
        setShowAuthModal(true);
        return;
      }

      console.log('Registering for event:', id);
      const response = await fetch(`http://localhost:8000/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok) {
        alert(`Berhasil mendaftar! Kode pendaftaran: ${data.kode_pendaftaran || data.registration_code || 'REG-' + Date.now()}`);
        
        // Update registered count
        if (event) {
          setEvent({
            ...event,
            registered: (event.registered || event.terdaftar || 0) + 1,
            terdaftar: (event.registered || event.terdaftar || 0) + 1
          });
        }
      } else {
        const errorMessage = data.message || data.error || 'Gagal mendaftar. Silakan coba lagi.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="h-64 md:h-96 bg-gray-300 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-300 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/events')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft size={16} />
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiArrowLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Image */}
            <div className="lg:col-span-2">
              {/* Main Event Image */}
              <div className="relative mb-6">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                  {event.flyer_path ? (
                    <img
                      src={`http://localhost:8000${event.flyer_path}`}
                      alt={event.judul || 'Event'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <div className="text-center text-blue-400">
                        <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">No Image Available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all"
                  >
                    <FiShare2 size={16} />
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi</h2>
                <p className="text-gray-700 leading-relaxed">
                  {event.deskripsi || 'Deskripsi event akan segera tersedia.'}
                </p>
              </div>
            </div>

            {/* Right Column - Event Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                {/* Event Title */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                    {event.judul || 'Event Title'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{event.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', { 
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Tanggal akan diumumkan'}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {event.waktu_mulai && event.waktu_selesai ? `${event.waktu_mulai} - ${event.waktu_selesai}` : 'Waktu akan diumumkan'}
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Dibuat Oleh</div>
                    <div className="font-medium text-gray-900">Event Organizer</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Lokasi</div>
                    <div className="font-medium text-gray-900">{event.lokasi || 'Lokasi akan diumumkan'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Mulai Dari</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {event.harga_tiket && event.harga_tiket > 0 ? `Rp ${event.harga_tiket.toLocaleString('id-ID')}` : 'Gratis'}
                    </div>
                  </div>
                </div>

                {/* Registration Button */}
                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
                >
                  {isAuthenticated ? 'Beli Sekarang' : 'Login untuk Membeli'}
                </button>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Peserta</span>
                    <span className="font-medium text-gray-900">
                      {event.terdaftar || 0} / {event.kuota || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((event.terdaftar || 0) / (event.kuota || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="text-sm text-gray-500 mb-3">Media Sosial</div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <span className="text-gray-700">Instagram</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700">WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        eventTitle={event.title || event.judul || 'Event'}
      />
    </div>
  );
};

export default EventDetail;
