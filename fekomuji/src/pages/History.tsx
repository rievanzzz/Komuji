import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiCalendar, FiArrowRight } from 'react-icons/fi';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { useAuth } from '../contexts/AuthContext';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat riwayat Anda.</p>
            <a
              href="/signin"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm font-medium"
            >
              Login Sekarang
            </a>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat</h1>
            <p className="text-gray-600">Kelola transaksi dan tiket event Anda</p>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Transaksi Card */}
            <div
              onClick={() => navigate('/transaksi')}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FiShoppingBag className="w-8 h-8 text-white" />
                </div>
                <FiArrowRight className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">Riwayat Transaksi</h3>
              <p className="text-blue-700 mb-4">
                Lihat semua transaksi pembayaran tiket event dan status pembayaran Anda
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <span>Lihat Transaksi</span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Event History Card */}
            <div
              onClick={() => navigate('/history')}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FiCalendar className="w-8 h-8 text-white" />
                </div>
                <FiArrowRight className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-3">Tiket Event Saya</h3>
              <p className="text-green-700 mb-4">
                Kelola semua tiket event Anda, lihat e-ticket, dan download sertifikat
              </p>
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                <span>Lihat Tiket</span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">💳</div>
              <h4 className="font-semibold text-gray-900 mb-1">Transaksi</h4>
              <p className="text-sm text-gray-600">Lacak semua pembayaran</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">🎫</div>
              <h4 className="font-semibold text-gray-900 mb-1">E-Ticket</h4>
              <p className="text-sm text-gray-600">Akses tiket Anda</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-100 p-5 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">🏆</div>
              <h4 className="font-semibold text-gray-900 mb-1">Sertifikat</h4>
              <p className="text-sm text-gray-600">Download sertifikat</p>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default History;
