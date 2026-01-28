// ===============================
// ===== PWA CORE ===============
// ===============================

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request));
});

// ===============================
// ===== NOTIF SHALAT PRO ========
// ===============================

let prayerTimers = {};

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const LABELS = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya"
};

function clearTimers() {
  Object.values(prayerTimers).forEach(t => clearTimeout(t));
  prayerTimers = {};
}

function parseTimeToDate(timeStr, offset = 0) {
  const [h, m] = timeStr.split(":").map(Number);

  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  d.setMinutes(m + offset);
  d.setHours(h);

  if (d < new Date()) {
    d.setDate(d.getDate() + 1);
  }

  return d;
}

function schedulePrayer(key, timeStr, offset, city) {
  const target = parseTimeToDate(timeStr, offset);
  const delay = target - Date.now();

  prayerTimers[key] = setTimeout(() => {

    self.registration.showNotification("Waktu Shalat", {
      body: `${LABELS[key]} — ${city || ""}`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "shalat-" + key,
      renotify: true
    });

    // schedule ulang untuk besok
    schedulePrayer(key, timeStr, offset, city);

  }, delay);
}

self.addEventListener("message", e => {

  const data = e.data;
  if (!data) return;

  if (data.type === "SET_PRAYERS") {

    clearTimers();

    const { times, offsets, city } = data;

    PRAYER_KEYS.forEach(k => {
      if (times[k]) {
        schedulePrayer(
          k,
          times[k],
          offsets?.[k] || 0,
          city
        );
      }
    });
  }

  if (data.type === "CLEAR_PRAYERS") {
    clearTimers();
  }

});
