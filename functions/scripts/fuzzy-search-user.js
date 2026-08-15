#!/usr/bin/env node
// Read-only: scan collections for any id/field containing the substring.
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp({ credential: applicationDefault(), projectId: "obubba-d9ccc" });
const db = getFirestore();

async function scanIds(coll, needle){
  const snap = await db.collection(coll).get();
  return snap.docs.filter(d => d.id.toLowerCase().includes(needle))
    .map(d => ({ id:d.id, sample:Object.keys(d.data()).slice(0,5) }));
}

async function scanFields(coll, fieldNames, needle){
  const snap = await db.collection(coll).get();
  const hits=[];
  for(const d of snap.docs){
    const data = d.data();
    for(const f of fieldNames){
      const v = String(data[f]||"").toLowerCase();
      if(v && v.includes(needle)){
        hits.push({ id:d.id, [f]:data[f] });
        break;
      }
    }
  }
  return hits.slice(0,20);
}

async function main(){
  const needle = (process.argv[2]||"mighty").toLowerCase();
  const result = {};
  const collections = ["premium_entitlements","bubba_presence","user_activity","families","fcm_tokens","uid_to_backup","child_syncs","user_prefs"];
  for(const c of collections){
    try {
      result[c+"_ids"] = await scanIds(c, needle);
    } catch(e){ result[c+"_ids"] = "err:"+e.message; }
  }
  // field scans
  for(const c of ["bubba_presence","user_activity","families"]){
    try {
      result[c+"_fields"] = await scanFields(c, ["username","familyUsername","name","displayName","email"], needle);
    } catch(e){ result[c+"_fields"] = "err:"+e.message; }
  }
  console.log(JSON.stringify(result, null, 2));
}
main().catch(e=>{console.error(e); process.exit(1);});
