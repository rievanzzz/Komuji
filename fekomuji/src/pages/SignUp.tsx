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
  const [step, setStep] = useState<'personal' | 'password' | 'otp'>('personal');
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



  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate personal info fields
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

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password fields
    const newErrors: Record<string, string> = {};
    
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
    if (Object.keys(newErrors).length === 0) {
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
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <span className="text-gray-600 text-sm">Sudah punya akun?{' '}
            <Link to="/signin" className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
              Masuk ke Miluan
            </Link>
          </span>
        </div>

        <div className="flex gap-12 items-start justify-center">
          {/* Left Side - Main Form */}
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
              
              {/* Step Indicator */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                    step === 'personal' ? 'bg-gray-900 text-white' : 
                    step === 'password' || step === 'otp' ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    1
                  </div>
                  <div className={`w-8 h-0.5 ${
                    step === 'password' || step === 'otp' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}></div>
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                    step === 'password' ? 'bg-gray-900 text-white' : 
                    step === 'otp' ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    2
                  </div>
                  <div className={`w-8 h-0.5 ${
                    step === 'otp' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}></div>
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                    step === 'otp' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    3
                  </div>
                </div>
              </div>

              {step === 'personal' && (
                <>
                  <div className="text-center mb-5">
                    <motion.div
                      className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md border border-gray-200/40"
                      whileHover={{ scale: 1.05 }}
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </motion.div>
                    <h1 className="text-lg font-bold text-gray-900 mb-1">Informasi Personal</h1>
                    <p className="text-gray-600 text-xs leading-relaxed">Langkah 1 dari 3 - Isi data pribadi Anda</p>
                  </div>

                <form onSubmit={handlePersonalSubmit} className="space-y-3">
                  {errors.general && (
                    <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                      {errors.general}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2.5 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                          errors.name ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2.5 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                          errors.email ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="nama@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="no_handphone"
                        value={formData.no_handphone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2.5 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                          errors.no_handphone ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="+62 812 3456 7890"
                      />
                      {errors.no_handphone && <p className="text-red-500 text-xs mt-0.5">{errors.no_handphone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pendidikan Terakhir
                      </label>
                      <select
                        name="pendidikan_terakhir"
                        value={formData.pendidikan_terakhir}
                        onChange={(e) => setFormData({...formData, pendidikan_terakhir: e.target.value})}
                        className={`w-full px-3 py-2.5 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm ${
                          errors.pendidikan_terakhir ? 'border-red-300' : 'border-gray-200'
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
                      {errors.pendidikan_terakhir && <p className="text-red-500 text-xs mt-0.5">{errors.pendidikan_terakhir}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <input
                        type="text"
                        name="alamat"
                        value={formData.alamat}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2.5 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                          errors.alamat ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Alamat lengkap"
                      />
                      {errors.alamat && <p className="text-red-500 text-xs mt-0.5">{errors.alamat}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg mt-4"
                  >
                    Lanjutkan →
                  </button>
                </form>
              </>
            )}


            {step === 'password' && (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </motion.div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Keamanan Akun</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">Langkah 2 dari 3 - Buat password yang kuat</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                      {errors.general}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                          errors.password ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Minimal 8 karakter dengan huruf besar, kecil, angka & simbol"
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
                        className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                          errors.password_confirmation ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Ulangi password yang sama"
                      />
                      {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep('personal')}
                      className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Mendaftar...' : 'Daftar →'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Email</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Langkah 3 dari 3 - Masukkan kode OTP yang dikirim ke <br/>
                    <span className="font-medium">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  {errors.otp && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                      {errors.otp}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={otpData.otp}
                      onChange={(e) => setOtpData({otp: e.target.value})}
                      className={`w-full px-4 py-4 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-center text-2xl tracking-widest placeholder-gray-400 font-mono ${
                        errors.otp ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep('personal')}
                      className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Memverifikasi...' : 'Verifikasi'}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm mb-2">Tidak menerima kode?</p>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading}
                      className="text-gray-900 hover:text-gray-700 font-medium text-sm disabled:opacity-50"
                    >
                      Kirim ulang kode
                    </button>
                  </div>
                </form>
              </>
            )}

            </div>
          </motion.div>

          {/* Right Side - Social Login Options (Only on Step 1) */}
          {step === 'personal' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-80 space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Atau daftar dengan</h3>
                <p className="text-sm text-gray-600">Pilih salah satu opsi di bawah untuk mendaftar dengan cepat</p>
              </div>
              
              <button className="w-full flex items-center justify-center px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm shadow-sm">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm shadow-sm">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              <button className="w-full flex items-center justify-center px-6 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 text-sm shadow-sm">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.083.402-.09.377-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.744-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
                Continue with Apple
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
