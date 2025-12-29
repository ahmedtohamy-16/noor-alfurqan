// Push service worker (clean slate)
// Previous Firebase/FCM keys were removed. We'll re-add proper configuration later.

self.addEventListener("push", (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || data.notification?.title || "نور الفرقان";
    const options = {
      body: data.body || data.notification?.body || "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      dir: "rtl",
      lang: "ar",
      data: data.data || data,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // If payload isn't JSON, just ignore.
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});

