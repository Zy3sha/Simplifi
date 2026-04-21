// Premium Insights with gold-ring hero stat + editorial typography
function PremiumInsightsScreen({ dark, tweaks, babyName="Oliver" }) {
  const accent = {
    rose:  {main:"#C07088"},
    gold:  {main:"#D4A855"},
    lilac: {main:"#9C7FBF"},
  }[tweaks.accent];
  const pad = tweaks.density==="compact"?11:tweaks.density==="airy"?18:14;
  const gap = tweaks.density==="compact"?10:tweaks.density==="airy"?18:14;

  const stats = [
    { label:"FEEDS", value:"6", unit:"today", color:accent.main },
    { label:"NAPPIES", value:"5", unit:"today", color:"#7AABC4" },
    { label:"AWAKE", value:"1h 24m", unit:"this stretch", color:"#D4A855" },
  ];

  return (
    <div style={{ padding:`18px ${pad}px 120px`, display:"flex", flexDirection:"column", gap, height:"100%", overflowY:"auto" }}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:dark?"#D4A855":"#B8892B",marginBottom:4}}>Insights · Tuesday</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:30,lineHeight:1,color:dark?"#F0F2F5":"#4A3B35"}}>
            The <span style={{fontStyle:"italic",color:accent.main}}>shape</span> of today
          </div>
        </div>
      </div>

      {/* Gold-ring hero stat */}
      <PremiumCard dark={dark} tier="hero" gold padding="22px 20px 18px">
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <GoldRing size={118} thickness={2} intensity={tweaks.anim==="still"?0.6:1}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:38,lineHeight:0.95,color:dark?"#F3D98A":"#B8892B"}}>12<span style={{fontSize:18}}>h</span></div>
              <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:dark?"#F3D98A":"#B8892B"}}>20<span style={{fontSize:10}}>m</span></div>
            </div>
          </GoldRing>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:dark?"#B0BEC9":"#A89A90",marginBottom:4}}>Sleep · last 24h</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:22,lineHeight:1.15,color:dark?"#F0F2F5":"#4A3B35"}}>
              A <span style={{fontStyle:"italic"}}>personal best</span>.
            </div>
            <div style={{fontSize:12,color:dark?"#B0BEC9":"#7A6B6B",marginTop:4,lineHeight:1.45}}>
              42 min above the 7-day average, mostly banked overnight.
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Stat trio */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {stats.map(s=>(
          <PremiumCard key={s.label} dark={dark} tier="inset" padding="12px 10px" radius={16}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:dark?"#B0BEC9":"#A89A90",textTransform:"uppercase"}}>{s.label}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:24,color:s.color,lineHeight:1.1,margin:"3px 0 2px"}}>{s.value}</div>
              <div style={{fontSize:10,color:dark?"#B0BEC9":"#7A6B6B",fontStyle:"italic"}}>{s.unit}</div>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Sleep consultant card */}
      <PremiumCard dark={dark} tier="card" padding="16px 18px">
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
          <div className={tweaks.anim==="still"?"":"ob-breathe-calm"} style={{flexShrink:0,filter:dark?"drop-shadow(0 2px 8px rgba(255,180,70,0.30))":"drop-shadow(0 2px 8px rgba(217,168,192,0.4))"}}>
            <img src="../../assets/obubba-thinking.png" alt="" style={{width:54,height:54}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:9.5,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:dark?"#D4A855":"#B8892B"}}>What I'm noticing</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,lineHeight:1.2,color:dark?"#F0F2F5":"#4A3B35",marginTop:2}}>A longer-than-usual awake window.</div>
          </div>
        </div>
        <div style={{fontSize:13,lineHeight:1.55,color:dark?"#E8ECF0":"#5B4F4F"}}>
          {babyName}'s been up <b>1h 24m</b>. His last 5 days he's settled best after 1h 40m. If you see eye-rubbing or hand-fussing, that's your window.
        </div>
        <div style={{marginTop:12,paddingTop:10,borderTop:`1px dashed ${dark?"rgba(212,168,85,0.35)":"rgba(212,168,85,0.45)"}`,fontSize:12,fontStyle:"italic",color:accent.main,fontWeight:600}}>
          Always follow sleepy cues over the clock.
        </div>
      </PremiumCard>

      {/* Feed intervals */}
      <PremiumCard dark={dark} tier="card" padding="14px 18px">
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,fontSize:17,color:dark?"#F3D98A":"#5B4F4F",lineHeight:1.1}}>Feed intervals</div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",color:dark?"#B0BEC9":"#A89A90",textTransform:"uppercase"}}>Today</div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
          {[2.5, 3.2, 2.8, 3.5, 2.9, 3.1].map((h,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{
                width:"100%",height:`${(h/4)*100}%`,borderRadius:"8px 8px 3px 3px",
                background:`linear-gradient(180deg,${accent.main} 0%,${accent.main}44 100%)`,
                boxShadow:`0 0 0 1px ${accent.main}33 inset, 0 1px 0 rgba(255,255,255,0.5) inset`,
                position:"relative",
              }}>
                <div style={{position:"absolute",top:2,left:"25%",right:"25%",height:2,borderRadius:99,background:"rgba(255,255,255,0.5)"}}/>
              </div>
              <div style={{fontSize:9,color:dark?"#B0BEC9":"#A89A90",fontFamily:"ui-monospace,Menlo,monospace"}}>{h}h</div>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}

window.PremiumInsightsScreen = PremiumInsightsScreen;
