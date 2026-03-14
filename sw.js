const CACHE_NAME = 'rixal-pos-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/pos.html',
  '/manifest.json',
  '/assets/js/config.js',
  '/assets/js/auth.js',
  '/assets/js/pos.js',
  '/assets/images/logo.png',
  '/assets/vendor/bootstrap.min.css',
  '/assets/vendor/bootstrap.bundle.min.js',
  '/assets/vendor/bootstrap-icons.css',
  '/assets/vendor/jquery.min.js',
  '/assets/vendor/toastr.min.css',
  '/assets/vendor/toastr.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
