var cacheName = 'r37sk3PWA-v1';

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('justrainsounds').then(function(cache) {
        return cache.addAll(
          [
            'index.html',
            'app.js',
            'style.css',
            'manifest.json',
            // 'media/rain-loop-1.mp3',
            // 'media/rain-loop-2.mp3',
            // 'media/rain-loop-3.mp3',
            // 'media/rain-loop-4.mp3',
            // 'media/rain-loop-5.mp3',
            // 'media/rain-loop-6.mp3',
          ]
        );
      })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
