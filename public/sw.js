// Service Worker — LevelUP
// Handles push notifications + offline app shell caching.

const CACHE_NAME = 'levelup-v2';
const OFFLINE_URL = '/';

// ─── Install: pre-cache root as ultimate fallback ────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

// ─── Activate: clean stale caches ────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
//
// Navigation (HTML):  network-first — cache on success, serve from cache offline.
// Static JS/CSS:      cache-first — immutable hashed filenames, cache indefinitely.
// Everything else:    pass through (Supabase, API, etc.).

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Static Next.js bundles — cache-first (hashed filenames are immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Navigation requests — network-first, cache the shell for offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // Everything else (Supabase, API, push, etc.) — pass through untouched.
  // Offline errors are handled in-app (home-client loadError state).
});

// ─── Push notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'LevelUP', {
      body: data.body ?? 'Time to complete your daily habits!',
      data: { url: data.url ?? '/home' },
      tag: data.tag ?? 'levelup',
      vibrate: [100, 50, 100],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/home';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const open = list.find((c) => c.url.includes(url) && 'focus' in c);
        return open ? open.focus() : clients.openWindow(url);
      }),
  );
});
