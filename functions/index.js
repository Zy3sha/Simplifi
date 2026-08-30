// ══════════════════════════════════════════════════════════════════
// OBubba — Firebase Cloud Functions
// Push notifications, scheduled reminders, and background tasks
// ══════════════════════════════════════════════════════════════════

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldPath } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const crypto = require("crypto");

initializeApp({
  projectId: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "obubba-d9ccc",
});

// Lazy proxies so the Firebase Functions analyzer (which runs without GCP
// credentials and times out after 10s) does not block on synchronous
// metadata-server probes from getAuth()/getMessaging() during deploy.
function lazyAdminProxy(factory) {
  let inst = null;
  return new Proxy(function () {}, {
    get(_t, prop) {
      if (!inst) inst = factory();
      const v = inst[prop];
      return typeof v === "function" ? v.bind(inst) : v;
    },
    apply(_t, _thisArg, args) {
      if (!inst) inst = factory();
      return inst.apply(inst, args);
    },
    has(_t, prop) {
      if (!inst) inst = factory();
      return prop in inst;
    },
  });
}
const adminAuth = lazyAdminProxy(() => getAuth());
const db = lazyAdminProxy(() => getFirestore());
const messaging = lazyAdminProxy(() => getMessaging());

const CLOCK_ONLINE_COUNT_CACHE_MS = 30 * 1000;
const CLOCK_ONLINE_WINDOW_MINUTES = 5;
const CLOCK_ONLINE_WINDOW_MS = CLOCK_ONLINE_WINDOW_MINUTES * 60 * 1000;
const CLOCK_ONLINE_MAX = 60;
const GA4_PROPERTY_ID = String(process.env.GA4_PROPERTY_ID || process.env.GOOGLE_ANALYTICS_PROPERTY_ID || process.env.OB_GA4_PROPERTY_ID || "527486224").trim();
const GA4_MEASUREMENT_ID = String(process.env.GA4_MEASUREMENT_ID || "G-Y7CHSL1YHZ").trim();
let analyticsAccessTokenCache = null;

function safeErrorSummary(err) {
  const code = String(err && err.code || "").replace(/[^A-Za-z0-9/_-]/g, "").slice(0, 80);
  if (code) return code;
  const message = String(err && err.message || err || "unknown")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\b[A-Za-z0-9_-]{12,}\b/g, "[redacted]")
    .slice(0, 140);
  return message || "unknown";
}

function logFunctionError(scope, err) {
  console.error(`${scope}:`, safeErrorSummary(err));
}

function logFunctionWarn(scope, err) {
  console.warn(`${scope}:`, safeErrorSummary(err));
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

async function analyticsAccessToken() {
  const cached = analyticsAccessTokenCache;
  if (cached && cached.token && cached.expiresAtMs && Date.now() < cached.expiresAtMs - 60 * 1000) {
    return cached.token;
  }
  const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
    headers: { "Metadata-Flavor": "Google" },
  });
  if (!response.ok) throw new Error("metadata_token_" + response.status);
  const data = await response.json();
  const token = String(data && data.access_token || "");
  if (!token) throw new Error("metadata_token_empty");
  const expiresIn = Math.max(60, Number(data.expires_in) || 300);
  analyticsAccessTokenCache = {
    token,
    expiresAtMs: Date.now() + expiresIn * 1000,
  };
  return token;
}

async function analyticsRequest(options) {
  const token = await analyticsAccessToken();
  const url = new URL(options.url);
  Object.entries(options.params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  const response = await fetch(url.toString(), {
    method: options.method || "GET",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: options.data ? JSON.stringify(options.data) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error("analytics_request_" + response.status);
  return { data };
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
    logFunctionWarn("GA4 property cache read failed", err);
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
          try {
            await cacheRef.set({
              propertyId,
              measurementId,
              updatedAtMs: Date.now(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          } catch (err) {
            logFunctionWarn("GA4 property cache write failed", err);
          }
          return propertyId;
        }
      } catch (err) {
        logFunctionWarn("GA4 data stream lookup failed", err);
      }
    }
  } catch (err) {
    logFunctionWarn("GA4 account summary lookup failed", err);
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
    logFunctionWarn("Clock online count cache read failed", err);
  }

  let count = null;
  let source = "google_analytics";
  try {
    count = await fetchGa4RealtimeActiveUsers();
  } catch (err) {
    logFunctionWarn("GA4 realtime online count failed", err);
  }

  if (count === null) {
    source = "presence";
    try {
      count = await countClockPresenceUsers(nowMs);
    } catch (err) {
      logFunctionWarn("Presence online count failed", err);
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

  try {
    await cacheRef.set(payload, { merge: true });
  } catch (err) {
    logFunctionWarn("Clock online count cache write failed", err);
  }

  return {
    ...payload,
    ttlMs: CLOCK_ONLINE_COUNT_CACHE_MS,
    fromCache: false,
  };
}

function normaliseUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

function usernameId(value) {
  return /^[a-z0-9_-]{3,32}$/.test(value || "");
}

function backupCodeId(value) {
  return /^BK[A-Z0-9]{6,10}$/.test(value || "");
}

function recoveryEmailId(value) {
  return /^em_[A-Za-z0-9_-]{43}$/.test(value || "") || /^[a-f0-9]{1,8}$/.test(value || "");
}

function childSyncCodeId(value) {
  return /^[A-Z0-9]{6,8}$/.test(value || "");
}

function trialDeviceId(value) {
  return /^[a-f0-9]{1,64}$/.test(value || "");
}

const TRIAL_DAYS = 14;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

function timestampMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") {
    const ms = value.toMillis();
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  }
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : 0;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) && ms > 0 ? ms : 0;
  }
  return 0;
}

function trialStartFromClient(value, nowMs) {
  const ms = timestampMs(value);
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  if (!ms || ms > nowMs || nowMs - ms > oneYearMs) return nowMs;
  return ms;
}

function publicTrialPayload(data, nowMs) {
  const startMs = timestampMs(data.trialStartedAtMs || data.trialStartedAt || data.firstInstallAt || data.createdAtClient);
  const endMs = timestampMs(data.trialEndsAtMs || data.trialEndsAt) || (startMs ? startMs + TRIAL_MS : 0);
  const used = data.trialUsed === true || !!data.trialEndedAt || (!!endMs && nowMs >= endMs);
  const active = !!(startMs && endMs && !used && nowMs < endMs);
  return {
    trialStartedAt: startMs ? new Date(startMs).toISOString() : "",
    trialEndsAt: endMs ? new Date(endMs).toISOString() : "",
    trialStartedAtMs: startMs || 0,
    trialEndsAtMs: endMs || 0,
    trialUsed: used,
    trialActive: active,
    daysLeft: active ? Math.max(0, Math.ceil((endMs - nowMs) / (24 * 60 * 60 * 1000))) : 0,
    source: "server",
  };
}

const STORE_PRODUCT_IDS = new Set([
  "com.obubba.premium.monthly",
  "com.obubba.premium.annual",
  "com.obubba.premium.lifetime",
  "com.obubba.premium.monthly.v2",
  "com.obubba.premium.annual.v2",
  "com.obubba.premium.lifetime.v2",
  // iOS registers lifetime as `.forever` (App Store Connect never had `.lifetime`);
  // the client sells `.forever`/`.forever.v2` on iOS (VERIFIED from prod purchase
  // events). WITHOUT these here, normaliseStoreProductId returns "" and
  // mirrorStoreEntitlement throws "Invalid store product" on EVERY iOS lifetime
  // purchase — the main iOS paid product — so it was never recorded or bridged.
  "com.obubba.premium.forever",
  "com.obubba.premium.forever.v2",
]);
const STORE_REPORT_STALE_MS = 45 * 24 * 60 * 60 * 1000;

function normaliseStorePlatform(value) {
  const clean = String(value || "").trim().toLowerCase();
  return clean === "ios" || clean === "android" ? clean : "";
}

function normaliseStoreProductId(value) {
  const clean = String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 120);
  return STORE_PRODUCT_IDS.has(clean) ? clean : "";
}

function storePeriodFromProductId(productId) {
  const id = String(productId || "").toLowerCase();
  // `forever` is the iOS lifetime id quirk — must classify as lifetime too, or
  // storeKindFromProductId mislabels an iOS lifetime purchase as a subscription.
  if (id.includes("lifetime") || id.includes("forever")) return "lifetime";
  if (id.includes("annual") || id.includes("year")) return "annual";
  if (id.includes("monthly") || id.includes("month")) return "monthly";
  return "";
}

function storeKindFromProductId(productId) {
  return storePeriodFromProductId(productId) === "lifetime" ? "lifetime" : "subscription";
}

function boundedStoreToken(value) {
  return String(value || "").replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 180);
}

function hashStoreToken(value) {
  const clean = boundedStoreToken(value);
  return clean ? crypto.createHash("sha256").update(clean).digest("hex") : "";
}

function parseChildSyncCodes(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try { return parseChildSyncCodes(JSON.parse(value)); } catch { return {}; }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [childId, code] of Object.entries(value)) {
    const cleanId = String(childId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
    const cleanCode = String(code || "").trim().toUpperCase();
    if (cleanId && childSyncCodeId(cleanCode)) out[cleanId] = cleanCode;
  }
  return out;
}

function parseObjectPayload(value) {
  if (!value) return null;
  if (typeof value === "string") {
    try { return parseObjectPayload(JSON.parse(value)); } catch { return null; }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function childCodeMapIdsForOwner(childId, child, ownerSeed) {
  const cleanChildId = String(childId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
  if (!cleanChildId) return [];
  const owner = normaliseUsername(ownerSeed) || legacyHashPin(ownerSeed || "local");
  const childObj = child && typeof child === "object" && !Array.isArray(child) ? child : {};
  const name = String(childObj.name || "baby").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const dob = String(childObj.dob || childObj.dueDate || childObj.birthDate || "").trim().toLowerCase();
  const sig = `${owner}|${name || "baby"}|${dob || "no-date"}`;
  return [...new Set([
    cleanChildId,
    "owner_child_" + legacyHashPin(`${owner}|${cleanChildId}`),
    "owner_sig_" + legacyHashPin(sig),
  ])];
}

function legacyHashPin(pin) {
  let h = 5381;
  const text = String(pin || "");
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h) + text.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function base64Url(buffer) {
  return Buffer.from(buffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function hardenedHash(value, saltPrefix, username) {
  const key = normaliseUsername(username);
  const salt = `${saltPrefix}${key}`;
  const iterations = 120000;
  const derived = crypto.pbkdf2Sync(String(value || ""), salt, iterations, 32, "sha256");
  return `v2$pbkdf2-sha256$${iterations}$${base64Url(derived)}`;
}

function accountPinHash(pin, username) {
  return hardenedHash(pin, "obubba:pin:v2:", username);
}

function recoveryWordHash(word, username) {
  return hardenedHash(String(word || "").trim().toLowerCase(), "obubba:recovery-word:v2:", username);
}

function publicAccountPayload(username, data) {
  const out = {
    displayName: typeof data.displayName === "string" ? data.displayName : username,
    backupCode: typeof data.backupCode === "string" ? data.backupCode : null,
    familyCode: typeof data.familyCode === "string" ? data.familyCode : null,
    childSyncCodes: (typeof data.childSyncCodes === "string" || (data.childSyncCodes && typeof data.childSyncCodes === "object")) ? data.childSyncCodes : {},
    createdAt: data.createdAt || data.createdAtClient || null,
    createdAtClient: data.createdAtClient || null,
    trialStartedAtClient: data.trialStartedAtClient || "",
    trialFirstInstallAtClient: data.trialFirstInstallAtClient || "",
    trialDeviceKey: data.trialDeviceKey || "",
    trialEndsAtClient: data.trialEndsAtClient || "",
    trialUsed: !!data.trialUsed,
    trialEndedAtClient: data.trialEndedAtClient || "",
    trialUpdatedAtClient: data.trialUpdatedAtClient || "",
    recoveryEmailLookupId: data.recoveryEmailLookupId || "",
    recoveryEmailHashVersion: data.recoveryEmailHashVersion || "",
    recoveryEmailUpdatedAtClient: data.recoveryEmailUpdatedAtClient || "",
    deleted: !!data.deleted,
  };
  return out;
}

async function authoriseUsernameForUid(ref, uid) {
  if (!uid) return;
  await ref.set({
    uid,
    authorizedUids: { [uid]: true },
    updatedAt: new Date(),
  }, { merge: true });
}

function userOwnsAccountData(data, uid) {
  return !!uid && !!data && (
    data.uid === uid ||
    (data.authorizedUids && data.authorizedUids[uid] === true)
  );
}

function accountBackupMatches(data, backupCode) {
  const code = String(backupCode || "").trim().toUpperCase();
  return backupCodeId(code) && !!data && (
    String(data.backupCode || "").trim().toUpperCase() === code ||
    String(data.familyCode || "").trim().toUpperCase() === code
  );
}

function accountPinMatches(data, pin, username) {
  if (!data) return false;
  const cleanPin = String(pin || "");
  if (!/^\d{4}$/.test(cleanPin)) return false;
  const storedPinHash = String(data.pinHash || "");
  return storedPinHash === accountPinHash(cleanPin, username) || storedPinHash === legacyHashPin(cleanPin);
}

const PROVIDER_IDS = new Set(["apple.com", "google.com"]);
const BACKUP_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BACKUP_CODE_LEN = 10;

function cleanProviderId(value) {
  const id = String(value || "").trim().toLowerCase();
  return PROVIDER_IDS.has(id) ? id : "";
}

function providerDocId(providerId) {
  return cleanProviderId(providerId);
}

function safeDisplayName(value, fallback) {
  return String(value || fallback || "").trim().slice(0, 40) || String(fallback || "parent").slice(0, 40);
}

function providerUsernameSeed(ctx, requested) {
  const explicit = normaliseUsername(requested);
  if (usernameId(explicit)) return explicit;
  const name = normaliseUsername(ctx.displayName || "");
  if (usernameId(name)) return name;
  const emailPrefix = normaliseUsername(String(ctx.email || "").split("@")[0] || "");
  if (usernameId(emailPrefix)) return emailPrefix;
  return "parent";
}

async function uniqueUsernameFromSeed(seed) {
  const base = (normaliseUsername(seed) || "parent").slice(0, 24) || "parent";
  const first = usernameId(base) ? base : "parent";
  for (let attempt = 0; attempt < 18; attempt++) {
    const suffix = attempt === 0 ? "" : "_" + crypto.randomBytes(2).toString("hex");
    const candidate = (first + suffix).slice(0, 32);
    if (!usernameId(candidate)) continue;
    const snap = await db.collection("usernames").doc(candidate).get();
    const data = snap.exists ? snap.data() || {} : {};
    if (!snap.exists || data.deleted) return candidate;
  }
  return "parent_" + crypto.randomBytes(4).toString("hex");
}

function makeServerBackupCode() {
  let code = "BK";
  const bytes = crypto.randomBytes(BACKUP_CODE_LEN);
  for (let i = 0; i < BACKUP_CODE_LEN; i++) {
    code += BACKUP_CODE_CHARS[bytes[i] % BACKUP_CODE_CHARS.length];
  }
  return code;
}

async function generateUniqueServerBackupCode() {
  for (let attempt = 0; attempt < 30; attempt++) {
    const code = makeServerBackupCode();
    const snap = await db.collection("families").doc(code).get();
    if (!snap.exists) return code;
  }
  return makeServerBackupCode();
}

async function verifiedProviderContext(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const requested = cleanProviderId(request.data && request.data.providerId);
  const firebaseToken = (request.auth.token && request.auth.token.firebase) || {};
  const tokenProvider = cleanProviderId(firebaseToken.sign_in_provider);
  const identities = firebaseToken.identities && typeof firebaseToken.identities === "object" ? firebaseToken.identities : {};
  const identityProvider = Object.keys(identities).map(cleanProviderId).find(Boolean) || "";
  let actualProvider = requested && (requested === tokenProvider || identities[requested]) ? requested : (tokenProvider || identityProvider);

  let user = null;
  if (!actualProvider || !PROVIDER_IDS.has(actualProvider) || (requested && actualProvider !== requested)) {
    user = await adminAuth.getUser(request.auth.uid).catch(() => null);
    const providerMatch = (user && Array.isArray(user.providerData) ? user.providerData : [])
      .find(info => PROVIDER_IDS.has(info.providerId) && (!requested || info.providerId === requested));
    if (providerMatch) actualProvider = providerMatch.providerId;
  }
  if (!actualProvider || !PROVIDER_IDS.has(actualProvider)) {
    throw new HttpsError("permission-denied", "Sign in with Apple or Google first");
  }
  if (requested && actualProvider !== requested) {
    throw new HttpsError("permission-denied", "Provider does not match this sign-in");
  }
  if (!user) user = await adminAuth.getUser(request.auth.uid).catch(() => null);
  const providerInfo = (user && Array.isArray(user.providerData) ? user.providerData : [])
    .find(info => info.providerId === actualProvider) || {};
  return {
    uid: request.auth.uid,
    providerId: actualProvider,
    email: String(providerInfo.email || (user && user.email) || request.auth.token.email || "").trim().toLowerCase(),
    displayName: safeDisplayName(providerInfo.displayName || (user && user.displayName) || request.auth.token.name, actualProvider === "apple.com" ? "Apple parent" : "Google parent"),
  };
}

function providerProofPatch(data, username, proofData) {
  const pin = String((proofData && proofData.pin) || "");
  const backupCode = String((proofData && proofData.backupCode) || "").trim().toUpperCase();
  const proof = String((proofData && proofData.proof) || "").trim();
  const storedPinHash = String(data && data.pinHash || "");
  if (/^\d{4}$/.test(pin)) {
    const strong = accountPinHash(pin, username);
    const legacy = legacyHashPin(pin);
    if (storedPinHash === strong || storedPinHash === legacy) {
      const patch = {};
      if (storedPinHash === legacy) {
        patch.pinHash = strong;
        patch.pinHashVersion = "pbkdf2-v2";
        patch.pinHashUpdatedAtClient = new Date().toISOString();
      }
      return { ok: true, patch };
    }
  }
  if (accountBackupMatches(data, backupCode) || accountBackupMatches(data, proof)) return { ok: true, patch: {} };
  if (proof) {
    const legacyRecovery = legacyHashPin(proof.toLowerCase());
    const strongRecovery = recoveryWordHash(proof, username);
    if (data && data.recoveryHash && (data.recoveryHash === strongRecovery || data.recoveryHash === legacyRecovery)) {
      const patch = {};
      if (data.recoveryHash === legacyRecovery) {
        patch.recoveryHash = strongRecovery;
        patch.recoveryHashVersion = "pbkdf2-v2";
        patch.recoveryHashUpdatedAtClient = new Date().toISOString();
      }
      return { ok: true, patch };
    }
  }
  return { ok: false, patch: {} };
}

async function attachProviderLink(ctx, username, accountData, extraPatch) {
  const now = new Date();
  const linkRef = db.collection("auth_provider_links").doc(ctx.uid);
  const usernameRef = db.collection("usernames").doc(username);
  const providerRef = usernameRef.collection("provider_links").doc(providerDocId(ctx.providerId));
  await db.runTransaction(async (tx) => {
    const [linkSnap, providerSnap] = await Promise.all([tx.get(linkRef), tx.get(providerRef)]);
    const linkedUsername = linkSnap.exists ? normaliseUsername((linkSnap.data() || {}).username) : "";
    if (linkedUsername && linkedUsername !== username) {
      throw new HttpsError("already-exists", "This Apple or Google sign-in is already connected to another OBubba account");
    }
    const linkedUid = providerSnap.exists ? String((providerSnap.data() || {}).uid || "") : "";
    if (linkedUid && linkedUid !== ctx.uid) {
      throw new HttpsError("already-exists", "This OBubba account is already connected to another sign-in for that provider");
    }
    tx.set(usernameRef, {
      ...(extraPatch || {}),
      uid: ctx.uid,
      authorizedUids: { [ctx.uid]: true },
      updatedAt: now,
    }, { merge: true });
    tx.set(linkRef, { username, providerId: ctx.providerId, linkedAt: now, updatedAt: now }, { merge: true });
    tx.set(providerRef, { uid: ctx.uid, providerId: ctx.providerId, linkedAt: now, updatedAt: now }, { merge: true });
    const backupCode = String((accountData && (accountData.backupCode || accountData.familyCode)) || "").trim().toUpperCase();
    if (backupCodeId(backupCode)) {
      tx.set(db.collection("uid_to_backup").doc(ctx.uid), {
        backupCode,
        childSyncCodes: parseChildSyncCodes(accountData.childSyncCodes),
        updatedAt: now,
      }, { merge: true });
    }
  });
}

exports.usernameStatus = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const username = normaliseUsername(request.data && request.data.username);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  const snap = await db.collection("usernames").doc(username).get();
  const data = snap.exists ? snap.data() || {} : {};
  return { exists: snap.exists && !data.deleted };
});

// Mint a JS-SDK custom token tied to the same UID the native Capacitor
// FirebaseAuthentication plugin already holds. The plugin authenticates the
// native side but does NOT propagate auth state to the JS Firebase SDK — so
// without this exchange, JS-SDK Firestore listeners run as an anonymous user
// whose uid_to_backup mapping does not exist, and every read/write returns
// permission-denied (visible to the user as 'Sync paused'). Verifying the
// caller's native ID token here proves the JS bridge legitimately holds that
// UID before we hand back a custom token to signInWithCustomToken with.
// minInstances: keep ONE warm instance so sign-in / launch never pays a cold start
// (2-5s on Gen2). This is the auth path — a cold "couldn't reach the server" here is
// a first-impression churn driver. ~a few $/mo per warmed fn; revert to remove.
exports.exchangeNativeAuthToken = onCall({ minInstances: 1 }, async (request) => {
  try {
    const idToken = String((request.data && request.data.idToken) || "").trim();
    if (!idToken) throw new HttpsError("invalid-argument", "missing_token");
    if (idToken.length < 100 || idToken.length > 8192) throw new HttpsError("invalid-argument", "invalid_token");
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const uid = String(decoded && decoded.uid || "");
    if (!uid) throw new HttpsError("invalid-argument", "no_uid");
    const customToken = await adminAuth.createCustomToken(uid);
    return { ok: true, customToken, uid };
  } catch (err) {
    logFunctionWarn("exchangeNativeAuthToken", err);
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", "exchange_failed");
  }
});

exports.accountLogin = onCall({ minInstances: 1 }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const username = normaliseUsername(request.data && request.data.username);
  const pin = String((request.data && request.data.pin) || "");
  const preHashed = !!(request.data && request.data.preHashed);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  if (!preHashed && !/^\d{4}$/.test(pin)) throw new HttpsError("invalid-argument", "PIN must be 4 digits");

  const ref = db.collection("usernames").doc(username);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "Username not found" };
  const data = snap.data() || {};
  if (data.deleted) return { ok: false, error: "Username not found" };

  const storedPinHash = String(data.pinHash || "");
  const strong = accountPinHash(pin, username);
  const legacy = legacyHashPin(pin);
  const pinOk = preHashed ? storedPinHash === pin : (storedPinHash === strong || storedPinHash === legacy);
  if (!pinOk) return { ok: false, error: "Incorrect PIN" };

  const patch = {
    uid: request.auth.uid,
    authorizedUids: { [request.auth.uid]: true },
    updatedAt: new Date(),
  };
  if (!preHashed && storedPinHash === legacy) {
    patch.pinHash = strong;
    patch.pinHashVersion = "pbkdf2-v2";
    patch.pinHashUpdatedAtClient = new Date().toISOString();
  }
  await ref.set(patch, { merge: true });

  // Soft-deleted accounts can still sign in during the 7-day grace window
  // so the client can offer a one-tap restore. Past the grace window the
  // scheduled purge will already have wiped this row, so reaching here
  // with pendingDelete=true means the user is inside the restore window.
  if (data.pendingDelete) {
    const hardAt = Number(data.scheduledHardDeleteAtMs || 0);
    if (hardAt && Date.now() > hardAt) {
      return { ok: false, error: "Account scheduled for permanent deletion" };
    }
    return {
      ok: true,
      restorable: true,
      pendingDelete: true,
      scheduledHardDeleteAtMs: hardAt || null,
      graceDays: ACCOUNT_DELETE_GRACE_DAYS,
      account: publicAccountPayload(username, data),
    };
  }
  return { ok: true, account: publicAccountPayload(username, data) };
});

exports.resetAccountPin = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const username = normaliseUsername(request.data && request.data.username);
  const proof = String((request.data && request.data.proof) || "").trim();
  const newPin = String((request.data && request.data.newPin) || "");
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  if (!proof) throw new HttpsError("invalid-argument", "Recovery code required");
  if (!/^\d{4}$/.test(newPin)) throw new HttpsError("invalid-argument", "PIN must be 4 digits");

  const ref = db.collection("usernames").doc(username);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "Username not found" };
  const data = snap.data() || {};
  if (data.deleted) return { ok: false, error: "Username not found" };

  const codeMatch = String(data.backupCode || data.familyCode || "").toUpperCase() === proof.toUpperCase();
  const legacyRecovery = legacyHashPin(proof.toLowerCase());
  const strongRecovery = recoveryWordHash(proof, username);
  const wordMatch = data.recoveryHash && (data.recoveryHash === strongRecovery || data.recoveryHash === legacyRecovery);
  if (!codeMatch && !wordMatch) return { ok: false, error: "That doesn't match. check your recovery word" };

  const patch = {
    uid: request.auth.uid,
    authorizedUids: { [request.auth.uid]: true },
    pinHash: accountPinHash(newPin, username),
    pinHashVersion: "pbkdf2-v2",
    pinHashUpdatedAtClient: new Date().toISOString(),
    updatedAt: new Date(),
  };
  if (wordMatch && data.recoveryHash === legacyRecovery) {
    patch.recoveryHash = strongRecovery;
    patch.recoveryHashVersion = "pbkdf2-v2";
    patch.recoveryHashUpdatedAtClient = new Date().toISOString();
  }
  await ref.set(patch, { merge: true });
  return { ok: true };
});

exports.accountSignInStatus = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const username = normaliseUsername(request.data && request.data.username);
  const backupCode = String((request.data && request.data.backupCode) || "").trim().toUpperCase();
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  if (!backupCodeId(backupCode)) return { ok: false, status: "needed", message: "Backup code missing. save to cloud first, then repair sign-in." };

  const snap = await db.collection("usernames").doc(username).get();
  if (!snap.exists) {
    return { ok: false, status: "needed", message: "This device has your OBubba data and backup code, but the cloud username record is missing. Recreate it here so other devices can find your account." };
  }
  const data = snap.data() || {};
  if (data.deleted) {
    return { ok: false, status: "needed", message: "This username was deleted. choose a new username" };
  }
  if (accountBackupMatches(data, backupCode)) return { ok: true, status: "ok" };
  if (userOwnsAccountData(data, uid) && (!data.backupCode || !backupCodeId(String(data.backupCode).trim().toUpperCase()))) {
    return { ok: false, status: "needed", message: "The cloud username record needs refreshing for this device's backup. Choose a 4-digit PIN to relink sign-in safely." };
  }
  return { ok: false, status: "needed", message: "The cloud username record does not match this device's backup. Repair sign-in with this phone's backup code." };
});

exports.repairAccountSignIn = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const username = normaliseUsername(request.data && request.data.username);
  const backupCode = String((request.data && request.data.backupCode) || "").trim().toUpperCase();
  const pin = String((request.data && request.data.pin) || "");
  const displayName = String((request.data && request.data.displayName) || username).trim().slice(0, 40) || username;
  const familyCode = String((request.data && request.data.familyCode) || "").trim().toUpperCase();
  const createdAtClient = String((request.data && request.data.createdAtClient) || "").slice(0, 40);
  const requestedChildSyncCodes = parseChildSyncCodes(request.data && request.data.childSyncCodes);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  if (!backupCodeId(backupCode)) throw new HttpsError("invalid-argument", "Invalid backup code");
  if (!/^\d{4}$/.test(pin)) throw new HttpsError("invalid-argument", "PIN must be 4 digits");

  const ref = db.collection("usernames").doc(username);
  const snap = await ref.get();
  const data = snap.exists ? (snap.data() || {}) : null;
  if (data && data.deleted) return { ok: false, error: "This username was deleted. choose a new username" };
  const backupMatches = accountBackupMatches(data, backupCode);
  const pinMatchesExisting = accountPinMatches(data, pin, username);
  if (data && !userOwnsAccountData(data, uid) && !backupMatches && !pinMatchesExisting) {
    return { ok: false, error: "Backup code does not match this username" };
  }

  const childSyncCodes = {
    ...parseChildSyncCodes(data && data.childSyncCodes),
    ...requestedChildSyncCodes,
  };
  const now = new Date();
  const patch = {
    uid,
    authorizedUids: { [uid]: true },
    pinHash: accountPinHash(pin, username),
    pinHashVersion: "pbkdf2-v2",
    pinHashUpdatedAtClient: now.toISOString(),
    backupCode: backupMatches && data && data.backupCode ? data.backupCode : backupCode,
    childSyncCodes,
    displayName: data && typeof data.displayName === "string" && data.displayName.trim() ? data.displayName : displayName,
    updatedAt: now,
  };
  if (familyCode && backupCodeId(familyCode) && !(data && data.familyCode)) patch.familyCode = familyCode;
  if (!snap.exists) {
    patch.createdAt = now;
    patch.familyCode = patch.familyCode || null;
    patch.deleted = false;
  }
  if (createdAtClient && !(data && data.createdAtClient)) patch.createdAtClient = createdAtClient;

  await ref.set(patch, { merge: true });
  await db.collection("uid_to_backup").doc(uid).set({
    backupCode,
    childSyncCodes,
    updatedAt: now,
  }, { merge: true });

  const nextData = { ...(data || {}), ...patch };
  return { ok: true, account: publicAccountPayload(username, nextData) };
});

exports.saveRecoveryEmail = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const username = normaliseUsername(request.data && request.data.username);
  const emailLookupId = String((request.data && request.data.emailLookupId) || "");
  const backupCode = String((request.data && request.data.backupCode) || "").trim().toUpperCase();
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  if (!recoveryEmailId(emailLookupId)) throw new HttpsError("invalid-argument", "Invalid recovery email id");

  const ref = db.collection("usernames").doc(username);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "Repair sign-in first, then save recovery email" };
  const data = snap.data() || {};
  if (data.deleted) return { ok: false, error: "Username not found" };
  const owner = userOwnsAccountData(data, uid);
  const backupMatches = accountBackupMatches(data, backupCode);
  if (!owner && !backupMatches) return { ok: false, error: "Sign-in repair needed before saving recovery email" };

  const now = new Date();
  await ref.set({
    recoveryEmailLookupId: emailLookupId,
    recoveryEmailHashVersion: "sha256-v2",
    recoveryEmailUpdatedAtClient: now.toISOString(),
    uid,
    authorizedUids: { [uid]: true },
    updatedAt: now,
  }, { merge: true });
  await db.collection("recovery_emails").doc(emailLookupId).set({ username, updatedAt: now }, { merge: true });
  const previousLookupId = String(data.recoveryEmailLookupId || "");
  if (previousLookupId && previousLookupId !== emailLookupId && recoveryEmailId(previousLookupId)) {
    await db.collection("recovery_emails").doc(previousLookupId).delete().catch(() => null);
  }
  return { ok: true };
});

exports.recoveryEmailLookup = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const ids = [
    String((request.data && request.data.emailLookupId) || ""),
    String((request.data && request.data.legacyEmailLookupId) || ""),
  ].filter(Boolean);
  const validId = (id) => /^em_[A-Za-z0-9_-]{43}$/.test(id) || /^[a-f0-9]{1,8}$/.test(id);
  for (const id of ids) {
    if (!validId(id)) continue;
    const lookup = await db.collection("recovery_emails").doc(id).get();
    if (!lookup.exists) continue;
    const username = normaliseUsername((lookup.data() || {}).username);
    if (!usernameId(username)) continue;
    const userSnap = await db.collection("usernames").doc(username).get();
    if (!userSnap.exists) continue;
    const data = userSnap.data() || {};
    if (data.deleted) continue;
    if (data.recoveryEmailLookupId && data.recoveryEmailLookupId !== id && id.startsWith("em_")) continue;
    return { ok: true, username };
  }
  return { ok: false };
});

exports.providerAccountStatus = onCall(async (request) => {
  const ctx = await verifiedProviderContext(request);
  const linkSnap = await db.collection("auth_provider_links").doc(ctx.uid).get();
  if (linkSnap.exists) {
    const username = normaliseUsername((linkSnap.data() || {}).username);
    if (usernameId(username)) {
      const ref = db.collection("usernames").doc(username);
      const snap = await ref.get();
      const data = snap.exists ? snap.data() || {} : {};
      if (snap.exists && !data.deleted) {
        await authoriseUsernameForUid(ref, ctx.uid);
        return { ok: true, status: "linked", providerId: ctx.providerId, username, account: publicAccountPayload(username, data) };
      }
    }
  }

  const emailLookupId = String((request.data && request.data.emailLookupId) || "");
  if (recoveryEmailId(emailLookupId)) {
    const lookup = await db.collection("recovery_emails").doc(emailLookupId).get();
    if (lookup.exists) {
      const username = normaliseUsername((lookup.data() || {}).username);
      if (usernameId(username)) {
        const userSnap = await db.collection("usernames").doc(username).get();
        const data = userSnap.exists ? userSnap.data() || {} : {};
        if (userSnap.exists && !data.deleted && (!data.recoveryEmailLookupId || data.recoveryEmailLookupId === emailLookupId)) {
          return {
            ok: true,
            status: "recovery_match_needs_proof",
            providerId: ctx.providerId,
            username,
            displayName: data.displayName || username,
          };
        }
      }
    }
  }

  const suggestedUsername = await uniqueUsernameFromSeed(providerUsernameSeed(ctx, request.data && request.data.requestedUsername));
  return { ok: true, status: "new_account", providerId: ctx.providerId, suggestedUsername };
});

exports.linkProviderAccount = onCall(async (request) => {
  const ctx = await verifiedProviderContext(request);
  const username = normaliseUsername(request.data && request.data.username);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");

  const ref = db.collection("usernames").doc(username);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "Username not found" };
  const data = snap.data() || {};
  if (data.deleted) return { ok: false, error: "Username not found" };

  const proof = providerProofPatch(data, username, request.data || {});
  if (!proof.ok) return { ok: false, error: "That PIN, backup code, or recovery word did not match" };

  await attachProviderLink(ctx, username, data, proof.patch);
  const nextSnap = await ref.get();
  return {
    ok: true,
    status: "linked",
    providerId: ctx.providerId,
    username,
    account: publicAccountPayload(username, nextSnap.exists ? nextSnap.data() || {} : data),
  };
});

exports.createProviderAccount = onCall(async (request) => {
  const ctx = await verifiedProviderContext(request);
  const existingLink = await db.collection("auth_provider_links").doc(ctx.uid).get();
  if (existingLink.exists) {
    const username = normaliseUsername((existingLink.data() || {}).username);
    if (usernameId(username)) {
      const ref = db.collection("usernames").doc(username);
      const snap = await ref.get();
      const data = snap.exists ? snap.data() || {} : {};
      if (snap.exists && !data.deleted) {
        await authoriseUsernameForUid(ref, ctx.uid);
        return { ok: true, status: "linked", providerId: ctx.providerId, username, account: publicAccountPayload(username, data) };
      }
    }
  }

  const requestedBackup = String((request.data && request.data.backupCode) || "").trim().toUpperCase();
  const backupCode = backupCodeId(requestedBackup) ? requestedBackup : await generateUniqueServerBackupCode();
  const requestedChildSyncCodes = parseChildSyncCodes(request.data && request.data.childSyncCodes);
  const now = new Date();
  const trialStart = String((request.data && (request.data.trialStartedAtClient || request.data.trialFirstInstallAtClient)) || "").slice(0, 40);
  const trialFirstInstall = String((request.data && request.data.trialFirstInstallAtClient) || trialStart || "").slice(0, 40);
  const trialDeviceKey = String((request.data && request.data.trialDeviceKey) || "").trim().toLowerCase().slice(0, 80);
  const displayNameSeed = safeDisplayName(request.data && request.data.displayName, ctx.displayName);
  let username = await uniqueUsernameFromSeed(providerUsernameSeed(ctx, request.data && request.data.requestedUsername));

  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = db.collection("usernames").doc(username);
    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const data = snap.exists ? snap.data() || {} : {};
        if (snap.exists && !data.deleted) throw new HttpsError("already-exists", "Username already exists");
        const accountPatch = {
          uid: ctx.uid,
          authorizedUids: { [ctx.uid]: true },
          backupCode,
          familyCode: null,
          childSyncCodes: requestedChildSyncCodes,
          createdAt: now,
          createdAtClient: String((request.data && request.data.createdAtClient) || now.toISOString()).slice(0, 40),
          displayName: safeDisplayName(displayNameSeed, username),
          trialStartedAtClient: trialStart || now.toISOString(),
          trialFirstInstallAtClient: trialFirstInstall || trialStart || now.toISOString(),
          trialDeviceKey: trialDeviceId(trialDeviceKey) ? trialDeviceKey : "",
          trialUsed: !!(request.data && request.data.trialUsed),
          trialEndedAtClient: String((request.data && request.data.trialEndedAtClient) || "").slice(0, 40),
          trialUpdatedAtClient: now.toISOString(),
          deleted: false,
          updatedAt: now,
        };
        tx.set(ref, accountPatch, { merge: true });
        tx.set(db.collection("auth_provider_links").doc(ctx.uid), { username, providerId: ctx.providerId, linkedAt: now, updatedAt: now }, { merge: true });
        tx.set(ref.collection("provider_links").doc(providerDocId(ctx.providerId)), { uid: ctx.uid, providerId: ctx.providerId, linkedAt: now, updatedAt: now }, { merge: true });
        tx.set(db.collection("uid_to_backup").doc(ctx.uid), { backupCode, childSyncCodes: requestedChildSyncCodes, updatedAt: now }, { merge: true });
      });
      const createdSnap = await ref.get();
      return {
        ok: true,
        status: "created",
        providerId: ctx.providerId,
        username,
        account: publicAccountPayload(username, createdSnap.exists ? createdSnap.data() || {} : {}),
      };
    } catch (err) {
      if (!(err instanceof HttpsError) || err.code !== "already-exists") throw err;
      username = await uniqueUsernameFromSeed(providerUsernameSeed(ctx, `${username}_${attempt + 1}`));
    }
  }
  throw new HttpsError("aborted", "Could not create a unique username. try again");
});

// ── Referral system ─────────────────────────────────────────────────
// Sharer's username → 8-char code (FNV-1a, matches client deriveReferralCode).
// Friend redeems → server queues +30d for both. Bonus activates when friend's
// initial 14-day trial ends (claimTrial applies it). Referrer credit applies
// in the same transaction so both bonuses go live simultaneously.
const REFERRAL_BONUS_DAYS = 30;
const REFERRAL_BONUS_MS = REFERRAL_BONUS_DAYS * 24 * 60 * 60 * 1000;
const REFERRAL_MAX_PER_YEAR = 5;
// A referred friend only unlocks both free months if they GENUINELY used the app:
// logged on at least this many distinct days (blocks install-and-abandon abuse).
const REFERRAL_ACTIVE_DAYS_REQUIRED = 10;

// Count distinct days the user has actually LOGGED on, across their child_syncs.
// Read-only (done before the claimTrial transaction). Fail-safe: returns 0 on any
// error so an unverifiable account does NOT get the bonus (it stays queued).
async function countLoggedDays(uid) {
  try {
    const backupDoc = await db.collection("uid_to_backup").doc(uid).get();
    if (!backupDoc.exists) return 0;
    const codeList = Object.values(parseChildSyncCodes(backupDoc.data().childSyncCodes));
    const activeDays = new Set();
    for (const code of codeList) {
      const snap = await db.collection("child_syncs").doc(code).get();
      if (!snap.exists) continue;
      const child = parseObjectPayload(snap.data().child);
      const days = child && child.days && typeof child.days === "object" ? child.days : {};
      for (const [key, entries] of Object.entries(days)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(entries) && entries.length > 0) activeDays.add(key);
      }
    }
    return activeDays.size;
  } catch (e) {
    return 0;
  }
}
const REFERRAL_ALPHA = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const REFERRAL_CODE_RE = /^OB-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/;

function deriveReferralCodeServer(seed) {
  const s = String(seed || "").toLowerCase().trim();
  if (!s) return "";
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  let h2 = 0x811c9dc5;
  for (let i = s.length - 1; i >= 0; i--) {
    h2 ^= s.charCodeAt(i);
    h2 = (h2 + ((h2 << 1) + (h2 << 4) + (h2 << 7) + (h2 << 8) + (h2 << 24))) >>> 0;
  }
  let out = "";
  let combined = h;
  for (let i = 0; i < 8; i++) {
    if (i === 4) combined = h2;
    out += REFERRAL_ALPHA[combined % REFERRAL_ALPHA.length];
    combined = Math.floor(combined / REFERRAL_ALPHA.length);
  }
  return "OB-" + out;
}

function referralCodeId(value) {
  return REFERRAL_CODE_RE.test(String(value || "").toUpperCase());
}

exports.claimTrial = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const trialDeviceKey = String((request.data && request.data.trialDeviceKey) || "").trim().toLowerCase();
  const username = normaliseUsername(request.data && request.data.username);
  const platform = String((request.data && request.data.platform) || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24) || "native";
  const firstInstallAtClient = String((request.data && request.data.firstInstallAtClient) || "").slice(0, 40);
  if (!trialDeviceId(trialDeviceKey)) throw new HttpsError("invalid-argument", "Invalid trial device key");

  const nowMs = Date.now();
  const now = new Date(nowMs);
  // Active-use gate for the referral bonus — counted before the tx (read-only).
  const friendLoggedDays = await countLoggedDays(uid);
  const result = await db.runTransaction(async (tx) => {
    const deviceRef = db.collection("trial_devices").doc(trialDeviceKey);
    const entitlementRef = db.collection("entitlements").doc(uid);
    const usernameRef = usernameId(username) ? db.collection("usernames").doc(username) : null;
    const redemptionRef = db.collection("referral_redemptions").doc(uid);
    const [deviceSnap, entitlementSnap, usernameSnap, redemptionSnap] = await Promise.all([
      tx.get(deviceRef),
      tx.get(entitlementRef),
      usernameRef ? tx.get(usernameRef) : Promise.resolve(null),
      tx.get(redemptionRef),
    ]);

    const candidates = [];
    const pushCandidate = (data) => {
      if (!data) return;
      const startMs = timestampMs(data.trialStartedAtMs || data.trialStartedAt || data.trialStartedAtClient || data.firstInstallAt || data.createdAtClient);
      if (!startMs) return;
      const endMs = timestampMs(data.trialEndsAtMs || data.trialEndsAt || data.trialEndsAtClient) || startMs + TRIAL_MS;
      candidates.push({
        startMs,
        endMs,
        used: data.trialUsed === true || data.freeTrialUsed === true || !!data.trialEndedAt || !!data.trialEndedAtClient,
      });
    };

    pushCandidate(deviceSnap.exists ? (deviceSnap.data() || {}) : null);
    pushCandidate(entitlementSnap.exists ? (entitlementSnap.data() || {}) : null);
    const usernameData = usernameSnap && usernameSnap.exists ? (usernameSnap.data() || {}) : null;
    const ownsUsername = usernameData && !usernameData.deleted && userOwnsAccountData(usernameData, uid);
    if (ownsUsername) pushCandidate(usernameData);

    const fallbackStartMs = trialStartFromClient(firstInstallAtClient, nowMs);
    const startMs = candidates.length ? Math.min(...candidates.map(c => c.startMs)) : fallbackStartMs;
    const baselineEndMs = startMs + TRIAL_MS;
    // Preserve any server-extended endMs (e.g. previously-applied referral bonus)
    // so re-computing from startMs never erases bonus days.
    let endMs = Math.max(baselineEndMs, ...candidates.map(c => c.endMs).filter(n => Number.isFinite(n) && n > 0));

    // === REFERRAL: friend's pending bonus activates the moment the baseline trial ends ===
    // Read referrer docs eagerly (before any tx.set) so the write can be in-transaction.
    const redemption = redemptionSnap && redemptionSnap.exists ? (redemptionSnap.data() || {}) : null;
    const shouldApplyFriendBonus = !!(redemption
      && redemption.status === "queued"
      && redemption.applied !== true
      && nowMs >= baselineEndMs
      && friendLoggedDays >= REFERRAL_ACTIVE_DAYS_REQUIRED // genuine use, not install-and-abandon
      && redemption.referrerUid);
    const shouldCreditReferrer = !!(redemption
      && (shouldApplyFriendBonus || redemption.applied === true)
      && redemption.referrerCredited !== true
      && redemption.referrerUid);
    let referrerEntitlementRef = null;
    let referrerEntitlementSnap = null;
    let referrerUsernameRef = null;
    let referrerUsernameSnap = null;
    if (shouldApplyFriendBonus || shouldCreditReferrer) {
      referrerEntitlementRef = db.collection("entitlements").doc(redemption.referrerUid);
      referrerEntitlementSnap = await tx.get(referrerEntitlementRef);
      if (redemption.referrerUsername && usernameId(redemption.referrerUsername)) {
        referrerUsernameRef = db.collection("usernames").doc(redemption.referrerUsername);
        referrerUsernameSnap = await tx.get(referrerUsernameRef);
      }
    }
    // Self code (lazy register) — server derives once username is verified
    const ownCode = ownsUsername ? deriveReferralCodeServer(username) : "";
    const ownCodeRef = ownCode ? db.collection("referral_codes").doc(ownCode) : null;

    // All reads above this line; below is writes only.

    if (shouldApplyFriendBonus) {
      endMs = Math.max(nowMs, endMs) + REFERRAL_BONUS_MS;
    }

    const used = candidates.some(c => c.used) || nowMs >= endMs;
    const trialEndedAt = used ? new Date(Math.min(nowMs, endMs)).toISOString() : "";

    const devicePatch = {
      trialStartedAtMs: startMs,
      trialStartedAt: new Date(startMs).toISOString(),
      trialEndsAtMs: endMs,
      trialEndsAt: new Date(endMs).toISOString(),
      trialUsed: used,
      trialEndedAt,
      firstInstallAt: new Date(startMs).toISOString(),
      firstInstallAtClient: firstInstallAtClient || "",
      platform,
      uid,
      lastSeenAt: now,
      updatedAt: now,
      source: "claimTrial",
    };
    if (!deviceSnap.exists) devicePatch.createdAt = now;

    const entitlementPatch = {
      uid,
      trialDeviceKey,
      trialStartedAtMs: startMs,
      trialStartedAt: new Date(startMs).toISOString(),
      trialEndsAtMs: endMs,
      trialEndsAt: new Date(endMs).toISOString(),
      trialUsed: used,
      trialEndedAt,
      trialActive: !used && nowMs < endMs,
      platform,
      updatedAt: now,
      source: "claimTrial",
    };

    tx.set(deviceRef, devicePatch, { merge: true });
    tx.set(entitlementRef, entitlementPatch, { merge: true });
    if (ownsUsername && usernameRef) {
      tx.set(usernameRef, {
        trialStartedAtClient: usernameData.trialStartedAtClient || new Date(startMs).toISOString(),
        trialFirstInstallAtClient: usernameData.trialFirstInstallAtClient || new Date(startMs).toISOString(),
        trialEndsAtClient: new Date(endMs).toISOString(),
        trialDeviceKey,
        trialUsed: used,
        trialEndedAtClient: used ? (usernameData.trialEndedAtClient || trialEndedAt || now.toISOString()) : "",
        trialUpdatedAtClient: now.toISOString(),
        uid,
        authorizedUids: { [uid]: true },
        updatedAt: now,
      }, { merge: true });
    }

    // Lazy-register the sharer's own referral code so future friends can redeem it.
    if (ownCodeRef && ownsUsername) {
      tx.set(ownCodeRef, {
        code: ownCode,
        username,
        uid,
        updatedAt: now,
        createdAt: now,
      }, { merge: true });
    }

    // Apply friend's bonus (mark redemption applied).
    if (shouldApplyFriendBonus) {
      tx.set(redemptionRef, {
        applied: true,
        appliedAt: now,
        friendTrialEndsAtMs: endMs,
        friendTrialEndsAt: new Date(endMs).toISOString(),
      }, { merge: true });
    }

    // Credit referrer: extend their trial by +30d (idempotent via referrerCredited flag).
    // If referrer is in trial → trial extends. If trial expired → trial re-opens for 30d.
    // If referrer is paid subscriber → bonus sits on trialEndsAt for when paid sub ends.
    if (shouldCreditReferrer && referrerEntitlementRef) {
      const refData = referrerEntitlementSnap && referrerEntitlementSnap.exists ? (referrerEntitlementSnap.data() || {}) : {};
      const refStartMs = timestampMs(refData.trialStartedAtMs || refData.trialStartedAt) || nowMs;
      const refCurrentEndMs = timestampMs(refData.trialEndsAtMs || refData.trialEndsAt) || refStartMs + TRIAL_MS;
      const refNewEndMs = Math.max(nowMs, refCurrentEndMs) + REFERRAL_BONUS_MS;
      tx.set(referrerEntitlementRef, {
        trialStartedAtMs: refStartMs,
        trialStartedAt: new Date(refStartMs).toISOString(),
        trialEndsAtMs: refNewEndMs,
        trialEndsAt: new Date(refNewEndMs).toISOString(),
        trialUsed: false,
        trialEndedAt: "",
        trialActive: true,
        referralBonusDaysGranted: (Number(refData.referralBonusDaysGranted) || 0) + REFERRAL_BONUS_DAYS,
        lastReferralCreditAt: now,
        updatedAt: now,
      }, { merge: true });
      if (referrerUsernameRef) {
        const refUserData = referrerUsernameSnap && referrerUsernameSnap.exists ? (referrerUsernameSnap.data() || {}) : {};
        tx.set(referrerUsernameRef, {
          trialEndsAtClient: new Date(refNewEndMs).toISOString(),
          trialUsed: false,
          trialEndedAtClient: "",
          trialUpdatedAtClient: now.toISOString(),
          referralCreditsTotal: (Number(refUserData.referralCreditsTotal) || 0) + 1,
          updatedAt: now,
        }, { merge: true });
      }
      tx.set(redemptionRef, {
        referrerCredited: true,
        referrerCreditedAt: now,
        referrerTrialEndsAtMs: refNewEndMs,
      }, { merge: true });
    }

    return publicTrialPayload(entitlementPatch, nowMs);
  });

  return { ok: true, trial: result };
});

// ── Store premium reporting mirror ───────────────────────────────────────
// Native StoreKit / Google Play Billing remain the user-facing entitlement
// authority. This server record is a reporting mirror so support/admin tooling
// can count store premium users without clients writing arbitrary Firestore docs.
// Bridge an ACTIVE store purchase into the username-keyed premium_entitlements doc.
// WHY: store_entitlements/{uid} + entitlements/{uid} are keyed to the ANONYMOUS uid,
// which changes on reinstall / new device / sign-out — so a paid user who logs in
// elsewhere had no username-keyed record to restore from and showed "Free" (the
// "paid but shows Free" complaint). premium_entitlements/{username} is the ONE
// username-keyed entitlement the client is allowed to READ (refreshComplimentary),
// and it's server-owned (rules block client writes), so the bridge has to live here.
//
// SAFE BY CONSTRUCTION (no renewal webhook required for correctness):
//   • EXTEND-ONLY — never shortens a longer comp/goodwill/referral grant.
//   • Never downgrades an existing lifetime; never auto-un-revokes an admin revoke.
//   • Keys the expiry to the REAL store expiry, so a lapsed/cancelled sub falls off
//     NATURALLY at period end (a renewal re-reports on next app open and extends).
//   • Lifetime (iOS `.forever` / Android `.lifetime`) → permanent.
// A server notification webhook would only make renewals instant instead of
// next-open; it is a latency nicety, not needed for this to be correct.
async function bridgeStorePremiumToUsername(username, { productId, platform, expiresAtMs, nowMs }) {
  if (!usernameId(username)) return { bridged: false, why: "no-username" };
  // Robust lifetime detection: storePeriodFromProductId only matches the substring
  // "lifetime", so iOS's `.forever` product would misread as a subscription.
  const isLifetime = /forever|lifetime/.test(String(productId || "").toLowerCase());
  // Don't invent a window: a subscription report with no known expiry is skipped
  // (the uid-keyed record still captured it; a later receipt check supplies expiry).
  if (!isLifetime && !expiresAtMs) return { bridged: false, why: "no-expiry" };
  const ref = db.collection("premium_entitlements").doc(username);
  const snap = await ref.get();
  const data = snap.exists ? (snap.data() || {}) : {};
  const revoked = data.revoked === true || data.revoked === 1 || data.revoked === "true";
  const curLifetime = data.lifetime === true || data.forever === true || data.premiumForever === true;
  if (revoked) return { bridged: false, why: "revoked" };        // respect an intentional revoke
  if (curLifetime) return { bridged: false, why: "already-lifetime" };
  if (isLifetime) {
    await ref.set({
      active: true,
      lifetime: true,
      type: "store_lifetime",
      plan: "store_lifetime",
      access: "store_lifetime",
      source: "store",
      storeManaged: true,
      storePlatform: platform,
      updatedAt: FieldValue.serverTimestamp(),
      updatedAtMs: nowMs,
    }, { merge: true });
    return { bridged: true, lifetime: true };
  }
  const existingMs = timestampMs(data.premiumUntil || data.until || data.expiresAt) || 0;
  if (expiresAtMs <= existingMs) return { bridged: false, why: "not-longer" }; // extend-only
  const iso = new Date(expiresAtMs).toISOString();
  await ref.set({
    active: true,
    type: "store_subscription",
    plan: "store_subscription",
    access: "store_subscription",
    until: iso,
    expiresAt: iso,
    premiumUntil: iso,
    source: "store",
    storeManaged: true,
    storePlatform: platform,
    updatedAt: FieldValue.serverTimestamp(),
    updatedAtMs: nowMs,
  }, { merge: true });
  return { bridged: true, untilIso: iso };
}

exports.mirrorStoreEntitlement = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const data = request.data || {};
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const platform = normaliseStorePlatform(data.platform);
  if (!platform) throw new HttpsError("invalid-argument", "Invalid store platform");

  const productId = normaliseStoreProductId(data.productId || data.resultProductId);
  const requestedActive = data.isPremium === true || data.active === true;
  if (requestedActive && !productId) throw new HttpsError("invalid-argument", "Invalid store product");

  const expiresAtMs = timestampMs(data.expiresAtMs || data.expirationDateMs || data.expiresAt || data.expirationDate);
  const active = !!(requestedActive && (!expiresAtMs || expiresAtMs > nowMs));
  const period = productId ? storePeriodFromProductId(productId) : "";
  const kind = productId ? storeKindFromProductId(productId) : "";
  const context = String(data.context || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32) || "check";
  const username = normaliseUsername(data.username);
  const transactionIdHash = hashStoreToken(data.transactionId || data.transactionID || "");
  const originalTransactionIdHash = hashStoreToken(data.originalTransactionId || data.originalTransactionID || "");
  const purchaseTokenHash = hashStoreToken(data.purchaseTokenHash || data.purchaseToken || "");
  const orderIdHash = hashStoreToken(data.orderIdHash || data.orderId || "");
  const purchaseTimeMs = timestampMs(data.purchaseTimeMs || data.purchaseDate || data.purchasedAt);

  const report = {
    uid,
    platform,
    active,
    productId,
    period,
    kind,
    source: "native_store_report",
    verification: "device_store_verified",
    context,
    updatedAt: now,
    updatedAtMs: nowMs,
    lastCheckedAt: now,
    lastCheckedAtMs: nowMs,
    staleAfterMs: active && kind === "subscription" && !expiresAtMs ? nowMs + STORE_REPORT_STALE_MS : null,
  };
  if (usernameId(username)) report.username = username;
  if (expiresAtMs) {
    report.expiresAtMs = expiresAtMs;
    report.expiresAt = new Date(expiresAtMs).toISOString();
  }
  if (purchaseTimeMs) {
    report.purchaseTimeMs = purchaseTimeMs;
    report.purchaseTime = new Date(purchaseTimeMs).toISOString();
  }
  if (transactionIdHash) report.transactionIdHash = transactionIdHash;
  if (originalTransactionIdHash) report.originalTransactionIdHash = originalTransactionIdHash;
  if (purchaseTokenHash) report.purchaseTokenHash = purchaseTokenHash;
  if (orderIdHash) report.orderIdHash = orderIdHash;
  if (active) {
    report.lastActiveAt = now;
    report.lastActiveAtMs = nowMs;
  } else {
    report.lastInactiveAt = now;
    report.lastInactiveAtMs = nowMs;
  }

  await db.runTransaction(async (tx) => {
    const storeRef = db.collection("store_entitlements").doc(uid);
    const entitlementRef = db.collection("entitlements").doc(uid);
    tx.set(storeRef, report, { merge: true });
    tx.set(entitlementRef, {
      uid,
      storePremiumActive: active,
      storePlatform: platform,
      storeProductId: productId,
      storeProductPeriod: period,
      storeProductKind: kind,
      storeEntitlementSource: "native_store_report",
      storeEntitlementUpdatedAt: now,
      storeEntitlementUpdatedAtMs: nowMs,
      storeEntitlementExpiresAt: expiresAtMs ? new Date(expiresAtMs).toISOString() : "",
      storeEntitlementExpiresAtMs: expiresAtMs || 0,
      storeEntitlementStaleAfterMs: report.staleAfterMs || 0,
      updatedAt: now,
    }, { merge: true });
  });

  // Cross-device restore bridge: make an active purchase durable under the username
  // so a reinstall / new device / sign-out can restore Premium (refreshComplimentary
  // reads premium_entitlements/{username}). Fully guarded — a bridge failure must
  // NEVER fail the purchase report the client is awaiting.
  let usernameBridge = null;
  if (active && usernameId(username)) {
    try {
      usernameBridge = await bridgeStorePremiumToUsername(username, {
        productId, platform, expiresAtMs, nowMs,
      });
    } catch (err) {
      logFunctionWarn("mirrorStoreEntitlement/bridge", err);
    }
  }

  return {
    ok: true,
    active,
    platform,
    productId,
    period,
    kind,
    expiresAtMs: expiresAtMs || 0,
    usernameBridge,
  };
});

// ── Apple App Store receipt validation (authoritative entitlement check) ─────
// The device CANNOT tell an EXPIRED auto-renewable subscription from an active
// one: StoreKit1 `restoreCompletedTransactions` replays past (incl. cancelled/
// lapsed) sub transactions as `.restored`. Without a server check, restoring —
// including the app's silent every-launch reconcile — re-granted a fresh premium
// period to a churned subscriber forever. This validates the receipt with Apple
// and returns whether the entitlement is CURRENTLY active, so the client only
// honours a restore that Apple confirms is live.
//
// SETUP (one-time, done by the app owner):
//   1. App Store Connect → your app → App Information → App-Specific Shared Secret
//      (or the primary shared secret) — copy it.
//   2. firebase functions:secrets:set APPLE_SHARED_SECRET   (paste it)
//   3. firebase deploy --only functions:validateAppleReceipt
// verifyReceipt is Apple's documented endpoint; we hit production first and fall
// back to sandbox on status 21007 (TestFlight / App Review receipts).
exports.validateAppleReceipt = onCall({ secrets: ["APPLE_SHARED_SECRET"] }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const receipt = String((request.data && request.data.receipt) || "");
  if (receipt.length < 20) throw new HttpsError("invalid-argument", "Missing receipt");
  const secret = String(process.env.APPLE_SHARED_SECRET || "").trim();
  if (!secret) throw new HttpsError("failed-precondition", "Receipt validation not configured");

  async function verifyAt(url) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "receipt-data": receipt,
        password: secret,
        "exclude-old-transactions": true,
      }),
    });
    return res.json();
  }

  let body;
  try {
    body = await verifyAt("https://buy.itunes.apple.com/verifyReceipt");
    // 21007 = a sandbox receipt sent to production → retry against sandbox.
    if (body && body.status === 21007) {
      body = await verifyAt("https://sandbox.itunes.apple.com/verifyReceipt");
    }
  } catch (err) {
    // Network / Apple outage — report not-active WITHOUT throwing, so the client
    // treats it as "couldn't confirm" (no grant) and self-heals on a later launch.
    return { ok: false, active: false, status: -1, reason: safeErrorSummary(err) };
  }

  const status = body && typeof body.status === "number" ? body.status : -1;
  if (status !== 0) {
    // 21005/21009 are transient Apple-side; the rest mean the receipt is invalid.
    return { ok: false, active: false, status };
  }

  const nowMs = Date.now();
  const infos = []
    .concat(Array.isArray(body.latest_receipt_info) ? body.latest_receipt_info : [])
    .concat(body.receipt && Array.isArray(body.receipt.in_app) ? body.receipt.in_app : []);
  let bestExpiryMs = 0;
  let bestProduct = "";
  let lifetime = false;
  for (const it of infos) {
    const pid = String((it && it.product_id) || "");
    if (!pid) continue;
    const expMs = Number((it && it.expires_date_ms) || 0);
    if (expMs > 0) {
      // An auto-renewable: keep the furthest-out expiry (the current period).
      const cancelled = !!(it && it.cancellation_date_ms);
      if (!cancelled && expMs > bestExpiryMs) {
        bestExpiryMs = expMs;
        bestProduct = pid;
      }
    } else {
      // A non-consumable (lifetime): no expiry, permanently owned.
      lifetime = true;
      if (!bestProduct) bestProduct = pid;
    }
  }
  const active = lifetime || bestExpiryMs > nowMs;

  return {
    ok: true,
    active,
    lifetime,
    productId: bestProduct,
    expiresAtMs: lifetime ? 0 : bestExpiryMs,
    status: 0,
  };
});

exports.redeemReferral = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const rawCode = String((request.data && request.data.code) || "").trim().toUpperCase();
  const trialDeviceKey = String((request.data && request.data.trialDeviceKey) || "").trim().toLowerCase();
  if (!referralCodeId(rawCode)) throw new HttpsError("invalid-argument", "Invalid referral code");

  const nowMs = Date.now();
  const now = new Date(nowMs);
  const oneYearAgoMs = nowMs - 365 * 24 * 60 * 60 * 1000;

  const result = await db.runTransaction(async (tx) => {
    const codeRef = db.collection("referral_codes").doc(rawCode);
    const redemptionRef = db.collection("referral_redemptions").doc(uid);
    const deviceRef = trialDeviceId(trialDeviceKey) ? db.collection("trial_devices").doc(trialDeviceKey) : null;
    const [codeSnap, redemptionSnap, deviceSnap] = await Promise.all([
      tx.get(codeRef),
      tx.get(redemptionRef),
      deviceRef ? tx.get(deviceRef) : Promise.resolve(null),
    ]);
    if (!codeSnap.exists) throw new HttpsError("not-found", "Referral code not recognised");
    const codeData = codeSnap.data() || {};
    const referrerUid = String(codeData.uid || "");
    const referrerUsername = normaliseUsername(codeData.username);
    if (!referrerUid) throw new HttpsError("failed-precondition", "Referrer account missing");
    if (referrerUid === uid) throw new HttpsError("failed-precondition", "Cannot redeem your own code");
    if (redemptionSnap.exists) throw new HttpsError("already-exists", "You have already redeemed a referral code");

    if (deviceRef && deviceSnap) {
      const deviceData = deviceSnap.exists ? (deviceSnap.data() || {}) : {};
      if (deviceData.referralRedeemed === true) {
        throw new HttpsError("failed-precondition", "This device has already redeemed a referral code");
      }
    }

    let referrerUsernameRef = null;
    let referrerUsernameSnap = null;
    if (referrerUsername && usernameId(referrerUsername)) {
      referrerUsernameRef = db.collection("usernames").doc(referrerUsername);
      referrerUsernameSnap = await tx.get(referrerUsernameRef);
      const refData = referrerUsernameSnap.exists ? (referrerUsernameSnap.data() || {}) : {};
      const log = Array.isArray(refData.referralLog) ? refData.referralLog : [];
      const recent = log.filter(e => timestampMs(e && (e.redeemedAt || e.appliedAt)) >= oneYearAgoMs);
      if (recent.length >= REFERRAL_MAX_PER_YEAR) {
        throw new HttpsError("resource-exhausted", "Referrer has reached the annual referral cap");
      }
      const nextLog = log.concat([{
        redeemerUid: uid,
        redeemedAt: now,
        applied: false,
      }]);
      tx.set(referrerUsernameRef, { referralLog: nextLog, updatedAt: now }, { merge: true });
    }

    if (deviceRef) {
      tx.set(deviceRef, {
        referralRedeemed: true,
        referralRedeemedAt: now,
        referralCode: rawCode,
        updatedAt: now,
      }, { merge: true });
    }

    tx.set(redemptionRef, {
      uid,
      code: rawCode,
      referrerUid,
      referrerUsername,
      redeemedAt: now,
      status: "queued",
      applied: false,
      bonusDays: REFERRAL_BONUS_DAYS,
    });

    return { ok: true, queued: true, referrerUsername };
  });

  return result;
});

// ══════════════════════════════════════════════════════════════════
// 7-day soft delete + scheduled hard wipe
//
// UK / EU GDPR compliance:
// • A deletion request is honoured immediately as far as the user is
//   concerned: the username is disabled, the device is signed out and
//   no further changes can flow into the account.
// • Data is retained for ACCOUNT_DELETE_GRACE_DAYS (7) so accidental or
//   regretted deletions can be undone by the original owner. This is
//   within the "without undue delay" window required by Art. 17 GDPR.
// • At day 7 a scheduled function fully wipes every Firestore doc
//   owned by the account (including v2 sync shadows, carer logs,
//   entitlements, replacedBy ancestor chains, provider links) and
//   deletes the Firebase Auth user.
// ══════════════════════════════════════════════════════════════════

const ACCOUNT_DELETE_GRACE_DAYS = 7;
const ACCOUNT_DELETE_GRACE_MS = ACCOUNT_DELETE_GRACE_DAYS * 24 * 60 * 60 * 1000;
const { FieldValue } = require("firebase-admin/firestore");

// Firestore parent-doc deletes do NOT remove subcollections. The v2 sync
// shadow + carer_logs live as nested collections under their root doc, so
// we have to walk and delete page by page before nuking the root.
async function deleteSubcollectionsRecursive(ref, depth) {
  const safeDepth = depth || 0;
  if (safeDepth > 5) return;
  let subs = [];
  try { subs = await ref.listCollections(); } catch (err) { logFunctionWarn("deleteSubcollections.listCollections", err); return; }
  for (const sub of subs) {
    let lastDoc = null;
    while (true) {
      let q = sub.orderBy(FieldPath.documentId()).limit(200);
      if (lastDoc) q = q.startAfter(lastDoc);
      const snap = await q.get().catch(() => null);
      if (!snap || snap.empty) break;
      for (const child of snap.docs) {
        await deleteSubcollectionsRecursive(child.ref, safeDepth + 1);
      }
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit().catch(err => logFunctionWarn("deleteSubcollections.batch", err));
      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.size < 200) break;
    }
  }
}

async function deleteDocAndSubcollections(ref) {
  await deleteSubcollectionsRecursive(ref, 0);
  await ref.delete().catch(() => {});
}

// Owners rotate child_sync codes (the replacedBy chain). The current
// uid_to_backup / username doc only lists the LIVE codes — ancestors are
// orphaned in child_syncs. Walk both directions so the hard wipe leaves
// nothing behind.
async function gatherAllOwnedChildSyncCodes(seedCodes, ownerUid, ownerUsername) {
  const known = new Set();
  const queue = [];
  for (const c of seedCodes || []) {
    const code = String(c || "").toUpperCase();
    if (code) queue.push(code);
  }
  while (queue.length) {
    const code = queue.shift();
    if (known.has(code)) continue;
    known.add(code);
    try {
      const snap = await db.collection("child_syncs").doc(code).get();
      if (!snap.exists) continue;
      const data = snap.data() || {};
      const owns = data.ownerUid === ownerUid || (ownerUsername && data.ownerUsername === ownerUsername);
      if (!owns) { known.delete(code); continue; }
      if (data.replacedBy) queue.push(String(data.replacedBy).toUpperCase());
    } catch (err) { logFunctionWarn("gatherChildSyncCodes.forward", err); }
  }
  // Walk replacedBy ancestors. Bounded by depth + collection scan limit.
  let added = true; let safety = 0;
  while (added && safety++ < 12) {
    added = false;
    const pending = Array.from(known);
    for (const code of pending) {
      try {
        const ancestors = await db.collection("child_syncs").where("replacedBy", "==", code).limit(50).get();
        for (const doc of ancestors.docs) {
          const data = doc.data() || {};
          const owns = data.ownerUid === ownerUid || (ownerUsername && data.ownerUsername === ownerUsername);
          if (!owns) continue;
          if (!known.has(doc.id)) { known.add(doc.id); added = true; }
        }
      } catch (err) { logFunctionWarn("gatherChildSyncCodes.ancestors", err); }
    }
  }
  return Array.from(known);
}

async function hardWipeAccountData({ uid, username, usernameData }) {
  const data = usernameData || {};
  const backupCode = String(data.backupCode || data.familyCode || "").trim().toUpperCase();
  const verifiedBackup = backupCodeId(backupCode) ? backupCode : "";
  const seedChildCodes = parseChildSyncCodes(data.childSyncCodes);

  let uidBackupData = {};
  try {
    const uidBackupSnap = await db.collection("uid_to_backup").doc(uid).get();
    if (uidBackupSnap.exists) uidBackupData = uidBackupSnap.data() || {};
  } catch (err) { logFunctionWarn("hardWipe.uidBackup", err); }

  const combinedCodes = { ...seedChildCodes, ...parseChildSyncCodes(uidBackupData.childSyncCodes) };
  const allChildCodes = await gatherAllOwnedChildSyncCodes(Object.values(combinedCodes), uid, username);

  // Per-child sync collections + child_code_map ids
  for (const code of allChildCodes) {
    if (!childSyncCodeId(code)) continue;
    let syncData = null;
    try {
      const syncRef = db.collection("child_syncs").doc(code);
      const syncSnap = await syncRef.get();
      if (syncSnap.exists) {
        syncData = syncSnap.data() || {};
        const syncChild = parseObjectPayload(syncData.child);
        const ownerSeed = username || syncData.ownerUsername || uid;
        // Remove every child_code_map id derivable from the live and synced child id
        const allIds = new Set();
        for (const childIdRaw of Object.keys(combinedCodes)) {
          for (const mapId of childCodeMapIdsForOwner(childIdRaw, syncChild, ownerSeed)) allIds.add(mapId);
        }
        if (syncData.childId) {
          for (const mapId of childCodeMapIdsForOwner(syncData.childId, syncChild, ownerSeed)) allIds.add(mapId);
        }
        for (const mapId of allIds) await db.collection("child_code_map").doc(mapId).delete().catch(() => {});
        await syncRef.delete().catch(() => {});
      }
    } catch (err) { logFunctionWarn("hardWipe.childSync." + code, err); }
    // v2 shadow under this code (profile, days, extras, live subcollections)
    await deleteDocAndSubcollections(db.collection("child_sync_v2").doc(code)).catch(() => {});
  }

  if (verifiedBackup) {
    await db.collection("families").doc(verifiedBackup).delete().catch(() => {});
    await deleteDocAndSubcollections(db.collection("family_sync_v2").doc(verifiedBackup)).catch(() => {});
    // Carer log + entries subcollection + _meta/session
    await deleteDocAndSubcollections(db.collection("carer_logs").doc(verifiedBackup)).catch(() => {});
    // Carer share tokens that point at this backup code
    try {
      const tokenSnap = await db.collection("carer_tokens").where("backupCode", "==", verifiedBackup).limit(50).get();
      for (const doc of tokenSnap.docs) await doc.ref.delete().catch(() => {});
    } catch (err) { logFunctionWarn("hardWipe.carer_tokens", err); }
  }

  if (data.recoveryEmailLookupId) {
    await db.collection("recovery_emails").doc(String(data.recoveryEmailLookupId)).delete().catch(() => {});
  }

  if (username) {
    // Username doc has a provider_links subcollection that Firestore won't
    // cascade. Walk it before deleting the parent doc so claims after the
    // grace window get a truly empty namespace.
    await deleteDocAndSubcollections(db.collection("usernames").doc(username)).catch(() => {});
    await db.collection("premium_entitlements").doc(username).delete().catch(() => {});
  }

  await db.collection("uid_to_backup").doc(uid).delete().catch(() => {});
  await db.collection("fcm_tokens").doc(uid).delete().catch(() => {});
  await db.collection("user_activity").doc(uid).delete().catch(() => {});
  await db.collection("auth_provider_links").doc(uid).delete().catch(() => {});
  await db.collection("bubba_presence").doc(uid).delete().catch(() => {});
  await db.collection("entitlements").doc(uid).delete().catch(() => {});
  await db.collection("store_entitlements").doc(uid).delete().catch(() => {});

  const trialDeviceKey = String(data.trialDeviceKey || "").trim().toLowerCase();
  if (trialDeviceId(trialDeviceKey)) {
    try {
      const trialRef = db.collection("trial_devices").doc(trialDeviceKey);
      const trialSnap = await trialRef.get();
      if (trialSnap.exists) {
        const trialData = trialSnap.data() || {};
        if (trialData.uid === uid) {
          // Intentionally keep tombstone to prevent trial-restart abuse,
          // but strip every identity field so nothing personal remains.
          await trialRef.set({
            uid: "",
            username: "",
            accountDeletedAt: new Date(),
            updatedAt: new Date(),
          }, { merge: true }).catch(() => {});
        }
      }
    } catch (err) { logFunctionWarn("hardWipe.trial", err); }
  }

  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    if (!err || err.code !== "auth/user-not-found") logFunctionWarn("hardWipe.adminAuth.deleteUser", err);
  }
}

exports.deleteAccount = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const username = normaliseUsername(request.data && request.data.username);
  const backupCode = String((request.data && request.data.backupCode) || "").trim().toUpperCase();
  const requestedChildCodes = parseChildSyncCodes(request.data && request.data.childSyncCodes);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");

  const usernameRef = db.collection("usernames").doc(username);
  const usernameSnap = await usernameRef.get();
  if (!usernameSnap.exists) {
    // Nothing to soft-delete server-side. Treat as success so the client
    // can clear local state without surfacing a scary error.
    return { ok: true, mode: "soft", alreadyGone: true, scheduledHardDeleteAtMs: null, graceDays: ACCOUNT_DELETE_GRACE_DAYS };
  }
  const usernameData = usernameSnap.data() || {};
  const owner = usernameData.uid === uid || (usernameData.authorizedUids && usernameData.authorizedUids[uid] === true);
  if (!owner) throw new HttpsError("permission-denied", "Not the account owner");

  const now = Date.now();
  const scheduledHardDeleteAtMs = now + ACCOUNT_DELETE_GRACE_MS;
  const verifiedBackup = backupCodeId(backupCode) && (
    usernameData.backupCode === backupCode || usernameData.familyCode === backupCode
  ) ? backupCode : String(usernameData.backupCode || usernameData.familyCode || "").trim().toUpperCase();

  const softPatch = {
    pendingDelete: true,
    pendingDeleteRequestedAt: new Date(now),
    pendingDeleteRequestedAtMs: now,
    pendingDeleteRequestedByUid: uid,
    scheduledHardDeleteAt: new Date(scheduledHardDeleteAtMs),
    scheduledHardDeleteAtMs: scheduledHardDeleteAtMs,
    updatedAt: new Date(),
  };

  const writes = [];
  writes.push(usernameRef.set(softPatch, { merge: true }));
  writes.push(db.collection("uid_to_backup").doc(uid).set(softPatch, { merge: true }));
  if (backupCodeId(verifiedBackup)) {
    writes.push(db.collection("families").doc(verifiedBackup).set(softPatch, { merge: true }));
  }
  let uidBackupCodes = {};
  try {
    const ubSnap = await db.collection("uid_to_backup").doc(uid).get();
    if (ubSnap.exists) uidBackupCodes = parseChildSyncCodes((ubSnap.data() || {}).childSyncCodes);
  } catch (err) { logFunctionWarn("deleteAccount.uidBackupRead", err); }
  const mergedChildCodes = {
    ...parseChildSyncCodes(usernameData.childSyncCodes),
    ...uidBackupCodes,
    ...requestedChildCodes,
  };
  for (const [, code] of Object.entries(mergedChildCodes)) {
    if (!childSyncCodeId(code)) continue;
    writes.push(db.collection("child_syncs").doc(code).set(softPatch, { merge: true }));
  }
  await Promise.allSettled(writes);

  // Revoke all of this user's refresh tokens so any other signed-in device
  // is forced through accountLogin (which will surface the restore prompt
  // rather than letting them keep using the disabled account).
  try { await adminAuth.revokeRefreshTokens(uid); } catch (err) { logFunctionWarn("deleteAccount.revokeRefreshTokens", err); }

  return {
    ok: true,
    mode: "soft",
    scheduledHardDeleteAtMs,
    graceDays: ACCOUNT_DELETE_GRACE_DAYS,
    restoreUntilMs: scheduledHardDeleteAtMs,
  };
});

exports.restoreAccount = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const username = normaliseUsername(request.data && request.data.username);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");

  const usernameRef = db.collection("usernames").doc(username);
  const usernameSnap = await usernameRef.get();
  if (!usernameSnap.exists) throw new HttpsError("not-found", "Account not found");
  const data = usernameSnap.data() || {};
  const owner = data.uid === uid || (data.authorizedUids && data.authorizedUids[uid] === true);
  if (!owner) throw new HttpsError("permission-denied", "Not the account owner");
  if (!data.pendingDelete) return { ok: true, alreadyActive: true };
  if (Number(data.scheduledHardDeleteAtMs || 0) && Date.now() > Number(data.scheduledHardDeleteAtMs)) {
    // Grace window expired between sign-in and confirmation. The next
    // scheduled purge will clean this up; don't pretend restore worked.
    return { ok: false, error: "Restore window expired" };
  }

  const clearPatch = {
    pendingDelete: FieldValue.delete(),
    pendingDeleteRequestedAt: FieldValue.delete(),
    pendingDeleteRequestedAtMs: FieldValue.delete(),
    pendingDeleteRequestedByUid: FieldValue.delete(),
    scheduledHardDeleteAt: FieldValue.delete(),
    scheduledHardDeleteAtMs: FieldValue.delete(),
    updatedAt: new Date(),
  };
  const writes = [];
  writes.push(usernameRef.set(clearPatch, { merge: true }));
  writes.push(db.collection("uid_to_backup").doc(uid).set(clearPatch, { merge: true }));
  const backup = String(data.backupCode || data.familyCode || "").trim().toUpperCase();
  if (backupCodeId(backup)) {
    writes.push(db.collection("families").doc(backup).set(clearPatch, { merge: true }));
  }
  const childCodes = parseChildSyncCodes(data.childSyncCodes);
  for (const [, code] of Object.entries(childCodes)) {
    if (!childSyncCodeId(code)) continue;
    writes.push(db.collection("child_syncs").doc(code).set(clearPatch, { merge: true }));
  }
  await Promise.allSettled(writes);
  return { ok: true, restored: true };
});

exports.purgePendingDeletes = onSchedule("every day 03:30", async () => {
  const now = Date.now();
  let processed = 0;
  let lastDoc = null;
  // Page so a single run can clear a backlog without running over the
  // 540s scheduled-function timeout. Cap at 500 accounts per run.
  while (processed < 500) {
    let q = db.collection("usernames")
      .where("pendingDelete", "==", true)
      .where("scheduledHardDeleteAtMs", "<=", now)
      .orderBy("scheduledHardDeleteAtMs")
      .limit(20);
    if (lastDoc) q = q.startAfter(lastDoc);
    let snap;
    try { snap = await q.get(); } catch (err) { logFunctionError("purgePendingDeletes.query", err); break; }
    if (snap.empty) break;
    for (const doc of snap.docs) {
      const data = doc.data() || {};
      const uid = String(data.pendingDeleteRequestedByUid || data.uid || "");
      if (!uid) {
        logFunctionWarn("purgePendingDeletes.skip", "missing uid for " + doc.id);
        await doc.ref.delete().catch(() => {}); // orphan — clear it
        continue;
      }
      try {
        await hardWipeAccountData({ uid, username: doc.id, usernameData: data });
        processed++;
      } catch (err) {
        logFunctionError("purgePendingDeletes." + doc.id, err);
      }
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < 20) break;
  }
  if (processed > 0) console.log("purgePendingDeletes: hard-wiped " + processed + " accounts");
});

function safePushText(value, fallback, maxLen = 180) {
  const raw = typeof value === "string" ? value : "";
  const text = raw.replace(/\s+/g, " ").trim() || fallback;
  return text.slice(0, maxLen);
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeDataPayload(data) {
  const out = {};
  if (!data || typeof data !== "object" || Array.isArray(data)) return out;
  for (const [key, value] of Object.entries(data)) {
    if (!/^[A-Za-z0-9_.-]{1,40}$/.test(key)) continue;
    if (value === null || value === undefined) continue;
    if (!["string", "number", "boolean"].includes(typeof value)) continue;
    out[key] = String(value).slice(0, 120);
  }
  return out;
}

function timestampMs(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
}

function safeTzOffsetMin(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= -840 && value <= 840 ? value : 0;
}

function userLocalDate(tzOffsetMin, ms = Date.now()) {
  const offset = safeTzOffsetMin(tzOffsetMin);
  return new Date(ms - offset * 60 * 1000);
}

function isInvalidFcmTokenError(err) {
  const code = String(err && err.code || "");
  const message = String(err && err.message || "").toLowerCase();
  return code === "messaging/invalid-registration-token" ||
    code === "messaging/registration-token-not-registered" ||
    (code === "messaging/invalid-argument" && (
      message.includes("registration token") ||
      message.includes("fcm registration token") ||
      message.includes("not a valid fcm")
    ));
}

async function forEachFcmToken(callback, pageSize = 500) {
  let lastDoc = null;
  while (true) {
    let query = db.collection("fcm_tokens").orderBy(FieldPath.documentId()).limit(pageSize);
    if (lastDoc) query = query.startAfter(lastDoc);
    const snap = await query.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      await callback(doc, doc.id);
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }
}

// ── Send push notification to a specific user ───────────────────
async function sendPush(uid, { title, body, data = {} }) {
  try {
    const tokenDoc = await db.collection("fcm_tokens").doc(uid).get();
    if (!tokenDoc.exists) return;

    const rawToken = tokenDoc.data().token;
    const token = typeof rawToken === "string" ? rawToken.trim() : "";
    if (!token) return;
    const safeData = safeDataPayload(data);
    const channelId = safeData.channelId || "obubba_reminders";

    await messaging.send({
      token,
      notification: {
        title: safePushText(title, "OBubba", 80),
        body: safePushText(body, "Tap to open OBubba.", 220),
      },
      data: { ...safeData, click_action: "FLUTTER_NOTIFICATION_CLICK" },
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
          channelId,
          color: "#C07088",
          icon: "ic_notification",
        },
      },
    });
  } catch (err) {
    if (isInvalidFcmTokenError(err)) {
      await db.collection("fcm_tokens").doc(uid).delete();
      logFunctionWarn("Removed invalid FCM token", err);
      return;
    }
    logFunctionError("Push delivery failed", err);
  }
}

// Helper: get the user's LOCAL `YYYY-MM-DD` key. `tzOffsetMin` is what JS's
// getTimezoneOffset() returns — minutes west of UTC (so Europe/London DST is
// -60, Asia/Tokyo is -540, Los Angeles is 420). A push_log dedupe key keyed
// on server UTC would roll over at UTC midnight instead of the user's local
// midnight and produce duplicate reminders on DST and at timezone boundaries.
function todayKeyForUser(tzOffsetMin) {
  return userLocalDate(tzOffsetMin).toISOString().split("T")[0];
}

// Helper: user-local hour of the day (0–23). Used to gate the 7am-10pm
// "daytime only" reminder window on the USER's wall clock, not the
// function's server region.
function userLocalHour(tzOffsetMin) {
  return userLocalDate(tzOffsetMin).getUTCHours();
}

function userLocalDayOfWeek(tzOffsetMin) {
  return userLocalDate(tzOffsetMin).getUTCDay();
}

function userLocalWeekKey(tzOffsetMin) {
  const local = userLocalDate(tzOffsetMin);
  const day = local.getUTCDay() || 7;
  const monday = new Date(local.getTime());
  monday.setUTCDate(local.getUTCDate() - day + 1);
  return monday.toISOString().split("T")[0];
}

function datePartsForUser(value, tzOffsetMin) {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  }
  const ms = timestampMs(value);
  if (!ms) return null;
  const d = userLocalDate(tzOffsetMin, ms);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function ageWeeksForUser(value, tzOffsetMin) {
  const dob = datePartsForUser(value, tzOffsetMin);
  if (!dob) return null;
  const now = userLocalDate(tzOffsetMin);
  const dobNoon = Date.UTC(dob.year, dob.month - 1, dob.day, 12);
  const nowNoon = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12);
  return Math.floor((nowNoon - dobNoon) / (7 * 24 * 60 * 60 * 1000));
}

// Helper: check if a Firestore timestamp is from the user's local "today".
function isToday(timestamp, tzOffsetMin) {
  const ms = timestampMs(timestamp);
  if (!ms) return false;
  const tsLocal = userLocalDate(tzOffsetMin, ms);
  const nowLocal = userLocalDate(tzOffsetMin);
  return tsLocal.getUTCFullYear() === nowLocal.getUTCFullYear()
      && tsLocal.getUTCMonth() === nowLocal.getUTCMonth()
      && tsLocal.getUTCDate() === nowLocal.getUTCDate();
}

// ── Feed reminder: notify if no feed logged in 4+ hours ─────────
exports.feedReminder = onSchedule("every 30 minutes", async () => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000; // 4 hours ago

  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;

      const data = actDoc.data();
      const lastFeedTime = data.lastFeedTimestamp;
      const lastFeedMs = timestampMs(lastFeedTime);
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);

      // Daytime gate + dedupe key both computed in the USER's local timezone.
      const hour = userLocalHour(tzOff);
      if (hour < 7 || hour > 22) return;

      if (lastFeedMs && lastFeedMs < cutoff) {
        const hoursSince = Math.round((Date.now() - lastFeedMs) / 3600000);
        // Don't spam — check if we already sent a feed reminder today (user-local)
        const sentKey = `feedReminder_${todayKeyForUser(tzOff)}_${uid}`;
        const sentDoc = await db.collection("push_log").doc(sentKey).get();
        if (sentDoc.exists) return;

        await sendPush(uid, {
          title: "🍼 Feed Reminder",
          body: `It's been ${hoursSince} hours since the last feed. Time for another?`,
          data: { action: "log_feed", channelId: "obubba_reminders" },
        });
        await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
      }
    } catch (err) {
      logFunctionError("Feed reminder failed", err);
    }
  });
});

// ── No feed all day: alert if it's past 10am and zero feeds logged today ──
exports.noFeedAlert = onSchedule("every 1 hours", async () => {
  // No server-wide time gate — the scheduled function runs every hour UTC,
  // and we compute each user's local hour inside the loop below using their
  // stored tzOffsetMin. Without this, a UTC-scheduled 10am-8pm gate meant
  // users outside UTC were either silenced for most of their day or spammed
  // at the wrong local times.
  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;

      const data = actDoc.data();
      const lastFeed = data.lastFeedTimestamp;
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);
      const localHour = userLocalHour(tzOff);
      if (localHour < 10 || localHour > 20) return;

      // If no feed today (in user's local timezone)
      if (!lastFeed || !isToday(lastFeed, tzOff)) {
        // Don't spam — one alert per user-local day
        const sentKey = `noFeed_${todayKeyForUser(tzOff)}_${uid}`;
        const sentDoc = await db.collection("push_log").doc(sentKey).get();
        if (sentDoc.exists) return;

        await sendPush(uid, {
          title: "🍼 No feeds logged today",
          body: "Tap to log a feed — keeping track helps spot patterns early.",
          data: { action: "log_feed", channelId: "obubba_reminders" },
        });
        await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
      }
    } catch (err) {
      logFunctionError("No feed alert failed", err);
    }
  });
});

// ── Morning wake reminder: feed logged but no wake ──────────────
// If a feed is logged today but no morning wake, nudge the parent
exports.noWakeAlert = onSchedule("every 1 hours", async () => {
  // Per-user local-time gate: see feedReminder/noFeedAlert comments.

  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;

      const data = actDoc.data();
      const lastFeed = data.lastFeedTimestamp;
      const lastWake = data.lastWakeTimestamp;
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);
      const hour = userLocalHour(tzOff);
      // Only check between 8am and 12pm — after that, wake was probably just missed.
      if (hour < 8 || hour > 12) return;

      // Feed logged today but no wake today (both in user-local tz)
      const feedToday = lastFeed && isToday(lastFeed, tzOff);
      const wakeToday = lastWake && isToday(lastWake, tzOff);

      if (feedToday && !wakeToday) {
        const sentKey = `noWake_${todayKeyForUser(tzOff)}_${uid}`;
        const sentDoc = await db.collection("push_log").doc(sentKey).get();
        if (sentDoc.exists) return;

        await sendPush(uid, {
          title: "☀️ Morning wake not logged",
          body: "You've logged a feed but no wake time. Tap to log the morning wake — it helps predict naps accurately.",
          data: { action: "log_wake", channelId: "obubba_reminders" },
        });
        await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
      }
    } catch (err) {
      logFunctionError("No wake alert failed", err);
    }
  });
});

// ── Medicine reminder: notify when dose is due ──────────────────
exports.medicineReminder = onSchedule("every 15 minutes", async () => {
  const now = Date.now();
  const reminders = await db
    .collection("medicine_reminders")
    .where("nextDue", "<=", new Date(now))
    .where("sent", "==", false)
    .limit(200)
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
      logFunctionError("Medicine reminder failed", err);
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
    .limit(200)
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
      logFunctionError("Appointment reminder failed", err);
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
      logFunctionError("Scheduled push failed", err);
    }
  }
});

// ── Weekly digest: Monday morning summary ───────────────────────
exports.weeklyDigest = onSchedule("every 1 hours", async () => {
  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      const activity = actDoc.exists ? actDoc.data() : {};
      const tzOff = safeTzOffsetMin(activity.tzOffsetMin);
      if (userLocalDayOfWeek(tzOff) !== 1 || userLocalHour(tzOff) !== 8) return;

      // Check if user has weekly digest enabled
      const prefs = await db.collection("user_prefs").doc(uid).get();
      if (prefs.exists && prefs.data().weeklyDigest === false) return;

      const sentKey = `weeklyDigest_${userLocalWeekKey(tzOff)}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) return;

      await sendPush(uid, {
        title: "📊 Your Weekly Summary is Ready",
        body: "See how baby's week went — feeds, sleep patterns, and milestones.",
        data: { action: "baby_summary", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      logFunctionError("Weekly digest failed", err);
    }
  });
});

// ── E21 Weekly email digest ──────────────────────────────────────
// Companion to weeklyDigest (push). When the user has explicitly opted in
// (user_prefs.weeklyEmailDigest === true) and has a verified email on
// their Firebase Auth account, send a Monday-morning HTML summary of the
// last 7 days of activity. Delivery is via the Firebase "Trigger Email"
// extension — we just write a doc to /mail and the extension's SMTP
// pipeline does the rest. If the extension is not installed yet, the doc
// simply waits in Firestore harmlessly until it is.
exports.weeklyEmailDigest = onSchedule("every 1 hours", async () => {
  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      const activity = actDoc.exists ? actDoc.data() : {};
      const tzOff = safeTzOffsetMin(activity.tzOffsetMin);
      // Monday 8am in the user's wall clock.
      if (userLocalDayOfWeek(tzOff) !== 1 || userLocalHour(tzOff) !== 8) return;

      // Opt-in is explicit: email is more intrusive than a push.
      const prefsDoc = await db.collection("user_prefs").doc(uid).get();
      const prefs = prefsDoc.exists ? prefsDoc.data() : {};
      if (prefs.weeklyEmailDigest !== true) return;

      // Prefer the verified auth account email; fall back to a manually
      // supplied digestEmail field if the user set one (e.g. anonymous
      // sign-in with recovery email saved).
      let email = "";
      try {
        const userRecord = await adminAuth.getUser(uid);
        if (userRecord && userRecord.emailVerified && userRecord.email) {
          email = String(userRecord.email).trim();
        }
      } catch (_) {}
      if (!email && typeof prefs.digestEmail === "string"
          && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prefs.digestEmail)) {
        email = prefs.digestEmail.trim();
      }
      if (!email) return;

      const sentKey = `weeklyEmailDigest_${userLocalWeekKey(tzOff)}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) return;

      const backupDoc = await db.collection("uid_to_backup").doc(uid).get();
      if (!backupDoc.exists) return;
      const codes = parseChildSyncCodes(backupDoc.data().childSyncCodes);
      const codeList = Object.values(codes);
      if (codeList.length === 0) return;

      // Build the 7 most recent day keys in the user's local timezone.
      const nowMs = Date.now();
      const dayKeys = [];
      for (let i = 1; i <= 7; i++) {
        const d = userLocalDate(tzOff, nowMs - i * 24 * 60 * 60 * 1000);
        dayKeys.push(d.toISOString().split("T")[0]);
      }

      const totals = { feeds: 0, naps: 0, nappies: 0, nightWakes: 0, sleepMin: 0 };
      let babyName = "";
      for (const code of codeList) {
        const syncSnap = await db.collection("child_syncs").doc(code).get();
        if (!syncSnap.exists) continue;
        const child = parseObjectPayload(syncSnap.data().child);
        if (!child) continue;
        if (!babyName && typeof child.name === "string") babyName = child.name.trim();
        const days = child.days && typeof child.days === "object" ? child.days : {};
        for (const key of dayKeys) {
          const entries = Array.isArray(days[key]) ? days[key] : [];
          for (const e of entries) {
            if (!e || typeof e !== "object") continue;
            const t = e.type;
            if (t === "feed") totals.feeds++;
            else if (t === "nap" || t === "sleep") totals.naps++;
            else if (t === "nappy" || t === "diaper") totals.nappies++;
            else if (t === "wake" && e.night) totals.nightWakes++;
            if ((t === "nap" || t === "sleep") && typeof e.durationMin === "number"
                && Number.isFinite(e.durationMin)) {
              totals.sleepMin += Math.max(0, Math.min(24 * 60, e.durationMin));
            }
          }
        }
      }

      // Nothing happened — no point emailing an empty report.
      if (totals.feeds + totals.naps + totals.nappies + totals.nightWakes === 0) return;

      const friendly = babyName || "Baby";
      const sleepHours = (totals.sleepMin / 60).toFixed(1);
      const safeName = escapeHtml(friendly);
      const subject = safePushText(
        `${friendly}'s week — ${totals.feeds} feeds, ${totals.naps} naps`,
        "Your OBubba week", 120,
      );
      const text =
        `Hi from OBubba.\n\n` +
        `Here's how ${friendly} did over the last 7 days:\n\n` +
        `• Feeds: ${totals.feeds}\n` +
        `• Naps & sleeps: ${totals.naps}\n` +
        `• Nappies: ${totals.nappies}\n` +
        `• Night wakes: ${totals.nightWakes}\n` +
        `• Total sleep tracked: ${sleepHours} hours\n\n` +
        `Open OBubba any time to see the full timeline.\n\n` +
        `— OBubba\n\n` +
        `You can turn off this email in Account → Preferences.`;
      const html =
        `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;` +
        `max-width:520px;margin:0 auto;padding:24px;color:#2c2236">` +
        `<h1 style="font-family:'Parisienne',cursive;font-size:32px;color:#C07088;` +
        `margin:0 0 8px">OBubba</h1>` +
        `<h2 style="font-size:18px;font-weight:600;margin:0 0 16px">${safeName}'s week</h2>` +
        `<p style="font-size:14px;line-height:1.6;margin:0 0 20px">` +
        `Here's how the last 7 days went:</p>` +
        `<table style="border-collapse:collapse;width:100%;font-size:14px">` +
        `<tr><td style="padding:8px 0">Feeds</td>` +
        `<td style="padding:8px 0;text-align:right;font-weight:600">${totals.feeds}</td></tr>` +
        `<tr><td style="padding:8px 0">Naps &amp; sleeps</td>` +
        `<td style="padding:8px 0;text-align:right;font-weight:600">${totals.naps}</td></tr>` +
        `<tr><td style="padding:8px 0">Nappies</td>` +
        `<td style="padding:8px 0;text-align:right;font-weight:600">${totals.nappies}</td></tr>` +
        `<tr><td style="padding:8px 0">Night wakes</td>` +
        `<td style="padding:8px 0;text-align:right;font-weight:600">${totals.nightWakes}</td></tr>` +
        `<tr><td style="padding:8px 0">Total sleep tracked</td>` +
        `<td style="padding:8px 0;text-align:right;font-weight:600">${sleepHours}h</td></tr>` +
        `</table>` +
        `<p style="font-size:13px;line-height:1.5;color:#6b5e72;margin:24px 0 0">` +
        `Open OBubba any time to see the full timeline.</p>` +
        `<p style="font-size:11px;color:#9b8fa3;margin-top:32px">` +
        `You can turn off this email in Account → Preferences.</p>` +
        `</div>`;

      await db.collection("mail").add({
        to: email,
        message: { subject, text, html },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      logFunctionError("Weekly email digest failed", err);
    }
  });
});

// ── Monthly birthday: celebrate baby turning X months ────────────
exports.monthlyBirthday = onSchedule("every 1 hours", async () => {
  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;
      const data = actDoc.data();
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);
      if (userLocalHour(tzOff) !== 9) return;
      if (!data.babyDob) return;

      const dobMs = timestampMs(data.babyDob);
      if (!dobMs) return;
      const dob = datePartsForUser(data.babyDob, tzOff);
      if (!dob) return;
      const today = userLocalDate(tzOff);
      const todayDay = today.getUTCDate();
      // Check if today is the monthly anniversary
      if (dob.day !== todayDay) return;
      const months = (today.getUTCFullYear() - dob.year) * 12 + ((today.getUTCMonth() + 1) - dob.month);
      if (months <= 0 || months > 24) return;

      const sentKey = `monthly_${months}_${todayKeyForUser(tzOff)}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) return;

      const name = data.babyName || "Baby";
      await sendPush(uid, {
        title: `🎂 ${name} is ${months} month${months !== 1 ? "s" : ""} old today!`,
        body: `Happy ${months}-month birthday! Check the Development tab for new milestones entering ${name}'s window.`,
        data: { action: "development", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      logFunctionError("Monthly birthday failed", err);
    }
  });
});

// ── New development phase: notify when baby enters a wonder week/phase ──
exports.developmentPhase = onSchedule("every 1 hours", async () => {
  // Wonder Weeks leap starts (in weeks from due date)
  const leapWeeks = [5, 8, 12, 19, 26, 37, 46, 55, 64, 75];
  const leapNames = [
    "Changing Sensations", "Patterns", "Smooth Transitions",
    "Events", "Relationships", "Categories", "Sequences",
    "Programmes", "Principles", "Systems"
  ];

  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;
      const data = actDoc.data();
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);
      if (userLocalHour(tzOff) !== 9) return;
      if (!data.babyDob) return;

      const dobMs = timestampMs(data.babyDob);
      if (!dobMs) return;
      const ageWeeks = ageWeeksForUser(data.babyDob, tzOff);
      if (ageWeeks === null) return;
      const name = data.babyName || "Baby";

      // Check if baby just entered a leap week
      const leapIdx = leapWeeks.indexOf(ageWeeks);
      if (leapIdx === -1) return;

      const sentKey = `leap_${ageWeeks}_${todayKeyForUser(tzOff)}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) return;

      await sendPush(uid, {
        title: `🧠 Leap ${leapIdx + 1}: ${leapNames[leapIdx]}`,
        body: `${name} is entering a new developmental leap! Expect fussiness — it's a sign of brain growth. Check Development for details.`,
        data: { action: "development", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      logFunctionError("Development phase failed", err);
    }
  });
});

// ── New milestones unlocked: notify when milestones enter baby's window ──
exports.milestonesUnlocked = onSchedule("every 1 hours", async () => {
  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;
      const data = actDoc.data();
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);
      if (userLocalHour(tzOff) !== 10) return;
      if (!data.babyDob) return;

      const dobMs = timestampMs(data.babyDob);
      if (!dobMs) return;
      const ageWeeks = ageWeeksForUser(data.babyDob, tzOff);
      if (ageWeeks === null) return;
      const name = data.babyName || "Baby";

      // Check weekly — only alert once per week
      const weekKey = `milestones_w${ageWeeks}_${userLocalWeekKey(tzOff)}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(weekKey).get();
      if (sentDoc.exists) return;

      // Only notify at key age milestones (every 4 weeks after 8 weeks)
      if (ageWeeks < 8 || ageWeeks % 4 !== 0) return;

      await sendPush(uid, {
        title: `✨ New milestones for ${name}`,
        body: `At ${Math.round(ageWeeks / 4.3)} months, new milestones are entering ${name}'s window. Check the Development tab to see what to look for!`,
        data: { action: "development", channelId: "obubba_milestones" },
      });
      await db.collection("push_log").doc(weekKey).set({ sentAt: new Date() });
    } catch (err) {
      logFunctionError("Milestones reminder failed", err);
    }
  });
});

// ── Re-engagement: gentle nudge if inactive for 3+ days ─────────
exports.reEngagement = onSchedule("every 1 hours", async () => {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

  await forEachFcmToken(async (doc, uid) => {
    try {
      const actDoc = await db.collection("user_activity").doc(uid).get();
      if (!actDoc.exists) return;
      const data = actDoc.data();
      const tzOff = safeTzOffsetMin(data.tzOffsetMin);
      if (userLocalHour(tzOff) !== 11) return;
      const lastUpdate = data.updatedAt;
      if (!lastUpdate) return;

      const lastMs = timestampMs(lastUpdate);
      if (!lastMs) return;
      if (lastMs > threeDaysAgo) return; // Active recently — skip

      // Don't spam — once per week max
      const weekNum = userLocalWeekKey(tzOff);
      const sentKey = `reengage_w${weekNum}_${uid}`;
      const sentDoc = await db.collection("push_log").doc(sentKey).get();
      if (sentDoc.exists) return;

      const name = data.babyName || "Baby";
      const daysSince = Math.round((Date.now() - lastMs) / (24 * 60 * 60 * 1000));

      const messages = [
        { title: `📱 ${name} misses you!`, body: `It's been ${daysSince} days. A quick log keeps ${name}'s sleep predictions accurate.` },
        { title: `☀️ Fresh day, fresh start`, body: `Pick up where you left off — ${name}'s patterns are waiting to be discovered.` },
        { title: `📊 Keep the data flowing`, body: `Regular logging makes OBubba's predictions smarter. Just one entry makes a difference!` },
        { title: `🌙 A calmer week is close`, body: `Just a week of consistent logging helps OBubba steady ${name}'s rhythm — better sleep for the whole family.` },
      ];
      const msg = messages[daysSince % messages.length];

      await sendPush(uid, {
        title: msg.title,
        body: msg.body,
        data: { action: "open", channelId: "obubba_reminders" },
      });
      await db.collection("push_log").doc(sentKey).set({ sentAt: new Date() });
    } catch (err) {
      logFunctionError("Re-engagement failed", err);
    }
  });
});

// ── Cleanup: purge old server-side ephemera ─────────────────────
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

// ── Public online count for clock fireflies ─────────────────────
// Returns only an aggregate number. No names, locations, baby data, user ids,
// or session details leave the server.
exports.getClockOnlineParentCount = onCall(async (request) => {
  return buildClockOnlineParentCountPayload();
});

// ── Cleanup: purge expired anonymous clock presence ─────────────────
exports.cleanupClockPresence = onSchedule("every day 04:00", async () => {
  const cutoffMs = Date.now();
  const oldPresence = await db.collection("bubba_presence")
    .where("expiresAtMs", "<", cutoffMs)
    .limit(200)
    .get();

  const batch = db.batch();
  oldPresence.docs.forEach(doc => batch.delete(doc.ref));
  if (oldPresence.docs.length > 0) await batch.commit();
});

// ── OBubba camera → cloud event ingestion (see camera_ingest.js + CAMERA_PRODUCTION_ARCHITECTURE.md) ──
const _cam = require("./camera_ingest");
exports.createCameraPairing = _cam.createCameraPairing;
exports.cameraPair = _cam.cameraPair;
exports.cameraIngest = _cam.cameraIngest;
exports.revokeCameraDevice = _cam.revokeCameraDevice;


// ══════════════════════════════════════════════════════════════════════
// RECONCILED 2026-08-08 — recovered from deployed GCS build bundles.
// Each block below is LIVE in production but had been dropped from the
// working source, surviving only because deploys were done with --only.
// ══════════════════════════════════════════════════════════════════════

// ── referral payout (qualifyReferrals) — recovered from the 3 Jul deploy, plus the 2026-08-08 anon-redeemer/self-referral/code-swap fixes ──
const REFERRAL_QUALIFY_DAYS = 14;        // friend must be genuine for 2 weeks
// (already declared above) const REFERRAL_ACTIVE_DAYS_REQUIRED = 7; // ≥7 distinct days with real logs in-window
const REFERRAL_LAPSE_DAYS = 45;          // no qualify by then → lapsed (freed up)
const REFERRAL_REWARD_DAYS = 30;         // 1 free month each
const REFERRAL_CAP_PER_REFERRER = 10;    // max qualified payouts per referrer

const DAY_MS = 24 * 60 * 60 * 1000;

// VERBATIM port of the app's deriveReferralCode (app.jsx / referral.dart) so a

function dayKeyFromMs(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Grant one referral month to a username by EXTENDING premium_entitlements/{username}.
// Never shortens; never overrides a lifetime grant; the free month stacks AFTER any
// existing paid/trial end (notBeforeMs). Mirrors scripts/grant-premium-extension.js.
async function grantReferralMonth(username, { notBeforeMs = 0, reason = "referral" } = {}) {
  if (!usernameId(username)) return { granted: false, why: "no-username" };
  const ref = db.collection("premium_entitlements").doc(username);
  const snap = await ref.get();
  const data = snap.exists ? (snap.data() || {}) : {};
  if (data.lifetime === true || data.forever === true || data.premiumForever === true) {
    return { granted: false, why: "lifetime" };
  }
  const existingMs = timestampMs(data.premiumUntil || data.until || data.expiresAt) || 0;
  const nowMs = Date.now();
  const baseMs = Math.max(nowMs, existingMs, notBeforeMs || 0);
  const untilMs = baseMs + REFERRAL_REWARD_DAYS * DAY_MS;
  const untilIso = new Date(untilMs).toISOString();
  await ref.set({
    active: true,
    type: "referral_bonus",
    plan: "referral_bonus",
    access: "referral_bonus",
    until: untilIso,
    expiresAt: untilIso,
    premiumUntil: untilIso,
    reason,
    source: "referral_reward",
    referralBonusDays: FieldValue.increment(REFERRAL_REWARD_DAYS),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return { granted: true, untilIso };
}

// Count how many qualified payouts a referrer has already earned (cap enforcement).
async function countQualifiedReferrals(referrerUsername) {
  const snap = await db.collection("referral_redemptions")
    .where("referrerUsername", "==", referrerUsername)
    .where("status", "==", "qualified")
    .get();
  return snap.size;
}

// The account that owns [uid] TODAY. Redemptions are made anonymously, so the
// username on the redemption doc is usually empty; the account is created later.
async function usernameForUid(uid) {
  if (!uid) return "";
  try {
    const q = await db.collection("usernames").where("uid", "==", uid).limit(1).get();
    if (!q.empty) return q.docs[0].id;
  } catch (err) { logFunctionWarn("qualifyReferrals/usernameForUid", err); }
  return "";
}

// A canonical key for the two PEOPLE in a referral, order-independent, so a code
// swap (A redeems B's code, B redeems A's) is recognisable as ONE referral.
function referralPairKey(a, b) {
  return [String(a || ""), String(b || "")].sort().join("|");
}

// Has this pair already been settled? A swap must pay 1 month EACH, not 2 — without
// this each person collects once as redeemer and again as referrer.
async function pairAlreadySettled(pairKey) {
  try {
    const q = await db.collection("referral_redemptions").where("pairKey", "==", pairKey).get();
    return q.docs.some((d) => ["qualified", "capped", "duplicate_pair"].includes(String((d.data() || {}).status || "")));
  } catch (err) {
    logFunctionWarn("qualifyReferrals/pairAlreadySettled", err);
    return false;
  }
}

// Gather the redeemer's current child-sync codes (baseline ∪ live lookups).
async function resolveRedeemerCodes(redemption) {
  const codes = { ...parseChildSyncCodes(redemption.redeemerChildCodes) };
  try {
    const u2b = await db.collection("uid_to_backup").doc(String(redemption.redeemerUid || "")).get();
    if (u2b.exists) Object.assign(codes, parseChildSyncCodes((u2b.data() || {}).childSyncCodes));
  } catch (_) { /* ignore */ }
  // ⭐ FIX (2026-08-08): `redeemerUsername` is a snapshot taken at REDEEM time, when the
  // redeemer is still anonymous — every one of the first 11 redemptions stored "". Reading
  // only that field made the payout gate below unsatisfiable FOREVER, so the loop paid
  // nobody for 5 weeks and rows silently lapsed at 45 days. Fall back to the account that
  // owns this uid today. (`resolveRedeemerCodes` already fetched uid_to_backup/{uid} three
  // lines up — the uid was in hand the whole time, just never used for the username.)
  let uname = usernameId(String(redemption.redeemerUsername || "")) ? String(redemption.redeemerUsername) : "";
  if (!uname) uname = await usernameForUid(String(redemption.redeemerUid || ""));
  if (uname) {
    try {
      const us = await db.collection("usernames").doc(uname).get();
      if (us.exists) Object.assign(codes, parseChildSyncCodes((us.data() || {}).childSyncCodes));
    } catch (_) { /* ignore */ }
  }
  return { codes, redeemerUsername: uname };
}

// Count distinct calendar days (>= redeemDayKey) that carry real logged entries
// across the redeemer's child_syncs docs. This is the genuine-use signal.
async function countGenuineActiveDays(codes, redeemDayKey) {
  const days = new Set();
  const isDayKey = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k);
  for (const code of Object.values(codes)) {
    try {
      const snap = await db.collection("child_syncs").doc(code).get();
      if (snap.exists) {
        const child = parseObjectPayload((snap.data() || {}).child);
        const map = child && child.days && typeof child.days === "object" ? child.days : {};
        for (const [k, v] of Object.entries(map)) {
          if (isDayKey(k) && k >= redeemDayKey && Array.isArray(v) && v.length > 0) days.add(k);
        }
      }
      // Archived days (child_sync_v2/{code}/days/{dayKey}) — doc id IS the day key.
      const archived = await db.collection("child_sync_v2").doc(code).collection("days").listDocuments();
      for (const ref of archived) {
        if (isDayKey(ref.id) && ref.id >= redeemDayKey) days.add(ref.id);
      }
    } catch (err) { logFunctionWarn("qualifyReferrals/countDays", err); }
  }
  return days.size;
}

// ── Daily: pay out referrals whose redeemer has genuinely used the app ──
exports.qualifyReferrals = onSchedule("every day 05:00", async () => {
  const pending = await db.collection("referral_redemptions")
    .where("status", "==", "pending")
    .limit(300)
    .get();
  const nowMs = Date.now();
  let qualifiedCount = 0, lapsedCount = 0;

  for (const doc of pending.docs) {
    const r = doc.data() || {};
    const redeemedAtMs = timestampMs(r.redeemedAtMs) || 0;
    if (!redeemedAtMs) continue;
    const ageDays = (nowMs - redeemedAtMs) / DAY_MS;
    if (ageDays < REFERRAL_QUALIFY_DAYS) continue; // still inside the 2-week window

    try {
      const { codes, redeemerUsername } = await resolveRedeemerCodes(r);
      const activeDays = await countGenuineActiveDays(codes, String(r.redeemDayKey || dayKeyFromMs(redeemedAtMs)));

      if (activeDays >= REFERRAL_ACTIVE_DAYS_REQUIRED && redeemerUsername) {
        const referrer = String(r.referrerUsername || "");

        // ⭐ FIX (2026-08-08): a code may pay out many times, but only for GENUINELY
        // DIFFERENT redeemers. Two cases the original missed:
        //  1. Self-referral — redeeming your own code. Seen in production (vane2026,
        //     18 active days), and it would have paid a month twice over to one person.
        //  2. A code SWAP between the same two people. That is ONE referral between two
        //     humans, so it owes 1 month EACH — but two redemption rows each paying
        //     referrer AND redeemer hands both people 2 months. Settle the first
        //     direction and mark the reciprocal as a duplicate.
        if (referrer === redeemerUsername) {
          await doc.ref.set({
            status: "self_referral",
            activeDays,
            resolvedRedeemerUsername: redeemerUsername,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
          continue;
        }
        const pairKey = referralPairKey(referrer, redeemerUsername);
        if (await pairAlreadySettled(pairKey)) {
          await doc.ref.set({
            status: "duplicate_pair",
            activeDays,
            pairKey,
            resolvedRedeemerUsername: redeemerUsername,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
          continue;
        }

        const alreadyQualified = await countQualifiedReferrals(referrer);
        const referrerCapped = alreadyQualified >= REFERRAL_CAP_PER_REFERRER;

        // Redeemer's month starts after their free trial ends; referrer's stacks on
        // whatever premium they already hold.
        let trialEndMs = 0;
        try {
          const ent = await db.collection("entitlements").doc(String(r.redeemerUid || "")).get();
          if (ent.exists) trialEndMs = timestampMs((ent.data() || {}).trialEndsAtMs) || 0;
        } catch (_) { /* ignore */ }

        const redeemerGrant = await grantReferralMonth(redeemerUsername, {
          notBeforeMs: trialEndMs,
          reason: "referral_redeemer",
        });
        const referrerGrant = referrerCapped
          ? { granted: false, why: "cap" }
          : await grantReferralMonth(referrer, { reason: "referral_referrer" });

        await doc.ref.set({
          status: referrerCapped ? "capped" : "qualified",
          activeDays,
          pairKey,
          resolvedRedeemerUsername: redeemerUsername,
          qualifiedAtMs: nowMs,
          redeemerGranted: redeemerGrant.granted === true,
          referrerGranted: referrerGrant.granted === true,
          referrerCapped,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        qualifiedCount++;
      } else if (ageDays >= REFERRAL_LAPSE_DAYS) {
        await doc.ref.set({
          status: "lapsed",
          activeDays,
          lapsedAtMs: nowMs,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        lapsedCount++;
      }
      // else: not enough genuine days yet, but still inside the lapse window → leave pending.
    } catch (err) {
      logFunctionError("qualifyReferrals/row", err);
    }
  }
  console.log(`qualifyReferrals: ${qualifiedCount} qualified, ${lapsedCount} lapsed of ${pending.size} pending`);
});

// ── provider identity sign-in — recovered from the 15 Jun deploy. These helpers exist in NO later source line; the live function has been orphaned since. ──
const PROVIDER_JWKS = {
  apple: {
    issuer: "https://appleid.apple.com",
    keysUrl: "https://appleid.apple.com/auth/keys",
    defaultAudiences: ["com.obubba.app"],
    env: "OBUBBA_APPLE_CLIENT_IDS",
  },
  google: {
    issuer: ["accounts.google.com", "https://accounts.google.com"],
    keysUrl: "https://www.googleapis.com/oauth2/v3/certs",
    defaultAudiences: [],
    env: "OBUBBA_GOOGLE_CLIENT_IDS",
  },
};

function providerName(value) {
  const provider = String(value || "").trim().toLowerCase();
  return provider === "apple" || provider === "google" ? provider : "";
}

function claimString(value, max = 512) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

async function verifyProviderIdentityToken(provider, idToken, expectedSubject) {
  const config = PROVIDER_JWKS[provider];
  if (!config) throw new HttpsError("invalid-argument", "Unsupported sign-in provider");
  const token = String(idToken || "").trim();
  if (!token || token.length > 12000) throw new HttpsError("invalid-argument", "Missing sign-in token");
  const parts = token.split(".");
  if (parts.length !== 3) throw new HttpsError("invalid-argument", "Invalid sign-in token");
  const header = jwtPartJson(parts[0]);
  const payload = jwtPartJson(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new HttpsError("invalid-argument", "Unsupported sign-in token");
  const keys = await fetchProviderKeys(provider, config);
  const jwk = keys.find((key) => key && key.kid === header.kid && (!key.alg || key.alg === "RS256"));
  if (!jwk) throw new HttpsError("invalid-argument", "Could not verify sign-in token");
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const verified = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    publicKey,
    jwtSignatureBuffer(parts[2])
  );
  if (!verified) throw new HttpsError("invalid-argument", "Could not verify sign-in token");

  const nowSeconds = Math.floor(Date.now() / 1000);
  const allowedIssuers = Array.isArray(config.issuer) ? config.issuer : [config.issuer];
  if (!allowedIssuers.includes(String(payload.iss || ""))) {
    throw new HttpsError("invalid-argument", "Invalid sign-in issuer");
  }
  const allowedAudiences = providerAudiences(config);
  if (!allowedAudiences.length) {
    throw new HttpsError("failed-precondition", `${provider} sign-in is not configured`);
  }
  if (!audienceMatches(payload.aud, allowedAudiences)) {
    throw new HttpsError("invalid-argument", "Invalid sign-in audience");
  }
  if (!payload.exp || Number(payload.exp) <= nowSeconds) {
    throw new HttpsError("invalid-argument", "Sign-in token expired");
  }
  if (payload.iat && Number(payload.iat) > nowSeconds + 300) {
    throw new HttpsError("invalid-argument", "Invalid sign-in token time");
  }
  const subject = claimString(payload.sub, 256);
  if (!subject) throw new HttpsError("invalid-argument", "Invalid provider account");
  if (expectedSubject && String(expectedSubject) !== subject) {
    throw new HttpsError("invalid-argument", "Provider account did not match token");
  }
  const email = claimString(payload.email, 320).toLowerCase();
  return {
    provider,
    issuer: String(payload.iss || ""),
    audience: Array.isArray(payload.aud) ? payload.aud.map((value) => String(value || "")).filter(Boolean).slice(0, 6) : String(payload.aud || ""),
    subject,
    subjectHash: sha256Hex(`${payload.iss}|${subject}`),
    emailHash: email && tokenBoolean(payload.email_verified) ? sha256Hex(email) : "",
    emailVerified: tokenBoolean(payload.email_verified),
  };
}

exports.providerAccountSignIn = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const raw = request.data || {};
  const provider = providerName(raw.provider);
  if (!provider) throw new HttpsError("invalid-argument", "Unsupported sign-in provider");

  const identity = await verifyProviderIdentityToken(
    provider,
    raw.idToken || raw.identityToken,
    claimString(raw.providerUser, 256)
  );
  const id = providerDocId(identity);
  const requestedUsername = normaliseUsername(raw.username);
  const backupCode = String(raw.backupCode || "").trim().toUpperCase();
  const displayName = String(raw.displayName || "").trim().slice(0, 80);
  const now = new Date();
  const providerRef = db.collection("account_providers").doc(id);

  const result = await db.runTransaction(async (tx) => {
    const providerSnap = await tx.get(providerRef);
    if (providerSnap.exists) {
      const providerData = providerSnap.data() || {};
      const linkedUsername = normaliseUsername(providerData.username);
      if (!usernameId(linkedUsername) || providerData.deleted) {
        return {
          ok: false,
          needsLink: true,
          error: "This provider sign-in needs to be linked again. Sign in with your OBubba username and PIN once.",
        };
      }
      const usernameRef = db.collection("usernames").doc(linkedUsername);
      const usernameSnap = await tx.get(usernameRef);
      const accountData = usernameSnap.exists ? usernameSnap.data() || {} : {};
      if (!usernameSnap.exists || accountData.deleted) {
        return {
          ok: false,
          needsLink: true,
          error: "This provider sign-in is linked to a missing OBubba account. Sign in with username and PIN to repair it.",
        };
      }
      tx.set(usernameRef, {
        uid,
        authorizedUids: { [uid]: true },
        lastProviderSignInAt: now,
        updatedAt: now,
      }, { merge: true });
      tx.set(providerRef, {
        uid,
        authorizedUids: { [uid]: true },
        lastSignInAt: now,
        emailHash: identity.emailHash || providerData.emailHash || "",
        emailVerified: identity.emailVerified,
        audience: identity.audience,
      }, { merge: true });
      return {
        ok: true,
        mode: "signin",
        provider,
        username: linkedUsername,
        account: publicAccountPayload(linkedUsername, accountData),
      };
    }

    if (!usernameId(requestedUsername)) {
      return {
        ok: false,
        needsLink: true,
        error: `Sign in with your OBubba username and PIN once, then ${provider === "apple" ? "Apple" : "Google"} can be linked.`,
      };
    }

    const usernameRef = db.collection("usernames").doc(requestedUsername);
    const usernameSnap = await tx.get(usernameRef);
    const accountData = usernameSnap.exists ? usernameSnap.data() || {} : {};
    if (!usernameSnap.exists || accountData.deleted) {
      return { ok: false, needsLink: true, error: "Username not found. Sign in with username and PIN first." };
    }
    if (!userOwnsAccountData(accountData, uid) && !accountBackupMatches(accountData, backupCode)) {
      return {
        ok: false,
        needsLink: true,
        error: "Sign in with your OBubba username and PIN once on this device before linking provider sign-in.",
      };
    }

    tx.set(providerRef, {
      provider,
      providerSubjectHash: identity.subjectHash,
      issuer: identity.issuer,
      audience: identity.audience,
      username: requestedUsername,
      uid,
      authorizedUids: { [uid]: true },
      emailHash: identity.emailHash || "",
      emailVerified: identity.emailVerified,
      displayName,
      createdAt: now,
      linkedAt: now,
      lastSignInAt: now,
      deleted: false,
    });
    tx.set(usernameRef, {
      uid,
      authorizedUids: { [uid]: true },
      providerIds: { [id]: true },
      linkedProviders: { [provider]: true },
      lastProviderSignInAt: now,
      updatedAt: now,
    }, { merge: true });
    return {
      ok: true,
      mode: "linked",
      provider,
      username: requestedUsername,
      account: publicAccountPayload(requestedUsername, accountData),
    };
  });

  return result;
});

// ── cleanupBubbaHugs — recovered from the 9 Jun deploy ──
// ── Cleanup: purge expired anonymous Bubba Hugs and clock presence ─────────────────
// Keep anonymous hugs and clock presence short-lived even if the daily cleanup is delayed.
exports.cleanupBubbaHugs = onSchedule("every 1 hours", async () => {
  const cutoffMs = Date.now();
  const oldPresence = await db.collection("bubba_presence")
    .where("expiresAtMs", "<", cutoffMs)
    .limit(200)
    .get();
  const oldHugs = await db.collection("bubba_hugs")
    .where("expiresAtMs", "<", cutoffMs)
    .limit(200)
    .get();

  const batch = db.batch();
  oldPresence.docs.forEach(doc => batch.delete(doc.ref));
  oldHugs.docs.forEach(doc => batch.delete(doc.ref));
  if (oldPresence.docs.length > 0 || oldHugs.docs.length > 0) await batch.commit();
});
