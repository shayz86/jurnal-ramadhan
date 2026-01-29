// ===============================
// ===== PWA CORE ===============
// ===============================

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request));
});


// ===============================
// ===== PUSH NOTIFICATION ======
// ===============================

console.log("[SW] Loaded & ready for push");

// TERIMA PUSH DARI SERVER / WORKER CRON
self.addEventListener("push", e => {

  let data = {};

  try {
    data = e.data.json();
  } catch (err) {
    console.warn("[SW] Push parse failed", err);
  }

  const title = data.title || "Waktu Shalat";

  const opts = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "shalat",
    renotify: true,
    vibrate: [200, 100, 200],
    data
  };

  console.log("[SW] Push received:", data);

  e.waitUntil(
    self.registration.showNotification(title, opts)
  );
});


// ===============================
// ===== NOTIF CLICK ============
// ===============================

self.addEventListener("notificationclick", e => {

  e.notification.close();

  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clients => {
        for (const c of clients) {
          if (c.url.includes("noorrahma")) {
            return c.focus();
          }
        }
        return self.clients.openWindow("/");
      })
  );

});


// ===============================
// ===== MESSAGE HANDLER =========
// ===============================

self.addEventListener("message", e => {

  const data = e.data;

  if (!data) return;

  console.log("[SW] Message:", data);

  // KEEP-ALIVE / DEBUG
  if (data.type === "PING") {
    console.log("[SW] ping alive");
    return;
  }

});
