// Premium glass card — thicker materials, deeper shadow, optional gold edge.
// Use tier="hero" for the signature surface, tier="card" for standard, tier="inset" for sub-surfaces.
function PremiumCard({ children, dark = false, tier = "card", gold = false, padding = "18px 20px", style, radius }) {
  const r = radius ?? (tier === "hero" ? 26 : tier === "inset" ? 16 : 20);
  const goldEdge = gold
    ? dark
      ? "0 0 0 1px rgba(212,168,85,0.55), 0 0 0 2px rgba(224,184,106,0.22)"
      : "0 0 0 1px rgba(212,168,85,0.40), 0 0 0 2px rgba(224,184,106,0.18)"
    : "0 0 0 0 transparent";

  const shadows = {
    hero: dark
      ? `${goldEdge}, 0 1px 0 rgba(255,210,140,0.28) inset, 0 -1px 0 rgba(0,0,0,0.4) inset, 0 0 32px rgba(255,180,70,0.18), 0 12px 28px rgba(0,0,0,0.42), 0 28px 56px rgba(0,0,0,0.28)`
      : `${goldEdge}, 0 1.5px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(200,150,130,0.08) inset, 0 0 40px rgba(255,255,255,0.8), 0 0 64px rgba(245,218,210,0.42), 0 14px 36px rgba(200,150,130,0.22), 0 30px 72px rgba(180,130,110,0.14)`,
    card: dark
      ? `${goldEdge}, 0 1px 0 rgba(255,210,140,0.20) inset, 0 0 20px rgba(255,180,70,0.14), 0 8px 20px rgba(0,0,0,0.36), 0 18px 40px rgba(0,0,0,0.22)`
      : `${goldEdge}, 0 1.5px 0 rgba(255,255,255,0.9) inset, 0 0 24px rgba(255,255,255,0.55), 0 0 48px rgba(245,218,210,0.30), 0 8px 22px rgba(200,150,130,0.16), 0 18px 44px rgba(180,130,110,0.10)`,
    inset: dark
      ? `0 1px 0 rgba(255,210,140,0.14) inset, 0 2px 8px rgba(0,0,0,0.28), 0 8px 18px rgba(0,0,0,0.18)`
      : `0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(200,150,130,0.08), 0 8px 18px rgba(200,150,130,0.08)`,
  }[tier];

  const bg = dark
    ? tier === "hero"
      ? "radial-gradient(ellipse 160% 100% at 50% -20%,rgba(255,180,70,0.22),transparent 60%),radial-gradient(ellipse 90% 60% at 100% 110%,rgba(255,200,120,0.14),transparent 60%),linear-gradient(180deg,rgba(26,38,62,0.70),rgba(14,22,42,0.80))"
      : "linear-gradient(180deg,rgba(22,34,56,0.64),rgba(14,22,42,0.72))"
    : tier === "hero"
    ? "radial-gradient(ellipse 160% 100% at 50% -20%,rgba(250,230,220,0.70),transparent 60%),radial-gradient(ellipse 90% 60% at 100% 110%,rgba(246,221,227,0.50),transparent 60%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(255,252,248,0.55))"
    : "linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,252,248,0.48))";

  const borderColor = dark
    ? gold ? "rgba(224,184,106,0.45)" : "rgba(255,200,120,0.22)"
    : gold ? "rgba(212,168,85,0.55)" : "rgba(255,255,255,0.72)";

  return (
    <div
      style={{
        position: "relative",
        borderRadius: r,
        padding,
        overflow: "hidden",
        isolation: "isolate",
        background: bg,
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(22px) saturate(1.7)",
        WebkitBackdropFilter: "blur(22px) saturate(1.7)",
        boxShadow: shadows,
        ...style,
      }}
    >
      {/* specular highlight — top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "55%",
        pointerEvents: "none",
        background: dark
          ? "linear-gradient(180deg,rgba(255,210,140,0.14) 0%,rgba(255,200,120,0.03) 45%,transparent 100%)"
          : "linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.12) 45%,transparent 100%)",
        borderTopLeftRadius: r, borderTopRightRadius: r,
        mixBlendMode: "overlay",
      }} />
      {/* bottom shimmer line */}
      <div style={{
        position: "absolute", bottom: 0, left: "8%", right: "8%", height: 1,
        pointerEvents: "none",
        background: dark
          ? "linear-gradient(90deg,transparent,rgba(255,200,120,0.35),transparent)"
          : "linear-gradient(90deg,transparent,rgba(212,168,85,0.35),transparent)",
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}

window.PremiumCard = PremiumCard;
