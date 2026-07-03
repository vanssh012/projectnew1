import Link from "next/link";

function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 3L28 28H22L19.5 22H12.5L10 28H4L16 3Z"
        fill="#C9A050"
        fillOpacity="0.9"
      />
      <path d="M16 10L20 22H12L16 10Z" fill="#0E0E10" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 52,
        padding: "0 24px",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LogoIcon size={24} />
        <span style={{ fontSize: 16, fontWeight: 500, color: "#FFF" }}>
          afterly
        </span>
      </Link>

      {/* Center (Desktop only) */}
      <div
        className="nav-center"
        style={{
          display: "flex",
          gap: 32,
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Link
          href="/farewell"
          className="nav-link"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
        >
          Farewell
        </Link>
        <Link
          href="/freshers"
          className="nav-link"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
        >
          Freshers
        </Link>
        <Link
          href="/house-party"
          className="nav-link"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
        >
          House Party
        </Link>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          href="/host"
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            transition: "color 0.2s",
          }}
          className="nav-link-host"
        >
          host →
        </Link>
        <Link href="/signin" className="btn-pill">
          sign in
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-center { display: none !important; }
        }
        .nav-link:hover, .nav-link-host:hover {
          color: #FFF !important;
        }
        /* Underline from left effect */
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: #FFF;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}
