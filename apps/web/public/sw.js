const CACHE_NAME = 'music-folder-cache-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event: Pre-cache static core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache non-fatal warning:', err);
      });
    })
  );
});

// Activate event: Clean up legacy caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Bypass API & Cross-Origin requests, Stale-while-Revalidate ONLY for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass Service Worker completamente para:
  // 1. Métodos distintos de GET (POST, PUT, DELETE, PATCH, OPTIONS)
  // 2. Peticiones de origen cruzado (ej. backend en Render o localhost:3001)
  // 3. Rutas conocidas del API backend (/api, /sheets, /instruments, /records, /forums, /groups, /notifications, /public-scores, /auth, /health)
  const isApiRoute =
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/sheets') ||
    url.pathname.startsWith('/instruments') ||
    url.pathname.startsWith('/records') ||
    url.pathname.startsWith('/forums') ||
    url.pathname.startsWith('/groups') ||
    url.pathname.startsWith('/notifications') ||
    url.pathname.startsWith('/public-scores') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/health');

  if (event.request.method !== 'GET' || isApiRoute) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request fails, return cached response or index.html for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || cachedResponse;
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client (e.g. SKIP_WAITING to update immediately)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting received. Activating new version immediately...');
    self.skipWaiting();
  }
});
