// App header — "OBUBBA" wordmark + baby name chip + theme toggle.
function AppHeader({ babyName = "Oliver", dark = false, onToggleTheme }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "14px 18px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${dark ? "rgba(255,190,90,0.16)" : "rgba(255,255,255,0.5)"}`,
        background: dark ? "rgba(8,14,28,0.30)" : "rgba(255,252,250,0.30)",
        backdropFilter: "blur(16px) saturate(1.5)",
        WebkitBackdropFilter: "blur(16px) saturate(1.5)",
        boxShadow: dark
          ? "0 4px 20px rgba(0,0,0,0.30)"
          : "0 4px 20px rgba(246,221,227,0.25)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "5px 12px 5px 5px",
          borderRadius: 99,
          background: dark ? "rgba(24,38,62,0.6)" : "rgba(255,255,255,0.5)",
          border: `1px solid ${dark ? "rgba(255,190,90,0.25)" : "rgba(255,225,235,0.6)"}`,
        }}
      >
        <img
          src="../../assets/icon-192.png"
          alt=""
          style={{ width: 26, height: 26, borderRadius: 99 }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display',serif",
            fontWeight: 700,
            fontSize: 14,
            color: dark ? "#F0F2F5" : "#5B4F4F",
          }}
        >
          {babyName}
        </span>
        <span style={{ fontSize: 10, color: dark ? "#B0BEC9" : "#A89898" }}>6 mo</span>
      </div>
      <div
        style={{
          fontFamily: "'Parisienne',cursive",
          fontWeight: 400,
          fontSize: 30,
          letterSpacing: "0",
          color: dark ? "#F0F2F5" : "#5B4F4F",
          lineHeight: 1,
        }}
      >
        OBubba
      </div>
      <button
        onClick={onToggleTheme}
        style={{
          width: 36,
          height: 36,
          borderRadius: 99,
          border: `1.5px solid ${dark ? "rgba(255,190,90,0.35)" : "rgba(255,225,235,0.6)"}`,
          background: dark ? "rgba(24,38,62,0.6)" : "rgba(255,255,255,0.55)",
          fontSize: 16,
          cursor: "pointer",
          boxShadow: dark
            ? "-4px -4px 5px -4px rgba(255,170,60,0.35),4px 4px 5px -4px rgba(255,150,40,0.25)"
            : "-4px -4px 5px -4px rgba(217,168,192,0.40),4px 4px 5px -4px rgba(192,160,220,0.30)",
        }}
        aria-label="Toggle theme"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

window.AppHeader = AppHeader;
