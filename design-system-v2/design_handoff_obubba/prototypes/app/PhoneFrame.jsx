// Mobile frame that wraps an OBubba app screen.
// 390×844 iPhone-ish proportions, with the watercolour body background baked in.
function PhoneFrame({ children, dark = false }) {
  const bg = dark
    ? {
        background:
          "radial-gradient(ellipse 65% 55% at 20% 20%,rgba(255,160,60,0.09),transparent 65%)," +
          "radial-gradient(ellipse 50% 45% at 75% 60%,rgba(255,140,40,0.06),transparent 60%)," +
          "linear-gradient(170deg,#080e1c 0%,#0c1628 30%,#101d35 55%,#0c1628 100%)",
      }
    : {
        background:
          "radial-gradient(ellipse 65% 55% at 15% 10%,rgba(245,218,210,0.35),transparent 70%)," +
          "radial-gradient(ellipse 50% 45% at 80% 15%,rgba(240,210,200,0.28),transparent 65%)," +
          "radial-gradient(ellipse 70% 50% at 55% 45%,rgba(255,248,242,0.45),transparent 60%)," +
          "radial-gradient(ellipse 55% 60% at 25% 70%,rgba(238,215,208,0.25),transparent 65%)," +
          "radial-gradient(ellipse 60% 45% at 75% 65%,rgba(240,208,200,0.28),transparent 60%)," +
          "linear-gradient(135deg,#FFF8F2 0%,#F5E1D8 40%,#F0DDD6 100%)",
      };
  return (
    <div
      style={{
        width: 390,
        height: 844,
        borderRadius: 44,
        overflow: "hidden",
        position: "relative",
        fontFamily: "'DM Sans',system-ui,sans-serif",
        color: dark ? "#F0F2F5" : "#5B4F4F",
        boxShadow:
          "0 24px 60px rgba(60,40,30,0.22), 0 8px 24px rgba(60,40,30,0.12), inset 0 0 0 8px #1a1a1a, inset 0 0 0 9px rgba(255,255,255,0.08)",
        ...bg,
      }}
    >
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 110,
          height: 32,
          borderRadius: 20,
          background: "#000",
          zIndex: 100,
        }}
      />
      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: "0 28px",
          fontSize: 15,
          fontWeight: 600,
          color: dark ? "#F0F2F5" : "#5B4F4F",
          zIndex: 101,
        }}
      >
        <span>9:41</span>
        <span style={{ letterSpacing: "2px" }}>●●●● 􀙇 􀛨</span>
      </div>
      <div style={{ position: "absolute", inset: 0, paddingTop: 54 }}>{children}</div>
    </div>
  );
}

window.PhoneFrame = PhoneFrame;
