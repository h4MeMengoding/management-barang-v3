# Management Barang - Smart Locker & Inventory Management System

> A modern, real-time warehouse management system built with Next.js 16, featuring QR code integration, role-based access control, and comprehensive inventory tracking.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

---

## Key Features

### **Authentication & Authorization**
- **Secure Authentication System** with bcrypt password hashing
- **Role-Based Access Control** (Admin & User roles)
- **Admin-Only Features** for user management and system configuration
- **Protected Routes** with automatic redirection

### **Locker Management**
- **Create & Manage Lockers** with unique codes (e.g., A001, B123)
- **Automatic QR Code Generation** for each locker
- **Download QR Codes** as PNG images for physical labeling
- **Real-time Status Tracking** (Empty/Filled)
- **Locker Details Page** with comprehensive item listing

### **Item Management**
- **Add Single or Multiple Items** at once (comma-separated)
- **Assign Items to Lockers** with dropdown selection
- **Categorize Items** for better organization
- **Quantity Tracking** with increment/decrement controls
- **Item Descriptions** for additional details
- **Edit & Delete Operations** with confirmation dialogs

### **Category Management**
- **Create Custom Categories** on-the-fly
- **Real-time Category Selection** with search functionality
- **Category-based Filtering** for items
- **Automatic Category Creation** during item addition

### **QR Code Scanner**
- **Built-in QR Scanner** using device camera
- **Instant Locker Navigation** after scanning
- **Mobile-Optimized** scanning interface
- **Error Handling** for invalid/unknown QR codes

### **User Management** (Admin Only)
- **Create New Users** with role assignment
- **Edit User Information** (name, email, password)
- **Delete Users** with protection for last admin
- **User List View** with search and filtering

### **Dashboard & Analytics**
- **Statistics Overview** with percentage changes
- **Recent Items Display** with category badges
- **Recent Lockers** with item counts
- **Recent Categories** with visual indicators
- **Interactive Charts** (Bar & Donut charts)
- **Cost Breakdown Analysis**
- **Latest Transactions** tracking

### **Modern UI/UX**
- **Responsive Design** for all screen sizes
- **Smooth Animations** with Framer Motion
- **Glassmorphism Effects** for modern aesthetics
- **Intuitive Navigation** with sidebar and mobile bottom nav
- **Loading Skeletons** for better perceived performance
- **Toast Notifications** for user feedback
- **Hover Effects & Transitions** throughout

### **Real-time Updates**
- **Automatic Data Refresh** with React Query
- **Optimistic UI Updates** for instant feedback
- **Cache Management** with TanStack Query
- **Background Refetching** for data consistency

---

## Tech Stack

### **Frontend**
- **Next.js 16.0.3** - App Router with Server Components
- **React 19.2.0** - Latest React features
- **TypeScript 5.7.3** - Type-safe development
- **TailwindCSS 4.0** - Utility-first styling
- **Framer Motion 12.23.24** - Smooth animations
- **Lucide React 0.469.0** - Beautiful icons

### **Backend & Database**
- **Prisma 6.19.0** - Type-safe ORM
- **PostgreSQL** - Relational database (via Supabase)
- **Supabase** - Backend-as-a-Service
- **Supabase Storage** - File storage for profile pictures

### **Authentication**
- **bcryptjs 2.4.3** - Password hashing
- **localStorage** - Session management

### **QR Code Features**
- **qrcode 1.5.4** - QR code generation
- **qr-scanner 1.4.2** - QR code scanning

### **Data Fetching**
- **@tanstack/react-query 6.1.0** - Powerful async state management
- **@supabase/supabase-js** - Supabase client SDK

### **Charts & Visualization**
- **recharts 2.15.0** - Composable charting library

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database (or Supabase account)
- **Git** (for version control)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/h4MeMengoding/management-barang-v3.git
cd management-barang-v3
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Supabase (for Storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Database URL Format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Supabase Setup:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy the **URL** and **anon (public)** key
4. For file uploads, generate a **service_role** key (Settings → API → Service Role)
5. Create a storage bucket named `image` with public access
6. Create a folder `public/profile-picture` in the bucket

### 4. Initialize the Database

Run Prisma migrations to set up your database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

**Database Schema Overview:**
- **User** - Authentication and profile data (with role field)
- **Locker** - Storage units with QR codes
- **Category** - Item classification
- **Item** - Inventory items with locker and category relations

### 5. Create Admin Account

Run the development server and navigate to `/setup-admin`:

```bash
npm run dev
```

Open [http://localhost:3000/setup-admin](http://localhost:3000/setup-admin) and create your first admin account.

> **Important:** The setup-admin page is only accessible when no users exist in the database.

---

## Running the Application

### Development Mode

```bash
npm run dev
# Application runs on http://localhost:3000
```

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (Deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate
```

---

## Docker Deployment

### Using Dockerfile

The application includes a production-ready Dockerfile with automatic database migration.

**Build the image:**
```bash
docker build -t management-barang:latest .
```

**Run the container:**
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXT_PUBLIC_SUPABASE_URL="your-supabase-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  --name management-barang \
  management-barang:latest
```

**Key Features:**
- Runs `prisma db push` automatically on container start
- Ensures database schema is always in sync with production
- Multi-stage build for optimized image size
- Production-ready configuration

### Deployment with Dokploy

This application is optimized for deployment with [Dokploy](https://dokploy.com) on VPS:

1. **Push your code to GitHub/GitLab**
2. **Create new app in Dokploy**
3. **Configure environment variables** in Dokploy dashboard
4. **Deploy** - Dokploy will automatically:
   - Build the Docker image
   - Run database migrations
   - Start the application

> **Tip:** The Dockerfile is configured for Dokploy compatibility. No additional configuration needed!

---

## Usage Guide

### For Admins

1. **Setup Admin Account**
   - Navigate to `/setup-admin` (only works on first run)
   - Create your admin credentials

2. **Manage Users**
   - Go to **Kelola User** in sidebar
   - Add new users with Admin/User roles
   - Edit or delete existing users (cannot delete last admin)

3. **Create Lockers**
   - Go to **Kelola Loker**
   - Enter locker name and code (or generate automatically)
   - Add optional description
   - QR code is generated automatically

4. **Add Items**
   - Go to **Kelola Barang**
   - Enter item name(s) - use commas for multiple items
   - Select or create category
   - Assign to locker
   - Set quantity and description

5. **Manage Categories**
   - Go to **Kelola Kategori**
   - Create new categories
   - Edit or delete existing ones

6. **View Dashboard**
   - Overview of all statistics
   - Recent items, lockers, and categories
   - Charts and analytics

### For Regular Users

1. **Login**
   - Use credentials provided by admin
   - Navigate to `/signin`

2. **View Dashboard**
   - See overview of inventory
   - Check recent additions
   - View statistics

3. **Scan QR Codes**
   - Go to **Scan QR Code**
   - Allow camera access
   - Point camera at locker QR code
   - Automatically navigate to locker details

4. **Browse Lockers**
   - View all lockers from dashboard
   - Click to see locker details
   - Add items directly from locker page

5. **Manage Items**
   - Add, edit, or delete items
   - Update quantities
   - Assign to different lockers

### QR Code Workflow

1. **Generate QR Code** (automatic on locker creation)
2. **Download QR Code** from locker detail page
3. **Print & Attach** to physical locker
4. **Scan** using mobile device to instantly access locker details

---

## Project Structure

```
management-barang-v3/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── categories/           # Category CRUD
│   │   ├── items/                # Item CRUD
│   │   ├── lockers/              # Locker CRUD & QR generation
│   │   ├── search/               # Search functionality
│   │   └── stats/                # Dashboard statistics
│   ├── dashboard/                # Main dashboard page
│   ├── manage-locker/            # Locker management UI
│   ├── manage-items/             # Item management UI
│   ├── manage-categories/        # Category management UI
│   ├── manage-users/             # User management UI (Admin only)
│   ├── locker/[id]/              # Locker detail page
│   ├── category/[id]/            # Category detail page
│   ├── item/[id]/                # Item detail page (future)
│   ├── profile/                  # User profile info & logout
│   ├── settings/                 # Profile editing page
│   ├── scan-qr/                  # QR code scanner
│   ├── signin/                   # Login page
│   ├── signup/                   # Registration page
│   ├── setup-admin/              # First-time admin setup
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── Sidebar.tsx               # Main navigation sidebar
│   ├── Header.tsx                # Page header
│   ├── Card.tsx                  # Card container
│   ├── LockerCard.tsx            # Locker card component
│   ├── StatCard.tsx              # Statistics card
│   ├── BarChart.tsx              # Bar chart component
│   ├── DonutChart.tsx            # Donut chart component
│   ├── ProtectedRoute.tsx        # Route protection wrapper
│   ├── PageTransition.tsx        # Page transition animations
│   ├── QueryProvider.tsx         # React Query provider
│   ├── RegisterSW.tsx            # Service Worker registration
│   └── *Skeleton.tsx             # Loading skeleton components
├── lib/                          # Utility functions & hooks
│   ├── auth.ts                   # Authentication helpers
│   ├── prisma.ts                 # Prisma client singleton
│   ├── supabase.ts               # Supabase client
│   ├── supabase-storage.ts       # File upload utilities
│   └── hooks/                    # Custom React hooks
│       ├── useQuery.ts           # Data fetching hooks
│       ├── useItems.ts           # Item-specific hooks
│       └── useRealtime.ts        # Real-time data hooks
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema definition
├── public/                       # Static assets
│   ├── favicon/                  # Favicon files
│   ├── images/                   # Image assets
│   ├── manifest.json             # PWA manifest
│   ├── offline.html              # Offline fallback page
│   └── sw.js                     # Service worker
├── .env                          # Environment variables (not in repo)
├── Dockerfile                    # Docker configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## Key Pages & Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/signin` | Login page | Public |
| `/signup` | Registration page | Public |
| `/setup-admin` | Admin setup (first run only) | Public |
| `/dashboard` | Main dashboard with stats | Protected |
| `/manage-locker` | Locker management | Protected |
| `/manage-items` | Item management | Protected |
| `/manage-categories` | Category management | Protected |
| `/manage-users` | User management | Admin Only |
| `/locker/[id]` | Locker detail & item addition | Protected |
| `/category/[id]` | Category detail with items | Protected |
| `/scan-qr` | QR code scanner | Protected |
| `/profile` | User profile info & logout | Protected |
| `/settings` | Profile editing page | Protected |

---

## 🔧 Configuration

### Tailwind CSS

Custom configuration in `tailwind.config.js`:
- Custom colors (emerald theme)
- Animation classes
- Responsive breakpoints
- Custom utilities

### Prisma Schema

Located in `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("user")  // "admin" or "user"
  photoUrl  String?
  createdAt DateTime @default(now())
  lockers   Locker[]
  items     Item[]
  categories Category[]
}

model Locker {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  qrCodeUrl   String?
  createdAt   DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items       Item[]
}

model Category {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     Item[]
}

model Item {
  id          String   @id @default(uuid())
  name        String
  quantity    Int
  description String?
  createdAt   DateTime @default(now())
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  lockerId    String
  locker      Locker   @relation(fields: [lockerId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Next.js Configuration

Key settings in `next.config.ts`:
- Image optimization disabled for Supabase images
- Experimental features enabled
- Build optimizations

---

## Screenshots

<!-- Add screenshots here -->

### Dashboard
![Dashboard Overview](docs/img/dashboard.png)
*Main dashboard with statistics, charts, and recent items*

### Locker Management
![Locker Management](docs/img/manage-locker.png)
*Create and manage lockers with QR code generation*

### QR Code Scanner
![QR Scanner](docs/img/scan-qr.png)
*Built-in QR code scanner for quick locker access*

### Item Management
![Item Management](docs/img/manage-items.png)
*Add, edit, and organize inventory items*

### Locker Detail
![Locker Detail](docs/img/locker-detail.png)
*Locker details with QR code and item list*

### User Management
![User Management](docs/img/manage-users.png)
*Admin panel for user management*

> **Note:** Create a `docs/img` folder and add screenshots for better documentation!

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Author

**Ilhame**

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI powered by [TailwindCSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Database by [Supabase](https://supabase.com/)
- Charts by [Recharts](https://recharts.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ using Next.js

</div>
