import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiUpload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { isValidToken } from '../utils/tokenGenerator';
import { parseQRData } from '../utils/qrGenerator';

interface CheckInResult {
  success: boolean;
  message: string;
  eventTitle?: string;
  checkInTime?: string;
}

const CheckIn: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (eventId) {
      fetchEventDetails();
    }
  }, [isAuthenticated, eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        checkIfCanCheckIn(eventData);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const checkIfCanCheckIn = (eventData: any) => {
    const now = new Date();
    const eventDate = new Date(eventData.tanggal_mulai);
    const eventStartTime = eventData.waktu_mulai;

    // Set event start time
    if (eventStartTime) {
      const [hours, minutes] = eventStartTime.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    // Check if it's the event day and after start time
    const isEventDay = now.toDateString() === eventDate.toDateString();
    const isAfterStartTime = now >= eventDate;

    setCanCheckIn(isEventDay && isAfterStartTime);
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidToken(token)) {
      setResult({
        success: false,
        message: 'Format token tidak valid. Token harus 10 karakter (huruf besar dan angka).'
      });
      return;
    }

    await performCheckIn('token', token);
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrFile(file);

    // In real app, would process QR image and extract data
    // For now, we'll simulate QR processing
    try {
      setLoading(true);

      // Simulate QR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock QR data extraction
      const mockQRData = JSON.stringify({
        token: 'ABC123XYZ0',
        eventId: parseInt(eventId!),
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      const qrData = parseQRData(mockQRData);

      if (qrData && qrData.eventId === parseInt(eventId!)) {
        await performCheckIn('qr', qrData.token);
      } else {
        setResult({
          success: false,
          message: 'QR Code tidak valid atau bukan untuk event ini.'
        });
      }

    } catch (error) {
      setResult({
        success: false,
        message: 'Gagal memproses QR Code. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const performCheckIn = async (method: 'token' | 'qr', tokenValue: string) => {
    try {
      setLoading(true);

      const checkInData = {
        event_id: parseInt(eventId!),
        token: tokenValue,
        method: method,
        check_in_time: new Date().toISOString()
      };

      // Mock API call - in real app would call backend
      console.log('Performing check-in:', checkInData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call backend API for check-in
      const response = await fetch(`http://localhost:8000/api/validate-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ event_id: parseInt(eventId!), token: tokenValue })
      });

      const raw = await response.text();
      let payload: any = {};
      try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = { message: raw }; }

      if (response.ok) {
        setResult({
          success: true,
          message: payload.message || 'Check-in berhasil! Selamat menikmati acara.',
          eventTitle: event?.judul,
          checkInTime: new Date().toLocaleString('id-ID')
        });

        alert('🎉 Check-in berhasil! Anda sudah terdaftar hadir di event ini.');

      } else {
        const msg = payload?.message || 'Token tidak valid atau sudah digunakan.';
        const extra = payload?.event_time ? ` (Waktu event: ${payload.event_time.start} - ${payload.event_time.end}, sekarang: ${payload.event_time.now})` : '';
        setResult({
          success: false,
          message: `${msg}${extra}`
        });
      }

      // Clear form
      setToken('');
      setQrFile(null);

    } catch (error) {
      setResult({
        success: false,
        message: 'Gagal melakukan check-in. Silakan coba lagi atau hubungi panitia.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-in Event</h1>
            {event && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">{event.judul}</h2>
                <p className="text-gray-600">{event.lokasi}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.tanggal_mulai).toLocaleDateString('id-ID')} • {event.waktu_mulai} - {event.waktu_selesai}
                </p>
              </div>
            )}
          </motion.div>

          {/* Check-in Status */}
          {!canCheckIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center gap-2 text-yellow-700">
                <FiClock className="w-5 h-5" />
                <span className="font-medium">Check-in belum tersedia</span>
              </div>
              <p className="text-yellow-600 text-sm mt-1">
                Check-in hanya dapat dilakukan pada hari acara setelah jam mulai event.
              </p>
            </motion.div>
          )}

          {/* Check-in Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg p-6 mb-6 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.success ? (
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <FiXCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Check-in Berhasil!' : 'Check-in Gagal'}
                  </h3>
                  <p className={`text-sm ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  {result.success && result.checkInTime && (
                    <p className="text-xs text-green-600 mt-1">
                      Waktu check-in: {result.checkInTime}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Check-in Methods */}
          {canCheckIn && (
            <div className="space-y-6">
              {/* Token Input Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Metode 1: Input Token
                </h3>
                <form onSubmit={handleTokenSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Masukkan Token 10 Digit
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      placeholder="Contoh: ABC123XYZ0"
                      maxLength={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200 font-mono text-lg tracking-wider text-center"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Token dikirim via email setelah pendaftaran
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || token.length !== 10}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Memproses...' : 'Check-in dengan Token'}
                  </button>
                </form>
              </motion.div>

              {/* QR Upload Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Metode 2: Upload QR Code
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Foto QR Code
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRUpload}
                        className="hidden"
                        id="qr-upload"
                        disabled={loading}
                      />
                      <label
                        htmlFor="qr-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {qrFile ? (
                          <>
                            <FiCheckCircle className="w-8 h-8 text-green-500" />
                            <span className="text-green-600 font-medium">
                              {qrFile.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <FiUpload className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-600">
                              Klik untuk upload foto QR code
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      QR Code dikirim via email atau screenshot dari e-ticket
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 rounded-lg p-4 mt-6"
          >
            <h4 className="font-medium text-blue-900 mb-2">Butuh Bantuan?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Token dan QR Code dikirim via email setelah pendaftaran</li>
              <li>• Check-in hanya bisa dilakukan pada hari acara</li>
              <li>• Jika mengalami masalah, hubungi panitia di lokasi</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default CheckIn;
