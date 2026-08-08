#!/usr/bin/env node
// Read-only report: count native App Store / Google Play premium mirrors.
const { execFileSync } = require("child_process");

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "obubba-d9ccc";
const COLLECTION = "store_entitlements";

function usage() {
  console.log("Usage: node functions/scripts/count-store-premium.js");
  console.log("Counts active records written by mirrorStoreEntitlement.");
}

function firestoreValue(value) {
  if (!value || typeof value !== "object") return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return !!value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValue);
  if ("mapValue" in value) {
    const out = {};
    for (const [key, child] of Object.entries(value.mapValue.fields || {})) out[key] = firestoreValue(child);
    return out;
  }
  return undefined;
}

function docData(doc) {
  const out = { id: String(doc.name || "").split("/").pop() };
  for (const [key, value] of Object.entries(doc.fields || {})) out[key] = firestoreValue(value);
  return out;
}

function dateMs(value) {
  if (!value) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const ms = Date.parse(String(value));
  return Number.isFinite(ms) ? ms : 0;
}

function isActiveStoreRecord(record, nowMs) {
  if (!record || record.active !== true) return false;
  const expiresAtMs = Number(record.expiresAtMs) || dateMs(record.expiresAt);
  if (expiresAtMs && expiresAtMs <= nowMs) return false;
  const staleAfterMs = Number(record.staleAfterMs) || 0;
  if (staleAfterMs && staleAfterMs <= nowMs) return false;
  return true;
}

function storeRecordStatus(record, nowMs) {
  if (!record || record.active !== true) return "inactive";
  const expiresAtMs = Number(record.expiresAtMs) || dateMs(record.expiresAt);
  if (expiresAtMs && expiresAtMs <= nowMs) return "expired";
  const staleAfterMs = Number(record.staleAfterMs) || 0;
  if (staleAfterMs && staleAfterMs <= nowMs) return "stale";
  return "active";
}

async function listCollection() {
  const token = execFileSync("gcloud", ["auth", "application-default", "print-access-token"], { encoding: "utf8" }).trim();
  let pageToken = "";
  const docs = [];
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await response.text();
    if (response.status === 404) return docs;
    if (!response.ok) throw new Error(`${response.status} ${text.slice(0, 500)}`);
    const json = JSON.parse(text);
    docs.push(...(json.documents || []).map(docData));
    pageToken = json.nextPageToken || "";
  } while (pageToken);
  return docs;
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }
  const nowMs = Date.now();
  const docs = await listCollection();
  const active = docs.filter((doc) => isActiveStoreRecord(doc, nowMs));
  const byPlatform = {};
  const byProduct = {};
  const byStatus = {};
  for (const doc of docs) {
    const status = storeRecordStatus(doc, nowMs);
    byStatus[status] = (byStatus[status] || 0) + 1;
  }
  for (const doc of active) {
    const platform = doc.platform || "unknown";
    const product = doc.productId || "unknown";
    byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    byProduct[product] = (byProduct[product] || 0) + 1;
  }

  console.log(`Store entitlement mirror docs: ${docs.length}`);
  console.log(`Active store premium users: ${active.length}`);
  console.log("\nBy status:");
  ["active", "expired", "stale", "inactive"].forEach((key) => console.log(`  ${key}: ${byStatus[key] || 0}`));
  console.log("\nBy platform:");
  Object.entries(byPlatform).sort().forEach(([key, value]) => console.log(`  ${key}: ${value}`));
  console.log("\nBy product:");
  Object.entries(byProduct).sort().forEach(([key, value]) => console.log(`  ${key}: ${value}`));
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
