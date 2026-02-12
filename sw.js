const CACHE_NAME = 'media-player-pro-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  // Cache Google Fonts CSS
  'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@100..1000&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  // Cache các tài sản tĩnh khác nếu có (ví dụ loading gif)
  'https://tuanphong3108.github.io/md3-loading/Loading_Indicator.gif'
];

// Cài đặt và lưu trữ tất cả vào Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Dọn dẹp cache cũ khi update phiên bản
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Chiến lược: Ưu tiên lấy từ Cache để app load nhanh và chạy offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Trả về từ cache nếu có, không thì đi "ship" từ mạng về
      return response || fetch(event.request).then((fetchResponse) => {
        // Nếu là yêu cầu font hoặc style từ Google, ta cũng tiện tay cache luôn
        if (event.request.url.includes('fonts.googleapis.com') || event.request.url.includes('fonts.gstatic.com')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    })
  );
});
