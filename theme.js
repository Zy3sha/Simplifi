// ── Theme System: instant atomic swap ──
// Exposed globally: applyTheme, getThemePref, toggleTheme, isDark

var isDark = false;

function applyTheme(mode) {
  var body = document.body;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (mode === 'auto') {
    isDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
  } else {
    isDark = (mode === 'dark');
  }

  // Atomic swap — never remove without immediately adding
  // This prevents the "no class" flash
  if (isDark) {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
  } else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  }

  // Force synchronous layout commit — browser applies variables NOW
  void body.offsetHeight;

  if (meta) meta.content = isDark ? '#080e1c' : '#FFF6F0';

  // Update any visible toggle buttons (hidden #theme-toggle + inline header button)
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function getThemePref() {
  try { return localStorage.getItem('theme') || 'auto'; } catch (e) { return 'auto'; }
}

function toggleTheme() {
  var current = getThemePref();
  var next;
  if (current === 'auto') next = 'light';
  else if (current === 'light') next = 'dark';
  else next = 'auto';
  try { localStorage.setItem('theme', next); } catch (e) {}
  applyTheme(next);
}

window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function () {
  if (getThemePref() === 'auto') applyTheme('auto');
});

// Apply immediately on load — no flash
(function () { applyTheme(getThemePref()); })();
