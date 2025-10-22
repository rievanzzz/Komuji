# 🚀 START BACKEND SERVER

## ❌ Masalah: Backend Laravel tidak berjalan

### **Error yang muncul:**
```
GET http://localhost:8000/api/events/7/ticket-categories 
net::ERR_NETWORK_CHANGED
```

## ✅ Solusi: Start Laravel Development Server

### **Step 1: Buka Terminal/Command Prompt**
```bash
cd c:\xampp\htdocs\Komuji
```

### **Step 2: Start Laravel Server**
```bash
php artisan serve
```

**Expected Output:**
```
Laravel development server started: http://127.0.0.1:8000
```

### **Step 3: Test API Endpoint**
Buka browser dan test:
```
http://localhost:8000/api/events
```

Seharusnya menampilkan JSON response dengan data events.

## 🔧 Alternative: Gunakan XAMPP

Jika `php artisan serve` tidak work:

### **Step 1: Start XAMPP**
- Buka XAMPP Control Panel
- Start **Apache** dan **MySQL**

### **Step 2: Update Frontend API URL**
Ganti di file frontend dari:
```javascript
http://localhost:8000/api/events
```

Menjadi:
```javascript
http://localhost/Komuji/api/events
```

## 📋 Quick Check:

### **Test Backend Status:**
1. **Laravel Server**: `http://localhost:8000`
2. **XAMPP**: `http://localhost/Komuji`
3. **API Test**: `http://localhost:8000/api/events`

### **Common Issues:**
- ❌ **Port 8000 sudah digunakan** → Gunakan port lain: `php artisan serve --port=8001`
- ❌ **PHP tidak dikenali** → Install PHP atau gunakan XAMPP
- ❌ **Database tidak connect** → Check `.env` file dan database config

## 🎯 Next Steps:

1. **Start backend server** dengan salah satu cara di atas
2. **Test API endpoint** di browser
3. **Refresh frontend** dan coba lagi
4. **Report hasil** - apakah backend sudah berjalan atau masih error
