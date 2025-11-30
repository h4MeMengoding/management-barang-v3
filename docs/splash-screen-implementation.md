# Splash Screen Implementation

## ✅ Implemented Features

### 1. Custom Splash Screen Component
- **File**: `components/SplashScreen.tsx`
- **Features**:
  - Custom splash screen yang kompatibel dengan semua platform (iOS, Android, Desktop)
  - Auto-hide setelah 1.5 detik atau ketika page selesai loading
  - Menggunakan sessionStorage untuk hanya show sekali per session
  - Smooth fade-out animation
  - Responsive design dengan loading indicator
  - Dark mode support

### 2. iOS Splash Screen Support
- **Meta tags** untuk iOS Safari sudah ditambahkan di `app/layout.tsx`
- Support untuk berbagai ukuran iPhone dan iPad
- Fallback ke custom component jika native splash tidak tersedia

### 3. Manifest Configuration
- Background color: `#F5F1E8` (light theme)
- Theme color: `#F5F1E8`
- Splash pages configuration added

## 🎨 Customization

### Mengganti dengan Logo Asli

Edit file `components/SplashScreen.tsx` pada bagian logo:

```tsx
{/* Ganti bagian ini dengan logo Anda */}
<div className="relative w-32 h-32 flex items-center justify-center">
  <img 
    src="/images/logo.png" 
    alt="Logo" 
    className="w-24 h-24 object-contain"
  />
</div>
```

### Generate iOS Splash Screen Images

1. **Recommended**: Gunakan online generator
   - https://progressier.com/pwa-icons-and-ios-splash-screen-generator
   - Upload logo Anda (512x512px minimum)
   - Background color: `#F5F1E8`
   - Download dan letakkan di `public/splash/`

2. **Alternatif**: Gunakan PWA Asset Generator
   ```bash
   npm install -g pwa-asset-generator
   pwa-asset-generator your-logo.png ./public/splash --splash-only --background "#F5F1E8"
   ```

3. **Manual**: Edit `public/splash-generator.html` untuk generate custom splash screens

## 📱 Platform Support

### ✅ Android (Chrome/Firefox/Edge)
- Custom splash screen component
- PWA manifest splash screen

### ✅ iOS (Safari)
- Custom splash screen component (works on all iOS versions)
- Native splash screens (iOS 12+) via apple-touch-startup-image meta tags
- Fallback to custom component if images not available

### ✅ Desktop (Chrome/Edge/Firefox)
- Custom splash screen component

## 🔧 Configuration

### Splash Screen Duration
Edit di `components/SplashScreen.tsx`:
```tsx
const minDisplayTime = 1500; // milliseconds
```

### Background Colors
- Light mode: `#F5F1E8` (defined in manifest.json)
- Dark mode: `#081210` (defined in component)

### Logo Size
Adjust di `components/SplashScreen.tsx`:
```tsx
<div className="relative w-32 h-32"> {/* Change size here */}
```

## 📝 Notes

1. **Session Storage**: Splash screen hanya muncul sekali per session browser. Untuk testing, clear session storage atau buka incognito window.

2. **iOS Images**: Untuk pengalaman optimal di iOS Safari, generate splash screen images dan letakkan di `public/splash/`. Lihat `public/splash/README.md` untuk detail.

3. **Logo Placeholder**: Saat ini menggunakan icon SVG sebagai placeholder. Ganti dengan logo asli untuk production.

4. **Performance**: Splash screen tidak memblokir rendering atau menambah load time. Component auto-hide ketika page ready.

## 🧪 Testing

1. **Test di berbagai devices**:
   - iOS Safari (iPhone & iPad)
   - Android Chrome
   - Desktop browsers

2. **Test PWA installation**:
   - Install PWA dari browser
   - Launch PWA dari home screen
   - Verifikasi splash screen muncul

3. **Test theme switching**:
   - Switch antara light/dark mode
   - Verifikasi splash screen colors match theme

## 🚀 Next Steps

1. **Add Logo**: Replace placeholder icon dengan logo asli di `components/SplashScreen.tsx`
2. **Generate iOS Splash Images**: Create splash screen images untuk iOS menggunakan salah satu metode di atas
3. **Test on Real Devices**: Test di real iOS dan Android devices
4. **Optimize**: Adjust timing dan animations sesuai kebutuhan

## Files Changed
- ✅ `components/SplashScreen.tsx` - Created
- ✅ `app/layout.tsx` - Updated (added SplashScreen component & iOS meta tags)
- ✅ `public/manifest.json` - Updated (added splash_pages config)
- ✅ `public/splash-generator.html` - Created (helper tool)
- ✅ `public/splash/README.md` - Created (documentation)
