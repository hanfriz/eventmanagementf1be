# Event Management Server

Backend API untuk sistem manajemen event yang dibangun dengan Express.js, TypeScript, dan Prisma ORM.

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **PostgreSQL** database
- **Git**

## 🚀 Getting Started (Mulai dari Nol)

### 1. Clone Repository & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd event-management/server

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit file .env dengan konfigurasi Anda
nano .env
```

**Konfigurasi .env yang diperlukan:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_management"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Cloudinary (untuk upload gambar)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=5000
NODE_ENV="development"
```

### 3. Database Setup (First Time)

```bash
# Setup database lengkap dari nol
npm run db:setup
```

**Script ini akan menjalankan:**

1. `prisma generate` - Generate Prisma client
2. `prisma db push` - Push schema ke database
3. Seed data sample untuk testing

### 4. Start Development Server

```bash
# Mulai development server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

---

## 📜 Available Scripts

### 🔧 Development Scripts

| Script          | Deskripsi                                  | Kapan Digunakan         |
| --------------- | ------------------------------------------ | ----------------------- |
| `npm run dev`   | Start development server dengan hot reload | Development sehari-hari |
| `npm run build` | Build aplikasi untuk production            | Sebelum deploy          |
| `npm run start` | Start production server                    | Production environment  |

### 🗄️ Database Management Scripts

#### Basic Database Operations

| Script                | Deskripsi                         | Kapan Digunakan                  |
| --------------------- | --------------------------------- | -------------------------------- |
| `npm run db:generate` | Generate Prisma client            | Setelah update schema            |
| `npm run db:push`     | Push schema changes ke database   | Development (tanpa migration)    |
| `npm run db:migrate`  | Create dan apply migration        | Production atau perubahan schema |
| `npm run db:studio`   | Buka Prisma Studio (database GUI) | Melihat/edit data via GUI        |

#### Data Management

| Script             | Deskripsi                          | Kapan Digunakan                |
| ------------------ | ---------------------------------- | ------------------------------ |
| `npm run db:seed`  | Insert sample data                 | Setelah setup database baru    |
| `npm run db:clear` | Hapus semua data (tabel tetap ada) | Reset data tapi keep structure |

#### Database Reset Operations

| Script               | Deskripsi                            | Kapan Digunakan              |
| -------------------- | ------------------------------------ | ---------------------------- |
| `npm run db:drop`    | Hapus semua tabel dan struktur       | Reset total database         |
| `npm run db:reset`   | Reset database + re-apply migrations | Fix migration issues         |
| `npm run db:fresh`   | Clear data + push schema + seed      | Quick reset dengan data baru |
| `npm run db:refresh` | Reset database + seed                | Full reset dengan migrations |

#### Development Convenience Scripts

| Script              | Deskripsi                         | Kapan Digunakan          |
| ------------------- | --------------------------------- | ------------------------ |
| `npm run db:setup`  | Setup database lengkap dari nol   | First time setup         |
| `npm run dev:fresh` | Fresh database + start dev server | Clean start development  |
| `npm run dev:reset` | Reset database + start dev server | Full reset + development |

---

## 🔄 Common Workflows

### Setup Project Pertama Kali

```bash
npm install
npm run db:setup
npm run dev
```

### Reset Database Completely

```bash
# Pilihan 1: Hapus struktur + data (reset total)
npm run db:drop
npm run db:setup

# Pilihan 2: Reset dengan migrations
npm run db:refresh
```

### Reset Data Saja (Keep Structure)

```bash
npm run db:fresh
```

### Update Schema

```bash
# Edit prisma/schema.prisma
npm run db:migrate
npm run db:seed  # Optional: re-seed data
```

### Development dengan Data Bersih

```bash
npm run dev:fresh
```

---

## 🗂️ Database Structure

### Tables

- **User** - Data pengguna (customer & organizer)
- **Event** - Data event/acara
- **Transaction** - Data transaksi pembelian tiket
- **Promotion** - Data kode promo dan diskon
- **Review** - Review dan rating event

### Sample Data

Setelah seeding, Anda dapat login dengan:

| Email                  | Password    | Role      |
| ---------------------- | ----------- | --------- |
| organizer1@example.com | password123 | ORGANIZER |
| organizer2@example.com | password123 | ORGANIZER |
| user1@example.com      | password123 | CUSTOMER  |
| user2@example.com      | password123 | CUSTOMER  |

---

## 🛠️ Development Tools

### Prisma Studio

```bash
npm run db:studio
```

Buka GUI untuk melihat dan mengedit data database di browser.

### Database Monitoring

- Check logs di terminal saat development
- Gunakan Prisma Studio untuk monitoring data
- Check PostgreSQL logs untuk troubleshooting

---

## 🚨 Troubleshooting

### Migration Issues

```bash
# Reset migrations jika ada conflict
npm run db:reset
npm run db:seed
```

### Database Connection Issues

1. Check PostgreSQL service is running
2. Verify DATABASE_URL in .env
3. Check database permissions

### Prisma Client Issues

```bash
# Re-generate Prisma client
npm run db:generate
```

### Data Issues

```bash
# Clear and reseed data
npm run db:fresh
```

---

## 📚 API Documentation

Server menyediakan REST API dengan endpoint:

- **Auth**: `/api/auth/*` - Authentication & authorization
- **Events**: `/api/events/*` - Event management
- **Upload**: `/api/upload/*` - **NEW: Image upload & validation**
- **Users**: `/api/users/*` - User management
- **Transactions**: `/api/transactions/*` - Transaction handling
- **Promotions**: `/api/promotions/*` - Promotion management
- **Reviews**: `/api/reviews/*` - Review system

### 🖼️ Image Upload Feature (NEW)

Event images sekarang dapat di-upload dengan **dua cara**:

1. **📎 Image URL** - Input URL gambar yang sudah ada online
2. **📤 File Upload** - Upload file gambar dari komputer ke Cloudinary

**Upload Endpoints:**

- `POST /api/upload/image` - Upload file gambar (max 5MB)
- `POST /api/upload/validate-url` - Validasi URL gambar
- `DELETE /api/upload/image/:publicId` - Hapus gambar dari Cloudinary

**Features:**

- ✅ Auto-optimization dengan Cloudinary
- ✅ Resize otomatis (max 1200x800px)
- ✅ Support format: JPG, PNG, GIF, WebP, BMP
- ✅ Real-time URL validation
- ✅ Drag & drop interface di frontend

📋 **Lihat `IMAGE_UPLOAD_FEATURE.md` untuk dokumentasi lengkap.**

### API Testing

Gunakan tools seperti:

- **Postman** - Import collection untuk testing
- **Thunder Client** (VS Code extension)
- **curl** commands

---

## 🔒 Security Notes

- Passwords di-hash menggunakan bcrypt (12 rounds)
- JWT tokens untuk authentication
- Input validation menggunakan express-validator
- Rate limiting untuk API endpoints
- CORS configuration untuk frontend integration

---

## 📝 Notes

- **Development**: Gunakan `db:fresh` untuk reset data cepat
- **Production**: Selalu gunakan `db:migrate` untuk schema changes
- **Backup**: Backup database sebelum menjalankan reset operations
- **Environment**: Jangan commit file `.env` ke repository

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

ISC License - see LICENSE file for details.
