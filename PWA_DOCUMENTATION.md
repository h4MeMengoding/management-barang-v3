# PWA Architecture & Caching Strategy Documentation

## Table of Contents
1. [Overview](#overview)
2. [Service Worker Caching Strategies](#service-worker-caching-strategies)
3. [TanStack Query Configuration](#tanstack-query-configuration)
4. [Background Sync](#background-sync)
5. [Realtime Updates](#realtime-updates)
6. [Offline Support](#offline-support)
7. [Testing Guide](#testing-guide)

---

## Overview

Aplikasi ini menggunakan PWA (Progressive Web App) architecture dengan strategi caching yang sophisticated untuk mencapai:
- ⚡ **Fast page loads** - Instant navigation dengan cached pages
- 📊 **Fresh data** - Selalu fetch data terbaru dari server
- 📴 **Offline support** - Aplikasi tetap berfungsi tanpa internet
- 🔄 **Realtime updates** - UI auto-update saat data berubah
- 💾 **Zero data loss** - Background sync untuk offline form submissions

### Architecture Layers

```
┌──────────────────────────────────────────────────────────┐
│                     User Interface                        │
│              (React 19 + Next.js 16)                     │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                TanStack Query Layer                       │
│  • Client-side cache with smart invalidation             │
│  • Automatic refetch after mutations                     │
│  • 60s staleTime for data freshness                      │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Supabase Realtime Layer                      │
│  • Real-time subscriptions for items & lockers           │
│  • Automatic query invalidation on DB changes            │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│               Service Worker (Workbox)                    │
│  • NetworkOnly for /api/* → Always fresh data            │
│  • CacheFirst for static assets → Fast loads             │
│  • StaleWhileRevalidate for pages → Instant navigation   │
│  • BackgroundSync for offline submissions                │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                   Network Layer                           │
│           API Routes + Supabase Database                  │
└──────────────────────────────────────────────────────────┘
```

---

## Service Worker Caching Strategies

### 1. **NetworkOnly** - API Routes

```javascript
// public/sw.js
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.origin.includes('supabase.co'),
  new NetworkOnly(),
  'POST'
);
```

**Why NetworkOnly for API?**
- ❌ **Problem with caching API**: Jika cache API response, user akan lihat data lama (stale)
- ✅ **Solution**: Selalu fetch dari server, tidak ada caching sama sekali
- 📊 **Result**: User selalu lihat data terbaru, zero staleness

**Use Cases:**
- `GET /api/items` - Fetch items terbaru
- `POST /api/items` - Create item baru
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- All Supabase API calls

**Trade-off:**
- Pro: Data selalu fresh, no cache invalidation complexity
- Con: Tidak bisa offline untuk fetch data (but we have TanStack Query cache at client level)

---

### 2. **CacheFirst** - Static Assets

```javascript
// CSS, JS, Fonts
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'mb-app-static-v2',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'mb-app-images-v2',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);
```

**Why CacheFirst for Static Assets?**
- 📦 **Immutable files**: Static assets jarang berubah (versioned dengan hash)
- ⚡ **Instant loads**: Load dari cache = instant, no network delay
- 💾 **Bandwidth saving**: Tidak perlu download ulang file yang sama

**Use Cases:**
- CSS files: `/_next/static/css/...`
- JavaScript bundles: `/_next/static/chunks/...`
- Fonts: `/fonts/...`
- Images: `/images/...`, `/favicon/...`

**Expiration:**
- Static assets: 1 year (safe karena versioned)
- Images: 30 days (bisa berubah)
- Max entries: 100 (auto-delete oldest jika exceeded)

---

### 3. **StaleWhileRevalidate** - HTML Pages

```javascript
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'mb-app-pages-v2',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);
```

**Why StaleWhileRevalidate for Pages?**
- ⚡ **Instant navigation**: Show cached page immediately
- 🔄 **Background update**: Fetch fresh page in background
- 🎯 **Best of both worlds**: Speed + Freshness

**How It Works:**
1. User navigates to `/dashboard`
2. Service worker returns cached version **instantly** (if exists)
3. Simultaneously, fetch fresh version from network
4. When fresh version arrives, update cache
5. Next visit gets the updated version

**Use Cases:**
- Navigation requests: `/dashboard`, `/locker/123`, `/addItem`
- Server-rendered pages
- Static pages

**Benefits:**
- First visit: Normal speed (fetch from network)
- Subsequent visits: Instant (from cache)
- Always eventually consistent

---

### 4. **Background Sync** - Offline Form Submissions

```javascript
const bgSyncPlugin = new BackgroundSyncPlugin('formSubmissionQueue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/items'),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);
```

**Why Background Sync?**
- 📴 **Offline resilience**: Form submit tetap berhasil meski offline
- 🔄 **Automatic retry**: Service worker retry otomatis saat online
- 💾 **Zero data loss**: Data tidak hilang meski close browser

**How It Works:**
1. User submit form `/addItem` saat offline
2. Request fails (no network)
3. Service worker catches failed request
4. Add to Background Sync queue
5. Browser triggers sync event saat online kembali
6. Service worker replay request
7. Success! Data tersimpan

**Use Cases:**
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

**Configuration:**
- Max retention: 24 hours (after that, expired)
- Queue name: `formSubmissionQueue`
- Auto-retry with exponential backoff

**Important Notes:**
- ⚠️ Background Sync hanya untuk mutations (POST/PUT/DELETE), bukan GET
- ⚠️ User bisa close tab/browser, request tetap akan diproses
- ⚠️ Jika device mati > 24 jam, request expired (acceptable trade-off)

---

### 5. **Precaching** - Critical Pages

```javascript
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/dashboard', revision: '1' },
  { url: '/addItem', revision: '1' },
  { url: '/offline.html', revision: '1' },
]);
```

**Why Precache Critical Pages?**
- ⚡ **Instant first load**: Critical pages cached during service worker install
- 📴 **Offline-first**: These pages guaranteed available offline
- 🎯 **Priority routes**: Most important pages for user

**Precached Routes:**
1. `/` - Homepage
2. `/dashboard` - Main dashboard
3. `/addItem` - Add item form (offline support priority)
4. `/offline.html` - Custom offline fallback

**When Precaching Happens:**
- During service worker installation
- On first visit or service worker update
- Automatic cache update when revision changes

---

### 6. **Offline Fallback**

```javascript
setCatchHandler(({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  return Response.error();
});
```

**Why Custom Offline Page?**
- 🎨 **Better UX**: Show branded offline page instead of browser's default
- 📱 **PWA feel**: Feels like native app, not broken website
- 💡 **User guidance**: Tell user what pages are available offline

**Features of `/offline.html`:**
- SVG cloud icon with animation
- "Anda Sedang Offline" message
- Button to go to dashboard (cached)
- Auto-reload when connection restored
- Tips about offline-available pages

---

## TanStack Query Configuration

### Query Provider Setup

```tsx
// components/QueryProvider.tsx
<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Default Configuration:**
```javascript
{
  staleTime: 1000 * 60,        // 60 seconds - data considered fresh
  gcTime: 1000 * 60 * 5,       // 5 minutes - unused data garbage collected
  retry: 2,                     // Retry failed requests 2 times
  refetchOnWindowFocus: true,   // Refetch when user returns to tab
  refetchOnReconnect: true,     // Refetch when internet reconnected
  refetchOnMount: false,        // Don't refetch if data still fresh
}
```

### Why These Settings?

#### `staleTime: 60 seconds`
- **Problem**: Constant refetching = server overload
- **Solution**: Consider data fresh for 60s, don't refetch within that time
- **Benefit**: Reduce server load, faster UI (no loading spinners)

#### `gcTime: 5 minutes`
- **Problem**: Unused cached data = memory leak
- **Solution**: Delete cached data after 5min of no usage
- **Benefit**: Free memory, prevent bloat

#### `retry: 2`
- **Problem**: Temporary network issues cause failed requests
- **Solution**: Retry 2 times before showing error
- **Benefit**: Better resilience, fewer user-facing errors

#### `refetchOnWindowFocus: true`
- **Problem**: User switches tabs, data might be stale when return
- **Solution**: Auto-refetch when user returns to tab
- **Benefit**: Always show fresh data when user is actively using app

#### `refetchOnReconnect: true`
- **Problem**: App was offline, might have stale data
- **Solution**: Auto-refetch when internet connection restored
- **Benefit**: Seamless transition from offline to online

---

### Query Keys Structure

```typescript
export const queryKeys = {
  items: (userId: string) => ['items', userId] as const,
  item: (itemId: string) => ['item', itemId] as const,
  lockers: (userId: string) => ['lockers', userId] as const,
  locker: (lockerId: string) => ['locker', lockerId] as const,
  categories: (userId: string) => ['categories', userId] as const,
  stats: (userId: string) => ['stats', userId] as const,
};
```

**Why Structured Query Keys?**
- 🎯 **Precise invalidation**: Invalidate specific queries only
- 🔍 **Easy debugging**: Clear query names in DevTools
- 📦 **Type safety**: TypeScript knows query key structure

**Invalidation Examples:**
```typescript
// Invalidate all items queries
queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });

// Invalidate specific item
queryClient.invalidateQueries({ queryKey: queryKeys.item(itemId) });

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
queryClient.invalidateQueries({ queryKey: queryKeys.stats(userId) });
```

---

### Automatic Mutation Invalidation

```typescript
export function useCreateItem() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  return useMutation({
    mutationFn: async (data: CreateItemInput) => {
      const res = await fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      // Automatic invalidation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.items(user!.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.stats(user!.id) 
      });
    },
  });
}
```

**Why Auto-Invalidation?**
- 🔄 **Automatic refetch**: UI updates without manual work
- 🎯 **Smart invalidation**: Only refetch affected queries
- 💡 **Developer experience**: No need to manually call refetch()

**Invalidation Strategy:**
- Create item → Invalidate `items` + `stats`
- Update item → Invalidate specific `item` + `items` + `stats`
- Delete item → Invalidate `items` + `stats`
- Update locker → Invalidate specific `locker` + `lockers`

---

## Background Sync

### How Background Sync Works

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                           │
│              (Submit form while offline)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Fetch Request Fails                      │
│              (Network error caught)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│            BackgroundSync Plugin                         │
│    • Serialize request (method, URL, body, headers)     │
│    • Store in IndexedDB queue                           │
│    • Register sync event with browser                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              User Can Close Browser                      │
│         (Request persisted in IndexedDB)                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼ (When online)
┌─────────────────────────────────────────────────────────┐
│            Browser Fires Sync Event                      │
│           (Even if tab/browser closed)                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│          Service Worker Replays Request                  │
│    • Fetch request from IndexedDB queue                 │
│    • Retry with exponential backoff                     │
│    • Remove from queue on success                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Success! ✅                             │
│            Data saved to database                        │
└─────────────────────────────────────────────────────────┘
```

### Testing Background Sync

#### Method 1: Chrome DevTools
```
1. Open DevTools (F12)
2. Go to Network tab
3. Set "Online" → "Offline"
4. Submit form in /addItem
5. Go to Application > Background Sync
6. Should see queued sync: "workbox-background-sync:formSubmissionQueue"
7. Set back to "Online"
8. Sync should fire automatically
9. Check Network tab - POST request replayed
10. Check /dashboard - new item appears
```

#### Method 2: Real Offline Test
```
1. Turn off WiFi/Mobile data
2. Submit form
3. Close browser completely
4. Turn WiFi back on
5. Browser automatically replays request
6. Check database - item saved!
```

---

## Realtime Updates

### Supabase Realtime Integration

```typescript
export function useItemsRealtime() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  useEffect(() => {
    const channel = supabase
      .channel('items-changes')
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'Item',
        filter: `userId=eq.${user.id}`,
      }, (payload) => {
        // Invalidate query to trigger refetch
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.items(user.id) 
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
```

### Why Hybrid Realtime Approach?

**Supabase Realtime for:**
- ✅ Items (high frequency updates)
- ✅ Lockers (important for multi-user)

**TanStack Query Polling for:**
- ✅ Categories (low frequency updates)
- ✅ Stats (can tolerate slight delay)

**Benefits:**
- 🎯 **Targeted realtime**: Only critical data gets realtime updates
- 💰 **Cost effective**: Fewer realtime connections = lower cost
- ⚡ **Performance**: Reduce server load from polling
- 🛠️ **Simplicity**: No need for realtime everywhere

### Realtime Flow

```
User A adds item
      │
      ▼
  Save to DB
      │
      ▼
Postgres TRIGGER
      │
      ▼
Supabase Realtime
      │
      ├─────────────┐
      ▼             ▼
  User A      User B (listening)
  (mutate)    (useItemsRealtime)
      │             │
      │             ▼
      │    Invalidate items query
      │             │
      │             ▼
      │         Auto refetch
      │             │
      └─────┬───────┘
            ▼
     Both see new item! ✨
```

### Testing Realtime

```
1. Open app in 2 browser windows
2. Login as same user in both
3. Window 1: Add new item
4. Window 2: Should see item appear automatically (no refresh needed)
5. Window 1: Delete item
6. Window 2: Item disappears automatically
```

---

## Offline Support

### Offline-First Strategy

**What Works Offline:**
✅ Navigate to precached pages (/, /dashboard, /addItem)
✅ View previously loaded pages (StaleWhileRevalidate cache)
✅ View cached static assets (images, CSS, JS)
✅ Submit forms (queued via Background Sync)
✅ View TanStack Query cached data

**What Doesn't Work Offline:**
❌ Fetch new data from API (by design - NetworkOnly)
❌ Navigate to never-visited pages (not in cache)
❌ Load uncached images
❌ Real-time updates (no network for Supabase)

### Offline UI Indicators

```tsx
// Show offline badge
{!navigator.onLine && (
  <div className="bg-amber-500 text-white px-4 py-2 text-center">
    📴 Offline - Data akan tersimpan saat online kembali
  </div>
)}

// Disable buttons during offline
<button
  disabled={!navigator.onLine}
  className="..."
>
  {!navigator.onLine ? 'Offline' : 'Simpan'}
</button>
```

### Offline Testing Checklist

- [ ] Navigate to /dashboard while offline → Should load from cache
- [ ] Submit form on /addItem while offline → Should queue request
- [ ] Go back online → Request should auto-replay
- [ ] Navigate to uncached page while offline → Should show /offline.html
- [ ] Check Application > Cache Storage → Should see cached resources
- [ ] Check Application > Background Sync → Should see queued requests

---

## Testing Guide

### 1. Service Worker Testing

#### Test Cache Strategies
```bash
# CacheFirst (Static Assets)
1. Load page (online)
2. Go offline
3. Refresh page
4. CSS/JS should load (from cache)

# StaleWhileRevalidate (Pages)
1. Visit /dashboard (online)
2. Go offline
3. Navigate away and back to /dashboard
4. Page loads instantly (from cache)

# NetworkOnly (API)
1. Load /dashboard (online) - items displayed
2. Go offline
3. Refresh page
4. Page loads but items don't (API not cached)
```

#### Test Precaching
```bash
# Check precached files
1. DevTools > Application > Cache Storage
2. Open "workbox-precache-v2-..."
3. Should see: /, /dashboard, /addItem, /offline.html
```

#### Test Offline Fallback
```bash
1. Go offline
2. Navigate to never-visited page (e.g., /locker/random-id)
3. Should show /offline.html with custom UI
4. Click "Kembali ke Dashboard"
5. Should navigate to /dashboard (precached)
```

---

### 2. TanStack Query Testing

#### Test Query Caching
```tsx
// Open React Query DevTools (bottom-left icon)
1. Click "Items" query
2. Check "Data" tab - should see fetched items
3. Check "Observers" - should see which components using this query
4. Navigate away and back
5. Should see "staleTime" countdown
6. After 60s, query marked as "stale" and refetches
```

#### Test Mutation Invalidation
```bash
1. Open DevTools > Console
2. Open React Query DevTools
3. Watch "items" query state
4. Submit form to create item
5. Should see:
   - "items" query marked as "invalid"
   - Auto refetch triggered
   - New item appears in list
```

#### Test Refetch on Window Focus
```bash
1. Load /dashboard with items
2. Switch to another tab
3. Wait 1 minute
4. Switch back to app tab
5. Should see loading spinner briefly
6. Items refetched with latest data
```

---

### 3. Background Sync Testing

#### Test Offline Form Submission
```bash
1. Open DevTools > Network
2. Set to "Offline"
3. Go to /addItem
4. Fill form and submit
5. Should see: "📴 Offline - Data akan tersimpan saat online kembali"
6. Open DevTools > Application > Background Sync
7. Should see: "workbox-background-sync:formSubmissionQueue"
8. Set Network back to "Online"
9. Wait a few seconds
10. Check /dashboard - item should appear!
```

#### Test Browser Close During Offline
```bash
1. Turn off WiFi
2. Submit form on /addItem
3. Close browser completely
4. Turn WiFi back on
5. Open browser (don't need to open app)
6. Browser auto-replays request in background
7. Open app and check /dashboard - item saved!
```

---

### 4. Realtime Testing

#### Test Multi-User Sync
```bash
1. Open app in Chrome (User A)
2. Open app in Firefox (User A - same account)
3. Chrome: Add item
4. Firefox: Should auto-update (no refresh)
5. Firefox: Delete item
6. Chrome: Should auto-update
```

#### Test Realtime Hooks
```tsx
// Add console logs to useItemsRealtime
useEffect(() => {
  const channel = supabase
    .channel('items-changes')
    .on('postgres_changes', { ... }, (payload) => {
      console.log('🔥 Realtime event:', payload);
      // Should log when item created/updated/deleted
    });
}, []);
```

---

### 5. Performance Testing

#### Test Cache Hit Rate
```bash
# Using Chrome DevTools
1. DevTools > Network
2. Check "Disable cache" option
3. Load page - note load time
4. Uncheck "Disable cache"
5. Reload page
6. Should see:
   - "(from ServiceWorker)" in Size column
   - Much faster load time
```

#### Test TanStack Query Deduplication
```tsx
// Open same page in multiple components
<ItemList />    // useItems()
<ItemCount />   // useItems()
<ItemStats />   // useItems()

// Only 1 network request should fire (query deduplication)
// Check DevTools > Network - should see single /api/items request
```

---

### 6. Error Handling Testing

#### Test Network Errors
```bash
1. Set Network throttling to "Slow 3G"
2. Submit form
3. Should see retry attempts (2 retries)
4. If all fail, should show error message
```

#### Test Invalid Data
```bash
1. Submit form with invalid data
2. API returns 400 error
3. Should NOT be queued in Background Sync
4. Should show error message to user immediately
```

---

## Troubleshooting

### Service Worker Not Updating

**Problem:** Code changed but old service worker still active

**Solution:**
```bash
1. DevTools > Application > Service Workers
2. Check "Update on reload"
3. Or click "Unregister" and reload
4. Or hard refresh: Ctrl + Shift + R
```

### Cache Not Clearing

**Problem:** Old cached data still showing

**Solution:**
```bash
# Change cache version in sw.js
const CACHE_VERSION = 'v3'; // was v2

# Or manually clear in DevTools
1. Application > Cache Storage
2. Right-click > Delete all
3. Reload page
```

### Background Sync Not Firing

**Problem:** Offline form submission not replayed

**Solution:**
```bash
# Check sync event in DevTools
1. Application > Background Sync
2. Should see registered sync
3. If not, check Console for errors
4. Verify BackgroundSyncPlugin configured correctly

# Manual trigger
navigator.serviceWorker.ready.then(reg => {
  reg.sync.register('formSubmissionQueue');
});
```

### TanStack Query Not Refetching

**Problem:** Data not updating after mutation

**Solution:**
```tsx
// Check invalidation in mutation
onSuccess: () => {
  queryClient.invalidateQueries({ 
    queryKey: queryKeys.items(userId) 
  });
  // Make sure queryKey matches exactly!
}

// Or manually refetch
queryClient.refetchQueries({ 
  queryKey: queryKeys.items(userId) 
});
```

### Realtime Not Working

**Problem:** Changes not appearing in real-time

**Solution:**
```bash
# Check Supabase Realtime enabled
1. Supabase Dashboard > Database > Replication
2. Enable replication for "Item" and "Locker" tables

# Check filter
.on('postgres_changes', {
  filter: `userId=eq.${user.id}` // Make sure userId correct
})

# Check subscription status
channel.subscribe((status) => {
  console.log('Subscription status:', status);
  // Should see "SUBSCRIBED"
});
```

---

## Performance Metrics

### Target Metrics

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s  
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1

### With PWA Optimizations:

- **Repeat visit FCP:** < 0.5s (from cache)
- **Navigation speed:** Instant (StaleWhileRevalidate)
- **API latency:** ~200-500ms (no API cache, always fresh)
- **Realtime latency:** < 100ms (Supabase Realtime)

---

## Best Practices

### DO ✅

- Use TanStack Query for ALL data fetching
- Enable realtime hooks in components that need live updates
- Show loading states during mutations (`isPending`)
- Show offline indicators when `!navigator.onLine`
- Invalidate related queries after mutations
- Use structured query keys
- Precache critical pages
- Test offline mode regularly

### DON'T ❌

- Don't cache API responses in service worker
- Don't manual fetch() without TanStack Query
- Don't forget to cleanup realtime subscriptions
- Don't invalidate too many queries at once (performance)
- Don't rely on offline for never-cached pages
- Don't forget error handling in mutations
- Don't skip testing Background Sync
- Don't mix manual refetch with auto-invalidation

---

## Summary

### The Complete Picture

1. **Service Worker (Network Level)**
   - Static assets → CacheFirst (instant loads)
   - Pages → StaleWhileRevalidate (instant navigation)
   - API → NetworkOnly (always fresh)
   - Failed requests → BackgroundSync (offline resilience)

2. **TanStack Query (App Level)**
   - Client-side cache with 60s freshness
   - Automatic invalidation after mutations
   - Deduplicated requests
   - Built-in loading/error states

3. **Supabase Realtime (Data Level)**
   - Real-time subscriptions for critical data
   - Automatic query invalidation on DB changes
   - Multi-user sync without polling

4. **Result**
   - ⚡ Fast: Instant page loads from cache
   - 📊 Fresh: Always fetch latest data from API
   - 📴 Resilient: Works offline with Background Sync
   - 🔄 Realtime: Multi-user updates without refresh
   - 💾 Safe: Zero data loss with queued submissions

This architecture achieves the perfect balance between **speed**, **freshness**, and **reliability** for a production-ready PWA! 🚀
