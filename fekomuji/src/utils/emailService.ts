// Email Service Utility
export interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

export interface RegistrationEmailData {
  recipientEmail: string;
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  token: string;
  qrCodeImage: string;
  registrationCode: string;
}

// Email Templates
export const generateRegistrationEmailTemplate = (data: RegistrationEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Konfirmasi Pendaftaran Event</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .event-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .token-section { background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .token { font-size: 24px; font-weight: bold; color: #28a745; font-family: monospace; letter-spacing: 3px; }
            .qr-code { text-align: center; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Pendaftaran Berhasil!</h1>
                <p>Terima kasih telah mendaftar event kami</p>
            </div>
            
            <div class="content">
                <h2>Halo ${data.recipientName}!</h2>
                <p>Selamat! Pendaftaran Anda untuk event berikut telah berhasil dikonfirmasi:</p>
                
                <div class="event-details">
                    <h3>📅 ${data.eventTitle}</h3>
                    <p><strong>📍 Lokasi:</strong> ${data.eventLocation}</p>
                    <p><strong>🗓 Tanggal:</strong> ${data.eventDate}</p>
                    <p><strong>⏰ Waktu:</strong> ${data.eventTime}</p>
                    <p><strong>🎫 Kode Pendaftaran:</strong> ${data.registrationCode}</p>
                </div>
                
                <div class="token-section">
                    <h3>🔑 Token Check-in Anda</h3>
                    <p>Simpan token ini untuk check-in pada hari acara:</p>
                    <div class="token">${data.token}</div>
                    <p><small>Token ini diperlukan untuk absensi di lokasi event</small></p>
                </div>
                
                <div class="qr-code">
                    <h3>📱 QR Code Anda</h3>
                    <p>Atau gunakan QR Code ini untuk check-in:</p>
                    <img src="${data.qrCodeImage}" alt="QR Code" style="max-width: 200px; border: 1px solid #ddd; border-radius: 8px;">
                    <p><small>Screenshot QR code ini atau tunjukkan email ini saat check-in</small></p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4>📝 Petunjuk Check-in:</h4>
                    <ol>
                        <li>Datang ke lokasi event pada waktu yang telah ditentukan</li>
                        <li>Tunjukkan QR code atau berikan token kepada panitia</li>
                        <li>Panitia akan melakukan scan/verifikasi</li>
                        <li>Selamat menikmati acara! 🎉</li>
                    </ol>
                </div>
            </div>
            
            <div class="footer">
                <p>Jika ada pertanyaan, silakan hubungi panitia event.</p>
                <p><small>Email ini dikirim otomatis, mohon tidak membalas.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Reminder Email Template
export const generateReminderEmailTemplate = (data: RegistrationEmailData, reminderType: 'h-1' | '2-hours'): string => {
  const reminderText = reminderType === 'h-1' 
    ? 'Event yang Anda daftarkan akan dimulai besok!' 
    : 'Event yang Anda daftarkan akan dimulai dalam 2 jam!';
    
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reminder Event</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; }
            .header { text-align: center; color: #ff6b35; margin-bottom: 30px; }
            .token { font-size: 20px; font-weight: bold; color: #28a745; font-family: monospace; text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ ${reminderText}</h1>
            </div>
            
            <h2>Halo ${data.recipientName}!</h2>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Waktu:</strong> ${data.eventDate} ${data.eventTime}</p>
            <p><strong>Lokasi:</strong> ${data.eventLocation}</p>
            
            <p>Jangan lupa bawa token check-in Anda:</p>
            <div class="token">${data.token}</div>
            
            <p>Sampai jumpa di acara! 🎉</p>
        </div>
    </body>
    </html>
  `;
};

// Send Email Function (Real implementation via backend API)
export const sendEmail = async (
  to: string, 
  subject: string, 
  htmlContent: string,
  config?: EmailConfig
): Promise<boolean> => {
  try {
    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    
    // Call backend API to send email
    const response = await fetch('http://localhost:8000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: htmlContent,
        config: config
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Failed to send email:', error);
      
      // Fallback: Show email content in console for testing
      console.log('📧 EMAIL CONTENT (for testing):');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('HTML:', htmlContent.substring(0, 500) + '...');
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Email service error:', error);
    
    // Fallback: Show email content in console for testing
    console.log('📧 EMAIL CONTENT (for testing):');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', htmlContent.substring(0, 500) + '...');
    
    return false;
  }
};

// Send Registration Confirmation Email
export const sendRegistrationEmail = async (data: RegistrationEmailData): Promise<boolean> => {
  const subject = `✅ Konfirmasi Pendaftaran - ${data.eventTitle}`;
  const htmlContent = generateRegistrationEmailTemplate(data);
  
  return await sendEmail(data.recipientEmail, subject, htmlContent);
};

// Send Reminder Email
export const sendReminderEmail = async (data: RegistrationEmailData, reminderType: 'h-1' | '2-hours'): Promise<boolean> => {
  const subject = reminderType === 'h-1' 
    ? `⏰ Reminder: ${data.eventTitle} - Besok!`
    : `🚨 Reminder: ${data.eventTitle} - 2 Jam Lagi!`;
    
  const htmlContent = generateReminderEmailTemplate(data, reminderType);
  
  return await sendEmail(data.recipientEmail, subject, htmlContent);
};
