# 📋 INSTRUKSI INSTALASI BACKEND - USER MANAGEMENT

## 🎯 Tujuan
Membuat endpoint API untuk Management User di Admin Panel agar data users muncul dari database.

---

## 📁 File yang Sudah Dibuat

1. **backend_routes_api.php** - Routes untuk API
2. **UserManagementController.php** - Controller untuk handle requests

---

## 🔧 LANGKAH INSTALASI

### **STEP 1: Copy Controller**

1. Buka file: `UserManagementController.php` (yang sudah dibuat)
2. Copy seluruh isinya
3. Paste ke: `app/Http/Controllers/API/UserManagementController.php`

**Lokasi lengkap:**
```
c:\xampp\htdocs\Komuji\app\Http\Controllers\API\UserManagementController.php
```

**Jika folder `API` belum ada, buat dulu:**
```
c:\xampp\htdocs\Komuji\app\Http\Controllers\API\
```

---

### **STEP 2: Tambahkan Routes**

1. Buka file: `routes/api.php`
2. Tambahkan routes berikut di bagian bawah (sebelum closing tag):

```php
// Routes untuk Admin - User Management
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Get all users (untuk admin)
    Route::get('/admin/all-users', [App\Http\Controllers\API\UserManagementController::class, 'getAllUsers']);
    
    // Toggle user active status
    Route::patch('/users/{id}/toggle-status', [App\Http\Controllers\API\UserManagementController::class, 'toggleStatus']);
    
    // Delete user
    Route::delete('/users/{id}', [App\Http\Controllers\API\UserManagementController::class, 'deleteUser']);
    
    // Get user events/registrations
    Route::get('/users/{id}/events', [App\Http\Controllers\API\UserManagementController::class, 'getUserEvents']);
    
    // Approve organizer
    Route::post('/organizers/{id}/approve', [App\Http\Controllers\API\UserManagementController::class, 'approveOrganizer']);
    
    // Reject organizer
    Route::post('/organizers/{id}/reject', [App\Http\Controllers\API\UserManagementController::class, 'rejectOrganizer']);
});
```

---

### **STEP 3: Pastikan Model User Punya Relasi**

Buka file: `app/Models/User.php`

Pastikan ada relasi `registrations`:

```php
public function registrations()
{
    return $this->hasMany(Registration::class);
    // Atau sesuaikan dengan nama model Anda
    // return $this->hasMany(EventRegistration::class);
}
```

---

### **STEP 4: Cek Database**

Pastikan tabel `users` punya kolom:
- `id`
- `name`
- `email`
- `role` (user/panitia/organizer/admin)
- `is_active` (boolean/tinyint)
- `email_verified_at` (timestamp, nullable)
- `created_at`

**Jika kolom `role` atau `is_active` belum ada, buat migration:**

```bash
php artisan make:migration add_role_and_is_active_to_users_table
```

Isi migration:
```php
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('role')->default('user')->after('email');
        $table->boolean('is_active')->default(true)->after('role');
    });
}
```

Jalankan:
```bash
php artisan migrate
```

---

### **STEP 5: Test Endpoint**

**Menggunakan Thunder Client / Postman:**

1. **GET All Users:**
   ```
   GET http://localhost:8000/api/admin/all-users
   Headers:
   - Authorization: Bearer {your_token}
   - Content-Type: application/json
   ```

2. **Response yang Diharapkan:**
   ```json
   {
     "status": "success",
     "data": [
       {
         "id": 1,
         "name": "John Doe",
         "email": "john@example.com",
         "role": "user",
         "is_active": true,
         "email_verified_at": "2025-01-01T10:00:00",
         "created_at": "2025-01-01T10:00:00",
         "events_count": 5,
         "status": "approved"
       }
     ]
   }
   ```

---

### **STEP 6: Refresh Frontend**

1. Buka browser
2. Buka halaman Admin > Management User
3. Buka Console (F12)
4. Refresh halaman
5. Lihat console log:
   ```
   Fetching from: http://localhost:8000/api/admin/all-users
   Response: { status: 'success', data: [...] }
   Users count: 25
   ```

---

## ✅ CHECKLIST

```
□ Controller sudah dicopy ke app/Http/Controllers/API/
□ Routes sudah ditambahkan ke routes/api.php
□ Model User punya relasi registrations()
□ Database punya kolom role dan is_active
□ Test endpoint di Thunder Client/Postman berhasil
□ Frontend sudah refresh dan data muncul
```

---

## 🐛 TROUBLESHOOTING

### **Error: Class not found**
```
Solution: Pastikan namespace di controller benar:
namespace App\Http\Controllers\API;
```

### **Error: 404 Not Found**
```
Solution: 
1. Clear route cache: php artisan route:clear
2. Cache routes: php artisan route:cache
3. Cek routes: php artisan route:list | grep admin
```

### **Error: Unauthenticated**
```
Solution: Pastikan token valid di localStorage
```

### **Data masih kosong**
```
Solution:
1. Cek database punya data users
2. Cek relasi registrations() di Model User
3. Cek response di Thunder Client
```

---

## 📞 SUPPORT

Jika masih ada error, screenshot:
1. Console log browser
2. Response dari Thunder Client
3. Error message Laravel

---

**Selamat mencoba! 🚀**
