#!/usr/bin/env node
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
initializeApp({ credential: applicationDefault(), projectId: "obubba-d9ccc" });
const db = getFirestore();
(async () => {
  const needle = (process.argv[2] || "mightya").toLowerCase();
  const d = await db.collection("usernames").doc(needle).get();
  console.log(`usernames/${needle} exists:`, d.exists);
  if (d.exists) console.log(JSON.stringify(d.data(), null, 2));
  const all = await db.collection("usernames").get();
  console.log(`\nTotal usernames docs: ${all.size}`);
  const hits = all.docs.filter(x => x.id.toLowerCase().includes(needle.slice(0, 5)));
  console.log(`\nFuzzy matches:`, hits.map(h => ({ id: h.id, ...h.data() })));
})().catch(e => { console.error(e); process.exit(1); });
