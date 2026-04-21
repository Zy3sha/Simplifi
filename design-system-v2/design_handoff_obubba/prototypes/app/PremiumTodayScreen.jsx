// Premium Today screen — personal greeting + hero with gold ring + premium cards
function PremiumTodayScreen({ dark, tweaks, onLog, babyName="Oliver" }) {
  const accent = {
    rose: {main:"#C07088", sec:"#A85A44", glow:"rgba(217,168,192,0.45)"},
    gold: {main:"#D4A855", sec:"#B8892B", glow:"rgba(224,184,106,0.45)"},
    lilac: {main:"#9C7FBF", sec:"#7A5FA0", glow:"rgba(156,127,191,0.40)"},
  }[tweaks.accent];

  const hour = new Date().getHours();
  const greetWord = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Bedtime hours";
  const parentName = "Amelia";

  const pad = tweaks.density === "compact" ? 11 : tweaks.density === "airy" ? 18 : 14;
  const gap = tweaks.density === "compact" ? 10 : tweaks.density === "airy" ? 18 : 14;

  const entries = [
    { icon: "🍼", title: "Bottle · 120ml", sub: "Formula · happy baby", time: "2:15pm" },
    { icon: "😴", title: "Nap · 1h 12m", sub: "Settled in 4 min", time: "12:30pm" },
    { icon: "💩", title: "Nappy · dirty", sub: "Normal, tidy", time: "11:58am" },
    { icon: "🍼", title: "Breast · 18 min", sub: "Left side", time: "10:42am" },
  ];

  // Mascot sizing per tweak
  const mascotSize = tweaks.mascot === "subtle" ? 44 : tweaks.mascot === "prominent" ? 88 : 64;
  const mascotOpacity = tweaks.mascot === "subtle" ? 0.6 : 1;

  // Animation toggle
  const animClass = tweaks.anim === "still" ? "" : tweaks.anim === "lively" ? "ob-breathe-lively" : "ob-breathe-calm";

  const [celebrateKey, setCelebrateKey] = React.useState(0);

  return (
    <div style={{ padding: `14px ${pad}px 120px`, display: "flex", flexDirection: "column", gap, height: "100%", overflowY: "auto" }}>
      {/* Personal greeting strip */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"2px 4px"}}>
        <div className={animClass} style={{
          position:"relative",width:mascotSize,height:mascotSize,flexShrink:0,opacity:mascotOpacity,
          filter: dark ? "drop-shadow(0 4px 12px rgba(255,180,70,0.35))" : "drop-shadow(0 4px 14px rgba(217,168,192,0.45))",
        }}>
          <img src="../../assets/obubba-happy.png" alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{
            fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,fontSize:20,lineHeight:1.1,
            color:dark?"#F3D98A":accent.main,marginBottom:2,
          }}>{greetWord}, {parentName}</div>
          <div style={{
            fontSize:13,color:dark?"#B0BEC9":"#7A6B6B",lineHeight:1.35,fontStyle:"italic",
          }}>
            {babyName} slept <b style={{fontStyle:"normal",color:dark?"#F0F2F5":"#4A3B35"}}>11h 45m</b> last night — a personal best.
          </div>
        </div>
      </div>

      {/* Premium hero with gold trim */}
      <PremiumCard dark={dark} tier="hero" gold padding="22px 22px 20px">
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:dark?"#D4A855":"#B8892B",marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:5,height:5,borderRadius:99,background:"#C07088",boxShadow:"0 0 8px #C07088",animation: tweaks.anim!=="still" ? "obPulse 1.8s ease-in-out infinite":"none"}}/>
              RIGHT NOW
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:28,lineHeight:1.1,color:dark?"#F0F2F5":"#4A3B35"}}>
              {babyName} is <span style={{fontStyle:"italic",color:accent.main}}>awake</span>.
            </div>
            <div style={{fontSize:13,color:dark?"#B0BEC9":"#7A6B6B",fontStyle:"italic",marginTop:4}}>
              wake window 1.5–2h · watching for cues
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:10,marginTop:4,alignItems:"stretch"}}>
          <div style={{flex:1,padding:"10px 12px",borderRadius:14,background:dark?"rgba(14,22,42,0.35)":"rgba(255,252,248,0.45)",border:`1px solid ${dark?"rgba(255,200,120,0.18)":"rgba(255,255,255,0.6)"}`}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:dark?"#B0BEC9":"#A89A90",marginBottom:2}}>Last feed</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20,color:accent.main,lineHeight:1}}>2<span style={{fontSize:13}}>h</span> 14<span style={{fontSize:13}}>m</span></div>
            <div style={{fontSize:10,color:dark?"#B0BEC9":"#A89A90",marginTop:2}}>120ml formula</div>
          </div>
          <div style={{flex:1,padding:"10px 12px",borderRadius:14,background:dark?"rgba(14,22,42,0.35)":"rgba(255,252,248,0.45)",border:`1px solid ${dark?"rgba(255,200,120,0.18)":"rgba(255,255,255,0.6)"}`}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:dark?"#B0BEC9":"#A89A90",marginBottom:2}}>Next nap</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20,color:dark?"#F3D98A":"#6FA898",lineHeight:1}}>~18<span style={{fontSize:13}}>m</span></div>
            <div style={{fontSize:10,color:dark?"#B0BEC9":"#A89A90",marginTop:2}}>sleepy by 3:33pm</div>
          </div>
          <div style={{flex:0.8,padding:"10px 12px",borderRadius:14,background:dark?"rgba(14,22,42,0.35)":"rgba(255,252,248,0.45)",border:`1px solid ${dark?"rgba(255,200,120,0.18)":"rgba(255,255,255,0.6)"}`}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:dark?"#B0BEC9":"#A89A90",marginBottom:2}}>Mood</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:18,color:dark?"#F0F2F5":"#4A3B35",lineHeight:1}}>Sunny</div>
            <div style={{fontSize:10,color:dark?"#B0BEC9":"#A89A90",marginTop:2}}>5th hour awake</div>
          </div>
        </div>
      </PremiumCard>

      {/* Premium quick actions with relief shadows */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
        {[
          {id:"feed",icon:"🍼",label:"Feed"},
          {id:"sleep",icon:"😴",label:"Sleep"},
          {id:"nappy",icon:"💩",label:"Nappy"},
          {id:"note",icon:"📋",label:"Note"},
        ].map(a=>(
          <button key={a.id} onClick={()=>{onLog(a.id); setCelebrateKey(k=>k+1);}} style={{
            position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:5,padding:"14px 4px",borderRadius:18,minHeight:78,
            border:dark?"1px solid rgba(255,200,120,0.28)":"1px solid rgba(255,255,255,0.75)",
            background:dark
              ?"linear-gradient(180deg,rgba(26,38,62,0.70),rgba(14,22,42,0.80))"
              :"linear-gradient(180deg,rgba(255,255,255,0.70),rgba(255,248,242,0.50))",
            boxShadow:dark
              ?"0 1px 0 rgba(255,210,140,0.16) inset,0 -1px 0 rgba(0,0,0,0.4) inset,0 0 16px rgba(255,180,70,0.14),0 6px 14px rgba(0,0,0,0.30),0 14px 28px rgba(0,0,0,0.18)"
              :"0 1.5px 0 rgba(255,255,255,0.95) inset,0 0 20px rgba(255,255,255,0.55),0 6px 16px rgba(200,150,130,0.16),0 14px 32px rgba(180,130,110,0.10)",
            cursor:"pointer",color:dark?"#F0F2F5":"#5B4F4F",
            transition:"transform 120ms ease",
          }} onMouseDown={e=>e.currentTarget.style.transform="translateY(1px) scale(0.98)"} onMouseUp={e=>e.currentTarget.style.transform=""} onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <span style={{fontSize:24,filter:"drop-shadow(0 1px 1px rgba(91,79,79,0.15))"}}>{a.icon}</span>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.02em"}}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Today's card of note — editorial treatment */}
      <PremiumCard dark={dark} tier="card" padding="16px 18px">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,fontSize:17,color:accent.main,lineHeight:1.1}}>Today's note</div>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${dark?"rgba(212,168,85,0.5)":"rgba(212,168,85,0.6)"},transparent)`}}/>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",color:dark?"#D4A855":"#B8892B",textTransform:"uppercase"}}>from obubba</span>
        </div>
        <div style={{fontSize:13.5,lineHeight:1.55,color:dark?"#E8ECF0":"#5B4F4F",fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>
          "The 4-to-3 nap transition is coming soon — last nap is already drifting 15 min later. No rush; let {babyName} lead."
        </div>
      </PremiumCard>

      {/* Allergy banner — premium version */}
      <div style={{
        position:"relative",padding:"11px 14px",borderRadius:14,
        background:"linear-gradient(135deg,#C94030 0%,#A82820 100%)",
        color:"#fff",display:"flex",alignItems:"center",gap:10,
        boxShadow:"0 0 0 1px rgba(255,180,140,0.3) inset,0 2px 6px rgba(201,64,48,0.4),0 8px 20px rgba(201,64,48,0.25)",
      }}>
        <span style={{fontSize:18}}>⚠️</span>
        <div style={{flex:1}}>
          <div style={{fontSize:9.5,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",opacity:0.92}}>ALLERGY · DAIRY</div>
          <div style={{fontSize:12,fontWeight:600,marginTop:1}}>Even a trace. Check every label.</div>
        </div>
        <span style={{fontSize:14,opacity:0.7}}>›</span>
      </div>

      {/* Timeline */}
      <div>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:8,padding:"0 4px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,fontSize:17,color:dark?"#F3D98A":"#5B4F4F",lineHeight:1.1}}>Timeline</div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:dark?"#B0BEC9":"#A89A90",textTransform:"uppercase"}}>Tue · 4 entries</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {entries.map((e,i)=>(
            <PremiumCard key={i} dark={dark} tier="inset" padding="11px 13px" radius={14}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <span style={{fontSize:20,flexShrink:0}}>{e.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,color:dark?"#F0F2F5":"#4A3B35"}}>{e.title}</div>
                  <div style={{fontSize:11,color:dark?"#B0BEC9":"#7A6B6B",marginTop:1}}>{e.sub}</div>
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:13,color:dark?"#D4A855":"#B8892B",fontWeight:600}}>{e.time}</div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>

      <Confetti trigger={celebrateKey} />
    </div>
  );
}

window.PremiumTodayScreen = PremiumTodayScreen;
