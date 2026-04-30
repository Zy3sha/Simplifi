#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const outRoot = path.join(process.env.HOME, "Desktop", "OBubba-store-screenshots-2026-04-30");
const appleDir = path.join(outRoot, "apple-iphone-6-9-1284x2778");
const playDir = path.join(outRoot, "google-play-phone-1080x1920");
const htmlDir = path.join(outRoot, "_html");
for (const d of [outRoot, appleDir, playDir, htmlDir]) fs.mkdirSync(d, { recursive: true });

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const asset = name => "file://" + path.join(root, "public", name).replace(/ /g, "%20");

const slides = [
  {
    id: "01-today",
    title: "Understand your baby's day",
    subtitle: "Feed, sleep, nappy, wake windows and gentle context in one calm place.",
    mood: "day",
    mascot: "obubba-happy.png",
    screen: `
      <div class="phone-screen">
        <div class="topbar"><span>OBubba</span><b>Today</b></div>
        <section class="hero-card cyan">
          <div class="eyebrow">Next likely need</div>
          <h3>Nap around 10:42</h3>
          <p>Oliver has been awake 1h 48m. Last nap was short, so OBubba may bring the next window forward.</p>
          <div class="chips"><span>Confidence: medium</span><span>Based on 5 days</span></div>
        </section>
        <div class="quick-grid">
          <button>Milk</button><button>Nappy</button><button>Nap</button><button>Wake</button>
        </div>
        <section class="mini-list">
          <div><b>Last feed</b><span>7:31am · 180ml</span></div>
          <div><b>Last nappy</b><span>8:05am · wet</span></div>
          <div><b>Day mode</b><span>Home · calm rhythm</span></div>
        </section>
      </div>`
  },
  {
    id: "02-voice",
    title: "Voice-log the whole day",
    subtitle: "Catch up in seconds: say the day once, review the events, then save.",
    mood: "violet",
    mascot: "obubba-thinking.png",
    screen: `
      <div class="phone-screen">
        <div class="sheet">
          <div class="mic">🎤</div>
          <h3>Voice log</h3>
          <p>"7am woke, 7:30 bottle 180ml, nap 9 to 10, paste-like nappy, bedtime 7pm."</p>
          <div class="review-list">
            <div><span>☀️</span><b>Wake 7:00am</b></div>
            <div><span>🍼</span><b>Bottle 7:30am · 180ml</b></div>
            <div><span>😴</span><b>Nap 9:00am-10:00am</b></div>
            <div><span>💧</span><b>Nappy · Paste-like</b></div>
            <div><span>🌙</span><b>Bedtime 7:00pm</b></div>
          </div>
          <button class="primary">Log 5 events</button>
        </div>
      </div>`
  },
  {
    id: "03-sleep",
    title: "Sleep guidance that learns",
    subtitle: "Wake windows, short-nap context and bedtime suggestions based on your baby's pattern.",
    mood: "night",
    mascot: "obubba-loading.png",
    screen: `
      <div class="phone-screen night-screen">
        <div class="topbar"><span>Understand</span><b>Sleep</b></div>
        <section class="hero-card navy">
          <div class="eyebrow">Tonight's suggested bedtime</div>
          <h3>6:48pm</h3>
          <p>Today may be running slightly overtired after two short naps. A calmer, earlier wind-down may help.</p>
          <div class="sleep-rings"><i></i><i></i><i></i></div>
        </section>
        <section class="timeline">
          <div><b>Wake</b><span>6:54am</span></div>
          <div><b>Nap 1</b><span>9:10-10:00</span></div>
          <div><b>Bridge nap</b><span>4:20pm · optional</span></div>
        </section>
      </div>`
  },
  {
    id: "04-plan",
    title: "Plan tomorrow gently",
    subtitle: "Slot food, care, naps and reminders around the predicted rhythm.",
    mood: "sun",
    mascot: "obubba-happy.png",
    screen: `
      <div class="phone-screen">
        <div class="topbar"><span>Today</span><b>Plan Tomorrow</b></div>
        <section class="hero-card amber">
          <div class="eyebrow">Predicted rhythm</div>
          <h3>Wake · Nap · Milk · Food</h3>
          <p>Use OBubba's rhythm as a guide, then move the plan if real life happens.</p>
        </section>
        <section class="plan-list">
          <div><em>7:00</em><b>Expected wake</b><span>adjusts when logged</span></div>
          <div><em>After Nap 1</em><b>Egg & avocado trial</b><span>small taste first</span></div>
          <div><em>4:30</em><b>Pack daycare bag</b><span>reminder on</span></div>
          <div><em>Before bed</em><b>Bath</b><span>wind-down cue</span></div>
        </section>
      </div>`
  },
  {
    id: "05-weaning",
    title: "Weaning without the worry spiral",
    subtitle: "Track first tastes, allergens, reactions and what to try next with safer wording.",
    mood: "mint",
    mascot: "obubba-celebration.png",
    screen: `
      <div class="phone-screen">
        <div class="topbar"><span>Grow</span><b>Weaning</b></div>
        <section class="hero-card mint">
          <div class="eyebrow">Today's weaning plan</div>
          <h3>Peanut butter on toast</h3>
          <p>Morning only. Tiny taste first. Keep milk as the main drink before 1.</p>
          <div class="chips"><span>Allergen</span><span>Observation timer</span><span>Already tolerated: egg</span></div>
        </section>
        <section class="food-grid">
          <div>🥕 Carrot</div><div>🥚 Egg</div><div>🥜 Peanut</div><div>🥛 Dairy</div>
        </section>
      </div>`
  },
  {
    id: "06-bubbacare",
    title: "Handovers that actually help",
    subtitle: "BubbaCare keeps partners, grandparents and carers on the same page.",
    mood: "blush",
    mascot: "obubba-thinking.png",
    screen: `
      <div class="phone-screen">
        <div class="topbar"><span>Account</span><b>BubbaCare</b></div>
        <section class="hero-card blush">
          <div class="eyebrow">While you were away</div>
          <h3>2 feeds · 1 nap · 1 nappy</h3>
          <p>Oliver woke happy after Nap 2. Egg trial moved to tomorrow.</p>
        </section>
        <section class="handover">
          <div><b>Comfort routine</b><span>Dummy, white noise, left-side cuddle</span></div>
          <div><b>Care code</b><span>Share with trusted carers</span></div>
          <div><b>Review logs</b><span>Accept before merging</span></div>
        </section>
      </div>`
  },
  {
    id: "07-widgets",
    title: "Timers where parents need them",
    subtitle: "Widgets, Lock Screen and Dynamic Island show active timers or next-event countdowns.",
    mood: "night",
    mascot: "obubba-loading.png",
    screen: `
      <div class="phone-screen night-screen">
        <div class="lock-widget">
          <span>OBubba</span>
          <h3>Nap timer</h3>
          <strong>01:24:18</strong>
          <p>Oliver is asleep</p>
        </div>
        <div class="island">
          <span>Next nap</span><b>in 42m</b>
        </div>
        <section class="mini-list dark">
          <div><b>Active timers</b><span>free</span></div>
          <div><b>Next-event countdowns</b><span>Premium / trial</span></div>
        </section>
      </div>`
  },
  {
    id: "08-reports",
    title: "Useful reports, not data dumps",
    subtitle: "Daily rhythm, feeding, sleep, growth and weaning summaries ready to share.",
    mood: "cyan",
    mascot: "obubba-celebration.png",
    screen: `
      <div class="phone-screen">
        <div class="topbar"><span>Understand</span><b>Reports</b></div>
        <section class="hero-card cyan">
          <div class="eyebrow">Health visitor summary</div>
          <h3>Last 7 days</h3>
          <p>Sleep rhythm, feeds, nappies, growth notes, allergens tried and parent concerns in one calm report.</p>
        </section>
        <section class="report-bars">
          <div><span style="width:78%"></span><b>Sleep rhythm</b></div>
          <div><span style="width:64%"></span><b>Feeds</b></div>
          <div><span style="width:92%"></span><b>Nappies</b></div>
          <div><span style="width:58%"></span><b>Weaning</b></div>
        </section>
      </div>`
  }
];

function css(w, h, scale) {
  const phoneW = Math.round(w * 0.72);
  const phoneH = Math.round(h * 0.58);
  return `
    *{box-sizing:border-box}
    html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#1f2837}
    body{background:#eff8fb}
    .shot{position:relative;width:${w}px;height:${h}px;padding:${Math.round(76*scale)}px ${Math.round(70*scale)}px ${Math.round(120*scale)}px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow:hidden;background:
      radial-gradient(circle at 12% 8%,rgba(255,214,176,.78),transparent 29%),
      radial-gradient(circle at 92% 14%,rgba(128,209,221,.55),transparent 30%),
      linear-gradient(160deg,#fff8f2 0%,#f1fbff 52%,#fff1f7 100%)}
    .shot.night{background:
      radial-gradient(circle at 50% 88%,rgba(233,125,55,.38),transparent 34%),
      radial-gradient(circle at 12% 18%,rgba(83,96,164,.50),transparent 32%),
      linear-gradient(160deg,#07172c 0%,#0d2444 55%,#301d34 100%);color:#fff4e6}
    .shot:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.42),rgba(255,255,255,0) 38%,rgba(255,255,255,.24));pointer-events:none}
    .brand{position:relative;z-index:2;align-self:stretch;display:flex;align-items:center;justify-content:space-between}
    .brand-left{display:flex;align-items:center;gap:${Math.round(18*scale)}px;font-weight:850;letter-spacing:-.02em;font-size:${Math.round(34*scale)}px;color:#733c56}
    .night .brand-left{color:#fff0e2}
    .brand img{width:${Math.round(70*scale)}px;height:${Math.round(70*scale)}px;border-radius:24%;box-shadow:0 16px 35px rgba(70,51,58,.16)}
    .badge{padding:${Math.round(12*scale)}px ${Math.round(18*scale)}px;border-radius:999px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.76);font-weight:750;font-size:${Math.round(20*scale)}px;color:#8c5b6f;box-shadow:0 10px 30px rgba(80,55,70,.10)}
    .night .badge{background:rgba(12,28,52,.72);border-color:rgba(255,188,118,.32);color:#ffd9aa}
    .copy{position:relative;z-index:2;text-align:center;margin:${Math.round(22*scale)}px 0 ${Math.round(26*scale)}px}
    .copy h1{font-size:${Math.round(82*scale)}px;line-height:.96;letter-spacing:-.055em;margin:0 auto ${Math.round(22*scale)}px;max-width:${Math.round(w*.88)}px;color:#173050}
    .night .copy h1{color:#fff3e5;text-shadow:0 6px 24px rgba(0,0,0,.2)}
    .copy p{font-size:${Math.round(31*scale)}px;line-height:1.28;margin:0 auto;color:#5e6472;max-width:${Math.round(w*.82)}px;font-weight:620}
    .night .copy p{color:#e8d5c6}
    .stage{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:${Math.round(26*scale)}px;width:100%;min-height:${Math.round(phoneH+26*scale)}px;margin-top:${Math.round(8*scale)}px}
    .phone{width:${phoneW}px;height:${phoneH}px;border-radius:${Math.round(70*scale)}px;padding:${Math.round(22*scale)}px;background:linear-gradient(145deg,rgba(255,255,255,.80),rgba(255,255,255,.28));border:1px solid rgba(255,255,255,.86);box-shadow:0 44px 90px rgba(47,61,80,.26),inset 0 1px rgba(255,255,255,.94)}
    .night .phone{background:linear-gradient(145deg,rgba(255,180,111,.20),rgba(5,18,38,.72));border-color:rgba(255,180,111,.32);box-shadow:0 54px 100px rgba(0,0,0,.42),0 0 64px rgba(237,124,47,.22)}
    .phone-screen{height:100%;border-radius:${Math.round(48*scale)}px;padding:${Math.round(34*scale)}px;background:linear-gradient(160deg,#fffaf6,#effaff 58%,#fff0f7);overflow:hidden;border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px rgba(255,255,255,.98);display:flex;flex-direction:column;gap:${Math.round(20*scale)}px}
    .night-screen{background:radial-gradient(circle at 50% 96%,rgba(236,125,51,.24),transparent 30%),linear-gradient(160deg,#091a31,#102949 60%,#161b37);border-color:rgba(255,184,102,.25)}
    .mascot{position:absolute;right:${Math.round(38*scale)}px;bottom:${Math.round(42*scale)}px;width:${Math.round(138*scale)}px;height:${Math.round(138*scale)}px;border-radius:35%;object-fit:cover;filter:drop-shadow(0 18px 28px rgba(90,60,70,.24))}
    .topbar{display:flex;align-items:center;justify-content:space-between;font-size:${Math.round(22*scale)}px;color:#85677a;font-weight:750}
    .topbar b{padding:${Math.round(10*scale)}px ${Math.round(18*scale)}px;border-radius:999px;background:rgba(255,255,255,.72);box-shadow:0 10px 24px rgba(95,66,82,.10);color:#193451}
    .hero-card,.sheet,.mini-list,.plan-list,.handover,.food-grid,.timeline,.report-bars,.lock-widget{border-radius:${Math.round(30*scale)}px;border:1px solid rgba(255,255,255,.72);background:rgba(255,255,255,.68);box-shadow:0 18px 46px rgba(61,74,92,.14),inset 0 1px rgba(255,255,255,.9);padding:${Math.round(28*scale)}px}
    .hero-card h3,.sheet h3,.lock-widget h3{margin:${Math.round(8*scale)}px 0 ${Math.round(10*scale)}px;font-size:${Math.round(44*scale)}px;line-height:1.03;color:#173050;letter-spacing:-.03em}
    .hero-card p,.sheet p,.lock-widget p{margin:0;color:#53616f;font-size:${Math.round(22*scale)}px;line-height:1.38;font-weight:580}
    .eyebrow{font-size:${Math.round(17*scale)}px;text-transform:uppercase;letter-spacing:.12em;color:#9a6478;font-weight:850}
    .cyan{background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(206,244,250,.68))}
    .amber{background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(255,226,164,.70))}
    .mint{background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(211,244,224,.74))}
    .blush{background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,218,231,.74))}
    .navy{background:linear-gradient(145deg,rgba(13,34,61,.94),rgba(20,39,72,.78));border-color:rgba(255,190,117,.28);box-shadow:0 22px 55px rgba(0,0,0,.22),0 0 32px rgba(230,126,55,.14)}
    .navy h3,.navy p,.night-screen .topbar,.night-screen .topbar b{color:#fff3e6}
    .navy .eyebrow{color:#ffd09b}
    .chips{display:flex;flex-wrap:wrap;gap:${Math.round(10*scale)}px;margin-top:${Math.round(18*scale)}px}
    .chips span{font-size:${Math.round(18*scale)}px;font-weight:760;color:#24415e;background:rgba(255,255,255,.64);border:1px solid rgba(255,255,255,.72);padding:${Math.round(9*scale)}px ${Math.round(13*scale)}px;border-radius:999px}
    .quick-grid,.food-grid{display:grid;grid-template-columns:1fr 1fr;gap:${Math.round(14*scale)}px}
    .quick-grid button,.food-grid div,.primary{border:0;border-radius:${Math.round(22*scale)}px;background:linear-gradient(145deg,#193a5c,#265f87);color:white;font-size:${Math.round(22*scale)}px;font-weight:820;padding:${Math.round(18*scale)}px;box-shadow:0 14px 28px rgba(31,72,105,.24)}
    .food-grid div{background:rgba(255,255,255,.66);color:#21415b;border:1px solid rgba(255,255,255,.8)}
    .mini-list,.timeline,.plan-list,.handover,.report-bars{display:flex;flex-direction:column;gap:${Math.round(12*scale)}px}
    .mini-list div,.timeline div,.plan-list div,.handover div{display:flex;justify-content:space-between;gap:${Math.round(16*scale)}px;align-items:center;padding:${Math.round(16*scale)}px;border-radius:${Math.round(20*scale)}px;background:rgba(255,255,255,.58)}
    .mini-list b,.timeline b,.plan-list b,.handover b{font-size:${Math.round(21*scale)}px;color:#1f3854}
    .mini-list span,.timeline span,.plan-list span,.handover span{font-size:${Math.round(18*scale)}px;color:#667083;text-align:right;font-weight:650}
    .plan-list em{font-style:normal;font-weight:850;color:#a2692e;font-size:${Math.round(18*scale)}px;min-width:${Math.round(112*scale)}px}
    .sheet{text-align:center;background:linear-gradient(160deg,rgba(255,255,255,.86),rgba(238,231,255,.74))}
    .mic{font-size:${Math.round(44*scale)}px}
    .review-list{margin:${Math.round(20*scale)}px 0;display:flex;flex-direction:column;gap:${Math.round(10*scale)}px}
    .review-list div{display:flex;align-items:center;gap:${Math.round(10*scale)}px;background:rgba(255,255,255,.64);padding:${Math.round(14*scale)}px;border-radius:${Math.round(18*scale)}px;text-align:left}
    .review-list b{font-size:${Math.round(19*scale)}px;color:#293955}
    .sleep-rings{display:flex;gap:${Math.round(10*scale)}px;margin-top:${Math.round(22*scale)}px}.sleep-rings i{height:${Math.round(10*scale)}px;flex:1;border-radius:999px;background:#ffd09b}
    .lock-widget{margin-top:${Math.round(80*scale)}px;background:rgba(8,23,44,.74);border-color:rgba(255,194,128,.32);text-align:center;color:#fff1df}
    .lock-widget span{color:#ffd0a0;font-weight:850}.lock-widget strong{display:block;font-size:${Math.round(64*scale)}px;letter-spacing:-.04em;margin:${Math.round(8*scale)}px 0}.lock-widget h3,.lock-widget p{color:#fff1df}
    .island{align-self:center;margin-top:${Math.round(14*scale)}px;border-radius:999px;padding:${Math.round(16*scale)}px ${Math.round(24*scale)}px;background:#06101d;color:#fff;display:flex;gap:${Math.round(18*scale)}px;font-weight:850;box-shadow:0 20px 40px rgba(0,0,0,.32)}
    .dark{background:rgba(9,25,47,.76);border-color:rgba(255,190,117,.24)}.dark div{background:rgba(255,255,255,.06)}.dark b,.dark span{color:#fff1df}
    .report-bars div{position:relative;height:${Math.round(58*scale)}px;background:rgba(255,255,255,.62);border-radius:${Math.round(18*scale)}px;overflow:hidden;padding:${Math.round(18*scale)}px}.report-bars span{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#a7e1eb,#f5c4d2);opacity:.55}.report-bars b{position:relative;font-size:${Math.round(19*scale)}px;color:#213a55}
    .footer{position:absolute;left:${Math.round(70*scale)}px;right:${Math.round(70*scale)}px;bottom:${Math.round(38*scale)}px;z-index:2;text-align:center;font-size:${Math.round(20*scale)}px;color:#7b6372;font-weight:700}.night .footer{color:#f2d5bc}
  `;
}

function htmlFor(slide, w, h) {
  const scale = w / 1284;
  const isNight = slide.mood === "night";
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(w,h,scale)}</style></head><body>
    <main class="shot ${isNight ? "night" : ""}">
      <div class="brand"><div class="brand-left"><img src="${asset("icon.png")}">OBubba</div><div class="badge">Smart baby tracker</div></div>
      <div class="copy"><h1>${slide.title}</h1><p>${slide.subtitle}</p></div>
      <div class="stage"><div class="phone">${slide.screen}</div><img class="mascot" src="${asset(slide.mascot)}"></div>
      <div class="footer">A hug from a parent who knows what it's like.</div>
    </main>
  </body></html>`;
}

function renderSet(dir, w, h) {
  slides.forEach((slide, idx) => {
    const file = path.join(htmlDir, `${w}x${h}-${slide.id}.html`);
    const png = path.join(dir, `${String(idx + 1).padStart(2, "0")}-${slide.id}.png`);
    fs.writeFileSync(file, htmlFor(slide, w, h));
    execFileSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      `--window-size=${w},${h}`,
      "--force-device-scale-factor=1",
      "--virtual-time-budget=1000",
      `--screenshot=${png}`,
      "file://" + file
    ], { stdio: "ignore" });
  });
}

function renderFeatureGraphic() {
  const w = 1024, h = 500;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
    body{background:radial-gradient(circle at 8% 10%,#ffd7b7,transparent 32%),radial-gradient(circle at 88% 12%,#b8edf4,transparent 34%),linear-gradient(135deg,#fff7ef,#effbff 58%,#fff0f6);color:#173050}
    .wrap{position:relative;width:100%;height:100%;padding:54px 58px;display:flex;align-items:center;justify-content:space-between}
    h1{font-size:64px;line-height:.96;letter-spacing:-.055em;margin:0 0 18px;max-width:560px}
    p{font-size:24px;line-height:1.25;font-weight:650;color:#5c6472;margin:0;max-width:520px}
    .brand{display:flex;align-items:center;gap:16px;font-size:26px;font-weight:850;color:#7b3f5b;margin-bottom:22px}.brand img{width:62px;height:62px;border-radius:20px}
    .phone{width:285px;height:390px;border-radius:44px;padding:14px;background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.88);box-shadow:0 38px 70px rgba(42,70,94,.23);transform:rotate(4deg)}
    .screen{height:100%;border-radius:32px;padding:20px;background:linear-gradient(160deg,#fffaf6,#effaff,#fff0f7)}
    .card{border-radius:22px;background:rgba(255,255,255,.72);padding:18px;margin-bottom:14px;box-shadow:0 12px 28px rgba(50,80,110,.12)}
    .eyebrow{font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:#a16275;font-weight:850}.card b{display:block;font-size:26px;margin:6px 0;color:#173050}.card span{font-size:14px;color:#5c6472;font-weight:650}
    .mascot{position:absolute;right:306px;bottom:30px;width:112px;border-radius:30px;filter:drop-shadow(0 18px 28px rgba(90,60,70,.25))}
  </style></head><body><div class="wrap">
    <section><div class="brand"><img src="${asset("icon.png")}">OBubba</div><h1>Don't just log data. Understand your baby.</h1><p>Sleep, feeds, weaning, widgets, BubbaCare and gentle insights for real parent life.</p></section>
    <img class="mascot" src="${asset("obubba-happy.png")}">
    <div class="phone"><div class="screen"><div class="card"><div class="eyebrow">Next likely need</div><b>Nap around 10:42</b><span>Based on Oliver's recent rhythm</span></div><div class="card"><div class="eyebrow">Voice log</div><b>5 events ready</b><span>Review, then save</span></div><div class="card"><div class="eyebrow">Plan tomorrow</div><b>Food after Nap 1</b><span>Gentle reminders</span></div></div></div>
  </div></body></html>`;
  const file = path.join(htmlDir, "feature-graphic.html");
  const png = path.join(outRoot, "google-play-feature-graphic-1024x500.png");
  fs.writeFileSync(file, html);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    `--window-size=${w},${h}`,
    "--force-device-scale-factor=1",
    "--virtual-time-budget=1000",
    `--screenshot=${png}`,
    "file://" + file
  ], { stdio: "ignore" });
}

renderSet(appleDir, 1284, 2778);
renderSet(playDir, 1080, 1920);
renderFeatureGraphic();
console.log(outRoot);
