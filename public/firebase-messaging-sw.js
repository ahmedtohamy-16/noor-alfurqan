// Firebase Messaging Service Worker
// Uses Firebase SDK for proper FCM integration with Adhan support

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

// Audio playback state
let currentAudio = null;
let audioClients = new Set();

// Stop any playing audio
const stopAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
};

// Play Adhan sound with proper handling
const playAdhanSound = async (adhanUrl, prayerName = "الصلاة") => {
  try {
    stopAudio();
    
    console.log("🔊 Playing Adhan:", adhanUrl);
    
    currentAudio = new Audio(adhanUrl);
    currentAudio.volume = 0.9;
    currentAudio.crossOrigin = "anonymous";
    
    // Preload the audio
    currentAudio.preload = "auto";
    
    // Handle playback
    const playPromise = currentAudio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("✅ Adhan playing successfully");
          // Notify clients that Adhan is playing
          self.clients.matchAll({ type: "window" }).then((clientList) => {
            clientList.forEach((client) => {
              client.postMessage({
                type: "ADHAN_PLAYING",
                prayerName,
                adhanUrl,
              });
            });
          });
        })
        .catch((error) => {
          console.log("❌ Adhan playback failed (requires user interaction):", error.name);
          // Send message to client to trigger playback there
          self.clients.matchAll({ type: "window" }).then((clientList) => {
            if (clientList.length > 0) {
              clientList[0].postMessage({
                type: "PLAY_ADHAN_REQUEST",
                adhanUrl,
                prayerName,
              });
            }
          });
        });
    }

    // Handle audio end
    currentAudio.addEventListener("ended", () => {
      console.log("✅ Adhan finished");
      currentAudio = null;
    });

    currentAudio.addEventListener("error", (e) => {
      console.error("❌ Adhan audio error:", e);
      currentAudio = null;
    });

  } catch (error) {
    console.error("❌ Adhan playback error:", error);
  }
};

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || "نور الفرقان";
  const notificationBody = payload.notification?.body || payload.data?.body || "";
  const adhanUrl = payload.data?.adhanUrl;
  const prayerName = payload.data?.prayerName;
  const notificationType = payload.data?.notification_type || "general";

  const notificationOptions = {
    body: notificationBody,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    dir: "rtl",
    lang: "ar",
    tag: payload.data?.tag || notificationType,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    renotify: true,
    silent: !!adhanUrl, // Silent if we're playing Adhan separately
    data: {
      click_url: payload.data?.click_url || "/",
      adhanUrl,
      prayerName,
      notification_type: notificationType,
      timestamp: Date.now(),
    },
    actions: notificationType === "prayer" && adhanUrl ? [
      { action: "stop_adhan", title: "إيقاف الأذان" },
      { action: "open_prayer", title: "مواقيت الصلاة" },
    ] : [],
  };

  // Play Adhan for prayer notifications
  if (notificationType === "prayer" && adhanUrl) {
    playAdhanSound(adhanUrl, prayerName);
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked:", event.notification.tag, event.action);
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  // Stop Adhan if playing
  if (action === "stop_adhan" || notificationData.notification_type === "prayer") {
    stopAudio();
  }

  event.notification.close();

  // Determine URL to open
  let urlToOpen = "/";
  if (action === "open_prayer" || notificationData.notification_type === "prayer") {
    urlToOpen = "/prayer-times";
  } else if (notificationData.notification_type === "wird") {
    urlToOpen = "/daily-wird";
  } else if (notificationData.notification_type === "azkar") {
    urlToOpen = "/azkar";
  } else if (notificationData.click_url) {
    urlToOpen = notificationData.click_url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("🔕 Notification closed:", event.notification.tag);
  
  // Stop Adhan when notification is dismissed
  if (event.notification.data?.notification_type === "prayer") {
    stopAudio();
  }
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  console.log("📨 Message from client:", event.data);
  
  if (event.data?.type === "STOP_ADHAN") {
    stopAudio();
    event.ports[0]?.postMessage({ success: true });
  }
  
  if (event.data?.type === "PLAY_ADHAN") {
    playAdhanSound(event.data.adhanUrl, event.data.prayerName);
    event.ports[0]?.postMessage({ success: true });
  }
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
