import React from 'react';
import { FiDownload, FiPrinter, FiCalendar, FiMapPin, FiUser, FiClock } from 'react-icons/fi';

interface InvoiceData {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  participantName: string;
  participantEmail: string;
  ticketCategory: string;
  ticketPrice: number;
  registrationDate: string;
  invoiceNumber: string;
  qrCode?: string;
}

interface InvoiceProps {
  data: InvoiceData;
  onDownload?: () => void;
  onPrint?: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ data, onDownload, onPrint }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = () => {
    // Create clean invoice HTML for PDF
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice - ${data.invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
              color: #333;
            }
            .invoice-container { 
              max-width: 600px; 
              margin: 0 auto; 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #2563eb, #1d4ed8); 
              color: white; 
              padding: 30px; 
              text-align: left;
            }
            .header h1 { 
              margin: 0 0 10px 0; 
              font-size: 32px; 
              font-weight: bold;
            }
            .header .invoice-number { 
              font-size: 18px; 
              opacity: 0.9;
            }
            .header .company { 
              float: right; 
              text-align: right; 
              margin-top: -50px;
            }
            .header .company h2 { 
              margin: 0; 
              font-size: 24px;
            }
            .header .company p { 
              margin: 5px 0 0 0; 
              font-size: 14px; 
              opacity: 0.8;
            }
            .content { 
              padding: 30px;
            }
            .info-section { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
            }
            .info-box h3 { 
              margin: 0 0 15px 0; 
              font-size: 16px; 
              color: #2563eb; 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 5px;
            }
            .info-box p { 
              margin: 5px 0; 
              font-size: 14px; 
              line-height: 1.5;
            }
            .ticket-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0;
            }
            .ticket-table th, .ticket-table td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #e5e7eb;
            }
            .ticket-table th { 
              background: #f8fafc; 
              font-weight: 600; 
              color: #374151;
            }
            .total-section { 
              text-align: right; 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 2px solid #e5e7eb;
            }
            .total-amount { 
              font-size: 20px; 
              font-weight: bold; 
              color: #2563eb;
            }
            .qr-section { 
              text-align: center; 
              margin: 30px 0; 
              padding: 20px; 
              background: #f8fafc; 
              border-radius: 8px;
            }
            .qr-section h3 { 
              margin: 0 0 15px 0; 
              color: #374151;
            }
            .footer { 
              background: #f8fafc; 
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>Invoice</h1>
              <p class="invoice-number">#${data.invoiceNumber}</p>
              <div class="company">
                <h2>MILUAN</h2>
                <p>Event Management Platform</p>
              </div>
            </div>
            
            <div class="content">
              <div class="info-section">
                <div class="info-box">
                  <h3>Informasi Peserta</h3>
                  <p><strong>Nama:</strong> ${data.participantName}</p>
                  <p><strong>Email:</strong> ${data.participantEmail}</p>
                  <p><strong>Tanggal Daftar:</strong> ${formatDate(data.registrationDate)}</p>
                </div>
                
                <div class="info-box">
                  <h3>Detail Event</h3>
                  <p><strong>Event:</strong> ${data.eventTitle}</p>
                  <p><strong>Tanggal:</strong> ${formatDate(data.eventDate)}</p>
                  <p><strong>Waktu:</strong> ${data.eventTime}</p>
                  <p><strong>Lokasi:</strong> ${data.eventLocation}</p>
                </div>
              </div>
              
              <table class="ticket-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>${data.ticketCategory}</strong><br>
                      <small>Tiket untuk ${data.eventTitle}</small>
                    </td>
                    <td>1</td>
                    <td>${data.ticketPrice === 0 ? 'Gratis' : formatCurrency(data.ticketPrice)}</td>
                    <td><strong>${data.ticketPrice === 0 ? 'Gratis' : formatCurrency(data.ticketPrice)}</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <div class="total-section">
                <p class="total-amount">Total Pembayaran: ${data.ticketPrice === 0 ? 'GRATIS' : formatCurrency(data.ticketPrice)}</p>
              </div>
              
              <div class="qr-section">
                <h3>QR Code Check-in</h3>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(JSON.stringify({
                  invoiceNumber: data.invoiceNumber,
                  participantName: data.participantName,
                  participantEmail: data.participantEmail,
                  eventTitle: data.eventTitle,
                  eventDate: data.eventDate,
                  ticketCategory: data.ticketCategory,
                  timestamp: new Date().toISOString()
                }))}" alt="QR Code" style="width: 120px; height: 120px;">
                <p style="margin-top: 10px; font-size: 12px;">Tunjukkan QR code ini kepada panitia saat check-in</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Invoice ini dibuat secara otomatis pada ${formatDate(data.registrationDate)}</p>
              <p>Terima kasih telah menggunakan MILUAN Event Management Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      {/* Header - Enhanced */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 rounded-t-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Invoice</h2>
            <p className="text-blue-100 text-xl font-medium">#{data.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-2 tracking-wide">MILUAN</div>
            <p className="text-blue-200 text-sm font-medium">Event Management Platform</p>
          </div>
        </div>
      </div>

      {/* Content - Enhanced */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Informasi Peserta
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Nama:</span> {data.participantName}</p>
              <p><span className="font-medium">Email:</span> {data.participantEmail}</p>
              <p><span className="font-medium">Tanggal Daftar:</span> {formatDate(data.registrationDate)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              Detail Event
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Event:</span> {data.eventTitle}</p>
              <p className="flex items-center gap-2">
                <FiCalendar size={16} />
                {formatDate(data.eventDate)}
              </p>
              <p className="flex items-center gap-2">
                <FiClock size={16} />
                {data.eventTime}
              </p>
              <p className="flex items-center gap-2">
                <FiMapPin size={16} />
                {data.eventLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="border-2 border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Detail Tiket</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Kategori Tiket</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Jumlah</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Harga</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{data.ticketCategory}</p>
                      <p className="text-sm text-gray-500">Tiket personal dengan akses penuh</p>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-700">1</td>
                  <td className="text-right py-4 px-4 text-gray-700">
                    {data.ticketPrice === 0 ? 'Gratis' : formatCurrency(data.ticketPrice)}
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-900">
                    {data.ticketPrice === 0 ? 'Gratis' : formatCurrency(data.ticketPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 mt-6 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-900">Total Pembayaran:</span>
              <span className="text-2xl font-bold text-blue-600">
                {data.ticketPrice === 0 ? 'GRATIS' : formatCurrency(data.ticketPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Section - Enhanced */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 mb-8 border border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">QR Code Check-in</h3>
            <p className="text-gray-600 mb-6">Scan untuk masuk ke event</p>
            
            <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-dashed border-blue-300">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(JSON.stringify({
                  invoiceNumber: data.invoiceNumber,
                  participantName: data.participantName,
                  participantEmail: data.participantEmail,
                  eventTitle: data.eventTitle,
                  eventDate: data.eventDate,
                  ticketCategory: data.ticketCategory,
                  timestamp: new Date().toISOString()
                }))}`}
                alt="QR Code Invoice" 
                className="w-30 h-30 rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = `
                    <div class="w-30 h-30 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex flex-col items-center justify-center text-white">
                      <div class="text-xs font-bold mb-1">QR CODE</div>
                      <div class="text-lg font-mono font-bold">${data.invoiceNumber.slice(-6)}</div>
                      <div class="text-xs mt-1 opacity-75">SCAN ME</div>
                    </div>
                  `;
                }}
              />
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium">
                💡 Tunjukkan QR code ini kepada panitia saat check-in
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <h4 className="font-semibold text-blue-900 mb-3">Informasi Penting:</h4>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Tiket ini berlaku untuk satu orang dan tidak dapat dipindahtangankan</li>
            <li>• Harap datang 15 menit sebelum acara dimulai</li>
            <li>• Tunjukkan QR code atau email konfirmasi ini saat check-in</li>
            <li>• Simpan invoice ini sebagai bukti pendaftaran yang sah</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                Terima kasih telah mendaftar di event kami!
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Invoice ini dibuat secara otomatis pada {formatDate(data.registrationDate)}
              </p>
            </div>
            
            <div className="flex gap-3">
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiPrinter size={16} />
                  Print
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiDownload size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
