// Hero card — big headline number with Playfair numerals + context line.
function HeroCard({ dark = false, babyName = "Oliver", lastFeed = "2h 14m ago", nextNap = "in ~18 min", status = "awake" }) {
  const statusCopy = {
    awake: { emoji: "👶", label: "awake", sub: "wake window 1.5–2h" },
    sleeping: { emoji: "😴", label: "sleeping", sub: "nap in progress" },
    feeding: { emoji: "🍼", label: "feeding", sub: "bottle · right side" },
  }[status];
  return (
    <GlassCard dark={dark} hero padding="22px 20px">
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: dark ? "#B0BEC9" : "#A89A90",
          marginBottom: 8,
        }}
      >
        RIGHT NOW
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontWeight: 700,
          fontSize: 32,
          lineHeight: 1.1,
          color: dark ? "#F0F2F5" : "#4A3B35",
          marginBottom: 4,
        }}
      >
        {babyName} is {statusCopy.label}.
      </div>
      <div
        style={{
          fontSize: 14,
          color: dark ? "#B0BEC9" : "#7A6B6B",
          marginBottom: 16,
          fontStyle: "italic",
        }}
      >
        {statusCopy.sub}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: dark ? "#B0BEC9" : "#A89A90",
              marginBottom: 2,
            }}
          >
            Last feed
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontWeight: 700,
              fontSize: 22,
              color: "#C07088",
              lineHeight: 1,
            }}
          >
            {lastFeed}
          </div>
        </div>
        <div style={{ width: 1, background: dark ? "rgba(255,190,90,0.25)" : "rgba(192,112,136,0.2)" }} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: dark ? "#B0BEC9" : "#A89A90",
              marginBottom: 2,
            }}
          >
            Next nap
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontWeight: 700,
              fontSize: 22,
              color: dark ? "#e0b86a" : "#6FA898",
              lineHeight: 1,
            }}
          >
            {nextNap}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

window.HeroCard = HeroCard;
