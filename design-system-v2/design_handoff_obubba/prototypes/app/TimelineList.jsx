// Timeline log list — rows of activity with emoji icons.
function TimelineList({ entries, dark = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map((e, i) => (
        <div
          key={i}
          data-entry-id={i}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 12px",
            borderRadius: 14,
            background: dark ? "rgba(18,30,52,0.55)" : "rgba(255,255,255,0.50)",
            border: dark ? "1.5px solid rgba(255,190,90,0.22)" : "1.5px solid rgba(255,225,235,0.4)",
            boxShadow: dark
              ? "-4px -4px 6px -5px rgba(255,170,60,0.35),4px 4px 6px -5px rgba(255,150,40,0.25)"
              : "-4px -4px 6px -5px rgba(217,168,192,0.42),4px 4px 6px -5px rgba(192,160,220,0.32)",
            color: dark ? "#F0F2F5" : "#4A3B35",
            overflow: "hidden",
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>{e.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{e.title}</div>
            {e.sub && (
              <div style={{ fontSize: 11, color: dark ? "#B0BEC9" : "#7A6B6B", marginTop: 1 }}>{e.sub}</div>
            )}
          </div>
          <div
            style={{
              fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
              fontSize: 11,
              color: dark ? "#e0b86a" : "#7A5C52",
              flexShrink: 0,
            }}
          >
            {e.time}
          </div>
        </div>
      ))}
    </div>
  );
}

window.TimelineList = TimelineList;
