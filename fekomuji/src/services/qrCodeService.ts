// Simple QR Code implementation without external library
// Uses a QR code generator API service

export interface TicketQRData {
  ticketId: string;
  ticketNumber: string;
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventDate: string;
  ticketCategory: string;
  timestamp: string;
}

export class QRCodeService {
  /**
   * Generate QR code data URL for ticket
   */
  static async generateTicketQR(data: TicketQRData): Promise<string> {
    try {
      // Use QR Server API for generating QR codes
      const qrData = JSON.stringify(data);
      console.log('QR Data generated:', qrData);
      
      // Generate QR code using free API service
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      
      return qrApiUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code for attendance check-in
   */
  static async generateAttendanceQR(ticketId: string, eventId: string): Promise<string> {
    try {
      const attendanceData = {
        type: 'attendance',
        ticketId,
        eventId,
        timestamp: new Date().toISOString()
      };

      // Temporary implementation - returns base64 placeholder
      console.log('Attendance QR Data generated:', attendanceData);
      return `data:text/plain;base64,${btoa(`ATTENDANCE:${ticketId}`)}`;
    } catch (error) {
      console.error('Error generating attendance QR code:', error);
      throw new Error('Failed to generate attendance QR code');
    }
  }

  /**
   * Validate and parse QR code data
   */
  static validateQRData(qrString: string): TicketQRData | null {
    try {
      const data = JSON.parse(qrString);
      
      // Validate required fields
      const requiredFields = [
        'ticketId', 'ticketNumber', 'participantName', 
        'participantEmail', 'eventTitle', 'eventDate', 
        'ticketCategory', 'timestamp'
      ];

      for (const field of requiredFields) {
        if (!data[field]) {
          console.error(`Missing required field: ${field}`);
          return null;
        }
      }

      return data as TicketQRData;
    } catch (error) {
      console.error('Invalid QR code data:', error);
      return null;
    }
  }

  /**
   * Check if QR code is expired (optional timestamp validation)
   */
  static isQRExpired(qrData: TicketQRData, expirationHours: number = 24): boolean {
    try {
      const qrTimestamp = new Date(qrData.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - qrTimestamp.getTime()) / (1000 * 60 * 60);
      
      return diffHours > expirationHours;
    } catch (error) {
      console.error('Error checking QR expiration:', error);
      return true; // Consider expired if can't parse
    }
  }

  /**
   * Generate QR code for event check-in URL
   */
  static async generateEventCheckInQR(eventId: string, baseUrl: string): Promise<string> {
    try {
      const checkInUrl = `${baseUrl}/check-in/${eventId}`;
      
      // Temporary implementation - returns base64 placeholder
      console.log('Check-in QR URL generated:', checkInUrl);
      return `data:text/plain;base64,${btoa(`CHECKIN:${eventId}`)}`;
    } catch (error) {
      console.error('Error generating check-in QR code:', error);
      throw new Error('Failed to generate check-in QR code');
    }
  }
}
