// 4-up action grid — big emoji tiles.
function QuickActions({ dark = false, onAction }) {
  const actions = [
    { id: "feed", icon: "🍼", label: "Feed" },
    { id: "sleep", icon: "😴", label: "Sleep" },
    { id: "nappy", icon: "💩", label: "Nappy" },
    { id: "note", icon: "📋", label: "Note" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => onAction && onAction(a.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "14px 6px",
            borderRadius: 14,
            minHeight: 76,
            border: dark ? "1.5px solid rgba(255,190,90,0.25)" : "1.5px solid rgba(255,225,235,0.55)",
            background: dark ? "rgba(18,30,52,0.55)" : "rgba(255,255,255,0.55)",
            boxShadow: dark
              ? "-5px -5px 6px -5px rgba(255,170,60,0.40),5px 5px 6px -5px rgba(255,150,40,0.30)"
              : "-5px -5px 6px -5px rgba(217,168,192,0.45),5px 5px 6px -5px rgba(192,160,220,0.35)",
            cursor: "pointer",
            color: dark ? "#F0F2F5" : "#5B4F4F",
          }}
        >
          <span style={{ fontSize: 24 }}>{a.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

window.QuickActions = QuickActions;
