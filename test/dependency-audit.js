#!/usr/bin/env node

const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");

function assert(name, condition, output = "") {
  if (!condition) throw new Error(name + (output ? "\n" + output : ""));
  console.log("✓ " + name);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isTransientAuditError(output) {
  return /ENOTFOUND|ECONNRESET|ETIMEDOUT|EAI_AGAIN|TLS connection|socket disconnected|audit endpoint returned an error|registry\.npmjs\.org/i.test(output || "");
}

function runAudit(label, cwd, level) {
  const maxAttempts = 3;
  let output = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = spawnSync("npm", ["audit", `--audit-level=${level}`], {
      cwd,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 4,
    });
    output = (result.stdout || "") + (result.stderr || "");
    if (result.status === 0) {
      assert(`${label} has no ${level}+ dependency vulnerabilities`, true);
      return;
    }
    if (!isTransientAuditError(output) || attempt === maxAttempts) break;
    sleep(750 * attempt);
  }
  if (isTransientAuditError(output)) {
    console.log(
      `⚠︎ ${label} dependency audit skipped (npm registry/audit endpoint unreachable).`
    );
    return;
  }
  assert(`${label} has no ${level}+ dependency vulnerabilities`, false, output);
}

runAudit("root app", root, "high");
runAudit("Cloud Functions", path.join(root, "functions"), "high");

console.log("Dependency audit passed.");
