// Premium Growth — milestone track w/ gold markers, percentile bars
function PremiumGrowthScreen({ dark, tweaks, babyName="Oliver" }) {
  const accent = { rose:"#C07088", gold:"#D4A855", lilac:"#9C7FBF" }[tweaks.accent];
  const pad = tweaks.density==="compact"?11:tweaks.density==="airy"?18:14;
  const gap = tweaks.density==="compact"?10:tweaks.density==="airy"?18:14;

  const milestones = [
    { emoji: "😄", title: "First real giggle", date: "3 weeks ago", hit: true },
    { emoji: "🤲", title: "Reached for a toy", date: "2 weeks ago", hit: true },
    { emoji: "🎉", title: "Rolled over both ways", date: "5 days ago", hit: true, isNew:true },
    { emoji: "🦷", title: "First tooth", date: "Coming up", hit: false },
    { emoji: "🍼", title: "Starts solids", date: "In 2 weeks", hit: false },
  ];

  const Percentile = ({ label, value, unit, p }) => (
    <div>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:dark?"#B0BEC9":"#A89A90"}}>{label}</div>
        <div style={{fontSize:11,color:dark?"#B0BEC9":"#A89A90",fontStyle:"italic"}}>{p}th %ile</div>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:30,color:accent,lineHeight:1}}>
        {value}<span style={{fontSize:14,color:dark?"#B0BEC9":"#A89A90",marginLeft:4}}>{unit}</span>
      </div>
      <div style={{marginTop:10,position:"relative",height:6,borderRadius:99,background:dark?"rgba(255,255,255,0.08)":"rgba(91,79,79,0.08)",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,width:`${p}%`,background:`linear-gradient(90deg,${accent},#D4A855)`,borderRadius:99,boxShadow:`0 0 8px ${accent}55`}}/>
        {/* percentile ticks */}
        {[25,50,75].map(t=>(
          <div key={t} style={{position:"absolute",top:-1,left:`${t}%`,width:1,height:8,background:dark?"rgba(255,255,255,0.18)":"rgba(91,79,79,0.18)"}}/>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding:`18px ${pad}px 120px`, display:"flex", flexDirection:"column", gap, height:"100%", overflowY:"auto" }}>
      <div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:dark?"#D4A855":"#B8892B",marginBottom:4}}>Growth</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:30,lineHeight:1,color:dark?"#F0F2F5":"#4A3B35"}}>
          {babyName}, at <span style={{fontStyle:"italic",color:accent}}>6 months</span>
        </div>
      </div>

      <PremiumCard dark={dark} tier="hero" gold padding="22px 22px 18px">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
          <Percentile label="Weight" value="7.8" unit="kg" p={50}/>
          <Percentile label="Height" value="67" unit="cm" p={65}/>
        </div>
        <div style={{marginTop:14,paddingTop:12,borderTop:`1px dashed ${dark?"rgba(212,168,85,0.35)":"rgba(212,168,85,0.45)"}`,fontSize:12,lineHeight:1.5,color:dark?"#E8ECF0":"#5B4F4F",fontStyle:"italic"}}>
          Tracking the WHO curves — steady, proportionate, a lovely line.
        </div>
      </PremiumCard>

      {/* Milestone track */}
      <PremiumCard dark={dark} tier="card" padding="18px 20px 14px">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,fontSize:18,color:dark?"#F3D98A":"#5B4F4F",lineHeight:1.1}}>Milestones</div>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${dark?"rgba(212,168,85,0.5)":"rgba(212,168,85,0.6)"},transparent)`}}/>
        </div>

        <div style={{position:"relative",paddingLeft:22}}>
          {/* vertical track */}
          <div style={{position:"absolute",left:13,top:14,bottom:14,width:2,background:`linear-gradient(180deg,${dark?"rgba(212,168,85,0.5)":"rgba(212,168,85,0.5)"} 0%,${dark?"rgba(212,168,85,0.5)":"rgba(212,168,85,0.5)"} 60%,${dark?"rgba(255,190,90,0.2)":"rgba(192,112,136,0.2)"} 60%,${dark?"rgba(255,190,90,0.2)":"rgba(192,112,136,0.2)"} 100%)`}}/>

          {milestones.map((m,i)=>(
            <div key={i} style={{position:"relative",display:"flex",alignItems:"center",gap:12,padding:"8px 0",opacity:m.hit?1:0.58}}>
              {/* marker */}
              <div style={{
                position:"absolute",left:-22,width:26,height:26,borderRadius:99,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                background: m.hit
                  ? (m.isNew
                    ? "conic-gradient(from 180deg at 50% 50%,#D4A855,#F3D98A,#E0B86A,#D4A855,#B8892B,#D4A855)"
                    : `linear-gradient(135deg,${accent},${accent}AA)`)
                  : dark?"rgba(24,38,62,0.8)":"rgba(255,252,248,0.9)",
                border: m.hit ? "none" : `1.5px dashed ${dark?"rgba(255,190,90,0.4)":"rgba(192,112,136,0.4)"}`,
                boxShadow: m.hit
                  ? (m.isNew
                    ? "0 0 0 2px rgba(212,168,85,0.25),0 0 12px rgba(212,168,85,0.5),0 0 22px rgba(212,168,85,0.25)"
                    : `0 0 0 2px ${dark?"rgba(14,22,42,1)":"rgba(255,252,248,1)"},0 2px 6px ${accent}55`)
                  : "none",
                animation: (m.isNew && tweaks.anim!=="still") ? "obGoldPulse 2.4s ease-in-out infinite" : "none",
              }}>
                <span style={{fontSize:m.hit?14:12,filter:m.hit?"drop-shadow(0 1px 0 rgba(255,255,255,0.4))":"none"}}>{m.emoji}</span>
              </div>
              <div style={{flex:1,paddingLeft:20}}>
                <div style={{fontSize:14,fontWeight:700,color:dark?"#F0F2F5":"#4A3B35",display:"flex",alignItems:"center",gap:8}}>
                  {m.title}
                  {m.isNew && <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",padding:"2px 7px",borderRadius:99,background:"linear-gradient(135deg,#D4A855,#B8892B)",color:"#fff",boxShadow:"0 1px 3px rgba(184,137,43,0.4)"}}>NEW</span>}
                </div>
                <div style={{fontSize:11,color:dark?"#B0BEC9":"#7A6B6B",fontStyle:"italic",marginTop:1}}>{m.date}</div>
              </div>
              {m.hit && <span style={{fontSize:14,color:dark?"#F3D98A":"#B8892B",fontWeight:700}}>✓</span>}
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}

window.PremiumGrowthScreen = PremiumGrowthScreen;
