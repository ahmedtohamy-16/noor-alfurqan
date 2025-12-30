// Push service worker for receiving FCM notifications
// This will be configured with Firebase when credentials are provided

self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activated");
  event.waitUntil(clients.claim());
});

// Handle push events (from FCM)
self.addEventListener("push", (event) => {
  console.log("📩 Push event received");
  
  try {
    let data = {};
    if (event.data) {
      data = event.data.json();
    }

    const title = data.notification?.title || data.title || "نور الفرقان";
    const options = {
      body: data.notification?.body || data.body || "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      dir: "rtl",
      lang: "ar",
      tag: data.data?.tag || "general",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: data.data || data,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error("❌ Push event error:", error);
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked");
  event.notification.close();

  const clickUrl = event.notification.data?.click_url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("❎ Notification closed");
});
