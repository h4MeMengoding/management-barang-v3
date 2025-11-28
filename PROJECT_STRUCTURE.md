# Project Structure - Management Barang v3

Struktur lengkap file dan folder dalam project Management Barang v3.

## Root Files

```
├── .dockerignore
├── .env
├── .env.example
├── Dockerfile
├── README.md
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts
└── tsconfig.json
```

## App Directory (Next.js 15+ App Router)

```
app/
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx
├── not-found.tsx
│
├── api/                              # API Routes
│   ├── auth/
│   │   ├── check-admin/
│   │   │   └── route.ts
│   │   ├── delete-account/
│   │   │   └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── profile/
│   │   │   └── route.ts
│   │   ├── setup-admin/
│   │   │   └── route.ts
│   │   └── signup/
│   │       └── route.ts
│   ├── categories/
│   │   └── route.ts
│   ├── data/
│   │   ├── export/
│   │   │   └── route.ts
│   │   ├── import/
│   │   │   └── route.ts
│   │   └── reset/
│   │       └── route.ts
│   ├── items/
│   │   └── route.ts
│   ├── lockers/
│   │   ├── route.ts
│   │   └── generate-code/
│   │       └── route.ts
│   ├── search/
│   │   └── route.ts
│   ├── stats/
│   │   └── route.ts
│   ├── upload/
│   │   └── profile-picture/
│   │       └── route.ts
│   └── users/
│       └── route.ts
│
├── category/                          # Category Pages
│   └── [id]/
│       └── page.tsx
│
├── dashboard/                         # Dashboard Page
│   └── page.tsx
│
├── item/                             # Item Detail Pages
│   └── [id]/
│
├── locker/                           # Locker Detail Pages
│   └── [id]/
│       └── page.tsx
│
├── manage-categories/                # Category Management Page
│   └── page.tsx
│
├── manage-items/                     # Items Management Page
│   └── page.tsx
│
├── manage-locker/                    # Locker Management Page
│   └── page.tsx
│
├── manage-users/                     # User Management Page
│   └── page.tsx
│
├── privacy/                          # Privacy Policy Page
│   └── page.tsx
│
├── reset-success/                    # Reset Success Page
│   └── page.tsx
│
├── scan-qr/                          # QR Code Scanner Page
│   └── page.tsx
│
├── settings/                         # Settings Page
│   └── page.tsx
│
├── setup-admin/                      # Admin Setup Page
│   └── page.tsx
│
├── signin/                           # Sign In Page
│   └── page.tsx
│
├── signup/                           # Sign Up Page
│   └── page.tsx
│
└── terms/                            # Terms of Service Page
    └── page.tsx
```

## Components Directory

```
components/
├── BarangBaru.tsx                    # New Items Component
├── BarangBaruItem.tsx                # New Item Card Component
├── BarChart.tsx                      # Bar Chart Component
├── Card.tsx                          # Reusable Card Component
├── CategoryDetailSkeleton.tsx        # Category Detail Loading Skeleton
├── CostBreakdown.tsx                 # Cost Breakdown Component
├── DonutChart.tsx                    # Donut Chart Component
├── Header.tsx                        # Page Header Component
├── ItemsListSkeleton.tsx             # Items List Loading Skeleton
├── KategoriBaru.tsx                  # New Categories Component
├── LastTransactions.tsx              # Last Transactions Component
├── LockerCard.tsx                    # Locker Card Component
├── LockerDetailSkeleton.tsx          # Locker Detail Loading Skeleton
├── LokerBaru.tsx                     # New Lockers Component
├── MaintenanceItem.tsx               # Maintenance Item Component
├── PageTransition.tsx                # Page Transition Animation
├── ProgressBar.tsx                   # Progress Bar Component
├── ProtectedRoute.tsx                # Protected Route HOC
├── QueryProvider.tsx                 # React Query Provider
├── RegisterSW.tsx                    # Service Worker Registration
├── ReportBarang.tsx                  # Items Report Component
├── ReportLoker.tsx                   # Locker Report Component
├── ReportSales.tsx                   # Sales Report Component
├── Sidebar.tsx                       # Sidebar Navigation Component
├── StatCard.tsx                      # Statistics Card Component
├── ThemeProvider.tsx                 # Theme Context Provider
├── ThemeToggle.tsx                   # Theme Toggle Button
└── TransactionItem.tsx               # Transaction Item Component
```

## Library Directory

```
lib/
├── auth.ts                           # Authentication Utilities
├── prisma.ts                         # Prisma Client Setup
├── supabase.ts                       # Supabase Client Setup
├── supabase-storage.ts               # Supabase Storage Utilities
│
└── hooks/                            # Custom React Hooks
    ├── useItems.ts                   # Items Hook
    ├── useQuery.ts                   # Query Hook
    └── useRealtime.ts                # Realtime Updates Hook
```

## Prisma Directory

```
prisma/
└── schema.prisma                     # Prisma Database Schema
```

## Public Directory

```
public/
├── file.svg
├── globe.svg
├── manifest.json                     # PWA Manifest
├── next.svg
├── offline.html                      # Offline Fallback Page
├── signin-illustration.png
├── signup-illustration.png
├── sw.js                            # Service Worker
├── vercel.svg
├── window.svg
│
├── favicon/                          # Favicon Files
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── favicon-96x96.png
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
│
└── images/                           # Image Assets
    ├── person1.svg
    ├── person2.svg
    ├── person3.svg
    ├── property1.svg
    ├── property2.svg
    └── property3.svg
```

## Documentation Directory

```
docs/
├── setup-database.md                 # Database Setup Guide
└── img/                              # Documentation Images
```

## Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS v4
- **Authentication**: Custom Auth with Supabase
- **State Management**: React Query
- **PWA**: Service Worker with offline support
- **Charts**: Custom chart components
- **Dark Mode**: Theme provider with system preference

## Key Features

1. **Authentication System**: Login, Signup, Profile management
2. **Inventory Management**: Items, Categories, Lockers
3. **QR Code System**: Generate and scan QR codes for lockers
4. **Dashboard**: Statistics and analytics
5. **Reports**: Comprehensive reporting system
6. **User Management**: Admin user management
7. **Data Operations**: Import, Export, Reset data
8. **PWA Support**: Offline-first with service worker
9. **Dark Mode**: Full dark mode support
10. **Real-time Updates**: Live data synchronization

---

**Generated on**: November 28, 2025
**Project**: Management Barang v3
**Version**: 3.0.0
