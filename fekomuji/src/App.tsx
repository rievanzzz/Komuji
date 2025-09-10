import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiX, FiMenu, FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi';

// Card data with dynamic color system
interface CardData {
  id: string;
  category: string;
  description: string;
  eventCount: number;
  image: string;
  dominantColor: string;
  overlayColor: string;
}

// Event interface for database events
interface EventData {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path: string;
  full_flyer_path: string;
  kuota: number;
  terdaftar: number;
  harga_tiket: number;
  is_published: boolean;
  category?: {
    id: number;
    nama: string;
  };
}

const cardData: CardData[] = [
  { id: 'music', category: 'MUSIC', description: 'Concerts & Live Shows', eventCount: 25, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#ef4444', overlayColor: 'bg-red-500/40' },
  { id: 'art', category: 'ART', description: 'Workshops & Exhibitions', eventCount: 18, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#8b5cf6', overlayColor: 'bg-purple-500/40' },
  { id: 'food', category: 'FOOD', description: 'Festivals & Culinary', eventCount: 32, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#f59e0b', overlayColor: 'bg-amber-500/40' },
  { id: 'tech', category: 'TECH', description: 'Summits & Conferences', eventCount: 15, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#3b82f6', overlayColor: 'bg-blue-500/40' },
  { id: 'sports', category: 'SPORTS', description: 'Tournaments & Events', eventCount: 28, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#10b981', overlayColor: 'bg-emerald-500/40' },
  { id: 'theater', category: 'THEATER', description: 'Shows & Performances', eventCount: 12, image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#ec4899', overlayColor: 'bg-pink-500/40' },
  { id: 'culture', category: 'CULTURE', description: 'Heritage & Traditions', eventCount: 20, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#06b6d4', overlayColor: 'bg-cyan-500/40' }
];


// Bubble Chat Component - positioned separately above card with gap
const BubbleChat = ({ cardData, cardLeft }: { cardData: CardData, cardLeft: string }) => {
  // Black color for all bubbles
  const bubbleColor = '#000000';
  
  return (
    <div 
      className="absolute z-[70] pointer-events-none transition-all duration-500 ease-out"
      style={{
        left: cardLeft,
        top: 'calc(50% - 140px)', // Position above card with proper gap
        transform: 'translateX(-50%)',
        opacity: 1,
        animation: 'bubbleSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}
    >
      <style>{`
        @keyframes bubbleSlideUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(15px) scale(0.7);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0px) scale(1);
          }
        }
      `}</style>
      <div 
        className="text-white shadow-lg flex items-center justify-center transition-all duration-500 ease-out"
        style={{ 
          backgroundColor: bubbleColor,
          borderRadius: '16px',
          fontSize: '10px',
          fontWeight: '400',
          width: '65px',
          height: '32px'
        }}
      >
        <div>{cardData.category}</div>
        {/* Sharp speech bubble tail pointing down - positioned at bottom right */}
        <div 
          className="absolute transform"
          style={{
            right: '12px',
            top: 'calc(100% - 4px)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `12px solid ${bubbleColor}`
          }}
        ></div>
      </div>
    </div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [cardsRisen, setCardsRisen] = useState(false);
  const [elementsVisible, setElementsVisible] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // First: Cards rise faster
    const riseTimer = setTimeout(() => {
      setCardsRisen(true);
    }, 200);
    
    // Then: Cards spread and elements appear together with shorter delay
    const spreadTimer = setTimeout(() => {
      setCardsLoaded(true);
      setElementsVisible(true);
    }, 700);
    
    return () => {
      clearTimeout(riseTimer);
      clearTimeout(spreadTimer);
    };
  }, []);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events...');
        
        // Try multiple API endpoints
        let response;
        try {
          response = await fetch('http://localhost/Komuji/api/events?sort=terdekat');
        } catch (err) {
          console.log('First URL failed, trying alternative...');
          response = await fetch('/api/events?sort=terdekat');
        }
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        const eventsData = data.data || data || [];
        console.log('Events array:', eventsData);
        setEvents(eventsData);
        
        // If no events from API, use fallback data
        if (eventsData.length === 0) {
          console.log('No events from API, using fallback data');
          setEvents(fallbackEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Use fallback data on error
        console.log('Using fallback data due to error');
        setEvents(fallbackEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fallback mock data
  const fallbackEvents: EventData[] = [
    {
      id: 1,
      judul: "Konser Musik Rock Indonesia",
      deskripsi: "Konser musik rock terbesar di Indonesia",
      tanggal_mulai: "2024-10-15",
      tanggal_selesai: "2024-10-15",
      waktu_mulai: "19:00:00",
      waktu_selesai: "23:00:00",
      lokasi: "Jakarta International Stadium",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 5000,
      terdaftar: 3200,
      harga_tiket: 150000,
      is_published: true,
      category: { id: 1, nama: "Musik" }
    },
    {
      id: 2,
      judul: "Workshop Digital Marketing",
      deskripsi: "Belajar digital marketing dari ahlinya",
      tanggal_mulai: "2024-10-20",
      tanggal_selesai: "2024-10-20",
      waktu_mulai: "09:00:00",
      waktu_selesai: "17:00:00",
      lokasi: "Balai Kartini Jakarta",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 100,
      terdaftar: 75,
      harga_tiket: 0,
      is_published: true,
      category: { id: 2, nama: "Workshop" }
    },
    {
      id: 3,
      judul: "Pameran Seni Rupa Modern",
      deskripsi: "Pameran karya seni rupa kontemporer",
      tanggal_mulai: "2024-10-25",
      tanggal_selesai: "2024-10-30",
      waktu_mulai: "10:00:00",
      waktu_selesai: "18:00:00",
      lokasi: "Galeri Nasional Indonesia",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 500,
      terdaftar: 120,
      harga_tiket: 25000,
      is_published: true,
      category: { id: 3, nama: "Seni" }
    },
    {
      id: 4,
      judul: "Tech Conference 2024",
      deskripsi: "Konferensi teknologi terbesar tahun ini",
      tanggal_mulai: "2024-11-05",
      tanggal_selesai: "2024-11-06",
      waktu_mulai: "08:00:00",
      waktu_selesai: "17:00:00",
      lokasi: "Jakarta Convention Center",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 1000,
      terdaftar: 850,
      harga_tiket: 500000,
      is_published: true,
      category: { id: 4, nama: "Teknologi" }
    },
    {
      id: 5,
      judul: "Festival Kuliner Nusantara",
      deskripsi: "Festival makanan tradisional Indonesia",
      tanggal_mulai: "2024-11-10",
      tanggal_selesai: "2024-11-12",
      waktu_mulai: "10:00:00",
      waktu_selesai: "22:00:00",
      lokasi: "Monas Jakarta",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 2000,
      terdaftar: 1200,
      harga_tiket: 0,
      is_published: true,
      category: { id: 5, nama: "Kuliner" }
    },
    {
      id: 6,
      judul: "Turnamen E-Sports Mobile Legends",
      deskripsi: "Turnamen Mobile Legends tingkat nasional",
      tanggal_mulai: "2024-11-15",
      tanggal_selesai: "2024-11-17",
      waktu_mulai: "09:00:00",
      waktu_selesai: "21:00:00",
      lokasi: "ICE BSD Tangerang",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 64,
      terdaftar: 60,
      harga_tiket: 100000,
      is_published: true,
      category: { id: 6, nama: "Gaming" }
    },
    {
      id: 7,
      judul: "Seminar Kewirausahaan",
      deskripsi: "Seminar tentang memulai bisnis dari nol",
      tanggal_mulai: "2024-11-20",
      tanggal_selesai: "2024-11-20",
      waktu_mulai: "13:00:00",
      waktu_selesai: "17:00:00",
      lokasi: "Universitas Indonesia Depok",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 200,
      terdaftar: 180,
      harga_tiket: 50000,
      is_published: true,
      category: { id: 7, nama: "Bisnis" }
    }
  ];

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };

  // Toggle favorite
  const toggleFavorite = (eventId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  // Format date for display
  const formatEventDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr + 'T' + timeStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options).replace(',', ' •');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'}`}>
        {/* ... */}
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">Komuji</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#" className="font-medium hover:text-blue-600 transition-colors">Home</a>
              <a href="#events" className="font-medium hover:text-blue-600 transition-colors">Events</a>
              <a href="#categories" className="font-medium hover:text-blue-600 transition-colors">Categories</a>
              <a href="#about" className="font-medium hover:text-blue-600 transition-colors">About</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiUser size={20} className="text-gray-600" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b">
                    <p className="text-sm text-gray-600">Belum login</p>
                    <p className="text-xs text-gray-500 mt-1">Masuk untuk akses fitur lengkap</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/signin"
                      className="block w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors mt-1"
                    >
                      Daftar Akun
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <a href="#" className="block py-2 hover:text-gray-600">Beranda</a>
              <a href="#events" className="block py-2 hover:text-gray-600">Event</a>
              <a href="#categories" className="block py-2 hover:text-gray-600">Kategori</a>
              <a href="#about" className="block py-2 hover:text-gray-600">Tentang</a>
              <div className="flex space-x-4">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors inline-block"
                >
                  Masuk
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                >
                  Daftar
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* New Hero Section - Based on Figma Design */}
      <section className="bg-white pb-16">
        {/* Header Navigation */}
        <header className="w-full h-20 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-medium text-lg text-gray-900">Komuji</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Browse Events</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Create Event</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Login</button>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </header>
        
        {/* Main Hero Content */}
        <main className="w-full max-w-7xl mx-auto px-6 pt-16 pb-12 relative">

          {/* Headline Section */}
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: elementsVisible ? 1 : 0, y: elementsVisible ? 0 : 30 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight leading-tight max-w-5xl"
            >
              A place to display your<br />masterpiece.
            </motion.h1>
          </div>
          
          {/* 7 Card Arrangement - Horizontal Curved Layout */}
          <div className="relative w-full h-48 mb-8 flex items-center justify-center overflow-visible mt-20">
            <div className="relative w-[1200px] h-40 mx-auto">
              {/* Bubble Chat */}
              {hoveredCard && (
                <BubbleChat 
                  cardData={cardData.find(card => card.id === hoveredCard)!} 
                  cardLeft={hoveredCard === 'music' ? '12%' : hoveredCard === 'art' ? '22%' : hoveredCard === 'food' ? '32%' : hoveredCard === 'tech' ? '42%' : hoveredCard === 'sports' ? '52%' : hoveredCard === 'theater' ? '62%' : '72%'}
                />
              )}
              {/* Card 1 */}
              <div
                className="absolute w-44 h-44 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-20 group"
                style={{
                  left: cardsLoaded ? '12%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'music' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(${cardsLoaded ? '-12deg' : '0deg'}) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.25))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'music' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: cardsLoaded ? 20 : 60 - 0 * 5
                }}
                onMouseEnter={() => setHoveredCard('music')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[0].image}
                    alt="Music Concert Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="absolute w-44 h-44 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-30 group"
                style={{
                  left: cardsLoaded ? '22%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'art' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(${cardsLoaded ? '-8deg' : '0deg'}) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.25))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'art' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: cardsLoaded ? 30 : 60 - 1 * 5
                }}
                onMouseEnter={() => setHoveredCard('art')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[1].image}
                    alt="Art Workshop Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="absolute w-44 h-44 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-40 group"
                style={{
                  left: cardsLoaded ? '32%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'food' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(${cardsLoaded ? '-4deg' : '0deg'}) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.25))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'food' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: cardsLoaded ? 40 : 60 - 2 * 5
                }}
                onMouseEnter={() => setHoveredCard('food')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[2].image}
                    alt="Food Festival Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {/* Card 4 - Center (Most Prominent) */}
              <div
                className="absolute w-48 h-48 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-50 group"
                style={{
                  left: cardsLoaded ? '42%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'tech' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(0deg) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'tech' ? '0 30px 60px rgba(0, 0, 0, 0.35)' : '0 10px 30px rgba(0, 0, 0, 0.2)',
                  zIndex: cardsLoaded ? 50 : 60
                }}
                onMouseEnter={() => setHoveredCard('tech')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[3].image}
                    alt="Tech Summit Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {/* Card 5 */}
              <div
                className="absolute w-44 h-44 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-40 group"
                style={{
                  left: cardsLoaded ? '52%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'sports' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(${cardsLoaded ? '4deg' : '0deg'}) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.25))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'sports' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: cardsLoaded ? 40 : 60 - 4 * 5
                }}
                onMouseEnter={() => setHoveredCard('sports')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[4].image}
                    alt="Sports Event Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {/* Card 6 */}
              <div
                className="absolute w-44 h-44 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-30 group"
                style={{
                  left: cardsLoaded ? '62%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'theater' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(${cardsLoaded ? '8deg' : '0deg'}) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.25))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'theater' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: cardsLoaded ? 30 : 60 - 5 * 5
                }}
                onMouseEnter={() => setHoveredCard('theater')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[5].image}
                    alt="Theater Show Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

              {/* Card 7 - Right Most */}
              <div
                className="absolute w-44 h-44 rounded-xl transition-all duration-300 ease-out cursor-pointer top-1/2 -translate-y-1/2 z-20 group"
                style={{
                  left: cardsLoaded ? '72%' : '50%',
                  transform: `translateY(${cardsLoaded ? (hoveredCard === 'culture' ? '-65%' : '-50%') : cardsRisen ? '-50%' : '20%'}) rotate(${cardsLoaded ? '12deg' : '0deg'}) translateX(${cardsLoaded ? '0%' : '-50%'})`,
                  transitionDelay: cardsRisen && !cardsLoaded ? '0s' : '0s',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.25))',
                  transition: cardsRisen && !cardsLoaded ? 'transform 0.4s ease-out' : 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: hoveredCard === 'culture' ? '0 25px 50px rgba(0, 0, 0, 0.3)' : '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: cardsLoaded ? 20 : 60 - 6 * 5
                }}
                onMouseEnter={() => setHoveredCard('culture')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <img 
                    src={cardData[6].image}
                    alt="Cultural Event Poster"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Description Text Below Cards */}
          <div className="text-center mb-16 mt-8" style={{ opacity: elementsVisible ? 1 : 0, transition: 'opacity 0.8s ease-out' }}>
            <p className="text-gray-900 font-medium text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Artists can display their masterpieces, and buyers can discover and purchase works that resonate with them.
            </p>
          </div>

          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: elementsVisible ? 1 : 0, y: elementsVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: elementsVisible ? 0.3 : 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg"
            >
              Join for $99/mo
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors underline"
            >
              Read more
            </motion.button>
          </motion.div>
        </main>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 px-4 bg-white relative z-[100]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-4 gap-16 items-start">
            {/* Left side - Title only */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Why Choose <br />
                Miluan?
              </h2>
            </motion.div>

            {/* Right side - 3 Features */}
            <div className="lg:col-span-3 grid md:grid-cols-3 gap-8">
              {/* Feature 1: Easy Registration */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center relative z-[101]"
              >
                <div className="mb-6 flex justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    {/* Wallet body */}
                    <path d="M20 35c0-5 4-9 9-9h42c5 0 9 4 9 9v30c0 5-4 9-9 9H29c-5 0-9-4-9-9V35z" fill="#FF8C42" stroke="#2D3748" strokeWidth="3"/>
                    
                    {/* Wallet fold/flap */}
                    <path d="M75 35h5c3 0 5 2 5 5v8c0 3-2 5-5 5h-5" fill="#FF8C42" stroke="#2D3748" strokeWidth="3"/>
                    
                    {/* Wallet clasp/button */}
                    <circle cx="77" cy="43" r="2" fill="#2D3748"/>
                    
                    {/* Money/bills inside */}
                    <rect x="25" y="30" width="35" height="20" rx="3" fill="#68D391" stroke="#2D3748" strokeWidth="2"/>
                    <rect x="30" y="25" width="35" height="20" rx="3" fill="#9AE6B4" stroke="#2D3748" strokeWidth="2"/>
                    
                    {/* Money details */}
                    <circle cx="47" cy="35" r="3" fill="#2D3748"/>
                    <rect x="40" y="40" width="14" height="2" rx="1" fill="#2D3748"/>
                    
                    {/* Wallet lines/texture */}
                    <circle cx="25" cy="50" r="1" fill="#2D3748"/>
                    <rect x="25" y="55" width="8" height="2" rx="1" fill="#2D3748"/>
                    <circle cx="70" cy="60" r="1" fill="#2D3748"/>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Easy Registration
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Daftar event dalam hitungan detik dengan proses yang mudah dan cepat
                </p>
              </motion.div>

              {/* Feature 2: Best Event Guide */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center relative z-[101]"
              >
                <div className="mb-6 flex justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    {/* Character head */}
                    <circle cx="50" cy="35" r="18" fill="#F7FAFC" stroke="#2D3748" strokeWidth="3"/>
                    
                    {/* Eyes */}
                    <circle cx="44" cy="32" r="4" fill="#FED500"/>
                    <circle cx="56" cy="32" r="4" fill="#FED500"/>
                    
                    {/* Hat/cap */}
                    <path d="M35 25c0-8 7-15 15-15s15 7 15 15" fill="#E53E3E" stroke="#2D3748" strokeWidth="3"/>
                    <ellipse cx="50" cy="18" rx="8" ry="3" fill="#E53E3E" stroke="#2D3748" strokeWidth="2"/>
                    
                    {/* Guitar body */}
                    <ellipse cx="50" cy="65" rx="15" ry="20" fill="#D69E2E" stroke="#2D3748" strokeWidth="3"/>
                    
                    {/* Guitar neck */}
                    <rect x="48" y="45" width="4" height="20" fill="#B7791F" stroke="#2D3748" strokeWidth="2"/>
                    
                    {/* Guitar strings */}
                    <line x1="46" y1="55" x2="46" y2="75" stroke="#2D3748" strokeWidth="1"/>
                    <line x1="48" y1="55" x2="48" y2="75" stroke="#2D3748" strokeWidth="1"/>
                    <line x1="52" y1="55" x2="52" y2="75" stroke="#2D3748" strokeWidth="1"/>
                    <line x1="54" y1="55" x2="54" y2="75" stroke="#2D3748" strokeWidth="1"/>
                    
                    {/* Music notes */}
                    <circle cx="70" cy="25" r="3" fill="#2D3748"/>
                    <rect x="71" y="15" width="2" height="10" fill="#2D3748"/>
                    <circle cx="75" cy="30" r="2" fill="#2D3748"/>
                    <rect x="76" y="22" width="1.5" height="8" fill="#2D3748"/>
                    
                    {/* Motion lines */}
                    <path d="M25 40c3 0 3-3 6-3s3 3 6 3" stroke="#2D3748" strokeWidth="2" fill="none"/>
                    <path d="M25 45c3 0 3-3 6-3s3 3 6 3" stroke="#2D3748" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Best Event Guide
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Panduan lengkap dan rekomendasi event terbaik dari para ahli
                </p>
              </motion.div>

              {/* Feature 3: Safe & Supervised */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center relative z-[101]"
              >
                <div className="mb-6 flex justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    {/* Bottom hand */}
                    <path d="M40 70c0 2 1 4 3 4h14c2 0 3-2 3-4V55c0-2-1-4-3-4H43c-2 0-3 2-3 4v15z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2"/>
                    {/* Bottom hand thumb */}
                    <path d="M37 60c-2 0-3 1-3 3v4c0 2 1 3 3 3h6v-10h-6z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2"/>
                    {/* Bottom hand fingers */}
                    <path d="M42 45c0-2 1-3 2-3s2 1 2 3v10h-4v-10z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2"/>
                    <path d="M46 42c0-2 1-3 2-3s2 1 2 3v13h-4v-13z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2"/>
                    <path d="M50 43c0-2 1-3 2-3s2 1 2 3v12h-4v-12z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2"/>
                    <path d="M54 45c0-2 1-3 2-3s2 1 2 3v10h-4v-10z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2"/>
                    
                    {/* Left hand */}
                    <path d="M30 40c-2 0-4 1-4 3v14c0 2 2 3 4 3h15c2 0 4-1 4-3V43c0-2-2-3-4-3H30z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(-45 37.5 50)"/>
                    {/* Left hand thumb */}
                    <path d="M40 37c0-2 1-3 3-3h4c2 0 3 1 3 3v6h-10v-6z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(-45 45 40)"/>
                    {/* Left hand fingers */}
                    <path d="M55 42c2 0 3 1 3 2s-1 2-3 2h-10v-4h10z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(-45 50 44)"/>
                    <path d="M58 46c2 0 3 1 3 2s-1 2-3 2h-13v-4h13z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(-45 51.5 48)"/>
                    <path d="M57 50c2 0 3 1 3 2s-1 2-3 2h-12v-4h12z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(-45 51 52)"/>
                    <path d="M55 54c2 0 3 1 3 2s-1 2-3 2h-10v-4h10z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(-45 50 56)"/>
                    
                    {/* Right hand */}
                    <path d="M70 40c2 0 4 1 4 3v14c0 2-2 3-4 3H55c-2 0-4-1-4-3V43c0-2 2-3 4-3h15z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(45 62.5 50)"/>
                    {/* Right hand thumb */}
                    <path d="M60 37c0-2-1-3-3-3h-4c-2 0-3 1-3 3v6h10v-6z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(45 55 40)"/>
                    {/* Right hand fingers */}
                    <path d="M45 42c-2 0-3 1-3 2s1 2 3 2h10v-4h-10z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(45 50 44)"/>
                    <path d="M42 46c-2 0-3 1-3 2s1 2 3 2h13v-4h-13z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(45 48.5 48)"/>
                    <path d="M43 50c-2 0-3 1-3 2s1 2 3 2h12v-4h-12z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(45 49 52)"/>
                    <path d="M45 54c-2 0-3 1-3 2s1 2 3 2h10v-4h-10z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2" transform="rotate(45 50 56)"/>
                    
                    {/* Center meeting point */}
                    <circle cx="50" cy="50" r="6" fill="#FFFFFF" stroke="#2D3748" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="3" fill="#10B981"/>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Safe & Supervised
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Keamanan terjamin dengan pengawasan ketat dan sistem terpercaya
                </p>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Curved Transition to Next Section */}
        <div className="absolute -bottom-20 left-0 w-full overflow-hidden z-20">
          <svg 
            className="relative block w-full h-32" 
            viewBox="0 0 1200 160" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d5deef" />
                <stop offset="8%" stopColor="#d9e3f1" />
                <stop offset="16%" stopColor="#dde7f3" />
                <stop offset="24%" stopColor="#e1ebf5" />
                <stop offset="32%" stopColor="#e4eef7" />
                <stop offset="40%" stopColor="#e8f1f8" />
                <stop offset="48%" stopColor="#ecf3f9" />
                <stop offset="56%" stopColor="#eff5fb" />
                <stop offset="64%" stopColor="#f2f7fc" />
                <stop offset="72%" stopColor="#f5f8fd" />
                <stop offset="80%" stopColor="#f8fafd" />
                <stop offset="88%" stopColor="#fbfcfe" />
                <stop offset="96%" stopColor="#faf9f7" />
                <stop offset="100%" stopColor="#f8f6f3" />
              </linearGradient>
            </defs>
            
            {/* Single wave path */}
            <path 
              d="M0,0 C150,120 350,120 600,60 C850,0 1050,0 1200,60 L1200,160 L0,160 Z" 
              fill="url(#waveGradient)"
            />
          </svg> 
        </div>
      </section>

      {/* Event Terdeka Section - Horizontal Scroll */}
      <section className="py-16 px-4 mt-16" style={{background: 'linear-gradient(to bottom, #f8f6f3 0%, #f7f5f2 5%, #f6f4f1 10%, #f5f3f0 15%, #f4f2ef 20%, #f3f1ee 25%, #f2f0ed 30%, #f1efec 35%, #f0eeeb 40%, #efedea 45%, #eeece9 50%, #edebe8 55%, #eceae7 60%, #ebe9e6 65%, #eae8e5 70%, #e9e7e4 75%, #e8e6e3 80%, #e7e5e2 85%, #e6e4e1 90%, #e5e3e0 95%, #e4e2df 100%)'}}>
        
        <div className="container mx-auto max-w-7xl relative">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Trending Events near Unknown Location
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Discover the most popular events happening around you
            </motion.p>
          </div>

          {/* Navigation Arrows - Positioned in empty space */}
          <button 
            onClick={scrollLeft}
            className="absolute -left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
          
          <button 
            onClick={scrollRight}
            className="absolute -right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          >
            <FiChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Loading State */}
          {loading ? (
            <div className="flex space-x-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-80 h-96 bg-white rounded-2xl animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Events Horizontal Scroll */
            <div 
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-auto pb-4 relative"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {events.slice(0, 7).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-80 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.full_flyer_path || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                      alt={event.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Rank Badge */}
                    <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      #{index + 2}
                    </div>
                    
                    {/* Favorite Heart */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 transform hover:scale-110 group/heart"
                    >
                      <FiHeart 
                        className={`w-5 h-5 transition-all duration-300 ${
                          favorites.has(event.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-gray-600 group-hover/heart:text-red-500'
                        }`}
                        fill={favorites.has(event.id) ? 'currentColor' : 'none'}
                      />
                    </button>

                    {/* Simple Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 relative">
                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute -top-3 left-6 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        {event.category.nama}
                      </div>
                    )}
                    
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 mt-2">
                      {event.judul}
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>{formatEventDate(event.tanggal_mulai, event.waktu_mulai)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 leading-relaxed">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="line-clamp-2">{event.lokasi}</span>
                      </div>
                    </div>

                    {/* Price and Quota - Aligned above button */}
                    <div className="pt-4 border-t border-gray-100 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((event.terdaftar / event.kuota) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {event.terdaftar}/{event.kuota}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {event.harga_tiket === 0 ? 'FREE' : `Rp ${event.harga_tiket.toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}


export default App;
