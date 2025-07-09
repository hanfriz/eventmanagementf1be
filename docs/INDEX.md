# 📚 Event Management API Documentation

Selamat datang di dokumentasi Event Management API! Sistem backend komprehensif untuk pengelolaan event, booking tiket, dan manajemen user.

## 📖 Dokumentasi Tersedia

### 🚀 [Quick Reference](./QUICK_REFERENCE.md)

**Panduan cepat** dengan ringkasan endpoint, contoh request, dan use case umum. **Mulai di sini!**

### 📋 [API Documentation](./API_DOCUMENTATION.md)

**Dokumentasi lengkap** dengan detail semua endpoint, schema request/response, dan contoh implementasi.

### 🌐 [Scalar Interactive Docs](./index.html)

**Dokumentasi interaktif** berbasis OpenAPI dengan fitur testing endpoint langsung di browser.

### ⚙️ [Setup & Configuration](./README.md)

**Panduan setup** dokumentasi, konfigurasi Scalar, dan maintenance.

## 🎯 Pilih Berdasarkan Kebutuhan

| Saya ingin...                        | Baca dokumentasi ini                        |
| ------------------------------------ | ------------------------------------------- |
| 🚀 **Mulai cepat** dan lihat contoh  | [Quick Reference](./QUICK_REFERENCE.md)     |
| 📖 **Detail lengkap** semua endpoint | [API Documentation](./API_DOCUMENTATION.md) |
| 🧪 **Test API** langsung di browser  | [Scalar Interactive](./index.html)          |
| ⚙️ **Setup dokumentasi** di project  | [Setup Guide](./README.md)                  |

## 🏗️ Architecture Overview

```
Event Management API
├── 🔐 Authentication (JWT)
├── 🎫 Events (CRUD + Search)
├── 💳 Transactions (Booking + Payment)
├── ⭐ Reviews (Rating + Comments)
├── 🎁 Promotions (Discounts + Codes)
├── 👤 Users (Profiles + Stats)
└── 📤 Upload (Images + Files)
```

## 🚀 Quick Start

1. **Base URL**: `http://localhost:5001/api`
2. **Authentication**: Bearer token dalam header
3. **Format**: JSON request/response
4. **Roles**: Customer, Organizer, Admin

### Contoh Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Contoh Get Events

```bash
curl http://localhost:5001/api/events?category=MUSIC&limit=5
```

## 🛠️ Tools & Testing

### Postman Collection

Import dengan base URL: `http://localhost:5001/api`

### Thunder Client (VS Code)

Buat environment:

- `baseUrl`: `http://localhost:5001/api`
- `token`: `your-jwt-token`

### Browser Testing

Buka [Scalar Interactive Docs](./index.html) untuk testing langsung.

## 📞 Support

- **Email**: developer@eventmanagement.com
- **Documentation Issues**: Lihat [Setup Guide](./README.md)
- **API Issues**: Check error codes di dokumentasi

## 🔄 Updates

- **Version**: 1.0.0
- **Last Updated**: July 2025
- **Changelog**: Lihat git commits untuk perubahan terbaru

---

**Happy Coding! 🎉**

Mulai dengan [Quick Reference](./QUICK_REFERENCE.md) untuk overview cepat, atau langsung ke [API Documentation](./API_DOCUMENTATION.md) untuk detail lengkap.
