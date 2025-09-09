import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiX, FiMenu } from 'react-icons/fi';

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

const cardData: CardData[] = [
  { id: 'music', category: 'MUSIC', description: 'Concerts & Live Shows', eventCount: 25, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#ef4444', overlayColor: 'bg-red-500/40' },
  { id: 'art', category: 'ART', description: 'Workshops & Exhibitions', eventCount: 18, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#8b5cf6', overlayColor: 'bg-purple-500/40' },
  { id: 'food', category: 'FOOD', description: 'Festivals & Culinary', eventCount: 32, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#f59e0b', overlayColor: 'bg-amber-500/40' },
  { id: 'tech', category: 'TECH', description: 'Summits & Conferences', eventCount: 15, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#3b82f6', overlayColor: 'bg-blue-500/40' },
  { id: 'sports', category: 'SPORTS', description: 'Tournaments & Events', eventCount: 28, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#10b981', overlayColor: 'bg-emerald-500/40' },
  { id: 'theater', category: 'THEATER', description: 'Shows & Performances', eventCount: 12, image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#ec4899', overlayColor: 'bg-pink-500/40' },
  { id: 'culture', category: 'CULTURE', description: 'Heritage & Traditions', eventCount: 20, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', dominantColor: '#06b6d4', overlayColor: 'bg-cyan-500/40' }
];

// Mock data for upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: "Olahraga",
    description: "Berbagai event olahraga menarik",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    icon: "🏃‍♂️"
  },
  {
    id: 2,
    title: "Pertunjukan",
    description: "Konser dan pertunjukan seni",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    icon: "🎭"
  },
  {
    id: 3,
    title: "Seminar / Konferensi",
    description: "Event edukasi dan networking",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    icon: "📊"
  },
  {
    id: 4,
    title: "Pameran / Eksibisi",
    description: "Pameran dan eksibisi menarik",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    icon: "🎨"
  }
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
      <section className="min-h-screen bg-white">
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
      <section className="relative py-20 px-4 bg-white">
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
                className="text-center"
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
                className="text-center"
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
                className="text-center"
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
      </section>


    </div>
  );
}

export default App;
