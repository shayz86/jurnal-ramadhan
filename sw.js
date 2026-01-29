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
// ===== PRAYER ENGINE ==========
// ===============================

console.log("[SW] NoorRahma prayer engine loaded");

let prayerData = null;
let firedToday = {};

const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const LABELS = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya"
};

function parseTime(timeStr, offset = 0) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(m + offset);
  d.setHours(h);
  return d;
}

function checkPrayerTimes() {
  if (!prayerData) return;

  const now = new Date();
  const todayKey = new Date().toDateString();

  firedToday[todayKey] ??= {};

  PRAYER_KEYS.forEach(k => {
    const base = prayerData.times[k];
    if (!base) return;

    const offset = prayerData.offsets?.[k] || 0;
    const target = parseTime(base, offset);

    if (target < now) return;

    const diff = target - now;

    if (diff <= 30000 && diff >= 0) {
      if (firedToday[todayKey][k]) return;

      firedToday[todayKey][k] = true;

      console.log("[SW] Fire notif:", k);

      self.registration.showNotification("Waktu Shalat", {
        body: `${LABELS[k]} — ${prayerData.city || ""}`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "shalat-" + k,
        renotify: true,
        vibrate: [200, 100, 200]
      });
    }
  });
}

// cek tiap 30 detik
setInterval(checkPrayerTimes, 30000);

// ===============================
// ===== PUSH SUPPORT ===========
// ===============================

self.addEventListener("push", e => {
  let data = {};
  try { data = e.data.json(); } catch {}

  e.waitUntil(
    self.registration.showNotification(
      data.title || "Waktu Shalat",
      {
        body: data.body || "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: data.tag || "shalat",
        vibrate: [200, 100, 200],
        data
      }
    )
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
          if (c.url.includes("noorrahma")) return c.focus();
        }
        return self.clients.openWindow("/");
      })
  );
});

// ===============================
// ===== MESSAGE HANDLER ========
// ===============================

self.addEventListener("message", e => {
  const data = e.data;
  if (!data) return;

  console.log("[SW] Message:", data);

  if (data.type === "SET_PRAYERS") {
    prayerData = {
      times: data.times,
      offsets: data.offsets || {},
      city: data.city
    };
    firedToday = {};
    console.log("[SW] Prayer data updated", prayerData);
  }

  if (data.type === "CLEAR_PRAYERS") {
    prayerData = null;
    firedToday = {};
  }

  if (data.type === "PING") {
    console.log("[SW] ping alive");
  }
});
