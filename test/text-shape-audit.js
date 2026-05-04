const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const careFiles = ["care.html", "hosting-care/care.html", "hosting-care/index.html"];

let failed = false;
function assert(name, condition) {
  if (condition) {
    console.log("✓ " + name);
  } else {
    failed = true;
    console.error("✗ " + name);
  }
}

careFiles.forEach((file) => {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert(`${file} string-coerces prediction labels before matching`, html.includes('String(_pred0.nextPredictionLabel || "").toLowerCase().includes("bed")') && html.includes('const _predLabel = String(_pred.nextPredictionLabel || "Next")'));
  assert(`${file} string-coerces pinned note text before matching`, html.includes('const text=String((n&&n.text)||"").toLowerCase()'));
  assert(`${file} string-coerces medicine names before matching`, html.includes('var _medNameLower = String(m.name||"").toLowerCase();'));
});

const appWithoutCoercedFood = app.replace(/String\(w\.food\|\|""\)\.toLowerCase\(\)/g, "");
assert("app avoids raw (w.food||\"\").toLowerCase()", !appWithoutCoercedFood.includes('(w.food||"").toLowerCase()'));

[
  "e.note.toLowerCase()",
  "f.note.toLowerCase()",
  "m.name.toLowerCase()",
  "s.name.toLowerCase()",
  "r.title.toLowerCase()"
].forEach((frag) => {
  assert(`app avoids raw ${frag}`, !app.includes(frag));
});

assert("main app string-coerces weaning names", app.includes('return String(name || "").toLowerCase()'));
assert("main app string-coerces medicine dedupe names", app.includes('String(s.name||"").toLowerCase()===String(entry.name||"").toLowerCase()'));
assert("main app string-coerces note matching", app.includes('String(e.note || "").toLowerCase()') && app.includes('String(f.note||"").toLowerCase().includes("dream")'));
assert("main app string-coerces weaning stat foods", app.includes('String(w.food||"").toLowerCase().trim()') && app.includes('String(w.food||"").toLowerCase()).filter(Boolean)'));

if (failed) process.exit(1);
