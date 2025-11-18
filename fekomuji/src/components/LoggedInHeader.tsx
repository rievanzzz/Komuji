import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiX, FiMenu, FiBell, FiSettings, FiLogOut, FiSearch, FiClock, FiCreditCard, FiTag, FiStar } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const logoMiluan = new URL('../assets/img/Miluan Event.png', import.meta.url).href;

interface LoggedInHeaderProps {
  className?: string;
  userName?: string;
  userAvatar?: string;
}

const LoggedInHeader = ({ className = '', userName = 'User', userAvatar }: LoggedInHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

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
          <Link to="/" className="inline-flex items-center">
            <img src={logoMiluan} alt="MILUAN" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/events" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">Event</Link>
            <Link to="/my-events" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">My Events</Link>
            <Link to="/about" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">Contact & FAQ</Link>

            {/* CTA Upgrade ke Panitia - hanya untuk user biasa */}
            {user && user.role === 'peserta' && (
              <Link
                to="/upgrade-to-panitia"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
              >
                <FiStar className="w-4 h-4 mr-2" />
                Jadi Organizer
              </Link>
            )}

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

            {/* History Menu (Burger Menu) */}
            <div className="relative">
              <button
                onClick={() => setIsHistoryMenuOpen(!isHistoryMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Riwayat"
              >
                <FiClock size={20} className="text-gray-600" />
              </button>
              {isHistoryMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-3 border-b">
                    <h3 className="text-sm font-semibold text-gray-900">Riwayat</h3>
                    <p className="text-xs text-gray-500">Transaksi dan tiket Anda</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/transactions"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsHistoryMenuOpen(false)}
                    >
                      <FiCreditCard size={16} className="mr-3 text-green-600" />
                      <div>
                        <div className="font-medium">Transaksi</div>
                        <div className="text-xs text-gray-500">Riwayat pembayaran</div>
                      </div>
                    </Link>
                    <Link
                      to="/tickets"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors mt-1"
                      onClick={() => setIsHistoryMenuOpen(false)}
                    >
                      <FiTag size={16} className="mr-3 text-blue-600" />
                      <div>
                        <div className="font-medium">Tiket</div>
                        <div className="text-xs text-gray-500">Tiket event Anda</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Menu for Logged In Users */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <FiBell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 mt-1">Logged in user</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        // Handle logout logic here
                        localStorage.removeItem('token');
                        navigate('/events'); // Redirect to events page after logout
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors mt-1"
                    >
                      <FiLogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch size={20} className="absolute right-3 top-2.5 text-gray-400" />
            </div>

            <Link to="/events" className="block py-2 hover:text-gray-600">Event</Link>
            <Link to="/my-events" className="block py-2 hover:text-gray-600">My Events</Link>
            <Link to="/about" className="block py-2 hover:text-gray-600">About</Link>
            <Link to="/contact" className="block py-2 hover:text-gray-600">Contact & FAQ</Link>

            {/* Mobile History */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Riwayat</div>
              <Link to="/transactions" className="flex items-center py-2 hover:text-gray-600">
                <FiCreditCard size={16} className="mr-2 text-green-600" />
                Transaksi
              </Link>
              <Link to="/tickets" className="flex items-center py-2 hover:text-gray-600">
                <FiTag size={16} className="mr-2 text-blue-600" />
                Tiket
              </Link>
            </div>

            <div className="border-t pt-4">
              <Link to="/profile" className="block py-2 hover:text-gray-600">Profile</Link>
              <Link to="/settings" className="block py-2 hover:text-gray-600">Settings</Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/events');
                  setIsMenuOpen(false);
                }}
                className="block py-2 text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LoggedInHeader;
