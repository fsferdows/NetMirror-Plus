// MovieBox Plus - Production Progressive Web App (PWA) Service Worker
const CACHE_NAME = 'moviebox-plus-v20261120_v5';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css?v=20261120_v5',
  '/app.js?v=20261120_v5',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/monetization-config.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('PWA Pre-cache item warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests
  if (req.method !== 'GET') return;

  // Ignore video streams, third-party embeds, and ads
  if (
    url.hostname.includes('vidlink.pro') ||
    url.hostname.includes('smashystream.com') ||
    url.hostname.includes('multiembed.mov') ||
    url.hostname.includes('2embed.cc') ||
    url.hostname.includes('autoembed.cc') ||
    url.hostname.includes('vidsrc.to') ||
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('hakunaymatata.com') ||
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.m3u8')
  ) {
    return;
  }

  // Network-First for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Stale-While-Revalidate for app shell & static assets
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
