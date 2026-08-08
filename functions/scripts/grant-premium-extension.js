#!/usr/bin/env node

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "obubba-d9ccc";

function normaliseUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
}

function usage() {
  console.log("Usage: node scripts/grant-premium-extension.js <obubba_username> [days=14] [reason]");
  console.log("");
  console.log("Example:");
  console.log("  node scripts/grant-premium-extension.js zyeshacorran 14 app_glitch_goodwill");
}

async function main() {
  const [usernameArg, daysArg, ...reasonParts] = process.argv.slice(2);
  if (!usernameArg || usernameArg === "--help" || usernameArg === "-h") {
    usage();
    process.exit(usernameArg ? 0 : 1);
  }

  const username = normaliseUsername(usernameArg);
  if (!username) throw new Error("A valid OBubba username is required.");

  const days = Math.max(1, Math.min(90, Number.parseInt(daysArg || "14", 10) || 14));
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const reason = reasonParts.join(" ").trim() || "app_glitch_goodwill";

  initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });

  const db = getFirestore();
  const ref = db.collection("premium_entitlements").doc(username);
  await ref.set({
    active: true,
    type: "trial_extension",
    plan: "trial_extension",
    access: "trial_extension",
    until: until.toISOString(),
    expiresAt: until.toISOString(),
    premiumUntil: until.toISOString(),
    reason,
    source: "manual_goodwill_extension",
    grantedDays: days,
    lifetime: FieldValue.delete(),
    forever: FieldValue.delete(),
    premiumForever: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`Granted ${days} day(s) of complimentary access to ${username}.`);
  console.log(`Expires: ${until.toISOString()}`);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
