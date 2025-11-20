<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Ticket - {{ $event->judul }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .ticket-box {
            background: white;
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .ticket-code {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .qr-code {
            text-align: center;
            margin: 20px 0;
        }
        .qr-code img {
            max-width: 250px;
            height: auto;
            border: 3px solid #667eea;
            border-radius: 10px;
            padding: 10px;
            background: white;
        }
        .info-row {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #667eea;
            display: inline-block;
            width: 140px;
        }
        .info-value {
            color: #333;
        }
        .check-in-token {
            background: #fef3c7;
            border: 2px dashed #f59e0b;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .check-in-token h3 {
            margin: 0 0 10px 0;
            color: #92400e;
        }
        .token-code {
            font-size: 28px;
            font-weight: bold;
            color: #92400e;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .important-info {
            background: #e0f2fe;
            border-left: 4px solid #0284c7;
            padding: 15px;
            margin: 20px 0;
        }
        .important-info h3 {
            margin: 0 0 10px 0;
            color: #0284c7;
        }
        .important-info ul {
            margin: 0;
            padding-left: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ Pembayaran Berhasil!</h1>
        <p style="margin: 10px 0 0 0;">E-Ticket Anda Siap</p>
    </div>

    <div class="content">
        <p>Halo <strong>{{ $registration->nama_peserta }}</strong>,</p>

        <p>Terima kasih telah mendaftar! Pembayaran Anda telah berhasil diproses. Berikut adalah e-ticket Anda:</p>

        <div class="ticket-box">
            <h2 style="margin-top: 0; color: #667eea; text-align: center;">{{ $event->judul }}</h2>

            <div class="info-row">
                <span class="info-label">📅 Tanggal:</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($event->tanggal_mulai)->format('l, d F Y') }}</span>
            </div>

            <div class="info-row">
                <span class="info-label">🕐 Waktu:</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($event->tanggal_mulai)->format('H:i') }} WIB</span>
            </div>

            <div class="info-row">
                <span class="info-label">📍 Lokasi:</span>
                <span class="info-value">{{ $event->lokasi }}</span>
            </div>

            <div class="info-row">
                <span class="info-label">🎫 Kategori:</span>
                <span class="info-value">{{ $registration->ticketCategory->nama_kategori ?? 'Regular' }}</span>
            </div>

            <div class="info-row">
                <span class="info-label">💰 Harga:</span>
                <span class="info-value">Rp {{ number_format($registration->total_harga, 0, ',', '.') }}</span>
            </div>

            <div class="ticket-code">
                {{ $registration->kode_pendaftaran }}
            </div>

            @if($attendanceToken)
            <div class="check-in-token">
                <h3>🎯 Token Check-In</h3>
                <div class="token-code">{{ $attendanceToken }}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #92400e;">
                    Gunakan token ini atau QR code untuk check-in di lokasi event
                </p>
            </div>
            @endif

            <div class="qr-code">
                <p><strong>QR Code Check-In</strong></p>
                @if($registration->qr_code)
                    <img src="{{ $registration->qr_code }}" alt="QR Code">
                @else
                    <p style="color: #666;">QR Code akan tersedia segera</p>
                @endif
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                    Tunjukkan QR code ini saat check-in
                </p>
            </div>
        </div>

        <div class="important-info">
            <h3>ℹ️ Informasi Penting</h3>
            <ul>
                <li>Simpan email ini dengan baik sebagai bukti pendaftaran</li>
                <li>Tunjukkan QR code atau token check-in saat memasuki lokasi event</li>
                <li>Datang minimal 15 menit sebelum event dimulai</li>
                <li>Jika ada pertanyaan, silakan hubungi penyelenggara event</li>
            </ul>
        </div>

        <div class="info-row">
            <span class="info-label">Invoice Number:</span>
            <span class="info-value">{{ $registration->invoice_number }}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Tanggal Pembayaran:</span>
            <span class="info-value">{{ now()->format('d F Y, H:i') }} WIB</span>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <p>Sampai jumpa di event!</p>
            <p style="font-size: 24px; margin: 10px 0;">🎉</p>
        </div>
    </div>

    <div class="footer">
        <p><strong>Komuji Event Management</strong></p>
        <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
        <p style="font-size: 12px; margin-top: 10px;">
            © {{ date('Y') }} Komuji. All rights reserved.
        </p>
    </div>
</body>
</html>
