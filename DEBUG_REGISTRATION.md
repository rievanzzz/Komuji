# 🔍 DEBUG REGISTRATION ISSUE

## ❌ Masalah yang Ditemukan:

### **1. Route Middleware Issue (FIXED)**
- ✅ Route registration dipindah keluar dari `role:peserta` middleware
- ✅ Sekarang semua authenticated user bisa mendaftar

### **2. Missing Email Endpoints (FIXED)**
- ✅ Ditambahkan endpoint email service:
  - `POST /api/send-eticket`
  - `POST /api/send-confirmation`
  - `POST /api/send-reminder`
  - `POST /api/send-invoice`

### **3. Enhanced Error Logging (ADDED)**
- ✅ Ditambahkan detailed logging di RegistrationController
- ✅ Validation error logging
- ✅ Request data logging

## 🔧 Perbaikan yang Sudah Dilakukan:

### **Backend Changes:**

1. **routes/api.php:**
   ```php
   // BEFORE: Inside role:peserta middleware
   Route::middleware('role:peserta')->group(function () {
       Route::post('/events/{event}/register', [RegistrationController::class, 'register']);
   });

   // AFTER: Available for all authenticated users
   Route::post('/events/{event}/register', [RegistrationController::class, 'register']);
   ```

2. **RegistrationController.php:**
   ```php
   // Added detailed logging
   Log::info('Registration attempt', [
       'user_id' => auth()->id(),
       'event_id' => $event->id,
       'request_data' => $request->all(),
       'event_published' => $event->is_published
   ]);

   // Added email service methods
   public function sendETicket(Request $request) { ... }
   public function sendConfirmation(Request $request) { ... }
   public function sendReminder(Request $request) { ... }
   public function sendInvoice(Request $request) { ... }
   ```

## 🧪 Testing Steps:

### **1. Check Laravel Logs:**
```bash
tail -f storage/logs/laravel.log
```

### **2. Test Registration API Directly:**
```bash
curl -X POST http://localhost:8000/api/events/1/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_category_id": 1,
    "nama_peserta": "Test User",
    "jenis_kelamin": "L",
    "tanggal_lahir": "1990-01-01",
    "email_peserta": "test@example.com",
    "payment_method": "free"
  }'
```

### **3. Check Frontend Console:**
- Open browser dev tools
- Check Network tab for API calls
- Check Console for JavaScript errors

## 🎯 Kemungkinan Masalah Lain:

### **A. Authentication Issue:**
- User belum login dengan benar
- Token expired atau invalid
- CORS issue

### **B. Database Issue:**
- Event tidak published (`is_published = false`)
- Ticket category tidak ada atau inactive
- Quota sudah penuh

### **C. Frontend Issue:**
- Data tidak dikirim dengan format yang benar
- Missing required fields
- Date format issue

## 📋 Next Steps:

1. **Test dengan user yang sudah login**
2. **Check Laravel logs saat registration attempt**
3. **Verify event dan ticket category data**
4. **Check browser network tab untuk response detail**

## 🚀 Expected Result:

Setelah perbaikan ini, registration seharusnya berjalan dengan:
- ✅ User bisa mendaftar tanpa role restriction
- ✅ Email service endpoints tersedia
- ✅ Detailed error logging untuk debugging
- ✅ Better error messages untuk user
