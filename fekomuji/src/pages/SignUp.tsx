import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface SignUpFormData {
  name: string;
  email: string;
  no_handphone: string;
  alamat: string;
  pendidikan_terakhir: string;
  password: string;
  password_confirmation: string;
}

interface OtpFormData {
  otp: string;
}

const SignUp = () => {
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    no_handphone: "",
    alamat: "",
    pendidikan_terakhir: "",
    password: "",
    password_confirmation: ""
  });
  const [otpData, setOtpData] = useState<OtpFormData>({
    otp: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);


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

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpData({
      otp: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.no_handphone.trim()) {
      newErrors.no_handphone = "Nomor telepon wajib diisi";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat wajib diisi";
    }

    if (!formData.pendidikan_terakhir) {
      newErrors.pendidikan_terakhir = "Pendidikan terakhir wajib dipilih";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password harus mengandung huruf besar";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password harus mengandung huruf kecil";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password harus mengandung angka";
    } else if (!/[\W_]/.test(formData.password)) {
      newErrors.password = "Password harus mengandung karakter spesial";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Call Laravel API /api/register
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          no_handphone: formData.no_handphone,
          alamat: formData.alamat,
          pendidikan_terakhir: formData.pendidikan_terakhir,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep('otp');
        setErrors({}); // Clear any previous errors
      } else {
        // Handle validation errors from Laravel
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Registrasi gagal' });
        }
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setErrors({ general: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpData.otp.trim()) {
      setErrors({ otp: 'Kode OTP wajib diisi' });
      return;
    }

    setLoading(true);
    try {
      // Call Laravel API /api/verify-otp
      const response = await fetch('http://localhost:8000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpData.otp
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        // Redirect to login or dashboard
        window.location.href = '/signin';
      } else {
        // Handle different types of errors
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ otp: data.message || 'Kode OTP tidak valid' });
        }
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      setErrors({ otp: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      // Call Laravel API /api/resend-otp
      const response = await fetch('http://localhost:8000/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        alert('Kode OTP berhasil dikirim ulang ke email Anda');
        setErrors({}); // Clear any previous errors
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ otp: data.message || 'Gagal mengirim ulang kode OTP' });
        }
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      setErrors({ otp: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Complex Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          {/* Floating SVG Elements */}
          <motion.div
            className="absolute top-16 left-8"
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-gray-200">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#5eed9c', stopOpacity:0.1}} />
                  <stop offset="100%" style={{stopColor:'#004aad', stopOpacity:0.1}} />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8,4"/>
              <circle cx="40" cy="40" r="20" fill="url(#grad1)"/>
              <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.15"/>
            </svg>
          </motion.div>

          <motion.div
            className="absolute top-32 right-12"
            animate={{ 
              y: [0, 20, 0],
              x: [0, -15, 0],
              rotate: [0, -8, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="60" height="60" viewBox="0 0 60 60" className="text-gray-300">
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#004aad', stopOpacity:0.08}} />
                  <stop offset="100%" style={{stopColor:'#5eed9c', stopOpacity:0.08}} />
                </linearGradient>
              </defs>
              <rect x="15" y="15" width="30" height="30" fill="url(#grad2)" stroke="currentColor" strokeWidth="1.5" rx="6"/>
              <rect x="22" y="22" width="16" height="16" fill="currentColor" opacity="0.1" rx="3"/>
              <circle cx="30" cy="30" r="4" fill="currentColor" opacity="0.2"/>
            </svg>
          </motion.div>

          <motion.div
            className="absolute bottom-24 left-12"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg width="70" height="70" viewBox="0 0 70 70" className="text-gray-200">
              <defs>
                <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{stopColor:'#5eed9c', stopOpacity:0.15}} />
                  <stop offset="100%" style={{stopColor:'transparent', stopOpacity:0}} />
                </radialGradient>
              </defs>
              <polygon points="35,8 50,28 35,48 20,28" fill="url(#grad3)" stroke="currentColor" strokeWidth="1.5"/>
              <polygon points="35,18 42,28 35,38 28,28" fill="currentColor" opacity="0.1"/>
              <circle cx="35" cy="28" r="3" fill="currentColor" opacity="0.3"/>
            </svg>
          </motion.div>

          <motion.div
            className="absolute top-48 right-6"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="45" height="45" viewBox="0 0 45 45" className="text-gray-300">
              <defs>
                <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#004aad', stopOpacity:0.2}} />
                  <stop offset="100%" style={{stopColor:'#5eed9c', stopOpacity:0.2}} />
                </linearGradient>
              </defs>
              <path d="M22.5 5 L32 22.5 L22.5 40 L13 22.5 Z" fill="url(#grad4)" stroke="currentColor" strokeWidth="1"/>
              <circle cx="22.5" cy="22.5" r="6" fill="currentColor" opacity="0.15"/>
            </svg>
          </motion.div>

          {/* Additional decorative elements */}
          <motion.div
            className="absolute bottom-40 right-20"
            animate={{ 
              y: [0, -12, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="35" height="35" viewBox="0 0 35 35" className="text-gray-400">
              <circle cx="17.5" cy="17.5" r="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2"/>
              <circle cx="17.5" cy="17.5" r="4" fill="currentColor" opacity="0.1"/>
            </svg>
          </motion.div>

          <motion.div
            className="absolute top-72 left-24"
            animate={{ 
              x: [0, 8, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ 
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="25" height="25" viewBox="0 0 25 25" className="text-gray-300">
              <rect x="8" y="8" width="9" height="9" fill="currentColor" opacity="0.1" rx="2"/>
              <rect x="8" y="8" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" rx="2"/>
            </svg>
          </motion.div>
        </div>

        {/* Additional Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-1/4 right-1/4"
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100/20 to-green-100/20 rounded-full blur-xl"></div>
          </motion.div>

          <motion.div
            className="absolute bottom-1/3 left-1/4"
            animate={{ 
              y: [0, 25, 0],
              opacity: [0.05, 0.2, 0.05],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-100/30 to-blue-100/30 rounded-full blur-lg"></div>
          </motion.div>

          {/* Connecting Lines */}
          <motion.svg 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            width="400" 
            height="300" 
            viewBox="0 0 400 300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 2, duration: 2 }}
          >
            <motion.path
              d="M50,150 Q200,50 350,150 Q200,250 50,150"
              fill="none"
              stroke="url(#connectionGradient)"
              strokeWidth="1"
              strokeDasharray="5,10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5eed9c" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#004aad" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#5eed9c" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-8 h-screen font-sans overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Brand Header - Compact */}
            <motion.div 
              className="flex items-center space-x-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center cursor-pointer shadow-lg relative overflow-hidden"
                whileHover={{ 
                  rotate: 12,
                  scale: 1.1,
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="text-white font-bold text-base relative z-10">M</span>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-black">Miluan</h1>
                <p className="text-gray-500 text-xs -mt-1">Event Platform</p>
              </div>
            </motion.div>

            {/* Hero Section - Compact */}
            <div className="mb-8">
              <motion.h2 
                className="text-3xl font-bold text-black mb-3 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Wujudkan Event
                <br />
                <span className="bg-gradient-to-r from-gray-600 to-black bg-clip-text text-transparent relative">
                  Impian Anda
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gray-400 to-black"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 1 }}
                  />
                </span>
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-base leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Platform all-in-one untuk mengelola event dengan mudah, 
                dari perencanaan hingga eksekusi yang sempurna.
              </motion.p>
            </div>

            {/* Feature Cards - Ultra Compact */}
            <div className="space-y-3">
              <motion.div 
                className="group flex items-center space-x-3 p-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100 cursor-pointer hover:bg-white/95 transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ 
                  x: 12,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)"
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300 relative z-10"
                  whileHover={{ scale: 1.2, rotate: 15 }}
                >
                  <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                </motion.div>
                <div className="flex-1 relative z-10">
                  <h3 className="font-semibold text-black text-sm mb-0.5">Event Creation</h3>
                  <p className="text-gray-600 text-xs">Template siap pakai, setup cepat</p>
                </div>
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
                  whileHover={{ x: 4 }}
                >
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </motion.div>

              <motion.div 
                className="group flex items-center space-x-3 p-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100 cursor-pointer hover:bg-white/95 transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                whileHover={{ 
                  x: 12,
                  boxShadow: "0 8px 25px rgba(94, 237, 156, 0.2)"
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/50 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300 relative z-10"
                  whileHover={{ scale: 1.2, rotate: -15 }}
                >
                  <motion.div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{backgroundColor: '#5eed9c'}}
                    whileHover={{ 
                      boxShadow: "0 0 12px rgba(94, 237, 156, 0.6)",
                      scale: 1.2
                    }}
                  />
                </motion.div>
                <div className="flex-1 relative z-10">
                  <h3 className="font-semibold text-black text-sm mb-0.5">Digital Ticketing</h3>
                  <p className="text-gray-600 text-xs">Payment gateway terintegrasi</p>
                </div>
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
                  whileHover={{ x: 4 }}
                >
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </motion.div>

              <motion.div 
                className="group flex items-center space-x-3 p-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100 cursor-pointer hover:bg-white/95 transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{ 
                  x: 12,
                  boxShadow: "0 8px 25px rgba(0, 74, 173, 0.2)"
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 relative z-10"
                  whileHover={{ scale: 1.2, rotate: 15 }}
                >
                  <motion.div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{backgroundColor: '#004aad'}}
                    whileHover={{ 
                      boxShadow: "0 0 12px rgba(0, 74, 173, 0.6)",
                      scale: 1.2
                    }}
                  />
                </motion.div>
                <div className="flex-1 relative z-10">
                  <h3 className="font-semibold text-black text-sm mb-0.5">Real-time Analytics</h3>
                  <p className="text-gray-600 text-xs">Dashboard insights mendalam</p>
                </div>
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
                  whileHover={{ x: 4 }}
                >
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom Stats - Minimal */}
            <motion.div 
              className="mt-8 pt-6 border-t border-gray-200/50"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <div className="flex items-center justify-between text-center">
                <motion.div 
                  className="group cursor-pointer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="text-lg font-bold text-black mb-1 group-hover:text-gray-700 transition-colors">1K+</div>
                  <div className="text-xs text-gray-600">Events</div>
                </motion.div>
                <motion.div 
                  className="group cursor-pointer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="text-lg font-bold text-black mb-1 group-hover:text-gray-700 transition-colors">5K+</div>
                  <div className="text-xs text-gray-600">Users</div>
                </motion.div>
                <motion.div 
                  className="group cursor-pointer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="text-lg font-bold text-black mb-1 group-hover:text-gray-700 transition-colors">99%</div>
                  <div className="text-xs text-gray-600">Uptime</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-right mb-4">
            <span className="text-gray-400 text-sm">Sudah punya akun?{' '}
              <Link to="/signin" className="text-[#004aad] hover:text-[#5eed9c] font-medium transition-colors">
                Masuk ke Miluan
              </Link>
            </span>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            {step === 'signup' ? (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white mb-1">Buat Akun Baru</h2>
                  <p className="text-gray-300 text-xs">Isi formulir di bawah untuk membuat akun Anda</p>
                </div>

                {/* Social Sign Up */}
                <button className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors mb-3 text-white text-xs">
                  <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Daftar dengan Google
                </button>

                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-800 text-gray-400">atau</span>
                  </div>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-2">
                  {errors.general && (
                    <div className="p-3 bg-red-900/20 border border-red-500 text-red-400 rounded-lg">
                      {errors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-0.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xs ${
                          errors.name ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Nama lengkap"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-0.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xs ${
                          errors.email ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="nama@email.com"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>}
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-0.5">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="no_handphone"
                        value={formData.no_handphone}
                        onChange={handleInputChange}
                        className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xs ${
                          errors.no_handphone ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="+62 812 3456 7890"
                      />
                      {errors.no_handphone && <p className="text-red-400 text-xs mt-0.5">{errors.no_handphone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-0.5">
                        Pendidikan Terakhir
                      </label>
                      <select
                        name="pendidikan_terakhir"
                        value={formData.pendidikan_terakhir}
                        onChange={(e) => setFormData({...formData, pendidikan_terakhir: e.target.value})}
                        className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs ${
                          errors.pendidikan_terakhir ? 'border-red-500' : 'border-gray-600'
                        }`}
                      >
                        <option value="" className="text-gray-400">Pilih pendidikan</option>
                        <option value="SD/MI">SD/MI</option>
                        <option value="SMP/MTS">SMP/MTS</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Sarjana">Sarjana</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      {errors.pendidikan_terakhir && <p className="text-red-400 text-xs mt-0.5">{errors.pendidikan_terakhir}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-0.5">
                      Alamat
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xs ${
                        errors.alamat ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Alamat lengkap"
                    />
                    {errors.alamat && <p className="text-red-400 text-xs mt-0.5">{errors.alamat}</p>}
                  </div>


                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-0.5">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xs ${
                          errors.password ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Min 8 karakter"
                      />
                      {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-0.5">
                        Miluanrmasi Password
                      </label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        className={`w-full px-2 py-1.5 bg-gray-700 border text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xs ${
                          errors.password_confirmation ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Ulangi password"
                      />
                      {errors.password_confirmation && <p className="text-red-400 text-xs mt-0.5">{errors.password_confirmation}</p>}
                    </div>
                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs mt-3"
                  >
                    {loading ? 'Mendaftar...' : 'Buat Akun →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Verifikasi Email
                  </h2>
                  <p className="text-gray-300">
                    Masukkan kode OTP yang telah dikirim ke {formData.email}
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {errors.otp && (
                    <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                      {errors.otp}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={otpData.otp}
                      onChange={(e) => setOtpData({otp: e.target.value})}
                      className={`w-full px-4 py-3 bg-gray-700 border text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest placeholder-gray-400 ${
                        errors.otp ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {errors.otp && <p className="text-red-400 text-sm mt-1">{errors.otp}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Memverifikasi...' : 'Verifikasi'}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Tidak menerima kode?</p>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
                    >
                      Kirim ulang kode
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep('signup')}
                    className="text-gray-400 hover:text-gray-300 text-sm"
                  >
                    ← Kembali ke pendaftaran
                  </button>
                </div>
              </>
            )}

            <div className="mt-2 text-center text-xs text-gray-400">
              Dengan mendaftar, Anda menyetujui{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Syarat Layanan</a>{' '}
              dan{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Kebijakan Privasi</a>{' '}
              kami.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
