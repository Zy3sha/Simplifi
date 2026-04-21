// Gold celebration ring that wraps a stat — thin circular gradient border with soft glow.
function GoldRing({ children, size = 120, thickness = 2, intensity = 1 }) {
  return (
    <div style={{
      position: "relative",
      width: size,
      height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* outer gradient ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "conic-gradient(from 180deg at 50% 50%, #D4A855, #F3D98A, #E0B86A, #D4A855, #B8892B, #D4A855)",
        padding: thickness,
        WebkitMask: "radial-gradient(circle, transparent calc(50% - " + thickness + "px - 1px), #000 calc(50% - " + thickness + "px))",
        mask: "radial-gradient(circle, transparent calc(50% - " + thickness + "px - 1px), #000 calc(50% - " + thickness + "px))",
        filter: `drop-shadow(0 0 ${6*intensity}px rgba(212,168,85,0.55)) drop-shadow(0 0 ${16*intensity}px rgba(212,168,85,0.25))`,
      }} />
      {/* inner highlight pips */}
      <div style={{
        position: "absolute", inset: 3, borderRadius: "50%",
        background: "radial-gradient(circle at 30% 20%, rgba(255,240,190,0.25), transparent 40%), radial-gradient(circle at 70% 80%, rgba(180,137,43,0.15), transparent 40%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}

window.GoldRing = GoldRing;
