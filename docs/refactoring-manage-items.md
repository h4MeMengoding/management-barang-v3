# Refactoring Manage Items Page

## Overview
Dokumen ini menjelaskan refactoring yang dilakukan pada halaman manage items untuk mengikuti standar arsitektur yang sudah diterapkan pada halaman manage-locker dan manage-categories.

## Tanggal
30 November 2025

## Perubahan yang Dilakukan

### 1. Custom Hook: `useManageItems.ts`
**Lokasi:** `lib/hooks/useManageItems.ts`

**Tanggung Jawab:**
- Mengelola state untuk items, categories, dan lockers
- Menangani operasi CRUD (Create, Read, Update, Delete) untuk items
- Menangani pembuatan kategori baru
- Menangani pembuatan multiple items sekaligus
- Manajemen loading states dan pesan error/success
- Invalidasi cache React Query setelah operasi

**Fitur Utama:**
- `createItem()` - Menambah barang tunggal
- `createMultipleItems()` - Menambah beberapa barang sekaligus
- `updateItem()` - Mengupdate barang
- `deleteItem()` - Menghapus barang
- `createCategory()` - Membuat kategori baru (inline dari form)
- Auto-clear success message setelah 3 detik

### 2. Komponen Form: `ItemForm.tsx`
**Lokasi:** `components/manage-items/ItemForm.tsx`

**Tanggung Jawab:**
- Menampilkan form untuk tambah/edit barang
- Menangani input validation
- Menampilkan kategori dropdown dengan search
- Menampilkan locker dropdown
- Support untuk multiple items (comma-separated)
- Individual quantity untuk multiple items
- Edit mode indicator di mobile
- Collapsible form dengan animasi

**Props:**
```typescript
interface ItemFormProps {
  categories: Category[];
  lockers: Locker[];
  isLoading: boolean;
  editingItem: Item | null;
  onSubmit: (formData) => Promise<boolean>;
  onSubmitMultiple?: (itemNames, itemQuantities, categoryId, lockerId, description) => Promise<boolean>;
  onCancel: () => void;
  onCreateCategory: (name: string) => Promise<Category | null>;
}
```

**Fitur Khusus:**
- Dropdown kategori dengan search dan create inline
- Multiple items dengan individual quantities
- Smooth animations dengan Framer Motion
- Responsive design (mobile-first)
- Auto-collapse pada mobile

### 3. Komponen List: `ItemList.tsx`
**Lokasi:** `components/manage-items/ItemList.tsx`

**Tanggung Jawab:**
- Menampilkan grid/list items
- Loading skeleton
- Empty state
- Action menu (edit/delete) per item
- Smooth animations

**Props:**
```typescript
interface ItemListProps {
  items: Item[];
  isLoading: boolean;
  activeCardId: string | null;
  onToggleActions: (itemId: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => Promise<void>;
}
```

**Fitur:**
- Grid layout responsive (1/2/3 kolom)
- Skeleton loading state
- Staggered animation saat load
- Hover effects
- Action dropdown menu

### 4. Page Component: `page.tsx` (Refactored)
**Lokasi:** `app/manage-items/page.tsx`

**Sebelum:**
- ~900 baris kode monolitik
- Semua logic dalam satu file
- Sulit di-maintain dan test
- Banyak duplikasi kode

**Sesudah:**
- ~100 baris kode
- Separation of concerns
- Reusable components
- Mudah di-test dan maintain
- Konsisten dengan halaman lain

**Struktur Baru:**
```tsx
export default function ManageItems() {
  // 1. Use custom hook
  const { items, categories, lockers, ... } = useManageItems();
  
  // 2. Local state untuk UI
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  // 3. Handler functions
  const handleSubmit = async (formData) => { ... };
  const handleEdit = (item) => { ... };
  const handleDelete = async (itemId) => { ... };
  
  // 4. Render dengan komponen
  return (
    <ProtectedRoute>
      <Sidebar />
      <Header />
      <AlertMessage />
      <ItemForm {...props} />
      <ItemList {...props} />
    </ProtectedRoute>
  );
}
```

### 5. Update AlertMessage Component
**Lokasi:** `components/AlertMessage.tsx`

**Perubahan:**
- Menambahkan Framer Motion animations
- Menggunakan CSS variables untuk theming
- Konsisten dengan komponen lain

## Standar Arsitektur yang Diikuti

### 1. Separation of Concerns
- **Hook**: Business logic dan state management
- **Component**: UI dan user interactions
- **Page**: Orchestration dan composition

### 2. Reusability
- Komponen dapat digunakan di halaman lain
- Hook dapat di-extend untuk kebutuhan berbeda

### 3. Maintainability
- Kode lebih mudah dibaca
- Testing lebih mudah (unit test per komponen)
- Bug lebih mudah dilacak

### 4. Consistency
- Naming convention konsisten
- Pattern yang sama dengan manage-locker dan manage-categories
- UI/UX yang konsisten

## Fitur yang Dipertahankan

✅ Semua fitur existing tetap berfungsi:
- Tambah barang tunggal
- Tambah multiple barang sekaligus (comma-separated)
- Individual quantity untuk multiple items
- Edit barang
- Delete barang
- Create kategori inline dari form
- Search kategori
- Dropdown locker
- Loading states
- Error handling
- Success messages
- Responsive design
- Animations

## UI/Layout yang Tidak Berubah

✅ Tampilan visual tetap sama:
- Layout 2 kolom (form di kiri, list di kanan)
- Form sticky pada desktop
- Mobile responsive
- Color scheme
- Typography
- Spacing
- Animations
- Empty states
- Loading skeletons

## Testing Checklist

- [ ] Tambah barang tunggal
- [ ] Tambah multiple barang
- [ ] Edit barang
- [ ] Delete barang
- [ ] Create kategori baru inline
- [ ] Search kategori
- [ ] Pilih locker
- [ ] Form validation
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Responsive di mobile
- [ ] Responsive di tablet
- [ ] Responsive di desktop

## Migrasi dari Versi Lama

Tidak ada breaking changes. Halaman langsung dapat digunakan tanpa perubahan pada:
- API endpoints
- Database schema
- Dependencies
- Environment variables

## Dependencies

Tidak ada dependency baru yang ditambahkan. Menggunakan:
- React 18+
- Next.js 14+
- Framer Motion (already installed)
- React Query / TanStack Query (already installed)

## Performance

**Improvements:**
- Code splitting lebih baik (komponen terpisah)
- React Query caching tetap optimal
- Re-render lebih terfokus (isolated components)

## Future Improvements

Potensi enhancement di masa depan:
1. Add unit tests untuk hook dan komponen
2. Add E2E tests dengan Playwright/Cypress
3. Add bulk operations (delete, edit)
4. Add export/import items
5. Add search/filter di item list
6. Add sorting options
7. Add pagination untuk large datasets

## Referensi

Refactoring ini mengikuti pola yang sama dengan:
- `docs/refactoring-manage-locker.md`
- `app/manage-locker/page.tsx`
- `app/manage-categories/page.tsx`
- `lib/hooks/useManageLockers.ts`
- `lib/hooks/useManageCategories.ts`
