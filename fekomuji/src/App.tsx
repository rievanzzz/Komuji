import { motion } from "framer-motion";
import { FiMenu, FiX, FiCheckCircle, FiSmartphone, FiCode } from "react-icons/fi";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

// Popular events data for carousel
const popularEvents = [
  {
    id: 1,
    title: "Tech Conference 2024",
    date: "15 Jan 2024",
    location: "Jakarta Convention Center",
    price: "Rp 250.000",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "Music Festival",
    date: "20 Feb 2024",
    location: "GBK Senayan",
    price: "Rp 350.000",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    title: "Art Exhibition",
    date: "5 Mar 2024",
    location: "National Gallery",
    price: "Rp 100.000",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 4,
    title: "Food Festival",
    date: "12 Mar 2024",
    location: "Kemang Village",
    price: "Rp 75.000",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  }
];


function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'}`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">Komuji</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#" className="font-medium hover:text-gray-600">📅 Events</a>
              <a href="#categories" className="font-medium hover:text-gray-600">Categories</a>
              <a href="#about" className="font-medium hover:text-gray-600">About</a>
            </div>

            <div className="hidden md:flex space-x-4">
              <Link 
                to="/signin"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 inline-block text-center"
              >
                Masuk
              </Link>
              <Link 
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block text-center"
              >
                Daftar
              </Link>
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

      {/* Hero Section */}
      <section className="relative px-4 bg-white h-screen">
        <div className="container mx-auto h-full pt-32 pb-20">
          <div className="grid md:grid-cols-2 gap-12 h-full relative">
            {/* Animated SVG Pattern Background for Right Side */}
            <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden z-0">
              <svg
                className="absolute inset-0 w-full h-full z-10"
                viewBox="0 0 400 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="animated-lines"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <motion.path
                      d="M0,20 Q20,0 40,20 T80,20"
                      stroke="rgba(59, 130, 246, 0.4)"
                      strokeWidth="2"
                      fill="none"
                      animate={{
                        d: [
                          "M0,20 Q20,0 40,20 T80,20",
                          "M0,20 Q20,40 40,20 T80,20",
                          "M0,20 Q20,0 40,20 T80,20"
                        ]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.path
                      d="M0,10 Q20,30 40,10 T80,10"
                      stroke="rgba(147, 51, 234, 0.3)"
                      strokeWidth="2"
                      fill="none"
                      animate={{
                        d: [
                          "M0,10 Q20,30 40,10 T80,10",
                          "M0,10 Q20,-10 40,10 T80,10",
                          "M0,10 Q20,30 40,10 T80,10"
                        ]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    <motion.path
                      d="M0,30 Q20,10 40,30 T80,30"
                      stroke="rgba(236, 72, 153, 0.25)"
                      strokeWidth="2"
                      fill="none"
                      animate={{
                        d: [
                          "M0,30 Q20,10 40,30 T80,30",
                          "M0,30 Q20,50 40,30 T80,30",
                          "M0,30 Q20,10 40,30 T80,30"
                        ]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                      }}
                    />
                  </pattern>
                </defs>
                
                <motion.rect
                  width="100%"
                  height="100%"
                  fill="url(#animated-lines)"
                  animate={{
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Floating dots */}
                <motion.circle
                  cx="80"
                  cy="150"
                  r="4"
                  fill="rgba(59, 130, 246, 0.6)"
                  animate={{
                    cy: [150, 130, 150],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.circle
                  cx="320"
                  cy="250"
                  r="3"
                  fill="rgba(147, 51, 234, 0.5)"
                  animate={{
                    cy: [250, 270, 250],
                    opacity: [0.15, 0.5, 0.15]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                />
                <motion.circle
                  cx="150"
                  cy="400"
                  r="2"
                  fill="rgba(236, 72, 153, 0.4)"
                  animate={{
                    cy: [400, 380, 400],
                    opacity: [0.1, 0.4, 0.1]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 3
                  }}
                />
              </svg>
            </div>
            {/* Left Side - H1 */}
            <div className="relative">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold leading-tight absolute bottom-[-2rem] left-0"
              >
                Temukan Event Terbaik <br /> di Sekitarmu
              </motion.h1>
            </div>

            {/* Right Side - Single Floating Event Card with Full Background Pattern */}
            <div className="flex items-center justify-center relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="w-full max-w-sm relative z-10"
              >
                <h3 className="text-lg font-semibold mb-6 text-center">Event Popular</h3>
                
                {/* Single Floating Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -8, 0], 
                    rotateX: 0,
                    boxShadow: [
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                    ]
                  }}
                  transition={{ 
                    duration: 0.8,
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    boxShadow: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{
                    y: -20,
                    rotateX: 8,
                    rotateY: 5,
                    scale: 1.08,
                    boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer transform-gpu"
                  style={{
                    transformStyle: "preserve-3d"
                  }}
                >
                  <div className="relative">
                    {/* Card Image */}
                    <div className="h-48 overflow-hidden">
                      <motion.img
                        src={popularEvents[0].image}
                        alt={popularEvents[0].title}
                        className="w-full h-full object-cover"
                        animate={{
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.4 }
                        }}
                      />
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6">
                      <motion.h4 
                        className="font-bold text-xl mb-3 text-gray-800"
                        whileHover={{
                          color: "#3b82f6",
                          transition: { duration: 0.2 }
                        }}
                      >
                        {popularEvents[0].title}
                      </motion.h4>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="mr-2">📅</span> {popularEvents[0].date}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="mr-2">📍</span> {popularEvents[0].location}
                        </p>
                      </div>
                      
                      <motion.p 
                        className="text-xl font-bold text-green-600"
                        whileHover={{
                          color: "#dc2626",
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {popularEvents[0].price}
                      </motion.p>
                    </div>
                    
                    {/* Floating glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 rounded-2xl"
                      animate={{
                        opacity: [0, 0.3, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      whileHover={{
                        opacity: 0.5,
                        transition: { duration: 0.3 }
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* Event Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Kategori Event Populer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Temukan event berdasarkan kategori yang Anda minati</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-32 overflow-hidden relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center">
                    {event.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How it works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Cara Mendaftar Event</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">Hanya dalam beberapa langkah mudah, Anda bisa mendapatkan tiket untuk event favorit Anda.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pilih Event</h3>
              <p className="text-gray-600">Temukan event yang Anda minati dari daftar kami.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Registrasi</h3>
              <p className="text-gray-600">Isi data diri Anda pada form pendaftaran.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bayar</h3>
              <p className="text-gray-600">Lakukan pembayaran dengan metode yang Anda pilih.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dapat Tiket</h3>
              <p className="text-gray-600">Tiket digital akan dikirim langsung ke email Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Tickets Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-white rounded-lg p-8 text-center shadow-lg">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 transform rotate-3">
                    <FiCode className="text-blue-600 mx-auto mb-2" size={32} />
                    <div className="text-xs text-gray-900">QR Code</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 transform -rotate-2">
                    <FiSmartphone className="text-blue-600 mx-auto mb-2" size={32} />
                    <div className="text-xs text-gray-900">Scan</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 transform rotate-1">
                    <FiCheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                    <div className="text-xs text-gray-900">Check-in</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Proses check-in yang cepat dan mudah</div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Tiket Digital Praktis</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Dapatkan tiket digital berbentuk QR code yang dapat disimpan di smartphone Anda. Tidak perlu repot mencetak tiket fisik atau khawatir kehilangan tiket.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Cukup tunjukkan QR code di smartphone Anda saat check-in di lokasi event. Proses masuk menjadi lebih cepat dan efisien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Berbagai Metode Pembayaran</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Kami menyediakan berbagai pilihan pembayaran yang aman dan mudah untuk kemudahan Anda dalam membeli tiket event.
            </p>
          </div>

          {/* Payment Icons */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Visa.svg/1200px-Visa.svg.png" alt="Visa" className="h-8" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <img src="https://upload.wikimedia.org/wikipedia/id/thumb/e/e8/Gopay_logo.svg/1200px-Gopay_logo.svg.png" alt="Gopay" className="h-8" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/1200px-Logo_dana_blue.svg.png" alt="Dana" className="h-8" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/1200px-Logo_ovo_purple.svg.png" alt="OVO" className="h-8" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <span className="text-blue-600 font-bold text-sm">BNI</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <span className="text-blue-600 font-bold text-sm">Mandiri</span>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Respected Clients</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Beberapa klien utama yang pernah bekerjasama, tak lupa kami sampaikan 
              apresiasi sekaligus ucapan terimakasih atas kepercayaan yang diberikan
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="text-gray-400 font-bold text-lg">KAMINDO</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="text-gray-400 font-bold text-lg">BALL RAVEN</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="text-gray-400 font-bold text-lg">nielsen</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="text-gray-400 font-bold text-lg">BROMO MARATHON</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Menemukan Event Impian Anda?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Bergabunglah dengan ribuan orang yang telah menemukan event menarik melalui platform kami.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors">
              Jelajahi Event
            </button>
            <button className="px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-white hover:text-blue-600 transition-colors">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-xl">K</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">© Copyright 2024 Galantasia ID</div>
                  <div className="text-xs text-gray-500">Hak cipta dilindungi dan Undang-Undang</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Home</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kebijakan Layanan</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Kebijakan Layanan</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <div className="mb-4">
              <span className="text-blue-400">hello@galantasia.com</span>
            </div>
            <div className="text-lg font-semibold">
              WhatsApp <span className="text-white">0877-61-343-777</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
