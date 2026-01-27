// Service Worker for Push Notifications - OX Services Admin
// This service worker handles push notifications for new appointments

const CACHE_NAME = 'ox-admin-push-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW Push] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW Push] Activating service worker...');
  event.waitUntil(clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW Push] Push notification received');

  let data = {
    title: 'OX Services Admin',
    body: 'Nova notificação',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: '/appointments' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error('[SW Push] Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    vibrate: [200, 100, 200],
    tag: 'ox-appointment-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: data.data || { url: '/appointments' },
    actions: [
      {
        action: 'view',
        title: 'Ver agendamento',
        icon: '/logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW Push] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/appointments';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate to appointments
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        // Open new window if no existing window found
        return clients.openWindow(urlToOpen);
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW Push] Notification closed');
});

// Message event - For communication with the main app
self.addEventListener('message', (event) => {
  console.log('[SW Push] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW Push] Service worker loaded');
