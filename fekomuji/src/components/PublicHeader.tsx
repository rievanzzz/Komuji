import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiX, FiMenu } from 'react-icons/fi';

interface PublicHeaderProps {
  className?: string;
}

const PublicHeader = ({ className = '' }: PublicHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            <Link to="/events" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">Event</Link>
            <Link to="/about" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">About</Link>
            <a href="#contact" className="font-medium text-gray-900 hover:text-blue-600 transition-colors">Contact & FAQ</a>
          </div>

          {/* User Menu */}
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
            <Link to="/events" className="block py-2 hover:text-gray-600">Event</Link>
            <Link to="/about" className="block py-2 hover:text-gray-600">About</Link>
            <a href="#contact" className="block py-2 hover:text-gray-600">Contact & FAQ</a>
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
  );
};

export default PublicHeader;
