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

initializeApp();
const adminAuth = getAuth();
const db = getFirestore();
const messaging = getMessaging();

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

const jwksCache = new Map();

function providerName(value) {
  const provider = String(value || "").trim().toLowerCase();
  return provider === "apple" || provider === "google" ? provider : "";
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function jwtPartJson(part) {
  try {
    return JSON.parse(Buffer.from(String(part || ""), "base64url").toString("utf8"));
  } catch {
    throw new HttpsError("invalid-argument", "Invalid sign-in token");
  }
}

function jwtSignatureBuffer(part) {
  try {
    return Buffer.from(String(part || ""), "base64url");
  } catch {
    throw new HttpsError("invalid-argument", "Invalid sign-in token");
  }
}

function providerAudiences(config) {
  const configured = String(process.env[config.env] || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([...(config.defaultAudiences || []), ...configured])];
}

function claimString(value, max = 512) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function tokenBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function audienceMatches(aud, allowedAudiences) {
  const values = Array.isArray(aud) ? aud : [aud];
  return values.some((value) => allowedAudiences.includes(String(value || "")));
}

async function fetchProviderKeys(provider, config) {
  const cached = jwksCache.get(provider);
  if (cached && cached.expiresAt > Date.now() && Array.isArray(cached.keys)) return cached.keys;
  const response = await fetch(config.keysUrl, { method: "GET" });
  if (!response || !response.ok) throw new HttpsError("unavailable", "Could not verify provider sign-in");
  const body = await response.json();
  const keys = body && Array.isArray(body.keys) ? body.keys : [];
  if (!keys.length) throw new HttpsError("unavailable", "Could not verify provider sign-in");
  const cacheControl = String(response.headers && response.headers.get ? response.headers.get("cache-control") || "" : "");
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeMs = maxAgeMatch ? Math.max(300, Math.min(Number(maxAgeMatch[1]) || 3600, 21600)) * 1000 : 60 * 60 * 1000;
  jwksCache.set(provider, { keys, expiresAt: Date.now() + maxAgeMs });
  return keys;
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

function providerDocId(identity) {
  return `${identity.provider}_${identity.subjectHash}`;
}

exports.usernameStatus = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const username = normaliseUsername(request.data && request.data.username);
  if (!usernameId(username)) throw new HttpsError("invalid-argument", "Invalid username");
  const snap = await db.collection("usernames").doc(username).get();
  const data = snap.exists ? snap.data() || {} : {};
  return { exists: snap.exists && !data.deleted };
});

exports.accountLogin = onCall(async (request) => {
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
  return { ok: true, account: publicAccountPayload(username, data) };
});

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
  if (data && !userOwnsAccountData(data, uid) && !accountBackupMatches(data, backupCode)) {
    return { ok: false, error: "Backup code does not match this username" };
  }

  const backupMatches = accountBackupMatches(data, backupCode);
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
  const result = await db.runTransaction(async (tx) => {
    const deviceRef = db.collection("trial_devices").doc(trialDeviceKey);
    const entitlementRef = db.collection("entitlements").doc(uid);
    const usernameRef = usernameId(username) ? db.collection("usernames").doc(username) : null;
    const [deviceSnap, entitlementSnap, usernameSnap] = await Promise.all([
      tx.get(deviceRef),
      tx.get(entitlementRef),
      usernameRef ? tx.get(usernameRef) : Promise.resolve(null),
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
        used: data.trialUsed === true || data.freeTrialUsed === true || !!data.trialEndedAt || !!data.trialEndedAtClient || nowMs >= endMs,
      });
    };

    pushCandidate(deviceSnap.exists ? (deviceSnap.data() || {}) : null);
    pushCandidate(entitlementSnap.exists ? (entitlementSnap.data() || {}) : null);
    const usernameData = usernameSnap && usernameSnap.exists ? (usernameSnap.data() || {}) : null;
    const ownsUsername = usernameData && !usernameData.deleted && userOwnsAccountData(usernameData, uid);
    if (ownsUsername) pushCandidate(usernameData);

    const fallbackStartMs = trialStartFromClient(firstInstallAtClient, nowMs);
    const startMs = candidates.length ? Math.min(...candidates.map(c => c.startMs)) : fallbackStartMs;
    const endMs = startMs + TRIAL_MS;
    const used = candidates.some(c => c.used || nowMs >= c.endMs) || nowMs >= endMs;
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

    return publicTrialPayload(entitlementPatch, nowMs);
  });

  return { ok: true, trial: result };
});

exports.deleteAccount = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const uid = request.auth.uid;
  const username = normaliseUsername(request.data && request.data.username);
  const backupCode = String((request.data && request.data.backupCode) || "").trim().toUpperCase();
  const trialDeviceKey = String((request.data && request.data.trialDeviceKey) || "").trim().toLowerCase();
  const requestedChildCodes = parseChildSyncCodes(request.data && request.data.childSyncCodes);

  const cleanup = [];
  let usernameData = null;
  if (usernameId(username)) {
    const usernameRef = db.collection("usernames").doc(username);
    const usernameSnap = await usernameRef.get();
    if (usernameSnap.exists) {
      const data = usernameSnap.data() || {};
      const owner = data.uid === uid || (data.authorizedUids && data.authorizedUids[uid] === true);
      if (owner) {
        usernameData = data;
        cleanup.push(usernameRef.delete());
        if (data.recoveryEmailLookupId) cleanup.push(db.collection("recovery_emails").doc(String(data.recoveryEmailLookupId)).delete());
      }
    }
  }

  const uidBackupRef = db.collection("uid_to_backup").doc(uid);
  const uidBackupSnap = await uidBackupRef.get();
  const uidBackupData = uidBackupSnap.exists ? (uidBackupSnap.data() || {}) : {};
  const verifiedBackupCode = backupCodeId(backupCode)
    && (
      uidBackupData.backupCode === backupCode
      || (usernameData && (usernameData.backupCode === backupCode || usernameData.familyCode === backupCode))
    )
    ? backupCode
    : "";
  if (verifiedBackupCode) cleanup.push(db.collection("families").doc(verifiedBackupCode).delete());

  const cloudChildCodes = {
    ...parseChildSyncCodes(uidBackupData.childSyncCodes),
    ...parseChildSyncCodes(usernameData && usernameData.childSyncCodes),
    ...requestedChildCodes,
  };
  for (const [childId, code] of Object.entries(cloudChildCodes)) {
    const syncRef = db.collection("child_syncs").doc(code);
    const syncSnap = await syncRef.get();
    const syncData = syncSnap.exists ? (syncSnap.data() || {}) : {};
    const ownsSync = syncData.ownerUid === uid || (!!username && syncData.ownerUsername === username);
    if (ownsSync) {
      const syncChild = parseObjectPayload(syncData.child);
      const ownerSeed = username || syncData.ownerUsername || uid;
      cleanup.push(syncRef.delete());
      for (const mapId of childCodeMapIdsForOwner(childId, syncChild, ownerSeed)) {
        cleanup.push(db.collection("child_code_map").doc(mapId).delete());
      }
    }
  }

  if (trialDeviceId(trialDeviceKey)) {
    const trialRef = db.collection("trial_devices").doc(trialDeviceKey);
    const trialSnap = await trialRef.get();
    const trialData = trialSnap.exists ? (trialSnap.data() || {}) : {};
    if (trialData.uid === uid) {
      cleanup.push(trialRef.set({
        uid: "",
        username: "",
        accountDeletedAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true }));
    }
  }

  cleanup.push(
    db.collection("uid_to_backup").doc(uid).delete(),
    db.collection("fcm_tokens").doc(uid).delete(),
    db.collection("user_activity").doc(uid).delete(),
  );
  const results = await Promise.allSettled(cleanup);
  const cleanupFailures = results.filter(result => result.status === "rejected");
  if (cleanupFailures.length > 0) {
    logFunctionError("Account deletion cleanup failed", cleanupFailures[0].reason);
    throw new HttpsError("internal", "Account deletion cleanup failed");
  }
  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    if (!err || err.code !== "auth/user-not-found") {
      throw err;
    }
  }
  return { ok: true };
});

function safePushText(value, fallback, maxLen = 180) {
  const raw = typeof value === "string" ? value : "";
  const text = raw.replace(/\s+/g, " ").trim() || fallback;
  return text.slice(0, maxLen);
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
  const hugCutoffMs = Date.now();
  const expiredHugs = await db.collection("bubba_hugs")
    .where("expiresAtMs", "<", hugCutoffMs)
    .limit(200)
    .get();
  expiredHugs.docs.forEach(doc => batch.delete(doc.ref));
  if (old.docs.length > 0 || expiredHugs.docs.length > 0) await batch.commit();
});

// ── Cleanup: purge expired anonymous Bubba Hugs ─────────────────
exports.cleanupBubbaHugs = onSchedule("every 1 hours", async () => {
  const cutoffMs = Date.now();
  const old = await db.collection("bubba_hugs")
    .where("expiresAtMs", "<", cutoffMs)
    .limit(200)
    .get();

  const batch = db.batch();
  old.docs.forEach(doc => batch.delete(doc.ref));
  if (old.docs.length > 0) await batch.commit();
});
