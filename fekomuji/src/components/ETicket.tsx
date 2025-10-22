import React from 'react';
import { FiDownload, FiShare2 } from 'react-icons/fi';

interface ETicketData {
  id: string;
  ticketNumber: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  participantName: string;
  participantEmail: string;
  ticketCategory: string;
  ticketPrice: number;
  registrationDate: string;
  eventImage?: string;
  qrCode?: string;
}

interface ETicketProps {
  data: ETicketData;
  onShare?: () => void;
  onClose?: () => void;
}

const ETicket: React.FC<ETicketProps> = ({ data, onShare }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = () => {
    // Create a clean version for PDF without website header
    const printContent = `
      <html>
        <head>
          <title>E-Ticket - ${data.eventTitle}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
            }
            .ticket-container { 
              max-width: 400px; 
              margin: 0 auto; 
              border: 1px solid #e5e7eb; 
              border-radius: 12px; 
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(to right, #2563eb, #1d4ed8); 
              color: white; 
              padding: 32px 24px; 
              text-align: center;
            }
            .header h1 { 
              margin: 0 0 8px 0; 
              font-size: 24px; 
              font-weight: bold;
            }
            .header p { 
              margin: 0; 
              font-size: 14px; 
              opacity: 0.9;
            }
            .content { 
              padding: 24px;
            }
            .ticket-number { 
              text-align: center; 
              margin-bottom: 24px;
            }
            .ticket-number p:first-child { 
              font-size: 12px; 
              color: #6b7280; 
              text-transform: uppercase; 
              letter-spacing: 0.05em; 
              margin-bottom: 4px;
            }
            .ticket-number p:last-child { 
              font-size: 18px; 
              font-family: monospace; 
              font-weight: 600; 
              color: #111827;
            }
            .details { 
              margin-bottom: 24px;
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              border-bottom: 1px solid #f3f4f6;
            }
            .detail-row:last-child { 
              border-bottom: none;
            }
            .detail-label { 
              font-size: 14px; 
              color: #6b7280;
            }
            .detail-value { 
              font-size: 14px; 
              font-weight: 500; 
              color: #111827;
            }
            .price { 
              font-size: 18px; 
              font-weight: bold; 
              color: #2563eb;
            }
            .qr-section { 
              text-align: center; 
              padding: 24px 0; 
              border-top: 1px solid #f3f4f6;
            }
            .qr-section p { 
              font-size: 14px; 
              color: #6b7280; 
              margin-bottom: 16px;
            }
            .qr-container { 
              display: inline-block; 
              padding: 16px; 
              background: #f9fafb; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px;
            }
            .footer { 
              text-align: center; 
              margin-top: 24px; 
              padding-top: 24px; 
              border-top: 1px solid #e5e7eb;
            }
            .footer p { 
              font-size: 14px; 
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="header">
              <h1>${data.eventTitle}</h1>
              <p>E-Ticket</p>
            </div>
            
            <div class="content">
              <div class="ticket-number">
                <p>Ticket Number</p>
                <p>#${data.ticketNumber}</p>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Peserta</span>
                  <span class="detail-value">${data.participantName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tanggal</span>
                  <span class="detail-value">${formatDate(data.eventDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Waktu</span>
                  <span class="detail-value">${data.eventTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Lokasi</span>
                  <span class="detail-value">${data.eventLocation}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Kategori</span>
                  <span class="detail-value">${data.ticketCategory}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Harga</span>
                  <span class="detail-value price">${data.ticketPrice === 0 ? 'GRATIS' : formatCurrency(data.ticketPrice)}</span>
                </div>
              </div>
              
              <div class="qr-section">
                <p>QR Code untuk Check-in</p>
                <div class="qr-container">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
                    ticketId: data.id,
                    ticketNumber: data.ticketNumber,
                    participantName: data.participantName,
                    eventTitle: data.eventTitle,
                    eventDate: data.eventDate,
                    timestamp: new Date().toISOString()
                  }))}" alt="QR Code" style="width: 150px; height: 150px;">
                </div>
                <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
                  Tunjukkan QR code ini saat check-in
                </p>
              </div>
              
              <div class="footer">
                <p>E-Ticket dibuat pada ${formatDate(data.registrationDate)}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      {/* Minimalist Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">{data.eventTitle}</h1>
        <p className="text-blue-100 text-sm font-medium">E-Ticket</p>
      </div>

      {/* Clean Ticket Info */}
      <div className="p-6">
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ticket Number</p>
          <p className="text-lg font-mono font-semibold text-gray-900">#{data.ticketNumber}</p>
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Peserta</span>
            <span className="text-sm font-medium text-gray-900">{data.participantName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Tanggal</span>
            <span className="text-sm font-medium text-gray-900">{formatDate(data.eventDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Waktu</span>
            <span className="text-sm font-medium text-gray-900">{data.eventTime}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Lokasi</span>
            <span className="text-sm font-medium text-gray-900">{data.eventLocation}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Kategori</span>
            <span className="text-sm font-medium text-gray-900">{data.ticketCategory}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Harga</span>
            <span className="text-lg font-bold text-blue-600">
              {data.ticketPrice === 0 ? 'GRATIS' : formatCurrency(data.ticketPrice)}
            </span>
          </div>
        </div>

        {/* QR Code Section - Minimalist */}
        <div className="text-center py-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-4">QR Code untuk Check-in</p>
          <div className="inline-block p-4 bg-gray-50 rounded-lg border border-gray-200">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
                ticketId: data.id,
                ticketNumber: data.ticketNumber,
                participantName: data.participantName,
                eventTitle: data.eventTitle,
                eventDate: data.eventDate,
                timestamp: new Date().toISOString()
              }))}`}
              alt="QR Code"
              className="w-[150px] h-[150px] rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.outerHTML = `
                  <div class="w-[150px] h-[150px] bg-gray-900 flex items-center justify-center text-white text-xs font-mono rounded-lg">
                    <div class="text-center">
                      <div class="text-lg font-bold mb-1">QR CODE</div>
                      <div class="text-xs opacity-75">${data.ticketNumber.slice(-6)}</div>
                    </div>
                  </div>
                `;
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Tunjukkan QR code ini saat check-in
          </p>
        </div>

        {/* Simple Action Buttons */}
        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FiDownload size={18} />
            Download Tiket
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <FiShare2 size={18} />
              Bagikan
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            E-Ticket dibuat pada {formatDate(data.registrationDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ETicket;
