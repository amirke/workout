// Service Worker — PWA + אופליין
// v5 — network-first for JS, skip waiting immediately

const CACHE = 'workout-v5';

// קבצים סטטיים שנשמרים לאופליין (תמונות, CSS)
const STATIC = [
  './css/style.css',
  './css/mobile.css',
  './images/icon-192.png',
  './images/icon-512.png'
];

// קבצי JS ו-HTML — תמיד מהרשת (לא נשמרים בinstall)
const JS_HTML = [
  './js/utils.js',
  './js/data.js',
  './js/components.js',
  './js/render.js',
  './js/tracker.js',
  './data/exercises-data.js',
  './data/plan-data.js'
];

// התקנה — שמור רק קבצים סטטיים
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  // תפוס שליטה מיד — לא לחכות לסגירת טאבים
  self.skipWaiting();
});

// הפעלה — מחק cache ישן + תפוס את כל הלקוחות
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// בקשות:
// JS/HTML → רשת תמיד (אם כשל → cache)
// שאר    → network-first עם cache fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  var url = e.request.url;

  // JS, HTML, JSON — תמיד מהרשת
  if (url.endsWith('.js') || url.endsWith('.html') || url.endsWith('.json')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // שמור בcache לאופליין
          var clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // תמונות וCSS — cache-first (מהיר, משתנות לעתים רחוקות)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        var clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});

// הודעה לדפים: "יש גרסה חדשה"
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
