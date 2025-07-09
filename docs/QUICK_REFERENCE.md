# 📚 Event Management API - Dokumentasi Lengkap

## 🌟 Overview

API Event Management adalah sistem backend komprehensif untuk:

- ✅ Manajemen event dan tiket
- ✅ Autentikasi dan otorisasi user
- ✅ Sistem booking dan pembayaran
- ✅ Review dan rating event
- ✅ Promosi dan diskon
- ✅ Upload file dan gambar

**Base URL:** `http://localhost:5001/api`

## 🔑 Authentication

Gunakan JWT Bearer Token untuk mengakses endpoint yang dilindungi:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints Summary

| Method           | Endpoint                              | Description           | Auth Required  |
| ---------------- | ------------------------------------- | --------------------- | -------------- |
| **AUTH**         |
| POST             | `/auth/register`                      | Daftar user baru      | ❌             |
| POST             | `/auth/login`                         | Login user            | ❌             |
| GET              | `/auth/profile`                       | Profil user saat ini  | ✅             |
| **EVENTS**       |
| GET              | `/events`                             | Daftar semua event    | ❌             |
| POST             | `/events`                             | Buat event baru       | ✅ (Organizer) |
| GET              | `/events/{id}`                        | Detail event          | ❌             |
| PUT              | `/events/{id}`                        | Update event          | ✅ (Organizer) |
| DELETE           | `/events/{id}`                        | Hapus event           | ✅ (Organizer) |
| **TRANSACTIONS** |
| GET              | `/transactions`                       | Daftar transaksi user | ✅             |
| POST             | `/transactions`                       | Buat booking baru     | ✅             |
| GET              | `/transactions/{id}`                  | Detail transaksi      | ✅             |
| POST             | `/transactions/{id}/upload-payment`   | Upload bukti bayar    | ✅             |
| **REVIEWS**      |
| GET              | `/reviews`                            | Daftar review event   | ❌             |
| POST             | `/reviews`                            | Buat review baru      | ✅             |
| **PROMOTIONS**   |
| GET              | `/promotions`                         | Daftar promosi        | ✅ (Organizer) |
| POST             | `/promotions`                         | Buat promosi          | ✅ (Organizer) |
| GET              | `/promotions/validate/{code}`         | Validasi kode promo   | ❌             |
| PUT              | `/promotions/{id}`                    | Update promosi        | ✅ (Organizer) |
| DELETE           | `/promotions/{id}`                    | Hapus promosi         | ✅ (Organizer) |
| **USERS**        |
| GET              | `/users/profile`                      | Profil user           | ✅             |
| PUT              | `/users/profile`                      | Update profil         | ✅             |
| GET              | `/users/organizer/{id}/profile-stats` | Stats organizer       | ❌             |
| **UPLOAD**       |
| POST             | `/upload/image`                       | Upload gambar         | ✅             |

## 🔥 Quick Start Examples

### 1. Register & Login

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "role": "CUSTOMER"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Get Events

```bash
# Semua events
curl http://localhost:5001/api/events

# Dengan filter
curl "http://localhost:5001/api/events?category=MUSIC&location=Jakarta&page=1&limit=10"
```

### 3. Create Event (Organizer)

```bash
curl -X POST http://localhost:5001/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rock Concert 2025",
    "description": "Amazing rock concert",
    "date": "2025-08-15T19:00:00Z",
    "location": "Jakarta",
    "price": 150000,
    "availableSeats": 1000,
    "category": "MUSIC"
  }'
```

### 4. Book Ticket

```bash
curl -X POST http://localhost:5001/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-id",
    "quantity": 2,
    "promotionCode": "DISCOUNT10"
  }'
```

### 5. Upload Payment Proof

```bash
curl -X POST http://localhost:5001/api/transactions/transaction-id/upload-payment \
  -H "Authorization: Bearer <token>" \
  -F "paymentProof=@/path/to/payment-proof.jpg"
```

## 📊 Response Format

### ✅ Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  },
  "pagination": {
    /* pagination info */
  }
}
```

### ❌ Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🎯 Common Use Cases

### Customer Flow

1. **Register/Login** → `POST /auth/register` atau `POST /auth/login`
2. **Browse Events** → `GET /events`
3. **View Event Detail** → `GET /events/{id}`
4. **Book Ticket** → `POST /transactions`
5. **Upload Payment** → `POST /transactions/{id}/upload-payment`
6. **Check Booking** → `GET /transactions/{id}`
7. **Write Review** → `POST /reviews`

### Organizer Flow

1. **Register as Organizer** → `POST /auth/register` dengan `role: "ORGANIZER"`
2. **Create Event** → `POST /events`
3. **Create Promotion** → `POST /promotions`
4. **View Sales** → `GET /transactions`
5. **Check Stats** → `GET /users/organizer/{id}/profile-stats`

## 🏷️ Categories & Status

### Event Categories

- `MUSIC` - Musik
- `SPORTS` - Olahraga
- `EDUCATION` - Edukasi
- `TECHNOLOGY` - Teknologi
- `BUSINESS` - Bisnis
- `ENTERTAINMENT` - Hiburan
- `FOOD` - Makanan & Minuman
- `HEALTH` - Kesehatan
- `OTHER` - Lainnya

### Transaction Status

- `PENDING` - Menunggu pembayaran
- `PAID` - Sudah dibayar
- `COMPLETED` - Transaksi selesai
- `CANCELLED` - Dibatalkan

### User Roles

- `CUSTOMER` - Pembeli tiket
- `ORGANIZER` - Penyelenggara event
- `ADMIN` - Administrator

## 🚫 Error Codes

| Code | Description         |
| ---- | ------------------- |
| 200  | ✅ OK               |
| 201  | ✅ Created          |
| 400  | ❌ Bad Request      |
| 401  | ❌ Unauthorized     |
| 403  | ❌ Forbidden        |
| 404  | ❌ Not Found        |
| 409  | ❌ Conflict         |
| 422  | ❌ Validation Error |
| 500  | ❌ Server Error     |

## 🔒 Security Notes

- Semua password di-hash menggunakan bcrypt
- JWT token expired dalam 24 jam
- Role-based access control untuk endpoint tertentu
- File upload dengan validasi type dan size
- Rate limiting untuk prevent abuse

## 📈 Rate Limiting

- **Authenticated users**: 100 requests/minute
- **Public endpoints**: 50 requests/minute

## 🛠️ Development Notes

### Testing dengan Postman/Thunder Client

Import collection dengan base URL: `http://localhost:5001/api`

Buat environment variables:

- `baseUrl`: `http://localhost:5001/api`
- `token`: `<your-jwt-token>`

### Database Schema

API menggunakan PostgreSQL dengan Prisma ORM. Schema meliputi:

- Users (Customer, Organizer, Admin)
- Events (dengan kategori dan lokasi)
- Transactions (booking dan pembayaran)
- Reviews (rating dan komentar)
- Promotions (diskon dan kode promo)

## 🎉 Happy Coding!

Dokumentasi ini mencakup semua endpoint yang tersedia di Event Management API. Untuk detail lebih lanjut tentang request/response schema, lihat file `API_DOCUMENTATION.md` yang lebih lengkap.

---

**Version**: 1.0.0  
**Last Updated**: July 2025  
**Support**: developer@eventmanagement.com
