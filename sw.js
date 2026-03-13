const CACHE_NAME = 'ge-ix-bbs-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/pos.html',
  '/index.html',
  '/main.html',
  '/assets/css/style.css',
  '/assets/js/auth.js',
  '/assets/js/config.js',
  '/assets/js/pos.js',
  '/assets/images/logo.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://code.jquery.com/jquery-3.7.0.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js'
];

// Install and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate SW and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const {request} = event;

  // Only cache GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Optional: fallback page
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
