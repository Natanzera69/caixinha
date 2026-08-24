const CACHE = 'caixinha-v3';
const SHELL = ['./Planilha Financeiro.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro, ignorando o cache HTTP normal do navegador (não só o do service worker) —
// senão "rede primeiro" ainda podia devolver uma resposta HTTP em cache dentro da janela de
// max-age do GitHub Pages. Só cai pro cache do SW quando realmente não há internet.
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, {cache:'reload'})
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
