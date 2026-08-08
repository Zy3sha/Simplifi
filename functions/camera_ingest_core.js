// Pure, dependency-free core for the camera ingestion webhook (crypto only — no
// firebase). Holds the rules-critical, replay-safety, and clock-authority logic so it
// can be unit-tested without the Functions runtime. camera_ingest.js wires these into
// the cloud functions.
const crypto = require("crypto");

// The camera's vocabulary → the carer entry it becomes. Every type is in the deployed
// validCarerEntryWrite() allowlist, so these merge through the existing Bubba Care
// pull-back unchanged. The camera NEVER asserts a milestone (no 'milestone' entry type
// + liability) — it suggests via a note the parent confirms.
const CAMERA_EVENT_KINDS = {
  "nap-start": "nap",
  "nap-end": "nap-end",
  "bedtime": "sleep",
  "morning": "wake",
  "night-wake": "wake",
  "feed": "feed",
  "note": "note",
};

const BACKUP_CODE_RE = /^[A-Z0-9]{6,20}$/;
const MAX_BACKDATE_MS = 48 * 3600 * 1000;
const NONCE_TTL_MS = 10 * 60 * 1000;
const INGEST_MAX_EVENTS = 50;
const INGEST_MIN_INTERVAL_MS = 1000;
const INGEST_MAX_PER_HOUR = 240;

const pad = (n) => String(n).padStart(2, "0");
const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const randomCode = (bytes) => crypto.randomBytes(bytes).toString("hex").toUpperCase();

// Local hh:mm + YYYY-MM-DD for an epoch ms in a fixed offset (the family's tz, passed
// in; default UTC). We trust the MOMENT the watcher reports and derive the fields
// server-side, so a device field can't smuggle a malformed shape.
function clockFields(atMs, tzOffsetMin = 0) {
  const d = new Date(atMs + tzOffsetMin * 60000);
  return {
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    minute: Math.floor((atMs + tzOffsetMin * 60000) / 60000),
  };
}

// Reject implausible device clocks (epoch, build-date, future) so a deterministic id
// can't cement a wrong-day log into the engine's known day-confusion bug class.
function validateEventTime(atMs, nowMs) {
  if (!Number.isFinite(atMs)) return null;
  if (atMs > nowMs + 120000) return null;
  if (atMs < nowMs - MAX_BACKDATE_MS) return null;
  return atMs;
}

// Deterministic, replay-safe doc id (the prototype's cam_<now>_<rand> was replay-UNSAFE).
// Same device + kind + minute → same id → setDoc upsert, no duplicate.
function deterministicEntryId(deviceId, kind, atMs, tzOffsetMin = 0) {
  const minute = clockFields(atMs, tzOffsetMin).minute;
  const h = crypto.createHash("sha1").update(`${deviceId}|${kind}|${minute}`).digest("hex").slice(0, 24);
  return `cam_${h}`;
}

// Build the carer entry (ONLY validCarerEntryWrite-allowlisted keys) for one event.
// null for an unknown kind.
function buildCarerEntry(kind, atMs, opts = {}) {
  const type = CAMERA_EVENT_KINDS[kind];
  if (!type) return null;
  const tz = opts.tzOffsetMin || 0;
  const { time, date } = clockFields(atMs, tz);
  const e = { type, source: "camera", loggedBy: "camera", loggedAt: new Date(atMs).toISOString().slice(0, 40), startMs: atMs };
  if (kind === "nap-start" || kind === "bedtime") { e.start = time; e.date = date; }
  else if (kind === "nap-end") { e.end = time; e.time = time; }
  else if (kind === "morning") { e.night = false; e.time = time; }
  else if (kind === "night-wake") { e.night = true; e.time = time; }
  else if (kind === "feed") { e.time = time; e.note = "📷 auto-detected — set amount or delete"; }
  else if (kind === "note") { e.time = time; e.note = String(opts.note || "Possible milestone — confirm in the app").slice(0, 500); }
  return e;
}

module.exports = {
  CAMERA_EVENT_KINDS, BACKUP_CODE_RE, MAX_BACKDATE_MS, NONCE_TTL_MS,
  INGEST_MAX_EVENTS, INGEST_MIN_INTERVAL_MS, INGEST_MAX_PER_HOUR,
  pad, sha256, randomCode, clockFields, validateEventTime, deterministicEntryId, buildCarerEntry,
};
