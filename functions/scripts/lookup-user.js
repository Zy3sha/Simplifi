#!/usr/bin/env node
// Read-only lookup: find traces of a username across common collections.
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "obubba-d9ccc";

function norm(v){return String(v||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,40);}

async function main(){
  const raw = process.argv[2];
  if(!raw){ console.error("Usage: node lookup-user.js <username>"); process.exit(1); }
  const u = norm(raw);
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  const db = getFirestore();

  const out = {};

  // 1. premium_entitlements exact id
  const pe = await db.collection("premium_entitlements").doc(u).get();
  out.premium_entitlements = pe.exists ? pe.data() : null;

  // 2. bubba_presence — query by any username-like field; scan a few
  try {
    const ps = await db.collection("bubba_presence")
      .where("username","==",u).limit(5).get();
    out.bubba_presence_byUsername = ps.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ out.bubba_presence_byUsername = "err:"+e.message; }

  try {
    const ps2 = await db.collection("bubba_presence")
      .where("familyUsername","==",u).limit(5).get();
    out.bubba_presence_byFamilyUsername = ps2.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ out.bubba_presence_byFamilyUsername = "err:"+e.message; }

  // 3. user_activity (keyed by uid) — search field
  try {
    const ua = await db.collection("user_activity")
      .where("familyUsername","==",u).limit(5).get();
    out.user_activity = ua.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ out.user_activity = "err:"+e.message; }

  // 4. families collection — fuzzy
  try {
    const f = await db.collection("families")
      .where("familyUsername","==",u).limit(5).get();
    out.families = f.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){ out.families = "err:"+e.message; }

  // 5. Also try a starts-with scan in premium_entitlements for partial match
  if(!pe.exists){
    const all = await db.collection("premium_entitlements").get();
    out.premium_entitlements_partial = all.docs
      .filter(d => d.id.includes(u) || u.includes(d.id))
      .slice(0,10)
      .map(d=>({id:d.id,...d.data()}));
  }

  console.log(JSON.stringify(out, null, 2));
}
main().catch(e=>{console.error(e); process.exit(1);});
