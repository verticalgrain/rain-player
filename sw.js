// self.addEventListener('install', function(event) {
//     event.waitUntil(
//       caches.open('justrainsounds').then(function(cache) {
//         return cache.addAll(
//           [
//             'media/rain-loop-1.mp3',
//             'media/rain-loop-2.mp3',
//             'media/rain-loop-3.mp3',
//             'media/rain-loop-4.mp3',
//             'media/rain-loop-5.mp3',
//             'media/rain-loop-6.mp3',
//           ]
//         );
//       })
//     );
// });

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

// document.querySelector('.sound').addEventListener('click', function(event) {
//     event.preventDefault();
//     console.log( event )
    
    // caches.open('mysite-article-' + id).then(function(cache) {
    //   fetch('/get-article-urls?id=' + id).then(function(response) {
    //     // /get-article-urls returns a JSON-encoded array of
    //     // resource URLs that a given article depends on
    //     return response.json();
    //   }).then(function(urls) {
    //     cache.addAll(urls);
    //   });
    // });
// });