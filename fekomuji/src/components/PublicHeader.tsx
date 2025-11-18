import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiX, FiMenu, FiSearch, FiClock, FiLock, FiLogOut, FiSettings, FiCalendar, FiCreditCard, FiChevronDown, FiStar } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const logoMiluan = new URL('../assets/img/Miluan Event.png', import.meta.url).href;

interface PublicHeaderProps {
  className?: string;
}

const PublicHeader = ({ className = '' }: PublicHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const submitSearch = () => {
    const q = searchQuery.trim();
    if (q.length === 0) return;
    navigate(`/events?q=${encodeURIComponent(q)}`);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-[9999] transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'} ${className}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Top boxed bar */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm px-3 md:px-4 lg:px-5 py-2">
          {/* Left: Logo and links */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/" className="inline-flex items-center">
              <img src={logoMiluan} alt="MILUAN" className="h-8 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link to="/events" className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">Event</Link>
              <Link to="/about" className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">About</Link>
              <Link to="/contact" className="font-medium text-gray-900 hover:text-indigo-600 transition-colors">Contact & FAQ</Link>

              {/* CTA Jadi Organizer - hanya untuk user yang login dengan role peserta */}
              {isAuthenticated && user?.role === 'peserta' && (
                <Link
                  to="/upgrade-to-panitia"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
                >
                  <FiStar className="w-4 h-4" />
                  Jadi Organizer
                </Link>
              )}
            </div>
          </div>

          {/* Middle: Search */}
          <div className="flex-1 hidden md:block">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Cari event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                className="w-full pl-5 pr-12 py-2.5 rounded-full bg-indigo-50/70 border border-indigo-100 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
              <button
                onClick={submitSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
                aria-label="Search"
              >
                <FiSearch size={16} />
              </button>
            </div>
          </div>

          {/* Right: history and user */}
          <div className="ml-auto hidden md:flex items-center space-x-2">
            {/* History Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Riwayat"
                >
                  <FiClock size={20} className="text-gray-600" />
                  <FiChevronDown size={14} className="text-gray-600" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      to="/history/events"
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <FiCalendar size={16} className="text-blue-600" />
                      <div>
                        <p className="font-medium">Riwayat Event</p>
                        <p className="text-xs text-gray-500">Event yang pernah diikuti</p>
                      </div>
                    </Link>
                    <Link
                      to="/transaksi"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <FiCreditCard size={16} className="text-green-600" />
                      <div>
                        <p className="font-medium">Riwayat Transaksi</p>
                        <p className="text-xs text-gray-500">Pembayaran dan pendaftaran</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
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
            )}

            {/* Notifications */}
            {isAuthenticated && <NotificationDropdown />}

            {/* User Menu */}
            <div className="relative group">
              {isAuthenticated ? (
                <>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <FiUser size={20} className="text-gray-600" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b text-center">
                      <FiUser size={24} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        <FiSettings size={16} />
                        Profil Saya
                      </Link>
                      <Link
                        to="/history/events"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors mt-1"
                      >
                        <FiCalendar size={16} />
                        Riwayat Event
                      </Link>
                      <Link
                        to="/transaksi"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors mt-1"
                      >
                        <FiCreditCard size={16} />
                        Riwayat Transaksi
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors mt-1"
                      >
                        <FiLogOut size={16} />
                        Keluar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                      <hr className="my-2" />
                      <Link
                        to="/organizer-login"
                        className="block w-full px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      >
                        Login Organizer
                      </Link>
                    </div>
                  </div>
                </>
              )}
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
                  onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                  className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                />
                <button
                  onClick={submitSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"
                  aria-label="Search"
                >
                  <FiSearch size={16} />
                </button>
              </div>

              <Link to="/events" className="block py-2 hover:text-gray-600">Event</Link>
              <Link to="/about" className="block py-2 hover:text-gray-600">About</Link>
              <Link to="/contact" className="block py-2 hover:text-gray-600">Contact & FAQ</Link>

              {/* CTA Jadi Organizer untuk mobile - hanya untuk user yang login dengan role peserta */}
              {isAuthenticated && user?.role === 'peserta' && (
                <Link
                  to="/upgrade-to-panitia"
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiStar className="w-4 h-4" />
                  Jadi Organizer
                </Link>
              )}

              {/* Mobile Menu Items */}
              {isAuthenticated ? (
                <>
                  <Link to="/history/events" className="flex items-center py-2 hover:text-gray-600">
                    <FiCalendar size={16} className="mr-2" />
                    Riwayat Event
                  </Link>
                  <Link to="/transaksi" className="flex items-center py-2 hover:text-gray-600">
                    <FiCreditCard size={16} className="mr-2" />
                    Riwayat Transaksi
                  </Link>
                  <Link to="/profile" className="flex items-center py-2 hover:text-gray-600">
                    <FiSettings size={16} className="mr-2" />
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center py-2 text-red-600 hover:text-red-700"
                  >
                    <FiLogOut size={16} className="mr-2" />
                    Keluar
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
      </div>
    </nav>
  );
};

export default PublicHeader;
