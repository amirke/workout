// Service Worker — PWA + אופליין
// v6 — stale-while-revalidate for images, always-fresh for JS/HTML

const CACHE = 'workout-v9';

// התקנה — אל תחסום על ASSETS, תפוס שליטה מיד
self.addEventListener('install', () => self.skipWaiting());

// הפעלה — מחק cache ישן + תפוס לקוחות
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── אסטרטגיות cache ──────────────────────────────────

// JS / HTML / JSON — תמיד מהרשת (גרסה עדכנית תמיד)
function networkFirst(req) {
  return fetch(req)
    .then(res => {
      caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    })
    .catch(() => caches.match(req));
}

// תמונות — stale-while-revalidate:
// מחזיר מהcache מיד (מהיר), ומרענן ברקע לפעם הבאה.
// עובד גם כשהמשתמש עושה pull-to-refresh!
function staleWhileRevalidate(req) {
  var cachePromise = caches.open(CACHE);

  return cachePromise.then(function(cache) {
    return cache.match(req).then(function(cached) {
      // תמיד שלח בקשה לרשת ברקע לרענון
      var fetchPromise = fetch(req).then(function(res) {
        if (res && res.status === 200) {
          cache.put(req, res.clone());
        }
        return res;
      }).catch(function() { return null; });

      // החזר מה-cache מיד אם יש, אחרת חכה לרשת
      return cached || fetchPromise;
    });
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  var url = e.request.url;

  // JS, HTML, JSON → תמיד מהרשת
  if (/\.(js|html|json)(\?|$)/.test(url)) {
    e.respondWith(networkFirst(e.request));
    return;
  }

  // תמונות (png, jpg, jpeg, webp, gif, svg) → stale-while-revalidate
  if (/\.(png|jpe?g|webp|gif|svg|ico)(\?|$)/.test(url)) {
    e.respondWith(staleWhileRevalidate(e.request));
    return;
  }

  // CSS ושאר → network first
  e.respondWith(networkFirst(e.request));
});

// הודעה לדפים: "דלג ממתין"
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
