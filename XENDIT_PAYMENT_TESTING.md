# 🚀 XENDIT PAYMENT - TESTING GUIDE

## ✅ SUDAH DIKERJAKAN:

### **Backend (Laravel):**
1. ✅ PaymentController menggunakan Xendit Invoice API
2. ✅ Config Xendit di `config/xendit.php`
3. ✅ API Keys sudah di `.env.example`
4. ✅ Routes untuk payment sudah ada
5. ✅ Remove webhook (pakai polling status)

### **Frontend (React):**
1. ✅ Remove halaman intermediary payment
2. ✅ Button "Lanjut ke Pembayaran" langsung redirect ke Xendit
3. ✅ Validasi participant data sebelum payment
4. ✅ Console logs untuk debugging
5. ✅ Polling payment status setelah return

---

## 🧪 CARA TESTING:

### **1. Setup Environment:**

**a. Update .env:**
```env
XENDIT_SECRET_KEY=xnd_development_rPvLtDKJjpL8htkBSoB1tjvHh3ln3rQIYTfDwPhitamzlC2224378pakfyv
XENDIT_PUBLIC_KEY=xnd_public_development_Sku06VoG9vMHNq5qlzYennL2_HoqMlWvJLU8Ant07Mf5heQsWUwyFGbQzDAoWLD8
XENDIT_IS_PRODUCTION=false
XENDIT_API_URL=https://api.xendit.co
XENDIT_INVOICE_EXPIRY=24
```

**b. Clear cache:**
```bash
cd c:\xampp\htdocs\Komuji
php artisan config:clear
php artisan cache:clear
```

**c. Start servers:**
```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - React (sudah running di port 5174)
cd fekomuji
npm run dev
```

---

### **2. Test Flow:**

**URL:** `http://localhost:5174/`

**Step-by-step:**

**1. Login:**
- Username: user email
- Password: user password

**2. Pilih Event:**
- Klik menu "Event"
- Pilih event yang ada tiket berbayar
- Klik "Beli Tiket"

**3. Pilih Kategori:**
- Pilih kategori tiket (yang berbayar, bukan gratis)
- Klik "Lanjutkan"

**4. Isi Data Peserta:**
- Nama Lengkap: [isi nama]
- Email: [email valid]
- Tanggal Lahir: [pilih tanggal]
- Jenis Kelamin: [pilih L/P]
- Klik "Lanjut ke Pembayaran"

**5. SEHARUSNYA:**
✅ **LANGSUNG REDIRECT KE XENDIT CHECKOUT PAGE**
✅ Tampil pilihan payment methods:
   - Bank Transfer (BCA/BNI/BRI/Mandiri/Permata)
   - E-Wallet (OVO/DANA/LinkAja/ShopeePay)
   - QRIS
   - Credit Card
   - Retail Outlets

**6. Di Xendit:**
- Pilih payment method (Bank Transfer/E-Wallet/QRIS/Credit Card)
- Complete payment
- Klik "Back to Merchant" atau tunggu auto-redirect

**7. Return ke App - SUCCESS PAGE:**
✅ **OTOMATIS REDIRECT KE http://localhost:5174/payment/success**
✅ Tampil Invoice/E-Ticket dengan:
   - ✅ Event details (nama, tanggal, lokasi)
   - ✅ Nomor tiket (booking code)
   - ✅ QR Code untuk check-in
   - ✅ Detail peserta
   - ✅ Status: Confirmed
   - ✅ Button Download & Print
✅ QR Code juga dikirim ke email

---

## 🔍 DEBUGGING:

### **Check Console (Browser F12):**

Setelah klik "Lanjut ke Pembayaran", harusnya muncul logs:

```
✅ Xendit invoice created: {data: {...}}
📄 Invoice URL: https://checkout.xendit.co/web/...
🚀 Redirecting to Xendit...
```

### **Jika Error:**

**Error: "Gagal membuat invoice"**
- ✅ Cek `.env` sudah ada `XENDIT_SECRET_KEY`
- ✅ Run `php artisan config:clear`
- ✅ Cek Laravel logs: `storage/logs/laravel.log`

**Error: "Invoice URL tidak ditemukan"**
- ✅ Cek API response di console
- ✅ Cek Xendit API key valid
- ✅ Test Xendit API manual via Postman

**Tidak redirect:**
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Clear browser cache
- ✅ Cek console untuk error JavaScript

---

## 📊 Expected API Response:

**Request:**
```json
POST /api/payment/event
{
  "event_id": 1,
  "ticket_quantity": 1,
  "ticket_category_id": 1,
  "nama_peserta": "John Doe",
  "jenis_kelamin": "L",
  "tanggal_lahir": "1990-01-01",
  "email_peserta": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Invoice berhasil dibuat",
  "data": {
    "transaction_id": 123,
    "order_id": "EVT-20231120-123456-ABC123",
    "invoice_id": "64f7...",
    "invoice_url": "https://checkout.xendit.co/web/...",
    "expiry_date": "2023-11-21T10:00:00.000Z",
    "gross_amount": 1000000,
    "event": {
      "id": 1,
      "title": "Event qjne31",
      "price": 1000000,
      "quantity": 1
    }
  }
}
```

---

## ✅ SUCCESS CRITERIA:

1. ✅ Klik "Lanjut ke Pembayaran" → langsung redirect ke Xendit
2. ✅ Tidak ada halaman intermediary payment
3. ✅ Xendit checkout tampil dengan semua payment methods
4. ✅ Setelah bayar → auto-check status → success page
5. ✅ No errors di console
6. ✅ Transaction tersimpan di database

---

## 🆘 TROUBLESHOOTING:

**Problem:** "Uncaught ReferenceError: autoPayTriggered is not defined"
**Solution:** Hard refresh browser (Ctrl+Shift+R)

**Problem:** Build failed (96 TypeScript errors)
**Solution:** Ignore, use `npm run dev` for development

**Problem:** Xendit API returns 401 Unauthorized
**Solution:** Check secret key in `.env`, ensure it starts with `xnd_development_`

**Problem:** Invoice created but no redirect
**Solution:** Check browser console for `invoice_url`, might be blocked by popup blocker

---

## 📝 NOTES:

- **Development Mode:** Gunakan Xendit sandbox (test mode)
- **Production:** Ganti ke production keys nanti
- **Webhook:** Disabled, menggunakan manual polling
- **Payment Methods:** Semua methods aktif di Xendit checkout
- **Testing:** Gunakan Xendit test payment credentials

---

**LAST UPDATED:** 2025-11-20
**STATUS:** ✅ READY FOR TESTING
