import { QRCodeService, type TicketQRData } from './qrCodeService';

export interface EmailTicketData {
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketCategory: string;
  ticketPrice: number;
  ticketNumber: string;
  ticketId: string;
  organizerName?: string;
  eventImage?: string;
}

export class EmailService {
  private static readonly API_BASE_URL = 'http://localhost:8000/api';

  /**
   * Send e-ticket via email
   */
  static async sendETicket(ticketData: EmailTicketData): Promise<boolean> {
    try {
      // Generate QR code for the ticket
      const qrData: TicketQRData = {
        ticketId: ticketData.ticketId,
        ticketNumber: ticketData.ticketNumber,
        participantName: ticketData.participantName,
        participantEmail: ticketData.participantEmail,
        eventTitle: ticketData.eventTitle,
        eventDate: ticketData.eventDate,
        ticketCategory: ticketData.ticketCategory,
        timestamp: new Date().toISOString()
      };

      const qrCodeDataURL = await QRCodeService.generateTicketQR(qrData);

      // Prepare email data
      const emailData = {
        to: ticketData.participantEmail,
        subject: `E-Tiket: ${ticketData.eventTitle}`,
        template: 'eticket',
        data: {
          ...ticketData,
          qrCode: qrCodeDataURL,
          eventDateFormatted: new Date(ticketData.eventDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          ticketPriceFormatted: ticketData.ticketPrice === 0 ? 'GRATIS' : 
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(ticketData.ticketPrice)
        }
      };

      // Send email via API
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.API_BASE_URL}/send-eticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      console.log('E-ticket sent successfully to:', ticketData.participantEmail);
      return true;

    } catch (error) {
      console.error('Error sending e-ticket:', error);
      return false;
    }
  }

  /**
   * Send registration confirmation email
   */
  static async sendRegistrationConfirmation(ticketData: EmailTicketData): Promise<boolean> {
    try {
      const emailData = {
        to: ticketData.participantEmail,
        subject: `Konfirmasi Pendaftaran: ${ticketData.eventTitle}`,
        template: 'registration_confirmation',
        data: {
          participantName: ticketData.participantName,
          eventTitle: ticketData.eventTitle,
          eventDate: new Date(ticketData.eventDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          eventTime: ticketData.eventTime,
          eventLocation: ticketData.eventLocation,
          ticketCategory: ticketData.ticketCategory,
          ticketNumber: ticketData.ticketNumber
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.API_BASE_URL}/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      return response.ok;

    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
  }

  /**
   * Send event reminder email
   */
  static async sendEventReminder(ticketData: EmailTicketData, reminderType: 'day_before' | 'hour_before'): Promise<boolean> {
    try {
      const emailData = {
        to: ticketData.participantEmail,
        subject: `Pengingat Event: ${ticketData.eventTitle}`,
        template: 'event_reminder',
        data: {
          ...ticketData,
          reminderType,
          formattedDate: new Date(ticketData.eventDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.API_BASE_URL}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      return response.ok;

    } catch (error) {
      console.error('Error sending reminder email:', error);
      return false;
    }
  }

  /**
   * Generate and send invoice email
   */
  static async sendInvoice(ticketData: EmailTicketData): Promise<boolean> {
    try {
      const emailData = {
        to: ticketData.participantEmail,
        subject: `Invoice: ${ticketData.eventTitle}`,
        template: 'invoice',
        data: {
          ...ticketData,
          invoiceNumber: `INV-${ticketData.ticketNumber}`,
          invoiceDate: new Date().toLocaleDateString('id-ID'),
          formattedDate: new Date(ticketData.eventDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          formattedPrice: ticketData.ticketPrice === 0 ? 'GRATIS' : 
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(ticketData.ticketPrice)
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.API_BASE_URL}/send-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      return response.ok;

    } catch (error) {
      console.error('Error sending invoice:', error);
      return false;
    }
  }

  /**
   * Generate email template for e-ticket (HTML)
   */
  static generateETicketHTML(ticketData: EmailTicketData & { qrCode: string }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-Tiket ${ticketData.eventTitle}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .ticket-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .qr-section { text-align: center; background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎫 E-TIKET</h1>
                <h2>${ticketData.eventTitle}</h2>
                <p>Tiket #${ticketData.ticketNumber}</p>
            </div>
            
            <div class="content">
                <h3>Halo ${ticketData.participantName}!</h3>
                <p>Terima kasih telah mendaftar untuk event <strong>${ticketData.eventTitle}</strong>. Berikut adalah e-tiket Anda:</p>
                
                <div class="ticket-info">
                    <h4>Detail Event</h4>
                    <p><strong>Tanggal:</strong> ${new Date(ticketData.eventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Waktu:</strong> ${ticketData.eventTime}</p>
                    <p><strong>Lokasi:</strong> ${ticketData.eventLocation}</p>
                    <p><strong>Kategori Tiket:</strong> ${ticketData.ticketCategory}</p>
                    <p><strong>Harga:</strong> ${ticketData.ticketPrice === 0 ? 'GRATIS' : `Rp ${ticketData.ticketPrice.toLocaleString('id-ID')}`}</p>
                </div>
                
                <div class="qr-section">
                    <h4>QR Code Check-in</h4>
                    <img src="${ticketData.qrCode}" alt="QR Code" style="max-width: 200px;">
                    <p><small>Tunjukkan QR code ini saat check-in di lokasi event</small></p>
                </div>
                
                <h4>📋 Petunjuk Penting:</h4>
                <ul>
                    <li>Datang 15 menit sebelum acara dimulai</li>
                    <li>Bawa identitas diri yang sesuai</li>
                    <li>Tunjukkan QR code atau email ini saat check-in</li>
                    <li>Tiket tidak dapat dipindahtangankan</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>E-tiket ini dibuat otomatis oleh sistem KOMUJI</p>
                <p><small>Jika ada pertanyaan, hubungi panitia event</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}
