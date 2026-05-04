#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const root = path.resolve(__dirname, "..");
const files = [
  "app.jsx",
  "native-plugins.js",
  "firebase.js",
  "functions/index.js"
];

let failed = false;

function assert(name, ok) {
  if (!ok) {
    console.error("✗ " + name);
    failed = true;
  } else {
    console.log("✓ " + name);
  }
}

function parseFile(file) {
  const code = fs.readFileSync(path.join(root, file), "utf8");
  const ast = parser.parse(code, {
    sourceType: "unambiguous",
    plugins: ["jsx"],
    errorRecovery: true
  });
  return {code, ast};
}

function isJsonParse(node) {
  return node.callee
    && node.callee.type === "MemberExpression"
    && node.callee.object
    && node.callee.object.name === "JSON"
    && node.callee.property
    && node.callee.property.name === "parse";
}

function isIntentionalClone(source) {
  return /JSON\.parse\s*\(\s*JSON\.stringify/.test(source);
}

for (const file of files) {
  const {code, ast} = parseFile(file);
  const unguarded = [];
  traverse(ast, {
    CallExpression(callPath) {
      const node = callPath.node;
      if (!isJsonParse(node)) return;
      const source = code.slice(node.start, node.end);
      if (isIntentionalClone(source)) return;
      const inTry = !!callPath.findParent(parent => parent.isTryStatement());
      if (!inTry) {
        unguarded.push(`${file}:${node.loc.start.line} ${source.replace(/\s+/g, " ").slice(0, 140)}`);
      }
    }
  });
  assert(`${file} has no unguarded JSON.parse calls`, unguarded.length === 0);
  if (unguarded.length) unguarded.forEach(line => console.error("  " + line));
}

if (failed) process.exit(1);
console.log("JSON parse audit passed.");
