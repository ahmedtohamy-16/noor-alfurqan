// Firebase Messaging Service Worker
// Uses Firebase SDK for proper FCM integration

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase configuration - must match the client config
const firebaseConfig = {
  apiKey: "AIzaSyDdpGCVHY9CTTlscKC7T70YJANaUNnH6wY",
  authDomain: "noor-al-furqan-e2bbc.firebaseapp.com",
  projectId: "noor-al-furqan-e2bbc",
  storageBucket: "noor-al-furqan-e2bbc.firebasestorage.app",
  messagingSenderId: "246635031366",
  appId: "1:246635031366:web:d2cafd0898899142cbd347",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || "نور الفرقان";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    dir: "rtl",
    lang: "ar",
    tag: payload.data?.tag || "general",
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: {
      click_url: payload.data?.click_url || "/",
      adhanUrl: payload.data?.adhanUrl || null,
      ...payload.data,
    },
  };

  // Play Adhan sound for prayer notifications
  if (payload.data?.adhanUrl) {
    try {
      const audio = new Audio(payload.data.adhanUrl);
      audio.volume = 0.8;
      audio.play().catch(err => console.log("Could not play adhan:", err));
    } catch (e) {
      console.log("Audio playback error:", e);
    }
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked:", event.notification.tag);
  event.notification.close();

  const clickUrl = event.notification.data?.click_url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(clickUrl);
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

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("🔧 Firebase Messaging SW installed");
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("✅ Firebase Messaging SW activated");
  event.waitUntil(clients.claim());
});
