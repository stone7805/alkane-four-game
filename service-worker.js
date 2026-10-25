'use strict';
// GitHub Pages 项目站点通常位于 /仓库名/；缓存仅清理本游戏在当前子路径的旧版本。
var PREFIX='alkane-detective-'+self.location.pathname.replace(/[^a-z0-9]/gi,'-')+'-';
var CACHE=PREFIX+'v2-3';
var CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',function(event){
  event.waitUntil(caches.open(CACHE).then(function(cache){return cache.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(key){return key.indexOf(PREFIX)===0&&key!==CACHE}).map(function(key){return caches.delete(key)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(event){
  var request=event.request;
  if(request.method!=='GET')return;
  var url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(function(response){
      if(!response||!response.ok)return response;
      var copy=response.clone();
      return caches.open(CACHE).then(function(cache){return cache.put('./index.html',copy)}).catch(function(){/* 缓存失败不阻断在线访问 */}).then(function(){return response});
    }).catch(function(){return caches.match('./index.html')}));
    return;
  }
  event.respondWith(caches.match(request).then(function(cached){
    if(cached)return cached;
    return fetch(request).then(function(response){
      if(!response||!response.ok)return response;
      var copy=response.clone();
      return caches.open(CACHE).then(function(cache){return cache.put(request,copy)}).catch(function(){/* 缓存失败不阻断在线访问 */}).then(function(){return response});
    });
  }));
});
