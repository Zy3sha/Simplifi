const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function assert(name, condition) {
  if (!condition) {
    console.error("✗ " + name);
    process.exitCode = 1;
    return;
  }
  console.log("✓ " + name);
}

const app = read("app.jsx");
const careFiles = ["care.html", "hosting-care/care.html", "hosting-care/index.html"];

assert("main app exposes a shared phone dial sanitizer",
  app.includes("function safeDialNumber(value, fallback = \"\")") &&
  app.includes("function safeTelHref(value, fallback = \"\")")
);

const helperBlock = app.match(/function safeDialNumber[\s\S]*?function safeTelHref[\s\S]*?\n}/);
assert("phone sanitizer helper is extractable", !!helperBlock);
if (helperBlock) {
  const helpers = new Function(helperBlock[0] + "\nreturn { safeDialNumber, safeTelHref };")();
  assert("phone sanitizer keeps international plus numbers",
    helpers.safeTelHref("+91-9999-666-555") === "tel:+919999666555"
  );
  assert("phone sanitizer chooses a callable number from slash-delimited emergency text",
    helpers.safeTelHref("999/112") === "tel:999"
  );
  assert("phone sanitizer rejects non-phone text",
    helpers.safeTelHref("javascript:alert(1)") === ""
  );
}

const appWithoutPhoneHelper = app.replace(/function safeDialNumber[\s\S]*?function safeTelHref[\s\S]*?\n}/, "");
assert("main app no longer builds tel URLs inline",
  !/href=\{`tel:|window\.open\("tel:|"tel:"\s*\+/.test(appWithoutPhoneHelper)
);
assert("main app emergency and support links use shared sanitizer",
  app.includes("href={safeTelHref(_emergNum)}") &&
  app.includes("safeTelHref(_flags[0].link || _nonEmergencyTel || _emergNum, _emergNum)") &&
  app.includes("const _tel=safeTelHref(r.num)") &&
  app.includes("safeTelHref(l.phone)") &&
  app.includes("safeTelHref(b.dial)")
);

careFiles.forEach((file) => {
  const src = read(file);
  assert(file + " exposes shared phone sanitizer",
    src.includes("function safeDialNumber(value, fallback = \"\")") &&
    src.includes("function safeTelHref(value, fallback = \"\")")
  );
  assert(file + " uses safe tel hrefs for carer call buttons",
    src.includes('const _href = safeTelHref(c.phone);') &&
    src.includes('href="${escapeHtml(_href)}"')
  );
  assert(file + " avoids query-encoding or raw phone values in tel links",
    !/encodeURIComponent\([^)]*phone|href="tel:\$\{|window\.open\("tel:/.test(src)
  );
});

if (process.exitCode) process.exit(process.exitCode);
console.log("Phone link safety audit passed.");
