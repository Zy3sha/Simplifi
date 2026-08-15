#!/usr/bin/env node
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp({ credential: applicationDefault(), projectId: "obubba-d9ccc" });

async function main(){
  const needle = (process.argv[2]||"mighty").toLowerCase();
  const hits=[];
  let pageToken;
  do {
    const res = await getAuth().listUsers(1000, pageToken);
    for(const u of res.users){
      const email = (u.email||"").toLowerCase();
      const name = (u.displayName||"").toLowerCase();
      if(email.includes(needle) || name.includes(needle)){
        hits.push({uid:u.uid, email:u.email, displayName:u.displayName, created:u.metadata.creationTime});
      }
    }
    pageToken = res.pageToken;
  } while(pageToken);
  console.log(JSON.stringify(hits, null, 2));
  console.log(`\nTotal matches: ${hits.length}`);
}
main().catch(e=>{console.error(e); process.exit(1);});
