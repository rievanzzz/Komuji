import React, { useState, useEffect, useRef } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiChevronLeft, FiChevronRight, FiFilter, FiTag, FiBarChart, FiCalendar, FiMusic, FiBriefcase, FiCoffee, FiGrid, FiCode, FiBookOpen, FiActivity } from 'react-icons/fi';
import { MdSports, MdTheaterComedy, MdFamilyRestroom, MdPalette } from 'react-icons/md';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { AuthModal } from '../components';
import { useAuth } from '../contexts/AuthContext';

// Price Display Component
interface PriceDisplayProps {
  eventId: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ eventId }) => {
  const [priceRange, setPriceRange] = useState<string>('Loading...');

  useEffect(() => {
    const fetchTicketCategories = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/events/${eventId}/ticket-categories`);
        if (response.ok) {
          const categories = await response.json();

          if (categories && categories.length > 0) {
            const prices = categories
              .filter((cat: any) => cat.is_active)
              .map((cat: any) => parseFloat(cat.harga))
              .sort((a: number, b: number) => a - b);

            if (prices.length === 0) {
              setPriceRange('Tidak tersedia');
            } else if (prices[0] === 0 && prices.length === 1) {
              setPriceRange('Gratis');
            } else if (prices[0] === 0) {
              const maxPrice = Math.max(...prices.filter((p: number) => p > 0));
              setPriceRange(`Gratis - Rp ${maxPrice.toLocaleString('id-ID')}`);
            } else if (prices[0] === prices[prices.length - 1]) {
              setPriceRange(`Rp ${prices[0].toLocaleString('id-ID')}`);
            } else {
              setPriceRange(`Mulai dari Rp ${prices[0].toLocaleString('id-ID')}`);
            }
          } else {
            setPriceRange('Gratis');
          }
        } else {
          setPriceRange('Gratis');
        }
      } catch (error) {
        console.error('Error fetching ticket categories:', error);
        setPriceRange('Gratis');
      }
    };

    fetchTicketCategories();
  }, [eventId]);

  return <span>{priceRange}</span>;
};

interface EventData {
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
  date?: string;
  location?: string;
  price?: string;
  image?: string;
  category?: string;
  ticketsSold?: number;
  totalQuota?: number;
  popularity?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  illustration?: string;
  subcategories?: string[];
}

interface Organizer {
  id: string;
  name: string;
  image: string;
  category: string;
  eventsCount: number;
  monthlyTicketSales: string;
  popularityScore: number;
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location] = useState('Jakarta, ID');
  const routerLocation = useRouterLocation();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentOrganizerIndex, setCurrentOrganizerIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sortFilter, setSortFilter] = useState('popularity'); // popularity, tickets_sold, quota_remaining
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [noEventsMessage, setNoEventsMessage] = useState('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [dbCategories, setDbCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [categoryFilter, setCategoryFilter] = useState<{ id?: number; name?: string }>({});
  const categoryStripRef = useRef<HTMLDivElement>(null);
  const [catIndex, setCatIndex] = useState(0);
  const categoriesPerView = 5;
  const visibleCats = dbCategories.slice(catIndex, catIndex + categoriesPerView);

  // State for events from database
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // No transform needed - use data directly like homepage

  const iconForCategory = (name: string) => {
    const n = (name || '').toLowerCase();
    // Bootcamp / Education / Training
    if (n.includes('bootcamp') || n.includes('academy') || n.includes('class') || n.includes('kelas') || n.includes('training') || n.includes('pelatihan') || n.includes('pendidikan') || n.includes('education') || n.includes('school') || n.includes('sekolah') || n.includes('kampus')) {
      return <FiBookOpen className="text-blue-600 text-lg" />;
    }
    // Expo / Pameran / Fair
    if (n.includes('expo') || n.includes('pameran') || n.includes('fair') || n.includes('bazaar')) {
      return <FiGrid className="text-blue-600 text-lg" />;
    }
    // Hackathon / Coding
    if (n.includes('hackathon') || n.includes('coding') || n.includes('developer') || n.includes('programmer') || n.includes('code')) {
      return <FiCode className="text-blue-600 text-lg" />;
    }
    // Health
    if (n.includes('kesehatan') || n.includes('health') || n.includes('medical') || n.includes('medis')) {
      return <FiActivity className="text-blue-600 text-lg" />;
    }
    if (n.includes('musik') || n.includes('music') || n.includes('konser') || n.includes('concert')) {
      return <FiMusic className="text-blue-600 text-lg" />;
    }
    if (n.includes('olahraga') || n.includes('sport')) {
      return <MdSports className="text-blue-600 text-xl" />;
    }
    if (n.includes('teater') || n.includes('theater') || n.includes('drama') || n.includes('komedi') || n.includes('comedy')) {
      return <MdTheaterComedy className="text-blue-600 text-xl" />;
    }
    if (n.includes('seni') || n.includes('budaya') || n.includes('culture') || n.includes('art')) {
      return <MdPalette className="text-blue-600 text-xl" />;
    }
    if (n.includes('makan') || n.includes('minum') || n.includes('food') || n.includes('drink')) {
      return <FiCoffee className="text-blue-600 text-lg" />;
    }
    if (n.includes('bisnis') || n.includes('business')) {
      return <FiBriefcase className="text-blue-600 text-lg" />;
    }
    if (n.includes('keluarga') || n.includes('family')) {
      return <MdFamilyRestroom className="text-blue-600 text-xl" />;
    }
    return <FiTag className="text-blue-600 text-lg" />;
  };

  // Fetch events from database with search support
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events...');

        // Build API URL with search and pagination
        let apiUrl = 'http://localhost:8000/api/events?sort=terdekat&per_page=50';
        const trimmed = (searchTerm || '').trim();
        if (trimmed.length > 0) {
          apiUrl += `&search=${encodeURIComponent(trimmed)}`;
        }
        if (categoryFilter.id) {
          apiUrl += `&category_id=${categoryFilter.id}`;
        } else if (categoryFilter.name && categoryFilter.name.trim().length > 0) {
          apiUrl += `&category=${encodeURIComponent(categoryFilter.name.trim())}`;
        }

        const response = await fetch(apiUrl);
        console.log('API URL:', apiUrl);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        const eventsData = data.data || data || [];
        console.log('Events array:', eventsData);
        console.log('Search term:', searchTerm);
        setEvents(eventsData);

        // Always use real data from API, don't fallback to mock data
        console.log('Using real data from API, events count:', eventsData.length);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Show empty state instead of fallback data to force real database usage
        console.log('API failed - showing empty state to force database connection');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, categoryFilter]); // Re-fetch when search term or category filter changes

  // Load categories (public)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categories');
        const data = await res.json().catch(() => ({ data: [] }));
        setDbCategories((data.data || []).map((c: any) => ({ id: c.id, name: c.name })));
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    loadCategories();
  }, []);

  // Sync search term and category filter with URL params
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const q = params.get('q') || '';
    const cid = params.get('category_id');
    const cname = params.get('category') || '';
    setSearchTerm(q);
    setCategoryFilter({ id: cid ? Number(cid) : undefined, name: cname || undefined });
  }, [routerLocation.search]);

  // Calendar helper functions
  const generateCalendarDays = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7)); // Start from Monday

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    return days;
  };

  // Filter events by month
  const filterEventsByMonth = (monthYear: string) => {
    const [monthName, year] = monthYear.split(' ');
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

    const filtered = events.filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === parseInt(year);
    });

    if (filtered.length === 0) {
      setNoEventsMessage(`Tidak ada event di bulan ${monthName} ${year}`);
    } else {
      setNoEventsMessage('');
    }
  };

  // Category color mapping
  const getCategoryColor = (category: string) => {
    const colors = {
      'Workshop': 'bg-blue-500',
      'Konser': 'bg-red-500',
      'Concert': 'bg-red-500',
      'Music': 'bg-red-500',
      'Olahraga': 'bg-green-500',
      'Sports': 'bg-green-500',
      'Seminar': 'bg-purple-500',
      'Conference': 'bg-purple-500',
      'Festival': 'bg-yellow-500',
      'Art': 'bg-pink-500',
      'Technology': 'bg-indigo-500',
      'Business': 'bg-gray-500',
      'default': 'bg-blue-400'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  // Get events for a specific date
  const getEventsForDate = (date: number, month: number, year: number) => {
    return events.filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year;
    });
  };

  // Get events to display (only apply month filter, search is handled by API)
  const getFilteredEvents = () => {
    let filtered = [...events];

    // Apply month filter if selected
    if (selectedMonth) {
      const [monthName, year] = selectedMonth.split(' ');
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === parseInt(year);
      });
    }
    // Search is now handled by API, no need for local filtering

    return filtered;
  };

  const eventsToDisplay = getFilteredEvents();
  const isSearching = searchTerm.trim().length > 0;

  // Simple debug
  console.log('Events loaded:', events.length, 'Displaying:', eventsToDisplay.length);

  // Handle event card click
  const handleEventClick = (event: EventData) => {
    if (!isAuthenticated) {
      setSelectedEventTitle(event.title || event.judul || 'Event');
      setShowAuthModal(true);
      return;
    }
    // Navigate to event detail page
    navigate(`/events/${event.id}`);
  };

  // Top Organizers data
  const organizers: Organizer[] = [
    {
      id: '1',
      name: 'Premier League',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop&crop=center',
      category: 'Football',
      eventsCount: 38,
      monthlyTicketSales: '245K',
      popularityScore: 95
    },
    {
      id: '2',
      name: 'NBA',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&crop=center',
      category: 'Basketball',
      eventsCount: 82,
      monthlyTicketSales: '189K',
      popularityScore: 92
    },
    {
      id: '3',
      name: 'Reality Club',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
      category: 'Indonesian Band',
      eventsCount: 24,
      monthlyTicketSales: '67K',
      popularityScore: 88
    },
    {
      id: '4',
      name: 'Bruno Mars',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop&crop=center',
      category: 'Pop Artist',
      eventsCount: 45,
      monthlyTicketSales: '312K',
      popularityScore: 97
    },
    {
      id: '5',
      name: 'UFC',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop&crop=center',
      category: 'Mixed Martial Arts',
      eventsCount: 52,
      monthlyTicketSales: '156K',
      popularityScore: 90
    },
    {
      id: '6',
      name: 'Formula 1',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center',
      category: 'Motorsport',
      eventsCount: 23,
      monthlyTicketSales: '278K',
      popularityScore: 94
    },
    {
      id: '7',
      name: 'Coldplay',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop&crop=center',
      category: 'Rock Band',
      eventsCount: 67,
      monthlyTicketSales: '423K',
      popularityScore: 98
    }
  ];

  const categories: Category[] = [
    {
      id: '1',
      name: 'Sports',
      icon: '🏈',
      color: 'bg-black',
      subcategories: ['Football', 'Basketball', 'Baseball', 'Soccer', 'Tennis', 'Swimming']
    },
    {
      id: '2',
      name: 'Concerts',
      icon: '🎸',
      color: 'bg-black',
      subcategories: ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Electronic']
    },
    {
      id: '3',
      name: 'Theater',
      icon: '🎭',
      color: 'bg-black',
      subcategories: ['Drama', 'Musical', 'Comedy', 'Opera', 'Ballet', 'Contemporary']
    },
    {
      id: '4',
      name: 'Comedy',
      icon: '😂',
      color: 'bg-black',
      subcategories: ['Stand-up', 'Improv', 'Sketch', 'Roast', 'Open Mic', 'Comedy Show']
    },
    {
      id: '5',
      name: 'Arts & Culture',
      icon: '🎨',
      color: 'bg-black',
      subcategories: ['Exhibition', 'Gallery', 'Museum', 'Workshop', 'Festival', 'Art Fair']
    },
    {
      id: '6',
      name: 'Food & Drink',
      icon: '🍷',
      color: 'bg-black',
      subcategories: ['Wine Tasting', 'Food Festival', 'Cooking Class', 'Beer Garden', 'Fine Dining', 'Street Food']
    },
    {
      id: '7',
      name: 'Business',
      icon: '💼',
      color: 'bg-black',
      subcategories: ['Conference', 'Networking', 'Workshop', 'Seminar', 'Trade Show', 'Startup Event']
    },
    {
      id: '8',
      name: 'Family',
      icon: '👨‍👩‍👧‍👦',
      color: 'bg-black',
      subcategories: ['Kids Show', 'Family Fun', 'Educational', 'Outdoor', 'Interactive', 'Holiday Event']
    }
  ];

  const banners = [
    {
      id: 1,
      title: 'The',
      subtitle: 'Eagles',
      category: 'Concert • Featured Event',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=faces',
      bgColor: 'bg-purple-800'
    },
    {
      id: 2,
      title: 'Manchester',
      subtitle: 'United',
      category: 'Premier League',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop&crop=center',
      bgColor: 'bg-blue-600'
    },
    {
      id: 3,
      title: 'Lakers vs',
      subtitle: 'Warriors',
      category: 'NBA • Championship',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&crop=center',
      bgColor: 'bg-blue-600'
    }
  ];


  // Auto-scroll banner every 4 seconds with progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentBannerIndex((prevIndex) =>
            prevIndex === banners.length - 1 ? 0 : prevIndex + 1
          );
          return 0;
        }
        return prev + 0.5; // Increment by 0.5% every 16ms for ultra smooth filling
      });
    }, 16); // 60fps update rate

    return () => clearInterval(interval);
  }, [banners.length]);

  const categoriesPerPage = 4;
  const organizersPerPage = 3;


  const nextCategories = () => {
    setCurrentCategoryIndex((prev) =>
      prev + categoriesPerPage >= dbCategories.length ? 0 : prev + categoriesPerPage
    );
  };

  const prevCategories = () => {
    setCurrentCategoryIndex((prev) =>
      prev - categoriesPerPage < 0 ? Math.max(0, dbCategories.length - categoriesPerPage) : prev - categoriesPerPage
    );
  };

  const nextOrganizers = () => {
    setCurrentOrganizerIndex((prev) =>
      prev + organizersPerPage >= organizers.length ? 0 : prev + organizersPerPage
    );
  };

  const prevOrganizers = () => {
    setCurrentOrganizerIndex((prev) =>
      prev - organizersPerPage < 0 ? Math.max(0, organizers.length - organizersPerPage) : prev - organizersPerPage
    );
  };

  const visibleCategories = dbCategories.slice(currentCategoryIndex, currentCategoryIndex + categoriesPerPage);
  const visibleOrganizers = organizers.slice(currentOrganizerIndex, currentOrganizerIndex + organizersPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Top spacer to account for fixed header */}
      <div className="pt-24" />

      {/* Hero Banner Carousel */}
      {!isSearching && (
      <section className="bg-white pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative">
            <div className="relative h-80 md:h-96 lg:h-[26rem] rounded-3xl overflow-hidden shadow-2xl">
              {/* Blue Left Section with Diagonal Cut */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-blue-600"></div>
                {/* Diagonal cut using clip-path */}
                <div
                  className="absolute inset-0 bg-blue-600"
                  style={{
                    clipPath: 'polygon(0 0, 60% 0, 45% 100%, 0 100%)'
                  }}
                ></div>
              </div>

              {/* Right Image Section */}
              <div className="absolute inset-0">
                <img
                  key={currentBannerIndex}
                  src={banners[currentBannerIndex].imageUrl}
                  alt={`${banners[currentBannerIndex].title} ${banners[currentBannerIndex].subtitle}`}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center">
                {/* Left Content */}
                <div className="w-1/2 px-8 md:px-12 lg:px-16">
                  <div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-500 ease-in-out">
                      {banners[currentBannerIndex].title}<br />
                      {banners[currentBannerIndex].subtitle}
                    </h2>
                    <button className="bg-white/15 backdrop-blur-md text-white border border-white/40 px-6 py-3 rounded-xl font-semibold hover:bg-white/25 transition-all duration-300 shadow-lg mb-8">
                      See Tickets
                    </button>

                    {/* Enhanced Progress Bar System - Below Button */}
                    <div className="flex items-center space-x-3">
                      {banners.map((_, index) => (
                        <div
                          key={index}
                          className="relative cursor-pointer group"
                          onClick={() => {
                            setCurrentBannerIndex(index);
                            setProgress(0);
                          }}
                        >
                          {/* Active Banner - Ultra Smooth Progress Bar */}
                          {index === currentBannerIndex ? (
                            <div className="relative">
                              {/* Progress Bar Container */}
                              <div className="w-12 h-1.5 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
                                {/* Active Progress Fill - Maximum Smoothness */}
                                <div
                                  className="h-full bg-white rounded-full will-change-transform transform-gpu"
                                  style={{
                                    width: `${progress}%`,
                                    transform: 'translate3d(0, 0, 0)',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    WebkitTransform: 'translate3d(0, 0, 0)',
                                    transition: 'width 0.016s linear',
                                    willChange: 'width',
                                    contain: 'layout style paint'
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            /* Inactive Banners - Clean Dots */
                            <div className="relative">
                              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                                index < currentBannerIndex
                                  ? 'bg-white'
                                  : 'bg-white/50'
                              }`}></div>
                              {/* Subtle Hover for Dots */}
                              <div className="absolute -inset-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Category Strip - below banner */}
        {!isSearching && dbCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Kategori</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCatIndex(prev => Math.max(0, prev - categoriesPerView))}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
                  aria-label="Sebelumnya"
                  disabled={catIndex === 0}
                >
                  <FiChevronLeft className="text-gray-600" />
                </button>
                <button
                  onClick={() => setCatIndex(prev => Math.min(Math.max(0, dbCategories.length - categoriesPerView), prev + categoriesPerView))}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
                  aria-label="Berikutnya"
                  disabled={catIndex + categoriesPerView >= dbCategories.length}
                >
                  <FiChevronRight className="text-gray-600" />
                </button>
              </div>
            </div>
            <div
              className="flex justify-center gap-8"
              onWheel={(e) => {
                const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                if (Math.abs(delta) < 4) return;
                e.preventDefault();
                if (delta > 0) {
                  setCatIndex((prev) => Math.min(Math.max(0, dbCategories.length - categoriesPerView), prev + 1));
                } else {
                  setCatIndex((prev) => Math.max(0, prev - 1));
                }
              }}
            >
              {visibleCats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/events?category_id=${c.id}`)}
                  className="flex flex-col items-center w-24 group"
                  title={c.name}
                  aria-label={c.name}
                >
                  <span className={`w-16 h-16 rounded-full bg-white border ${categoryFilter.id === c.id ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'} shadow-sm flex items-center justify-center group-hover:border-blue-400 group-hover:shadow-md transition-all`}>
                    {iconForCategory(c.name)}
                  </span>
                  <span className="mt-2 text-sm text-gray-700 w-full text-center truncate" title={c.name}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Browse Events Header */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm mb-2">Browse Events</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{isSearching ? `Search results${searchTerm ? ` for "${searchTerm}"` : ''}` : location}</h2>

          {/* Simple Filter Interface */}
          <div className="flex flex-wrap items-center gap-3 relative">
            {/* Location Filter */}
            <div className="flex items-center px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
              <FiMapPin className="mr-2 text-sm" />
              <span className="text-sm font-medium">Jakarta, ID</span>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all duration-200"
              >
                <FiFilter className="mr-2 text-blue-600 text-sm" />
                <span className="text-sm font-medium text-gray-700">Filter</span>
              </button>

              {/* Simple Dropdown */}
              <AnimatePresence>
                {showFilterModal && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-[200px]"
                  >
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSortFilter('popularity');
                          setShowFilterModal(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          sortFilter === 'popularity'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FiBarChart className="mr-2 text-sm" />
                        Most Popular
                      </button>

                      <button
                        onClick={() => {
                          setSortFilter('tickets_sold');
                          setShowFilterModal(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          sortFilter === 'tickets_sold'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FiBarChart className="mr-2 text-sm" />
                        Most Sold
                      </button>

                      <button
                        onClick={() => {
                          setSortFilter('quota_remaining');
                          setShowFilterModal(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          sortFilter === 'quota_remaining'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FiTag className="mr-2 text-sm" />
                        Most Quota
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all duration-200"
              >
                <FiCalendar className="mr-2 text-blue-600 text-sm" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedMonth ? `${selectedMonth}` : 'Search by Date'}
                </span>
                {selectedMonth && (
                  <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>

              {/* Calendar Dropdown */}
              <AnimatePresence>
                {showDateFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-[320px]"
                  >
                    {/* Calendar Component */}
                    <div className="calendar">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => {
                            const newDate = new Date(currentCalendarMonth);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setCurrentCalendarMonth(newDate);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiChevronLeft className="text-gray-600" />
                        </button>
                        <h3 className="font-semibold text-gray-900">
                          {currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                          onClick={() => {
                            const newDate = new Date(currentCalendarMonth);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setCurrentCalendarMonth(newDate);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiChevronRight className="text-gray-600" />
                        </button>
                      </div>

                      {/* Days of week */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((day, index) => {
                          const dayEvents = day.isCurrentMonth ? getEventsForDate(day.date, currentCalendarMonth.getMonth(), currentCalendarMonth.getFullYear()) : [];
                          const hasEvents = dayEvents.length > 0;
                          const uniqueCategories = [...new Set(dayEvents.map(event => event.category))];

                          return (
                            <div
                              key={index}
                              className="relative"
                              onMouseEnter={() => setHoveredDate(day.isCurrentMonth ? day.date : null)}
                              onMouseLeave={() => setHoveredDate(null)}
                            >
                              <button
                                onClick={() => {
                                  if (day.isCurrentMonth && hasEvents) {
                                    const monthYear = `${currentCalendarMonth.toLocaleDateString('en-US', { month: 'long' })} ${currentCalendarMonth.getFullYear()}`;
                                    setSelectedMonth(monthYear);
                                  }
                                }}
                                className={`
                                  w-8 h-8 text-sm rounded-full flex items-center justify-center transition-all duration-200 relative
                                  ${day.isCurrentMonth
                                    ? 'text-gray-900 hover:bg-blue-100'
                                    : 'text-gray-300'
                                  }
                                  ${day.isToday
                                    ? 'bg-black text-white'
                                    : ''
                                  }
                                  ${day.isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}
                                  ${hasEvents && !day.isToday ? 'font-bold' : ''}
                                `}
                              >
                                {day.date}

                                {/* Event indicators */}
                                {hasEvents && (
                                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                                    {uniqueCategories.slice(0, 3).map((category, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(category || 'default')}`}
                                      />
                                    ))}
                                    {uniqueCategories.length > 3 && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    )}
                                  </div>
                                )}
                              </button>

                              {/* Hover tooltip for event info */}
                              {hoveredDate === day.date && hasEvents && day.isCurrentMonth && (
                                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                                  <div className="text-center">
                                    <div className="font-semibold text-sm mb-1">
                                      🎉 {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                      {uniqueCategories.slice(0, 2).join(' • ')}
                                      {uniqueCategories.length > 2 && ` • +${uniqueCategories.length - 2} lainnya`}
                                    </div>
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Confirmation buttons below entire calendar - always visible */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => {
                              const monthYear = `${currentCalendarMonth.toLocaleDateString('en-US', { month: 'long' })} ${currentCalendarMonth.getFullYear()}`;
                              setSelectedMonth(monthYear);
                              filterEventsByMonth(monthYear);
                              setHoveredDate(null);
                              setShowDateFilter(false);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                          >
                            Oke
                          </button>
                          <button
                            onClick={() => {
                              setHoveredDate(null);
                              setShowDateFilter(false);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-md"
                          >
                            Batal
                          </button>
                        </div>
                      </div>

                      {/* Clear Filter */}
                      {selectedMonth && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedMonth('');
                              setNoEventsMessage('');
                              setShowDateFilter(false);
                            }}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Clear Date Filter
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search Results (only when searching) */}
        {isSearching && (
          <div className="mb-12">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : eventsToDisplay.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Tidak ada event yang cocok dengan pencarian.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {eventsToDisplay.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="relative">
                      <img
                        src={event.image || (event.flyer_path ? `http://localhost:8000/storage/${event.flyer_path}` : '/images/default-event.svg')}
                        alt={event.judul || event.title || 'Event'}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-event.svg';
                        }}
                      />
                      {(((event.ticketsSold ?? (event as any).terdaftar ?? 0) as number) >= ((event.totalQuota ?? (event as any).kuota ?? 0) as number)) && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          Kehabisan tiket
                        </span>
                      )}
                      {event.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200">
                          {event.category}
                        </span>
                      )}
                      {/* Removed favorite button */}
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
                      {event.category && (
                        <p className="text-xs text-blue-600 font-medium mb-1">{event.category}</p>
                      )}
                      <p className="text-sm font-semibold text-gray-900">
                        <PriceDisplay eventId={event.id} />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Great deals near you */}
        {!isSearching && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Great deals near you</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(currentEventIndex / 8) + 1} of {Math.ceil(eventsToDisplay.length / 8)}
              </span>
              <button
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 8))}
                disabled={currentEventIndex === 0}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentEventIndex(Math.min(eventsToDisplay.length - 8, currentEventIndex + 8))}
                disabled={currentEventIndex + 8 >= eventsToDisplay.length}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* No Events Message */}
          {noEventsMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-center font-medium">{noEventsMessage}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : eventsToDisplay.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Tidak ada event untuk kategori/filters ini saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventsToDisplay.slice(currentEventIndex, currentEventIndex + 8).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleEventClick(event)}
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => {
                      console.log(`✅ Image loaded successfully for: ${event.title} - ${event.image}`);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log(`❌ Image failed to load for: ${event.title} - ${event.image}`);
                      // If uploaded image fails, show placeholder
                      target.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-48 bg-gray-100 flex items-center justify-center';
                      placeholder.innerHTML = `
                        <div class="text-center text-gray-400">
                          <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                          <p class="text-xs">Image Failed</p>
                        </div>
                      `;
                      target.parentElement?.appendChild(placeholder);
                    }}
                  />
                  {(((event.ticketsSold ?? (event as any).terdaftar ?? 0) as number) >= ((event.totalQuota ?? (event as any).kuota ?? 0) as number)) && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Kehabisan tiket
                    </span>
                  )}
                  {/* Removed favorite button */}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {event.date}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.price}
                  </p>
                  {event.ticketsSold && event.totalQuota && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {event.ticketsSold.toLocaleString()} sold
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.popularity === 'trending' ? 'bg-red-100 text-red-600' :
                        event.popularity === 'hot' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {event.popularity}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Promotional Banner removed per request */}

        {/* Latest Events */}
        {!isSearching && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Latest Events</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(currentEventIndex / 8) + 1} of {Math.ceil(eventsToDisplay.length / 8)}
              </span>
              <button
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 8))}
                disabled={currentEventIndex === 0}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentEventIndex(Math.min(eventsToDisplay.length - 8, currentEventIndex + 8))}
                disabled={currentEventIndex + 8 >= eventsToDisplay.length}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="text-gray-600" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventsToDisplay.slice(8, 16).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleEventClick(event)}
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => {
                      console.log(`✅ Image loaded successfully for: ${event.title} - ${event.image}`);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log(`❌ Image failed to load for: ${event.title} - ${event.image}`);
                      // If uploaded image fails, show placeholder
                      target.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-48 bg-gray-100 flex items-center justify-center';
                      placeholder.innerHTML = `
                        <div class="text-center text-gray-400">
                          <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                          <p class="text-xs">Image Failed</p>
                        </div>
                      `;
                      target.parentElement?.appendChild(placeholder);
                    }}
                  />
                  {/* Removed favorite button */}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {event.date}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.price}
                  </p>
                  {event.ticketsSold && event.totalQuota && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {event.ticketsSold.toLocaleString()} sold
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.popularity === 'trending' ? 'bg-red-100 text-red-600' :
                        event.popularity === 'hot' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {event.popularity}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>
        )}

        {/* Regular Events */}
        {!isSearching && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Regular Events</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(currentEventIndex / 8) + 1} of {Math.ceil(eventsToDisplay.length / 8)}
              </span>
              <button
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 8))}
                disabled={currentEventIndex === 0}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentEventIndex(Math.min(eventsToDisplay.length - 8, currentEventIndex + 8))}
                disabled={currentEventIndex + 8 >= eventsToDisplay.length}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="text-gray-600" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventsToDisplay.slice(16, 24).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleEventClick(event)}
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => {
                      console.log(`✅ Image loaded successfully for: ${event.title} - ${event.image}`);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log(`❌ Image failed to load for: ${event.title} - ${event.image}`);
                      // If uploaded image fails, show placeholder
                      target.style.display = 'none';
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-48 bg-gray-100 flex items-center justify-center';
                      placeholder.innerHTML = `
                        <div class="text-center text-gray-400">
                          <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                          <p class="text-xs">Image Failed</p>
                        </div>
                      `;
                      target.parentElement?.appendChild(placeholder);
                    }}
                  />
                  {/* Removed favorite button */}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {event.date}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {event.price}
                  </p>
                  {event.ticketsSold && event.totalQuota && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {event.ticketsSold.toLocaleString()} sold
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.popularity === 'trending' ? 'bg-red-100 text-red-600' :
                        event.popularity === 'hot' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {event.popularity}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>
        )}

        {/* Categories grid removed per request */}

        {/* Top Organizers */}
        {!isSearching && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Top Organizers</h3>
              <p className="text-gray-600 text-sm">Discover events from the most popular organizers</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 font-medium">
                {Math.floor(currentOrganizerIndex / organizersPerPage) + 1} of {Math.ceil(organizers.length / organizersPerPage)}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={prevOrganizers}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentOrganizerIndex === 0}
                >
                  <FiChevronLeft className="text-gray-600 text-lg" />
                </button>
                <button
                  onClick={nextOrganizers}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={currentOrganizerIndex + organizersPerPage >= organizers.length}
                >
                  <FiChevronRight className="text-gray-600 text-lg" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleOrganizers.map((organizer, index) => (
              <motion.div
                key={organizer.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative h-56 overflow-hidden rounded-t-3xl">
                    <img
                      src={organizer.image}
                      alt={organizer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-3xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                    {/* Removed favorite button */}

                    {/* Clean Name Overlay */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <h4 className="text-white text-xl font-semibold mb-1 tracking-tight">{organizer.name}</h4>
                      <p className="text-white/80 text-sm font-medium">{organizer.category}</p>
                    </div>
                  </div>

                  {/* Clean Stats Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{organizer.eventsCount}</div>
                        <div className="text-xs text-gray-500 font-medium">Events</div>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{organizer.monthlyTicketSales}</div>
                        <div className="text-xs text-gray-500 font-medium">Monthly Sales</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <PublicFooter />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        eventTitle={selectedEventTitle}
      />
    </div>
  );
};

export default Events;
