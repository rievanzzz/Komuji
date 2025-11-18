import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiCheck, FiX, FiCreditCard, FiArrowLeft, FiZap, FiTrendingUp, FiUsers, FiBarChart } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  savings?: number;
  features: string[];
  popular?: boolean;
}

const PremiumUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<any>(null);

  const premiumPlans: PremiumPlan[] = [
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: 50000,
      duration: 1,
      features: [
        'Unlimited Events',
        'Advanced Analytics',
        'Priority Support',
        'Custom Branding',
        'Export Data',
        'Email Marketing Tools'
      ]
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: 500000,
      duration: 12,
      savings: 100000,
      popular: true,
      features: [
        'All Monthly Features',
        '2 Months FREE',
        'Dedicated Account Manager',
        'Custom Integrations',
        'White-label Solution',
        'API Access'
      ]
    }
  ];

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organizer/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.data);
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const handleUpgrade = async (plan: PremiumPlan) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create payment
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          package: plan.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal membuat pembayaran');
      }

      // Load Midtrans Snap
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'SB-Mid-client-YOUR_CLIENT_KEY');
      document.head.appendChild(script);

      script.onload = () => {
        // @ts-ignore
        window.snap.pay(result.data.snap_token, {
          onSuccess: function(result: any) {
            console.log('Premium payment success:', result);
            handlePaymentSuccess();
          },
          onPending: function(result: any) {
            console.log('Premium payment pending:', result);
            alert('Pembayaran sedang diproses. Silakan cek status pembayaran Anda.');
          },
          onError: function(result: any) {
            console.log('Premium payment error:', result);
            setError('Pembayaran gagal. Silakan coba lagi.');
            setLoading(false);
          },
          onClose: function() {
            console.log('Premium payment popup closed');
            setLoading(false);
          }
        });
      };

    } catch (err) {
      console.error('Premium upgrade error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memproses upgrade');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setLoading(false);
    alert('Upgrade premium berhasil! Akun Anda telah diupgrade.');
    navigate('/organizer/dashboard');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={20} />
              <span>Kembali</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Premium</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Current Status */}
        {currentStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Akun Saat Ini</h2>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStatus.is_premium 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentStatus.is_premium ? 'Premium' : 'Free'}
              </div>
              {currentStatus.is_premium && (
                <span className="text-sm text-gray-600">
                  Berakhir: {new Date(currentStatus.premium_expires_at).toLocaleDateString('id-ID')}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 rounded-2xl">
              <FiStar className="text-white" size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade ke Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dapatkan akses penuh ke semua fitur advanced dan tingkatkan bisnis event Anda
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <FiZap className="text-purple-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Unlimited Events</h3>
            <p className="text-sm text-gray-600">Buat event tanpa batas</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <FiBarChart className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-sm text-gray-600">Analisa mendalam performa event</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <FiUsers className="text-green-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
            <p className="text-sm text-gray-600">Dukungan prioritas 24/7</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <FiTrendingUp className="text-orange-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">Marketing Tools</h3>
            <p className="text-sm text-gray-600">Tools marketing terintegrasi</p>
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {premiumPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-8 shadow-sm border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-purple-500 ring-4 ring-purple-100' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                <span className="text-gray-600">/{plan.duration} bulan</span>
              </div>
              
              {plan.savings && (
                <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-6">
                  Hemat {formatPrice(plan.savings)}
                </div>
              )}

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <FiCheck className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={loading || currentStatus?.is_premium}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : currentStatus?.is_premium ? 'Already Premium' : 'Upgrade Now'}
              </button>
            </div>
          ))}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mt-6 max-w-4xl mx-auto"
          >
            {error}
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Apakah bisa downgrade?</h3>
              <p className="text-gray-600 text-sm">Ya, Anda bisa downgrade kapan saja. Fitur premium akan tetap aktif sampai periode berakhir.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Metode pembayaran apa saja?</h3>
              <p className="text-gray-600 text-sm">Kami menerima transfer bank, e-wallet (GoPay, OVO), dan kartu kredit melalui Midtrans.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Apakah ada trial period?</h3>
              <p className="text-gray-600 text-sm">Akun panitia baru mendapat trial 7 hari gratis dengan fitur premium.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bagaimana dengan refund?</h3>
              <p className="text-gray-600 text-sm">Refund tersedia dalam 7 hari pertama jika Anda tidak puas dengan layanan kami.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumUpgrade;
