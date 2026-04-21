// Bottom sheet that slides up — used for all logging forms.
function LogSheet({ type = "feed", onClose, onSave, dark = false }) {
  const [amount, setAmount] = React.useState(120);
  const [side, setSide] = React.useState("right");
  const copy = {
    feed: { title: "Log a feed", emoji: "🍼", sub: "Bottle · right now" },
    sleep: { title: "Starting a sleep", emoji: "😴", sub: "I'll stop the timer when baby wakes." },
    nappy: { title: "Nappy change", emoji: "💩", sub: "Quick tap, done." },
    note: { title: "Add a note", emoji: "📋", sub: "For anyone caring for baby today." },
  }[type];

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: dark ? "rgba(0,0,0,0.60)" : "rgba(91,79,79,0.35)",
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          borderRadius: "28px 28px 0 0",
          padding: "14px 22px 32px",
          background: dark ? "rgba(14,22,42,0.94)" : "rgba(255,252,250,0.95)",
          backdropFilter: "blur(30px) saturate(1.6)",
          WebkitBackdropFilter: "blur(30px) saturate(1.6)",
          boxShadow: dark
            ? "0 -8px 40px rgba(0,0,0,0.40),inset 0 1px 0 rgba(255,200,120,0.16)"
            : "0 -8px 40px rgba(246,221,227,0.25),inset 0 1px 0 rgba(255,255,255,0.70)",
          color: dark ? "#F0F2F5" : "#5B4F4F",
          animation: "slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 99,
            background: dark ? "rgba(255,190,90,0.3)" : "rgba(91,79,79,0.25)",
            margin: "0 auto 14px",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>{copy.emoji}</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 22 }}>
              {copy.title}
            </div>
            <div style={{ fontSize: 12, color: dark ? "#B0BEC9" : "#7A6B6B", fontStyle: "italic" }}>
              {copy.sub}
            </div>
          </div>
        </div>

        {type === "feed" && (
          <>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#B0BEC9" : "#A89898", marginBottom: 6 }}>AMOUNT</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
                <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontWeight: 700, fontSize: 54, color: "#C07088", lineHeight: 1 }}>{amount}</span>
                <span style={{ fontSize: 18, color: dark ? "#B0BEC9" : "#A89A90" }}>ml</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[30, 60, 90, 120, 150, 180].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 10,
                      border: v === amount ? "1.5px solid #C07088" : dark ? "1.5px solid rgba(255,190,90,0.25)" : "1.5px solid rgba(255,225,235,0.5)",
                      background: v === amount ? "rgba(245,218,210,0.48)" : dark ? "rgba(24,38,62,0.6)" : "rgba(255,255,255,0.55)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: dark ? "#F0F2F5" : "#5B4F4F",
                      cursor: "pointer",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {type === "nappy" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            {["💧 Wet", "💩 Dirty", "💩💧 Both"].map((l) => (
              <button key={l} style={{ flex: 1, padding: "16px 4px", borderRadius: 14, border: dark ? "1.5px solid rgba(255,190,90,0.25)" : "1.5px solid rgba(255,225,235,0.55)", background: dark ? "rgba(24,38,62,0.6)" : "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: 700, color: dark ? "#F0F2F5" : "#5B4F4F", cursor: "pointer" }}>{l}</button>
            ))}
          </div>
        )}

        {type === "sleep" && (
          <div style={{ marginTop: 18, textAlign: "center", padding: "22px 0" }}>
            <div style={{ fontFamily: "ui-monospace,Menlo,monospace", fontWeight: 700, fontSize: 48, color: dark ? "#e0b86a" : "#6FA898" }}>00:00</div>
            <div style={{ fontSize: 12, color: dark ? "#B0BEC9" : "#7A6B6B", marginTop: 4 }}>Timer will start when you tap "Start sleep".</div>
          </div>
        )}

        {type === "note" && (
          <div style={{ marginTop: 14 }}>
            <textarea placeholder="e.g. seemed extra clingy this morning — cutting a tooth?" style={{ width: "100%", minHeight: 90, padding: "12px 14px", borderRadius: 14, border: dark ? "1.5px solid rgba(255,190,90,0.25)" : "1.5px solid rgba(255,225,235,0.55)", background: dark ? "rgba(24,38,62,0.6)" : "rgba(255,253,248,0.6)", color: dark ? "#F0F2F5" : "#5B4F4F", fontFamily: "inherit", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 99,
              border: dark ? "1.5px solid rgba(255,190,90,0.25)" : "1.5px solid rgba(255,225,235,0.55)",
              background: dark ? "rgba(24,38,62,0.6)" : "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontWeight: 700,
              color: dark ? "#F0F2F5" : "#5B4F4F",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave && onSave(type)}
            style={{
              flex: 2,
              padding: "14px 0",
              borderRadius: 99,
              border: "none",
              background: "linear-gradient(135deg,#C07088,#A85A44)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "-6px -6px 8px -5px rgba(217,168,192,0.45),6px 6px 8px -5px rgba(192,160,220,0.35)",
            }}
          >
            {type === "sleep" ? "Start sleep 😴" : "Save ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

window.LogSheet = LogSheet;
