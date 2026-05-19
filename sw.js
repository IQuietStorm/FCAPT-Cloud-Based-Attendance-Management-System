const CACHE_NAME = 'fcapt-portal-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'student_portal.html',
  'lecturer_dashboard.html',
  'logo.svg',
  'logo.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install Event - Caching the structural shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline asset structural shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning old caches during app version upgrades
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing obsolete structural cache version:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Strategic routing for asset delivery and API insulation
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Isolate Supabase cloud database/auth API traffic to prevent static caching issues
  if (requestUrl.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Network disconnected. Real-time sync unavailable." }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Cache-First strategy for application assets (UI structure, icons, stylesheets)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Dynamically add new page navigations or local assets to the cache
        if (networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback response if user is entirely offline trying to hit an uncached route
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('index.html');
      }
    })
  );
});
