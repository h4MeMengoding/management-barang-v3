// Service Worker with Workbox
// Version: 2.0.0

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { 
  registerRoute, 
  setCacheNameDetails, 
  clientsClaim 
} = workbox.core;

const { 
  NetworkFirst, 
  CacheFirst, 
  StaleWhileRevalidate,
  NetworkOnly 
} = workbox.strategies;

const { 
  CacheableResponsePlugin 
} = workbox.cacheableResponse;

const { 
  ExpirationPlugin 
} = workbox.expiration;

const {
  BackgroundSyncPlugin
} = workbox.backgroundSync;

// Set cache name details
setCacheNameDetails({
  prefix: 'mb-app',
  suffix: 'v2',
  precache: 'precache',
  runtime: 'runtime'
});

// Claim clients immediately
clientsClaim();

// Skip waiting and activate immediately
self.skipWaiting();

// ============================================
// PRECACHE CRITICAL PAGES FOR OFFLINE
// ============================================
const CRITICAL_PAGES = [
  '/',
  '/dashboard',
  '/addItem',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mb-app-pages-v2').then((cache) => {
      return cache.addAll(CRITICAL_PAGES.map(url => new Request(url, { cache: 'reload' })));
    })
  );
});

// ============================================
// STRATEGY 1: STATIC ASSETS - CACHE FIRST
// ============================================
// CSS, JS, Web Fonts - Cache First with 1 year expiration
registerRoute(
  ({ request, url }) => {
    return (
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      url.pathname.startsWith('/_next/static/')
    );
  },
  new CacheFirst({
    cacheName: 'mb-app-static-v2',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        purgeOnQuotaError: true
      })
    ]
  })
);

// ============================================
// STRATEGY 2: IMAGES - CACHE FIRST
// ============================================
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'mb-app-images-v2',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// ============================================
// STRATEGY 3: API ROUTES - NETWORK ONLY
// ============================================
// All /api/* requests go to network only (no cache)
// This ensures realtime data from Supabase
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly()
);

// Also exclude Supabase requests from cache
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkOnly()
);

// ============================================
// STRATEGY 4: PAGES - STALE WHILE REVALIDATE
// ============================================
// HTML pages use Stale-While-Revalidate for fast load + fresh data
registerRoute(
  ({ request, url }) => {
    return (
      request.destination === 'document' ||
      (request.method === 'GET' && 
       request.headers.get('accept')?.includes('text/html'))
    );
  },
  new StaleWhileRevalidate({
    cacheName: 'mb-app-pages-v2',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// ============================================
// BACKGROUND SYNC FOR FORM SUBMISSIONS
// ============================================
const bgSyncPlugin = new BackgroundSyncPlugin('formSubmissionQueue', {
  maxRetentionTime: 24 * 60, // Retry for max 24 hours (in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        console.log('Background sync success:', entry.request.url);
      } catch (error) {
        console.error('Background sync failed:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Register background sync for POST/PUT/DELETE to /api/items
registerRoute(
  ({ url, request }) => {
    return (
      url.pathname.startsWith('/api/items') &&
      (request.method === 'POST' || 
       request.method === 'PUT' || 
       request.method === 'DELETE')
    );
  },
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

registerRoute(
  ({ url, request }) => {
    return (
      url.pathname.startsWith('/api/items') &&
      (request.method === 'POST' || 
       request.method === 'PUT' || 
       request.method === 'DELETE')
    );
  },
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'PUT'
);

registerRoute(
  ({ url, request }) => {
    return (
      url.pathname.startsWith('/api/items') &&
      (request.method === 'POST' || 
       request.method === 'PUT' || 
       request.method === 'DELETE')
    );
  },
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'DELETE'
);

// ============================================
// OFFLINE FALLBACK
// ============================================
// Show offline page for navigation requests when offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html').then((response) => {
          return response || new Response('Offline - Please check your connection', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
    );
  }
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload;
    event.waitUntil(
      caches.open('mb-app-runtime-v2').then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

// ============================================
// CLEAN OLD CACHES
// ============================================
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [
    'mb-app-static-v2',
    'mb-app-images-v2', 
    'mb-app-pages-v2',
    'mb-app-runtime-v2'
  ];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('Service Worker loaded with Workbox strategies');
