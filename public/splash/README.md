# Splash Screen Images

Folder ini berisi gambar splash screen untuk berbagai ukuran device iOS dan Android.

## Cara Generate Splash Screen Images

### Opsi 1: Menggunakan Generator Online (Recommended)
1. Buka https://progressier.com/pwa-icons-and-ios-splash-screen-generator
2. Upload logo Anda (minimal 512x512px, format PNG/SVG)
3. Pilih warna background: `#F5F1E8` (light mode)
4. Download semua splash screens
5. Ekstrak dan letakkan di folder ini (`public/splash/`)

### Opsi 2: Menggunakan PWA Asset Generator
```bash
npm install -g pwa-asset-generator
pwa-asset-generator your-logo.png ./public/splash --splash-only --background "#F5F1E8"
```

### Opsi 3: Manual menggunakan Template Generator
1. Buka file `splash-generator.html` di browser
2. Edit script untuk menggunakan logo Anda
3. Jalankan script untuk generate semua ukuran

## Ukuran Yang Diperlukan

### iPhone (Portrait)
- 640x1136 (iPhone SE)
- 750x1334 (iPhone 8)
- 1242x2208 (iPhone 8 Plus)
- 1125x2436 (iPhone X/XS/11 Pro)
- 828x1792 (iPhone XR/11)
- 1242x2688 (iPhone XS Max/11 Pro Max)
- 1170x2532 (iPhone 12/13/14 Pro)
- 1284x2778 (iPhone 12/13/14 Pro Max)
- 1179x2556 (iPhone 15 Pro)
- 1290x2796 (iPhone 15 Pro Max)

### iPad (Portrait)
- 1536x2048 (iPad 9.7")
- 1668x2224 (iPad 10.5")
- 1620x2160 (iPad 10.2")
- 1668x2388 (iPad 11")
- 2048x2732 (iPad 12.9")

## Format File
- Format: PNG
- Naming: `apple-splash-[width]-[height].png`
- Contoh: `apple-splash-1170-2532.png`

## Catatan
- Background color harus match dengan `background_color` di manifest.json (`#F5F1E8`)
- Logo harus centered dan tidak terlalu besar (20-30% dari tinggi layar)
- Gunakan safe area untuk iOS (hindari notch area)

## Status
⚠️ **BELUM ADA IMAGES** - Folder ini masih kosong. Silakan generate splash screens menggunakan salah satu metode di atas dengan logo Anda.

Untuk sementara, aplikasi menggunakan custom splash screen component yang tidak memerlukan images ini, namun untuk pengalaman optimal di iOS Safari, sebaiknya generate images tersebut.
