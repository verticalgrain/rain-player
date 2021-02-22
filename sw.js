self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('justrainsounds').then(function(cache) {
        return cache.addAll(
          [
            'index.html',
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
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

// self.addEventListener('fetch', function (event) {
//     console.log( 'asdfasd' );
//     event.respondWith(
//       caches.match(event.request)
//         .then(function (response) {
//           if (response) {
//             return response; // Cache hit
//           }
  
//           return fetch(event.request.clone())
//             .then(function (response) {
//               if (!isSuccessful(response)) {
//                 return response;
//               }
  
//               caches.open(CACHE_NAME)
//                 .then(function (cache) {
//                   cache.put(event.request, response.clone());
//                 });
  
//               return response;
//             }
//           );
//         })
//       );
//   });
