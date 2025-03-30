const cacheName = `${process.env.appName}-v${process.env.appVersion}`;

self.addEventListener('activate', (event) => {
    if (!(event instanceof ExtendableEvent)) return;

    event.waitUntil(
        (async() => {
            const keys = await self.caches.keys();

            return Promise.all(keys.map((key) => {
                if (key.includes(process.env.appName) && key !== cacheName) {
                    return self.caches.delete(key);
                }

                return true;
            }));
        })(),
    );
});

self.addEventListener('fetch', (event) => {
    if (!(event instanceof FetchEvent)) return;

    event.respondWith(
        (async() => {
            let response = await self.caches.match(event.request);

            if (response) return response;

            response = await fetch(event.request);
            const cache = await self.caches.open(cacheName);

            cache.put(event.request, response.clone());

            return response;
        })(),
    );
});