# Setup Database Baru - Panduan Lengkap

Panduan lengkap untuk setup database baru pada aplikasi Manajemen Barang v3.

---

## 📋 Daftar Isi

1. [Update Environment Variables](#1-update-environment-variables)
2. [Generate Prisma Client](#2-generate-prisma-client)
3. [Push Schema ke Database](#3-push-schema-ke-database)
4. [Seed Database (Opsional)](#4-seed-database-opsional)
5. [Setup Supabase Storage](#5-setup-supabase-storage)
6. [Verifikasi Database](#6-verifikasi-database)
7. [Test Aplikasi](#7-test-aplikasi)
8. [Migrasi Data Lama (Opsional)](#8-migrasi-data-lama-opsional)
9. [Setup Production](#9-setup-production)
10. [Keamanan](#10-keamanan)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Update Environment Variables

### Langkah 1: Buka file `.env`

```bash
notepad .env
```

### Langkah 2: Update URL Database

Pastikan `DATABASE_URL` dan `DIRECT_URL` sudah mengarah ke database baru:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Catatan:**
- `DATABASE_URL` menggunakan port `6543` dengan pgbouncer (untuk pooling)
- `DIRECT_URL` menggunakan port `5432` (koneksi langsung)
- Ganti `xxx` dan `password` dengan credential Anda

---

## 2. Generate Prisma Client

Generate Prisma client berdasarkan schema:

```bash
npx prisma generate
```

**Output yang diharapkan:**
```
✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client
```

---

## 3. Push Schema ke Database

### Pilihan A: Database Push (Untuk Development)

Langsung push schema tanpa membuat migration files:

```bash
npx prisma db push
```

**Kelebihan:**
- ✅ Cepat dan mudah
- ✅ Langsung sync schema
- ✅ Cocok untuk prototyping

**Kekurangan:**
- ❌ Tidak ada history migration
- ❌ Sulit tracking perubahan

### Pilihan B: Migration (Untuk Production)

Buat migration file untuk tracking perubahan:

```bash
npx prisma migrate dev --name init
```

**Kelebihan:**
- ✅ Ada history perubahan
- ✅ Bisa rollback
- ✅ Reproducible

**Kekurangan:**
- ❌ Lebih kompleks
- ❌ Butuh commit migration files

---

## 4. Seed Database (Opsional)

### Langkah 1: Buat File Seed

Buat file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');
  
  // Hash password untuk user dummy
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Buat user dummy
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin Test',
      password: hashedPassword,
    },
  });

  console.log('✅ Created user:', user.email);

  // Buat kategori dummy
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Elektronik', userId: user.id },
    }),
    prisma.category.create({
      data: { name: 'Peralatan Kantor', userId: user.id },
    }),
    prisma.category.create({
      data: { name: 'Makanan', userId: user.id },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Buat loker dummy
  const lockers = await Promise.all([
    prisma.locker.create({
      data: {
        code: 'A001',
        name: 'Lemari 1',
        description: 'Lemari di ruang utama',
        userId: user.id,
      },
    }),
    prisma.locker.create({
      data: {
        code: 'B001',
        name: 'Lemari 2',
        description: 'Lemari di gudang',
        userId: user.id,
      },
    }),
  ]);

  console.log(`✅ Created ${lockers.length} lockers`);

  // Buat item dummy
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: 'Laptop Dell',
        quantity: 2,
        description: 'Laptop untuk development',
        categoryId: categories[0].id,
        lockerId: lockers[0].id,
        userId: user.id,
      },
    }),
    prisma.item.create({
      data: {
        name: 'Mouse Wireless',
        quantity: 5,
        categoryId: categories[0].id,
        lockerId: lockers[0].id,
        userId: user.id,
      },
    }),
    prisma.item.create({
      data: {
        name: 'Kertas A4',
        quantity: 10,
        categoryId: categories[1].id,
        lockerId: lockers[1].id,
        userId: user.id,
      },
    }),
  ]);

  console.log(`✅ Created ${items.length} items`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Langkah 2: Update `package.json`

Tambahkan script seed:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Langkah 3: Install Dependencies

```bash
npm install -D ts-node @types/node
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Langkah 4: Jalankan Seed

```bash
npx prisma db seed
```

**Credentials untuk Testing:**
- Email: `admin@test.com`
- Password: `password123`

---

## 5. Setup Supabase Storage

### A. Login ke Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Storage** di sidebar

### B. Buat Storage Bucket

#### Bucket: `image`

1. Klik **New bucket**
2. Isi form:
   - **Name:** `image`
   - **Public bucket:** ✅ (centang)
   - **File size limit:** 2 MB
   - **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp`
3. Klik **Create bucket**

> **Catatan:** Aplikasi ini menggunakan satu bucket `image` dengan struktur folder:
> - `public/profile-picture/` - untuk menyimpan foto profil user

### C. Set Storage Policies

#### Policies untuk bucket `image`:

Masuk ke **Storage > image > Policies**, lalu tambahkan:

**Policy 1: Upload Images**
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'image');
```

**Policy 2: Read Images**
```sql
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'image');
```

**Policy 3: Update Images**
```sql
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'image');
```

**Policy 4: Delete Images**
```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'image');
```

---

## 6. Verifikasi Database

### Buka Prisma Studio

```bash
npx prisma studio
```

Browser akan terbuka di `http://localhost:5555`

### Checklist Verifikasi:

- [ ] Tabel `User` ada
- [ ] Tabel `Locker` ada
- [ ] Tabel `Category` ada
- [ ] Tabel `Item` ada
- [ ] Data seed berhasil masuk (jika di-run)
- [ ] Relasi antar tabel berfungsi

---

## 7. Test Aplikasi

### Jalankan Development Server

```bash
npm run dev
```

Buka `http://localhost:3000`

### Test Checklist:

#### Authentication
- [ ] Sign up dengan user baru berhasil
- [ ] Login dengan user yang baru dibuat
- [ ] Logout berhasil
- [ ] Session tersimpan di localStorage

#### Loker Management
- [ ] Buat loker baru
- [ ] QR code ter-generate
- [ ] QR code ter-upload ke Supabase Storage
- [ ] QR code bisa di-download
- [ ] Edit loker berhasil
- [ ] Delete loker berhasil

#### Item Management
- [ ] Tambah barang baru
- [ ] Pilih kategori dari dropdown
- [ ] Pilih loker dari dropdown
- [ ] Edit barang berhasil
- [ ] Delete barang berhasil

#### Category Management
- [ ] Tambah kategori baru
- [ ] Edit kategori berhasil
- [ ] Delete kategori berhasil

#### Dashboard
- [ ] Stats cards menampilkan data benar
- [ ] Report Barang chart muncul
- [ ] Report Loker chart muncul
- [ ] Barang Baru list muncul
- [ ] Loker Baru list muncul
- [ ] Kategori Baru list muncul

#### Profile
- [ ] Update nama berhasil
- [ ] Update email berhasil
- [ ] Ganti password berhasil
- [ ] Upload foto profil berhasil

---

## 8. Migrasi Data Lama (Opsional)

### Jika Menggunakan PostgreSQL

#### Export Data dari Database Lama

```bash
# Export semua data
pg_dump -h old_host -U old_user -d old_db > backup.sql

# Export specific tables
pg_dump -h old_host -U old_user -d old_db \
  -t users -t lockers -t items -t categories \
  > backup.sql

# Export hanya data (tanpa schema)
pg_dump -h old_host -U old_user -d old_db \
  --data-only --inserts \
  > data_only.sql
```

#### Import ke Database Baru

```bash
# Import full backup
psql -h new_host -U new_user -d new_db < backup.sql

# Atau via Supabase SQL Editor
# Copy paste isi backup.sql ke SQL Editor
```

### Jika Data dari JSON/CSV

Buat script custom di `prisma/migrate-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function migrateFromJSON() {
  const oldData = JSON.parse(fs.readFileSync('old-data.json', 'utf-8'));
  
  for (const item of oldData.items) {
    await prisma.item.create({
      data: {
        name: item.name,
        quantity: item.quantity,
        // ... mapping fields
      },
    });
  }
  
  console.log('Migration completed!');
}

migrateFromJSON()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Jalankan:

```bash
npx ts-node prisma/migrate-data.ts
```

---

## 9. Setup Production

### A. Update Environment Variables di Hosting

**Vercel:**

```bash
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Atau via Dashboard:
1. Buka project di Vercel
2. Settings > Environment Variables
3. Tambahkan semua variabel dari `.env`

**Railway / Render / Lainnya:**

Tambahkan environment variables melalui dashboard masing-masing.

### B. Push Migration ke Production

Jika menggunakan migration files:

```bash
# Generate migration
npx prisma migrate dev --name production_setup

# Deploy migration
npx prisma migrate deploy
```

### C. Deploy Aplikasi

```bash
# Git push
git add .
git commit -m "Setup new database"
git push origin main

# Atau via Vercel CLI
vercel --prod
```

---

## 10. Keamanan

### ⚠️ PENTING - Lakukan Ini Segera!

#### 1. Rotate Credentials (Jika DB URL Pernah Ter-publish)

**Supabase:**
1. Buka project di Supabase
2. Settings > Database
3. Klik **Reset database password**
4. Update `.env` dengan password baru
5. Update env di production (Vercel/dll)

#### 2. Pastikan `.env` Tidak Ter-commit

```bash
# Check .gitignore
cat .gitignore | grep ".env"
```

Jika belum ada, tambahkan ke `.gitignore`:

```
# Environment variables
.env
.env.local
.env*.local
.env.production
```

#### 3. Revoke Public Access (Jika Perlu)

Jika ada keys/tokens yang ter-expose:
- Supabase: Settings > API > Regenerate keys
- Database: Reset password
- Storage: Review policies

#### 4. Enable Row Level Security (RLS)

Supabase sudah enable RLS secara default, tapi pastikan:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Enable RLS jika belum
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
```

---

## 11. Troubleshooting

### Error: "Can't reach database server"

**Penyebab:**
- URL database salah
- Database server mati
- Firewall blocking

**Solusi:**
```bash
# Test koneksi
npx prisma db execute --stdin <<< "SELECT 1"

# Check URL di .env
cat .env | grep DATABASE_URL
```

### Error: "Prisma schema out of sync"

**Solusi:**
```bash
npx prisma generate
npx prisma db push
```

### Error: "Column does not exist"

**Penyebab:** Schema belum di-push

**Solusi:**
```bash
npx prisma db push --force-reset
```

### Storage Upload Gagal

**Penyebab:**
- Bucket belum dibuat
- Policy salah
- File size terlalu besar

**Solusi:**
1. Check bucket exists di Supabase Storage
2. Verify policies di Storage > Policies
3. Check file size limit

### Migration Error

**Solusi:**
```bash
# Reset database (HATI-HATI: Akan hapus semua data!)
npx prisma migrate reset

# Atau deploy ulang
npx prisma migrate deploy
```

---

## 📞 Bantuan

Jika masih ada masalah:

1. **Check Prisma logs:**
   ```bash
   npx prisma --version
   npx prisma validate
   ```

2. **Check Supabase logs:**
   - Dashboard > Logs > Database
   - Dashboard > Logs > Storage

3. **Check aplikasi logs:**
   ```bash
   npm run dev
   # Lihat console untuk error messages
   ```

---

## ✅ Checklist Setup Lengkap

### Database Setup
- [ ] Update `DATABASE_URL` dan `DIRECT_URL` di `.env`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push` atau `npx prisma migrate dev`
- [ ] Run `npx prisma db seed` (opsional)
- [ ] Verify dengan `npx prisma studio`

### Supabase Storage
- [ ] Buat bucket `qr-codes`
- [ ] Buat bucket `profile-images`
- [ ] Set policies untuk `qr-codes`
- [ ] Set policies untuk `profile-images`

### Testing
- [ ] Sign up user baru
- [ ] Test login/logout
- [ ] Test create loker (QR generation)
- [ ] Test create item
- [ ] Test create category
- [ ] Test upload profile image
- [ ] Test semua CRUD operations

### Production
- [ ] Update env variables di hosting
- [ ] Deploy migration: `npx prisma migrate deploy`
- [ ] Deploy aplikasi: `git push` / `vercel --prod`
- [ ] Test production URL
- [ ] Monitor logs untuk errors

### Security
- [ ] Verify `.env` di `.gitignore`
- [ ] Rotate credentials jika ter-expose
- [ ] Enable RLS di Supabase
- [ ] Review storage policies
- [ ] Backup database

---

## 🎉 Selamat!

Database baru Anda sudah siap digunakan! 🚀

**Next Steps:**
- Monitor performance di Supabase Dashboard
- Setup backup schedule
- Configure monitoring/alerts
- Add more seed data jika perlu

---

**Dibuat:** 21 November 2025  
**Versi:** 1.0  
**Aplikasi:** Manajemen Barang v3
