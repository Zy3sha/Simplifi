#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function between(start, end) {
  const s = app.indexOf(start);
  const e = app.indexOf(end, s + start.length);
  assert(`found ${start}`, s >= 0);
  assert(`found ${end}`, e > s);
  return app.slice(s, e);
}

const care = between("function generateCarerCardHTML()", "async function prepareCareCardHTML()");
const print = between("const isOverlay = !!window._isNative;", "w.document.write(html2.replace");
const weekly = between("const _title = digest.name + \"'s Weekly Digest\";", "await safeCopyText(digest.text");
const health = between("const _title = \"Health Report. \" + report.name;", "await safeCopyText(_text");

assert("shared HTML escape helper exists", app.includes("const htmlEscapeMap =") && app.includes("const htmlEscape ="));
assert("shared safe file-name helper exists", app.includes("const safeFileStem ="));

assert("care card escapes baby name before HTML insertion", care.includes("const nameHtml = htmlEscape(name)") && !care.includes("${name}'s Bubba Care"));
assert("care card escapes pinned notes", care.includes("htmlEscape(n.text)") && !care.includes("${n.text}"));
assert("care card escapes carer comfort and notes", care.includes("htmlEscape(carerComfort)") && care.includes("htmlEscape(carerNotes)") && !care.includes("${carerComfort}") && !care.includes("${carerNotes}"));
assert("care card escapes appointment text", care.includes("htmlEscape(a.title)") && care.includes("htmlEscape(a.note)") && !care.includes("${a.title}") && !care.includes("${a.note}"));
assert("care card escapes emergency contacts", care.includes("htmlEscape(c.name)") && care.includes("htmlEscape(c.phone)") && care.includes("htmlEscape(c.relation)"));
assert("care card escapes guidance labels", care.includes("sleepSourceHtml") && care.includes("safeSleepSourceHtml") && care.includes("nonEmergencyLabelHtml"));
assert("care card renders safe sleep temperature values, not literal code text", care.includes("Room temperature ${tempRangeHtml}") && !care.includes('"+cToDisplay(16)+"'));
assert("QR fetch decodes escaped ampersands", app.includes('qrImg[1].replace(/&amp;/g, "&")') && app.includes("AbortController"));
assert("care card export avoids inline image handlers", !care.includes("onerror=") && !care.includes("onload="));

assert("daily print report escapes title and baby name", print.includes("htmlEscape(_reportName)") && print.includes("htmlEscape(fmtLong(selDay))"));
assert("daily print report escapes entry time and amount cells", print.includes("htmlEscape(fmt12(e.time))") && print.includes("htmlEscape(fmtVol(e.amount,FU))"));
assert("daily print native overlay is not shown in browser windows", print.includes("const closeBar2=isOverlay?"));

assert("weekly PDF escapes title, period, age, stats, wins and footer", weekly.includes("const _titleHtml = htmlEscape(_title)") && weekly.includes("htmlEscape(digest.period)") && weekly.includes("htmlEscape(digest.ageStr)") && weekly.includes("htmlEscape(w)") && weekly.includes("htmlEscape(_guidanceFooter())"));
assert("weekly PDF uses safe file names", weekly.includes("safeFileStem(digest.name||\"Baby\") + \"-Weekly.pdf\""));

assert("health report HTML escapes every section before sharing", health.includes("_reportBodyHtml") && health.includes("htmlEscape(title)") && health.includes("htmlEscape(body)") && health.includes("htmlEscape(_text)"));
assert("health report uses safe file names", health.includes("safeFileStem(report.name) + \"-Report.pdf\"") && health.includes("safeFileStem(report.name) + \"-Report.html\""));
assert("HTML exports do not rely on partial less-than-only escaping", !app.includes("replace(/</g"));
assert("object URL export fallbacks are revoked", (app.match(/URL\.createObjectURL/g) || []).length === (app.match(/URL\.revokeObjectURL/g) || []).length);

console.log("Export HTML safety audit passed.");
