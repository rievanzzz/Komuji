import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiHeart, FiShare2, FiArrowLeft, FiTag, FiUser, FiInstagram } from 'react-icons/fi';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { AuthModal } from '../components';
import { useAuth } from '../contexts/AuthContext';

interface EventDetailData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  image: string;
  category: string;
  organizer: string;
  capacity: number;
  registered: number;
  gallery?: string[];
  socialMedia?: {
    instagram?: string;
    website?: string;
  };
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

  // Fetch event detail from API
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/events/${id}`);
        
        if (!response.ok) {
          throw new Error('Event not found');
        }
        
        const data = await response.json();
        
        // Transform API data to match our interface
        const eventDetail: EventDetailData = {
          id: data.id,
          title: data.judul || data.title,
          description: data.deskripsi || data.description || 'No description available',
          date: data.tanggal_mulai || data.date,
          time: `${data.waktu_mulai || '09:00'} - ${data.waktu_selesai || '17:00'}`,
          location: data.lokasi || data.location || 'Location TBA',
          price: data.price || 'Free',
          image: data.flyer_path || data.image || '/api/placeholder/800/400',
          category: data.category || 'General',
          organizer: data.organizer || 'Event Organizer',
          capacity: data.kuota || 100,
          registered: data.terdaftar || 0,
          gallery: data.gallery || [],
          socialMedia: data.socialMedia || {}
        };
        
        setEvent(eventDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  const handleRegister = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // TODO: Implement registration logic
    console.log('Register for event:', event?.title);
    alert('Registration functionality will be implemented soon!');
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

  const availableSpots = event.capacity - event.registered;
  const registrationProgress = (event.registered / event.capacity) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Image & Gallery */}
            <div className="lg:col-span-2">
              {/* Main Event Image */}
              <div className="relative mb-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[300px] lg:h-[350px] object-cover rounded-lg"
                />
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white transition-all"
                  >
                    <FiShare2 size={16} />
                  </button>
                </div>
              </div>

              {/* Gallery */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* First gallery image or placeholder */}
                <img
                  src={event.gallery?.[0] || event.image}
                  alt={`${event.title} gallery 1`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <img
                  src={event.gallery?.[1] || event.image}
                  alt={`${event.title} gallery 2`}
                  className="w-full h-20 object-cover rounded-lg"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{event.description}</p>
              </div>

              {/* Lineup Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lineup</h3>
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FiUser size={20} />
                  </div>
                  <p className="text-sm">Belum Ada Lineup</p>
                </div>
              </div>
            </div>

            {/* Right Column - Event Details & Registration */}
            <div className="lg:col-span-1 bg-white rounded-lg p-6 h-fit">
              {/* Event Title */}
              <div className="mb-6">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">{event.title}</h1>
              </div>

              {/* Event Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-blue-600" size={18} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString('id-ID', { 
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FiClock className="text-blue-600" size={18} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{event.time}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMapPin className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <div className="text-sm font-medium text-gray-900 leading-relaxed">{event.location}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Dibuat Oleh</div>
                  <div className="text-sm font-semibold text-gray-900">{event.organizer}</div>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-1">Mulai Dari</div>
                <div className="text-2xl font-bold text-gray-900 mb-4">{event.price}</div>
                
                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {isAuthenticated ? 'Beli Sekarang' : 'Login untuk Membeli'}
                </button>
              </div>

              {/* Social Media */}
              {event.socialMedia?.instagram && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Media Sosial</h4>
                  <a
                    href={event.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm font-medium"
                  >
                    <FiInstagram size={16} />
                    <span>Instagram</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        eventTitle={event.title}
      />
    </div>
  );
};

export default EventDetail;
