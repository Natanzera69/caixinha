const CACHE = 'caixinha-v5';
const SHELL = ['./Planilha Financeiro.html', './manifest.json', './assets/logo-moeda.svg', './assets/moeda-girando.svg'];

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

// Só mexe no que é do próprio site (GET) e nas fontes do Google. Firebase/Auth/Firestore e qualquer
// outra requisição passam direto pela rede — o SW não deve interceptar POST nem streams do Firestore.
const FONTES = ['fonts.googleapis.com', 'fonts.gstatic.com'];
function deveTratar(req) {
  if (req.method !== 'GET') return false;
  const u = new URL(req.url);
  return u.origin === self.location.origin || FONTES.includes(u.hostname);
}

// Rede primeiro, ignorando o cache HTTP normal do navegador (não só o do service worker) —
// senão "rede primeiro" ainda podia devolver uma resposta HTTP em cache dentro da janela de
// max-age do GitHub Pages. Só cai pro cache do SW quando realmente não há internet.
self.addEventListener('fetch', e => {
  if (!deveTratar(e.request)) return;
  e.respondWith(
    fetch(e.request, {cache:'reload'})
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
