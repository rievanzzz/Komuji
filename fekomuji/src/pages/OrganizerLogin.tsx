import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

interface OrganizerLoginFormData {
  email: string;
  password: string;
}

const OrganizerLogin = () => {
  const [formData, setFormData] = useState<OrganizerLoginFormData>({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login response data:', data);
        console.log('User role:', data.user.role);
        
        // Check if user has organizer role
        if (data.user.role === 'panitia' || data.user.role === 'admin') {
          console.log('User has organizer role, logging in...');
          login(data.token, data.user);
          console.log('Navigating to /organizer...');
          navigate('/organizer', { replace: true });
        } else {
          setErrors({ general: 'Akses ditolak. Anda tidak memiliki hak akses sebagai organizer.' });
        }
      } else {
        setErrors({ general: data.message || 'Login gagal' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Terjadi kesalahan saat login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Background card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-b from-purple-50/60 via-purple-50/30 via-indigo-50/20 via-white/80 to-white rounded-3xl p-6 shadow-xl border border-gray-200/50 relative overflow-hidden"
        >
          {/* Smooth gradient overlay for seamless transition */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-100/25 via-indigo-50/15 via-purple-50/8 to-transparent rounded-t-3xl"></div>
          
          {/* Additional smooth blend layer */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-50/20 via-purple-50/10 to-transparent rounded-t-3xl"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10">
            {/* Logo and Header */}
            <div className="text-center mb-6">
              <motion.div
                className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                whileHover={{ scale: 1.05 }}
              >
                <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Organizer Panel Login</h1>
              <p className="text-gray-600 text-sm leading-relaxed">Access your event management dashboard<br />to organize and manage events.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                >
                  {errors.general}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'hover:border-gray-300 hover:bg-white'
                    }`}
                    placeholder="Email organizer"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white transition-all duration-200 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'hover:border-gray-300 hover:bg-white'
                    }`}
                    placeholder="Password"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-all duration-200 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Access Dashboard"
                )}
              </motion.button>
            </form>

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center space-y-3"
            >
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <Link
                  to="/signin"
                  className="hover:text-gray-700 transition-colors"
                >
                  User Login
                </Link>
                <span>•</span>
                <Link
                  to="/contact"
                  className="hover:text-gray-700 transition-colors"
                >
                  Need Access?
                </Link>
              </div>
            </motion.div>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
            >
              <h3 className="font-medium text-yellow-800 mb-2 text-sm">Demo Credentials:</h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Email:</strong> organizer@komuji.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrganizerLogin;
