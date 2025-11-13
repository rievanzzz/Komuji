import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ForgotPasswordFormData {
  email: string;
}

interface OtpFormData {
  otp: string;
  password: string;
  password_confirmation: string;
}

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ""
  });
  const [otpData, setOtpData] = useState<OtpFormData>({
    otp: "",
    password: "",
    password_confirmation: ""
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

  const handleOtpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOtpData({
      ...otpData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email wajib diisi' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Format email tidak valid' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
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
        setStep('otp');
        setErrors({});
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ email: data.message || 'Email tidak ditemukan' });
        }
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      setErrors({ email: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!otpData.otp.trim()) {
      newErrors.otp = 'Kode OTP wajib diisi';
    }
    
    if (!otpData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (otpData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    } else if (!/[A-Z]/.test(otpData.password)) {
      newErrors.password = "Password harus mengandung huruf besar";
    } else if (!/[a-z]/.test(otpData.password)) {
      newErrors.password = "Password harus mengandung huruf kecil";
    } else if (!/[0-9]/.test(otpData.password)) {
      newErrors.password = "Password harus mengandung angka";
    } else if (!/[\W_]/.test(otpData.password)) {
      newErrors.password = "Password harus mengandung karakter spesial";
    }

    if (otpData.password !== otpData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak cocok";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            otp: otpData.otp,
            password: otpData.password,
            password_confirmation: otpData.password_confirmation
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setStep('success');
          setErrors({});
        } else {
          if (data.errors) {
            setErrors(data.errors);
          } else {
            setErrors({ otp: data.message || 'Reset password gagal' });
          }
        }
      } catch (error) {
        console.error('Reset Password Error:', error);
        setErrors({ otp: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
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
        alert('Kode OTP berhasil dikirim ulang ke email Anda');
        setErrors({});
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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-gray-600 text-sm">Ingat password Anda?{' '}
            <Link to="/signin" className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
              Kembali ke Login
            </Link>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-b from-blue-50 via-blue-50 via-cyan-50 via-white to-white rounded-3xl p-8 shadow-xl border border-gray-200 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/25 via-cyan-50/15 via-blue-50/8 to-transparent rounded-t-3xl"></div>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-50/20 via-blue-50/10 to-transparent rounded-t-3xl"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10">

            {step === 'email' && (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                    whileHover={{ scale: 1.05 }}
                  >
                    <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </motion.div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Lupa Password</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Masukkan email Anda untuk menerima kode reset password
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {errors.email && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                      {errors.email}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="nama@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Kode Reset'}
                  </button>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </motion.div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Masukkan kode OTP yang dikirim ke <br/>
                    <span className="font-medium">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {errors.otp && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
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
                      onChange={handleOtpInputChange}
                      className={`w-full px-4 py-4 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-center text-2xl tracking-widest placeholder-gray-400 font-mono ${
                        errors.otp ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={otpData.password}
                      onChange={handleOtpInputChange}
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
                      value={otpData.password_confirmation}
                      onChange={handleOtpInputChange}
                      className={`w-full px-4 py-3 bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400 text-sm ${
                        errors.password_confirmation ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Ulangi password yang sama"
                    />
                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Mereset...' : 'Reset Password'}
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

            {step === 'success' && (
              <>
                <div className="text-center">
                  <motion.div
                    className="mx-auto w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-5 shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Password Berhasil Direset</h1>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Password Anda telah berhasil diubah. Silakan login dengan password baru Anda.
                  </p>

                  <Link
                    to="/signin"
                    className="inline-block w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg text-center"
                  >
                    Login Sekarang
                  </Link>
                </div>
              </>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
