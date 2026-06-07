// Service Worker — מאפשר PWA + עבודה אופליין
const CACHE = 'workout-v4';  // bump = forces cache clear on all devices

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/mobile.css',
  './js/data.js',
  './js/components.js',
  './js/render.js',
  './js/tracker.js',
  './js/utils.js',
  './data/exercises-data.js',
  './data/plan-data.js',
  './pages/day1.html',
  './pages/day2.html',
  './pages/day3.html',
  './pages/day4.html',
  './pages/day5.html',
  './pages/day6.html',
  './pages/morning.html',
  './pages/stretch.html'
];

// התקנה — שמור נכסים בסיסיים
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// הפעלה — נקה cache ישן
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// בקשות — network first, אחר כך cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
