# Property Management Dashboard

Dashboard UI yang dibuat menggunakan Next.js 15, TypeScript, dan Tailwind CSS dengan komponen yang reusable.

## Fitur

- 🏠 **Statistik Properti** - Total Property, Number of Sales, Total Sales
- 📊 **Report Sales** - Bar chart interaktif dengan tooltip
- 💰 **Cost Breakdown** - Donut chart untuk breakdown biaya
- 📝 **Last Transactions** - Daftar transaksi terakhir
- 🔧 **Maintenance Requests** - Daftar permintaan maintenance

## Komponen Reusable

### Core Components
- `Card` - Base card component dengan shadow dan rounded corners
- `StatCard` - Card untuk menampilkan statistik dengan icon, value, dan perubahan
- `BarChart` - Interactive bar chart dengan hover tooltip
- `DonutChart` - Donut chart untuk menampilkan breakdown data
- `TransactionItem` - Item untuk menampilkan transaksi
- `MaintenanceItem` - Item untuk menampilkan maintenance request

### Layout Components
- `Sidebar` - Navigasi sidebar dengan icons
- `Header` - Header dengan search bar dan notifications

### Section Components
- `ReportSales` - Section untuk report sales dengan bar chart
- `CostBreakdown` - Section untuk cost breakdown dengan donut chart
- `LastTransactions` - Section untuk last transactions list
- `MaintenanceRequests` - Section untuk maintenance requests list

## Struktur Folder

```
management-barang-v3/
├── app/
│   └── page.tsx              # Main dashboard page
├── components/
│   ├── Card.tsx              # Base card component
│   ├── StatCard.tsx          # Statistics card component
│   ├── BarChart.tsx          # Bar chart component
│   ├── DonutChart.tsx        # Donut chart component
│   ├── TransactionItem.tsx   # Transaction item component
│   ├── MaintenanceItem.tsx   # Maintenance item component
│   ├── Sidebar.tsx           # Sidebar navigation
│   ├── Header.tsx            # Header with search
│   ├── ReportSales.tsx       # Report sales section
│   ├── CostBreakdown.tsx     # Cost breakdown section
│   ├── LastTransactions.tsx  # Last transactions section
│   └── MaintenanceRequests.tsx # Maintenance requests section
└── public/
    └── images/               # Placeholder images (SVG)
```

## Cara Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser dan akses [http://localhost:3000](http://localhost:3000)

## Build untuk Production

```bash
npm run build
npm start
```

## Teknologi yang Digunakan

- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React 19** - UI library

## Customization

### Mengubah Data

Edit file component masing-masing untuk mengubah data:
- `app/page.tsx` - Data untuk stat cards
- `components/ReportSales.tsx` - Data sales
- `components/CostBreakdown.tsx` - Data cost breakdown
- `components/LastTransactions.tsx` - Data transaksi
- `components/MaintenanceRequests.tsx` - Data maintenance

### Mengubah Warna

Warna dapat diubah di:
- Tailwind classes di setiap component
- `tailwind.config.ts` untuk custom colors

### Menambah Komponen

Semua komponen dirancang untuk reusable, tinggal import dan gunakan dengan props yang sesuai.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
