// Growth tab — milestones + weight/height chart placeholder.
function GrowthScreen({ dark = false }) {
  const milestones = [
    { emoji: "🎉", title: "Rolled over both ways", date: "5 days ago", hit: true },
    { emoji: "🤲", title: "Reached for a toy", date: "2 weeks ago", hit: true },
    { emoji: "😄", title: "First real giggle", date: "3 weeks ago", hit: true },
    { emoji: "🦷", title: "First tooth", date: "Coming up", hit: false },
    { emoji: "🍼", title: "Starts solids", date: "In 2 weeks", hit: false },
  ];
  return (
    <div style={{ padding: "18px 16px 120px", display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90", marginBottom: 4 }}>Growth</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 28, color: dark ? "#F0F2F5" : "#4A3B35" }}>Oliver, at 6 months</div>
      </div>

      <GlassCard dark={dark} hero>
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90" }}>Weight</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 28, color: "#C07088", lineHeight: 1.1 }}>7.8<span style={{ fontSize: 14, color: dark ? "#B0BEC9" : "#A89A90", marginLeft: 2 }}>kg</span></div>
            <div style={{ fontSize: 11, color: dark ? "#B0BEC9" : "#7A6B6B", marginTop: 2 }}>50th percentile · WHO</div>
          </div>
          <div style={{ width: 1, background: dark ? "rgba(255,190,90,0.25)" : "rgba(192,112,136,0.2)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90" }}>Height</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 28, color: dark ? "#e0b86a" : "#6FA898", lineHeight: 1.1 }}>67<span style={{ fontSize: 14, color: dark ? "#B0BEC9" : "#A89A90", marginLeft: 2 }}>cm</span></div>
            <div style={{ fontSize: 11, color: dark ? "#B0BEC9" : "#7A6B6B", marginTop: 2 }}>65th percentile</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard dark={dark}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90", marginBottom: 12 }}>MILESTONES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: m.hit ? 1 : 0.5 }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: m.hit ? "rgba(155,184,168,0.2)" : dark ? "rgba(24,38,62,0.6)" : "rgba(255,255,255,0.5)", border: m.hit ? "1.5px solid #6FA898" : dark ? "1.5px dashed rgba(255,190,90,0.3)" : "1.5px dashed rgba(192,112,136,0.3)" }}>
                {m.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#F0F2F5" : "#4A3B35", textDecoration: m.hit ? "none" : "none" }}>{m.title}</div>
                <div style={{ fontSize: 11, color: dark ? "#B0BEC9" : "#7A6B6B" }}>{m.date}</div>
              </div>
              {m.hit && <span style={{ fontSize: 16, color: "#6FA898" }}>✓</span>}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

window.GrowthScreen = GrowthScreen;
