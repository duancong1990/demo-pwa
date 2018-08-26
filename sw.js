//缓存名称
const CACHE_NAME = 'demo-pwaaaa'; //缓存名称

// 缓列举要默认缓存的静态资源，一般用于离线使用
const CACHE_URLS = [
    '/',
    '/index.html',
    '/app.css',
    '/manifest.json',
    '/img/pic1.jpg',
    '/img/pic2.jpg',
    '/img/pic3.jpg'
];

self.addEventListener('install', event => {
    // event.waitUtil 用于在安装成功之前执行一些预装逻辑
    // 但是建议只做一些轻量级和非常重要资源的缓存，减少安装失败的概率
    // 安装成功后 ServiceWorker 状态会从 installing 变为 installed
    event.waitUntil(
        // 使用 cache API 打开指定的 cache 文件
        caches.open(CACHE_NAME).then(cache => {
            // 添加要缓存的资源列表
            return cache.addAll(CACHE_URLS)
        })
        .then(self.skipWaiting()) // 安装阶段跳过等待，直接进入 active
    );
});



// // 联网状态下执行
// function onlineRequest(fetchRequest) {
//     // 使用 fecth API 获取资源，以实现对资源请求控制
//     return fetch(fetchRequest).then(response => {
//         // 在资源请求成功后，将 image、js、css 资源加入缓存列表
//         if (!response ||
//             response.status !== 200 ||
//             !response.headers.get('Content-type').match(/image|javascript|test\/css/i)
//         ) {
//             return response;
//         }
//         const responseToCache = response.clone();
//         caches.open(CACHE_NAME)
//             .then(function (cache) {
//                 cache.put(event.request, responseToCache);
//             });

//         return response;
//     }).catch(() => {
//         // 获取失败，离线资源降级替换
//         offlineRequest(fetchRequest);
//     });
// }
// 离线状态下执行，降级替换
// function offlineRequest(request) {
//     // 使用离线图片
//     if (request.url.match(/\.(png|gif|jpg)/i)) {
//         return caches.match('/images/offline.png');
//     }

//     // 使用离线页面
//     if (request.url.match(/\.html$/)) {
//         return caches.match('/test/offline.html');
//     }
// }

// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request)
//         .then(hit => {
//             // 返回缓存中命中的文件
//             if (hit) {
//                 return hit;
//             }

//             const fetchRequest = event.request.clone();
//             if (navigator.online) {
//                 // 如果为联网状态
//                 return onlineRequest(fetchRequest);
//             } else {
//                 // 如果为离线状态
//                 return offlineRequest(fetchRequest);
//             }
//         })
//     );
// });

self.addEventListener('fetch', event => {
    // 拦截网络请求，先在缓存文件中查找
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                // 返回缓存中命中的文件
                if (cachedResponse) {
                    return cachedResponse;
                }
                // 使用 fecth API 获取资源，以实现对资源请求控制
                return fetch(event.request.clone()).then(response => {
                    return response;
                });
               
            })
        );
    }
});

self.addEventListener('activate', event => event.waitUntil(
    Promise.all([
        // 更新客户端
        clients.claim(),
        // 清理旧版本
        caches.keys().then(cacheList => Promise.all(
            cacheList.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    caches.delete(cacheName);
                }
            })
        ))
    ])
));

// 监听推送事件 然后显示通知
self.addEventListener('push', function (event) {
    const title = 'Push Codelab';
    const options = {
        body: 'Yay it works.',
        icon: 'img/48.png',
        badge: 'img/48.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// 监听通知的点击事件
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/') // eslint-disable-line
    );
});