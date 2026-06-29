import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#000",
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        padding: "60px 24px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 48,
        }}
      >
        {/* Left */}
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#C9A050",
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            afterly
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            your people. your night.
          </div>
        </div>

        {/* Right Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 40,
            flex: 1,
            maxWidth: 600,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="label" style={{ marginBottom: 8 }}>Product</div>
            <Link href="/farewell" className="footer-link">Farewell</Link>
            <Link href="/freshers" className="footer-link">Freshers</Link>
            <Link href="/house-party" className="footer-link">House Party</Link>
            <Link href="/explore" className="footer-link">Explore</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="label" style={{ marginBottom: 8 }}>Hosts</div>
            <Link href="/host" className="footer-link">Host an Event</Link>
            <Link href="#" className="footer-link">Pricing</Link>
            <Link href="#" className="footer-link">Dashboard</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="label" style={{ marginBottom: 8 }}>Company</div>
            <Link href="#" className="footer-link">About</Link>
            <Link href="#" className="footer-link">Safety</Link>
            <Link href="#" className="footer-link">Blog</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="label" style={{ marginBottom: 8 }}>Legal</div>
            <Link href="#" className="footer-link">Terms</Link>
            <Link href="#" className="footer-link">Privacy</Link>
            <Link href="#" className="footer-link">Cookies</Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          maxWidth: 1200,
          margin: "60px auto 0",
          borderTop: "0.5px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 12,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <div>© 2025 Afterly</div>
        <div>made for college india</div>
      </div>

      <style>{`
        .footer-link {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #FFF;
        }
      `}</style>
    </footer>
  );
}
