const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const loader = fs.readFileSync(path.join(root, "loader.js"), "utf8");

function assert(label, condition) {
  if (!condition) {
    console.error("✗ " + label);
    process.exit(1);
  }
  console.log("✓ " + label);
}

assert("boot error UI has a shared HTML escaping helper", loader.includes("function _obEscapeHtml(value)"));
assert("boot error UI bounds displayed error text", loader.includes("function _obSafeErrorText(value)") && loader.includes(".slice(0, 2000)"));
assert("boot error renderer escapes title and detail", loader.includes("var safeTitle = _obSafeErrorText(title || 'Still Loading?');") && loader.includes("var safeDetail = _obSafeErrorText(detail || '');"));
assert("global error handler escapes detail and line", loader.includes("var safeDetail = _obSafeErrorText(detail);") && loader.includes("var safeLine = _obSafeErrorText(line);"));
assert("legacy compile error page escapes title and detail", loader.includes("var safeTitle = _obSafeErrorText(title);") && loader.includes("var safeDetail = _obSafeErrorText(detail);"));
assert("global error handler does not assume root exists", loader.includes("if (!root) return false;"));
assert("loader no longer injects raw error detail", !loader.includes("+ detail +") && !loader.includes("+ title +") && !loader.includes("+ line +"));
assert("loader gender class tolerates malformed children cache", loader.includes('children&&typeof children==="object"&&!Array.isArray(children)') && loader.includes('Object.values(children).find(function(c){return c&&typeof c==="object"&&!Array.isArray(c);})') && loader.includes('sex=String(child.sex||"").slice(0,8);'));

console.log("Runtime safety audit passed.");
