// The floating Tweaks panel for the premium UI kit.
function TweaksPanel({ tweaks, setTweaks, visible, onClose }) {
  if (!visible) return null;
  const Row = ({ label, children }) => (
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#7A6B6B"}}>{label}</div>
      {children}
    </div>
  );
  const Seg = ({ value, options, onChange }) => (
    <div style={{display:"flex",gap:4,padding:3,borderRadius:99,background:"rgba(255,252,248,0.65)",border:"1px solid rgba(255,225,235,0.5)"}}>
      {options.map(o => (
        <button key={o.v} onClick={()=>onChange(o.v)} style={{
          flex:1,padding:"7px 10px",borderRadius:99,border:"none",cursor:"pointer",
          fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",
          background: value===o.v ? "linear-gradient(135deg,#D4A855,#B8892B)" : "transparent",
          color: value===o.v ? "#fff" : "#5B4F4F",
          boxShadow: value===o.v ? "0 2px 6px rgba(184,137,43,0.3)" : "none",
        }}>{o.l}</button>
      ))}
    </div>
  );
  return (
    <div style={{
      position:"fixed",right:20,bottom:20,zIndex:100,
      width:280,padding:"18px 18px 14px",borderRadius:22,
      background:"rgba(255,252,248,0.92)",
      backdropFilter:"blur(24px) saturate(1.6)",
      WebkitBackdropFilter:"blur(24px) saturate(1.6)",
      border:"1px solid rgba(212,168,85,0.35)",
      boxShadow:"0 0 0 1px rgba(212,168,85,0.25),0 20px 48px rgba(180,130,110,0.22),0 40px 96px rgba(180,130,110,0.12),0 2px 0 rgba(255,255,255,0.95) inset",
      fontFamily:"'DM Sans',sans-serif",color:"#5B4F4F",
    }}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,fontSize:19,lineHeight:1.1,color:"#5B4F4F"}}>Tweaks</div>
        <button onClick={onClose} style={{border:"none",background:"rgba(212,168,85,0.12)",width:26,height:26,borderRadius:99,cursor:"pointer",color:"#5B4F4F",fontSize:14}}>×</button>
      </div>
      <Row label="Density">
        <Seg value={tweaks.density} options={[{v:"compact",l:"Compact"},{v:"cozy",l:"Cozy"},{v:"airy",l:"Airy"}]} onChange={(v)=>setTweaks({...tweaks,density:v})}/>
      </Row>
      <Row label="Corner radius">
        <Seg value={tweaks.radius} options={[{v:"sharp",l:"Sharp"},{v:"soft",l:"Soft"},{v:"pillowy",l:"Pillow"}]} onChange={(v)=>setTweaks({...tweaks,radius:v})}/>
      </Row>
      <Row label="Accent hue">
        <Seg value={tweaks.accent} options={[{v:"rose",l:"Rose"},{v:"gold",l:"Gold"},{v:"lilac",l:"Lilac"}]} onChange={(v)=>setTweaks({...tweaks,accent:v})}/>
      </Row>
      <Row label="Mascot presence">
        <Seg value={tweaks.mascot} options={[{v:"subtle",l:"Subtle"},{v:"balanced",l:"Balanced"},{v:"prominent",l:"Star"}]} onChange={(v)=>setTweaks({...tweaks,mascot:v})}/>
      </Row>
      <Row label="Animation level">
        <Seg value={tweaks.anim} options={[{v:"still",l:"Still"},{v:"calm",l:"Calm"},{v:"lively",l:"Lively"}]} onChange={(v)=>setTweaks({...tweaks,anim:v})}/>
      </Row>
      <div style={{fontSize:10,color:"#A89898",fontStyle:"italic",textAlign:"center",marginTop:6}}>
        Live — affects the phone to the left.
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
