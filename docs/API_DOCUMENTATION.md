# Event Management API Documentation

## Overview

Event Management API adalah sistem backend yang komprehensif untuk pengelolaan event, booking tiket, autentikasi pengguna, dan pemrosesan pembayaran. API ini dibangun menggunakan Express.js, TypeScript, dan Prisma ORM.

**Base URL:** `http://localhost:5001/api`

**Version:** 1.0.0

## Authentication

API ini menggunakan autentikasi JWT Bearer Token. Sertakan token di header Authorization:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

Semua response menggunakan format JSON dengan struktur konsisten:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // untuk response yang di-pagination
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## API Endpoints

### 🔐 Authentication (`/auth`)

#### POST /auth/register

**Deskripsi:** Mendaftarkan user baru

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "CUSTOMER", // CUSTOMER atau ORGANIZER
  "gender": "MALE", // MALE atau FEMALE (optional)
  "birthDate": "1990-01-01" // optional
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/login

**Deskripsi:** Login user

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "jwt-token"
  }
}
```

#### GET /auth/profile

**Deskripsi:** Mendapatkan profil user saat ini

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "CUSTOMER",
    "profilePicture": "image-url",
    "points": 100
  }
}
```

---

### 🎫 Events (`/events`)

#### GET /events

**Deskripsi:** Mendapatkan daftar event dengan filter dan pagination

**Query Parameters:**

- `page` (number): Halaman (default: 1)
- `limit` (number): Jumlah per halaman (default: 10)
- `search` (string): Pencarian berdasarkan nama event
- `category` (string): Filter berdasarkan kategori
- `location` (string): Filter berdasarkan lokasi

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "event-id",
      "name": "Event Name",
      "description": "Event description",
      "date": "2025-07-15T10:00:00Z",
      "location": "Jakarta",
      "price": 100000,
      "availableSeats": 50,
      "category": "MUSIC",
      "image": "image-url",
      "organizer": {
        "id": "organizer-id",
        "fullName": "Organizer Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST /events

**Deskripsi:** Membuat event baru (Organizer only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Event Name",
  "description": "Event description",
  "date": "2025-07-15T10:00:00Z",
  "location": "Jakarta",
  "price": 100000,
  "availableSeats": 100,
  "category": "MUSIC",
  "image": "image-url"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "event-id",
    "name": "Event Name"
    // ... event data
  }
}
```

#### GET /events/{id}

**Deskripsi:** Mendapatkan detail event berdasarkan ID

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "event-id",
    "name": "Event Name",
    "description": "Event description",
    "date": "2025-07-15T10:00:00Z",
    "location": "Jakarta",
    "price": 100000,
    "availableSeats": 50,
    "category": "MUSIC",
    "image": "image-url",
    "organizer": {
      "id": "organizer-id",
      "fullName": "Organizer Name",
      "email": "organizer@example.com"
    },
    "reviews": [
      {
        "id": "review-id",
        "rating": 5,
        "comment": "Great event!",
        "user": {
          "fullName": "Reviewer Name"
        }
      }
    ]
  }
}
```

#### PUT /events/{id}

**Deskripsi:** Update event (Organizer only - hanya event milik sendiri)

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (sama seperti POST /events)

#### DELETE /events/{id}

**Deskripsi:** Hapus event (Organizer only - hanya event milik sendiri)

**Headers:** `Authorization: Bearer <token>`

---

### 💳 Transactions (`/transactions`)

#### GET /transactions

**Deskripsi:** Mendapatkan daftar transaksi user

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-id",
      "eventId": "event-id",
      "userId": "user-id",
      "quantity": 2,
      "totalPrice": 200000,
      "status": "COMPLETED",
      "paymentProof": "image-url",
      "event": {
        "name": "Event Name",
        "date": "2025-07-15T10:00:00Z",
        "location": "Jakarta"
      },
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

#### POST /transactions

**Deskripsi:** Membuat transaksi baru (booking tiket)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "eventId": "event-id",
  "quantity": 2,
  "promotionCode": "DISCOUNT10" // optional
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "transaction-id",
    "eventId": "event-id",
    "quantity": 2,
    "totalPrice": 180000, // setelah diskon jika ada
    "status": "PENDING",
    "discountAmount": 20000 // jika menggunakan promotion
  }
}
```

#### GET /transactions/{id}

**Deskripsi:** Mendapatkan detail transaksi

**Headers:** `Authorization: Bearer <token>`

#### POST /transactions/{id}/upload-payment

**Deskripsi:** Upload bukti pembayaran

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**

- `paymentProof`: File gambar bukti pembayaran

---

### ⭐ Reviews (`/reviews`)

#### GET /reviews

**Deskripsi:** Mendapatkan review berdasarkan event

**Query Parameters:**

- `eventId` (string): ID event

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "review-id",
      "eventId": "event-id",
      "userId": "user-id",
      "rating": 5,
      "comment": "Great event!",
      "user": {
        "fullName": "Reviewer Name"
      },
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

#### POST /reviews

**Deskripsi:** Membuat review baru

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "eventId": "event-id",
  "rating": 5,
  "comment": "Great event!"
}
```

---

### 🎁 Promotions (`/promotions`)

#### GET /promotions

**Deskripsi:** Mendapatkan daftar promosi (Organizer only)

**Headers:** `Authorization: Bearer <token>`

#### POST /promotions

**Deskripsi:** Membuat promosi baru (Organizer only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "eventId": "event-id",
  "code": "DISCOUNT10",
  "discountType": "PERCENTAGE", // PERCENTAGE atau AMOUNT
  "discountValue": 10,
  "maxUsage": 100,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z"
}
```

#### GET /promotions/validate/{code}

**Deskripsi:** Validasi kode promosi

**Query Parameters:**

- `eventId` (string): ID event

#### PUT /promotions/{id}

**Deskripsi:** Update promosi

#### DELETE /promotions/{id}

**Deskripsi:** Hapus promosi

---

### 👤 Users (`/users`)

#### GET /users/profile

**Deskripsi:** Mendapatkan profil user

**Headers:** `Authorization: Bearer <token>`

#### PUT /users/profile

**Deskripsi:** Update profil user

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "fullName": "Updated Name",
  "gender": "MALE",
  "birthDate": "1990-01-01",
  "profilePicture": "image-url"
}
```

#### GET /users/organizer/{id}/profile-stats

**Deskripsi:** Mendapatkan profil organizer dengan statistik

**Response (200):**

```json
{
  "success": true,
  "data": {
    "organizer": {
      "id": "organizer-id",
      "fullName": "Organizer Name",
      "email": "organizer@example.com",
      "profilePicture": "image-url"
    },
    "stats": {
      "totalEvents": 10,
      "totalTicketsSold": 500,
      "totalRevenue": 50000000,
      "averageRating": 4.5
    },
    "reviews": [
      {
        "id": "review-id",
        "rating": 5,
        "comment": "Great organizer!",
        "event": {
          "name": "Event Name"
        },
        "user": {
          "fullName": "Reviewer Name"
        }
      }
    ]
  }
}
```

---

### 📤 Upload (`/upload`)

#### POST /upload/image

**Deskripsi:** Upload gambar ke Cloudinary

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**

- `image`: File gambar

**Response (200):**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://cloudinary-url/image.jpg",
    "publicId": "image-public-id"
  }
}
```

---

## Error Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 200         | OK - Request berhasil                           |
| 201         | Created - Resource berhasil dibuat              |
| 400         | Bad Request - Request tidak valid               |
| 401         | Unauthorized - Token tidak valid atau tidak ada |
| 403         | Forbidden - Tidak memiliki permission           |
| 404         | Not Found - Resource tidak ditemukan            |
| 409         | Conflict - Data sudah ada (email, kode promosi) |
| 422         | Unprocessable Entity - Validasi gagal           |
| 500         | Internal Server Error - Error server            |

## Rate Limiting

- **Authenticated users**: 100 requests per minute
- **Public endpoints**: 50 requests per minute

## Categories

Event categories yang tersedia:

- `MUSIC` - Musik
- `SPORTS` - Olahraga
- `EDUCATION` - Edukasi
- `TECHNOLOGY` - Teknologi
- `BUSINESS` - Bisnis
- `ENTERTAINMENT` - Hiburan
- `FOOD` - Makanan & Minuman
- `HEALTH` - Kesehatan
- `OTHER` - Lainnya

## Status

### Transaction Status

- `PENDING` - Menunggu pembayaran
- `PAID` - Sudah dibayar
- `COMPLETED` - Transaksi selesai
- `CANCELLED` - Dibatalkan

### User Roles

- `CUSTOMER` - Pembeli tiket
- `ORGANIZER` - Penyelenggara event
- `ADMIN` - Administrator

## Examples

### Booking Flow

1. `GET /events` - Lihat daftar event
2. `GET /events/{id}` - Lihat detail event
3. `POST /transactions` - Buat booking
4. `POST /transactions/{id}/upload-payment` - Upload bukti bayar
5. `GET /transactions/{id}` - Cek status booking

### Event Management Flow (Organizer)

1. `POST /auth/register` - Daftar sebagai organizer
2. `POST /events` - Buat event
3. `POST /promotions` - Buat promosi/diskon
4. `GET /transactions` - Lihat penjualan tiket
5. `GET /users/organizer/{id}/profile-stats` - Lihat statistik

---

**Last updated:** July 2025  
**API Version:** 1.0.0
