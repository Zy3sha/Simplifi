// ── Global error handler ──
window.onerror = function(msg, src, line, col, err) {
  document.getElementById('root').innerHTML = '<div style="padding:30px;font-family:monospace;font-size:13px;background:#fff;color:#333;word-break:break-all"><b>Error:</b> ' + msg + '<br><b>Line:</b> ' + line + '<br><b>Detail:</b> ' + (err&&err.stack?err.stack:'') + '</div>';
};

// ── Load and compile JSX from external file ──
(function() {
  function compile(src) {
    try {
      if (typeof Babel === 'undefined') throw new Error('Babel not loaded');
      if (typeof React === 'undefined') throw new Error('React not loaded');
      var result = Babel.transform(src, { presets: ['react'] });
      var blob = new Blob([result.code], { type: 'application/javascript' });
      var url = URL.createObjectURL(blob);
      var s = document.createElement('script');
      s.src = url;
      s.onload = function() { URL.revokeObjectURL(url); };
      s.onerror = function(e) { console.error('JSX load error', e); };
      document.body.appendChild(s);
    } catch(e) {
      document.getElementById('root').innerHTML = '<div style="padding:30px;font-family:monospace;font-size:13px;background:#fff;color:#333;word-break:break-all"><b>Loader error:</b> ' + e.message + '<br>' + e.stack + '</div>';
    }
  }

  fetch('app.jsx')
    .then(function(r) {
      if (!r.ok) throw new Error('Failed to load app.jsx: ' + r.status);
      return r.text();
    })
    .then(compile)
    .catch(function(err) {
      var embedded = document.getElementById('jsx-src');
      if (embedded) {
        compile(embedded.textContent);
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:30px;font-family:monospace;font-size:13px;background:#fff;color:#333;word-break:break-all"><b>Load error:</b> ' + err.message + '</div>';
      }
    });
})();

// ══════════════════════════════════════════════════════════
// AUTO-GLASS — Optimized: tracks processed elements,
// skips re-scanning on theme change, uses requestAnimationFrame
// ══════════════════════════════════════════════════════════
(function(){
  var processed = new WeakSet();

  function classifyElement(d) {
    if (processed.has(d)) return;
    var s = d.style;
    var br = parseInt(s.borderRadius) || 0;
    var bg = s.background || '';
    var bdFilter = s.backdropFilter || s.webkitBackdropFilter || '';
    var border = s.borderLeft || '';
    var hasBg = bg.indexOf('var(--card-bg') >= 0 || bg.indexOf('var(--chip-bg') >= 0;
    var hasBlur = bdFilter.indexOf('blur') >= 0;

    // LARGE CARDS (borderRadius >= 16 + card-bg variable)
    if (br >= 16 && hasBg) {
      d.classList.add('glass-card');
      processed.add(d);
      return;
    }

    // CARDS with inline backdrop-filter
    if (br >= 12 && hasBlur && bg) {
      d.classList.add('glass-card');
      processed.add(d);
      return;
    }

    // LOG ENTRY ROWS — borderLeft + borderRadius 8-18
    if (br >= 8 && br <= 18 && border && bg) {
      d.classList.add('glass-entry');
      processed.add(d);
      return;
    }

    // SMALLER ROUNDED ELEMENTS with card-bg
    if (br >= 10 && br < 16 && hasBg) {
      d.classList.add('glass-entry');
      processed.add(d);
      return;
    }
  }

  function applyGlass() {
    var root = document.getElementById('root');
    if (!root) return;
    var divs = root.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
      classifyElement(divs[i]);
    }
  }

  var pending = false;
  function scheduleGlass() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function() {
      applyGlass();
      pending = false;
    });
  }

  var obs = new MutationObserver(function(mutations) {
    // Only process if actual DOM nodes were added (not just attribute/class changes)
    var hasNewNodes = false;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        hasNewNodes = true;
        break;
      }
    }
    if (hasNewNodes) scheduleGlass();
  });

  function init() {
    var root = document.getElementById('root');
    if (root) {
      // Only watch for childList changes, NOT attributes
      obs.observe(root, { childList: true, subtree: true });
      // Initial passes
      setTimeout(applyGlass, 200);
      setTimeout(applyGlass, 600);
    } else {
      setTimeout(init, 150);
    }
  }
  init();
})();

// ── Gender class on body ──
(function(){
  try{
    var sex=localStorage.getItem("sex_v1");
    if(!sex){
      var childrenRaw=localStorage.getItem("children_v1");
      var activeId=localStorage.getItem("active_child");
      if(childrenRaw){
        var children=JSON.parse(childrenRaw);
        var child=activeId?children[activeId]:Object.values(children)[0];
        if(child) sex=child.sex||"";
      }
    }
    if(sex==="girl")document.body.classList.add("girl");
    else if(sex==="boy")document.body.classList.add("boy");
  }catch(e){}
})();

// ── Remove any previously installed service workers ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    regs.forEach(function(reg) { reg.unregister(); });
  });
}
