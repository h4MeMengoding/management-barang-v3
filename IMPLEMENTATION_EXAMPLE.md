# PWA Implementation Example

## Form Submission dengan TanStack Query Mutation

### Example 1: Add Item Form

```tsx
"use client";

import { useCreateItem } from '@/lib/hooks/useQuery';
import { useItemsRealtime } from '@/lib/hooks/useRealtime';
import { useState } from 'react';

export default function AddItemForm() {
  // Enable realtime updates
  useItemsRealtime();
  
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    deskripsi: '',
    kategoriId: '',
    lockerId: '',
    harga: 0,
    quantity: 1
  });

  // Use mutation hook
  const createItem = useCreateItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call mutation - automatically invalidates queries & supports offline
      await createItem.mutateAsync(formData);
      
      // Reset form on success
      setFormData({
        nama: '',
        kode: '',
        deskripsi: '',
        kategoriId: '',
        lockerId: '',
        harga: 0,
        quantity: 1
      });
      
      alert('Item berhasil ditambahkan!');
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Gagal menambahkan item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nama Barang</label>
        <input
          type="text"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kode Barang</label>
        <input
          type="text"
          value={formData.kode}
          onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Harga</label>
        <input
          type="number"
          value={formData.harga}
          onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Add more fields... */}

      <button
        type="submit"
        disabled={createItem.isPending}
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        {createItem.isPending ? 'Menyimpan...' : 'Tambah Barang'}
      </button>

      {/* Show offline indicator */}
      {!navigator.onLine && (
        <p className="text-sm text-amber-600 text-center">
          📴 Offline - Data akan tersimpan saat online kembali
        </p>
      )}
    </form>
  );
}
```

### Example 2: Item List dengan Update/Delete

```tsx
"use client";

import { useItems, useUpdateItem, useDeleteItem } from '@/lib/hooks/useQuery';
import { useItemsRealtime } from '@/lib/hooks/useRealtime';

export default function ItemList() {
  // Enable realtime updates
  useItemsRealtime();
  
  // Fetch items
  const { data: items, isLoading, error } = useItems();
  
  // Mutations
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const handleUpdate = async (itemId: string, updates: any) => {
    try {
      await updateItem.mutateAsync({ id: itemId, data: updates });
      alert('Item berhasil diupdate!');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Gagal update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Hapus item ini?')) return;
    
    try {
      await deleteItem.mutateAsync(itemId);
      alert('Item berhasil dihapus!');
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Gagal hapus item');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {items?.map((item) => (
        <div key={item.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{item.nama}</h3>
          <p className="text-sm text-gray-600">{item.kode}</p>
          <p className="text-sm">Rp {item.harga.toLocaleString()}</p>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleUpdate(item.id, { quantity: item.quantity + 1 })}
              disabled={updateItem.isPending}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              +1 Quantity
            </button>
            
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deleteItem.isPending}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Locker Detail dengan Realtime

```tsx
"use client";

import { useLocker } from '@/lib/hooks/useQuery';
import { useLockerRealtime } from '@/lib/hooks/useRealtime';

export default function LockerDetailPage({ params }: { params: { id: string } }) {
  // Enable realtime for this locker
  useLockerRealtime(params.id);
  
  // Fetch locker with items
  const { data: locker, isLoading, error } = useLocker(params.id);

  if (isLoading) {
    return <div>Loading locker...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!locker) {
    return <div>Locker not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{locker.namaLoker}</h1>
      <p className="text-gray-600">{locker.kodeLoker}</p>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Items in Locker</h2>
        <div className="space-y-2">
          {locker.Item?.map((item) => (
            <div key={item.id} className="p-3 border rounded">
              <p className="font-medium">{item.nama}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Key Benefits

### 1. Automatic Query Invalidation
When you call `createItem.mutateAsync()`, the mutation automatically:
- Invalidates `items` query → triggers refetch
- Invalidates `stats` query → updates dashboard
- Updates UI immediately after success

### 2. Offline Support dengan Background Sync
- Jika offline saat submit form, request masuk ke Background Sync queue
- Service worker akan retry request otomatis saat online kembali
- Maksimal retry: 24 jam
- User bisa close browser, request tetap akan diproses

### 3. Realtime Updates
- `useItemsRealtime()` subscribe ke Supabase Realtime
- Saat ada user lain yang tambah/edit/hapus item → query otomatis refetch
- UI update tanpa perlu refresh page

### 4. Loading & Error States
```tsx
const createItem = useCreateItem();

// Loading state
createItem.isPending // true saat loading

// Error state
createItem.error // error object jika gagal

// Success state
createItem.isSuccess // true jika berhasil
```

### 5. Optimistic Updates (Optional)
Untuk UX yang lebih baik, bisa tambahkan optimistic update:

```tsx
const updateItem = useUpdateItem({
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.items(userId) });
    
    // Snapshot previous value
    const previousItems = queryClient.getQueryData(queryKeys.items(userId));
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.items(userId), (old) => {
      return old?.map((item) => 
        item.id === variables.id 
          ? { ...item, ...variables.data }
          : item
      );
    });
    
    // Return context with snapshot
    return { previousItems };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousItems) {
      queryClient.setQueryData(queryKeys.items(userId), context.previousItems);
    }
  }
});
```

## Testing Offline Mode

### 1. Test dengan Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Submit form → should see "Offline" indicator
5. Check Application > Background Sync → should see queued request
6. Set back to "Online"
7. Request should auto-retry and succeed

### 2. Test Service Worker Update
1. Edit `public/sw.js` (change cache version)
2. Reload page
3. Should see update notification
4. Click "Reload Sekarang"
5. New service worker activated

### 3. Test Realtime
1. Open app in 2 browser windows
2. Login as same user in both
3. Add item in window 1
4. Window 2 should auto-update without refresh

## Migration Guide

### Old Pattern (Manual Fetch)
```tsx
// ❌ Old way
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchItems() {
    setLoading(true);
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }
  fetchItems();
}, []);

const handleAdd = async (item) => {
  await fetch('/api/items', {
    method: 'POST',
    body: JSON.stringify(item)
  });
  // Manual refetch
  fetchItems();
};
```

### New Pattern (TanStack Query)
```tsx
// ✅ New way
const { data: items, isLoading } = useItems();
const createItem = useCreateItem();

const handleAdd = async (item) => {
  await createItem.mutateAsync(item);
  // Auto-invalidates & refetches!
};
```

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               User Interface                     │
│  (React Components with TanStack Query Hooks)   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          TanStack Query Layer                    │
│  - Client-side caching (60s staleTime)          │
│  - Automatic invalidation after mutations        │
│  - Loading/error states                          │
│  - Optimistic updates (optional)                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Service Worker (sw.js)                 │
│  - NetworkOnly for /api/* (no caching)          │
│  - CacheFirst for static assets                 │
│  - StaleWhileRevalidate for pages               │
│  - BackgroundSync for failed POST/PUT/DELETE    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              API Routes                          │
│  /api/items, /api/lockers, /api/categories      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Supabase + Prisma                        │
│  - Database operations                           │
│  - Realtime subscriptions                        │
└─────────────────────────────────────────────────┘
```

## Why This Architecture?

### Network Only for API Routes
- **Problem**: Caching API responses = stale data
- **Solution**: Always fetch fresh data from server
- **Benefit**: Users always see latest data, no cache invalidation issues

### TanStack Query for Client Caching
- **Problem**: Multiple components fetching same data = redundant requests
- **Solution**: Shared cache at client level with smart invalidation
- **Benefit**: Reduce server load, instant UI updates, automatic refetch

### Background Sync for Offline
- **Problem**: User submits form offline → request lost
- **Solution**: Queue failed requests, retry when online
- **Benefit**: Zero data loss, works offline, automatic retry

### Stale-While-Revalidate for Pages
- **Problem**: Slow page loads
- **Solution**: Show cached page instantly, update in background
- **Benefit**: Fast page loads, always fresh content

### Hybrid Realtime
- **Problem**: Polling = server load, pure realtime = complexity
- **Solution**: Supabase Realtime for critical data (items/lockers), TanStack Query polling for non-critical (categories)
- **Benefit**: Balance between performance and simplicity
