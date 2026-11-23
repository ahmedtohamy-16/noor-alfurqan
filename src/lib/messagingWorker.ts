/** Keep background messaging on its own scope so it cannot replace the offline app shell. */
export const registerMessagingWorker = () => navigator.serviceWorker.register(
  "/firebase-messaging-sw.js", { scope: "/firebase-cloud-messaging-push-scope/" }
);