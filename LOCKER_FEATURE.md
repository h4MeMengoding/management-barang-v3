# Fitur Kelola Loker - Dokumentasi

## ✅ Fitur yang Telah Diimplementasi

### 1. Database Schema (Prisma)
- **Model Locker** dengan field:
  - `id`: UUID (primary key)
  - `code`: String unik (format: 1 huruf + 3 angka, contoh: A123, B456)
  - `name`: Nama loker
  - `description`: Deskripsi loker (opsional)
  - `qrCodeUrl`: URL QR Code (data URL base64)
  - `userId`: Foreign key ke User
  - `createdAt`, `updatedAt`: Timestamps

### 2. API Endpoints

#### `/api/lockers` (GET, POST, PUT, DELETE)
- **GET**: Mengambil data loker
  - Query params: `id`, `code`, atau `userId`
  - Tanpa params: ambil semua loker user yang login
- **POST**: Membuat loker baru
  - Auto-generate kode unik (format A123)
  - Auto-generate QR code yang berisi kode loker
  - Body: `{ name, description? }`
- **PUT**: Update loker
  - Query param: `id`
  - Body: `{ name?, description? }`
- **DELETE**: Hapus loker
  - Query param: `id`

#### `/api/lockers/generate-code` (GET)
- Generate kode loker unik secara otomatis
- Format: 1 huruf (A-Z) + 3 angka (000-999)
- Mengecek keunikan di database

### 3. Halaman Kelola Loker (`/addLocker`)

**Fitur:**
- Form tambah loker baru
  - Input: Nama Loker
  - Input: Kode Loker (readonly, auto-generate dengan tombol refresh)
  - Textarea: Deskripsi (opsional)
  - Tombol Submit
- Daftar loker yang sudah dibuat
  - Grid responsive (1-3 kolom)
  - Klik card untuk lihat detail
  - Counter total loker
- Loading states dan error handling
- Success/error notifications
- Protected route (harus login)

**Screenshot Fitur:**
```
┌─────────────────────────────────────────────────────────────┐
│ Form Tambah Loker Baru                                      │
│ ┌─────────────────────────┐  ┌────────────┐               │
│ │ Nama Loker: [___]       │  │ Kode: A123 │ 🔄            │
│ │ Deskripsi: [________]   │  └────────────┘               │
│ └─────────────────────────┘                                 │
│                              [Tambah Loker]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Daftar Loker                              🟢 5 Loker        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│ │ 📦 A123 │ │ 📦 B456 │ │ 📦 C789 │                       │
│ │ Loker 1 │ │ Loker 2 │ │ Loker 3 │                       │
│ └─────────┘ └─────────┘ └─────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 4. Halaman Detail Loker (`/locker/[id]`)

**Fitur:**
- QR Code display (300x300px)
  - Menampilkan QR code yang berisi kode loker
  - Tombol download QR code sebagai PNG
- Informasi loker:
  - Nama loker
  - Kode loker
  - Deskripsi
  - Status (terisi/kosong - based on item count)
  - Total barang
- Action buttons:
  - Edit Loker (TODO: implement modal)
  - Hapus Loker (dengan konfirmasi)
- Daftar barang di loker (TODO: implement items API)
- Protected route
- Loading states
- Error handling (loker tidak ditemukan)

**Screenshot Fitur:**
```
┌─────────────────────────────────┐  ┌──────────────────────┐
│ ┌─────────────────────────────┐ │  │ Daftar Barang        │
│ │   ░░░░░░░░░░░░░░░░░░░░░    │ │  │                      │
│ │   ░░█████░█░░█░█████░░░    │ │  │ ┌────────┐ ┌────────┐│
│ │   ░░█░░░░░██░█░█░░░░░░░    │ │  │ │ Item 1 │ │ Item 2 ││
│ │   ░░█████░█░██░█████░░░    │ │  │ └────────┘ └────────┘│
│ │   ░░░░░█░░█░░█░█░░░░░░░    │ │  │                      │
│ │   ░░█████░█░░█░█████░░░    │ │  └──────────────────────┘
│ │   (QR Code)                 │ │
│ └─────────────────────────────┘ │
│      [Download QR]              │
│                                 │
│ Loker A123                      │
│ Kode: A123                      │
│ Status: 🟢 Kosong               │
│ Total Barang: 0                 │
│                                 │
│ [Edit Loker]  [Hapus Loker]     │
└─────────────────────────────────┘
```

### 5. QR Code Generation

**Implementasi:**
- Menggunakan library `qrcode` (npm package)
- Generate QR code sebagai data URL (base64 PNG)
- Size: 300x300 pixels
- Isi QR code: Kode loker (contoh: "A123")
- Disimpan di database (field `qrCodeUrl`)
- Dapat didownload sebagai file PNG

**Cara Scan:**
1. Gunakan aplikasi QR code scanner di smartphone
2. Arahkan kamera ke QR code
3. Hasil scan akan menampilkan kode loker (contoh: "A123")

## 📋 Testing Checklist

- [x] Database migration berhasil
- [ ] Test create loker baru
- [ ] Test auto-generate kode loker
- [ ] Test QR code generation
- [ ] Test view loker list
- [ ] Test view loker detail
- [ ] Test download QR code
- [ ] Test edit loker (TODO: implement modal)
- [ ] Test delete loker
- [ ] Test scan QR code dengan smartphone

## 🚀 Cara Menggunakan

1. **Login** ke aplikasi
2. **Navigate** ke "Kelola Loker" dari sidebar
3. **Generate kode** dengan klik tombol refresh (🔄)
4. **Isi form**:
   - Nama Loker (required)
   - Deskripsi (optional)
5. **Klik "Tambah Loker"**
6. Loker baru akan muncul di daftar dengan QR code
7. **Klik card loker** untuk lihat detail dan download QR code
8. **Scan QR code** dengan smartphone untuk verifikasi

## 🔄 Flow Diagram

```
User Login
    ↓
Kelola Loker Page
    ↓
Generate Code (Auto) → A123
    ↓
Fill Form (Name + Description)
    ↓
Submit Form
    ↓
API: Create Locker
    ├→ Generate unique code
    ├→ Generate QR code (contains: "A123")
    └→ Save to database
    ↓
Redirect to Locker List
    ↓
Click Locker Card
    ↓
Locker Detail Page
    ├→ Display QR code
    ├→ Display locker info
    ├→ Download QR button
    └→ Edit/Delete buttons
```

## 📝 TODO (Next Steps)

1. ✅ ~~Database schema & migration~~
2. ✅ ~~API endpoints (CRUD + QR generation)~~
3. ✅ ~~addLocker page (form + list)~~
4. ✅ ~~locker detail page~~
5. ⏳ Test end-to-end flow
6. ⏳ Implement edit loker modal
7. ⏳ Implement items API (barang dalam loker)
8. ⏳ Connect items to locker detail page
9. ⏳ Add search/filter in locker list
10. ⏳ Add pagination for large locker lists

## 🐛 Known Issues

- None at the moment

## 💡 Tips

- Kode loker bersifat unik, tidak boleh duplikat
- QR code dihasilkan otomatis saat loker dibuat
- QR code berisi plain text kode loker (bukan URL)
- Untuk scan QR, gunakan aplikasi scanner umum (tidak perlu custom)
- Data loker terhubung dengan user (setiap user punya lokernya sendiri)
