#!/usr/bin/env node
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
initializeApp({ credential: applicationDefault(), projectId: "obubba-d9ccc" });
const db = getFirestore();

(async () => {
  const now = Date.now();
  const snap = await db.collection("premium_entitlements").get();
  let active = 0, expired = 0, lifetime = 0;
  const sources = {};
  const expiringSoon = [];
  snap.forEach(doc => {
    const d = doc.data() || {};
    const src = d.source || d.product || "unknown";
    sources[src] = (sources[src] || 0) + 1;
    const untilMs = d.until ? new Date(d.until).getTime() : 0;
    if (!d.until || d.lifetime || src.includes("lifetime")) { lifetime++; active++; return; }
    if (untilMs > now) {
      active++;
      const daysLeft = Math.round((untilMs - now) / 86400000);
      if (daysLeft <= 14) expiringSoon.push({ id: doc.id, daysLeft, source: src });
    } else {
      expired++;
    }
  });
  console.log(`Total entitlement docs: ${snap.size}`);
  console.log(`Active (incl. lifetime): ${active}`);
  console.log(`  └ Lifetime: ${lifetime}`);
  console.log(`Expired: ${expired}`);
  console.log(`\nBy source:`);
  Object.entries(sources).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  if (expiringSoon.length) {
    console.log(`\nExpiring in next 14 days (${expiringSoon.length}):`);
    expiringSoon.sort((a,b)=>a.daysLeft-b.daysLeft).forEach(e => console.log(`  ${e.id} (${e.source}): ${e.daysLeft}d`));
  }
})().catch(e => { console.error(e); process.exit(1); });
