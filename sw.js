// ===============================
// ===== PWA CORE ===============
// ===============================

self.addEventListener("install", () => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  console.log("[SW] Activated");
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request));
});

// ===============================
// ===== NOTIF SHALAT PRO ========
// ===============================

console.log("[SW] Prayer engine loaded");

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

  PRAYER_KEYS.forEach(k => {

    const base = prayerData.times[k];
    if (!base) return;

    const offset = prayerData.offsets?.[k] || 0;

    const target = parseTime(base, offset);

    // reset setiap hari
    const todayKey = new Date().toDateString();
    firedToday[todayKey] ??= {};

    // kalau sudah lewat hari ini, geser ke besok
    if (target < now) return;

    const diff = target - now;

    // trigger kalau 0–30 detik sebelum
    if (diff <= 30000 && diff >= 0) {

      if (firedToday[todayKey][k]) return;

      firedToday[todayKey][k] = true;

      console.log("[SW] Trigger notif:", k, target);

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
// ===== MESSAGE HANDLER =========
// ===============================

self.addEventListener("message", e => {

  const data = e.data;

  console.log("[SW] Message received:", data);

  if (!data) return;

  if (data.type === "SET_PRAYERS") {

    console.log("[SW] SET_PRAYERS payload:", data);

    prayerData = {
      times: data.times,
      offsets: data.offsets || {},
      city: data.city
    };

    firedToday = {};

    console.log("[SW] Prayer data updated", prayerData);
  }

  if (data.type === "CLEAR_PRAYERS") {
    console.log("[SW] CLEAR_PRAYERS");

    prayerData = null;
    firedToday = {};
  }

});
