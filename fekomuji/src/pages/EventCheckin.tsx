import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiCalendar, FiCode } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface EventData {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  flyer_path?: string;
  image?: string;
  has_certificate: boolean;
}

interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  nama_peserta: string;
  email_peserta: string;
  kode_pendaftaran: string;
  status: string;
  payment_status: string;
  token: string;
  attendance_status: 'not_attended' | 'attended';
  check_in_time?: string;
  attendance_number?: string;
}

const EventCheckin: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinToken, setCheckinToken] = useState('');
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    message: string;
    attendanceNumber?: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated && eventId) {
      fetchEventAndRegistration();
    }
  }, [isAuthenticated, eventId]);

  const fetchEventAndRegistration = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch event details
      const eventResponse = await fetch(`http://localhost:8000/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData.data);
      }

      // Fetch user registration for this event
      const registrationResponse = await fetch(`http://localhost:8000/api/events/${eventId}/my-registration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (registrationResponse.ok) {
        const registrationData = await registrationResponse.json();
        setRegistration(registrationData.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!checkinToken.trim()) {
      setCheckinResult({
        success: false,
        message: 'Silakan masukkan token check-in'
      });
      return;
    }

    setCheckinLoading(true);
    setCheckinResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: checkinToken.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCheckinResult({
          success: true,
          message: 'Check-in berhasil!',
          attendanceNumber: data.attendance_number
        });
        
        // Refresh registration data
        await fetchEventAndRegistration();
      } else {
        setCheckinResult({
          success: false,
          message: data.message || 'Check-in gagal'
        });
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      setCheckinResult({
        success: false,
        message: 'Terjadi kesalahan saat check-in'
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  const isEventToday = () => {
    if (!event) return false;
    const today = new Date().toDateString();
    const eventDate = new Date(event.tanggal_mulai).toDateString();
    return today === eventDate;
  };

  const isEventTime = () => {
    if (!event) return false;
    const now = new Date();
    const eventStart = new Date(event.tanggal_mulai);
    const eventEnd = new Date(event.tanggal_selesai || event.tanggal_mulai);
    
    // Set time
    if (event.waktu_mulai) {
      const [hours, minutes] = event.waktu_mulai.split(':');
      eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    if (event.waktu_selesai) {
      const [hours, minutes] = event.waktu_selesai.split(':');
      eventEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return now >= eventStart && now <= eventEnd;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk check-in event.</p>
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
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data event...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!event || !registration) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Event tidak ditemukan atau Anda belum terdaftar.</p>
            <button
              onClick={() => navigate('/history/events')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Riwayat Event
            </button>
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
        <div className="max-w-4xl mx-auto px-6">
          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {event.judul.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.judul}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      {new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>{event.waktu_mulai} - {event.waktu_selesai} WIB</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    <span>{event.lokasi}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Registration Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pendaftaran</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Nama Peserta</div>
                <div className="font-medium text-gray-900">{registration.nama_peserta}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Kode Pendaftaran</div>
                <div className="font-mono text-blue-600">{registration.kode_pendaftaran}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Status Kehadiran</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  registration.attendance_status === 'attended'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {registration.attendance_status === 'attended' ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Sudah Hadir
                    </>
                  ) : (
                    <>
                      <FiClock className="w-4 h-4" />
                      Belum Hadir
                    </>
                  )}
                </div>
              </div>
              
              {registration.attendance_number && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Nomor Absen</div>
                  <div className="font-bold text-green-600 text-lg">#{registration.attendance_number}</div>
                </div>
              )}
            </div>

            {registration.check_in_time && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">
                  <strong>Check-in berhasil pada:</strong> {' '}
                  {new Date(registration.check_in_time).toLocaleString('id-ID')}
                </div>
              </div>
            )}
          </motion.div>

          {/* Check-in Section */}
          {registration.attendance_status !== 'attended' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCode className="w-5 h-5" />
                Check-in Event
              </h2>

              {!isEventToday() ? (
                <div className="text-center py-8">
                  <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Check-in Belum Tersedia</h3>
                  <p className="text-gray-500">Check-in hanya dapat dilakukan pada hari event.</p>
                </div>
              ) : !isEventTime() ? (
                <div className="text-center py-8">
                  <FiClock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Belum Waktunya Check-in</h3>
                  <p className="text-gray-500">Check-in akan tersedia pada jam {event.waktu_mulai} WIB.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Masukkan token check-in yang Anda dapatkan dari QR code atau dari panitia event.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token Check-in
                    </label>
                    <input
                      type="text"
                      value={checkinToken}
                      onChange={(e) => setCheckinToken(e.target.value.toUpperCase())}
                      placeholder="Masukkan token 10 digit"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-wider"
                      maxLength={10}
                    />
                  </div>

                  <button
                    onClick={handleCheckin}
                    disabled={checkinLoading || !checkinToken.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {checkinLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses Check-in...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-5 h-5" />
                        Check-in Sekarang
                      </>
                    )}
                  </button>

                  {checkinResult && (
                    <div className={`p-4 rounded-lg ${
                      checkinResult.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className={`flex items-center gap-2 ${
                        checkinResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {checkinResult.success ? (
                          <FiCheckCircle className="w-5 h-5" />
                        ) : (
                          <FiXCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">{checkinResult.message}</span>
                      </div>
                      
                      {checkinResult.attendanceNumber && (
                        <div className="mt-2 text-green-700">
                          <strong>Nomor Absen Anda: #{checkinResult.attendanceNumber}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Certificate Info */}
          {event.has_certificate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Informasi Sertifikat</h3>
              <p className="text-yellow-700">
                Event ini menyediakan sertifikat keikutsertaan. Sertifikat akan tersedia untuk diunduh 
                setelah Anda melakukan check-in dan event selesai.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default EventCheckin;
