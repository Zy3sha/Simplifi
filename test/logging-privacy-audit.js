#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const firebaseSource = fs.readFileSync(path.join(root, "firebase.js"), "utf8");
const functionsSource = fs.readFileSync(path.join(root, "functions/index.js"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function productionConsoleGuard(source, debugName) {
  return source.includes(debugName) &&
    source.includes('["log","info","debug","warn","error"].forEach') &&
    source.includes("console[method] = function(){};");
}

const riskyFunctionLogs = functionsSource
  .split(/\r?\n/)
  .filter(line => /console\.(warn|error|log|info|debug)\(/.test(line))
  .filter(line => /\b(uid|doc\.id|localId|idToken|refreshToken|backupCode|childSyncCodes)\b/.test(line));

assert("main app suppresses all console output outside debug mode", productionConsoleGuard(appSource, "OB_DEBUG"));
assert("Firebase bootstrap suppresses all console output outside debug mode", productionConsoleGuard(firebaseSource, "OB_FIREBASE_DEBUG"));
assert("Cloud Functions logs pass through a sanitizer", functionsSource.includes("function safeErrorSummary(err)") && functionsSource.includes("logFunctionError(") && functionsSource.includes("logFunctionWarn("));
assert("Cloud Functions logs avoid raw account identifiers", riskyFunctionLogs.length === 0);
assert("analytics events avoid sending observation titles", !appSource.includes('params: { title: _entry.title }') && !appSource.includes('"observation_added", { title: _entry.title }') && appSource.includes('const _params = { priority: _prio };'));

console.log("Logging privacy audit passed.");
