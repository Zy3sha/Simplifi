#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const firebase = fs.readFileSync(path.join(root, "firebase.js"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const hugRules = rules.slice(
  rules.indexOf("match /bubba_hugs/{hugId}"),
  rules.indexOf("// ── Carer Logs ──")
);

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

assert("Bubba Hug send flow exists", app.includes("function sendBubbaHug("));
assert("Bubba Hug receive popup exists", app.includes("Someone sent you a Bubba Hug"));
assert("Bubba Hug uses solidarity sender copy", app.includes("Give another parent a hug to let them know they aren't alone. Someone else is awake somewhere holding their baby close, just like them. In solidarity, we find strength and comfort."));
assert("Bubba Hug received toast exists", app.includes("A Bubba Hug just arrived") && app.includes('label: bubbaHugParentRoomOpenRef.current ? "Open" : "Parent Room"'));
assert("Bubba Hug toast is announced accessibly", app.includes('role="status" aria-live="polite"'));
assert("Bubba Hug full card waits for Parent Room in Care", app.includes('bubbaHugReceived && (tab === "day" || tab === "insights") && daySubScreen === "wellbeing"'));
assert("Bubba Hug can be paused by the parent", app.includes('ob_bubba_hugs_muted') && app.includes("function toggleBubbaHugsMuted()") && app.includes("if (bubbaHugsMuted) return;") && app.includes("aria-pressed={bubbaHugsMuted}"));
assert("Bubba Hug listener tolerates a corrupted seen cache", app.includes("function safeJsonArray(raw, fallback = [])") && app.includes("bubbaHugSeenRef.current = new Set(safeJsonArray(seenRaw).slice(-50));"));
assert("Bubba Hug receive waits for a successful claim", app.includes("const bubbaHugClaimingRef = React.useRef(null);") && app.includes("await setDoc(doc(db, \"bubba_hugs\", picked.id)") && app.includes("catch {\n            return;\n          } finally") && app.indexOf("await setDoc(doc(db, \"bubba_hugs\", picked.id)") < app.indexOf("receiveBubbaHug(picked, now);"));
assert("Bubba Hug receive card does not imply direct replies", app.includes("Send one onward") && !app.includes("Send one back"));
assert("Bubba Hug uses a flashing pink heart", app.includes('className="ob-bubba-hug-heart"') && styles.includes("@keyframes obBubbaHugFlash") && styles.includes("color:#ff5f9f"));
assert("Bubba Hug heart remains visible with reduced motion", /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.ob-bubba-hug-heart[\s\S]*opacity:1/.test(styles));
assert("Bubba Hug avoids scary send failure copy", !/couldn'?t send a hug/i.test(app));
assert("Bubba Hug copy consistently says parent, not mum-only", !/hug from a mum|another mum|mum who has been/i.test(app));
assert("Bubba Hug is not paywall gated", !/triggerPaywall\(["']bubba_hug/i.test(app) && !/PremiumGate[^;]*Bubba Hug/s.test(app));
assert("Bedtime resistance remains premium gated", app.includes('triggerPaywall("bedtime_resistance_options", true)'));
assert("Firebase helper exports query limit for live hug listener", firebase.includes(" orderBy, limit") && firebase.includes("limit };"));
assert("Firestore has Bubba Hug collection rules", rules.includes("match /bubba_hugs/{hugId}"));
assert("Bubba Hug list reads are query-limited", rules.includes("allow list: if signedIn() && request.query.limit <= 25;"));
assert("Bubba Hug rules allow only preset message keys", rules.includes("messageKey in ['not_alone', 'keep_going', 'one_breath', 'tiny_step']"));
assert("Bubba Hug rules cap hug lifetime", rules.includes("request.resource.data.expiresAtMs <= request.resource.data.createdAtMs + 10 * 60 * 1000"));
assert("Bubba Hug rules reject future-dated sends", rules.includes("request.resource.data.createdAtMs <= request.time.toMillis() + 2 * 60 * 1000"));
assert("Bubba Hug rules reject expired claims", rules.includes("resource.data.expiresAtMs >= request.time.toMillis()"));
assert("Bubba Hug rules bind sender and claim to auth uid", rules.includes("request.resource.data.fromId == request.auth.uid") && rules.includes("request.resource.data.claimedBy == request.auth.uid"));
assert("Bubba Hug rules prevent claiming your own hug", rules.includes("resource.data.fromId != request.auth.uid"));
assert("Bubba Hug create rules do not allow free-text messages", !hugRules.includes("'message'") && !hugRules.includes("'text'") && !hugRules.includes("'username'") && !hugRules.includes("'babyName'"));
assert("Bubba Hug listener ignores future-dated records", app.includes("if (created > now + 2*60*1000) return;"));
assert("Bubba Hug preset choice avoids Math.random", /function pickBubbaHugKey\(context\) \{[\s\S]{0,360}secureRandomIndex\(keys\.length\)[\s\S]{0,120}Date\.now\(\) % keys\.length[\s\S]{0,120}return keys\[idx\]/.test(app) && !/function pickBubbaHugKey\(context\) \{[\s\S]{0,360}Math\.random/.test(app));
assert("Bubba Hug rate limit ignores corrupted future storage", app.includes('const last = safeTimestampMs(localStorage.getItem("ob_bubba_hug_last_sent_ms"), 0);') && app.includes("if (last && last <= now && now - last < 2*60*1000)"));
assert("Clock Track presence turns worldwide active parents into anonymous night fireflies", app.includes("const[clockPresenceParents,setClockPresenceParents]=useState([])") && app.includes('setDoc(doc(db, "bubba_presence", myId)') && app.includes('query(collection(db, "bubba_presence"), orderBy("lastSeenMs", "desc"), limit(40))') && app.includes('setClockPresenceParents(clockHomeLabTheme === "night" ? parents.slice(0, 8) : []);') && app.includes('const clockPresenceGlyphs = clockLabIsDay ? [] : (clockPresenceParents || []).map') && app.includes('const clockPresenceKindFor = () => "firefly";') && app.includes('const presenceClass = "is-firefly";') && app.includes("Send a Bubba Hug to another parent awake tonight.") && styles.includes("@keyframes obClockPresenceTwinkle") && styles.includes("@keyframes obClockPresenceHeartbeat") && !app.includes("is-flower"));
assert("Clock Track Bubba Hug routes star taps into the same quiet minute without identities", app.includes('sendBubbaHug("clock_presence"') && app.includes("minuteBucket: clockPresenceMinuteBucket(Date.now())") && app.includes("Your Bubba Hug is heading to a parent awake in this same quiet minute.") && app.includes("A parent awake in this same quiet minute sent you a Bubba Hug.") && app.includes('if (data.context === "clock_presence" && minuteBucket)') && app.includes("minuteBucket !== myMinute && minuteBucket !== myMinute - 1") && !app.includes("recipientId"));
assert("Firestore has anonymous clock presence rules", rules.includes("match /bubba_presence/{presenceId}") && rules.includes("allow list: if signedIn() && request.query.limit <= 40;") && rules.includes("presenceId == request.auth.uid") && rules.includes("request.resource.data.keys().hasOnly([\n          'fromId', 'app', 'localMode', 'minuteBucket',") && rules.includes("request.resource.data.expiresAtMs <= request.resource.data.lastSeenMs + 30 * 60 * 1000") && rules.includes("'clock_presence'") && !rules.slice(rules.indexOf("match /bubba_presence/{presenceId}"), rules.indexOf("// ── Bubba Hugs ──")).includes("'location'"));

console.log("Bubba Hug audit passed.");
