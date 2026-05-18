const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const root = path.resolve(__dirname, "..");
const loader = fs.readFileSync(path.join(root, "loader.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const buildScript = fs.readFileSync(path.join(root, "build-pwa.sh"), "utf8");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");

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
assert("local preview clears stale service worker caches", loader.includes("var _obIsLocalDev") && loader.includes("caches.keys().then(function(names)") && loader.includes("caches.delete(n)"));
assert("service worker serves core app shell network-first", serviceWorker.includes("function networkFirst(event, cacheKey)") && serviceWorker.includes("event.request.mode === 'navigate'") && serviceWorker.includes("url.pathname === '/app.js'") && serviceWorker.includes("url.pathname === '/loader.js'") && serviceWorker.includes("fetch(event.request, { cache: 'no-store' })"));
assert("preview cache clear page is included in generated outputs", fs.existsSync(path.join(root, "__clear-preview-cache.html")) && buildScript.includes("public/__clear-preview-cache.html") && buildScript.includes("dist/__clear-preview-cache.html"));
assert("scroll guard does not swallow real control clicks", app.includes('tag === "button"') && app.includes("target.closest(\"button,a,[role='button'],input,select,textarea\")"));
const ageMemoIndex = app.indexOf("const age = React.useMemo(() => calcAge(babyDob, activeChild.dueDate)");
const firstAgeReaderIndex = app.indexOf("Letters to Your Future Self");
assert("baby age memo is initialised before age-reading effects", ageMemoIndex > -1 && firstAgeReaderIndex > -1 && ageMemoIndex < firstAgeReaderIndex);

function formatLoc(source, pos) {
  let line = 1;
  let column = 0;
  for (let i = 0; i < pos; i++) {
    if (source.charCodeAt(i) === 10) {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return `${line}:${column + 1}`;
}

function findUseBeforeInit(source, names) {
  const ast = parser.parse(source, {
    sourceType: "module",
    plugins: [
      "jsx",
      "classProperties",
      "optionalChaining",
      "nullishCoalescingOperator",
      "objectRestSpread",
      "dynamicImport",
    ],
  });
  const seenScopes = new WeakSet();
  const issues = [];
  traverse(ast, {
    Scopable(scanPath) {
      const scope = scanPath.scope;
      if (seenScopes.has(scope)) return;
      seenScopes.add(scope);
      for (const name of names) {
        const binding = scope.bindings[name];
        if (!binding || !binding.identifier || binding.identifier.start == null) continue;
        for (const ref of binding.referencePaths) {
          if (ref.node.start == null) continue;
          if (ref.node.start < binding.identifier.start) {
            issues.push(`${name} read at ${formatLoc(source, ref.node.start)} before init at ${formatLoc(source, binding.identifier.start)}`);
          }
        }
      }
    },
  });
  return issues;
}

const ageRuntimeFiles = [
  "app.jsx",
  "public/app.jsx",
  "dist/app.jsx",
  "ios/App/App/public/app.jsx",
  "android/app/src/main/assets/public/app.jsx",
].filter((rel) => fs.existsSync(path.join(root, rel)));
for (const rel of ageRuntimeFiles) {
  const source = fs.readFileSync(path.join(root, rel), "utf8");
  const issues = findUseBeforeInit(source, ["age", "ageWeeks"]);
  assert(`${rel} has no age temporal-dead-zone reads`, issues.length === 0);
}

console.log("Runtime safety audit passed.");
