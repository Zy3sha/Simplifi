// Glass card surface — the signature OBubba container.
function GlassCard({ children, dark = false, hero = false, style, padding = "16px 18px" }) {
  const base = dark
    ? {
        background: "rgba(18,30,52,0.50)",
        border: "1.5px solid rgba(255,190,90,0.25)",
        boxShadow:
          "0 0 20px rgba(255,180,70,0.16),inset 0 1.5px 0 rgba(255,200,120,0.20),0 6px 18px rgba(0,0,0,0.32)",
      }
    : {
        background: "rgba(255,255,255,0.45)",
        border: "1.5px solid rgba(255,255,255,0.55)",
        boxShadow:
          "0 0 24px rgba(255,255,255,0.65),0 0 48px rgba(245,218,210,0.32),0 8px 24px rgba(200,150,130,0.12),inset 0 1.5px 0 rgba(255,255,255,0.85)",
      };
  const heroBg = hero
    ? dark
      ? "radial-gradient(ellipse 140% 90% at 50% 0%,rgba(255,180,70,0.18),transparent 55%),radial-gradient(ellipse 80% 60% at 100% 100%,rgba(255,200,120,0.12),transparent 60%),rgba(18,30,52,0.50)"
      : "radial-gradient(ellipse 140% 90% at 50% 0%,rgba(245,218,210,0.55),transparent 55%),radial-gradient(ellipse 80% 60% at 100% 100%,rgba(246,221,227,0.40),transparent 60%),rgba(255,255,255,0.45)"
    : base.background;
  return (
    <div
      style={{
        position: "relative",
        borderRadius: hero ? 24 : 22,
        padding,
        overflow: "hidden",
        isolation: "isolate",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        ...base,
        background: heroBg,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "48%",
          pointerEvents: "none",
          background: dark
            ? "linear-gradient(180deg,rgba(255,200,120,0.10) 0%,transparent 100%)"
            : "linear-gradient(180deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.05) 40%,transparent 100%)",
          borderRadius: "22px 22px 0 0",
          mixBlendMode: "overlay",
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}

window.GlassCard = GlassCard;
