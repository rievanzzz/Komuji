<!DOCTYPE html>
<html>
<head>
    <title>Kode Verifikasi OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            padding: 10px 20px;
            background: #f4f4f4;
            display: inline-block;
            margin: 20px 0;
            border-radius: 4px;
        }
        .note {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Kode Verifikasi OTP Anda</h2>
        <p>Halo,</p>
        <p>Berikut adalah kode verifikasi OTP Anda:</p>
        
        <div class="otp-code">{{ $otp }}</div>
        
        <p>Gunakan kode ini untuk memverifikasi akun Anda. Kode ini berlaku selama 5 menit.</p>
        
        <p class="note">Jika Anda tidak meminta kode ini, harap abaikan email ini.</p>
        
        <p>Terima kasih,<br>{{ config('app.name') }}</p>
    </div>
</body>
</html>
