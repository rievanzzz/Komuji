import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiDownload, FiEye, FiAward } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface EventRegistration {
  id: string;
  kode_pendaftaran: string;
  status: 'pending' | 'approved' | 'rejected';
  alasan_ditolak?: string;
  created_at: string;
  event: {
    id: string;
    judul: string;
    deskripsi: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    flyer_path?: string;
  };
  attendance?: {
    id: string;
    waktu_hadir: string;
    is_verified: boolean;
  };
  certificate?: {
    id: string;
    nomor_sertifikat: string;
    file_path: string;
    generated_at: string;
  };
}

const History: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/my-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || data || []);
      } else {
        // API endpoint belum tersedia, tampilkan pesan kosong
        console.log('API endpoint /my-registrations belum tersedia');
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      // API belum tersedia, tampilkan pesan kosong
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'pending':
        return 'Menunggu';
      default:
        return status;
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (activeTab === 'all') return true;
    return reg.status === activeTab;
  });

  const downloadCertificate = async (certificateId: string, eventTitle: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/certificate/${certificateId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sertifikat_${eventTitle.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk melihat riwayat pendaftaran Anda.</p>
            <a
              href="/signin"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login Sekarang
            </a>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Pendaftaran</h1>
          <p className="text-gray-600">Lihat semua event yang pernah Anda daftarkan</p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-1">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'Semua', count: registrations.length },
              { key: 'pending', label: 'Menunggu', count: registrations.filter(r => r.status === 'pending').length },
              { key: 'approved', label: 'Disetujui', count: registrations.filter(r => r.status === 'approved').length },
              { key: 'rejected', label: 'Ditolak', count: registrations.filter(r => r.status === 'rejected').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Registrations List */}
        {filteredRegistrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <div className="text-gray-400 mb-4">
              <FiCalendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Pendaftaran</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all' 
                ? 'Anda belum mendaftar ke event apapun.'
                : `Tidak ada pendaftaran dengan status "${getStatusText(activeTab)}".`
              }
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> API endpoint untuk riwayat pendaftaran (/api/my-registrations) belum tersedia. 
                Halaman ini akan menampilkan data setelah API diimplementasikan.
              </p>
            </div>
            <a
              href="/events"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              Lihat Event Tersedia
            </a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((registration, index) => (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Event Image */}
                    {registration.event.flyer_path && (
                      <div className="flex-shrink-0">
                        <img
                          src={registration.event.flyer_path}
                          alt={registration.event.judul}
                          className="w-full lg:w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {registration.event.judul}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {new Date(registration.event.tanggal_mulai).toLocaleDateString('id-ID')}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className="w-4 h-4" />
                              {registration.event.waktu_mulai} - {registration.event.waktu_selesai}
                            </div>
                            <div className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              {registration.event.lokasi}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(registration.status)}`}>
                            {getStatusText(registration.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Kode: {registration.kode_pendaftaran}
                          </span>
                        </div>
                      </div>

                      {/* Registration Date */}
                      <div className="text-sm text-gray-600 mb-4">
                        Didaftarkan pada: {new Date(registration.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      {/* Rejection Reason */}
                      {registration.status === 'rejected' && registration.alasan_ditolak && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-800">
                            <strong>Alasan ditolak:</strong> {registration.alasan_ditolak}
                          </p>
                        </div>
                      )}

                      {/* Attendance Info */}
                      {registration.attendance && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <FiUsers className="w-4 h-4" />
                            <span>
                              Hadir pada: {new Date(registration.attendance.waktu_hadir).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {registration.attendance.is_verified && (
                              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                                Terverifikasi
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Certificate */}
                      {registration.certificate && (
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-blue-800">
                            <FiAward className="w-4 h-4" />
                            <span>
                              Sertifikat tersedia (No: {registration.certificate.nomor_sertifikat})
                            </span>
                          </div>
                          <button
                            onClick={() => downloadCertificate(registration.certificate!.id, registration.event.judul)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <FiDownload className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
};

export default History;
