const CACHE_NAME = 'cache_v1'
const CACHE_SATIC_NAME = 'static_v1'
const CACHE_DINAMIC_NAME = 'dynamic_v1'
const CACHE_INMUTABLE_NAME = 'inmutable_v1'

function cleanCache(cache_name, sizeItems) {
    console.log(sizeItems)
    caches.open(cache_name)
        .then(cache => {
            cache.keys()
                .then(keys => {
                    if (keys.length >= sizeItems) {
                        cache.delete(keys[0])
                            .then(() => {
                                cleanCache(cache_name, sizeItems)
                            })
                    }
                })
        })
}

self.addEventListener('install', e => {
    console.log('SW: Instalado')

    const offlineModeCacheFiles = caches.open(CACHE_SATIC_NAME)
        .then(cache => {
            return cache.addAll([
                '/',
                'index.html',
                'css/page.css',
                'img/inicio.jpg',
                'js/app.js',
            ])
        })

    const inmutables = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => {
            return cache.addAll([
                'https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css',
            ])
        })

    e.waitUntil(Promise.all([offlineModeCacheFiles, inmutables]))

})

self.addEventListener('fetch', e => {
    // Solo cache
    //e.respondWith(caches.match(e.request))

    // Primero cache y despues red
    const res = caches.match(e.request)
        .then(res => {
            if (res) return res
            return fetch(e.request)
                .then(res_net => {
                    caches.open(CACHE_DINAMIC_NAME)
                        .then(cache => {
                            cache.put(e.request, res_net)
                            .then(() => {
                                cleanCache(CACHE_DINAMIC_NAME, 5)
                            })
                        })
                    return res_net.clone()
                })
        })

    e.respondWith(res)
})

