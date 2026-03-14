const CACHE_NAME = 'rixal-pos-cache-v2';
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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('Failed to cache', url, err);
        }
      }
    })()
  );
});
