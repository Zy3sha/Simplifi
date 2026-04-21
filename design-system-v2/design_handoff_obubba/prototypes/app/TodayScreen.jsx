// Today screen — composition of hero + quick actions + timeline.
function TodayScreen({ dark = false, onLog }) {
  const entries = [
    { icon: "🍼", title: "Bottle · 120ml", sub: "Formula", time: "2:15pm" },
    { icon: "😴", title: "Nap · 1h 12m", sub: "Settled in 4 min", time: "12:30pm" },
    { icon: "💩", title: "Nappy · dirty", sub: "Normal", time: "11:58am" },
    { icon: "🍼", title: "Breast · 18 min", sub: "Left side", time: "10:42am" },
    { icon: "☀️", title: "Morning wake", sub: "11h 45m total sleep", time: "7:15am" },
  ];
  return (
    <div style={{ padding: "14px 16px 110px", display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      <HeroCard dark={dark} status="awake" lastFeed="2h 14m ago" nextNap="in ~18 min" />
      <QuickActions dark={dark} onAction={onLog} />

      {/* Allergy banner */}
      <div style={{ padding: "10px 14px", background: "#C94030", color: "#fff", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 12px rgba(192,64,64,0.3)" }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.9 }}>ALLERGY</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Dairy. Even a trace. Check every label.</div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89A90" }}>TODAY'S TIMELINE</div>
          <div style={{ fontSize: 11, color: dark ? "#B0BEC9" : "#A89A90" }}>5 entries</div>
        </div>
        <TimelineList entries={entries} dark={dark} />
      </div>
    </div>
  );
}

window.TodayScreen = TodayScreen;
