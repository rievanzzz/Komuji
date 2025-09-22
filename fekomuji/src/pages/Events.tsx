import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiChevronLeft, FiChevronRight, FiHeart, FiMusic, FiBriefcase, FiCoffee, FiFilter, FiTag, FiBarChart, FiCalendar } from 'react-icons/fi';
import { MdSports, MdTheaterComedy, MdFamilyRestroom, MdPalette } from 'react-icons/md';
import { HiOutlineSparkles } from 'react-icons/hi';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface EventData {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  category: string;
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
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentOrganizerIndex, setCurrentOrganizerIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sortFilter, setSortFilter] = useState('popularity'); // popularity, tickets_sold, quota_remaining
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [noEventsMessage, setNoEventsMessage] = useState('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<string>('');

  // State for events from database
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/events?sort=${sortFilter}&per_page=12`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        // Fallback to empty array
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [sortFilter]); // Re-fetch when sort filter changes

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
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === parseInt(year);
    });
    
    if (filtered.length === 0) {
      setNoEventsMessage(`Tidak ada event di bulan ${monthName} ${year}`);
      setFilteredEvents(events); // Show all events but with message
    } else {
      setNoEventsMessage('');
      setFilteredEvents(filtered);
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
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
  };

  // Get events to display (combine filters)
  const getFilteredEvents = () => {
    let filtered = [...events];
    
    // Apply month filter if selected
    if (selectedMonth) {
      const [monthName, year] = selectedMonth.split(' ');
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === parseInt(year);
      });
    }
    
    return filtered;
  };

  const eventsToDisplay = getFilteredEvents();

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

  const eventsPerPage = 4;
  const categoriesPerPage = 4;
  const organizersPerPage = 3;

  const nextEvents = () => {
    setCurrentEventIndex((prev) => 
      prev + eventsPerPage >= events.length ? 0 : prev + eventsPerPage
    );
  };

  const prevEvents = () => {
    setCurrentEventIndex((prev) => 
      prev - eventsPerPage < 0 ? Math.max(0, events.length - eventsPerPage) : prev - eventsPerPage
    );
  };

  const nextCategories = () => {
    setCurrentCategoryIndex((prev) => 
      prev + categoriesPerPage >= categories.length ? 0 : prev + categoriesPerPage
    );
  };

  const prevCategories = () => {
    setCurrentCategoryIndex((prev) => 
      prev - categoriesPerPage < 0 ? Math.max(0, categories.length - categoriesPerPage) : prev - categoriesPerPage
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

  const visibleCategories = categories.slice(currentCategoryIndex, currentCategoryIndex + categoriesPerPage);
  const visibleOrganizers = organizers.slice(currentOrganizerIndex, currentOrganizerIndex + organizersPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Search Section */}
      <section className="bg-white pt-24 pb-8">
        <div className="container mx-auto px-4 md:px-6 pt-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search events, artists, teams, and more"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 text-lg rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm hover:shadow-md transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hero Banner Carousel */}
      <section className="bg-white pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-7xl mx-auto">
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

                {/* Like Count */}
                <div className="absolute top-8 right-8 flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-5 py-2 border border-white/20">
                  <FiHeart className="text-white text-lg" />
                  <span className="text-white font-bold">3.7K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        
        {/* Browse Events Header */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm mb-2">Browse Events</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{location}</h2>
          
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
                        <FiHeart className="mr-2 text-sm" />
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
                                    setSelectedCalendarMonth(monthYear);
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
                                        className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(category)}`}
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
                              setFilteredEvents([]);
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

        {/* Great deals near you */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Great deals near you</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(currentEventIndex / eventsPerPage) + 1} of {Math.ceil(eventsToDisplay.length / eventsPerPage)}
              </span>
              <button 
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - eventsPerPage))}
                disabled={currentEventIndex === 0}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="text-gray-600" />
              </button>
              <button 
                onClick={() => setCurrentEventIndex(Math.min(eventsToDisplay.length - eventsPerPage, currentEventIndex + eventsPerPage))}
                disabled={currentEventIndex + eventsPerPage >= eventsToDisplay.length}
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
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventsToDisplay.slice(currentEventIndex, currentEventIndex + eventsPerPage).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <FiHeart className="text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">{event.date}</p>
                  <p className="text-sm font-semibold text-gray-900">{event.price}</p>
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


        {/* Promotional Banner */}
        <div className="mb-12">
          <div className="bg-black rounded-2xl p-6 md:p-8 flex items-center justify-between overflow-hidden relative">
            {/* Dotted Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Content */}
            <div className="flex items-center space-x-6 relative z-10">
              {/* MILUAN Logo/Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
              </div>
              
              {/* Text Content */}
              <div>
                <h3 className="text-white text-lg md:text-xl font-semibold mb-1">
                  Connect your MILUAN account and sync your favorite events
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  Discover events from organizers you actually follow
                </p>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex-shrink-0 relative z-10">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                Connect MILUAN
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Categories</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(currentCategoryIndex / categoriesPerPage) + 1} of {Math.ceil(categories.length / categoriesPerPage)}
              </span>
              <button
                onClick={prevCategories}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={currentCategoryIndex === 0}
              >
                <FiChevronLeft className={currentCategoryIndex === 0 ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <button
                onClick={nextCategories}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={currentCategoryIndex + categoriesPerPage >= categories.length}
              >
                <FiChevronRight className={currentCategoryIndex + categoriesPerPage >= categories.length ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="bg-black rounded-2xl p-6 text-white cursor-pointer relative overflow-hidden h-32 group transform transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Subtle Dotted Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>
                
                {/* Plugin-based Icons */}
                <div className="absolute bottom-4 right-4 w-12 h-12 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                  {category.name === 'Sports' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#E5F0FA] to-[#D1E8FC] rounded-xl flex items-center justify-center shadow-lg">
                      <MdSports className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Concerts' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#D1E8FC] to-[#BDE0FE] rounded-xl flex items-center justify-center shadow-lg">
                      <FiMusic className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Theater' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#BDE0FE] to-[#A2D2FF] rounded-xl flex items-center justify-center shadow-lg">
                      <MdTheaterComedy className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Comedy' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#E5F0FA] to-[#D1E8FC] rounded-xl flex items-center justify-center shadow-lg">
                      <HiOutlineSparkles className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Arts & Culture' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#D1E8FC] to-[#BDE0FE] rounded-xl flex items-center justify-center shadow-lg">
                      <MdPalette className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Food & Drink' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#BDE0FE] to-[#A2D2FF] rounded-xl flex items-center justify-center shadow-lg">
                      <FiCoffee className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Business' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#E5F0FA] to-[#D1E8FC] rounded-xl flex items-center justify-center shadow-lg">
                      <FiBriefcase className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                  {category.name === 'Family' && (
                    <div className="w-full h-full bg-gradient-to-br from-[#D1E8FC] to-[#BDE0FE] rounded-xl flex items-center justify-center shadow-lg">
                      <MdFamilyRestroom className="text-[#8FC9FF] text-2xl" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <h4 className="text-lg font-medium">{category.name}</h4>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute inset-x-0 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                  <div className="bg-white text-black rounded-xl p-4 shadow-xl border border-gray-100">
                    <h5 className="font-medium text-sm mb-3 text-gray-800">{category.name}</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {category.subcategories?.slice(0, 4).map((sub, idx) => (
                        <div key={idx} className="text-gray-500 flex items-center">
                          <div className="w-1 h-1 bg-[#A2D2FF] rounded-full mr-2"></div>
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Organizers */}
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
                    
                    {/* Minimalist Heart */}
                    <button className="absolute top-5 right-5 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 group/heart">
                      <FiHeart className="text-white text-sm group-hover/heart:scale-110 transition-transform duration-200" />
                    </button>
                    
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
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default Events;
