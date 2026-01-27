// ===== PWA CORE =====
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});


// ===== NOTIF SHALAT PRO =====

let timers = [];

self.addEventListener("message", event => {

  if (event.data.type === "SET_PRAYERS") {

    scheduleNotifications(
      event.data.times,
      event.data.offsets,
      event.data.city
    );

  }

});

function scheduleNotifications(times, offsets, city) {

  timers.forEach(t => clearTimeout(t));
  timers = [];

  const now = Date.now();

  const map = {
    Fajr: "Subuh",
    Dhuhr: "Dzuhur",
    Asr: "Ashar",
    Maghrib: "Maghrib",
    Isha: "Isya"
  };

  for (const key in map) {

    if (!times[key]) continue;

    const base = times[key];
    const offset = offsets[key] || 0;

    const [h, m] = base.split(":").map(Number);

    const d = new Date();
    d.setHours(h, m + offset, 0, 0);

    const delay = d.getTime() - now;

    if (delay > 0) {

      const name = map[key];

      const t = setTimeout(() => {

        self.registration.showNotification(
          "Waktu Shalat",
          {
            body: `${name} — ${city}`,
            icon: "/icon-192.png",
            badge: "/icon-192.png"
          }
        );

      }, delay);

      timers.push(t);
    }

  }
}
