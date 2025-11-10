import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiLock, FiHome, FiFileText, FiGlobe, FiCheck, FiStar } from "react-icons/fi";

interface PanitiaSignUpFormData {
  name: string;
  email: string;
  no_handphone: string;
  alamat: string;
  pendidikan_terakhir: string;
  password: string;
  password_confirmation: string;
  organization_name: string;
  organization_description: string;
  phone: string;
  address: string;
  website: string;
}

interface RegistrationOptions {
  roles: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  panitia_info: {
    auto_approve: boolean;
    trial_duration: number;
    premium_price: number;
    features: {
      trial: {
        duration: string;
        max_events: string;
        analytics: string;
        support: string;
      };
      free: {
        max_events: number;
        analytics: string;
        support: string;
      };
      premium: {
        max_events: string;
        analytics: string;
        support: string;
        promotion: string;
      };
    };
  };
}

const SignUpPanitia = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'form' | 'otp'>('info');
  const [formData, setFormData] = useState<PanitiaSignUpFormData>({
    name: "",
    email: "",
    no_handphone: "",
    alamat: "",
    pendidikan_terakhir: "",
    password: "",
    password_confirmation: "",
    organization_name: "",
    organization_description: "",
    phone: "",
    address: "",
    website: ""
  });
  const [otpData, setOtpData] = useState({ otp: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<RegistrationOptions | null>(null);

  useEffect(() => {
    fetchRegistrationOptions();
  }, []);

  const fetchRegistrationOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/registration-options', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Registration options response:', data);
      if (data.status === 'success') {
        setOptions(data.data);
      } else {
        console.error('API returned error:', data);
        // Set fallback data if API fails
        setOptions({
          roles: [],
          panitia_info: {
            auto_approve: false,
            trial_duration: 60,
            premium_price: 100000,
            features: {
              trial: {
                duration: '60 hari',
                max_events: 'Unlimited',
                analytics: 'Lengkap',
                support: 'Priority'
              },
              free: {
                max_events: 1,
                analytics: 'Basic',
                support: 'Standard'
              },
              premium: {
                max_events: 'Unlimited',
                analytics: 'Advanced',
                support: 'Priority',
                promotion: 'Homepage featured'
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch registration options:', error);
      // Set fallback data if network fails
      setOptions({
        roles: [],
        panitia_info: {
          auto_approve: false,
          trial_duration: 60,
          premium_price: 100000,
          features: {
            trial: {
              duration: '60 hari',
              max_events: 'Unlimited',
              analytics: 'Lengkap',
              support: 'Priority'
            },
            free: {
              max_events: 1,
              analytics: 'Basic',
              support: 'Standard'
            },
            premium: {
              max_events: 'Unlimited',
              analytics: 'Advanced',
              support: 'Priority',
              promotion: 'Homepage featured'
            }
          }
        }
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Form submit triggered!');
    e.preventDefault();
    setLoading(true);
    setErrors({});

    console.log('📝 Form data:', formData);

    // Frontend validation
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!formData.no_handphone.trim()) newErrors.no_handphone = 'No. Handphone wajib diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!formData.pendidikan_terakhir) newErrors.pendidikan_terakhir = 'Pendidikan terakhir wajib dipilih';
    if (!formData.organization_name.trim()) newErrors.organization_name = 'Nama organisasi wajib diisi';
    if (!formData.organization_description.trim()) newErrors.organization_description = 'Deskripsi organisasi wajib diisi';
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password minimal 8 karakter';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password harus mengandung huruf besar';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password harus mengandung huruf kecil';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password harus mengandung angka';
      } else if (!/[\W_]/.test(formData.password)) {
        newErrors.password = 'Password harus mengandung karakter spesial';
      }
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register-panitia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          no_handphone: formData.no_handphone,
          alamat: formData.alamat,
          pendidikan_terakhir: formData.pendidikan_terakhir,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          organization_name: formData.organization_name,
          organization_description: formData.organization_description,
          phone: formData.phone || formData.no_handphone,
          address: formData.address || formData.alamat,
          website: formData.website
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Terjadi kesalahan' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan jaringan' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpData.otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/signin', { 
          state: { 
            message: 'Registrasi berhasil! Silakan login dan tunggu persetujuan admin.' 
          } 
        });
      } else {
        setErrors({ otp: data.message || 'OTP tidak valid' });
      }
    } catch (error) {
      setErrors({ otp: 'Terjadi kesalahan jaringan' });
    } finally {
      setLoading(false);
    }
  };

  // Info Step - Plan Comparison
  if (step === 'info') {
    // Show loading if options not loaded yet
    if (!options) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md bg-gradient-to-b from-blue-50/60 via-blue-50/30 via-cyan-50/20 via-white/80 to-white rounded-3xl shadow-xl border border-gray-200/50 relative overflow-hidden"
          >
            <div className="relative z-10 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat informasi paket...</p>
            </div>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl w-full bg-gradient-to-b from-blue-50/60 via-blue-50/30 via-cyan-50/20 via-white/80 to-white rounded-3xl shadow-xl border border-gray-200/50 relative overflow-hidden"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Smooth gradient overlay for seamless transition */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/25 via-cyan-50/15 via-blue-50/8 to-transparent rounded-t-3xl pointer-events-none"></div>
          
          {/* Additional smooth blend layer */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-50/20 via-blue-50/10 to-transparent rounded-t-3xl pointer-events-none"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10 p-8">
            <div className="text-center mb-8">
              <motion.div
                className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                whileHover={{ scale: 1.05 }}
              >
                <FiStar className="w-7 h-7 text-gray-700" />
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Bergabung Sebagai Panitia Event</h1>
              <p className="text-gray-600 text-sm leading-relaxed">Buat dan kelola event Anda dengan fitur lengkap</p>
            </div>

            {/* Plan Comparison */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Trial Plan */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="flex items-center mb-4">
                  <FiStar className="text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-blue-900">Trial</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {options.panitia_info.features.trial.duration}
                </div>
                <p className="text-blue-700 text-sm mb-4">Gratis untuk panitia baru</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-blue-800">
                    <FiCheck className="mr-2 text-blue-600" />
                    {options.panitia_info.features.trial.max_events} Events
                  </li>
                  <li className="flex items-center text-blue-800">
                    <FiCheck className="mr-2 text-blue-600" />
                    Analytics {options.panitia_info.features.trial.analytics}
                  </li>
                  <li className="flex items-center text-blue-800">
                    <FiCheck className="mr-2 text-blue-600" />
                    Support {options.panitia_info.features.trial.support}
                  </li>
                </ul>
              </div>

              {/* Free Plan */}
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FiUser className="text-gray-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Gratis</h3>
                </div>
                <div className="text-3xl font-bold text-gray-600 mb-2">Rp0</div>
                <p className="text-gray-500 text-sm mb-4">Selamanya</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-gray-700">
                    <FiCheck className="mr-2 text-gray-500" />
                    {options.panitia_info.features.free.max_events} Event Aktif
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FiCheck className="mr-2 text-gray-500" />
                    Analytics {options.panitia_info.features.free.analytics}
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FiCheck className="mr-2 text-gray-500" />
                    Support {options.panitia_info.features.free.support}
                  </li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                <div className="flex items-center mb-4">
                  <FiStar className="text-purple-600 mr-2" />
                  <h3 className="text-xl font-bold text-purple-900">Premium</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Rp{(options.panitia_info.premium_price / 1000).toFixed(0)}k
                </div>
                <p className="text-purple-700 text-sm mb-4">Per bulan</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-purple-800">
                    <FiCheck className="mr-2 text-purple-600" />
                    {options.panitia_info.features.premium.max_events} Events
                  </li>
                  <li className="flex items-center text-purple-800">
                    <FiCheck className="mr-2 text-purple-600" />
                    Analytics {options.panitia_info.features.premium.analytics}
                  </li>
                  <li className="flex items-center text-purple-800">
                    <FiCheck className="mr-2 text-purple-600" />
                    {options.panitia_info.features.premium.promotion}
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <div
                onClick={() => {
                  console.log('Div button clicked, changing step to form');
                  setStep('form');
                }}
                className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setStep('form');
                  }
                }}
              >
                Mulai Daftar Sekarang
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {options.panitia_info.auto_approve 
                  ? "Akun akan langsung disetujui" 
                  : "Akun akan direview oleh admin"}
              </p>
              
              {/* Debug info */}
              <div className="mt-4 text-xs text-gray-400">
                Current step: {step} | Options loaded: {options ? 'Yes' : 'No'}
              </div>
              
              {/* Alternative button for testing */}
              <div className="mt-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Alternative button clicked');
                    setStep('form');
                  }}
                  className="text-blue-600 underline text-sm hover:text-blue-800"
                >
                  [Debug] Langsung ke Form
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md bg-gradient-to-b from-blue-50/60 via-blue-50/30 via-cyan-50/20 via-white/80 to-white rounded-3xl shadow-xl border border-gray-200/50 relative overflow-hidden"
        >
          {/* Smooth gradient overlay for seamless transition */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/25 via-cyan-50/15 via-blue-50/8 to-transparent rounded-t-3xl"></div>
          
          {/* Additional smooth blend layer */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-50/20 via-blue-50/10 to-transparent rounded-t-3xl"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10 p-6">
            <div className="text-center mb-6">
              <motion.div
                className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                whileHover={{ scale: 1.05 }}
              >
                <FiMail className="w-7 h-7 text-gray-700" />
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Email</h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                Kami telah mengirim kode OTP ke <strong>{formData.email}</strong>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  type="text"
                  name="otp"
                  placeholder="Masukkan kode OTP"
                  value={otpData.otp}
                  onChange={(e) => setOtpData({ otp: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 text-center text-2xl tracking-widest hover:border-gray-300 hover:bg-white"
                  maxLength={6}
                  required
                />
                {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form Step - Following existing SignUp design pattern
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <span className="text-gray-600 text-sm">Sudah punya akun?{' '}
            <Link to="/signin" className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
              Masuk ke Komuji
            </Link>
          </span>
        </div>

        <div className="flex gap-12 items-start justify-center">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-96 bg-gradient-to-b from-blue-50 via-blue-50 via-cyan-50 via-white to-white rounded-3xl p-6 shadow-xl border border-gray-200 relative overflow-hidden"
          >
            {/* Smooth gradient overlay for seamless transition */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/25 via-cyan-50/15 via-blue-50/8 to-transparent rounded-t-3xl"></div>
            
            {/* Additional smooth blend layer */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-50/20 via-blue-50/10 to-transparent rounded-t-3xl"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
              <div className="text-center mb-5">
                <motion.div
                  className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md border border-gray-200/40"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiHome className="w-6 h-6 text-gray-700" />
                </motion.div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">Daftar Sebagai Panitia</h1>
                <p className="text-gray-600 text-sm">Lengkapi data diri dan organisasi Anda</p>
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
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama Lengkap"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="no_handphone"
                      placeholder="No. Handphone"
                      value={formData.no_handphone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.no_handphone && <p className="text-red-500 text-xs mt-1">{errors.no_handphone}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <div className="relative">
                    <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="alamat"
                      placeholder="Alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="pendidikan_terakhir"
                      value={formData.pendidikan_terakhir}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white appearance-none"
                      required
                    >
                      <option value="">Pilih Pendidikan Terakhir</option>
                      <option value="SD/MI">SD/MI</option>
                      <option value="SMP/MTS">SMP/MTS</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Sarjana">Sarjana</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  {errors.pendidikan_terakhir && <p className="text-red-500 text-xs mt-1">{errors.pendidikan_terakhir}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <div className="relative">
                    <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="organization_name"
                      placeholder="Nama Organisasi"
                      value={formData.organization_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.organization_name && <p className="text-red-500 text-xs mt-1">{errors.organization_name}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password_confirmation"
                      placeholder="Konfirmasi Password"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                      required
                    />
                  </div>
                  {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  onClick={() => console.log('🔘 Button clicked!')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  {loading ? 'Mendaftar...' : 'Daftar Sebagai Panitia'}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right Side - Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-80 space-y-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keuntungan Panitia</h3>
              <p className="text-sm text-gray-600">Fitur lengkap untuk mengelola event Anda</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <FiStar className="text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Trial 2 Bulan Gratis</span>
              </div>
              <p className="text-sm text-gray-600">Akses penuh fitur premium selama masa trial</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <FiCheck className="text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Event Unlimited</span>
              </div>
              <p className="text-sm text-gray-600">Buat event sebanyak yang Anda inginkan</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <FiFileText className="text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Analytics Lengkap</span>
              </div>
              <p className="text-sm text-gray-600">Laporan detail peserta dan pendapatan</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPanitia;
