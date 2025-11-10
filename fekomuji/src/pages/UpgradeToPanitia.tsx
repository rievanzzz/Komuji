import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiHome, FiFileText, FiGlobe, FiCheck, FiStar, FiClock, FiArrowLeft } from "react-icons/fi";
import { useAuth } from '../contexts/AuthContext';

interface UpgradeFormData {
  organization_name: string;
  organization_description: string;
  phone: string;
  address: string;
  website: string;
}

interface UpgradeInfo {
  auto_approve: boolean;
  trial_duration: number;
  premium_price: number;
  benefits: {
    trial: {
      duration: string;
      max_events: string;
      analytics: string;
      support: string;
    };
    after_trial: {
      free_plan: string;
      premium_plan: string;
    };
  };
}

const UpgradeToPanitia = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'check' | 'form' | 'success'>('check');
  const [formData, setFormData] = useState<UpgradeFormData>({
    organization_name: "",
    organization_description: "",
    phone: "",
    address: "",
    website: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/upgrade/check-eligibility', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const data = await response.json();

      if (response.ok && data.eligible) {
        setEligible(true);
        setUpgradeInfo(data.upgrade_info);
        setStep('form');
      } else {
        setEligible(false);
        setErrors({ general: data.message || 'Tidak dapat melakukan upgrade' });
      }
    } catch (error) {
      setErrors({ general: 'Gagal mengecek kelayakan upgrade' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/upgrade/to-panitia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
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

  // Loading state
  if (loading && step === 'check') {
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
            <p className="text-gray-600">Mengecek kelayakan upgrade...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Not eligible
  if (!eligible && step === 'check') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md bg-gradient-to-b from-red-50/60 via-red-50/30 via-white/80 to-white rounded-3xl shadow-xl border border-gray-200/50 relative overflow-hidden"
        >
          <div className="relative z-10 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Tidak Dapat Upgrade</h1>
            <p className="text-gray-600 text-sm mb-6">{errors.general}</p>
            <Link
              to="/profile"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Kembali ke Profile
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md bg-gradient-to-b from-green-50/60 via-green-50/30 via-white/80 to-white rounded-3xl shadow-xl border border-gray-200/50 relative overflow-hidden"
        >
          <div className="relative z-10 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Upgrade Berhasil!</h1>
            <p className="text-gray-600 text-sm mb-6">
              {upgradeInfo?.auto_approve 
                ? "Selamat! Anda sekarang adalah panitia dan bisa mulai membuat event."
                : "Permintaan upgrade Anda sedang direview oleh admin. Kami akan memberitahu Anda setelah disetujui."}
            </p>
            <div className="space-y-3">
              <Link
                to="/organizer"
                className="block w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors text-center"
              >
                {upgradeInfo?.auto_approve ? "Mulai Buat Event" : "Ke Dashboard"}
              </Link>
              <Link
                to="/profile"
                className="block w-full bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Lihat Profile
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <Link to="/profile" className="inline-flex items-center text-gray-600 text-sm hover:text-gray-900 transition-colors mb-4">
            <FiArrowLeft className="mr-2" />
            Kembali ke Profile
          </Link>
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
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/25 via-cyan-50/15 via-blue-50/8 to-transparent rounded-t-3xl pointer-events-none"></div>
            
            {/* Additional smooth blend layer */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-50/20 via-blue-50/10 to-transparent rounded-t-3xl pointer-events-none"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
              <div className="text-center mb-5">
                <motion.div
                  className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md border border-gray-200/40"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiStar className="w-6 h-6 text-gray-700" />
                </motion.div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">Upgrade ke Panitia</h1>
                <p className="text-gray-600 text-sm">Lengkapi data organisasi Anda</p>
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
                  transition={{ delay: 0.3 }}
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
                  transition={{ delay: 0.4 }}
                >
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="organization_description"
                      placeholder="Deskripsi Organisasi"
                      value={formData.organization_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white resize-none"
                      required
                    />
                  </div>
                  {errors.organization_description && <p className="text-red-500 text-xs mt-1">{errors.organization_description}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative">
                    <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      placeholder="Website (opsional)"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-gray-300 hover:bg-white"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Memproses...' : 'Upgrade ke Panitia'}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right Side - Benefits */}
          {upgradeInfo && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-80 space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keuntungan Upgrade</h3>
                <p className="text-sm text-gray-600">Fitur yang akan Anda dapatkan</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FiClock className="text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Trial Gratis</span>
                </div>
                <p className="text-sm text-blue-800 mb-2">{upgradeInfo.benefits.trial.duration}</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• {upgradeInfo.benefits.trial.max_events}</li>
                  <li>• {upgradeInfo.benefits.trial.analytics}</li>
                  <li>• {upgradeInfo.benefits.trial.support}</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <FiCheck className="text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">Setelah Trial</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Gratis:</strong> {upgradeInfo.benefits.after_trial.free_plan}</p>
                  <p><strong>Premium:</strong> {upgradeInfo.benefits.after_trial.premium_plan}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <FiStar className="text-yellow-600 mr-2" />
                  <span className="font-medium text-gray-900">Status Approval</span>
                </div>
                <p className="text-sm text-gray-600">
                  {upgradeInfo.auto_approve 
                    ? "Akun akan langsung disetujui" 
                    : "Akan direview oleh admin"}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeToPanitia;
