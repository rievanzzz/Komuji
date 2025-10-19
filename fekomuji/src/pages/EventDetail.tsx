import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiArrowLeft, FiMapPin, FiClock, FiCalendar, FiUsers, FiTag } from 'react-icons/fi';
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<EventDetailData[]>([]);

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
      image: apiEvent.image || '/images/default-event.svg',
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

  // Fetch related events
  useEffect(() => {
    const fetchRelatedEvents = async () => {
      try {
        console.log('Fetching related events...');
        
        // Try multiple endpoints to get events
        let response = await fetch('http://localhost:8000/api/events');
        
        if (!response.ok) {
          console.log('First endpoint failed, trying alternative...');
          response = await fetch('http://localhost:8000/api/events?sort=terdekat');
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log('Raw events data:', data);
          console.log('Data type:', typeof data, 'Length:', Array.isArray(data) ? data.length : 'Not array');
          
          // Handle different response formats
          let eventsArray = Array.isArray(data) ? data : (data.data || []);
          console.log('Events array:', eventsArray);
          
          if (eventsArray.length === 0) {
            console.log('No events found in response, using fallback data');
            // Fallback static data - same structure as real API data
            const fallbackEvents = [
              {
                id: 999,
                judul: 'Workshop Digital Marketing Terbaru',
                deskripsi: 'Workshop komprehensif tentang strategi digital marketing terkini',
                tanggal_mulai: '2025-01-15',
                waktu_mulai: '09:00',
                waktu_selesai: '17:00',
                lokasi: 'Jakarta Convention Center',
                harga_tiket: 0,
                kuota: 100,
                terdaftar: 45,
                flyer_path: undefined // Will use default image like real API
              },
              {
                id: 998,
                judul: 'Seminar Teknologi AI & Machine Learning',
                deskripsi: 'Seminar mendalam tentang implementasi AI dan ML dalam bisnis',
                tanggal_mulai: '2025-01-20',
                waktu_mulai: '13:00',
                waktu_selesai: '18:00',
                lokasi: 'Bandung Tech Hub',
                harga_tiket: 150000,
                kuota: 200,
                terdaftar: 120,
                flyer_path: undefined // Will use default image like real API
              },
              {
                id: 997,
                judul: 'Conference Startup Indonesia 2025',
                deskripsi: 'Conference tahunan untuk startup dan entrepreneur Indonesia',
                tanggal_mulai: '2025-01-25',
                waktu_mulai: '08:30',
                waktu_selesai: '17:30',
                lokasi: 'Surabaya Convention Hall',
                harga_tiket: 250000,
                kuota: 500,
                terdaftar: 380,
                flyer_path: undefined // Will use default image like real API
              }
            ];
            
            // Use fallback data directly - same structure as API
            setRelatedEvents(fallbackEvents);
            return;
          }
          
          // Filter out current event
          const currentEventId = parseInt(id || '0');
          const filtered = eventsArray.filter((evt: any) => {
            console.log('Comparing event ID:', evt.id, 'with current:', currentEventId);
            return evt.id !== currentEventId;
          });
          
          console.log('Filtered events:', filtered.length);
          
          // If we have events, take random 3 or all available
          let selectedEvents = [];
          if (filtered.length > 0) {
            if (filtered.length <= 3) {
              selectedEvents = filtered;
            } else {
              // Randomly select 3 events
              const shuffled = [...filtered].sort(() => 0.5 - Math.random());
              selectedEvents = shuffled.slice(0, 3);
            }
          }
          
          console.log('Selected events before transform:', selectedEvents);
          
          // Use raw data directly for related events - same as Events page
          const processedEvents = selectedEvents;
          
          console.log('Processed events for related:', processedEvents);
          setRelatedEvents(processedEvents);
        } else {
          console.error('Failed to fetch events, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching related events:', error);
      }
    };

    if (id) {
      fetchRelatedEvents();
    }
  }, [id]);

  const handleRegister = () => {
    if (!isAuthenticated) {
      // Store current page URL for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      setShowAuthModal(true);
      return;
    }
    
    // Navigate to ticket booking page
    navigate(`/events/${id}/book`);
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
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl"></div>
                <div className="space-y-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
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
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
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
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Events</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Layout: Left Image, Right Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Left Side - Large Event Poster */}
          <div className="relative lg:col-span-3 lg:self-end">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
              {event.image && event.image !== '/images/default-event.svg' ? (
                <img
                  src={event.image}
                  alt={event.judul || 'Event'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-event.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">Event Poster</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                <FiHeart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg transition-all duration-200"
              >
                <FiShare2 size={18} />
              </button>
            </div>
          </div>

          {/* Right Side - Event Information */}
          <div className="flex flex-col space-y-6 lg:col-span-2 lg:self-end">
            {/* Event Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {event.judul || 'Event Title'}
              </h1>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date</p>
                  <p className="text-gray-900 font-semibold">
                    {event.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'To be announced'}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiClock className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Time</p>
                  <p className="text-gray-900 font-semibold">
                    {event.waktu_mulai && event.waktu_selesai ? `${event.waktu_mulai} - ${event.waktu_selesai}` : 'To be announced'}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiMapPin className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="text-gray-900 font-semibold">{event.lokasi || 'To be announced'}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiTag className="text-blue-600" size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {event.harga_tiket && event.harga_tiket > 0 
                      ? `Rp ${event.harga_tiket.toLocaleString('id-ID')}` 
                      : 'Free'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Availability</span>
                <span className="text-sm font-semibold text-gray-900">
                  {event.terdaftar || 0} / {event.kuota || 0} spots
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((event.terdaftar || 0) / (event.kuota || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Buy Ticket Button */}
            <button
              onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isAuthenticated ? 
                (event.harga_tiket && event.harga_tiket > 0 ? 'Buy Ticket' : 'Register Free') : 
                'Login to Register'
              }
            </button>
          </div>
        </div>

        {/* Event Description - Below Left Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Side - Event Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {showFullDescription 
                  ? (event.deskripsi || 'Event description will be available soon. Stay tuned for more information about this exciting event.')
                  : (event.deskripsi && event.deskripsi.length > 300 
                      ? `${event.deskripsi.substring(0, 300)}...` 
                      : (event.deskripsi || 'Event description will be available soon. Stay tuned for more information about this exciting event.')
                    )
                }
              </p>
              {event.deskripsi && event.deskripsi.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {showFullDescription ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>

          {/* Right Side - Event Stats */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Event Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">{event.kuota || 0}</div>
                <div className="text-sm text-gray-600">Max Attendees</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {event.waktu_mulai && event.waktu_selesai ? 
                    `${parseInt(event.waktu_selesai.split(':')[0]) - parseInt(event.waktu_mulai.split(':')[0])}h` : 
                    '8h'
                  }
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {event.harga_tiket && event.harga_tiket > 0 ? 'Paid' : 'Free'}
                </div>
                <div className="text-sm text-gray-600">Entry</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">✓</div>
                <div className="text-sm text-gray-600">Certificate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Information Section */}
        <div className="border-t border-gray-200 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Schedule */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Schedule</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Event Start</div>
                  <div className="text-gray-900 font-medium">
                    {event.tanggal_mulai && event.waktu_mulai ? 
                      `${new Date(event.tanggal_mulai).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${event.waktu_mulai}` :
                      'To be announced'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Event End</div>
                  <div className="text-gray-900 font-medium">
                    {event.tanggal_selesai && event.waktu_selesai ? 
                      `${new Date(event.tanggal_selesai).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${event.waktu_selesai}` :
                      event.waktu_selesai ? `Same day at ${event.waktu_selesai}` :
                      'To be announced'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Organizer</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">EO</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Event Organizer</div>
                  <div className="text-sm text-gray-500">Trusted Event Partner</div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Instagram:</span>
                  <span className="text-gray-900 font-medium">@eventorganizer</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">WhatsApp:</span>
                  <span className="text-gray-900 font-medium">+62 812 3456 7890</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        <div className="border-t border-gray-200 pt-16 mt-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Event Menarik Lainnya</h3>
            <button 
              onClick={() => navigate('/events')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Lihat Semua
            </button>
          </div>

          {relatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="relative">
                    <img
                      src={event.flyer_path ? `http://localhost:8000${event.flyer_path}` : '/images/default-event.svg'}
                      alt={event.judul || event.title || 'Event'}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-event.svg';
                      }}
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <FiHeart className="text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.judul || event.title || 'Event Title'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {event.tanggal_mulai ? new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : (event.date || 'Tanggal akan diumumkan')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {event.harga_tiket && event.harga_tiket > 0 
                        ? `Rp ${event.harga_tiket.toLocaleString('id-ID')}` 
                        : (event.price || 'Gratis')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Tidak ada event lain yang tersedia saat ini.</p>
              <button 
                onClick={() => navigate('/events')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lihat Semua Event
              </button>
            </div>
          )}
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
