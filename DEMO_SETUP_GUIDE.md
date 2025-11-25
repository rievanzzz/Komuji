# 🚀 PANDUAN SETUP DATA DEMO - APLIKASI SANA SINI

## 📋 PERSIAPAN

### 1. Pastikan Aplikasi Running
```bash
# Pastikan XAMPP Apache & MySQL sudah nyala
# Buka browser, cek http://localhost:8000 (backend)
# Cek http://localhost:5173 (frontend)
```

### 2. Pastikan Database Ada
```bash
# Buka phpMyAdmin: http://localhost/phpmyadmin
# Pastikan database 'komuji' sudah ada
# Jika belum ada, buat dulu
```

### 3. ⚠️ PENTING: Pastikan Akun Sudah Dibuat

**Seeder ini TIDAK akan membuat user baru!** Pastikan 3 akun berikut **SUDAH ADA** di database:

- ✅ **Admin**: `admin@komuji.com`
- ✅ **Panitia**: `arievan920@gmail.com`
- ✅ **Peserta**: `pchnc.co@gmail.com`

**Jika belum ada, buat akun-akun tersebut terlebih dahulu melalui:**
- Registrasi di frontend aplikasi, ATAU
- Langsung insert ke database, ATAU
- Jalankan seeder user yang lain terlebih dahulu

---

## 🗄️ STEP 1: RESET & SEED DATA DEMO

### Jalankan Command Ini (Dari Folder Komuji)

```bash
cd c:\xampp\htdocs\Komuji

# Clear cache terlebih dahulu
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Jalankan seeder demo
php artisan db:seed --class=DemoDataSeeder
```

**Output yang Diharapkan:**
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
   ✓ Panitia Profile already exists (atau created jika belum ada)

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

**Catatan:**
- ✅ Seeder ini **TIDAK mengubah password** user yang sudah ada
- ✅ Seeder hanya membuat data **events, registrations, check-ins, dan certificates**
- ✅ User account tetap menggunakan password yang sudah Anda set sebelumnya

---

## 👤 STEP 2: LOGIN & TESTING PER ROLE

### 🔐 A. TESTING SEBAGAI PESERTA (pchnc.co@gmail.com)

#### Login:
1. Buka: `http://localhost:5173/signin`
2. Email: `pchnc.co@gmail.com`
3. Password: **Gunakan password yang sudah Anda buat saat registrasi**
4. Klik **Sign In**

#### Fitur yang Bisa Ditest:

##### ✅ 1. Browse & Search Events
- **URL**: `http://localhost:5173/events`
- **Test**:
  - Lihat semua event yang available
  - Filter by kategori (Workshop, Seminar, Bootcamp, dll)
  - Search event by nama
  - Klik event untuk lihat detail

**Expected Result**: 
- Muncul 4 event (yang upcoming & today)
- Past event tidak muncul di public listing

##### ✅ 2. Lihat Event History
- **URL**: `http://localhost:5173/history`
- **Test**:
  - Lihat event yang sudah didaftar
  - Check status: Approved, Checked-in, Has Certificate

**Expected Result**: 
- Muncul list event yang sudah didaftar user ini
- Status badge muncul (Approved, Attended, dll)

##### ✅ 3. Download E-Ticket
- **Lokasi**: Di halaman Event History
- **Test**:
  - Klik tombol "View Ticket" atau "Download E-Ticket"
  - QR code harus muncul dengan jelas

**Expected Result**: 
- E-ticket muncul dengan QR code unik
- Ticket number terlihat
- Info event lengkap

##### ✅ 4. Download Certificate
- **Lokasi**: Di halaman Event History
- **Test**:
  - Pada event yang sudah attended (ada icon certificate)
  - Klik "Download Certificate"

**Expected Result**: 
- PDF certificate otomatis download
- Nama peserta dan event details tercantum

##### ✅ 5. View Profile
- **URL**: `http://localhost:5173/profile`
- **Test**:
  - Lihat profile data
  - Edit profile (ubah nama, alamat, dll)
  - Simpan perubahan

**Expected Result**: 
- Data profile tampil
- Bisa edit dan save
- Success notification muncul

---

### 🎯 B. TESTING SEBAGAI PANITIA (arievan920@gmail.com)

#### Login:
1. Logout dari akun peserta
2. Login dengan email: `arievan920@gmail.com`
3. Password: **Gunakan password yang sudah Anda buat saat registrasi**

#### Fitur yang Bisa Ditest:

##### ✅ 1. Organizer Dashboard
- **URL**: `http://localhost:5173/organizer/dashboard`
- **Test**:
  - Lihat statistik event (total events, total revenue, total participants)
  - Grafik performance
  - Quick stats cards

**Expected Result**: 
- Dashboard muncul dengan data:
  - 5 events created
  - Total registrations
  - Revenue summary
  - Recent activities

##### ✅ 2. View All Events
- **URL**: `http://localhost:5173/organizer/events`
- **Test**:
  - Lihat semua event yang dibuat
  - Filter by status (Published/Draft)
  - Search event

**Expected Result**: 
- Muncul 5 events:
  1. Workshop Web Development 2025 (Upcoming)
  2. Seminar Digital Marketing Strategy (Today/Ongoing)
  3. Bootcamp UI/UX Design (Past)
  4. Webinar Karir IT (Upcoming)
  5. Tech Conference 2025 (Upcoming)

##### ✅ 3. Create New Event
- **Lokasi**: Button "Create Event" di halaman Events
- **Test**:
  - Klik Create Event
  - Isi form:
    - Judul: "Demo Event Baru"
    - Kategori: Pilih salah satu
    - Tanggal mulai & selesai
    - Waktu mulai & selesai
    - Lokasi
    - Kuota: 50
    - Harga: 100000 (atau 0 untuk gratis)
    - Approval Type: Auto/Manual
    - Has Certificate: Yes
  - Upload flyer (opsional)
  - Klik Save

**Expected Result**: 
- Event berhasil dibuat
- Redirect ke list events
- Event baru muncul di list

##### ✅ 4. Edit Event
- **Lokasi**: Di list events, klik icon Edit
- **Test**:
  - Ubah judul atau detail lain
  - Save changes

**Expected Result**: 
- Event berhasil di-update
- Perubahan tersimpan

##### ✅ 5. View Participants
- **URL**: Klik salah satu event → View Participants
- **Test**:
  - Lihat list peserta yang terdaftar
  - Check status: Approved/Pending
  - Lihat detail peserta

**Expected Result**: 
- List peserta muncul
- Data: Nama, Email, Status, Registration Date
- Contoh: Workshop Web Development ada 15 peserta

##### ✅ 6. Approve/Reject Participants (Manual Approval Event)
- **Event**: Seminar Digital Marketing Strategy (manual approval)
- **Test**:
  - Pilih event dengan manual approval
  - Klik salah satu peserta pending
  - Approve atau Reject

**Expected Result**: 
- Status berubah menjadi Approved/Rejected
- (Jika approved) E-ticket otomatis terkirim

##### ✅ 7. QR Scanner - Check-in Peserta
- **URL**: `http://localhost:5173/organizer/scanner` atau button Scan di event detail
- **Test**:
  - Buka QR Scanner
  - Allow camera access
  - Scan QR code dari e-ticket peserta
  - ATAU: Manual input ticket number jika QR tidak bisa

**Expected Result**: 
- Camera aktif
- Scan QR → Valid/Invalid muncul
- Jika valid:
  - Success sound/notification
  - Peserta ter-check-in
  - Tidak bisa scan lagi (sudah check-in)

**Testing Check-in Manual:**
1. Buka Event History sebagai peserta (pchnc.co@gmail.com)
2. Screenshot atau copy QR code dari salah satu tiket
3. Login sebagai panitia (arievan920@gmail.com)
4. Buka scanner
5. Scan QR code tersebut

##### ✅ 8. View Attendance Report
- **Lokasi**: Event detail → Attendance tab
- **Test**:
  - Lihat list yang sudah check-in
  - Export attendance data
  - Check attendance rate (%)

**Expected Result**: 
- List peserta yang hadir muncul
- Timestamp check-in terlihat
- Attendance rate: ~80% (karena data dummy)

##### ✅ 9. Certificate Management
- **URL**: Event detail → Certificates tab
- **Test**:
  - Lihat peserta yang eligible untuk certificate (sudah check-in)
  - Issue certificate (jika belum auto-issued)
  - Download bulk certificates

**Expected Result**: 
- List peserta yang sudah dapat certificate
- Bisa download certificate per peserta
- Certificate number tampil

##### ✅ 10. Financial Dashboard
- **URL**: `http://localhost:5173/organizer/financial`
- **Test**:
  - Lihat total revenue
  - Revenue per event
  - Transaction history
  - Withdrawal balance

**Expected Result**: 
- Total revenue dari paid events tampil
- Breakdown by event
- Transaction list dengan status
- Balance available for withdrawal

##### ✅ 11. Withdrawal Request
- **Lokasi**: Financial dashboard → Withdraw button
- **Test**:
  - Masukkan jumlah withdrawal
  - Pilih bank account
  - Submit request

**Expected Result**: 
- Withdrawal request submitted
- Status: Pending (menunggu approval admin)

##### ✅ 12. Bank Account Management
- **URL**: `http://localhost:5173/organizer/bank-accounts`
- **Test**:
  - Add new bank account
  - Edit existing
  - Set primary account

**Expected Result**: 
- Bank account tersimpan
- Bisa set primary untuk withdrawal

##### ✅ 13. Analytics & Reports
- **URL**: `http://localhost:5173/organizer/reports`
- **Test**:
  - Lihat grafik registrasi per event
  - Attendance rate
  - Revenue chart
  - Export reports (Excel/PDF)

**Expected Result**: 
- Chart/grafik muncul dengan data
- Export berhasil download file

##### ✅ 14. Event Settings & Certificate Template
- **URL**: Event detail → Settings/Certificate tab
- **Test**:
  - Upload custom certificate template
  - Preview certificate design
  - Set certificate auto-issue rules

**Expected Result**: 
- Template berhasil upload
- Preview muncul
- Settings tersimpan

##### ✅ 15. Upgrade to Premium
- **URL**: `http://localhost:5173/organizer/upgrade`
- **Test**:
  - Lihat plan comparison (Trial/Free/Premium)
  - Check current plan status
  - Upgrade to Premium (test flow, no actual payment)

**Expected Result**: 
- Plan comparison tampil
- Current plan: Trial (60 days remaining)
- Upgrade flow berjalan

---

### 🛡️ C. TESTING SEBAGAI ADMIN (admin@komuji.com)

#### Login:
1. Logout dari akun panitia
2. Login dengan email: `admin@komuji.com`
3. Password: **Gunakan password yang sudah Anda buat saat registrasi**

#### Fitur yang Bisa Ditest:

##### ✅ 1. Admin Dashboard
- **URL**: `http://localhost:5173/admin/dashboard`
- **Test**:
  - Lihat platform statistics
  - Total users, events, transactions
  - Recent activities
  - Revenue overview

**Expected Result**: 
- Dashboard tampil dengan:
  - Total users: 11 (1 admin + 1 panitia + 9 peserta)
  - Total events: 5
  - Total registrations: 140
  - Platform revenue

##### ✅ 2. User Management
- **URL**: `http://localhost:5173/admin/users`
- **Test**:
  - View all users
  - Filter by role (Admin/Panitia/Peserta)
  - Search user by name/email
  - View user details

**Expected Result**: 
- List semua user (11 users)
- Bisa filter dan search
- User details muncul saat diklik

##### ✅ 3. Activate/Deactivate User
- **Lokasi**: User management → Actions
- **Test**:
  - Pilih salah satu user
  - Toggle status (Active/Inactive)

**Expected Result**: 
- Status berubah
- Jika inactive: user tidak bisa login

##### ✅ 4. Approve/Reject Organizer
- **Lokasi**: User management → Filter "Panitia" → Pending status
- **Test**:
  - Jika ada organizer pending (buat baru dulu dari frontend)
  - Approve atau Reject

**Expected Result**: 
- Status berubah ke Approved/Rejected
- Organizer approved bisa mulai buat event

##### ✅ 5. Event Monitoring
- **URL**: `http://localhost:5173/admin/events`
- **Test**:
  - View all events dari semua organizer
  - Filter by status/category
  - Unpublish event yang melanggar aturan

**Expected Result**: 
- Semua event (5 events) tampil
- Bisa unpublish event
- Event detail visible

##### ✅ 6. Transaction Oversight
- **URL**: `http://localhost:5173/admin/transactions`
- **Test**:
  - View all transactions
  - Filter by status (Completed/Pending/Failed)
  - View transaction details
  - Handle disputes (if any)

**Expected Result**: 
- List semua transaksi tampil
- Total amount, commission clear
- Transaction details lengkap

##### ✅ 7. Withdrawal Approval
- **URL**: `http://localhost:5173/admin/withdrawals`
- **Test**:
  - View withdrawal requests dari organizer
  - Approve atau Reject withdrawal
  - Add note

**Expected Result**: 
- Withdrawal requests tampil
- Bisa approve/reject
- Status updated

##### ✅ 8. Category Management
- **URL**: `http://localhost:5173/admin/categories`
- **Test**:
  - View all categories
  - Add new category
  - Edit existing category
  - Delete category (jika tidak digunakan)

**Expected Result**: 
- 9 categories tampil (Seminar, Workshop, dll)
- CRUD operations berjalan

##### ✅ 9. Platform Settings
- **URL**: `http://localhost:5173/admin/settings`
- **Test**:
  - Edit settings:
    - Auto approve panitia (ON/OFF)
    - Trial duration (60 days)
    - Premium price (Rp 100.000)
    - Commission rate (5%)
    - Free plan max events (1)
  - Save changes

**Expected Result**: 
- Settings tampil current values
- Edit dan save berhasil
- Changes applied

##### ✅ 10. Reports & Analytics
- **URL**: `http://localhost:5173/admin/reports`
- **Test**:
  - Platform-wide analytics
  - User growth chart
  - Event statistics
  - Revenue trends
  - Export comprehensive report

**Expected Result**: 
- Charts dan graphs tampil
- Data accurate
- Export berhasil

##### ✅ 11. Contact Messages
- **URL**: `http://localhost:5173/admin/messages`
- **Test**:
  - View messages dari contact form
  - Reply to message
  - Mark as resolved

**Expected Result**: 
- Messages tampil (jika ada)
- Bisa reply dan update status

---

## 📊 STEP 3: DATA YANG TERSEDIA SETELAH SEEDING

### Users (11 total):
1. **Admin**: admin@komuji.com
2. **Panitia**: arievan920@gmail.com (Trial plan, approved)
3. **Peserta Utama**: pchnc.co@gmail.com
4. **Extra Peserta**: peserta1@demo.com s/d peserta8@demo.com

### Events (5 total):
1. **Workshop Web Development 2025** (Upcoming, 7 hari lagi)
   - 15 peserta terdaftar
   - Approval: Auto
   - Harga: Rp 150.000

2. **Seminar Digital Marketing Strategy** (Today/Ongoing)
   - 25 peserta terdaftar
   - Approval: Manual
   - Harga: Rp 250.000
   - 20 sudah check-in

3. **Bootcamp UI/UX Design** (Past, 10 hari lalu)
   - 20 peserta terdaftar
   - Approval: Auto
   - Harga: Rp 500.000
   - 16 sudah check-in
   - 16 certificates issued

4. **Webinar Karir IT** (Upcoming, 14 hari lagi)
   - 50 peserta terdaftar
   - Approval: Auto
   - Harga: GRATIS

5. **Tech Conference 2025** (Upcoming, 30 hari lagi)
   - 30 peserta terdaftar
   - Approval: Auto
   - Harga: Rp 300.000 (ada multiple tiers)
   - Ticket tiers: Early Bird, Regular, VIP

### Registrations: 140 total
### Check-ins: 76 total (~80% attendance rate)
### Certificates: 16 issued (untuk yang sudah hadir di past event)
### Transactions: ~110 (untuk paid events)

---

## 🔄 STEP 4: RESET DATA JIKA PERLU

Jika ingin reset dan seed ulang:

```bash
# Reset database completely (HATI-HATI: INI HAPUS SEMUA DATA!)
php artisan migrate:fresh

# Jalankan seeder category dulu
php artisan db:seed --class=CategorySeeder

# Lalu seeder demo
php artisan db:seed --class=DemoDataSeeder
```

**ATAU reset tanpa hapus migrations:**

```bash
# Cukup jalankan seeder lagi (seeder akan clear data sendiri)
php artisan db:seed --class=DemoDataSeeder
```

---

## 🎯 CHECKLIST TESTING LENGKAP

### Peserta Features (13):
- [ ] Browse events
- [ ] Filter & search events
- [ ] View event detail
- [ ] Register for event
- [ ] View event history
- [ ] View e-ticket dengan QR code
- [ ] Download certificate
- [ ] View profile
- [ ] Edit profile
- [ ] View transaction history
- [ ] Receive notifications
- [ ] Cancel registration (jika enabled)
- [ ] Rate event (jika enabled)

### Panitia Features (18):
- [ ] View organizer dashboard
- [ ] Create event
- [ ] Edit event
- [ ] Delete event
- [ ] Publish/unpublish event
- [ ] View participants
- [ ] Approve/reject participants (manual approval)
- [ ] QR Scanner check-in
- [ ] View attendance report
- [ ] Issue certificates
- [ ] View financial dashboard
- [ ] Create withdrawal request
- [ ] Manage bank accounts
- [ ] View analytics & reports
- [ ] Export data (Excel/PDF)
- [ ] Upload certificate template
- [ ] Create multiple ticket tiers
- [ ] Upgrade to premium

### Admin Features (11):
- [ ] View admin dashboard
- [ ] User management (view, activate, deactivate)
- [ ] Approve/reject organizers
- [ ] Event monitoring
- [ ] Transaction oversight
- [ ] Withdrawal approval
- [ ] Category management (CRUD)
- [ ] Platform settings
- [ ] Platform-wide reports
- [ ] Contact message management
- [ ] Export comprehensive reports

---

## 🐛 TROUBLESHOOTING

### Error: "Class DemoDataSeeder not found"
```bash
composer dump-autoload
php artisan config:clear
```

### Error: "SQLSTATE foreign key constraint"
```bash
# Reset migrations fresh
php artisan migrate:fresh
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=DemoDataSeeder
```

### QR Scanner tidak muncul camera
- Allow camera permission di browser
- Pastikan HTTPS atau localhost
- Coba browser lain (Chrome/Edge recommended)

### Certificate tidak generate
- Check folder permissions: `storage/app/certificates/`
- Pastikan DomPDF installed: `composer require barryvdh/laravel-dompdf`

### E-ticket tidak terkirim email
- Check `.env` email settings
- Untuk demo, bisa langsung akses dari dashboard (tidak perlu email)

---

## 📧 DEMO ACCOUNTS SUMMARY

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@komuji.com | *Your password* | Platform administrator |
| **Panitia** | arievan920@gmail.com | *Your password* | Event organizer (Trial plan) |
| **Peserta** | pchnc.co@gmail.com | *Your password* | Event participant |
| Extra | peserta1@demo.com | password123 | Extra participant (auto-created) |
| Extra | peserta2@demo.com | password123 | Extra participant (auto-created) |
| ... | ... | ... | ... (up to peserta8) |

---

## ✅ SELAMAT DEMO!

Semua data dummy sudah siap. Sekarang Anda bisa demo **47 fitur lengkap** aplikasi Sana Sini dengan data yang realistic.

**Tips Demo:**
1. Mulai dari flow peserta → mudah dipahami
2. Lanjut ke panitia → tunjukkan dashboard & management
3. Terakhir admin → show platform control
4. Highlight: QR check-in, auto-certificate, real-time analytics

**Good luck! 🚀**
