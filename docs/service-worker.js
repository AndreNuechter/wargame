(function(){"use strict";const s=`wargame-v${1721230271484}`;self.addEventListener("activate",t=>{t.waitUntil((async()=>{const e=await self.caches.keys();return Promise.all(e.map(a=>a.includes("wargame")&&a!==s?self.caches.delete(a):!0))})())}),self.addEventListener("fetch",t=>{t.respondWith((async()=>{let e=await self.caches.match(t.request);return e||(e=await fetch(t.request),(await self.caches.open(s)).put(t.request,e.clone()),e)})())})})();
