// ══════════════════════════════════════════════════════════════════
// OBubba — Firebase Cloud Functions
// Push notifications, scheduled reminders, and background tasks
// ══════════════════════════════════════════════════════════════════

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// ── Send push notification to a specific user ───────────────────
async function sendPush(uid, { title, body, data = {} }) {
  try {
    const tokenDoc = await db.collection("fcm_tokens").doc(uid).get();
    if (!tokenDoc.exists) return;

    const token = tokenDoc.data().token;
    if (!token) return;

    await messaging.send({
      token,
      notification: { title, body },
      data: { ...data, click_action: "FLUTTER_NOTIFICATION_CLICK" },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            "mutable-content": 1,
          },
        },
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: data.channelId || "obubba_reminders",
          color: "#C07088",
          icon: "ic_notification",
        },
      },
    });
  } catch (err) {
    // Token may be invalid — clean up
    if (
      err.code === "messaging/invalid-registration-token" ||
      err.code === "messaging/registration-token-not-registered"
    ) {
      await db.collection("fcm_tokens").doc(uid).delete();
    }
    console.error(`Push to ${uid} failed:`, err.message);
  }
}

// Helper: get the user's LOCAL `YYYY-MM-DD` key. `tzOffsetMin` is what JS's
// getTimezoneOffset() returns — minutes west of UTC (so Europe/London DST is
// -60, Asia/Tokyo is -540, Los Angeles is 420). A push_log dedupe key keyed
// on server UTC would roll over at UTC midnight instead of the user's local
// midnight and produce duplicate reminders on DST and at timezone boundaries.
function todayKeyForUser(tzOffsetMin) {
  const offset = typeof tzOffsetMin === "number" ? tzOffsetMin : 0;
  const local = new Date(Date.now() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

// Helper: user-local hour of the day (0–23). Used to gate the 7am-10pm
// "daytime only" reminder window on the USER's wall clock, not the
// function's server region.
function userLocalHour(tzOffsetMin) {
  const offset = typeof tzOffsetMin === "number" ? tzOffsetMin : 0;
  const local = new Date(Date.now() - offset * 60 * 1000);
  return local.getUTCHours();
}

// Helper: check if a Firestore timestamp is from the user's local "today".
function isToday(timestamp, tzOffsetMin) {
  if (!timestamp) return false;
  const ts = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const offset = typeof tzOffsetMin === "number" ? tzOffsetMin : 0;
  const tsLocal = new Date(ts.getTime() - offset * 60 * 1000);
  const nowLocal = new Date(Date.now() - offset * 60 * 1000);
  return tsLocal.getUTCFullYear() === nowLocal.getUTCFullYear()
      && tsLocal.getUTCMonth() === nowLocal.getUTCMonth()
      && tsLocal.getUTCDate() === nowLocal.getUTCDate();
}

// ── Feed reminder: notify if no feed logged in 4+ hours ─────────
exports.feedReminder = onSchedule("every 30 minutes", async () => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000; // 4 hours ago
  const tokens = await db.collection("fcm_tokens").get();

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;

      const data = actDoc.data();
      const lastFeedTime = data.lastFeedTimestamp;
      const tzOff = typeof data.tzOffsetMin === "number" ? data.tzOffsetMin : 0;

      // Daytime gate + dedupe key both computed in the USER's local timezone.
      const hour = userLocalHour(tzOff);
      if (hour < 7 || hour > 22) continue;

      if (lastFeedTime && lastFeedTime.toMillis() < cutoff) {
        const hoursSince = Math.round((Date.now() - lastFeedTime.toMillis()) / 3600000);
        // Don't spam — check if we already sent a feed reminder today (user-local)
        const sentKey = `feedReminder_${todayKeyForUser(tzOff)}_${uid}`;
        const sentDoc = await db.collection("push_log").doc(sentKey).get();
        if (sentDoc.exists) continue;

        await sendPush(uid, {
          title: "🍼 Feed Reminder",
          body: `It's been ${hoursSince} hours since the last feed. Time for another?`,
          data: { action: "log_feed", channelId: "obubba_reminders" },
        });
        await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
      }
    } catch (err) {
      console.error(`Feed reminder for ${uid}:`, err.message);
    }
  }
});

// ── No feed all day: alert if it's past 10am and zero feeds logged today ──
exports.noFeedAlert = onSchedule("every 1 hours", async () => {
  // No server-wide time gate — the scheduled function runs every hour UTC,
  // and we compute each user's local hour inside the loop below using their
  // stored tzOffsetMin. Without this, a UTC-scheduled 10am-8pm gate meant
  // users outside UTC were either silenced for most of their day or spammed
  // at the wrong local times.
  const tokens = await db.collection("fcm_tokens").get();

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;

      const data = actDoc.data();
      const lastFeed = data.lastFeedTimestamp;
      const tzOff = typeof data.tzOffsetMin === "number" ? data.tzOffsetMin : 0;
      const localHour = userLocalHour(tzOff);
      if (localHour < 10 || localHour > 20) continue;

      // If no feed today (in user's local timezone)
      if (!lastFeed || !isToday(lastFeed, tzOff)) {
        // Don't spam — one alert per user-local day
        const sentKey = `noFeed_${todayKeyForUser(tzOff)}_${uid}`;
        const sentDoc = await db.collection("push_log").doc(sentKey).get();
        if (sentDoc.exists) continue;

        await sendPush(uid, {
          title: "🍼 No feeds logged today",
          body: "Tap to log a feed — keeping track helps spot patterns early.",
          data: { action: "log_feed", channelId: "obubba_reminders" },
        });
        await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
      }
    } catch (err) {
      console.error(`No feed alert for ${uid}:`, err.message);
    }
  }
});

// ── Morning wake reminder: feed logged but no wake ──────────────
// If a feed is logged today but no morning wake, nudge the parent
exports.noWakeAlert = onSchedule("every 1 hours", async () => {
  // Per-user local-time gate: see feedReminder/noFeedAlert comments.
  const tokens = await db.collection("fcm_tokens").get();

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;

      const data = actDoc.data();
      const lastFeed = data.lastFeedTimestamp;
      const lastWake = data.lastWakeTimestamp;
      const tzOff = typeof data.tzOffsetMin === "number" ? data.tzOffsetMin : 0;
      const hour = userLocalHour(tzOff);
      // Only check between 8am and 12pm — after that, wake was probably just missed.
      if (hour < 8 || hour > 12) continue;

      // Feed logged today but no wake today (both in user-local tz)
      const feedToday = lastFeed && isToday(lastFeed, tzOff);
      const wakeToday = lastWake && isToday(lastWake, tzOff);

      if (feedToday && !wakeToday) {
        const sentKey = `noWake_${todayKeyForUser(tzOff)}_${uid}`;
        const sentDoc = await db.collection("push_log").doc(sentKey).get();
        if (sentDoc.exists) continue;

        await sendPush(uid, {
          title: "☀️ Morning wake not logged",
          body: "You've logged a feed but no wake time. Tap to log the morning wake — it helps predict naps accurately.",
          data: { action: "log_wake", channelId: "obubba_reminders" },
        });
        await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
      }
    } catch (err) {
      console.error(`No wake alert for ${uid}:`, err.message);
    }
  }
});

// ── Medicine reminder: notify when dose is due ──────────────────
exports.medicineReminder = onSchedule("every 15 minutes", async () => {
  const now = Date.now();
  const reminders = await db
    .collection("medicine_reminders")
    .where("nextDue", "<=", new Date(now))
    .where("sent", "==", false)
    .get();

  for (const doc of reminders.docs) {
    const data = doc.data();
    try {
      await sendPush(data.uid, {
        title: `💊 Medicine: ${data.name}`,
        body: `Time for ${data.dose || ""} ${data.name}`,
        data: { action: "log_medicine", channelId: "obubba_reminders" },
      });
      await doc.ref.update({ sent: true });
    } catch (err) {
      console.error(`Medicine reminder ${doc.id}:`, err.message);
    }
  }
});

// ── Appointment reminder: 1 hour before ─────────────────────────
exports.appointmentReminder = onSchedule("every 15 minutes", async () => {
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const now = new Date();

  const appts = await db
    .collection("appointments")
    .where("datetime", ">=", now)
    .where("datetime", "<=", oneHourFromNow)
    .where("reminded", "==", false)
    .get();

  for (const doc of appts.docs) {
    const data = doc.data();
    try {
      const travelNote = data.travelMins ? ` Leave in ${data.travelMins} mins.` : "";
      await sendPush(data.uid, {
        title: `📅 Upcoming: ${data.title}`,
        body: `In 1 hour${data.time ? " at " + data.time : ""}.${travelNote}`,
        data: { action: "appointments", channelId: "obubba_reminders" },
      });
      await doc.ref.update({ reminded: true });
    } catch (err) {
      console.error(`Appointment reminder ${doc.id}:`, err.message);
    }
  }
});

// ── Welcome push: send 1 day after signup ───────────────────────
exports.onNewUser = onDocumentCreated("fcm_tokens/{uid}", async (event) => {
  const uid = event.params.uid;

  // Schedule a welcome message for 24 hours later
  await db.collection("scheduled_pushes").add({
    uid,
    sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    title: "Welcome to OBubba! 🧸",
    body: "Tip: Long-press the quick buttons for detailed logging. You can also say \"Hey Siri, start nap in OBubba\".",
    data: { action: "open" },
    sent: false,
  });
});

// ── Process scheduled pushes ────────────────────────────────────
exports.processScheduledPushes = onSchedule("every 5 minutes", async () => {
  const now = new Date();
  const pending = await db
    .collection("scheduled_pushes")
    .where("sendAt", "<=", now)
    .where("sent", "==", false)
    .limit(50)
    .get();

  for (const doc of pending.docs) {
    const data = doc.data();
    try {
      await sendPush(data.uid, {
        title: data.title,
        body: data.body,
        data: data.data || {},
      });
      await doc.ref.update({ sent: true });
    } catch (err) {
      console.error(`Scheduled push ${doc.id}:`, err.message);
    }
  }
});

// ── Weekly digest: Monday morning summary ───────────────────────
exports.weeklyDigest = onSchedule("every monday 08:00", async () => {
  const tokens = await db.collection("fcm_tokens").get();

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      // Check if user has weekly digest enabled
      const prefs = await db.collection("user_prefs").doc(uid).get();
      if (prefs.exists && prefs.data().weeklyDigest === false) continue;

      await sendPush(uid, {
        title: "📊 Your Weekly Summary is Ready",
        body: "See how baby's week went — feeds, sleep patterns, and milestones.",
        data: { action: "baby_summary", channelId: "obubba_milestones" },
      });
    } catch (err) {
      console.error(`Weekly digest for ${uid}:`, err.message);
    }
  }
});

// ── Monthly birthday: celebrate baby turning X months ────────────
exports.monthlyBirthday = onSchedule("every day 09:00", async () => {
  const tokens = await db.collection("fcm_tokens").get();
  const today = new Date();

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;
      const data = actDoc.data();
      if (!data.babyDob) continue;

      const dob = data.babyDob.toDate ? data.babyDob.toDate() : new Date(data.babyDob);
      // Check if today is the monthly anniversary
      if (dob.getDate() !== today.getDate()) continue;
      const months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
      if (months <= 0 || months > 24) continue;

      const sentKey = `monthly_${months}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) continue;

      const name = data.babyName || "Baby";
      await sendPush(uid, {
        title: `🎂 ${name} is ${months} month${months !== 1 ? "s" : ""} old today!`,
        body: `Happy ${months}-month birthday! Check the Development tab for new milestones entering ${name}'s window.`,
        data: { action: "development", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      console.error(`Monthly birthday for ${uid}:`, err.message);
    }
  }
});

// ── New development phase: notify when baby enters a wonder week/phase ──
exports.developmentPhase = onSchedule("every day 09:30", async () => {
  const tokens = await db.collection("fcm_tokens").get();

  // Wonder Weeks leap starts (in weeks from due date)
  const leapWeeks = [5, 8, 12, 19, 26, 37, 46, 55, 64, 75];
  const leapNames = [
    "Changing Sensations", "Patterns", "Smooth Transitions",
    "Events", "Relationships", "Categories", "Sequences",
    "Programmes", "Principles", "Systems"
  ];

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;
      const data = actDoc.data();
      if (!data.babyDob) continue;

      const dob = data.babyDob.toDate ? data.babyDob.toDate() : new Date(data.babyDob);
      const ageWeeks = Math.floor((Date.now() - dob.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const name = data.babyName || "Baby";

      // Check if baby just entered a leap week
      const leapIdx = leapWeeks.indexOf(ageWeeks);
      if (leapIdx === -1) continue;

      const sentKey = `leap_${ageWeeks}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) continue;

      await sendPush(uid, {
        title: `🧠 Leap ${leapIdx + 1}: ${leapNames[leapIdx]}`,
        body: `${name} is entering a new developmental leap! Expect fussiness — it's a sign of brain growth. Check Development for details.`,
        data: { action: "development", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      console.error(`Development phase for ${uid}:`, err.message);
    }
  }
});

// ── New milestones unlocked: notify when milestones enter baby's window ──
exports.milestonesUnlocked = onSchedule("every day 10:00", async () => {
  const tokens = await db.collection("fcm_tokens").get();

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;
      const data = actDoc.data();
      if (!data.babyDob) continue;

      const dob = data.babyDob.toDate ? data.babyDob.toDate() : new Date(data.babyDob);
      const ageWeeks = Math.floor((Date.now() - dob.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const name = data.babyName || "Baby";

      // Check weekly — only alert once per week
      const weekKey = `milestones_w${ageWeeks}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(weekKey).get();
      if (sentDoc.exists) continue;

      // Only notify at key age milestones (every 4 weeks after 8 weeks)
      if (ageWeeks < 8 || ageWeeks % 4 !== 0) continue;

      await sendPush(uid, {
        title: `✨ New milestones for ${name}`,
        body: `At ${Math.round(ageWeeks / 4.3)} months, new milestones are entering ${name}'s window. Check the Development tab to see what to look for!`,
        data: { action: "development", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(weekKey).set({ sentAt: new Date() });
    } catch (err) {
      console.error(`Milestones for ${uid}:`, err.message);
    }
  }
});

// ── Re-engagement: gentle nudge if inactive for 3+ days ─────────
exports.reEngagement = onSchedule("every day 11:00", async () => {
  const tokens = await db.collection("fcm_tokens").get();
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

  for (const doc of tokens.docs) {
    const uid = doc.id;
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) continue;
      const data = actDoc.data();
      const lastUpdate = data.updatedAt;
      if (!lastUpdate) continue;

      const lastMs = lastUpdate.toMillis ? lastUpdate.toMillis() : new Date(lastUpdate).getTime();
      if (lastMs > threeDaysAgo) continue; // Active recently — skip

      // Don't spam — once per week max
      const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      const sentKey = `reengage_w${weekNum}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) continue;

      const name = data.babyName || "Baby";
      const daysSince = Math.round((Date.now() - lastMs) / (24 * 60 * 60 * 1000));

      const messages = [
        { title: `📱 ${name} misses you!`, body: `It's been ${daysSince} days. A quick log keeps ${name}'s sleep predictions accurate.` },
        { title: `☀️ Fresh day, fresh start`, body: `Pick up where you left off — ${name}'s patterns are waiting to be discovered.` },
        { title: `📊 Keep the data flowing`, body: `Regular logging makes OBubba's predictions smarter. Just one entry makes a difference!` },
      ];
      const msg = messages[daysSince % messages.length];

      await sendPush(uid, {
        title: msg.title,
        body: msg.body,
        data: { action: "open", channelId: "obubba_reminders" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      console.error(`Re-engagement for ${uid}:`, err.message);
    }
  }
});

// ── Cleanup: purge old push_log entries (older than 3 days) ─────
exports.cleanupPushLog = onSchedule("every day 03:00", async () => {
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const old = await db.collection("push_log")
    .where("sentAt", "<", cutoff)
    .limit(200)
    .get();

  const batch = db.batch();
  old.docs.forEach(doc => batch.delete(doc.ref));
  if (old.docs.length > 0) await batch.commit();
});
