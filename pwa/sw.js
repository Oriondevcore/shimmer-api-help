self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('open-kj-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/sw.js',
        '/style.css'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  // First try to get from cache, then fall back to network
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if available
      if (response) {
        return response;
      }
      // Otherwise fetch from network
      return fetch(event.request);
    })
  );
});

// Handle API requests - don't cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    // Network only for API requests
    event.respondWith(fetch(event.request));
  }
});