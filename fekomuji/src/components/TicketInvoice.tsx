import React from 'react';
import { FiDownload, FiMail, FiCalendar, FiMapPin, FiUser, FiCreditCard } from 'react-icons/fi';

interface TicketInvoiceProps {
  registrationData: {
    registration: {
      kode_pendaftaran: string;
      nama_peserta: string;
      email_peserta: string;
      total_harga: number;
      payment_status: string;
      created_at: string;
      event: {
        judul: string;
        tanggal_mulai: string;
        waktu_mulai: string;
        waktu_selesai: string;
        lokasi: string;
      };
      ticketCategory: {
        nama_kategori: string;
        deskripsi: string;
      };
    };
    qr_code: string;
    invoice_number?: string;
  };
  onClose: () => void;
}

const TicketInvoice: React.FC<TicketInvoiceProps> = ({ registrationData, onClose }) => {
  const { registration, invoice_number } = registrationData;
  const { event, ticketCategory } = registration;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable version
    const element = document.getElementById('ticket-content');
    if (element) {
      // Simple download as HTML (in a real app, you'd use a PDF library)
      const htmlContent = element.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${registration.kode_pendaftaran}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {registration.payment_status === 'free' ? 'E-Ticket' : 'Invoice & E-Ticket'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <FiDownload size={20} />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <FiMail size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div id="ticket-content" className="p-6">
          {/* Invoice Header (if paid) */}
          {registration.payment_status !== 'free' && invoice_number && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-yellow-800">Invoice</h3>
                <span className="text-sm text-yellow-600">#{invoice_number}</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Silakan lakukan pembayaran dalam 30 menit untuk mengaktifkan tiket Anda.
              </p>
            </div>
          )}

          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {registration.payment_status === 'free' ? 'Pendaftaran Berhasil!' : 'Invoice Dibuat!'}
            </h3>
            <p className="text-gray-600">
              {registration.payment_status === 'free' 
                ? 'Tiket Anda telah berhasil dibuat dan siap digunakan.'
                : 'Silakan lakukan pembayaran untuk mengaktifkan tiket Anda.'
              }
            </p>
          </div>

          {/* Ticket Details */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Event Info */}
              <div className="md:col-span-2">
                <h4 className="text-xl font-bold text-gray-900 mb-4">{event.judul}</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-blue-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal & Waktu</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(event.tanggal_mulai)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.waktu_mulai} - {event.waktu_selesai}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-blue-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi</p>
                      <p className="font-medium text-gray-900">{event.lokasi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiUser className="text-blue-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Peserta</p>
                      <p className="font-medium text-gray-900">{registration.nama_peserta}</p>
                      <p className="text-sm text-gray-600">{registration.email_peserta}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-blue-600" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Kategori Tiket</p>
                      <p className="font-medium text-gray-900">{ticketCategory.nama_kategori}</p>
                      <p className="text-sm text-gray-600">{ticketCategory.deskripsi}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: QR Code */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">QR Code Tiket</p>
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📱</div>
                      <div className="text-xs text-gray-600">QR Code</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {registration.kode_pendaftaran}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tunjukkan kode ini saat check-in
                </p>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-gray-900 mb-3">Detail Pendaftaran</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Kode Pendaftaran:</span>
                <span className="font-medium text-gray-900 ml-2">{registration.kode_pendaftaran}</span>
              </div>
              <div>
                <span className="text-gray-500">Tanggal Daftar:</span>
                <span className="font-medium text-gray-900 ml-2">
                  {new Date(registration.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Harga:</span>
                <span className="font-medium text-gray-900 ml-2">
                  {registration.total_harga === 0 ? 'Gratis' : `Rp ${registration.total_harga.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ml-2 ${
                  registration.payment_status === 'free' ? 'text-green-600' : 
                  registration.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {registration.payment_status === 'free' ? 'Aktif' : 
                   registration.payment_status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                </span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Catatan Penting:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Harap tiba 15 menit sebelum acara dimulai</li>
              <li>• Tunjukkan QR code atau kode pendaftaran saat check-in</li>
              <li>• Tiket tidak dapat dipindahtangankan</li>
              <li>• Simpan tiket ini dengan baik hingga acara selesai</li>
              {registration.payment_status !== 'free' && (
                <li>• Tiket akan aktif setelah pembayaran dikonfirmasi</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiDownload size={16} />
              Download Tiket
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInvoice;
