import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiX, FiMenu, FiBell, FiSettings, FiLogOut } from 'react-icons/fi';

interface LoggedInHeaderProps {
  className?: string;
  userName?: string;
  userAvatar?: string;
}

const LoggedInHeader = ({ className = '', userName = 'User', userAvatar }: LoggedInHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
          <div className="hidden md:flex space-x-8">
            <Link to="/dashboard" className="font-medium hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/events" className="font-medium hover:text-blue-600 transition-colors">Event</Link>
            <Link to="/my-events" className="font-medium hover:text-blue-600 transition-colors">My Events</Link>
            <a href="#about" className="font-medium hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="font-medium hover:text-blue-600 transition-colors">Contact & FAQ</a>
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
                    >
                      <FiUser size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <FiSettings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <button
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
            <Link to="/dashboard" className="block py-2 hover:text-gray-600">Dashboard</Link>
            <Link to="/events" className="block py-2 hover:text-gray-600">Event</Link>
            <Link to="/my-events" className="block py-2 hover:text-gray-600">My Events</Link>
            <a href="#about" className="block py-2 hover:text-gray-600">About</a>
            <a href="#contact" className="block py-2 hover:text-gray-600">Contact & FAQ</a>
            <div className="border-t pt-4">
              <Link to="/profile" className="block py-2 hover:text-gray-600">Profile</Link>
              <Link to="/settings" className="block py-2 hover:text-gray-600">Settings</Link>
              <button className="block py-2 text-red-600 hover:text-red-700">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LoggedInHeader;
