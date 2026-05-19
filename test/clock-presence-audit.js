#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const functionsSource = fs.readFileSync(path.join(root, "functions/index.js"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

assert("Bubba Hug client code is removed", !/Bubba Hug|bubbaHug|sendBubbaHug|sendClockPresenceHug|ob_bubba_hugs|bubba_hugs/.test(app));
assert("Bubba Hug styles are removed", !/ob-bubba-hug|ob-parent-room-bubba-hug|obBubbaHug|Bubba Hug/.test(styles));
assert("Bubba Hug Firestore rules are removed", !rules.includes("match /bubba_hugs/{hugId}") && !rules.includes("bubba_hugs"));
assert("Bubba Hug Cloud Function cleanup is removed", !functionsSource.includes("bubba_hugs") && !functionsSource.includes("cleanupBubbaHugs"));

assert("Clock presence state still exists", app.includes("const[clockPresenceParents,setClockPresenceParents]=useState([])") && app.includes("const[clockPresencePulse,setClockPresencePulse]=useState(null)"));
assert("Clock presence writes anonymous own-user presence only", app.includes('setDoc(doc(db, "bubba_presence", myId)') && app.includes("fromId: myId") && app.includes("minuteBucket: clockPresenceMinuteBucket(nowMs)") && app.includes("expiresAtMs: nowMs + clockPresenceOnlineWindowMs"));
assert("Clock presence reads stay capped to recent anonymous parents", app.includes("const clockPresenceQueryLimit = 60;") && app.includes('query(collection(db, "bubba_presence"), orderBy("lastSeenMs", "desc"), limit(clockPresenceQueryLimit))') && app.includes("nowMs - lastSeen > clockPresenceOnlineWindowMs") && app.includes("parents.slice(0, clockPresenceDisplayLimit)"));
assert("Night firefly count is driven by parents seen in the last five minutes", app.includes("const clockPresenceOnlineWindowMs = 5 * 60 * 1000;") && app.includes('if (tab !== "day" || clockHomeLabTheme !== "night")') && app.includes('const clockPresenceVisibleParents = clockLabIsDay ? [] : (clockPresenceParents || []).slice(0, clockPresenceDisplayLimit);') && app.includes('data-presence-online-count={clockPresenceVisibleParents.length}'));
assert("Clock presence fireflies are passive, not send controls", app.includes('detail:"Another parent is awake too. You are not the only one up right now."') && app.includes('role="img" tabIndex="0" aria-label={label}') && !app.includes('aria-label="Parent awake now. Send') && !app.includes('onClick={(ev)=>{ev.stopPropagation();showClockPresenceTip(parent);'));
assert("Clock presence firefly visuals remain available", app.includes('className="ob-clock-firefly-field"') && app.includes('className={"ob-clock-ambient-firefly"') && app.includes('className="ob-clock-presence-firefly" aria-hidden="true"') && styles.includes("@keyframes obClockPresenceTwinkle") && styles.includes("@keyframes obClockAmbientFireflyFloat"));
assert("Android and iOS static welcome clocks do not disable night presence fireflies", app.includes('const _welcomeStaticClock = _nativePlatform === "android" || _welcomeReducedMotion;') && app.includes('animation:_welcomeStaticClock?"none":"obWelcomeOrbit 18s linear infinite"') && app.includes("const clockAndroidVisualMode =") && app.includes("const clockIosVisualMode =") && app.includes("const clockFireflyCanvasMode = clockAndroidVisualMode || clockIosVisualMode;") && app.includes("const clockPresenceCanvasGlyphs = clockFireflyCanvasMode") && app.includes('<ClockFireflyCanvas flies={clockPresenceCanvasGlyphs} pulseId={clockPresencePulse && clockPresencePulse.id}/>') && app.includes('const isPaused = reducedMotion || document.hidden || document.body?.getAttribute("data-ob-android-scrolling") === "1";') && styles.includes(".ob-clock-firefly-canvas"));
assert("Firestore has anonymous clock presence rules", rules.includes("match /bubba_presence/{presenceId}") && rules.includes("allow list: if signedIn() && request.query.limit <= 60;") && rules.includes("presenceId == request.auth.uid") && rules.includes("request.resource.data.expiresAtMs <= request.resource.data.lastSeenMs + 5 * 60 * 1000") && !rules.slice(rules.indexOf("match /bubba_presence/{presenceId}"), rules.indexOf("// ── Carer Logs ──")).includes("'location'"));
assert("Cloud Functions retain only clock presence ephemera cleanup", functionsSource.includes('exports.cleanupClockPresence = onSchedule("every day 04:00"') && functionsSource.includes('.collection("bubba_presence")') && functionsSource.includes('.where("expiresAtMs", "<", cutoffMs)'));

console.log("Clock presence audit passed.");
