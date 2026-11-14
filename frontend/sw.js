'use strict';
const CACHE_NAME='fia-co-public-v2';
const APP_SHELL=['./','./manifest.json','./assets/fia-app-icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('fia-co-public-')&&key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  const isStaticAsset=['script','style','image','font'].includes(request.destination);

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_NAME);
      try{
        const response=await fetch(request);
        if(response.ok)await cache.put(request,response.clone());
        return response;
      }catch{
        const cached=await cache.match(request);
        if(cached)return cached;
        if(url.pathname===new URL(self.registration.scope).pathname){
          return await cache.match('./')||Response.error();
        }
        return Response.error();
      }
    })());
    return;
  }

  if(!isStaticAsset)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{
      const response=await fetch(request);
      if(response.ok)await cache.put(request,response.clone());
      return response;
    }catch{
      return await cache.match(request)||Response.error();
    }
  })());
});
