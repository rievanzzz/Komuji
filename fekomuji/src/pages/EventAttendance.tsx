import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiCheckCircle, FiClock, FiSearch, FiDownload, FiCode, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface AttendanceRecord {
  id: number;
  registration_id: number;
  attendance_number: string;
  check_in_time: string;
  is_verified: boolean;
  registration: {
    id: number;
    nama_peserta: string;
    email_peserta: string;
    kode_pendaftaran: string;
    payment_status: string;
  };
}

interface EventData {
  id: number;
  judul: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  total_registrations: number;
  total_attended: number;
}

const EventAttendance: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attended' | 'not_attended'>('all');

  useEffect(() => {
    if (isAuthenticated && eventId) {
      fetchEventAttendance();
    }
  }, [isAuthenticated, eventId]);

  const fetchEventAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch event details and attendance
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
        setAttendanceRecords(data.attendance || []);
      } else {
        console.error('Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/generate-attendance-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('Error generating token:', error);
      return null;
    }
  };

  const [currentToken, setCurrentToken] = useState<string>('');
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);

  const handleGenerateToken = async () => {
    const token = await generateAttendanceToken();
    if (token) {
      setCurrentToken(token);
      // Token valid for 5 minutes
      setTokenExpiry(new Date(Date.now() + 5 * 60 * 1000));
    }
  };

  const exportAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/attendance/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-${event?.judul}-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.registration.nama_peserta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.registration.email_peserta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.registration.kode_pendaftaran.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'attended' && record.check_in_time) ||
                         (filterStatus === 'not_attended' && !record.check_in_time);
    
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login sebagai panitia untuk mengakses data absensi.</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data absensi...</p>
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
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Absensi Event</h1>
                <p className="text-gray-600">{event?.judul}</p>
                <div className="text-sm text-gray-500 mt-1">
                  {event?.tanggal_mulai && new Date(event.tanggal_mulai).toLocaleDateString('id-ID')} • {event?.lokasi}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={fetchEventAttendance}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={exportAttendance}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Export Excel
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{event?.total_registrations || 0}</div>
                  <div className="text-gray-600">Total Pendaftar</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{event?.total_attended || 0}</div>
                  <div className="text-gray-600">Sudah Hadir</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(event?.total_registrations || 0) - (event?.total_attended || 0)}
                  </div>
                  <div className="text-gray-600">Belum Hadir</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Token Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCode className="w-5 h-5" />
              Generator Token Absensi
            </h2>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateToken}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Generate Token Baru
              </button>
              
              {currentToken && (
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Token Aktif:</div>
                      <div className="text-2xl font-mono font-bold text-blue-600">{currentToken}</div>
                    </div>
                    {tokenExpiry && (
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Berlaku hingga:</div>
                        <div className="text-sm font-medium text-red-600">
                          {tokenExpiry.toLocaleTimeString('id-ID')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-3">
              Token ini dapat digunakan peserta untuk check-in. Token berlaku selama 5 menit setelah dibuat.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau kode pendaftaran"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
              >
                <option value="all">Semua Status</option>
                <option value="attended">Sudah Hadir</option>
                <option value="not_attended">Belum Hadir</option>
              </select>
            </div>
          </motion.div>

          {/* Attendance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Daftar Absensi ({filteredRecords.length} peserta)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Pendaftaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Absen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.registration.nama_peserta}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.registration.email_peserta}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-blue-600">
                          {record.registration.kode_pendaftaran}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.check_in_time ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <FiCheckCircle className="w-3 h-3" />
                            Hadir
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <FiClock className="w-3 h-3" />
                            Belum Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.attendance_number ? (
                          <span className="text-sm font-bold text-gray-900">
                            #{record.attendance_number}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.check_in_time ? (
                          <div className="text-sm text-gray-900">
                            {new Date(record.check_in_time).toLocaleString('id-ID')}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak Ada Data</h3>
                  <p className="text-gray-500">Tidak ada peserta yang sesuai dengan filter.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default EventAttendance;
