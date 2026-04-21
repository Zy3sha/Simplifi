// Insights page — stat grid + sleep-consultant card with the 'prio glow' cycle.
function InsightsScreen({ dark = false }) {
  const stats = [
    { label: "FEEDS", value: "6", unit: "today", color: "#C07088" },
    { label: "SLEEP", value: "12h 20m", unit: "last 24h", color: dark ? "#e0b86a" : "#6FA898" },
    { label: "NAPPIES", value: "5", unit: "today", color: "#7AABC4" },
    { label: "AWAKE", value: "1h 24m", unit: "this stretch", color: "#D4A855" },
  ];
  return (
    <div style={{ padding: "18px 16px 120px", display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90", marginBottom: 4 }}>
          Insights
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 28, color: dark ? "#F0F2F5" : "#4A3B35" }}>
          The shape of today
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              padding: "14px 14px",
              borderRadius: 16,
              textAlign: "center",
              background: dark ? "rgba(18,30,52,0.55)" : "rgba(255,255,255,0.55)",
              border: dark ? "1.5px solid rgba(255,190,90,0.22)" : "1.5px solid rgba(255,225,235,0.45)",
              boxShadow: dark
                ? "-4px -4px 5px -5px rgba(255,170,60,0.38),4px 4px 5px -5px rgba(255,150,40,0.28)"
                : "-4px -4px 5px -5px rgba(217,168,192,0.42),4px 4px 5px -5px rgba(192,160,220,0.32)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: dark ? "#B0BEC9" : "#A89A90" }}>{s.label}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 26, color: s.color, lineHeight: 1.1, margin: "2px 0" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: dark ? "#B0BEC9" : "#7A6B6B" }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Sleep consultant card */}
      <GlassCard dark={dark} style={{ borderWidth: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <img src="../../assets/obubba-thinking.png" alt="" style={{ width: 48, height: 48 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90" }}>WHAT I'M NOTICING</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: dark ? "#F0F2F5" : "#4A3B35" }}>A longer-than-usual awake window.</div>
          </div>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: dark ? "#B0BEC9" : "#5B4F4F" }}>
          Oliver's been up 1h 24m — his last 5 days he's settled best after 1h 40m. If he starts rubbing eyes or getting hand-fussy, that's your window. <span style={{ color: "#C07088", fontWeight: 600 }}>Always follow sleepy cues over the clock.</span>
        </div>
      </GlassCard>

      {/* Feed timing strip */}
      <GlassCard dark={dark}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90", marginBottom: 10 }}>FEED INTERVALS · TODAY</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
          {[2.5, 3.2, 2.8, 3.5, 2.9, 3.1].map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: "100%",
                  height: `${(h / 4) * 100}%`,
                  borderRadius: 6,
                  background: `linear-gradient(180deg,#C07088 0%,rgba(192,112,136,0.4) 100%)`,
                }}
              />
              <div style={{ fontSize: 9, color: dark ? "#B0BEC9" : "#A89A90", fontFamily: "ui-monospace,Menlo,monospace" }}>{h}h</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

window.InsightsScreen = InsightsScreen;
