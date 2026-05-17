import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appPath = path.join(root, "app.jsx");
const stylesPath = path.join(root, "styles.css");
const reportDir = path.join(root, "clean-rewrite", "reports");
const reportPath = path.join(reportDir, "ui-code-inventory.md");

const app = fs.readFileSync(appPath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");
const allSource = [
  app,
  styles,
  safeRead("care.html"),
  safeRead("public/care.html"),
  safeRead("index.html"),
].join("\n");

function safeRead(rel) {
  try {
    return fs.readFileSync(path.join(root, rel), "utf8");
  } catch {
    return "";
  }
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function matches(source, re, group = 1) {
  const out = [];
  for (const match of source.matchAll(re)) out.push(match[group]);
  return out;
}

function countBy(values) {
  const map = new Map();
  for (const value of values) map.set(value, (map.get(value) || 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const staticTestIds = uniq([
  ...matches(app, /data-testid\s*=\s*"([^"]+)"/g),
  ...matches(app, /data-testid\s*=\s*'([^']+)'/g),
]);
const cssTestIds = uniq(matches(styles, /\[data-testid=["']([^"']+)["']\]/g));
const cssOnlyTestIds = cssTestIds.filter(id => !staticTestIds.includes(id) && !app.includes(id));

const dynamicTestIdHints = uniq(matches(app, /data-testid\s*=\s*\{([^}]+)\}/g)
  .map(value => value.replace(/\s+/g, " ").trim())
  .filter(value => value.length < 90));

const tabs = uniq([
  ...matches(app, /setTab\(\s*"([^"]+)"/g),
  ...matches(app, /tab\s*={1,3}\s*"([^"]+)"/g),
]);
const daySubScreens = uniq([
  ...matches(app, /setDaySubScreen\(\s*"([^"]+)"/g),
  ...matches(app, /daySubScreen\s*={1,3}\s*"([^"]+)"/g),
  ...matches(app, /daySubScreen\.startsWith\(\s*"([^"]+)"/g).map(value => `${value}*`),
]);
const insightFilters = uniq([
  ...matches(app, /setInsightFilter\(\s*"([^"]+)"/g),
  ...matches(app, /insightFilter\s*={1,3}\s*"([^"]+)"/g),
]);

const cssClasses = uniq(matches(styles, /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g));
const classNames = uniq([
  ...matches(app, /className\s*=\s*"([^"]+)"/g).flatMap(value => value.split(/\s+/)),
  ...matches(app, /className\s*=\s*'([^']+)'/g).flatMap(value => value.split(/\s+/)),
  ...matches(app, /className\s*=\s*\{`([^`]+)`/g).flatMap(value => value.split(/\s+/)),
].map(value => value.replace(/[${}"'()+?:]/g, "").trim()).filter(value => /^[a-zA-Z_][\w-]+$/.test(value)));
const classNamesInSource = new Set(classNames);
const cssOnlyClasses = cssClasses
  .filter(name => !classNamesInSource.has(name) && !allSource.includes(name))
  .filter(name => !/^is-|^has-|^dark-mode$|^light-mode$|^boy$|^girl$/.test(name))
  .slice(0, 180);

const legacyCommentBlocks = [];
for (const match of styles.matchAll(/\/\*([\s\S]*?)\*\//g)) {
  const text = match[1].replace(/\s+/g, " ").trim();
  if (/(old|older|legacy|retired|experiment|prototype|final lock|hard stop|moved)/i.test(text)) {
    legacyCommentBlocks.push({ line: lineOf(styles, match.index), text });
  }
}

const largestFiles = fs.readdirSync(root)
  .filter(name => fs.statSync(path.join(root, name)).isFile())
  .map(name => ({ name, bytes: fs.statSync(path.join(root, name)).size }))
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 12);

function lineOf(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function table(rows, headings) {
  const header = `| ${headings.join(" | ")} |`;
  const sep = `| ${headings.map(() => "---").join(" | ")} |`;
  return [header, sep, ...rows.map(row => `| ${row.map(cell => String(cell).replace(/\|/g, "\\|")).join(" | ")} |`)].join("\n");
}

const report = [
  "# OBubba UI-Code Inventory",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "This report is deliberately conservative. Items listed as candidates still need a rendered UI check before deletion.",
  "",
  "## Canonical Route State",
  "",
  table([
    ["Tabs", tabs.join(", ") || "-"],
    ["Day subscreens", daySubScreens.join(", ") || "-"],
    ["Care insight filters", insightFilters.join(", ") || "-"],
    ["Static test ids", staticTestIds.length],
    ["Dynamic test-id expressions", dynamicTestIdHints.length],
    ["CSS classes", cssClasses.length],
  ], ["Signal", "Value"]),
  "",
  "## High-Risk Cleanup Candidates",
  "",
  "### CSS selectors for test ids not present in current app source",
  "",
  cssOnlyTestIds.length
    ? cssOnlyTestIds.map(id => `- \`${id}\``).join("\n")
    : "- None found.",
  "",
  "### CSS class selectors not found in app/care/index source",
  "",
  cssOnlyClasses.length
    ? cssOnlyClasses.map(name => `- \`.${name}\``).join("\n")
    : "- None found.",
  "",
  "### Legacy/old/final-lock style blocks to review",
  "",
  legacyCommentBlocks.slice(0, 140).map(item => `- [styles.css:${item.line}] ${item.text}`).join("\n") || "- None found.",
  "",
  "## Most Repeated Render Test Ids",
  "",
  table(countBy(matches(app, /data-testid\s*=\s*"([^"]+)"/g)).slice(0, 25), ["Test id", "Count"]),
  "",
  "## Dynamic Test-Id Expressions",
  "",
  dynamicTestIdHints.map(value => `- \`${value}\``).join("\n") || "- None found.",
  "",
  "## Largest Root Files",
  "",
  table(largestFiles.map(file => [file.name, `${Math.round(file.bytes / 1024)} KB`]), ["File", "Size"]),
  "",
].join("\n");

if (process.argv.includes("--write")) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, report);
  console.log(`Wrote ${path.relative(root, reportPath)}`);
} else {
  console.log(report);
}
