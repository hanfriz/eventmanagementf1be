# 📚 Event Management API Documentation

Dokumentasi API lengkap untuk sistem Event Management telah dibuat menggunakan Scalar!

## 🚀 Cara Menjalankan Dokumentasi

### 1. Menjalankan Server Dokumentasi

```bash
cd server
npm run docs
```

Dokumentasi akan tersedia di: **http://localhost:3001**

### 2. Atau Buka File HTML Langsung

Buka file `server/docs/index.html` di browser Anda.

## 📋 Apa yang Sudah Dibuat

### ✅ File Dokumentasi

- **`docs/api-spec.yaml`** - Spesifikasi OpenAPI 3.0 lengkap
- **`docs/scalar.config.json`** - Konfigurasi Scalar
- **`docs/introduction.md`** - Pengantar dokumentasi
- **`docs/index.html`** - Interface Scalar
- **`docs/README.md`** - Panduan dokumentasi
- **`docs-server.js`** - Server sederhana untuk dokumentasi

### ✅ Endpoint yang Didokumentasikan

- **Authentication** (`/auth`) - Login, register, logout
- **Events** (`/events`) - CRUD, search, categories
- **Users** (`/users`) - Profile, statistics
- **Transactions** (`/transactions`) - Booking, payments
- **Reviews** (`/reviews`) - Review dan rating
- **Promotions** (`/promotions`) - Diskon dan promosi
- **Upload** (`/upload`) - Upload file dan gambar

### ✅ Fitur Dokumentasi

- ✨ Interface Scalar yang modern dan interaktif
- 📖 Pengantar komprehensif
- 🔐 Dokumentasi autentikasi JWT
- 📝 Schema request/response lengkap
- 💡 Contoh request dan response
- 🏷️ Tag dan kategori endpoint
- 🔒 Dokumentasi security requirements

## 🛠️ Scripts yang Tersedia

```bash
# Menjalankan dokumentasi
npm run docs

# Generate static HTML (jika diperlukan)
npm run docs:build
```

## 🌐 Fitur Scalar

Dokumentasi menggunakan Scalar yang menyediakan:

- Interface yang responsive dan modern
- Testing endpoint langsung dari dokumentasi
- Pencarian endpoint yang cepat
- Navigasi yang intuitif
- Support untuk tema dark/light
- Export ke berbagai format

## 📖 Cara Menggunakan

1. **Jalankan server dokumentasi**: `npm run docs`
2. **Buka browser**: Kunjungi `http://localhost:3001`
3. **Explore API**: Gunakan navigation sidebar untuk menjelajahi endpoint
4. **Test API**: Gunakan fitur "Try it" untuk test endpoint langsung
5. **Lihat contoh**: Setiap endpoint memiliki contoh request/response

## 🔄 Update Dokumentasi

Ketika menambah endpoint baru:

1. Tambahkan route di `src/routes/`
2. Update `docs/api-spec.yaml` dengan endpoint baru
3. Test dokumentasi dengan `npm run docs`

## 📱 Deployment

Untuk production:

- Upload folder `docs/` ke hosting static
- Atau gunakan `npm run docs:build` untuk generate static bundle
- Konfigurasi di `scalar.config.json` untuk Scalar Cloud

## 🎉 Ready to Use!

Dokumentasi API Event Management Anda sudah siap digunakan dengan Scalar!

Fitur-fitur yang tersedia:

- ✅ Dokumentasi lengkap semua endpoint
- ✅ Interface modern dan interaktif
- ✅ Test endpoint langsung dari dokumentasi
- ✅ Pengantar dan panduan yang jelas
- ✅ Schema dan contoh yang lengkap

Selamat menggunakan! 🚀
