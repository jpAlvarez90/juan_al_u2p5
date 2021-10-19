const CACHE_NAME = 'cache_v1'
const CACHE_SATIC_NAME = 'static_v4'
const CACHE_DINAMIC_NAME = 'dynamic_v1'
const CACHE_INMUTABLE_NAME = 'inmutable_v1'

function cleanCache(cache_name, sizeItems) {
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
                '/juan_al_u2p5',
                '/juan_al_u2p5/index.html',
                '/juan_al_u2p5/css/page.css',
                '/juan_al_u2p5/img/inicio.jpg',
                '/juan_al_u2p5/img/default.jpg',
                '/juan_al_u2p5/js/app.js',
                '/juan_al_u2p5/pages/view_offline.html'
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

self.addEventListener('activate', e => {
    const cachesDelete = caches.keys()
    .then(keys => {
        keys.forEach(key => {
            if (key !== CACHE_SATIC_NAME && key.includes('static')) {
                return caches.delete(key)
            }
        })
    })
    e.waitUntil(cachesDelete)
});

self.addEventListener('fetch', e => {
    // Solo cache
    //e.respondWith(caches.match(e.request))

    // Primero cache y despues red
    
    const res = caches.match(e.request).then(res => {
        if (res) return res
        return fetch(e.request)
        .then(res_net => {
            caches.open(CACHE_DINAMIC_NAME).then(cache => {
                cache.put(e.request, res_net).then(() => {
                    cleanCache(CACHE_DINAMIC_NAME, 5)
                })
            })
            return res_net.clone()
        }).catch(error => {
            if (e.request.headers.get('accept').includes('text/html')) return caches.match('/juan_al_u2p5/pages/view_offline.html')
            if (e.request.url.includes('.jpeg') || e.request.url.includes('.jpg') || e.request.url.includes('.png')) return caches.match('/juan_al_u2p5/img/default.jpg')
        })
    })
    e.respondWith(res)

    // Primero red y despues cache
    /*
    const res = fetch(e.request).then(res => {

        if (!res) {
            return caches.match(e.request)
            .then(resCache => {
                return resCache
            })
            .catch(error => {
                console.log(error)
            })
        }

        caches.open(CACHE_DINAMIC_NAME).then(cache => {
            cache.put(e.request, res)
            cleanCache(CACHE_DINAMIC_NAME, 5)
        })
        return res.clone()
    }).catch( error => {
        return caches.match(e.request)
    })

    e.respondWith(res)
    */
})

