import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<EventData[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Mock events data
  const getMockEvents = (): EventData[] => [
    {
      id: 1,
      judul: "Eagles at Cowboys",
      deskripsi: "NFL Football Game",
      tanggal_mulai: "2024-11-23",
      tanggal_selesai: "2024-11-23",
      waktu_mulai: "19:00:00",
      waktu_selesai: "23:00:00",
      lokasi: "AT&T Stadium",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 80000,
      terdaftar: 75000,
      harga_tiket: 65,
      is_published: true,
      category: { id: 1, nama: "Sports" }
    },
    {
      id: 2,
      judul: "My Chemical Romance with...",
      deskripsi: "Rock Concert",
      tanggal_mulai: "2024-09-13",
      tanggal_selesai: "2024-09-13",
      waktu_mulai: "20:00:00",
      waktu_selesai: "23:00:00",
      lokasi: "Madison Square Garden",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 20000,
      terdaftar: 19500,
      harga_tiket: 133,
      is_published: true,
      category: { id: 2, nama: "Music" }
    },
    {
      id: 3,
      judul: "DJ Pauly D",
      deskripsi: "Electronic Dance Music",
      tanggal_mulai: "2024-10-24",
      tanggal_selesai: "2024-10-24",
      waktu_mulai: "22:00:00",
      waktu_selesai: "04:00:00",
      lokasi: "XS Nightclub",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 3000,
      terdaftar: 2800,
      harga_tiket: 77,
      is_published: true,
      category: { id: 3, nama: "Music" }
    },
    {
      id: 4,
      judul: "Pittsburgh at West Virginia",
      deskripsi: "College Football",
      tanggal_mulai: "2024-09-13",
      tanggal_selesai: "2024-09-13",
      waktu_mulai: "15:00:00",
      waktu_selesai: "18:00:00",
      lokasi: "Mountaineer Field",
      flyer_path: "",
      full_flyer_path: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      kuota: 60000,
      terdaftar: 58000,
      harga_tiket: 150,
      is_published: true,
      category: { id: 4, nama: "Sports" }
    }
  ];

  useEffect(() => {
    setEvents(getMockEvents());
  }, []);

  // Format event date
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format price
  const formatPrice = (price: number) => {
    return `From Rp ${(price * 15000).toLocaleString('id-ID')}`;
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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* SeatGeek Header Navigation */}
      <header className="relative z-50 bg-black/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-red-500 font-bold text-2xl">
                SEAT<br/>GEEK
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white hover:text-gray-300 font-medium transition-colors">Sports</a>
              <a href="#" className="text-white hover:text-gray-300 font-medium transition-colors">Music</a>
              <a href="#" className="text-white hover:text-gray-300 font-medium transition-colors">Shows</a>
              <a href="#" className="text-white hover:text-gray-300 font-medium transition-colors">Cities</a>
            </nav>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <span className="text-gray-300 flex items-center">
                  <span className="mr-1">🇨🇦</span> CAD
                </span>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Sell</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section with Cinematic Background */}
      <div className="relative h-screen bg-black">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/src/assets/img/2.jpg" 
            alt="Stadium at night" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
        </div>
        

        {/* Hero Content - SeatGeek Style */}
        <div className="relative container mx-auto px-4 pt-20 pb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-2xl"
          >
            Let there be live
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 mb-8 font-light drop-shadow-lg"
          >
            Your next best-night-ever is waiting
          </motion.p>

          {/* Search Bar - SeatGeek Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <div className="relative">
              <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500" size={24} />
              <input
                type="text"
                placeholder="What do you want to see live?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-white text-black rounded-2xl text-xl font-medium placeholder-gray-500 focus:outline-none focus:ring-0 shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        {/* Trending Events Section */}
        <div className="relative -mt-20 pb-16 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Trending Events</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-gray-600/50">
                  <FiChevronLeft className="text-gray-400" size={14} />
                  <span className="text-xs text-gray-300 font-medium">2 of 4</span>
                  <FiChevronRight className="text-gray-400" size={14} />
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-4 gap-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-black/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-40">
                    <img
                      src={event.full_flyer_path}
                      alt={event.judul}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Heart Button */}
                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-200"
                    >
                      <FiHeart
                        size={16}
                        className={favorites.has(event.id) ? 'text-red-500 fill-current' : 'text-white'}
                      />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-white truncate">
                      {event.judul}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {formatEventDate(event.tanggal_mulai)}
                    </p>
                    <p className="text-white font-bold text-base">
                      {formatPrice(event.harga_tiket)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Browse Events Section - SeatGeek Style */}
      <section className="bg-white py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Location Header */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Browse Events</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bandung, ID</h2>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Change Location
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Filter by date
              </button>
            </div>
          </div>

          {/* Categories Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Categories</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">1 of 4</span>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-4 gap-4">
            {/* Seminar Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mb-4">
                  {/* Seminar Illustration */}
                  <div className="w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      {/* Podium */}
                      <rect x="20" y="40" width="24" height="20" rx="2" fill="#374151" />
                      {/* Speaker */}
                      <circle cx="32" cy="25" r="6" fill="#F3E8FF" />
                      <ellipse cx="32" cy="35" rx="5" ry="8" fill="#3B82F6" />
                      {/* Microphone */}
                      <rect x="30" y="30" width="4" height="8" rx="2" fill="#6B7280" />
                      <circle cx="32" cy="28" r="2" fill="#374151" />
                      {/* Audience */}
                      <circle cx="15" cy="50" r="3" fill="#F3E8FF" />
                      <circle cx="49" cy="50" r="3" fill="#F3E8FF" />
                      <circle cx="10" cy="55" r="2.5" fill="#F3E8FF" />
                      <circle cx="54" cy="55" r="2.5" fill="#F3E8FF" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-lg text-center">Seminar</h4>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Workshop Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-black rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mb-4">
                  {/* Workshop Illustration */}
                  <div className="w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      {/* Tools */}
                      <rect x="20" y="25" width="3" height="20" rx="1" fill="#D97706" />
                      <rect x="25" y="20" width="3" height="25" rx="1" fill="#92400E" />
                      <rect x="30" y="30" width="3" height="15" rx="1" fill="#F59E0B" />
                      {/* Hands working */}
                      <circle cx="40" cy="35" r="4" fill="#F3E8FF" />
                      <ellipse cx="45" cy="40" rx="3" ry="5" fill="#F3E8FF" />
                      {/* Workbench */}
                      <rect x="15" y="45" width="35" height="4" rx="1" fill="#6B7280" />
                      <rect x="18" y="49" width="3" height="8" fill="#374151" />
                      <rect x="43" y="49" width="3" height="8" fill="#374151" />
                      {/* Sparks/creativity */}
                      <circle cx="50" cy="20" r="1.5" fill="#FBBF24" />
                      <circle cx="55" cy="25" r="1" fill="#FBBF24" />
                      <circle cx="52" cy="30" r="1.2" fill="#FBBF24" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-lg text-center">Workshop</h4>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Webinar Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-black rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mb-4">
                  {/* Webinar Illustration */}
                  <div className="w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      {/* Laptop */}
                      <rect x="15" y="35" width="34" height="20" rx="2" fill="#374151" />
                      <rect x="17" y="37" width="30" height="16" rx="1" fill="#1F2937" />
                      {/* Screen content */}
                      <rect x="19" y="39" width="26" height="12" rx="1" fill="#3B82F6" />
                      {/* Person on screen */}
                      <circle cx="32" cy="44" r="3" fill="#F3E8FF" />
                      <ellipse cx="32" cy="49" rx="2" ry="3" fill="#F3E8FF" />
                      {/* Webcam */}
                      <circle cx="32" cy="32" r="2" fill="#EF4444" />
                      {/* WiFi signals */}
                      <path d="M45 15 Q50 20 55 15" stroke="#10B981" strokeWidth="2" fill="none" />
                      <path d="M47 18 Q50 21 53 18" stroke="#10B981" strokeWidth="2" fill="none" />
                      <path d="M49 21 Q50 22 51 21" stroke="#10B981" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-lg text-center">Webinar</h4>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>

            {/* Hackathon Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-black rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="mb-4">
                  {/* Hackathon Illustration */}
                  <div className="w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      {/* Computer */}
                      <rect x="20" y="30" width="24" height="16" rx="2" fill="#374151" />
                      <rect x="22" y="32" width="20" height="12" rx="1" fill="#1F2937" />
                      {/* Code on screen */}
                      <rect x="24" y="34" width="4" height="1" fill="#10B981" />
                      <rect x="30" y="34" width="6" height="1" fill="#3B82F6" />
                      <rect x="24" y="36" width="8" height="1" fill="#EF4444" />
                      <rect x="34" y="36" width="4" height="1" fill="#F59E0B" />
                      <rect x="24" y="38" width="6" height="1" fill="#8B5CF6" />
                      <rect x="32" y="38" width="8" height="1" fill="#10B981" />
                      <rect x="24" y="40" width="10" height="1" fill="#3B82F6" />
                      {/* Keyboard */}
                      <rect x="18" y="47" width="28" height="6" rx="1" fill="#6B7280" />
                      {/* Hands typing */}
                      <ellipse cx="26" cy="50" rx="3" ry="2" fill="#F3E8FF" />
                      <ellipse cx="38" cy="50" rx="3" ry="2" fill="#F3E8FF" />
                      {/* Energy/lightning */}
                      <path d="M50 15 L48 25 L52 25 L50 35" stroke="#FBBF24" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-white font-bold text-lg text-center">Hackathon</h4>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Events;