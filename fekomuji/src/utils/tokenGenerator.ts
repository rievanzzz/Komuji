// Token Generator Utility
export const generateToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  
  for (let i = 0; i < 10; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
};

// Generate QR Code data
export const generateQRData = (token: string, eventId: number, userId: number): string => {
  const qrData = {
    token,
    eventId,
    userId,
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(qrData);
};

// Validate token format
export const isValidToken = (token: string): boolean => {
  const tokenRegex = /^[A-Z0-9]{10}$/;
  return tokenRegex.test(token);
};

// Generate ticket number
export const generateTicketNumber = (eventId: number, userId: number): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `TKT-${eventId}-${userId}-${timestamp}`;
};
