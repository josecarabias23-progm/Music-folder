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

// Fetch event: Bypass API & Cross-Origin requests, Cache-First ONLY for local app static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Omitir inmediatamente peticiones que NO sean GET o que sean de origen cruzado (ej. backend en Render)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // 2. Omitir inmediatamente peticiones a rutas que NO correspondan a assets estáticos o navegación de la app
  const isStaticAsset =
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.svg' ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/');

  const isNavigation = event.request.mode === 'navigate';

  if (!isStaticAsset && !isNavigation) {
    return; // El navegador maneja la petición de forma 100% nativa sin intervención del worker
  }

  // 3. Estrategia Cache-First limpia (Sin doble fetch ni peticiones duplicadas a la red)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Retorna desde caché inmediatamente con 0 peticiones secundarias
      }

      return fetch(event.request)
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
          if (isNavigation) {
            return caches.match('/index.html');
          }
          return null;
        });
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
