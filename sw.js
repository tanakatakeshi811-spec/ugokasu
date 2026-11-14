// ウゴカス: ネットにつながっていなくても開けるように、使うファイルをとっておく
const VERSION = 'ugokasu-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const T = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const LIBS = [
  T + 'build/three.module.js',
  T + 'examples/jsm/controls/OrbitControls.js', T + 'examples/jsm/controls/TransformControls.js',
  T + 'examples/jsm/environments/RoomEnvironment.js',
  T + 'examples/jsm/loaders/GLTFLoader.js', T + 'examples/jsm/utils/BufferGeometryUtils.js',
  T + 'examples/jsm/loaders/FBXLoader.js', T + 'examples/jsm/libs/fflate.module.js',
  T + 'examples/jsm/curves/NURBSCurve.js', T + 'examples/jsm/curves/NURBSUtils.js',
  T + 'examples/jsm/loaders/OBJLoader.js', T + 'examples/jsm/loaders/STLLoader.js',
  'https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@3.1.0/lib/three-vrm.module.min.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE).then(() => Promise.allSettled(LIBS.map(u => c.add(u))))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // 自分のファイル: まずネット(新しい版)、だめなら、とっておいた物
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.host)) {
    // 版の決まった部品と文字: とっておいた物を先に使う
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; })));
  }
});
