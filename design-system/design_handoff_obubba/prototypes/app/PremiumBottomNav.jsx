// Premium bottom nav — tactile rounded bar with gold active state
function PremiumBottomNav({ tab, onChange, dark, tweaks }) {
  const accent = { rose:"#C07088", gold:"#D4A855", lilac:"#9C7FBF" }[tweaks.accent];
  const tabs = [
    { id:"today", icon:"🏠", label:"Today" },
    { id:"insights", icon:"📊", label:"Insights" },
    { id:"growth", icon:"🌱", label:"Growth" },
    { id:"account", icon:"👤", label:"Account" },
  ];
  return (
    <div style={{
      position:"absolute",left:10,right:10,bottom:14,padding:"8px 6px 8px",
      display:"flex",justifyContent:"space-around",alignItems:"center",
      borderRadius:26,
      background: dark ? "rgba(10,16,32,0.80)" : "rgba(255,252,248,0.82)",
      backdropFilter:"blur(24px) saturate(1.8)",
      WebkitBackdropFilter:"blur(24px) saturate(1.8)",
      border:`1px solid ${dark?"rgba(255,200,120,0.22)":"rgba(255,255,255,0.85)"}`,
      boxShadow: dark
        ? "0 0 0 1px rgba(212,168,85,0.15),0 1px 0 rgba(255,210,140,0.14) inset,0 12px 30px rgba(0,0,0,0.45),0 24px 54px rgba(0,0,0,0.28)"
        : "0 0 0 1px rgba(212,168,85,0.15),0 1.5px 0 rgba(255,255,255,0.95) inset,0 12px 28px rgba(200,150,130,0.18),0 26px 54px rgba(180,130,110,0.12)",
    }}>
      {tabs.map(t=>{
        const active = t.id===tab;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            padding:"6px 0 4px",background:"none",border:"none",cursor:"pointer",
            color:dark?"#F0F2F5":"#5B4F4F",position:"relative",
          }}>
            {active && (
              <div style={{
                position:"absolute",inset:"0 8px",borderRadius:14,
                background: dark
                  ? `linear-gradient(180deg,rgba(212,168,85,0.25),rgba(212,168,85,0.08))`
                  : `linear-gradient(180deg,rgba(212,168,85,0.22),rgba(212,168,85,0.06))`,
                boxShadow: `0 0 0 1px ${dark?"rgba(212,168,85,0.35)":"rgba(212,168,85,0.4)"}, 0 4px 10px ${dark?"rgba(212,168,85,0.18)":"rgba(212,168,85,0.22)"}`,
                zIndex:0,
              }}/>
            )}
            <span style={{fontSize:20,filter:active?"none":"grayscale(0.3)",opacity:active?1:0.55,position:"relative",zIndex:1}}>{t.icon}</span>
            <span style={{fontSize:9.5,fontWeight:active?700:600,letterSpacing:"0.04em",opacity:active?1:0.55,position:"relative",zIndex:1,color:active?(dark?"#F3D98A":"#8A6420"):undefined}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

window.PremiumBottomNav = PremiumBottomNav;
