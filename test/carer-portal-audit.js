#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const careFiles = [
  "care.html",
  "public/care.html",
  "dist/care.html",
  "hosting-care/care.html",
  "hosting-care/index.html",
];

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function extractModuleScript(html) {
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  return match ? match[1] : "";
}

for (const file of careFiles) {
  const html = read(file);
  const script = extractModuleScript(html);
  assert(`${file} has a module script`, script.length > 1000);
  const parseableScript = script.replace(/^import\s+[^;]+;\s*$/gm, "");
  new Function(parseableScript);
  assert(`${file} module script parses after CDN imports are stripped`, true);
  assert(`${file} shows a friendly offline/auth failure`, html.includes("Can't connect") && html.includes("Please check your internet and try again"));
  assert(`${file} shows a friendly expired care-link failure`, html.includes("Care link expired") && html.includes("share a fresh link from OBubba") && script.includes("if (!_resolvedToken)"));
  assert(`${file} protects ended carer sessions before loading data`, html.includes("CHECK SESSION LOCK BEFORE RENDERING") && html.includes("return; // Don't load or render anything"));
  assert(`${file} locks replaced Bubba Care links to the newest shared token`,
    script.includes("const careSessionToken = rawCode.startsWith(\"CT\") ? rawCode : \"\";") &&
    script.includes("function _sessionBlocksCurrentLink(data)") &&
    script.includes("data.activeToken !== careSessionToken") &&
    script.includes("Number(_tokenData.revokedAtMs)") &&
    script.includes("!_tokenRevokedAtMs"));
  assert(`${file} does not keep a live listener on the billing-heavy family document`,
    script.includes("scheduleFamilyContextRefresh();") &&
    !script.includes("renderApp();\n    subscribeFamilyContext();"));
  assert(`${file} writes feed type expected by rules`, script.includes('logEntry({type:"feed", feedType:"bottle"'));
  assert(`${file} writes active nap state expected by rules`, script.includes('logEntry({type:"nap", start:s||nowTime(), end:s||nowTime(), _active:true'));
  assert(`${file} writes nap-end events expected by parent app`, script.includes('logEntry({type:"nap-end", end:_endT'));
  assert(`${file} lets nursery paste day notes into structured parent logs`,
    html.includes("Paste Nursery Notes") &&
    html.includes('data-action="nursery-notes"') &&
    script.includes("function parseNurseryDayNotes(text)") &&
    script.includes("function renderNurseryNotesPreview(result)") &&
    script.includes("async function logEntries(entries)") &&
    script.includes('loggedBy: entry.loggedBy || "nursery"') &&
    script.includes("Nursery notes sent to parents"));
  assert(`${file} keeps Bubba Care on the bedtime day in wake-boundary mode`,
    script.includes("function resolveCareDayKey(child)") &&
    script.includes('familyContext.dayBoundary === "midnight"') &&
    script.includes("previousBedtimeOpen && !hasMorningWakeToday") &&
    !script.includes("nowMins < 13 * 60") &&
    script.includes("familyContext._careDayKey"));
  assert(`${file} sends settled night-wake metadata without freezing the care day`,
    script.includes("nightLocked:true") &&
    script.includes("_nightWakeLog.assistedDuration = _settleMins") &&
    script.includes("_nightWakeLog.settleDuration = _settleMins") &&
    script.includes("entry.night ? (familyContext._careDayKey || todayStrLocal()) : todayStrLocal()"));
  assert(`${file} resumes the bedtime timer after a settled night wake`,
    script.includes("function isOpenNightSleep(entries, bedEntry, nowMins)") &&
    script.includes("function morningWakeClosesBed(entries, bedEntry)") &&
    script.includes("safeEntryList(entries).some(isSettledNightWakeEntry)") &&
    script.includes("_nightWakeSettledAt = Date.now()") &&
    script.includes("const clockLooksOvernight = bedtimeIsEvening && (nowMins >= bedMins || nowMins < 12 * 60)") &&
    script.includes("nightLocked: !!e.nightLocked"));
  assert(`${file} supports grandma-friendly larger portal text without changing the parent app`,
    html.includes("html.large-care-text body") &&
    html.includes("Parent app toggles this in carerInfo.largeText") &&
    script.includes("familyContext.largeText") &&
    script.includes('document.documentElement.classList.toggle("large-care-text", !!familyContext.largeText)'));
  assert(`${file} parses child DOB/due-date through a guarded date-key helper`,
    script.includes("function dateKeyMs(dateStr") &&
    script.includes("const dobMs = dateKeyMs(ch.dob, NaN);") &&
    script.includes("const _dobMs = dateKeyMs(_resolvedCh.dob, NaN);") &&
    script.includes("const _dueMs = dateKeyMs(_resolvedCh.dueDate, NaN);") &&
    !script.includes("new Date(ch.dob + \"T00:00:00\")") &&
    !script.includes("new Date(_resolvedCh.dob + \"T00:00:00\")") &&
    !script.includes("new Date(_resolvedCh.dueDate + \"T00:00:00\")"));
}

const app = read("app.jsx");
assert("parent app centralises Bubba Care URLs behind a CT-token allowlist",
  app.includes('const CARE_PORTAL_BASE_URL = "https://obubba-d9ccc.web.app/care.html";') &&
  app.includes("function safeCarePortalUrl(token, childId = \"\")") &&
  app.includes("if (!/^CT[A-Z2-9]{20}$/.test(safeToken)) return \"\";") &&
  (app.match(/safeCarePortalUrl\(/g) || []).length >= 4 &&
  !/https:\/\/obubba-d9ccc\.web\.app\/care\.html\?code=/.test(app));
assert("parent app does not pause the bed timer for already-settled Bubba Care night wakes",
  app.includes("_e.night && _e._activeNightWake && bedTimerDay && !bedPaused") &&
  app.includes("Carer started a night wake") &&
  !app.includes("Carer logged night wake — pausing bed timer"));
assert("parent app dedupes Bubba Care auto-merged entries by source id",
  app.includes('if (e && e.carerEntryId) return "carer|" + e.carerEntryId;') &&
  app.includes("const nextRaw = normaliseDaysPayload(typeof fn === \"function\" ? fn(baseDays) : fn);") &&
  app.includes("Object.fromEntries(Object.entries(nextRaw).map(([dayKey, entries]) => [dayKey, dedupEntries(entries)]))"));
assert("parent app sends grandma-friendly text as a care portal preference",
  app.includes("currentCarerInfoForPortal()") &&
  app.includes("largeText: !!grandparentMode") &&
  app.includes("syncCarerPortalInfoNow()") &&
  !app.includes('const _snap = await fsGet("families", _code);') &&
  app.includes("Makes the Bubba Care guide easier to read with bigger text and buttons. The app stays the same.") &&
  app.includes('class="${_largeCareGuide?"large-care-text":""}"') &&
  app.includes("{false ? (()=>{"));
assert("parent app rotates Bubba Care share sessions for fresh links and QR codes",
  app.includes("function revokeCarerTokenMapping(tokenData)") &&
  app.includes("async function startCarerSessionForToken(tokenData)") &&
  app.includes("activeToken: tokenData.token") &&
  app.includes("tokenData.previousToken") &&
  (app.match(/ensureSyncedCarerToken\(\{rotate:true\}\)/g) || []).length >= 3 &&
  app.includes("revokedAtMs: Date.now()"));
assert("parent app opens a real Bubba Care preview with a live synced link",
  app.includes("async function previewCareCard()") &&
  app.includes("await ensureSyncedCarerToken({rotate:false, startSession:true});") &&
  app.includes("Preview Care Guide") &&
  app.includes("openCareCardPreview(finalHtml, name)") &&
  app.includes('const previewCareUrl = (() => {') &&
  app.includes('text: name + "\'s care guide from OBubba" + (previewCareUrl ? "\\n\\n" + previewCareUrl : "")'));
assert("parent app Bubba Care preview and link buttons work in touch webviews",
  app.includes("async function sendCareLink()") &&
  app.includes("function runCarerActionOnce(key, action)") &&
  app.includes('const[carePortalReadyUrl,setCarePortalReadyUrl]=useState("");') &&
  app.includes('Open live Bubba Care preview') &&
  app.includes('await ensureSyncedCarerToken({rotate:false, startSession:true});') &&
  app.includes('onPointerUp={e=>{e.preventDefault();e.stopPropagation();haptic();runCarerActionOnce("preview", previewCareCard);}}') &&
  app.includes('onTouchEnd={e=>{e.preventDefault();e.stopPropagation();haptic();runCarerActionOnce("preview", previewCareCard);}}') &&
  app.includes('onPointerUp={e=>{e.preventDefault();e.stopPropagation();haptic();runCarerActionOnce("send-link", sendCareLink);}}') &&
  app.includes('onTouchEnd={e=>{e.preventDefault();e.stopPropagation();haptic();runCarerActionOnce("send-link", sendCareLink);}}') &&
  app.includes('const controller = typeof AbortController !== "undefined" ? new AbortController() : null;') &&
  app.includes('setTimeout(() => controller.abort(), 4000)'));
assert("parent app waits for auth and has REST fallbacks before creating Bubba Care links",
  app.includes("Bubba Care token SDK write failed, trying REST") &&
  app.includes("Bubba Care session SDK write failed, trying REST") &&
  app.includes('fsSet("carer_logs/" + tokenData.backupCode + "/_meta", "session", payload, false)') &&
  app.includes("function carerWriteWithTimeout(promise, label, ms = 6000)") &&
  app.includes('carerWriteWithTimeout(syncCarerPortalInfoNow(), "Bubba Care info sync", 2500)') &&
  app.includes('A changed activeToken is enough for already-open older portals to') &&
  app.includes("if (_opts.rotate || _opts.startSession)") &&
  app.includes("if(v instanceof Date) return {timestampValue: v.toISOString()};"));
assert("parent app replaces small Bubba Care control docs when opening links",
  app.includes('fsSet("carer_tokens", tokenData.token, payload, false)') &&
  app.includes('fsSet("carer_tokens", _carerTokenForCloud, {backupCode: code, expiresAtMs:_carerTokenExpiresAtMs, createdAtClient:new Date().toISOString(), updatedAt: serverTimestamp()}, false)') &&
  app.includes("setDoc(sessionRef, openedPayload)") &&
  !app.includes("setDoc(sessionRef, openedPayload, {merge:true})"));
assert("parent app keeps Bubba Care token expiry safely inside Firestore's rule window",
  app.includes("const CARE_TOKEN_EXPIRY_RULE_GRACE_MS = 5 * 60 * 1000;") &&
  app.includes("function safeCarerTokenExpiryMs(value)") &&
  app.includes("const max = now + CARE_TOKEN_TTL_MS - CARE_TOKEN_EXPIRY_RULE_GRACE_MS;") &&
  app.includes("expiresAtMs: safeCarerTokenExpiryMs()") &&
  app.includes("expiresAtMs:safeCarerTokenExpiryMs(tokenData.expiresAtMs)") &&
  app.includes("expiresAtMs: safeCarerTokenExpiryMs(tokenData.expiresAtMs)"));
assert("parent app labels and imports nursery-originated Bubba Care logs",
  app.includes('const _carerSourceLabel = _e.loggedBy === "nursery" ? "nursery" : "carer";') &&
  app.includes('loggedBy:_carerSourceLabel') &&
  app.includes('if(_e.type==="note") { _newEntry.text=_carerNoteText; }') &&
  app.includes('const sourceLabel = entry.loggedBy === "nursery" ? "nursery" : "carer";') &&
  app.includes('e.loggedBy==="nursery"') &&
  app.includes(">NURSERY<") &&
  app.includes('note:"📝"') &&
  app.includes('note:"Note"'));

assert("root and hosted carer portals are identical", read("care.html") === read("hosting-care/care.html"));
assert("hosted carer portal entrypoints are identical", read("hosting-care/care.html") === read("hosting-care/index.html"));
assert("public carer portal is deployed with the app shell", read("care.html") === read("public/care.html"));
assert("dist carer portal is deployed with the app shell", read("care.html") === read("dist/care.html"));

console.log("Carer portal audit passed.");
