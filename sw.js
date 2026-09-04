// sw.js - Service Worker للإشعارات الفورية
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// إشعارات واردة من التطبيق نفسه
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'notify') {
    e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: d.icon }));
  }
});

// إشعارات Push من خادم خارجي (Supabase لاحقاً)
self.addEventListener('push', e => {
  let data = { title: 'MediSync Iraq', body: 'تحديث جديد' };
  try { data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
});

// مزامنة دورية: يفحص العروض الجديدة حتى والموقع مغلق (يتفعّل مع Supabase)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-new-listings') {
    e.waitUntil(checkNewListings());
  }
});

async function checkNewListings() {
  const EP = await self.registration.syncEndpoint; // يُضبط لاحقاً مع Supabase
  if (!EP) return;
  try {
    const res = await fetch(EP);
    const items = await res.json();
    const last = (await self.caches.open('ms').then(c => c.match('last'))) || 0;
    const fresh = items.filter(i => i.created_at > last);
    for (const i of fresh.slice(0, 3)) {
      await self.registration.showNotification('💊 دواء جديد متاح', { body: `${i.trade_name} — ${i.pharmacies?.name || ''}` });
    }
  } catch (e) {}
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});