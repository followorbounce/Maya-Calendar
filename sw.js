/* Ju'un K'in — offline cache. Bump CACHE on any asset change. */
var CACHE = "juunkin-v1";
var ASSETS = [
  "./", "index.html", "tzolkin.html", "haab.html", "calendar-round.html",
  "long-count.html", "cosmology.html", "dreamspell.html", "sources.html",
  "pages.json", "manifest.webmanifest",
  "assets/styles.css", "assets/calendar.js", "assets/site.js", "assets/favicon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        var copy = res.clone();
        if (res.ok && e.request.url.indexOf("http") === 0) {
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return caches.match("index.html"); });
    })
  );
});
