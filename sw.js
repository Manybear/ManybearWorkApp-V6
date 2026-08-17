// Manybear Work App — Service Worker
// ทำให้แอปเปิดได้แม้ไม่มีอินเทอร์เน็ต (ข้อมูลงานยังเก็บที่ localStorage ของเครื่องเหมือนเดิม)
// กลยุทธ์: NETWORK-FIRST — พยายามดึงไฟล์ใหม่จากเน็ตก่อนเสมอ ถ้าไม่มีเน็ตค่อย fallback ไปใช้แคชเก่า
// แบบนี้ทุกครั้งที่อัปเดต index.html ใหม่บน GitHub ผู้ใช้จะเห็นเวอร์ชันล่าสุดทันทีที่เปิดแอป (ตอนมีเน็ต)

const CACHE_NAME = 'manybear-cache-v23';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
