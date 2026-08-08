const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleAuth } = require("google-auth-library");

initializeApp();
const db = getFirestore();

const CLOCK_ONLINE_COUNT_CACHE_MS = 30 * 1000;
const CLOCK_ONLINE_WINDOW_MINUTES = 5;
const CLOCK_ONLINE_WINDOW_MS = CLOCK_ONLINE_WINDOW_MINUTES * 60 * 1000;
const CLOCK_ONLINE_MAX = 60;
const GA4_PROPERTY_ID = String(process.env.GA4_PROPERTY_ID || process.env.GOOGLE_ANALYTICS_PROPERTY_ID || process.env.OB_GA4_PROPERTY_ID || "527486224").trim();
const GA4_MEASUREMENT_ID = String(process.env.GA4_MEASUREMENT_ID || "G-Y7CHSL1YHZ").trim();

let analyticsGoogleAuth = null;

function safeErrorSummary(err) {
  return String(err && (err.code || err.message) || err || "unknown")
    .replace(/\b[A-Za-z0-9_-]{12,}\b/g, "[redacted]")
    .slice(0, 140);
}

function logWarn(scope, err) {
  console.warn(scope + ":", safeErrorSummary(err));
}

function ga4PropertyId(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/(?:properties\/)?([0-9]{4,})$/);
  return match ? match[1] : "";
}

function ga4MeasurementId(value) {
  const raw = String(value || "").trim().toUpperCase();
  return /^G-[A-Z0-9]+$/.test(raw) ? raw : "";
}

function metricInt(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function timestampMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function analyticsRequest(options) {
  if (!analyticsGoogleAuth) {
    analyticsGoogleAuth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });
  }
  const client = await analyticsGoogleAuth.getClient();
  return client.request(options);
}

async function discoverGa4PropertyId() {
  const envProperty = ga4PropertyId(
    GA4_PROPERTY_ID
  );
  if (envProperty) return envProperty;

  const measurementId = ga4MeasurementId(GA4_MEASUREMENT_ID);
  if (!measurementId) return "";

  const cacheRef = db.collection("public_metrics").doc("ga4_property_lookup");
  try {
    const cached = await cacheRef.get();
    const data = cached.exists ? cached.data() || {} : {};
    const cachedProperty = ga4PropertyId(data.propertyId);
    const cachedFor = ga4MeasurementId(data.measurementId);
    const cachedAt = timestampMs(data.updatedAtMs || data.updatedAt);
    if (cachedProperty && cachedFor === measurementId && cachedAt && Date.now() - cachedAt < 24 * 60 * 60 * 1000) {
      return cachedProperty;
    }
  } catch (err) {
    logWarn("GA4 property cache read failed", err);
  }

  try {
    const summaries = await analyticsRequest({
      url: "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
      method: "GET",
      params: { pageSize: 200 },
    });
    const accountSummaries = Array.isArray(summaries.data && summaries.data.accountSummaries)
      ? summaries.data.accountSummaries
      : [];
    const propertyNames = [];
    accountSummaries.forEach((account) => {
      (Array.isArray(account.propertySummaries) ? account.propertySummaries : []).forEach((property) => {
        const propertyId = ga4PropertyId(property.property);
        if (propertyId) propertyNames.push("properties/" + propertyId);
      });
    });

    for (const propertyName of propertyNames.slice(0, 60)) {
      try {
        const streams = await analyticsRequest({
          url: "https://analyticsadmin.googleapis.com/v1beta/" + propertyName + "/dataStreams",
          method: "GET",
          params: { pageSize: 200 },
        });
        const dataStreams = Array.isArray(streams.data && streams.data.dataStreams)
          ? streams.data.dataStreams
          : [];
        const match = dataStreams.find((stream) => {
          const web = stream && stream.webStreamData;
          return web && ga4MeasurementId(web.measurementId) === measurementId;
        });
        if (match) {
          const propertyId = ga4PropertyId(propertyName);
          await cacheRef.set({
            propertyId,
            measurementId,
            updatedAtMs: Date.now(),
            updatedAt: new Date().toISOString(),
          }, { merge: true }).catch((err) => logWarn("GA4 property cache write failed", err));
          return propertyId;
        }
      } catch (err) {
        logWarn("GA4 data stream lookup failed", err);
      }
    }
  } catch (err) {
    logWarn("GA4 account summary lookup failed", err);
  }

  return "";
}

async function fetchGa4RealtimeActiveUsers() {
  const propertyId = await discoverGa4PropertyId();
  if (!propertyId) return null;
  const response = await analyticsRequest({
    url: "https://analyticsdata.googleapis.com/v1beta/properties/" + propertyId + ":runRealtimeReport",
    method: "POST",
    data: {
      metrics: [{ name: "activeUsers" }],
      minuteRanges: [{ name: "0-4 minutes ago", startMinutesAgo: 4, endMinutesAgo: 0 }],
      limit: "1",
    },
  });
  const row = response.data && Array.isArray(response.data.rows) ? response.data.rows[0] : null;
  const value = row && Array.isArray(row.metricValues) && row.metricValues[0]
    ? row.metricValues[0].value
    : "0";
  const count = metricInt(value);
  return count === null ? 0 : count;
}

async function countClockPresenceUsers(nowMs) {
  const cutoffMs = nowMs - CLOCK_ONLINE_WINDOW_MS;
  const snap = await db.collection("bubba_presence")
    .orderBy("lastSeenMs", "desc")
    .limit(CLOCK_ONLINE_MAX)
    .get();
  const seen = new Set();
  snap.docs.forEach((doc) => {
    const data = doc.data() || {};
    if (data.app !== "obubba") return;
    const lastSeen = Number(data.lastSeenMs) || timestampMs(data.lastSeenClient);
    if (!lastSeen || lastSeen < cutoffMs || lastSeen > nowMs + 2 * 60 * 1000) return;
    const id = String(data.fromId || doc.id || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
  });
  return seen.size;
}

async function buildClockOnlineParentCountPayload() {
  const nowMs = Date.now();
  const cacheRef = db.collection("public_metrics").doc("clock_online_count");
  try {
    const cached = await cacheRef.get();
    const data = cached.exists ? cached.data() || {} : {};
    const cachedAt = Number(data.generatedAtMs) || timestampMs(data.generatedAt);
    const count = metricInt(data.count);
    if (count !== null && cachedAt && nowMs - cachedAt < CLOCK_ONLINE_COUNT_CACHE_MS) {
      return {
        count,
        source: String(data.source || "cache").slice(0, 40),
        windowMinutes: Number(data.windowMinutes) || CLOCK_ONLINE_WINDOW_MINUTES,
        generatedAtMs: cachedAt,
        ttlMs: CLOCK_ONLINE_COUNT_CACHE_MS,
        fromCache: true,
      };
    }
  } catch (err) {
    logWarn("Clock online count cache read failed", err);
  }

  let count = null;
  let source = "google_analytics";
  try {
    count = await fetchGa4RealtimeActiveUsers();
  } catch (err) {
    logWarn("GA4 realtime online count failed", err);
  }

  if (count === null) {
    source = "presence";
    try {
      count = await countClockPresenceUsers(nowMs);
    } catch (err) {
      logWarn("Presence online count failed", err);
      count = 0;
    }
  }

  const payload = {
    count: Math.max(0, Math.min(CLOCK_ONLINE_MAX, metricInt(count) || 0)),
    source,
    windowMinutes: CLOCK_ONLINE_WINDOW_MINUTES,
    generatedAtMs: nowMs,
    generatedAt: new Date(nowMs).toISOString(),
  };

  await cacheRef.set(payload, { merge: true }).catch((err) => logWarn("Clock online count cache write failed", err));

  return {
    ...payload,
    ttlMs: CLOCK_ONLINE_COUNT_CACHE_MS,
    fromCache: false,
  };
}

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Cache-Control", "public, max-age=30, s-maxage=60");
}

exports.clockOnlineParentCount = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  try {
    res.status(200).json(await buildClockOnlineParentCountPayload());
  } catch (err) {
    console.error("Clock online count request failed:", safeErrorSummary(err));
    res.status(500).json({ error: "online_count_unavailable", count: 0, source: "error", windowMinutes: CLOCK_ONLINE_WINDOW_MINUTES });
  }
});
