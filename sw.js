var V = 'caderno-v10';
var FILES = ['./', 'index.html', 'vendor3d.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(FILES).then(function () { return Promise.all(['vendorpdf.js', 'pdf.worker.js'].map(function (f) { return c.add(f).catch(function () {}); })); }); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches['delete'](k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    /* Páginas: tenta a rede primeiro (pega atualizações) e cai para o cache sem internet */
    e.respondWith(fetch(r.url, { cache: 'reload' }).then(function (res) {
      var copy = res.clone(); caches.open(V).then(function (c) { c.put('index.html', copy); }); return res;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(r).then(function (res) {
      var copy = res.clone(); caches.open(V).then(function (c) { c.put(r, copy); }); return res;
    });
  }));
});
