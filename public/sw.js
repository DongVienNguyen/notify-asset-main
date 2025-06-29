const CACHE_NAME = 'thong-bao-ts-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/logo192.png',
  '/logo512.png'
];

// Sự kiện install: Lưu các tài nguyên cốt lõi vào cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Sự kiện activate: Dọn dẹp các cache cũ
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Sự kiện fetch: Phục vụ tài nguyên từ cache, nếu không có thì lấy từ mạng
self.addEventListener('fetch', event => {
  // Bỏ qua các yêu cầu không phải GET và các yêu cầu đến API của Supabase
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    // Để trình duyệt xử lý như bình thường
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy trong cache, trả về ngay lập tức
        if (response) {
          return response;
        }

        // Nếu không có trong cache, thực hiện yêu cầu mạng
        return fetch(event.request).then(
          networkResponse => {
            // Kiểm tra nếu nhận được phản hồi hợp lệ
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Sao chép phản hồi để có thể lưu vào cache và trả về cho trình duyệt
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});


// --- Giữ nguyên logic thông báo đẩy hiện có ---
self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push received:', data);
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});