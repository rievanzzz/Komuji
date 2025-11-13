<!DOCTYPE html>
<html>
<head>
    <title>Kode Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .otp-section {
            background: #f8f9fa;
            border: 3px solid #e9ecef;
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 16px;
            color: #6c757d;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #1f2937;
            background: #ffffff;
            padding: 20px 30px;
            border-radius: 8px;
            display: inline-block;
            margin: 15px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 2px solid #dee2e6;
            font-family: 'Courier New', monospace;
        }
        .expiry-note {
            font-size: 14px;
            color: #dc3545;
            margin-top: 15px;
            font-weight: 600;
        }
        .instructions {
            background: #e7f3ff;
            border-left: 4px solid #0066cc;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 6px 6px 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <h2 style="color: #1f2937; margin: 0;">Reset Password</h2>
        </div>

        <p><strong>Halo {{ $user->name }},</strong></p>
        
        <p>Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP berikut:</p>
        
        <div class="otp-section">
            <div class="otp-label">KODE RESET PASSWORD</div>
            <div class="otp-code">{{ $otp }}</div>
            <div class="expiry-note">⏰ Berlaku selama 5 menit</div>
        </div>

        <div class="instructions">
            <h4 style="margin: 0 0 10px 0; color: #0066cc;">Cara Menggunakan:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #0066cc;">
                <li>Buka halaman reset password</li>
                <li>Masukkan kode OTP: <strong>{{ $otp }}</strong></li>
                <li>Buat password baru yang kuat</li>
                <li>Konfirmasi password baru</li>
            </ol>
        </div>

        <div class="warning">
            <strong>⚠️ PENTING:</strong> Jangan bagikan kode ini kepada siapa pun. Jika Anda tidak meminta reset password, abaikan email ini.
        </div>

        <p>Terima kasih,<br><strong>Tim {{ config('app.name') }}</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="font-size: 12px; color: #6c757d; text-align: center;">
            Email otomatis - Jangan balas email ini
        </p>
    </div>
</body>
</html>
