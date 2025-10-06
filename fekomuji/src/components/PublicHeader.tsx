import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiX, FiMenu, FiSearch, FiClock, FiLock } from 'react-icons/fi';

interface PublicHeaderProps {
  className?: string;
}

const PublicHeader = ({ className = '' }: PublicHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-[9999] transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'} ${className}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">MILUAN</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/events" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">Event</Link>
            <Link to="/about" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">Contact & FAQ</Link>
            
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Cari event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiSearch size={20} className="text-gray-600" />
                </button>
              )}
            </div>
            
            {/* History Menu (Disabled for non-logged users) */}
            <div className="relative">
              <button
                onClick={() => setIsHistoryMenuOpen(!isHistoryMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                title="Login required"
              >
                <FiClock size={20} className="text-gray-400" />
                <FiLock size={12} className="absolute -top-1 -right-1 text-gray-400" />
              </button>
              {isHistoryMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 text-center">
                    <FiLock size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Login diperlukan</p>
                    <p className="text-xs text-gray-500 mb-3">Masuk untuk melihat riwayat transaksi dan tiket</p>
                    <Link
                      to="/signin"
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setIsHistoryMenuOpen(false)}
                    >
                      Masuk Sekarang
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                <FiUser size={20} className="text-gray-400" />
                <FiLock size={12} className="absolute -top-1 -right-1 text-gray-400" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b text-center">
                  <FiLock size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Belum login</p>
                  <p className="text-xs text-gray-500 mt-1">Masuk untuk akses profil</p>
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
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch size={20} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
              
              <Link to="/events" className="block py-2 hover:text-gray-600">Event</Link>
              <Link to="/about" className="block py-2 hover:text-gray-600">About</Link>
              <Link to="/contact" className="block py-2 hover:text-gray-600">Contact & FAQ</Link>
              
              {/* Mobile History (Disabled) */}
              <div className="flex items-center py-2 text-gray-400">
                <FiClock size={16} className="mr-2" />
                <span className="text-sm">Riwayat</span>
                <FiLock size={12} className="ml-2" />
                <span className="text-xs ml-1">(Login required)</span>
              </div>
              
              <div className="flex space-x-4 pt-2 border-t">
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
  );
};

export default PublicHeader;
