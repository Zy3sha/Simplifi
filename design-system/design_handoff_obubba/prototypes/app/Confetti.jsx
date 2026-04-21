// Lightweight emoji confetti burst. Call <Confetti trigger={someKey} /> to fire on change.
function Confetti({ trigger, pieces = 24 }) {
  const [key, setKey] = React.useState(0);
  const firstRun = React.useRef(true);
  React.useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setKey(k => k + 1);
  }, [trigger]);
  if (key === 0) return null;
  const bits = Array.from({length: pieces}, (_, i) => {
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.3;
    const dist = 70 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 20;
    const emoji = ["✨","💛","🌸","⭐","🪷"][i % 5];
    const delay = Math.random() * 120;
    const rot = (Math.random() - 0.5) * 540;
    return (
      <span key={i} style={{
        position: "absolute",
        left: "50%", top: "50%",
        fontSize: 14 + Math.random() * 10,
        transform: "translate(-50%,-50%)",
        animation: `obConfetti-${key} ${900 + Math.random()*400}ms ${delay}ms cubic-bezier(0.22,1,0.36,1) both`,
        ["--dx"]: dx+"px", ["--dy"]: dy+"px", ["--rot"]: rot+"deg",
        pointerEvents: "none",
      }}>{emoji}</span>
    );
  });
  return (
    <div key={key} style={{position:"absolute", inset:0, pointerEvents:"none", zIndex:30, overflow:"visible"}}>
      <style>{`@keyframes obConfetti-${key}{
        0%{transform:translate(-50%,-50%) scale(0.4) rotate(0deg);opacity:0}
        15%{opacity:1}
        100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1) rotate(var(--rot));opacity:0}
      }`}</style>
      {bits}
    </div>
  );
}

window.Confetti = Confetti;
