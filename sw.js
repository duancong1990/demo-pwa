const PRECACHE = 'demo-pwa'; //缓存名称
const RUNTIME = 'runtime';

// 缓存文件
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/img/pic1.jpg',
    '/img/pic2.jpg',
    '/img/pic3.jpg'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
        .then(cache => {
            console.log('添加缓存');
            return cache.addAll(PRECACHE_URLS)
        })
        .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});
self.addEventListener('activate', event => event.waitUntil(
    Promise.all([
        // 更新客户端
        clients.claim(),
        // 清理旧版本
        caches.keys().then(cacheList => Promise.all(
            cacheList.map(cacheName => {
                if (cacheName !== PRECACHE) {
                    caches.delete(cacheName);
                }
            })
        ))
    ])
));

self.addEventListener('fetch', event => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
        //   return caches.open(RUNTIME).then(cache => {
            return fetch(event.request.clone()).then(response => {
              // Put a copy of the response in the runtime cache.
            //   return cache.put(event.request, response.clone()).then(() => {
                return response;
            //   });
            });
        //   });
        })
      );
    }
  });