import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiCheckCircle, FiClock, FiSearch, FiDownload, FiCode, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface StatsItem {
  id: number; // registration id
  name: string | null;
  email: string | null;
  status: 'pending' | 'checked_in' | 'checked_out';
  check_in_time?: string | null;
  check_out_time?: string | null;
  token?: string | null;
}

interface EventData {
  id: number;
  judul: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  lokasi?: string;
}

const EventAttendance: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<StatsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attended' | 'not_attended'>('all');
  const [summary, setSummary] = useState<{total:number;checked_in:number;checked_out:number;pending:number}>({total:0,checked_in:0,checked_out:0,pending:0});
  const [tokenInput, setTokenInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

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

      // Fetch event detail (show)
      const evRes = await fetch(`http://localhost:8000/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (evRes.ok) {
        const evData = await evRes.json();
        setEvent(evData.data);
      }

      // Fetch attendance stats
      const statsRes = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/attendance/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setSummary(stats.summary || {total:0,checked_in:0,checked_out:0,pending:0});
        setAttendanceRecords(stats.data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!tokenInput) return;
    try {
      setVerifyLoading(true);
      setVerifyMsg(null);
      const tokenStr = localStorage.getItem('token');
      if (!tokenStr) return;
      const body = (() => {
        // Support pasting raw token or QR JSON
        try {
          const parsed = JSON.parse(tokenInput);
          if (parsed.token) return { token: String(parsed.token) };
        } catch {}
        return { token: tokenInput };
      })();

      const res = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/attendance/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenStr}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyMsg(data.message || 'Berhasil');
        setTokenInput('');
        await fetchEventAttendance();
      } else {
        setVerifyMsg(data.message || 'Gagal memverifikasi token');
      }
    } catch (e) {
      setVerifyMsg('Terjadi kesalahan');
    } finally {
      setVerifyLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/export-attendance`, {
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

  // NEW: Export Participants dengan Status Kehadiran Lengkap
  const exportParticipantsExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/export-participants`, {
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
        link.download = `peserta-lengkap-${event?.judul}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting participants:', error);
    }
  };

  // NEW: Print Daftar Kehadiran
  const printAttendanceList = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/attendance-list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Open in new window for print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Daftar Kehadiran - ${data.data.event.judul}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; margin-bottom: 10px; }
                .info { text-align: center; margin-bottom: 30px; color: #666; }
                .stats { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                .stats div { display: inline-block; margin-right: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #4a5568; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .signature { margin-top: 15px; border-top: 1px solid #000; width: 150px; display: inline-block; }
                @media print {
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <h1>DAFTAR KEHADIRAN</h1>
              <div class="info">
                <strong>${data.data.event.judul}</strong><br/>
                ${data.data.event.lokasi}<br/>
                ${data.data.event.tanggal} • ${data.data.event.waktu || ''}<br/>
              </div>

              <div class="stats">
                <div><strong>Total Terdaftar:</strong> ${data.data.statistics.total_registered}</div>
                <div><strong>Hadir:</strong> ${data.data.statistics.total_checked_in + data.data.statistics.total_checked_out}</div>
                <div><strong>Belum Hadir:</strong> ${data.data.statistics.total_not_attended}</div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;">No</th>
                    <th>Nama Peserta</th>
                    <th>Email</th>
                    <th style="width: 120px;">Kode Pendaftaran</th>
                    <th style="width: 100px;">Status</th>
                    <th style="width: 150px;">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.data.participants.map((p: any) => `
                    <tr>
                      <td>${p.no}</td>
                      <td>${p.nama}</td>
                      <td>${p.email}</td>
                      <td style="font-size: 11px;">${p.kode_pendaftaran}</td>
                      <td>${p.status_kehadiran}</td>
                      <td><div class="signature"></div></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div style="margin-top: 40px; text-align: right;">
                <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
              </div>

              <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print Daftar Kehadiran
              </button>
            </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Error printing attendance list:', error);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (record.name || '').toLowerCase().includes(q) ||
      (record.email || '').toLowerCase().includes(q) ||
      (record.token || '').toLowerCase().includes(q);

    const isAttended = record.status === 'checked_in' || record.status === 'checked_out' || !!record.check_in_time;
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'attended' && isAttended) ||
      (filterStatus === 'not_attended' && !isAttended);

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

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={fetchEventAttendance}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={exportAttendance}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Export Basic
                </button>
                <button
                  onClick={exportParticipantsExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Export Lengkap
                </button>
                <button
                  onClick={printAttendanceList}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Print Absensi
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
                  <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
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
                  <div className="text-2xl font-bold text-gray-900">{summary.checked_in + summary.checked_out}</div>
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
                  <div className="text-2xl font-bold text-gray-900">{summary.pending}</div>
                  <div className="text-gray-600">Belum Hadir</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Verifikasi Token / Scan Manual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCode className="w-5 h-5" />
              Verifikasi Token / QR
            </h2>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <input
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Scan QR (paste JSON) atau masukkan 10-digit token"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleVerifyToken}
                disabled={verifyLoading || !tokenInput}
                className={`px-6 py-3 rounded-lg font-medium ${verifyLoading ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors`}
              >
                {verifyLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
            {verifyMsg && (
              <div className="mt-3 text-sm text-gray-700">{verifyMsg}</div>
            )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.name || '-'}</div>
                          <div className="text-sm text-gray-500">{record.email || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.status === 'checked_in' || record.status === 'checked_out' ? (
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
                        <span className="text-sm font-mono text-gray-900">{record.token || '-'}</span>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.check_out_time ? (
                          <div className="text-sm text-gray-900">
                            {new Date(record.check_out_time).toLocaleString('id-ID')}
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
