// Service Worker Minimal untuk Syarat PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch (agar aplikasi tetap jalan online)
  e.respondWith(fetch(e.request));
});