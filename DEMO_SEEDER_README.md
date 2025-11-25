# ✅ DEMO DATA SEEDER - UPDATE

## 🔄 PERUBAHAN PENTING

### ⚠️ Yang Berubah:

**SEBELUM:**
- Seeder membuat user baru (admin, panitia, peserta)
- Password semua akun: `password123`
- Semua data dihapus termasuk user

**SEKARANG:**
- ✅ Seeder **MENGGUNAKAN akun yang SUDAH ADA**
- ✅ Password **TIDAK DIUBAH** (tetap password Anda)
- ✅ Hanya data event/registrasi yang dihapus dan dibuat ulang
- ✅ User account tetap aman dan tidak berubah

---

## 📋 REQUIREMENT

### Akun yang HARUS SUDAH ADA:

Sebelum menjalankan seeder, pastikan 3 akun ini **SUDAH TERDAFTAR**:

1. **Admin**: `admin@komuji.com`
2. **Panitia**: `arievan920@gmail.com`
3. **Peserta**: `pchnc.co@gmail.com`

**Jika belum ada:** 
- Buat dulu melalui registrasi di frontend, ATAU
- Insert manual ke database, ATAU
- Jalankan seeder user lain terlebih dahulu

---

## 🚀 CARA PAKAI

### 1. Pastikan Akun Sudah Ada
```sql
-- Cek di database apakah akun sudah ada
SELECT email, role FROM users 
WHERE email IN ('admin@komuji.com', 'arievan920@gmail.com', 'pchnc.co@gmail.com');
```

### 2. Jalankan Seeder
```bash
cd c:\xampp\htdocs\Komuji
php artisan db:seed --class=DemoDataSeeder
```

### 3. Output yang Diharapkan
```
🚀 Starting Demo Data Seeding...

🗑️  Clearing existing event data (keeping users)...
   ✓ Event data cleared (users preserved)

⚙️  Creating platform settings...
   ✓ Settings created

👤 Fetching existing Admin account...
   ✓ Admin found: admin@komuji.com

👤 Fetching existing Panitia (Organizer) account...
   ✓ Panitia found: arievan920@gmail.com

👤 Fetching existing Peserta (Participant) account...
   ✓ Peserta found: pchnc.co@gmail.com

👤 Fetching or creating extra participants...
   ✓ 8 extra participants ready

🔍 Checking Panitia Profile...
   ✓ Panitia Profile already exists

📅 Creating demo events...
   ✓ 5 events created

📝 Creating registrations...
   ✓ 140 registrations created

✅ Creating attendance records (check-ins)...
   ✓ 76 check-ins created

🎓 Creating certificates...
   ✓ 16 certificates created

✅ Demo Data Seeding Completed Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 USING EXISTING ACCOUNTS:
   Admin    : admin@komuji.com
   Panitia  : arievan920@gmail.com
   Peserta  : pchnc.co@gmail.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 APA YANG DIBUAT SEEDER?

### ✅ Yang DIBUAT/DIHAPUS:
- Events (5 events demo)
- Registrations (140 registrations)
- Attendances (76 check-ins)
- Certificates (16 certificates)
- Transactions (untuk paid events)
- Ticket Categories
- Extra Peserta (peserta1@demo.com s/d peserta8@demo.com - auto-created jika belum ada)

### ✅ Yang TIDAK DIUBAH:
- ❌ User accounts (admin, panitia, peserta utama)
- ❌ Passwords
- ❌ User profiles
- ❌ Categories (tetap ada)
- ❌ Settings platform (hanya di-update, tidak dihapus)

---

## ⚠️ TROUBLESHOOTING

### Error: "Admin account not found"
```
Solusi: Buat akun admin@komuji.com terlebih dahulu
```

### Error: "Panitia account not found"
```
Solusi: Buat akun arievan920@gmail.com dengan role 'panitia'
```

### Error: "Peserta account not found"
```
Solusi: Buat akun pchnc.co@gmail.com dengan role 'peserta'
```

### Ingin reset password ke password123?
```sql
-- Manual update password (jika perlu)
UPDATE users 
SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email IN ('admin@komuji.com', 'arievan920@gmail.com', 'pchnc.co@gmail.com');
-- Hash di atas adalah bcrypt untuk 'password'
```

---

## 📚 DOKUMENTASI LENGKAP

- **Setup Guide**: `DEMO_SETUP_GUIDE.md` - Panduan lengkap testing semua fitur
- **Quick Reference**: `DEMO_QUICK_REFERENCE.md` - Cheat sheet untuk demo cepat
- **This File**: `DEMO_SEEDER_README.md` - Penjelasan perubahan seeder

---

## 💡 TIPS

1. **Backup Database:** Sebelum run seeder, backup dulu database jika perlu
   ```bash
   mysqldump -u root komuji > backup_before_seed.sql
   ```

2. **Reset Berkali-kali:** Anda bisa run seeder berulang kali
   ```bash
   php artisan db:seed --class=DemoDataSeeder
   ```
   Setiap kali run, data event akan di-reset tapi user tetap aman.

3. **Custom Email:** Jika ingin pakai email lain, edit file:
   ```
   database/seeders/DemoDataSeeder.php
   
   Ubah bagian:
   - getExistingAdmin() → ganti 'admin@komuji.com'
   - getExistingPanitia() → ganti 'arievan920@gmail.com'
   - getExistingPeserta() → ganti 'pchnc.co@gmail.com'
   ```

---

## ✅ SUMMARY

| Aspek | Status |
|-------|--------|
| User Accounts | ✅ Menggunakan yang sudah ada |
| Passwords | ✅ Tidak diubah |
| Events | ✅ Dibuat ulang (5 events) |
| Registrations | ✅ Dibuat ulang (140) |
| Check-ins | ✅ Dibuat ulang (76) |
| Certificates | ✅ Dibuat ulang (16) |
| Categories | ✅ Tetap ada |
| Extra Peserta | ✅ Auto-created jika belum ada |

---

**Happy Demo! 🚀**
