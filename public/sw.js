self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'New Lead';
  const options = {
    body: data.body || 'You have a new lead',
    icon: '/logo-icon.svg',
    badge: '/logo-icon.svg',
    tag: data.tag || 'lead-notification',
    requireInteraction: true,
    data: {
      url: data.url || '/',
      leadId: data.leadId,
    },
    actions: data.actions || [
      { action: 'open', title: 'View Lead' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = data.url || '/';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
