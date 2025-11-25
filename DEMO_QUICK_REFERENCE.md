# 🎯 QUICK REFERENCE - DEMO SANA SINI

## 🔑 LOGIN CREDENTIALS

```
┌─────────────────────────────────────────────┐
│  ADMIN                                      │
│  📧 admin@komuji.com                        │
│  🔒 [Your password]                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PANITIA (Event Organizer)                  │
│  📧 arievan920@gmail.com                    │
│  🔒 [Your password]                         │
│  🎁 Plan: Trial (60 days)                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PESERTA (Participant)                      │
│  📧 pchnc.co@gmail.com                      │
│  🔒 [Your password]                         │
└─────────────────────────────────────────────┘
```

**⚠️ CATATAN PENTING:**
- Seeder menggunakan akun yang **SUDAH ADA**
- Password tetap sesuai yang Anda buat saat registrasi
- Hanya data event/registrasi yang dibuat ulang

---

## 📊 DATA TERSEDIA

**Events**: 5 events
- ⏰ Upcoming: 3 events
- ▶️ Ongoing: 1 event (today)
- ✅ Past: 1 event (dengan certificates)

**Users**: 11 users
- 1 Admin
- 1 Panitia
- 9 Peserta

**Registrations**: 140
**Check-ins**: 76 (~80%)
**Certificates**: 16 issued

---

## 🎬 DEMO FLOW RECOMMENDED

### PART 1: PESERTA FLOW (5 menit)
```
Login pchnc.co@gmail.com
  ↓
Browse Events → Filter by category
  ↓
Register to new event
  ↓
View Event History → Show registered events
  ↓
Download E-Ticket → Show QR code
  ↓
Download Certificate (past event)
```

**Key Points:**
✨ Simple & fast registration
✨ Beautiful e-ticket with QR
✨ Instant certificate download

---

### PART 2: PANITIA FLOW (10 menit)
```
Login arievan920@gmail.com
  ↓
Dashboard → Show statistics
  ↓
View Events → 5 events created
  ↓
Click one event → View participants (15-50 peserta)
  ↓
QR Scanner → Demo check-in with QR code
  ↓
Attendance Report → Show who checked-in
  ↓
Financial Dashboard → Show revenue
  ↓
Analytics → Show graphs & charts
```

**Key Points:**
✨ All-in-one dashboard
✨ Real-time participant tracking
✨ QR scanner 1-2 detik per check-in
✨ Auto-generate certificates
✨ Transparent financial data

---

### PART 3: ADMIN FLOW (5 menit)
```
Login admin@komuji.com
  ↓
Admin Dashboard → Platform overview
  ↓
User Management → Show all 11 users
  ↓
Event Monitoring → All events from all organizers
  ↓
Transaction Oversight → All money flow
  ↓
Platform Settings → Configure system
```

**Key Points:**
✨ Full platform control
✨ User & organizer approval
✨ Transaction monitoring
✨ Comprehensive reports

---

## 🔥 HIGHLIGHT FEATURES TO DEMO

### 1. QR CODE CHECK-IN (MUST SHOW!)
**Prosedur:**
1. Login as Peserta → Get e-ticket QR
2. Screenshot/copy QR code
3. Login as Panitia → Open QR Scanner
4. Scan the QR code
5. Show: ✅ Valid → Check-in success
6. Try scan again: ❌ Already checked-in

**Wow Factor:** 1-2 detik check-in time!

---

### 2. AUTO-GENERATE CERTIFICATE (MUST SHOW!)
**Prosedur:**
1. Login as Peserta (pchnc.co@gmail.com)
2. Go to Event History
3. Find: "Bootcamp UI/UX Design" (past event)
4. Click "Download Certificate"
5. PDF instantly downloads!

**Wow Factor:** No waiting, professional certificate!

---

### 3. REAL-TIME DASHBOARD (MUST SHOW!)
**Prosedur:**
1. Login as Panitia
2. Open Dashboard
3. Show live numbers:
   - Total events: 5
   - Total participants: 140
   - Total revenue: ~Rp XX juta
   - Attendance rate: 80%
4. Show graphs updating

**Wow Factor:** Data-driven decisions!

---

## 📱 URLS PENTING

### Frontend:
- Homepage: `http://localhost:5173`
- Login: `http://localhost:5173/signin`
- Events: `http://localhost:5173/events`
- Organizer Dashboard: `http://localhost:5173/organizer/dashboard`
- Admin Dashboard: `http://localhost:5173/admin/dashboard`

### Backend API:
- Base URL: `http://localhost:8000`
- API Docs: `http://localhost:8000/api/documentation` (jika ada)

---

## 🎯 KEY SELLING POINTS

### 1. **Kesederhanaan**
> "Lihat, hanya 3 klik untuk check-in peserta. Dari 100 orang bisa selesai dalam 5-10 menit!"

### 2. **Keamanan**
> "QR code unik per tiket, tidak bisa dipalsukan. Scan 2x langsung ditolak sistem."

### 3. **Otomasi**
> "Sertifikat otomatis muncul setelah check-in. Tidak perlu tunggu berhari-hari lagi."

### 4. **Data & Analytics**
> "Semua data real-time. Organizer bisa monitor dari mana saja via smartphone."

### 5. **Terjangkau**
> "Trial 60 hari gratis, Free plan selamanya, Premium cuma Rp 100rb/bulan. Jauh lebih murah dari kompetitor!"

---

## 🚨 COMMON ISSUES & FIXES

### Camera tidak muncul di QR Scanner
```
✅ Fix: Allow camera permission
✅ Use Chrome/Edge browser
✅ Pastikan HTTPS atau localhost
```

### Data tidak muncul
```
✅ Clear cache: Ctrl + Shift + R
✅ Check console for errors (F12)
✅ Re-run seeder jika perlu
```

### Login error
```
✅ Check email & password spelling
✅ Clear browser cache
✅ Check backend running: http://localhost:8000
```

---

## 📞 EMERGENCY COMMANDS

### Clear & Reseed Data:
```bash
cd c:\xampp\htdocs\Komuji
php artisan db:seed --class=DemoDataSeeder
```

### Clear Cache:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Restart Services:
```bash
# Stop: Ctrl + C di terminal backend & frontend
# Start Backend: php artisan serve
# Start Frontend: cd fekomuji && npm run dev
```

---

## 🎉 DEMO SCRIPT TEMPLATE

### Opening (30 detik):
> "Selamat datang di Sana Sini, platform event management yang mengintegrasikan seluruh proses event - dari pendaftaran hingga sertifikat - dalam satu sistem. Dengan 47 fitur profesional namun sangat mudah digunakan."

### Body (2 menit):
> "Mari saya tunjukkan 3 fitur kunci yang membedakan kami:
> 
> **Pertama**, QR check-in. [Demo scan QR]. Lihat, 1-2 detik selesai. Tidak ada lagi antrean panjang.
> 
> **Kedua**, sertifikat otomatis. [Demo download certificate]. Begitu check-in, sertifikat langsung bisa diunduh. Hemat waktu dan biaya cetak.
> 
> **Ketiga**, dashboard lengkap. [Show organizer dashboard]. Semua data real-time, dari pendaftar, revenue, hingga analytics. Keputusan berbasis data, bukan tebakan."

### Closing (30 detik):
> "Dengan model pricing yang inklusif - trial 60 hari gratis dan free plan selamanya - siapa pun bisa menyelenggarakan event profesional tanpa budget besar. Itulah Sana Sini."

---

## ✅ PRE-DEMO CHECKLIST

**30 menit sebelum demo:**
- [ ] XAMPP Apache & MySQL running
- [ ] Backend running: `php artisan serve`
- [ ] Frontend running: `npm run dev`
- [ ] Data sudah di-seed: Run DemoDataSeeder
- [ ] Test login semua 3 accounts
- [ ] Prepare QR code screenshot untuk demo check-in
- [ ] Open all important tabs di browser
- [ ] Clear browser cache
- [ ] Test camera permission untuk QR scanner
- [ ] Prepare backup plan (jika ada technical issue)

**5 menit sebelum demo:**
- [ ] Close unnecessary apps (untuk performa)
- [ ] Set browser zoom 100%
- [ ] Fullscreen browser (F11)
- [ ] Mute notification sounds
- [ ] Check internet connection stable
- [ ] Have this quick reference open di layar kedua

---

## 🎯 DEMO TIME BREAKDOWN

**Total: 20 menit**

- Opening: 1 min
- Peserta Flow: 5 min
- Panitia Flow: 10 min
- Admin Flow: 3 min
- Q&A: 1 min

**Jika waktu terbatas (10 menit):**
- Skip admin flow
- Fokus ke QR check-in & certificate
- Show dashboard briefly

---

**GOOD LUCK WITH YOUR DEMO! 🚀**

Remember: 
- Be confident
- Show, don't just tell
- Highlight the pain points this solves
- Emphasize simplicity & speed
