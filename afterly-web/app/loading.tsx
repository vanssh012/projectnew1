export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 24, color: "#C9A050", animation: "pulse 1.5s ease infinite" }}>✦</div>
        <div style={{ width: 120, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, transparent, #C9A050, transparent)", animation: "shimmer 1.2s ease infinite" }} />
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes shimmer { 0% { transform: translateX(-180%); } 100% { transform: translateX(220%); } }
      `}</style>
    </div>
  );
}
