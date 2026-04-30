#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const firebase = fs.readFileSync(path.join(root, "firebase.js"), "utf8");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

assert("Bubba Hug send flow exists", app.includes("function sendBubbaHug("));
assert("Bubba Hug receive popup exists", app.includes("Someone sent you a Bubba Hug"));
assert("Bubba Hug uses solidarity sender copy", app.includes("Give another parent a hug to let them know they aren't alone. Someone else is awake somewhere holding their baby close, just like them. In solidarity, we find strength and comfort."));
assert("Bubba Hug avoids scary send failure copy", !/couldn'?t send a hug/i.test(app));
assert("Bubba Hug is not paywall gated", !/triggerPaywall\(["']bubba_hug/i.test(app) && !/PremiumGate[^;]*Bubba Hug/s.test(app));
assert("Bedtime resistance remains premium gated", app.includes('triggerPaywall("bedtime_resistance_options", true)'));
assert("Firebase helper exports query limit for live hug listener", firebase.includes(" orderBy, limit") && firebase.includes("limit };"));
assert("Firestore has Bubba Hug collection rules", rules.includes("match /bubba_hugs/{hugId}"));
assert("Bubba Hug rules allow only preset message keys", rules.includes("messageKey in ['not_alone', 'keep_going', 'one_breath', 'tiny_step']"));
assert("Bubba Hug rules bind sender and claim to auth uid", rules.includes("request.resource.data.fromId == request.auth.uid") && rules.includes("request.resource.data.claimedBy == request.auth.uid"));
assert("Bubba Hug create rules do not allow free-text messages", !rules.includes("'message'") && !rules.includes("'text'") && !rules.includes("'username'") && !rules.includes("'babyName'"));

console.log("Bubba Hug audit passed.");
