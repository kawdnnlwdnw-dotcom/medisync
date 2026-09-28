// sw.js — MediSync Service Worker (نسخة نظيفة: إشعارات فقط، بدون تخزين صفحات)
self.addEventListener('install', function(){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    // مسح أي كاش قديم يخزّن صفحات => يمنع عودة الجمود
    var keys = await caches.keys();
    await Promise.all(keys.map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});

// استقبال إشعار يرسله التطبيق نفسه
self.addEventListener('message', function(e){
  var d = e.data || {};
  if (d.type === 'notify') {
    e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: d.icon }));
  }
});

// استقبال Push من خادم خارجي (يُفعَّل لاحقاً مع Supabase)
self.addEventListener('push', function(e){
  var data = { title: 'MediSync Iraq', body: 'تحديث جديد' };
  try { if (e.data) data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});

// النقر على الإشعار يفتح الموقع
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
