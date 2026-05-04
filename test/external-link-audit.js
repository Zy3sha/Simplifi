#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.jsx"), "utf8");
const care = fs.readFileSync(path.join(root, "care.html"), "utf8");

function assert(name, condition) {
  if (!condition) throw new Error(name);
  console.log("✓ " + name);
}

function blankAnchorsWithoutRel(source) {
  return (source.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []).filter(tag => {
    const rel = (tag.match(/\brel="([^"]*)"/) || [])[1] || "";
    return !/\bnoopener\b/.test(rel) || !/\bnoreferrer\b/.test(rel);
  });
}

function unsafeWindowOpenLines(source) {
  return source.split(/\r?\n/).filter(line =>
    line.includes("window.open(") &&
    !line.includes('"noopener,noreferrer"')
  );
}

assert("app external blank anchors use noopener noreferrer", blankAnchorsWithoutRel(app).length === 0);
assert("carer portal has no unsafe blank anchors", blankAnchorsWithoutRel(care).length === 0);
assert("app external window.open calls use noopener noreferrer", unsafeWindowOpenLines(app).length === 0);
assert("Google Calendar fallback opens without an opener", app.includes('window.open(googleCalendarUrl(eventData), window.Capacitor?.isNativePlatform?.() ? "_system" : "_blank", "noopener,noreferrer")'));
assert("official health links open without an opener on web", app.includes('window.open(url, window._isNative ? "_system" : "_blank", "noopener,noreferrer")'));
assert("maps and call links open without an opener", app.includes('window.open("https://www.google.com/maps/dir/?api=1&destination="+encoded,"_system","noopener,noreferrer")') && app.includes('window.open("https://maps.apple.com/?daddr="+encoded,"_system","noopener,noreferrer")') && app.includes('window.open(_href,"_system","noopener,noreferrer")') && app.includes("safeTelHref(b.dial)"));
assert("print/export blank windows request noopener before document writes", app.includes('window.open("","_blank","noopener,noreferrer")') && app.includes('const w = window.open("", "_blank", "noopener,noreferrer");') && app.includes('if(_w)try{_w.opener=null;}catch{}return _w;') && app.includes('if (w) { try { w.opener = null; } catch {} w.document.write(_html);'));

console.log("External link audit passed.");
