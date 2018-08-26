const PRECACHE = 'demo-pwa'; //缓存名称

// 缓存文件
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/img/pic1.jpg',
    '/img/pic2.jpg',
    '/img/pic3.jpg'
];

// 添加缓存文件
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
    // 监听文件请求，先在缓存文件中查找
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request.clone()).then(response => {
                    return response;
                });
            })
        );
    }
});