import { motion } from "framer-motion";
import { useState } from "react";
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-80"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-32 left-32 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-70"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <motion.div
          className="absolute top-1/2 right-20 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-60"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Bergabung dengan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Komuji
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Platform terdepan untuk menemukan dan mengorganisir event yang menginspirasi. 
              Bergabunglah dengan ribuan penyelenggara dan peserta event.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Event management yang mudah</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Sistem tiket digital terintegrasi</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Analytics dan reporting lengkap</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-right mb-8">
            <span className="text-gray-600">Sudah punya akun? </span>
            <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
              Masuk →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 'signup' ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Daftar di Komuji</h2>
                  <p className="text-gray-600">Mulai perjalanan event Anda bersama kami</p>
                </div>

                {/* Social Sign Up */}
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Lanjutkan dengan Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">atau</span>
                  </div>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap Anda"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="nama@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="no_handphone"
                      value={formData.no_handphone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.no_handphone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+62 812 3456 7890"
                    />
                    {errors.no_handphone && <p className="text-red-500 text-sm mt-1">{errors.no_handphone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.alamat ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan alamat lengkap Anda"
                    />
                    {errors.alamat && <p className="text-red-500 text-sm mt-1">{errors.alamat}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pendidikan Terakhir
                    </label>
                    <select
                      name="pendidikan_terakhir"
                      value={formData.pendidikan_terakhir}
                      onChange={(e) => setFormData({...formData, pendidikan_terakhir: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.pendidikan_terakhir ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Pilih pendidikan terakhir</option>
                      <option value="SD/MI">SD/MI</option>
                      <option value="SMP/MTS">SMP/MTS</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Sarjana">Sarjana</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    {errors.pendidikan_terakhir && <p className="text-red-500 text-sm mt-1">{errors.pendidikan_terakhir}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Minimal 8 karakter (huruf besar, kecil, angka, simbol)"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ulangi password Anda"
                    />
                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Mendaftar...' : 'Buat Akun →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Verifikasi Email</h2>
                  <p className="text-gray-600">
                    Kami telah mengirim kode verifikasi ke <br />
                    <span className="font-medium text-gray-900">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {errors.otp && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {errors.otp}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Verifikasi
                    </label>
                    <input
                      type="text"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest ${
                        errors.otp ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
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
                    className="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    ← Kembali ke pendaftaran
                  </button>
                </div>
              </>
            )}

            <div className="mt-8 text-center text-xs text-gray-500">
              Dengan mendaftar, Anda menyetujui{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Syarat Layanan</a>{' '}
              dan{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Kebijakan Privasi</a>{' '}
              kami.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
