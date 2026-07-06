export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          fontSize: "clamp(120px, 20vw, 240px)",
          fontWeight: 700,
          color: "rgba(255,255,255,0.03)",
          letterSpacing: -8,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        404
      </div>

      <div
        style={{
          fontSize: 24,
          color: "#C9A050",
          fontWeight: 500,
          marginBottom: 32,
          letterSpacing: -0.5,
        }}
      >
        ✦ afterly
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 500,
          color: "#fff",
          letterSpacing: -1.5,
          marginBottom: 12,
          lineHeight: 1.1,
        }}
      >
        this page doesn&apos;t exist.
      </h1>

      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 40,
          lineHeight: 1.6,
        }}
      >
        the night you&apos;re looking for isn&apos;t here.
      </p>

      <a
        href="/"
        style={{
          background: "#fff",
          color: "#000",
          borderRadius: 12,
          padding: "14px 28px",
          fontSize: 15,
          fontWeight: 500,
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
      >
        go home →
      </a>
    </div>
  );
}
