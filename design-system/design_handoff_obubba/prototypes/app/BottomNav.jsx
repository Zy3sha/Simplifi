// Fixed bottom tab bar — Today / Insights / Growth / Account.
function BottomNav({ tab, onChange, dark = false }) {
  const tabs = [
    { id: "today", icon: "🏠", label: "Today" },
    { id: "insights", icon: "📊", label: "Insights" },
    { id: "growth", icon: "🌱", label: "Growth" },
    { id: "account", icon: "👤", label: "Account" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "10px 14px 28px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: dark ? "rgba(8,14,28,0.72)" : "rgba(255,252,248,0.88)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderTop: `1px solid ${dark ? "rgba(255,190,90,0.16)" : "rgba(255,255,255,0.48)"}`,
        boxShadow: dark
          ? "0 -2px 20px rgba(0,0,0,0.35)"
          : "0 -4px 24px rgba(245,218,210,0.18)",
      }}
    >
      {tabs.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            onClick={() => onChange && onChange(t.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "4px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: active ? 1 : 0.55,
              color: dark ? "#F0F2F5" : "#5B4F4F",
            }}
          >
            <span style={{ fontSize: 22, filter: active ? "none" : "grayscale(0.3)" }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 600 }}>{t.label}</span>
            {active && (
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 99,
                  background: "#C07088",
                  marginTop: 1,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

window.BottomNav = BottomNav;
