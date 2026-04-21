// Premium header — Parisienne wordmark + baby chip with gold edge
function PremiumAppHeader({ babyName="Oliver", dark, tweaks, onToggleTheme }) {
  return (
    <div style={{
      position:"relative",padding:"12px 16px 10px",
      display:"flex",alignItems:"center",justifyContent:"space-between",
      background: dark ? "rgba(8,14,28,0.35)" : "rgba(255,252,250,0.38)",
      backdropFilter:"blur(18px) saturate(1.6)",
      WebkitBackdropFilter:"blur(18px) saturate(1.6)",
      borderBottom:`1px solid ${dark?"rgba(212,168,85,0.25)":"rgba(212,168,85,0.28)"}`,
      zIndex:10,
    }}>
      <div style={{
        display:"flex",alignItems:"center",gap:8,padding:"4px 10px 4px 4px",
        borderRadius:99,
        background: dark ? "rgba(22,34,56,0.7)" : "rgba(255,255,255,0.65)",
        border:`1px solid ${dark?"rgba(212,168,85,0.35)":"rgba(212,168,85,0.30)"}`,
        boxShadow: dark
          ? "0 0 0 1px rgba(212,168,85,0.18) inset,0 2px 6px rgba(0,0,0,0.3)"
          : "0 0 0 1px rgba(255,255,255,0.85) inset,0 2px 6px rgba(200,150,130,0.12)",
      }}>
        <div style={{
          width:24,height:24,borderRadius:99,overflow:"hidden",
          background:"linear-gradient(135deg,#F5E1D8,#E6C4B8)",
          boxShadow:"0 0 0 1.5px #D4A855, 0 1px 3px rgba(184,137,43,0.35)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
        }}>👶</div>
        <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:13,color:dark?"#F0F2F5":"#5B4F4F"}}>{babyName}</span>
        <span style={{fontSize:9.5,color:dark?"#D4A855":"#B8892B",fontWeight:700,letterSpacing:"0.08em"}}>6 MO</span>
      </div>

      <div style={{fontFamily:"'Parisienne',cursive",fontWeight:400,fontSize:30,lineHeight:1,color:dark?"#F3D98A":"#5B4F4F",textShadow:dark?"0 2px 12px rgba(255,200,120,0.25)":"0 1px 0 rgba(255,255,255,0.8)"}}>
        OBubba
      </div>

      <button onClick={onToggleTheme} style={{
        width:34,height:34,borderRadius:99,cursor:"pointer",
        border:`1px solid ${dark?"rgba(212,168,85,0.35)":"rgba(212,168,85,0.3)"}`,
        background: dark ? "rgba(22,34,56,0.7)" : "rgba(255,255,255,0.65)",
        fontSize:14,
        boxShadow: dark
          ? "0 0 0 1px rgba(212,168,85,0.18) inset,0 2px 6px rgba(0,0,0,0.3)"
          : "0 0 0 1px rgba(255,255,255,0.85) inset,0 2px 6px rgba(200,150,130,0.12)",
      }}>{dark?"☀️":"🌙"}</button>
    </div>
  );
}

window.PremiumAppHeader = PremiumAppHeader;
