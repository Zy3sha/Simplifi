// Account screen — baby profile + carer QR + settings.
function AccountScreen({ dark = false }) {
  return (
    <div style={{ padding: "18px 16px 120px", display: "flex", flexDirection: "column", gap: 14, height: "100%", overflowY: "auto" }}>
      <GlassCard dark={dark} hero>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 68, height: 68, borderRadius: 99, overflow: "hidden", background: "#F0D0C8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "2px solid rgba(255,255,255,0.7)" }}>
            👶
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 22, color: dark ? "#F0F2F5" : "#4A3B35", lineHeight: 1.1 }}>Oliver</div>
            <div style={{ fontSize: 13, color: dark ? "#B0BEC9" : "#7A6B6B" }}>6 months · born 20 Oct 2025</div>
            <div style={{ fontSize: 12, color: "#C07088", marginTop: 2, fontWeight: 600 }}>He/him · 7.8kg · 67cm</div>
          </div>
        </div>
      </GlassCard>

      {[
        { icon: "📱", title: "Care portal QR", sub: "Let sitters log without the app", accent: "#7AABC4" },
        { icon: "⚠️", title: "Allergies & meds", sub: "1 allergy · 0 medications", accent: "#C94030" },
        { icon: "📞", title: "Emergency contacts", sub: "Dad · Gran · GP", accent: "#D4A855" },
        { icon: "📖", title: "Guides & checklists", sub: "NHS · WHO · your own", accent: "#6FA898" },
        { icon: "⚙️", title: "Settings", sub: "Theme · units · data", accent: dark ? "#B0BEC9" : "#A89A90" },
      ].map((row, i) => (
        <button
          key={i}
          style={{
            padding: "14px 16px",
            borderRadius: 16,
            background: dark ? "rgba(18,30,52,0.55)" : "rgba(255,255,255,0.55)",
            border: dark ? "1.5px solid rgba(255,190,90,0.22)" : "1.5px solid rgba(255,225,235,0.5)",
            boxShadow: dark
              ? "-4px -4px 5px -5px rgba(255,170,60,0.38),4px 4px 5px -5px rgba(255,150,40,0.28)"
              : "-4px -4px 5px -5px rgba(217,168,192,0.42),4px 4px 5px -5px rgba(192,160,220,0.32)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            textAlign: "left",
            color: dark ? "#F0F2F5" : "#4A3B35",
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `${row.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {row.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{row.title}</div>
            <div style={{ fontSize: 12, color: dark ? "#B0BEC9" : "#7A6B6B", marginTop: 1 }}>{row.sub}</div>
          </div>
          <span style={{ fontSize: 20, color: dark ? "#B0BEC9" : "#A89898" }}>›</span>
        </button>
      ))}

      <div style={{ textAlign: "center", fontSize: 11, color: dark ? "#B0BEC9" : "#A89A90", marginTop: 6, fontStyle: "italic" }}>
        No ads. No selling your data. 💛
      </div>
    </div>
  );
}

window.AccountScreen = AccountScreen;
