# 📸 Panduan Upload Gambar Event - Komuji Platform

## 🎯 Overview
Panduan lengkap untuk admin/organizer dalam mengupload gambar event (flyer/poster) agar dapat ditampilkan dengan baik di halaman publik.

## 📁 Struktur Folder

### Backend (Laravel)
```
Komuji/
├── storage/app/public/events/
│   ├── flyers/          # Gambar flyer/poster event
│   └── certificates/    # Template sertifikat
├── public/storage/      # Symlink ke storage/app/public
```

### Frontend (React)
```
fekomuji/
├── public/images/
│   ├── default-event.svg    # Gambar default untuk event tanpa flyer
│   └── default-event.jpg    # Backup gambar default
```

## 🚀 Cara Upload Gambar Event

### 1. Login sebagai Admin/Organizer
- Akses `/organizer/login` atau login dengan role `admin`/`panitia`
- Masuk ke dashboard organizer

### 2. Buat Event Baru
- Klik "Buat Event Baru" di dashboard
- Isi semua field yang required:
  - **Judul Event** (wajib)
  - **Deskripsi** (wajib)
  - **Tanggal & Waktu** (wajib)
  - **Lokasi** (wajib)
  - **Kuota Peserta** (wajib)
  - **Harga Tiket** (opsional, default: gratis)

### 3. Upload Flyer/Poster
- Scroll ke bagian "Upload Flyer"
- Klik area upload atau drag & drop file
- **Format yang didukung:** JPG, PNG, WebP
- **Ukuran maksimal:** 5MB
- **Rekomendasi ukuran:** 400x300px atau rasio 4:3

### 4. Preview & Validasi
- Gambar akan langsung ter-preview setelah upload
- Pastikan gambar terlihat jelas dan tidak terpotong
- Klik "Simpan" atau "Buat Event"

## 🖼️ Spesifikasi Gambar

### Flyer/Poster Event
- **Format:** JPG, PNG, WebP
- **Ukuran file:** Maksimal 5MB
- **Dimensi rekomendasi:** 400x300px (rasio 4:3)
- **Kualitas:** Minimal 72 DPI untuk web
- **Konten:** Harus relevan dengan event, tidak mengandung konten yang melanggar

### Template Sertifikat (Opsional)
- **Format:** JPG, PNG, WebP, PDF
- **Ukuran file:** Maksimal 5MB
- **Orientasi:** Landscape (horizontal) direkomendasikan
- **Template:** Harus menyisakan ruang untuk nama peserta

## 🔧 Troubleshooting

### Gambar Tidak Muncul di Halaman Publik
1. **Periksa Storage Link**
   ```bash
   cd C:\xampp\htdocs\Komuji
   php artisan storage:link
   ```

2. **Periksa Permission Folder**
   - Pastikan folder `storage/app/public/events/` dapat diakses
   - Pastikan symlink `public/storage` mengarah ke `storage/app/public`

3. **Periksa Path Gambar**
   - Gambar harus tersimpan di: `storage/app/public/events/flyers/`
   - URL akses: `http://localhost:8000/storage/events/flyers/nama-file.jpg`

### Upload Gagal
1. **File Terlalu Besar**
   - Kompres gambar hingga < 5MB
   - Gunakan tools online seperti TinyPNG

2. **Format Tidak Didukung**
   - Konversi ke JPG, PNG, atau WebP
   - Hindari format GIF, BMP, TIFF

3. **Koneksi Timeout**
   - Periksa koneksi internet
   - Coba upload ulang dengan file yang lebih kecil

## 📱 Tampilan di Halaman Publik

### Events Page (`/events`)
- Gambar ditampilkan sebagai thumbnail 400x300px
- Fallback ke `default-event.svg` jika tidak ada gambar
- Hover effect dengan scale transform
- Lazy loading untuk performa

### Event Detail Page
- Gambar ditampilkan dalam ukuran penuh
- Responsive design untuk mobile dan desktop
- Optimasi loading dengan progressive enhancement

## 🎨 Tips Design Gambar Event

### Flyer/Poster yang Efektif
1. **Judul Event** - Jelas dan mudah dibaca
2. **Tanggal & Waktu** - Prominent dan akurat
3. **Lokasi** - Mudah ditemukan
4. **Visual Appeal** - Menarik tapi tidak berlebihan
5. **Brand Consistency** - Sesuai dengan identitas organisasi

### Contoh Layout
```
┌─────────────────────────┐
│     LOGO ORGANISASI     │
│                         │
│    JUDUL EVENT BESAR    │
│                         │
│  📅 Tanggal & Waktu     │
│  📍 Lokasi Event        │
│  🎫 Info Tiket          │
│                         │
│    VISUAL/GAMBAR        │
│                         │
│   CONTACT/REGISTER      │
└─────────────────────────┘
```

## 🔐 Keamanan & Best Practices

### File Upload Security
- Validasi file type di frontend dan backend
- Scan malware untuk file upload
- Rename file untuk menghindari conflict
- Limit ukuran file untuk mencegah abuse

### Storage Management
- Backup berkala folder storage
- Monitor usage disk space
- Clean up file lama yang tidak terpakai
- Implementasi CDN untuk performa

## 📞 Support

Jika mengalami masalah:
1. Periksa console browser untuk error JavaScript
2. Periksa log Laravel di `storage/logs/laravel.log`
3. Pastikan semua service (Apache, MySQL) berjalan
4. Contact developer untuk assistance

---

**Last Updated:** October 10, 2025
**Version:** 1.0
**Platform:** Komuji Event Management System
